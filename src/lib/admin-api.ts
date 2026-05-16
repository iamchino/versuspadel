/**
 * src/lib/admin-api.ts — Frontend API helpers for the Admin panel
 *
 * All calls go through /backend/*.php (PHP backend on DonWeb/Ferozo).
 * The auth token is stored in sessionStorage after login.
 * No WooCommerce credentials ever touch the browser.
 *
 * ── DEMO MODE ──
 * When running locally (import.meta.env.DEV) and the API is unreachable,
 * use the password "demo" to bypass the server and load sample products.
 * This lets you preview the full UI without any backend running.
 */

// ── Types ──────────────────────────────────────────────

export interface AdminProduct {
  id: number;
  name: string;
  description: string;
  short_description: string;
  regular_price: string;
  price: string;
  featured: boolean;
  stock_status: 'instock' | 'outofstock' | 'onbackorder';
  stock_quantity: number | null;
  manage_stock: boolean;
  categories: { id: number; name: string; slug: string }[];
  images: { id: number; src: string; name: string; alt: string }[];
  status: string;
}

export interface AdminCategory {
  id: number;
  name: string;
  slug: string;
  count: number;
}

export interface ProductFormData {
  name: string;
  description: string;
  short_description: string;
  regular_price: string;
  featured: boolean;
  stock_status: 'instock' | 'outofstock' | 'onbackorder';
  manage_stock: boolean;
  stock_quantity: number | null;
  categories: { id: number }[];
  images: { id: number; src: string }[];
}

// ── Auth ───────────────────────────────────────────────

const TOKEN_KEY = 'versus_admin_token';
const DEMO_TOKEN = 'demo_mode_token';

/** Returns true when running in Vite dev mode without a real API */
export function isDemoMode(): boolean {
  return getToken() === DEMO_TOKEN;
}

export function getToken(): string | null {
  return sessionStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  sessionStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  sessionStorage.removeItem(TOKEN_KEY);
}

export function isAuthenticated(): boolean {
  return !!getToken();
}

function authHeaders(): Record<string, string> {
  const token = getToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

// ── Demo data (used when WooCommerce is not connected) ─

export const DEMO_PRODUCTS: AdminProduct[] = [
  {
    id: 1,
    name: 'VERSUS Pro Carbon 3K',
    description: 'Paleta profesional de carbono 3K. Control y potencia extremos para el jugador exigente.',
    short_description: 'Carbono 3K de alta performance',
    regular_price: '89000',
    price: '89000',
    status: 'publish',
    featured: true,
    stock_status: 'instock',
    stock_quantity: null,
    manage_stock: false,
    categories: [{ id: 1, name: 'Paletas', slug: 'paletas' }],
    images: [{ id: 1, src: 'https://placehold.co/400x400/1a1a1a/d4a017?text=PRO+CARBON', name: 'pro-carbon', alt: 'VERSUS Pro Carbon 3K' }],
  },
  {
    id: 2,
    name: 'VERSUS Elite Diamond',
    description: 'La elección de los profesionales. Núcleo de EVA Foam con cara de fibra de vidrio.',
    short_description: 'Elite de fibra de vidrio',
    regular_price: '65000',
    price: '65000',
    status: 'publish',
    featured: false,
    stock_status: 'instock',
    stock_quantity: null,
    manage_stock: false,
    categories: [{ id: 1, name: 'Paletas', slug: 'paletas' }],
    images: [{ id: 2, src: 'https://placehold.co/400x400/1a1a1a/d4a017?text=ELITE+DIAMOND', name: 'elite-diamond', alt: 'VERSUS Elite Diamond' }],
  },
  {
    id: 3,
    name: 'Grip VERSUS Comfort',
    description: 'Grip antideslizante de alta absorción. Compatible con todas las paletas.',
    short_description: 'Grip premium antideslizante',
    regular_price: '4500',
    price: '4500',
    status: 'publish',
    featured: false,
    stock_status: 'instock',
    stock_quantity: null,
    manage_stock: false,
    categories: [{ id: 2, name: 'Accesorios', slug: 'accesorios' }],
    images: [{ id: 3, src: 'https://placehold.co/400x400/1a1a1a/d4a017?text=GRIP', name: 'grip', alt: 'Grip VERSUS Comfort' }],
  },
  {
    id: 4,
    name: 'Bolso VERSUS Team Bag',
    description: 'Bolso deportivo con compartimentos para paletas, accesorios y ropa. Tela técnica impermeable.',
    short_description: 'Bolso deportivo profesional',
    regular_price: '28000',
    price: '28000',
    status: 'draft',
    featured: false,
    stock_status: 'instock',
    stock_quantity: null,
    manage_stock: false,
    categories: [{ id: 2, name: 'Accesorios', slug: 'accesorios' }],
    images: [{ id: 4, src: 'https://placehold.co/400x400/1a1a1a/d4a017?text=BOLSO', name: 'bolso', alt: 'Bolso VERSUS Team Bag' }],
  },
];

export const DEMO_CATEGORIES: AdminCategory[] = [
  { id: 1, name: 'Paletas', slug: 'paletas', count: 2 },
  { id: 2, name: 'Accesorios', slug: 'accesorios', count: 2 },
  { id: 3, name: 'Ropa', slug: 'ropa', count: 0 },
];

// ── Login ──────────────────────────────────────────────

export async function login(password: string): Promise<{ token: string }> {
  // DEMO MODE: accept "demo" password locally without hitting the API
  if (import.meta.env.DEV && password === 'demo') {
    setToken(DEMO_TOKEN);
    return { token: DEMO_TOKEN };
  }

  const res = await fetch('/backend/auth.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Login failed');
  }
  const data = await res.json();
  setToken(data.token);
  return data;
}

