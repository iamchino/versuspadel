import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { fetchProductById, WcProduct, WC_BASE_URL } from "@/lib/api";
import { Navbar } from "@/components/versus/Navbar";
import { Footer } from "@/components/versus/Footer";
import { Loader2, ArrowLeft, ShoppingCart, ShieldCheck, Truck, X, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";

const formatPrice = (prices: WcProduct['prices']) => {
  const priceValue = parseInt(prices.price, 10) / Math.pow(10, prices.currency_minor_unit);
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: prices.currency_code || "ARS",
    minimumFractionDigits: prices.currency_minor_unit,
  }).format(priceValue);
};

const ProductDetails = () => {
  const { id } = useParams<{ id: string }>();
  const [selectedImage, setSelectedImage] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  const { data: product, isLoading, isError } = useQuery({
    queryKey: ["wc-product", id],
    queryFn: () => fetchProductById(id!),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <main className="min-h-screen bg-background text-foreground flex flex-col">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center py-32">
          <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground uppercase tracking-widest text-sm">Cargando producto...</p>
        </div>
        <Footer />
      </main>
    );
  }

  if (isError || !product) {
    return (
      <main className="min-h-screen bg-background text-foreground flex flex-col">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center py-32">
          <div className="max-w-md text-center">
            <h1 className="font-display text-4xl uppercase mb-4 text-destructive">Producto no encontrado</h1>
            <p className="text-muted-foreground mb-8">No pudimos cargar la información de este producto.</p>
            <Link to="/store" className="inline-flex items-center gap-2 border border-border px-6 py-3 uppercase text-xs tracking-widest hover:bg-secondary transition-colors">
              <ArrowLeft size={16} /> Volver a la tienda
            </Link>
          </div>
        </div>
        <Footer />
      </main>
    );
  }

  const handleBuyNow = () => {
    window.location.href = `${WC_BASE_URL}/checkout/?add-to-cart=${product.id}`;
  };

  const handleAddToCart = () => {
    window.location.href = `${WC_BASE_URL}/cart/?add-to-cart=${product.id}`;
  };

  const isCustomizable = product.categories.some(c => c.name === "Personalizadas");

  return (
    <main className="min-h-screen bg-background text-foreground flex flex-col">
      <Navbar />
      
      <div className="flex-1 max-w-7xl mx-auto px-6 lg:px-10 py-24 md:py-32 w-full">
        <Link to="/store" className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground transition-colors mb-10">
          <ArrowLeft size={14} /> Volver a la tienda
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
          {/* Image Gallery */}
          <div className="space-y-4">
            <div 
              className="aspect-square bg-secondary relative overflow-hidden border border-border cursor-pointer group"
              onClick={() => setIsLightboxOpen(true)}
            >
              {product.images.length > 0 ? (
                <>
                  <img 
                    src={product.images[selectedImage].src} 
                    alt={product.images[selectedImage].alt || product.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                    <span className="opacity-0 group-hover:opacity-100 bg-black/50 text-white px-4 py-2 rounded-sm text-sm tracking-widest uppercase transition-opacity backdrop-blur-sm pointer-events-none">Ampliar</span>
                  </div>
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground">Sin imagen</div>
              )}
            </div>
            {product.images.length > 1 && (
              <div className="grid grid-cols-4 sm:grid-cols-5 gap-3">
                {product.images.map((img, idx) => (
                  <button 
                    key={img.id}
                    onClick={() => setSelectedImage(idx)}
                    className={`aspect-square bg-secondary border overflow-hidden transition-all ${selectedImage === idx ? 'border-primary ring-1 ring-primary' : 'border-border opacity-70 hover:opacity-100'}`}
                  >
                    <img src={img.thumbnail} alt={img.alt} loading="lazy" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="flex flex-col">
            <div className="text-xs uppercase tracking-[0.3em] text-primary mb-3">
              {product.categories.map(c => c.name).join(", ")}
            </div>
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl uppercase leading-[0.95] mb-6">
              {product.name}
            </h1>
            
            <div className="text-3xl font-display text-gold-gradient mb-8">
              {formatPrice(product.prices)}
            </div>

            {/* Short Description */}
            <div 
              className="prose prose-invert prose-p:text-muted-foreground prose-a:text-primary max-w-none mb-10"
              dangerouslySetInnerHTML={{ __html: product.short_description || product.description }}
            />

            {/* Actions */}
            <div className="mt-auto pt-8 border-t border-border">
              {isCustomizable ? (
                <a
                  href={`https://wa.me/1234567890?text=Hola!%20Me%20interesa%20personalizar%20el%20producto%20${product.name}.`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-3 bg-primary text-primary-foreground px-8 py-5 text-sm uppercase tracking-[0.2em] font-bold hover:bg-primary-glow transition-all"
                >
                  Consultar por WhatsApp
                </a>
              ) : (
                <div className="flex flex-col sm:flex-row gap-4 w-full">
                  <button
                    onClick={handleAddToCart}
                    disabled={!product.is_in_stock}
                    className="flex-1 inline-flex items-center justify-center gap-3 bg-secondary/50 border border-border text-foreground px-6 py-5 text-xs lg:text-sm uppercase tracking-[0.2em] font-bold hover:bg-secondary transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Agregar al carrito"
                  >
                    <ShoppingCart size={18} />
                    {product.is_in_stock ? 'Al Carrito' : 'Agotado'}
                  </button>
                  <button
                    onClick={handleBuyNow}
                    disabled={!product.is_in_stock}
                    className="flex-1 inline-flex items-center justify-center gap-3 bg-primary text-primary-foreground px-6 py-5 text-xs lg:text-sm uppercase tracking-[0.2em] font-bold hover:bg-primary-glow transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Comprar ahora"
                  >
                    {product.is_in_stock ? 'Comprar Ahora' : 'Agotado'}
                  </button>
                </div>
              )}
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-2 gap-4 mt-8 pt-8 border-t border-border/50">
              <div className="flex items-center gap-3 text-muted-foreground">
                <ShieldCheck className="text-primary" size={24} />
                <span className="text-xs uppercase tracking-widest">Garantía Oficial</span>
              </div>
              <div className="flex items-center gap-3 text-muted-foreground">
                <Truck className="text-primary" size={24} />
                <span className="text-xs uppercase tracking-widest">Envíos a todo el país</span>
              </div>
            </div>
          </div>
        </div>

        {/* Full Description */}
        {product.description && product.description !== product.short_description && (
          <div className="mt-24 pt-16 border-t border-border">
            <h2 className="font-display text-3xl uppercase mb-8">Detalles del Producto</h2>
            <div 
              className="prose prose-invert prose-p:text-muted-foreground prose-li:text-muted-foreground max-w-4xl"
              dangerouslySetInnerHTML={{ __html: product.description }}
            />
          </div>
        )}
      </div>

      {/* Lightbox */}
      {isLightboxOpen && product.images.length > 0 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-sm">
          <button 
            className="absolute top-6 right-6 text-foreground hover:text-primary transition-colors p-2 z-50"
            onClick={() => setIsLightboxOpen(false)}
          >
            <X size={32} />
          </button>
          
          <div className="relative w-full max-w-6xl max-h-[90vh] flex items-center justify-center px-4 md:px-16">
            {product.images.length > 1 && (
              <button 
                className="absolute left-2 md:left-8 p-3 rounded-full bg-background/50 hover:bg-background text-foreground hover:text-primary transition-all border border-border/50 z-10"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedImage(prev => prev === 0 ? product.images.length - 1 : prev - 1);
                }}
              >
                <ChevronLeft size={32} />
              </button>
            )}
            
            <img 
              src={product.images[selectedImage].src} 
              alt={product.images[selectedImage].alt || product.name}
              className="max-w-full max-h-[85vh] object-contain"
            />
            
            {product.images.length > 1 && (
              <button 
                className="absolute right-2 md:right-8 p-3 rounded-full bg-background/50 hover:bg-background text-foreground hover:text-primary transition-all border border-border/50 z-10"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedImage(prev => prev === product.images.length - 1 ? 0 : prev + 1);
                }}
              >
                <ChevronRight size={32} />
              </button>
            )}
          </div>
          
          {/* Thumbnails indicator */}
          {product.images.length > 1 && (
            <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-2">
              {product.images.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  className={`w-2.5 h-2.5 rounded-full transition-all ${selectedImage === idx ? 'bg-primary w-8' : 'bg-muted-foreground/50 hover:bg-muted-foreground'}`}
                  aria-label={`Ir a imagen ${idx + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      )}

      <Footer />
    </main>
  );
};

export default ProductDetails;
