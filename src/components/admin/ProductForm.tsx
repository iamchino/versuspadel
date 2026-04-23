/**
 * ProductForm.tsx — Create / Edit product modal form
 *
 * Uses react-hook-form + zod for validation.
 * Calls Vercel serverless functions via admin-api helpers.
 * Supports image upload preview and category selection.
 */

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import {
  X,
  Upload,
  ImagePlus,
  Loader2,
  Save,
  Trash2,
} from "lucide-react";
import {
  type AdminProduct,
  type AdminCategory,
  createProduct,
  updateProduct,
  uploadImage,
  fetchCategories,
} from "@/lib/admin-api";

// ── Schema ─────────────────────────────────────────────

const productSchema = z.object({
  name: z.string().min(1, "El nombre es obligatorio"),
  description: z.string().optional(),
  regular_price: z
    .string()
    .min(1, "El precio es obligatorio")
    .regex(/^\d+([.,]\d{1,2})?$/, "Formato de precio inválido"),
  categoryId: z.string().optional(),
});

type ProductFormValues = z.infer<typeof productSchema>;

// ── Props ──────────────────────────────────────────────

interface ProductFormProps {
  product?: AdminProduct | null;
  onClose: () => void;
  onSaved: () => void;
}

export function ProductForm({ product, onClose, onSaved }: ProductFormProps) {
  const isEditing = !!product;
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageData, setImageData] = useState<{ id: number; src: string } | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: product?.name || "",
      description: product?.description?.replace(/<[^>]*>/g, "") || "",
      regular_price: product?.regular_price || product?.price || "",
      categoryId: product?.categories?.[0]?.id?.toString() || "",
    },
  });

  // Load categories
  useEffect(() => {
    fetchCategories()
      .then(setCategories)
      .catch(() => {
        // Graceful fallback — WooCommerce not connected yet
        setCategories([]);
      })
      .finally(() => setLoadingCategories(false));
  }, []);

  // Set existing image preview
  useEffect(() => {
    if (product?.images?.[0]) {
      setImagePreview(product.images[0].src);
      setImageData({ id: product.images[0].id, src: product.images[0].src });
    }
  }, [product]);

  // ── Image handler ──

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Show local preview immediately
    const reader = new FileReader();
    reader.onload = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);

    // Upload to WP
    setUploadingImage(true);
    try {
      const result = await uploadImage(file);
      setImageData(result);
      toast.success("Imagen subida correctamente");
    } catch (err: any) {
      toast.error(err.message || "Error al subir la imagen");
      // Keep the preview but mark image as not uploaded
      setImageData(null);
    } finally {
      setUploadingImage(false);
    }
  };

  const removeImage = () => {
    setImagePreview(null);
    setImageData(null);
  };

  // ── Submit ──

  const onSubmit = async (values: ProductFormValues) => {
    setSubmitting(true);
    try {
      const payload: any = {
        name: values.name,
        description: values.description || "",
        regular_price: values.regular_price.replace(",", "."),
        categories: values.categoryId ? [{ id: Number(values.categoryId) }] : [],
      };

      if (imageData) {
        payload.images = [{ id: imageData.id, src: imageData.src }];
      }

      if (isEditing && product) {
        await updateProduct(product.id, payload);
        toast.success("Producto actualizado");
      } else {
        await createProduct(payload);
        toast.success("Producto creado exitosamente");
      }

      onSaved();
    } catch (err: any) {
      toast.error(err.message || "Error al guardar el producto");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto bg-card border border-border/50 rounded-lg shadow-2xl animate-scale-in">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 bg-card/95 backdrop-blur-sm border-b border-border/30">
          <h2 className="font-display text-xl uppercase tracking-wide">
            {isEditing ? (
              <>
                <span className="text-white">Editar</span>{" "}
                <span className="text-gold-gradient">Producto</span>
              </>
            ) : (
              <>
                <span className="text-white">Nuevo</span>{" "}
                <span className="text-gold-gradient">Producto</span>
              </>
            )}
          </h2>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5">
          {/* Product Name */}
          <div>
            <label htmlFor="product-name" className="block text-xs uppercase tracking-wider text-muted-foreground mb-2">
              Nombre del producto *
            </label>
            <input
              id="product-name"
              {...register("name")}
              placeholder="Ej: Paleta VERSUS Pro Carbon"
              className="w-full bg-secondary/50 border border-border/50 rounded-md px-4 py-3 text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all"
            />
            {errors.name && (
              <p className="text-destructive text-xs mt-1">{errors.name.message}</p>
            )}
          </div>

          {/* Category */}
          <div>
            <label htmlFor="product-category" className="block text-xs uppercase tracking-wider text-muted-foreground mb-2">
              Categoría
            </label>
            <select
              id="product-category"
              {...register("categoryId")}
              className="w-full bg-secondary/50 border border-border/50 rounded-md px-4 py-3 text-foreground focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all appearance-none"
            >
              <option value="">Sin categoría</option>
              {loadingCategories ? (
                <option disabled>Cargando categorías...</option>
              ) : (
                categories.map((cat) => (
                  <option key={cat.id} value={cat.id.toString()}>
                    {cat.name}
                  </option>
                ))
              )}
            </select>
          </div>

          {/* Description */}
          <div>
            <label htmlFor="product-description" className="block text-xs uppercase tracking-wider text-muted-foreground mb-2">
              Descripción
            </label>
            <textarea
              id="product-description"
              {...register("description")}
              rows={4}
              placeholder="Describí el producto, materiales, tecnología..."
              className="w-full bg-secondary/50 border border-border/50 rounded-md px-4 py-3 text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all resize-none"
            />
          </div>

          {/* Price */}
          <div>
            <label htmlFor="product-price" className="block text-xs uppercase tracking-wider text-muted-foreground mb-2">
              Precio (ARS) *
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-primary font-semibold">
                $
              </span>
              <input
                id="product-price"
                {...register("regular_price")}
                placeholder="0.00"
                className="w-full bg-secondary/50 border border-border/50 rounded-md pl-9 pr-4 py-3 text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all"
              />
            </div>
            {errors.regular_price && (
              <p className="text-destructive text-xs mt-1">{errors.regular_price.message}</p>
            )}
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-2">
              Imagen del producto
            </label>

            {imagePreview ? (
              <div className="relative group rounded-md overflow-hidden border border-border/30">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-48 object-cover"
                />
                {uploadingImage && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                    <Loader2 className="w-8 h-8 text-primary animate-spin" />
                  </div>
                )}
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute top-2 right-2 bg-destructive/90 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <label
                htmlFor="product-image"
                className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-border/40 rounded-md cursor-pointer hover:border-primary/40 hover:bg-primary/5 transition-all"
              >
                <ImagePlus className="w-8 h-8 text-muted-foreground/50 mb-2" />
                <span className="text-sm text-muted-foreground/60">
                  Click para subir imagen
                </span>
                <span className="text-xs text-muted-foreground/30 mt-1">
                  JPG, PNG, WebP — Max 5MB
                </span>
                <input
                  id="product-image"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={handleImageChange}
                />
              </label>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-secondary/50 text-foreground py-3 rounded-md text-sm uppercase tracking-wider hover:bg-secondary transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting || uploadingImage}
              className="flex-1 bg-primary text-primary-foreground py-3 rounded-md font-semibold text-sm uppercase tracking-wider hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  {isEditing ? "Guardar cambios" : "Crear producto"}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
