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
    price_range: null | any;
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

export const WC_BASE_URL = import.meta.env.VITE_WC_STORE_URL || '';

export const fetchProducts = async (): Promise<WcProduct[]> => {
  const response = await fetch(`${WC_BASE_URL}/wp-json/wc/store/v1/products`);
  if (!response.ok) {
    throw new Error("Failed to fetch products from WooCommerce");
  }
  return response.json();
};

export const fetchProductById = async (id: string | number): Promise<WcProduct> => {
  const response = await fetch(`${WC_BASE_URL}/wp-json/wc/store/v1/products/${id}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch product ${id}`);
  }
  return response.json();
};
