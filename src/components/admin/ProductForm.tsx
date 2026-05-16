/**
 * ProductForm.tsx — Create / Edit product modal form
 *
 * Supports:
 * - Main image + gallery of additional images
 * - Category selection
 * - Products always created as "publish" (visible in store)
 */

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import {
  X,
  ImagePlus,
  Loader2,
  Save,
  Trash2,
  Plus,
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
  short_description: z.string().optional(),
  description: z.string().optional(),
  regular_price: z
    .string()
    .min(1, "El precio es obligatorio")
    .regex(/^\d+([.,]\d{1,2})?$/, "Formato de precio inválido"),
  categoryId: z.string().optional(),
  featured: z.boolean().optional(),
  stock_status: z.enum(['instock', 'outofstock']).default('instock'),
  stock_quantity: z.string().optional(),
});

type ProductFormValues = z.infer<typeof productSchema>;

interface ImageItem {
  id: number;
  src: string;
  preview: string; // local preview or remote URL
}

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

  // ── Images — first is main, rest are gallery ──
  const [images, setImages] = useState<ImageItem[]>([]);
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: product?.name || "",
      short_description: product?.short_description?.replace(/<[^>]*>/g, "") || "",
      description: product?.description?.replace(/<[^>]*>/g, "") || "",
      regular_price: product?.regular_price || product?.price || "",
      categoryId: product?.categories?.[0]?.id?.toString() || "",
      featured: product?.featured ?? false,
      stock_status: (product?.stock_status === 'onbackorder' ? 'instock' : (product?.stock_status as any)) ?? 'instock',
      stock_quantity: product?.stock_quantity != null ? String(product.stock_quantity) : "",
    },
  });

  // Load categories
  useEffect(() => {
    fetchCategories()
      .then(setCategories)
      .catch(() => setCategories([]))
      .finally(() => setLoadingCategories(false));
  }, []);

  // Pre-load existing images when editing
  useEffect(() => {
    if (product?.images?.length) {
      setImages(
        product.images.map((img) => ({
          id: img.id,
          src: img.src,
          preview: img.src,
        }))
      );
    }
  }, [product]);

  // ── Image handlers ──

  const handleImageSelect = async (
    e: React.ChangeEvent<HTMLInputElement>,
    replaceIndex?: number
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Immediate local preview
    const previewUrl = await new Promise<string>((res) => {
      const reader = new FileReader();
      reader.onload = () => res(reader.result as string);
      reader.readAsDataURL(file);
    });

    const placeholderIndex =
      replaceIndex !== undefined ? replaceIndex : images.length;

    setImages((prev) => {
      const next = [...prev];
      next[placeholderIndex] = { id: 0, src: "", preview: previewUrl };
      return next;
    });
    setUploadingIndex(placeholderIndex);

    try {
      const result = await uploadImage(file);
      setImages((prev) => {
        const next = [...prev];
        next[placeholderIndex] = { id: result.id, src: result.src, preview: previewUrl };
        return next;
      });
      toast.success(placeholderIndex === 0 ? "Imagen principal subida" : "Imagen de galería subida");
    } catch (err: any) {
      // Remove the placeholder on error
      setImages((prev) => prev.filter((_, i) => i !== placeholderIndex));
      toast.error(err.message || "Error al subir la imagen");
    } finally {
      setUploadingIndex(null);
    }
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  // ── Submit ──

  const onSubmit = async (values: ProductFormValues) => {
    setSubmitting(true);
    try {
      const payload: any = {
        name: values.name,
        status: "publish",
        featured: values.featured ?? false,
        short_description: values.short_description || "",
        description: values.description || "",
        regular_price: values.regular_price.replace(",", "."),
        categories: values.categoryId ? [{ id: Number(values.categoryId) }] : [],
        stock_status: values.stock_status,
        manage_stock: !!values.stock_quantity,
        stock_quantity: values.stock_quantity ? parseInt(values.stock_quantity, 10) : null,
      };

      // Send all uploaded images (main + gallery)
      const uploadedImages = images.filter((img) => img.id > 0);
      if (uploadedImages.length > 0) {
        payload.images = uploadedImages.map((img) => ({ id: img.id, src: img.src }));
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

  const isUploading = uploadingIndex !== null;

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

          {/* Short Description */}
          <div>
            <label htmlFor="product-short-desc" className="block text-xs uppercase tracking-wider text-muted-foreground mb-2">
              Descripción corta <span className="text-muted-foreground/40 normal-case">(visible en la página de inicio y al lado de la imagen)</span>
            </label>
            <textarea
              id="product-short-desc"
              {...register("short_description")}
              rows={2}
              placeholder="Ej: Carbon 3K de alta performance"
              className="w-full bg-secondary/50 border border-border/50 rounded-md px-4 py-3 text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all resize-none"
            />
          </div>

          {/* Long Description */}
          <div>
            <label htmlFor="product-description" className="block text-xs uppercase tracking-wider text-muted-foreground mb-2">
              Descripción completa <span className="text-muted-foreground/40 normal-case">(visible debajo de la imagen en el producto)</span>
            </label>
            <textarea
              id="product-description"
              {...register("description")}
              rows={4}
              placeholder="Describí el producto, materiales, tecnología..."
              className="w-full bg-secondary/50 border border-border/50 rounded-md px-4 py-3 text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all resize-none"
            />
          </div>

          {/* Featured toggle */}
          <div className="flex items-center justify-between p-4 bg-secondary/30 border border-border/40 rounded-md">
            <div>
              <div className="text-sm font-medium text-foreground">Producto destacado</div>
              <div className="text-xs text-muted-foreground/60 mt-0.5">Aparece en grande en la página de inicio</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                id="product-featured"
                {...register("featured")}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-secondary rounded-full peer peer-checked:bg-primary transition-colors after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-5"></div>
            </label>
          </div>

          {/* Stock */}
          <div className="space-y-3">
            <label className="block text-xs uppercase tracking-wider text-muted-foreground">
              Estado de stock
            </label>
            <div className="grid grid-cols-2 gap-3">
              {(["instock", "outofstock"] as const).map((opt) => (
                <label
                  key={opt}
                  className="relative cursor-pointer"
                >
                  <input
                    type="radio"
                    {...register("stock_status")}
                    value={opt}
                    className="sr-only peer"
                  />
                  <div className={`
                    text-center text-[11px] uppercase tracking-wider py-2.5 px-2 rounded-md border transition-all
                    peer-checked:border-primary peer-checked:bg-primary/10 peer-checked:text-primary
                    border-border/40 text-muted-foreground hover:border-border hover:text-foreground
                    ${opt === 'instock' ? 'peer-checked:text-emerald-400 peer-checked:border-emerald-400/50 peer-checked:bg-emerald-400/10' : ''}
                    ${opt === 'outofstock' ? 'peer-checked:text-red-400 peer-checked:border-red-400/50 peer-checked:bg-red-400/10' : ''}
                  `}>
                    {opt === 'instock' ? '✓ En stock' : '✗ Sin stock'}
                  </div>
                </label>
              ))}
            </div>

            {/* Optional quantity (only useful when instock) */}
            <div>
              <label htmlFor="stock-quantity" className="block text-xs text-muted-foreground/50 mb-1.5">
                Cantidad disponible <span className="text-muted-foreground/30">(opcional — dejá vacío si no manejás stock)</span>
              </label>
              <input
                id="stock-quantity"
                type="number"
                min="0"
                {...register("stock_quantity")}
                placeholder="Ej: 10"
                className="w-full bg-secondary/50 border border-border/50 rounded-md px-4 py-2.5 text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all text-sm"
              />
            </div>
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

          {/* ── Images — Main + Gallery ── */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs uppercase tracking-wider text-muted-foreground">
                Imágenes del producto
              </label>
              <span className="text-xs text-muted-foreground/40">
                {images.filter(i => i.id > 0).length} subida{images.filter(i => i.id > 0).length !== 1 ? "s" : ""}
              </span>
            </div>

            {/* Image grid */}
            <div className="grid grid-cols-3 gap-2">
              {/* Existing / uploading images */}
              {images.map((img, index) => (
                <div
                  key={index}
                  className="relative group aspect-square rounded-md overflow-hidden border border-border/30 bg-secondary/30"
                >
                  <img
                    src={img.preview}
                    alt={`Imagen ${index + 1}`}
                    className="w-full h-full object-cover"
                  />

                  {/* First image badge */}
                  {index === 0 && (
                    <div className="absolute bottom-1 left-1 text-[9px] uppercase tracking-wider bg-primary/90 text-primary-foreground px-1.5 py-0.5 rounded-sm">
                      Principal
                    </div>
                  )}

                  {/* Upload spinner */}
                  {uploadingIndex === index && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                      <Loader2 className="w-5 h-5 text-primary animate-spin" />
                    </div>
                  )}

                  {/* Remove button */}
                  {uploadingIndex !== index && (
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-1 right-1 bg-destructive/90 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              ))}

              {/* Add image button */}
              {images.length < 8 && (
                <label
                  htmlFor={`product-image-${images.length}`}
                  className="aspect-square rounded-md border-2 border-dashed border-border/40 flex flex-col items-center justify-center cursor-pointer hover:border-primary/40 hover:bg-primary/5 transition-all"
                >
                  <Plus className="w-5 h-5 text-muted-foreground/50 mb-1" />
                  <span className="text-[10px] text-muted-foreground/40 text-center leading-tight">
                    {images.length === 0 ? "Imagen\nprincipal" : "Agregar"}
                  </span>
                  <input
                    id={`product-image-${images.length}`}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={(e) => handleImageSelect(e)}
                    disabled={isUploading}
                  />
                </label>
              )}

              {/* Empty slots hint */}
              {images.length === 0 && (
                <div className="col-span-2 flex items-center">
                  <div className="flex items-center gap-2 text-muted-foreground/30">
                    <ImagePlus className="w-5 h-5" />
                    <span className="text-xs">Podés subir hasta 8 imágenes</span>
                  </div>
                </div>
              )}
            </div>

            <p className="text-xs text-muted-foreground/30 mt-2">
              JPG, PNG, WebP · Max 5MB por imagen · La primera es la imagen principal
            </p>
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
              disabled={submitting || isUploading}
              className="flex-1 bg-primary text-primary-foreground py-3 rounded-md font-semibold text-sm uppercase tracking-wider hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Guardando...
                </>
              ) : isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Subiendo imagen...
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
