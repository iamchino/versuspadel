import racket from "@/assets/racket-custom.jpg";
import { useReveal } from "@/hooks/useReveal";
import { ArrowRight, Sparkles, Star } from "lucide-react";
import { Link } from "react-router-dom";

const featured = {
  name: "VERSUS Boss 24K",
  line: "Diamante · Ataque",
  price: "$ 140.000",
  description:
    "Carbono 24K, núcleo EVA High Memory y balance alto. La paleta definitiva para potenciar tu juego ofensivo.",
};

const products = [
  { name: "VERSUS Eclipse", line: "Edición Limitada", price: "$ 155.000", customizable: true, tag: "Nuevo" },
  { name: "VERSUS Origin", line: "Esencial", price: "$ 120.000", customizable: false, tag: null },
  { name: "VERSUS Atlas", line: "Control", price: "$ 135.000", customizable: true, tag: null },
];

export const Shop = () => {
  const headRef = useReveal<HTMLDivElement>();
  const featRef = useReveal<HTMLDivElement>();
  const gridRef = useReveal<HTMLDivElement>();

  return (
    <section id="shop" className="relative bg-background py-24 lg:py-32">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        {/* Header */}
        <div ref={headRef} className="reveal flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-16">
          <div>
            <div className="text-xs uppercase tracking-[0.4em] text-primary mb-4">Tienda · Colección 2025</div>
            <h2 className="font-display text-6xl md:text-8xl lg:text-9xl uppercase leading-[0.9] text-balance">
              Nuestra <span className="text-gold-gradient italic">colección.</span>
            </h2>
          </div>
          <p className="text-muted-foreground max-w-md text-lg leading-relaxed">
            Descubre nuestra línea completa de paletas. Performance profesional, diseño editorial.
          </p>
        </div>

        {/* Featured hero product */}
        <div
          ref={featRef}
          className="reveal grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 mb-20 lg:mb-28 group"
        >
          <div className="lg:col-span-7 relative aspect-[4/3] lg:aspect-auto lg:min-h-[520px] overflow-hidden bg-muted">
            <img
              src={racket}
              alt={featured.name}
              loading="lazy"
              className="w-full h-full object-cover transition-transform duration-[1500ms] ease-out group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-tr from-background/60 via-transparent to-transparent" />
            <div className="absolute top-6 left-6 inline-flex items-center gap-1.5 bg-primary text-primary-foreground text-[10px] uppercase tracking-[0.2em] font-bold px-3 py-1.5">
              <Star size={10} fill="currentColor" /> Destacado
            </div>
            <div className="absolute bottom-6 left-6 font-display text-[20vw] md:text-[14vw] lg:text-[10rem] leading-none text-foreground/15">
              01
            </div>
          </div>

          <div className="lg:col-span-5 flex flex-col justify-center space-y-6">
            <div className="text-xs uppercase tracking-[0.3em] text-primary">{featured.line}</div>
            <h3 className="font-display text-5xl md:text-6xl lg:text-7xl uppercase leading-[0.95]">
              {featured.name}
            </h3>
            <p className="text-muted-foreground text-lg leading-relaxed max-w-md">
              {featured.description}
            </p>
            <div className="flex items-baseline gap-4">
              <span className="font-display text-4xl text-gold-gradient">{featured.price}</span>
              <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">En tienda web</span>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Link
                to="/store"
                className="group/btn inline-flex items-center justify-center gap-3 bg-primary text-primary-foreground px-8 py-4 text-sm uppercase tracking-[0.2em] font-bold hover:bg-primary-glow transition-all"
              >
                Ir a la Tienda
                <ArrowRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>

        {/* Grid */}
        <div ref={gridRef} className="reveal">
          <div className="flex items-end justify-between mb-8 border-t border-border pt-10">
            <h3 className="font-display text-3xl md:text-4xl uppercase">Explorar catálogo</h3>
            <Link to="/store" className="hidden md:inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-primary hover:gap-3 transition-all">
              Ver todo <ArrowRight size={14} />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((p) => (
              <Link
                to="/store"
                key={p.name}
                className="group relative bg-card border border-border hover:border-primary/40 transition-all duration-500 overflow-hidden cursor-pointer block"
              >
                <div className="relative aspect-square overflow-hidden bg-muted">
                  <img
                    src={racket}
                    alt={p.name}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  {p.tag && (
                    <div className="absolute top-4 right-4 bg-foreground text-background text-[10px] uppercase tracking-[0.18em] font-bold px-2.5 py-1.5">
                      {p.tag}
                    </div>
                  )}
                  {p.customizable && (
                    <div className="absolute top-4 left-4 inline-flex items-center gap-1.5 bg-primary text-primary-foreground text-[10px] uppercase tracking-[0.18em] font-bold px-2.5 py-1.5">
                      <Sparkles size={10} /> Personalizable
                    </div>
                  )}
                </div>
                <div className="p-5 space-y-2">
                  <div className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground line-clamp-1">
                    {p.line}
                  </div>
                  <div className="flex flex-col gap-2">
                    <h4 className="font-display text-xl uppercase line-clamp-1">{p.name}</h4>
                    <span className="text-sm text-foreground/80">{p.price}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
          
          {/* Mobile Ver todo button */}
          <div className="mt-8 flex justify-center md:hidden">
            <Link to="/store" className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-primary hover:gap-3 transition-all border border-primary px-6 py-3 rounded-sm">
              Ir a la tienda <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};