// ── Products ───────────────────────────────────────────

export async function fetchAdminProducts(): Promise<AdminProduct[]> {
  if (isDemoMode()) return Promise.resolve([...DEMO_PRODUCTS]);

  const res = await fetch('/backend/products.php', { headers: authHeaders() });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Failed to fetch products');
  }
  return res.json();
}

export async function createProduct(product: ProductFormData): Promise<AdminProduct> {
  const res = await fetch('/backend/products.php', {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(product),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Failed to create product');
  }
  return res.json();
}

export async function updateProduct(id: number, product: Partial<ProductFormData>): Promise<AdminProduct> {
  const res = await fetch(`/backend/products.php?id=${id}`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify(product),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Failed to update product');
  }
  return res.json();
}

export async function deleteProduct(id: number): Promise<void> {
  const res = await fetch(`/backend/products.php?id=${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Failed to delete product');
  }
}

// ── Categories ─────────────────────────────────────────

export async function fetchCategories(): Promise<AdminCategory[]> {
  if (isDemoMode()) return Promise.resolve([...DEMO_CATEGORIES]);

  const res = await fetch('/backend/categories.php', { headers: authHeaders() });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Failed to fetch categories');
  }
  return res.json();
}

// ── Image Upload ───────────────────────────────────────

export async function uploadImage(file: File): Promise<{ id: number; src: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const base64 = (reader.result as string).split(',')[1];
        const res = await fetch('/backend/upload-image.php', {
          method: 'POST',
          headers: authHeaders(),
          body: JSON.stringify({
            filename: file.name,
            data: base64,
            mimeType: file.type,
          }),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || 'Failed to upload image');
        }
        resolve(await res.json());
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

// ── Analytics ──────────────────────────────────────────

export interface RecentOrder {
  id: number;
  status: string;
  total: string;
  currency: string;
  date: string;
  customer: string;
  items: string[];
}

export interface TopSeller {
  name: string;
  product_id: number;
  quantity: number;
}

export interface SiteAnalytics {
  period_days: number;
  total_events: number;
  page_views: number;
  today_page_views: number;
  unique_visitors: number;
  today_visitors: number;
  sessions: number;
  product_views: number;
  add_to_cart: number;
  cart_views: number;
  checkout_starts: number;
  leads: number;
  cart_rate: number;
  checkout_rate: number;
  top_pages: { path: string; views: number }[];
  top_referrers: { host: string; views: number }[];
  top_products: {
    product_id: string;
    name: string;
    views: number;
    add_to_cart: number;
    checkout_starts: number;
  }[];
  daily: { date: string; page_views: number; visitors: number }[];
  last_events: {
    event: string;
    path: string;
    product_name: string;
    created_at: string;
  }[];
}

export interface AnalyticsData {
  this_month: {
    revenue: number;
    orders: number;
    by_status: Record<string, number>;
  };
  last_month: {
    revenue: number;
    orders: number;
  };
  revenue_growth: number;
  pending_count: number;
  recent_orders: RecentOrder[];
  top_sellers: TopSeller[];
  site?: SiteAnalytics;
  generated_at: string;
}

export async function fetchAnalytics(): Promise<AnalyticsData> {
  if (isDemoMode()) {
    return Promise.resolve({
      this_month: {
        revenue: 234000,
        orders: 4,
        by_status: { pending: 1, processing: 1, completed: 2, cancelled: 0, "on-hold": 0 },
      },
      last_month: {
        revenue: 180000,
        orders: 3,
      },
      revenue_growth: 30,
      pending_count: 2,
      recent_orders: [
        { id: 1024, status: "processing", total: "89000", currency: "ARS", date: "2026-05-15", customer: "Cliente Demo", items: ["VERSUS Pro Carbon 3K"] },
      ],
      top_sellers: [
        { product_id: 1, name: "VERSUS Pro Carbon 3K", quantity: 3 },
        { product_id: 2, name: "VERSUS Elite Diamond", quantity: 2 },
      ],
      site: {
        period_days: 30,
        total_events: 143,
        page_views: 82,
        today_page_views: 14,
        unique_visitors: 37,
        today_visitors: 8,
        sessions: 44,
        product_views: 31,
        add_to_cart: 12,
        cart_views: 9,
        checkout_starts: 5,
        leads: 4,
        cart_rate: 14.6,
        checkout_rate: 41.7,
        top_pages: [
          { path: "/", views: 28 },
          { path: "/store", views: 22 },
          { path: "/product/1", views: 16 },
        ],
        top_referrers: [
          { host: "instagram.com", views: 11 },
          { host: "google.com", views: 8 },
        ],
        top_products: [
          { product_id: "1", name: "VERSUS Pro Carbon 3K", views: 18, add_to_cart: 7, checkout_starts: 3 },
          { product_id: "2", name: "VERSUS Elite Diamond", views: 9, add_to_cart: 3, checkout_starts: 1 },
        ],
        daily: [],
        last_events: [],
      },
      generated_at: new Date().toISOString(),
    });
  }

  const res = await fetch('/backend/analytics.php', {
    headers: authHeaders(),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Error al cargar analytics');
  }
  return res.json();
}
