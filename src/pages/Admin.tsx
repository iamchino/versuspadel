/**
 * Admin.tsx — Main Admin Dashboard page
 *
 * Accessible at /admin. Protected by a password gate.
 * Allows the client to manage WooCommerce products without
 * ever needing to access the WordPress admin panel.
 *
 * ── How to access ──
 * 1. Navigate to https://your-domain.vercel.app/admin
 * 2. Enter the password defined in ADMIN_PASSWORD env var
 * 3. Manage products: create, edit, delete with real-time feedback
 */

import { useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Plus,
  RefreshCw,
  LogOut,
  LayoutDashboard,
  Package,
  Loader2,
  WifiOff,
} from "lucide-react";
import { AdminLogin } from "@/components/admin/AdminLogin";
import { ProductForm } from "@/components/admin/ProductForm";
import { ProductTable } from "@/components/admin/ProductTable";
import {
  isAuthenticated,
  clearToken,
  fetchAdminProducts,
  isDemoMode,
  type AdminProduct,
} from "@/lib/admin-api";

export default function Admin() {
  const [authed, setAuthed] = useState(isAuthenticated());
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<AdminProduct | null>(null);
  const isDemo = isDemoMode();

  // ── Fetch products ──
  const {
    data: products = [],
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ["admin-products"],
    queryFn: fetchAdminProducts,
    enabled: authed,
    retry: 1,
    staleTime: 1000 * 30, // 30 seconds
  });

  const handleLogout = () => {
    clearToken();
    setAuthed(false);
    toast.info("Sesión cerrada");
  };

  const handleNewProduct = () => {
    setEditingProduct(null);
    setShowForm(true);
  };

  const handleEdit = (product: AdminProduct) => {
    setEditingProduct(product);
    setShowForm(true);
  };

  const handleSaved = useCallback(() => {
    setShowForm(false);
    setEditingProduct(null);
    refetch();
  }, [refetch]);

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingProduct(null);
  };

  // ── Login gate ──
  if (!authed) {
    return <AdminLogin onSuccess={() => setAuthed(true)} />;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Subtle background glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full bg-primary/3 blur-[150px]" />
        <div className="absolute -bottom-40 -left-40 w-[400px] h-[400px] rounded-full bg-primary/2 blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 md:px-6 py-6 md:py-10">
        {/* ── Header ── */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 md:mb-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
              <LayoutDashboard className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="font-display text-2xl md:text-3xl uppercase tracking-wide flex items-center gap-3">
                <span className="text-white">Panel</span>{" "}
                <span className="text-gold-gradient">Admin</span>
                {isDemo && (
                  <span className="text-[10px] font-sans font-bold uppercase tracking-widest bg-amber-500/15 border border-amber-500/30 text-amber-400 px-2 py-0.5 rounded-full align-middle">
                    MODO DEMO
                  </span>
                )}
              </h1>
              <p className="text-xs text-muted-foreground/60 mt-0.5">
                Gestión de productos · VERSUS Pádel
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => refetch()}
              disabled={isFetching}
              className="flex items-center gap-2 bg-secondary/50 border border-border/30 text-foreground px-4 py-2.5 rounded-md text-xs uppercase tracking-wider hover:bg-secondary transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? "animate-spin" : ""}`} />
              Actualizar
            </button>
            <button
              onClick={handleNewProduct}
              className="flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-md text-xs uppercase tracking-wider font-semibold hover:brightness-110 transition-all"
            >
              <Plus className="w-4 h-4" />
              Nuevo Producto
            </button>
            <button
              onClick={handleLogout}
              className="p-2.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
              title="Cerrar sesión"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* ── Stats bar ── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
          <div className="bg-card/60 border border-border/30 rounded-lg p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Package className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                {isLoading ? "—" : products.length}
              </p>
              <p className="text-xs text-muted-foreground">Productos totales</p>
            </div>
          </div>
          <div className="bg-card/60 border border-border/30 rounded-lg p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
              <Package className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                {isLoading
                  ? "—"
                  : products.filter((p) => p.status === "publish").length}
              </p>
              <p className="text-xs text-muted-foreground">Publicados</p>
            </div>
          </div>
          <div className="bg-card/60 border border-border/30 rounded-lg p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
              <Package className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                {isLoading
                  ? "—"
                  : products.filter((p) => p.status === "draft").length}
              </p>
              <p className="text-xs text-muted-foreground">Borradores</p>
            </div>
          </div>
        </div>

        {/* ── Demo mode notice ── */}
        {isDemo && (
          <div className="bg-amber-500/8 border border-amber-500/20 rounded-lg p-4 mb-6 flex items-center gap-3">
            <span className="text-amber-400 text-lg">🧪</span>
            <div>
              <p className="text-sm font-semibold text-amber-400">Estás en Modo Demo</p>
              <p className="text-xs text-muted-foreground/70">
                Los datos son de muestra. El formulario funciona al 100% para que puedas explorar la interfaz. Cuando conectes WooCommerce, ingresá con tu contraseña real.
              </p>
            </div>
          </div>
        )}

        {/* ── Error state ── */}
        {isError && (
          <div className="bg-destructive/5 border border-destructive/20 rounded-lg p-6 mb-6 flex items-start gap-4">
            <WifiOff className="w-6 h-6 text-destructive flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-destructive mb-1">
                No se pudo conectar con WooCommerce
              </h3>
              <p className="text-sm text-muted-foreground">
                {(error as any)?.message ||
                  "Verificá que las variables WC_URL, WC_CONSUMER_KEY y WC_CONSUMER_SECRET estén configuradas en Vercel."}
              </p>
              <button
                onClick={() => refetch()}
                className="mt-3 text-xs text-primary hover:underline"
              >
                Reintentar conexión
              </button>
            </div>
          </div>
        )}

        {/* ── Products list ── */}
        <div className="bg-card/30 border border-border/20 rounded-lg p-4 md:p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm uppercase tracking-wider text-muted-foreground font-medium">
              Productos
            </h2>
            {isFetching && !isLoading && (
              <Loader2 className="w-4 h-4 text-primary animate-spin" />
            )}
          </div>

          <ProductTable
            products={products}
            loading={isLoading}
            onEdit={handleEdit}
            onDeleted={() => refetch()}
          />
        </div>

        {/* ── Footer ── */}
        <p className="text-center text-xs text-muted-foreground/30 mt-10">
          VERSUS Pádel Admin Panel · Las credenciales de WooCommerce están protegidas en el servidor
        </p>
      </div>

      {/* ── Product Form Modal ── */}
      {showForm && (
        <ProductForm
          product={editingProduct}
          onClose={handleCloseForm}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
}
