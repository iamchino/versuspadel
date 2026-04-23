/**
 * src/lib/api.ts — Public storefront WooCommerce API
 *
 * Uses the WooCommerce Store API (wc/store/v1) which is public
 * and does not require authentication — safe to call from the browser.
 *
 * Base URL is injected at build time via VITE_WC_URL environment variable.
 * In GitHub Actions, this comes from the VITE_WC_URL repository secret.
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
  add_to_cart: {
    text: string;
    description: string;
    url: string;
    minimum: number;
    maximum: number;
    multiple_of: number;
  };
}

/**
 * WooCommerce base URL — set via VITE_WC_URL environment variable.
 * Example: https://api.versuspadel.ar
 */
export const WC_BASE_URL = import.meta.env.VITE_WC_URL || '';

/**
 * Fetch all published products from WooCommerce Store API.
 * This endpoint is public — no authentication required.
 */
export const fetchProducts = async (): Promise<WcProduct[]> => {
  const response = await fetch(`${WC_BASE_URL}/wp-json/wc/store/v1/products`);
  if (!response.ok) {
    throw new Error('Failed to fetch products from WooCommerce');
  }
  return response.json();
};

/**
 * Fetch a single product by ID.
 */
export const fetchProductById = async (id: string | number): Promise<WcProduct> => {
  const response = await fetch(`${WC_BASE_URL}/wp-json/wc/store/v1/products/${id}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch product ${id}`);
  }
  return response.json();
};
