import { useState, useMemo } from "react";
import { Navbar } from "@/components/versus/Navbar";
import { Footer } from "@/components/versus/Footer";
import { ShoppingCart, Filter, Search, Loader2, Truck, ShieldCheck, Lock } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { fetchProducts, WcProduct, WC_BASE_URL } from "@/lib/api";
import { formatPrice } from "@/lib/format";
import { Link } from "react-router-dom";
import { trackAddToCart, trackCheckoutStart } from "@/lib/analytics";

// formatPrice imported from @/lib/format

const Store = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>("Todos");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: products = [], isLoading, isError } = useQuery({
    queryKey: ["wc-products"],
    queryFn: fetchProducts,
    staleTime: 0,              // Always consider data stale
    refetchOnMount: 'always',  // Always refetch when component mounts
    refetchOnWindowFocus: true,
  });

  // Extract unique categories from products
  const categories = useMemo(() => {
    const allCategories = new Set<string>();
    products.forEach((p) => {
      p.categories.forEach((c) => allCategories.add(c.name));
    });
    return Array.from(allCategories);
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const categoryNames = product.categories.map(c => c.name);
      const matchesCategory = selectedCategory === "Todos" || categoryNames.includes(selectedCategory);
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            (product.short_description && product.short_description.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesCategory && matchesSearch;
    });
  }, [products, selectedCategory, searchQuery]);

  const handleBuyNow = (e: React.MouseEvent, product: WcProduct) => {
    e.preventDefault();
    e.stopPropagation();
    trackAddToCart(product, "checkout");
    trackCheckoutStart(product);
    window.location.href = `${WC_BASE_URL}/checkout/?add-to-cart=${product.id}`;
  };

  const handleAddToCart = (e: React.MouseEvent, product: WcProduct) => {
    e.preventDefault();
    e.stopPropagation();
    trackAddToCart(product, "cart");
    window.location.href = `${WC_BASE_URL}/cart/?add-to-cart=${product.id}`;
  };

  return (
    <main className="min-h-screen bg-background text-foreground flex flex-col">
      <Navbar />
      
      <div className="flex-1 max-w-7xl mx-auto px-6 lg:px-10 py-24 w-full">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-display text-4xl md:text-5xl uppercase mb-4">Tienda <span className="text-gold-gradient italic">VERSUS</span></h1>
          <p className="text-muted-foreground">Equipamiento de élite para jugadores exigentes.</p>
        </div>

        {/* Trust / Shipping Banner */}
        <div className="mb-10 border border-border/60 bg-card/50 backdrop-blur-sm overflow-hidden">
          <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-border/40">
            <div className="flex items-center gap-3 px-5 py-4 group">
              <span className="flex items-center justify-center w-10 h-10 rounded-full border border-primary/25 bg-primary/10 group-hover:bg-primary/20 transition-colors shrink-0">
                <Truck size={18} className="text-primary" />
              </span>
              <div>
                <div className="text-xs font-bold uppercase tracking-[0.15em] text-foreground">Envíos gratis</div>
                <div className="text-[11px] text-muted-foreground tracking-wide">A todo el país</div>
              </div>
            </div>
            <div className="flex items-center gap-3 px-5 py-4 group">
              <span className="flex items-center justify-center w-10 h-10 rounded-full border border-primary/25 bg-primary/10 group-hover:bg-primary/20 transition-colors shrink-0">
                <ShieldCheck size={18} className="text-primary" />
              </span>
              <div>
                <div className="text-xs font-bold uppercase tracking-[0.15em] text-foreground">Garantía oficial</div>
                <div className="text-[11px] text-muted-foreground tracking-wide">Calidad asegurada</div>
              </div>
            </div>
            <div className="flex items-center gap-3 px-5 py-4 group">
              <span className="flex items-center justify-center w-10 h-10 rounded-full border border-primary/25 bg-primary/10 group-hover:bg-primary/20 transition-colors shrink-0">
                <Lock size={18} className="text-primary" />
              </span>
              <div>
                <div className="text-xs font-bold uppercase tracking-[0.15em] text-foreground">Compra segura</div>
                <div className="text-[11px] text-muted-foreground tracking-wide">Pago protegido</div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-10">
          {/* Sidebar / Filters */}
          <aside className="w-full lg:w-64 shrink-0 space-y-8">
            <div className="space-y-4">
              <h3 className="text-sm font-semibold uppercase tracking-widest flex items-center gap-2 border-b border-border pb-2">
                <Search size={16} /> Buscar
              </h3>
              <input 
                type="text" 
                placeholder="Buscar productos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-secondary border border-border rounded-sm px-4 py-2 text-sm focus:outline-none focus:border-primary transition-colors"
              />
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-semibold uppercase tracking-widest flex items-center gap-2 border-b border-border pb-2">
                <Filter size={16} /> Categorías
              </h3>
              <ul className="space-y-2">
                <li>
                  <button 
                    onClick={() => setSelectedCategory("Todos")}
                    className={`text-sm hover:text-primary transition-colors ${selectedCategory === "Todos" ? "text-primary font-semibold" : "text-muted-foreground"}`}
                  >
                    Todos los productos
                  </button>
                </li>
                {categories.map(cat => (
                  <li key={cat}>
                    <button 
                      onClick={() => setSelectedCategory(cat)}
                      className={`text-sm hover:text-primary transition-colors ${selectedCategory === cat ? "text-primary font-semibold" : "text-muted-foreground"}`}
                    >
                      {cat}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </aside>

          {/* Product Grid */}
          <div className="flex-1">
            <div className="mb-6 flex justify-between items-center text-sm text-muted-foreground">
              <span>Mostrando {filteredProducts.length} productos</span>
            </div>

            {isLoading ? (
              <div className="py-20 flex flex-col items-center justify-center text-muted-foreground gap-4">
                <Loader2 className="h-8 w-8 animate-spin" />
                <p>Cargando productos de la tienda...</p>
              </div>
            ) : isError ? (
              <div className="py-20 text-center border border-destructive/50 rounded-sm bg-destructive/10 text-destructive">
                <p>Hubo un error al cargar los productos. Por favor intenta más tarde.</p>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="py-20 text-center border border-dashed border-border rounded-sm bg-secondary/50">
                <p className="text-muted-foreground">No se encontraron productos que coincidan con tu búsqueda.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map(product => (
                  <Link to={`/product/${product.id}`} key={product.id} className="group flex flex-col bg-card border border-border overflow-hidden hover:border-primary/50 transition-colors">
                    <div className="aspect-square bg-secondary relative overflow-hidden">
                      {product.images.length > 0 ? (
                        <img 
                          src={product.images[0].src} 
                          alt={product.images[0].alt || product.name}
                          loading="lazy"
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-muted text-muted-foreground">
                          Sin imagen
                        </div>
                      )}
                      
                      {!product.is_in_stock && (
                        <div className="absolute top-3 right-3 bg-destructive text-destructive-foreground text-[10px] font-bold uppercase px-2 py-1 tracking-widest">
                          Agotado
                        </div>
                      )}
                    </div>
                    <div className="p-5 flex flex-col flex-1">
                      <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1 line-clamp-1">
                        {product.categories.map(c => c.name).join(", ")}
                      </div>
                      <h3 className="font-display text-xl uppercase leading-tight mb-2">
                        {product.name}
                      </h3>

                      <div className="mt-auto flex items-center justify-between gap-2 pt-4 border-t border-border/50">
                        <span className="font-bold text-sm sm:text-base whitespace-nowrap">
                          {formatPrice(product.prices)}
                        </span>
                        <div className="flex gap-1.5">
                          <button 
                            onClick={(e) => handleAddToCart(e, product)}
                            disabled={!product.is_in_stock}
                            className="bg-secondary/50 text-foreground hover:bg-secondary border border-border p-1.5 rounded-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shrink-0"
                            title="Agregar al carrito"
                          >
                            <ShoppingCart size={16} />
                          </button>
                          <button 
                            onClick={(e) => handleBuyNow(e, product)}
                            disabled={!product.is_in_stock}
                            className="bg-primary text-primary-foreground hover:bg-primary/90 px-2.5 py-1.5 text-[10px] sm:text-xs font-semibold uppercase tracking-wider rounded-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-1 text-center"
                            title="Comprar ahora"
                          >
                            Comprar
                          </button>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      
      <Footer />
    </main>
  );
};

export default Store;
