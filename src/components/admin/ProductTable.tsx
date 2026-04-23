/**
 * ProductTable.tsx — List of existing WooCommerce products
 *
 * Displays products in a clean table/card layout with edit & delete actions.
 * Shows image thumbnails, prices, and categories.
 * Includes confirmation dialog before deleting.
 */

import { useState } from "react";
import {
  Pencil,
  Trash2,
  ImageOff,
  Package,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import { type AdminProduct, deleteProduct } from "@/lib/admin-api";
import { toast } from "sonner";

interface ProductTableProps {
  products: AdminProduct[];
  loading: boolean;
  onEdit: (product: AdminProduct) => void;
  onDeleted: () => void;
}

export function ProductTable({
  products,
  loading,
  onEdit,
  onDeleted,
}: ProductTableProps) {
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);

  const handleDelete = async (id: number) => {
    setDeletingId(id);
    try {
      await deleteProduct(id);
      toast.success("Producto eliminado");
      setConfirmDeleteId(null);
      onDeleted();
    } catch (err: any) {
      toast.error(err.message || "Error al eliminar");
    } finally {
      setDeletingId(null);
    }
  };

  // ── Loading state ──
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
        <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
        <p className="text-sm">Cargando productos...</p>
      </div>
    );
  }

  // ── Empty state ──
  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
        <Package className="w-16 h-16 text-muted-foreground/20 mb-4" />
        <p className="text-lg font-medium mb-1">No hay productos</p>
        <p className="text-sm text-muted-foreground/60">
          Hacé click en "Nuevo Producto" para agregar el primero
        </p>
      </div>
    );
  }

  return (
    <>
      {/* Product Grid */}
      <div className="grid gap-3">
        {products.map((product) => (
          <div
            key={product.id}
            className="group flex items-center gap-4 bg-card/60 border border-border/30 rounded-lg p-4 hover:border-primary/20 hover:bg-card/80 transition-all"
          >
            {/* Thumbnail */}
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-md overflow-hidden bg-secondary/50 flex-shrink-0">
              {product.images?.[0]?.src ? (
                <img
                  src={product.images[0].src}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <ImageOff className="w-6 h-6 text-muted-foreground/30" />
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-foreground truncate text-sm md:text-base">
                {product.name}
              </h3>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-primary font-bold text-sm md:text-base">
                  ${product.regular_price || product.price || "—"}
                </span>
                {product.categories?.[0] && (
                  <span className="text-xs text-muted-foreground bg-secondary/50 px-2 py-0.5 rounded-full">
                    {product.categories[0].name}
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground/50 mt-1 hidden md:block">
                ID: {product.id} · {product.status === "publish" ? "Publicado" : product.status}
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={() => onEdit(product)}
                className="p-2 rounded-md text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all"
                title="Editar"
              >
                <Pencil className="w-4 h-4" />
              </button>
              <button
                onClick={() => setConfirmDeleteId(product.id)}
                className="p-2 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
                title="Eliminar"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Delete Confirmation Modal */}
      {confirmDeleteId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setConfirmDeleteId(null)}
          />
          <div className="relative bg-card border border-border/50 rounded-lg p-6 max-w-sm w-full animate-scale-in shadow-2xl">
            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-destructive" />
              </div>
            </div>
            <h3 className="text-center font-semibold text-lg mb-2">
              ¿Eliminar producto?
            </h3>
            <p className="text-center text-sm text-muted-foreground mb-6">
              Esta acción no se puede deshacer. El producto se eliminará permanentemente de WooCommerce.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDeleteId(null)}
                className="flex-1 bg-secondary/50 text-foreground py-2.5 rounded-md text-sm hover:bg-secondary transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleDelete(confirmDeleteId)}
                disabled={deletingId === confirmDeleteId}
                className="flex-1 bg-destructive text-white py-2.5 rounded-md text-sm font-semibold hover:brightness-110 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
              >
                {deletingId === confirmDeleteId ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Eliminando...
                  </>
                ) : (
                  "Eliminar"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
