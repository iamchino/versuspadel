/**
 * src/lib/api.ts — Public storefront API
 *
 * Calls /backend/storefront.php (same-server PHP proxy) instead of
 * hitting WooCommerce directly from the browser.
 *
 * Benefits:
 *  - No CORS issues
 *  - No SSL dependency (PHP does HTTP internally)
 *  - Fast: same-server call, 60s browser cache
 *  - Credentials / WC_URL stay server-side only
 */

export interface WcProduct {
  id: number;
  name: string;
  slug: string;
  description: string;
  short_description: string;
  prices: {
    price: string;
    regular_price: string;
    sale_price: string;
    price_range: null | { min_amount: string; max_amount: string };
    currency_code: string;
    currency_symbol: string;
    currency_minor_unit: number;
    currency_decimal_separator: string;
    currency_thousand_separator: string;
    currency_prefix: string;
    currency_suffix: string;
  };
  images: {
    id: number;
    src: string;
    thumbnail: string;
    srcset: string;
    sizes: string;
    name: string;
    alt: string;
  }[];
  categories: {
    id: number;
    name: string;
    slug: string;
    link: string;
  }[];
  is_in_stock: boolean;
  featured: boolean;
  add_to_cart: {
    text: string;
    description: string;
    url: string;
    minimum: number;
    maximum: number;
    multiple_of: number;
  };
}

/** PHP proxy — for API calls (avoids CORS + SSL issues) */
const PROXY = '/backend/storefront.php';

/** Direct WooCommerce URL — for cart/checkout page redirects */
export const WC_STORE_URL = import.meta.env.VITE_WC_URL || 'http://api.versuspadel.ar';

// Keep legacy export for any component that might reference it
export const WC_BASE_URL = WC_STORE_URL;

/**
 * Fetch all published products via the PHP proxy.
 */
export const fetchProducts = async (): Promise<WcProduct[]> => {
  const t = Date.now();
  const response = await fetch(`${PROXY}?endpoint=products&per_page=100&_t=${t}`);
  if (!response.ok) {
    throw new Error('Failed to fetch products');
  }
  return response.json();
};

/**
 * Fetch a single product by ID via the PHP proxy.
 */
export const fetchProductById = async (id: string | number): Promise<WcProduct> => {
  const t = Date.now();
  const response = await fetch(`${PROXY}?endpoint=products&id=${id}&_t=${t}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch product ${id}`);
  }
  return response.json();
};


