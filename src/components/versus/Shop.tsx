import { useRef } from "react";
import { motion, useScroll, useTransform, useInView } from "framer-motion";
import { ArrowRight, PackageSearch, Sparkles, Star } from "lucide-react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { fetchProducts, WcProduct } from "@/lib/api";
import { formatPrice } from "@/lib/format";

// formatPrice imported from @/lib/format

const cardVariants = {
  hidden: { opacity: 0, y: 60, scale: 0.95 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.8, delay: i * 0.15, ease: [0.16, 1, 0.3, 1] },
  }),
};

const EmptyCard = ({ index }: { index: number }) => (
  <div className="group relative bg-card border border-border/40 overflow-hidden">
    <div className="relative aspect-square overflow-hidden bg-muted/30 flex flex-col items-center justify-center gap-3 text-muted-foreground/40">
      <PackageSearch size={36} strokeWidth={1} />
      <span className="text-[10px] uppercase tracking-[0.25em]">Próximamente</span>
      <div className="absolute bottom-4 left-4 font-display text-8xl leading-none text-foreground/5">
        {String(index + 1).padStart(2, "0")}
      </div>
    </div>
    <div className="p-5 space-y-2">
      <div className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground/40">Colección 2025</div>
      <div className="h-5 w-32 bg-muted/30 rounded-sm" />
      <div className="h-4 w-20 bg-muted/20 rounded-sm" />
    </div>
  </div>
);

