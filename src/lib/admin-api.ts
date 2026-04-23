/**
 * src/lib/admin-api.ts — Frontend API helpers for the Admin panel
 *
 * All calls go through /api/*.php (PHP backend on DonWeb/Ferozo).
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
  regular_price: string;
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

  const res = await fetch('/api/auth.php', {
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

  const res = await fetch('/api/products.php', { headers: authHeaders() });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Failed to fetch products');
  }
  return res.json();
}

export async function createProduct(product: ProductFormData): Promise<AdminProduct> {
  const res = await fetch('/api/products.php', {
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
  const res = await fetch(`/api/products.php?id=${id}`, {
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
  const res = await fetch(`/api/products.php?id=${id}`, {
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

  const res = await fetch('/api/categories.php', { headers: authHeaders() });
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
        const res = await fetch('/api/upload-image.php', {
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
