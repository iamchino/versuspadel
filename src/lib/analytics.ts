import type { WcProduct } from "./api";

type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };
type AnalyticsProperties = Record<string, JsonValue>;
type MetaPixelFunction = ((...args: unknown[]) => void) & {
  callMethod?: (...args: unknown[]) => void;
  loaded?: boolean;
  push?: MetaPixelFunction;
  queue?: unknown[][];
  version?: string;
};

declare global {
  interface Window {
    fbq?: MetaPixelFunction;
    _fbq?: MetaPixelFunction;
  }
}

const META_PIXEL_ID = (import.meta.env.VITE_META_PIXEL_ID || "").trim();
const ANALYTICS_ENDPOINT = import.meta.env.VITE_ANALYTICS_ENDPOINT || "/backend/track.php";
const VISITOR_KEY = "versus_analytics_visitor_id";
const SESSION_KEY = "versus_analytics_session_id";

let metaPixelInitialized = false;

function isBrowser() {
  return typeof window !== "undefined" && typeof document !== "undefined";
}

function createId(prefix: string) {
  const randomPart =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : Math.random().toString(36).slice(2);
  return `${prefix}_${randomPart}`;
}

function readStorage(storage: Storage, key: string) {
  try {
    return storage.getItem(key);
  } catch {
    return null;
  }
}

function writeStorage(storage: Storage, key: string, value: string) {
  try {
    storage.setItem(key, value);
  } catch {
    // Tracking should never interrupt the storefront.
  }
}

function getVisitorId() {
  if (!isBrowser()) return createId("visitor");

  const existing = readStorage(window.localStorage, VISITOR_KEY);
  if (existing) return existing;

  const visitorId = createId("visitor");
  writeStorage(window.localStorage, VISITOR_KEY, visitorId);
  return visitorId;
}

function getSessionId() {
  if (!isBrowser()) return createId("session");

  const existing = readStorage(window.sessionStorage, SESSION_KEY);
  if (existing) return existing;

  const sessionId = createId("session");
  writeStorage(window.sessionStorage, SESSION_KEY, sessionId);
  return sessionId;
}

function initMetaPixel() {
  if (!isBrowser() || !META_PIXEL_ID || metaPixelInitialized) return;

  if (!window.fbq) {
    const fbq: MetaPixelFunction = (...args: unknown[]) => {
      if (fbq.callMethod) {
        fbq.callMethod(...args);
        return;
      }
      fbq.queue?.push(args);
    };

    fbq.push = fbq;
    fbq.loaded = true;
    fbq.version = "2.0";
    fbq.queue = [];

    window.fbq = fbq;
    window._fbq = fbq;

    const script = document.createElement("script");
    script.async = true;
    script.src = "https://connect.facebook.net/en_US/fbevents.js";

    const firstScript = document.getElementsByTagName("script")[0];
    firstScript?.parentNode?.insertBefore(script, firstScript);
  }

  window.fbq("init", META_PIXEL_ID);
  metaPixelInitialized = true;
}

function sendInternalEvent(event: string, properties: AnalyticsProperties, eventId: string) {
  if (!isBrowser()) return;

  const payload = {
    event,
    event_id: eventId,
    visitor_id: getVisitorId(),
    session_id: getSessionId(),
    path: `${window.location.pathname}${window.location.search}`,
    title: document.title,
    referrer: document.referrer,
    properties,
    client_ts: new Date().toISOString(),
  };

  const body = JSON.stringify(payload);

  if ("sendBeacon" in navigator) {
    const blob = new Blob([body], { type: "application/json" });
    if (navigator.sendBeacon(ANALYTICS_ENDPOINT, blob)) return;
  }

  fetch(ANALYTICS_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
    keepalive: true,
  }).catch(() => {
    // Ignore analytics failures.
  });
}

function sendMetaEvent(
  eventName: string,
  properties: AnalyticsProperties = {},
  eventId?: string,
  custom = false,
) {
  initMetaPixel();
  if (!isBrowser() || !META_PIXEL_ID || !window.fbq) return;

  const options = eventId ? { eventID: eventId } : undefined;
  window.fbq(custom ? "trackCustom" : "track", eventName, properties, options);
}

export function trackEvent(
  event: string,
  properties: AnalyticsProperties = {},
  meta?: { eventName: string; properties?: AnalyticsProperties; custom?: boolean },
) {
  const eventId = createId(event);
  sendInternalEvent(event, properties, eventId);

  if (meta) {
    sendMetaEvent(meta.eventName, meta.properties ?? properties, eventId, meta.custom);
  }
}

export function trackPageView(path?: string) {
  const pagePath = path ?? (isBrowser() ? `${window.location.pathname}${window.location.search}` : "/");
  trackEvent(
    "page_view",
    { path: pagePath },
    {
      eventName: "PageView",
      properties: { page_path: pagePath },
    },
  );
}

function priceValue(product: WcProduct) {
  const raw = parseFloat(product.prices?.price || "0");
  const minorUnit = product.prices?.currency_minor_unit ?? 0;
  const divided = minorUnit > 0 ? raw / Math.pow(10, minorUnit) : raw;
  return divided < 10 && raw >= 100 ? raw : divided;
}

function productProperties(product: WcProduct): AnalyticsProperties {
  return {
    product_id: product.id,
    product_name: product.name,
    product_categories: product.categories.map((category) => category.name),
    currency: product.prices?.currency_code || "ARS",
    value: priceValue(product),
  };
}

function metaProductProperties(product: WcProduct): AnalyticsProperties {
  const base = productProperties(product);
  return {
    content_ids: [String(product.id)],
    content_name: product.name,
    content_type: "product",
    currency: base.currency,
    value: base.value,
  };
}

export function trackProductView(product: WcProduct) {
  trackEvent(
    "product_view",
    productProperties(product),
    {
      eventName: "ViewContent",
      properties: metaProductProperties(product),
    },
  );
}

export function trackAddToCart(product: WcProduct, destination: "cart" | "checkout" = "cart") {
  const properties = { ...productProperties(product), destination };

  trackEvent(
    "add_to_cart",
    properties,
    {
      eventName: "AddToCart",
      properties: metaProductProperties(product),
    },
  );

  if (destination === "cart") {
    trackEvent("cart_view", properties, {
      eventName: "CartView",
      properties: metaProductProperties(product),
      custom: true,
    });
  }
}

export function trackCheckoutStart(product: WcProduct) {
  const properties = { ...productProperties(product), destination: "checkout" };

  trackEvent(
    "checkout_start",
    properties,
    {
      eventName: "InitiateCheckout",
      properties: metaProductProperties(product),
    },
  );
}

export function trackLead(source: string, properties: AnalyticsProperties = {}) {
  trackEvent(
    "lead",
    { source, ...properties },
    {
      eventName: "Lead",
      properties: { source, ...properties },
    },
  );
}