export const Shop = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const headRef = useRef<HTMLDivElement>(null);
  const featRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  const headInView = useInView(headRef, { once: true, margin: "-10%" });
  const featInView = useInView(featRef, { once: true, margin: "-10%" });
  const gridInView = useInView(gridRef, { once: true, margin: "-10%" });

  // Parallax for featured image
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start end", "end start"] });
  const featImgY = useTransform(scrollYProgress, [0, 1], ["0%", "-12%"]);

  const { data: products = [], isLoading } = useQuery({
    queryKey: ["wc-products-home"],
    queryFn: fetchProducts,
    staleTime: 0,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
  });

  const featured = products.find(p => p.featured) ?? products[0] ?? null;
  const gridProducts = products.filter(p => p !== featured).slice(0, 3);
  const showPlaceholders = !isLoading && products.length === 0;

  return (
    <section ref={sectionRef} id="shop" className="relative bg-background py-24 lg:py-32">
      {/* Decorative gold line separator */}
      <div className="absolute top-0 inset-x-0 section-divider" />

      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        {/* Header */}
        <motion.div
          ref={headRef}
          initial={{ opacity: 0, y: 50 }}
          animate={headInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-16"
        >
          <div>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={headInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="text-xs uppercase tracking-[0.4em] text-primary mb-4"
            >
              Tienda · Colección 2025
            </motion.div>
            <h2 className="font-display text-6xl md:text-8xl lg:text-9xl uppercase leading-[0.9] text-balance">
              Nuestra <span className="text-gold-gradient italic">colección.</span>
            </h2>
          </div>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={headInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="text-muted-foreground max-w-md text-lg leading-relaxed"
          >
            Descubre nuestra línea completa de paletas. Performance profesional.
          </motion.p>
        </motion.div>

        {/* Featured hero product */}
        <motion.div
          ref={featRef}
          initial={{ opacity: 0, y: 60 }}
          animate={featInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 mb-20 lg:mb-28 group"
        >
          <div className="lg:col-span-7 relative aspect-[4/3] lg:aspect-auto lg:min-h-[520px] overflow-hidden bg-muted">
            {isLoading ? (
              <div className="w-full h-full bg-muted/50 animate-pulse" />
            ) : featured ? (
              <>
                {featured.images.length > 0 ? (
                  <motion.div className="absolute inset-[-8%] parallax-layer" style={{ y: featImgY }}>
                    <img
                      src={featured.images[0].src}
                      alt={featured.images[0].alt || featured.name}
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-[1500ms] ease-out group-hover:scale-105"
                    />
                  </motion.div>
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center gap-4 text-muted-foreground/30">
                    <PackageSearch size={64} strokeWidth={1} />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-tr from-background/60 via-transparent to-transparent" />
                <div className="absolute top-6 left-6 inline-flex items-center gap-1.5 bg-primary text-primary-foreground text-[10px] uppercase tracking-[0.2em] font-bold px-3 py-1.5">
                  <Star size={10} fill="currentColor" /> Destacado
                </div>
                <div className="absolute bottom-6 left-6 font-display text-[20vw] md:text-[14vw] lg:text-[10rem] leading-none text-foreground/15">
                  01
                </div>
              </>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center gap-4 text-muted-foreground/30">
                <PackageSearch size={64} strokeWidth={1} />
                <span className="text-sm uppercase tracking-widest">Productos próximamente</span>
              </div>
            )}
          </div>

          <div className="lg:col-span-5 flex flex-col justify-center space-y-6">
            {isLoading ? (
              <div className="space-y-4 animate-pulse">
                <div className="h-3 w-24 bg-muted rounded" />
                <div className="h-16 w-full bg-muted rounded" />
                <div className="h-4 w-3/4 bg-muted rounded" />
                <div className="h-4 w-1/2 bg-muted rounded" />
              </div>
            ) : featured ? (
              <>
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={featInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.7, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  className="text-xs uppercase tracking-[0.3em] text-primary"
                >
                  {featured.categories.map(c => c.name).join(" · ") || "Paleta Premium"}
                </motion.div>
                <motion.h3
                  initial={{ opacity: 0, y: 30 }}
                  animate={featInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.8, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  className="font-display text-4xl md:text-5xl uppercase leading-[0.95]"
                >
                  {featured.name}
                </motion.h3>
                {featured.short_description && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={featInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.7, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
                    className="text-muted-foreground text-base leading-relaxed max-w-md prose prose-invert prose-p:text-muted-foreground prose-p:my-1 max-w-none"
                    dangerouslySetInnerHTML={{ __html: featured.short_description }}
                  />
                )}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={featInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.7, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
                  className="flex items-baseline gap-4"
                >
                  <span className="font-display text-4xl text-gold-gradient">
                    {formatPrice(featured.prices)}
                  </span>
                  <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                    {featured.is_in_stock ? "En stock" : "Sin stock"}
                  </span>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={featInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.7, delay: 0.7, ease: [0.16, 1, 0.3, 1] }}
                  className="flex flex-col sm:flex-row gap-3 pt-2"
                >
                  <Link
                    to={`/product/${featured.id}`}
                    className="shimmer-btn group/btn inline-flex items-center justify-center gap-3 bg-primary text-primary-foreground px-8 py-4 text-sm uppercase tracking-[0.2em] font-bold hover:shadow-[0_0_40px_hsl(42_88%_55%/0.4)] transition-all duration-500"
                  >
                    Ver producto
                    <ArrowRight size={16} className="group-hover/btn:translate-x-1.5 transition-transform duration-300" />
                  </Link>
                  <Link
                    to="/store"
                    className="inline-flex items-center justify-center gap-3 border border-border text-foreground px-8 py-4 text-sm uppercase tracking-[0.2em] font-semibold hover:border-primary/50 transition-all duration-500"
                  >
                    Ir a la Tienda
                  </Link>
                </motion.div>
              </>
            ) : (
              <div className="space-y-4">
                <div className="text-xs uppercase tracking-[0.3em] text-primary">Colección 2025</div>
                <h3 className="font-display text-5xl md:text-6xl uppercase leading-[0.95] text-muted-foreground/40">
                  Próximamente
                </h3>
                <p className="text-muted-foreground text-lg leading-relaxed">
                  Nuestra colección estará disponible muy pronto.
                </p>
                <Link
                  to="/store"
                  className="inline-flex items-center gap-3 bg-primary text-primary-foreground px-8 py-4 text-sm uppercase tracking-[0.2em] font-bold hover:bg-primary-glow transition-all"
                >
                  Ver tienda <ArrowRight size={16} />
                </Link>
              </div>
            )}
          </div>
        </motion.div>

        {/* Grid */}
        <div ref={gridRef}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={gridInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="flex items-end justify-between mb-8 border-t border-border pt-10"
          >
            <h3 className="font-display text-3xl md:text-4xl uppercase">Explorar catálogo</h3>
            <Link
              to="/store"
              className="hidden md:inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-primary hover:gap-3 transition-all"
            >
              Ver todo <ArrowRight size={14} />
            </Link>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {isLoading
              ? Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="bg-card border border-border overflow-hidden animate-pulse">
                    <div className="aspect-square bg-muted/50" />
                    <div className="p-5 space-y-3">
                      <div className="h-3 w-20 bg-muted rounded" />
                      <div className="h-5 w-3/4 bg-muted rounded" />
                      <div className="h-4 w-1/3 bg-muted rounded" />
                    </div>
                  </div>
                ))
              : showPlaceholders
              ? Array.from({ length: 3 }).map((_, i) => <EmptyCard key={i} index={i + 1} />)
              : gridProducts.map((p, idx) => (
                  <motion.div
                    key={p.id}
                    custom={idx}
                    initial="hidden"
                    animate={gridInView ? "visible" : "hidden"}
                    variants={cardVariants}
                  >
                    <Link
                      to={`/product/${p.id}`}
                      className="group relative bg-card border border-border hover:border-primary/40 transition-all duration-500 overflow-hidden cursor-pointer block card-glow"
                    >
                      <div className="relative aspect-square overflow-hidden bg-muted">
                        {p.images.length > 0 ? (
                          <img
                            src={p.images[0].src}
                            alt={p.images[0].alt || p.name}
                            loading="lazy"
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-muted-foreground/30">
                            <PackageSearch size={36} strokeWidth={1} />
                          </div>
                        )}
                        {!p.is_in_stock && (
                          <div className="absolute top-4 right-4 bg-foreground text-background text-[10px] uppercase tracking-[0.18em] font-bold px-2.5 py-1.5">
                            Agotado
                          </div>
                        )}
                        {p.categories.some(c => c.name.toLowerCase().includes("personaliz")) && (
                          <div className="absolute top-4 left-4 inline-flex items-center gap-1.5 bg-primary text-primary-foreground text-[10px] uppercase tracking-[0.18em] font-bold px-2.5 py-1.5">
                            <Sparkles size={10} /> Personalizable
                          </div>
                        )}
                        {/* Hover overlay shine */}
                        <div className="absolute inset-0 bg-gradient-to-t from-background/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      </div>
                      <div className="p-5 space-y-2">
                        <div className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground line-clamp-1">
                          {p.categories.map(c => c.name).join(" · ")}
                        </div>
                        <div className="flex flex-col gap-2">
                          <h4 className="font-display text-xl uppercase line-clamp-1">{p.name}</h4>
                          <span className="text-sm text-foreground/80">{formatPrice(p.prices)}</span>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
          </div>

          {/* Mobile Ver todo */}
          <div className="mt-8 flex justify-center md:hidden">
            <Link
              to="/store"
              className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-primary hover:gap-3 transition-all border border-primary px-6 py-3 rounded-sm"
            >
              Ir a la tienda <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};
