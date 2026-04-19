import heroImg from "@/assets/Leyendnegras.jpg";
import { ArrowRight, Sparkles } from "lucide-react";

export const Hero = () => {
  return (
    <section className="relative h-screen min-h-[720px] w-full overflow-hidden bg-background">
      <div className="absolute inset-0">
        <img
          src={heroImg}
          alt="Jugador profesional con paleta personalizada VERSUS"
          width={1600}
          height={1024}
          className="w-full h-full object-cover ken-burns opacity-90"
        />
        <div className="absolute inset-0 hero-overlay" />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/40 to-transparent" />
      </div>

      <div className="relative z-10 h-full max-w-7xl mx-auto px-6 lg:px-10 flex flex-col justify-end pb-24 lg:pb-32">
        <div className="max-w-4xl animate-fade-in-up">
          <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-primary mb-8 border border-primary/30 px-4 py-2 rounded-full bg-primary/5 backdrop-blur-sm">
            <Sparkles size={12} /> Edición exclusiva 2026
          </div>

          <h1 className="font-display text-5xl sm:text-6xl md:text-[7vw] lg:text-[7rem] leading-tight md:leading-[0.9] uppercase text-balance">
            Paletas que
            <br />
            <span className="text-gold-gradient italic">marcan</span> la cancha.
          </h1>

          <p className="mt-8 max-w-xl text-base md:text-lg text-muted-foreground leading-relaxed">
            Paletas de alto rendimiento. Descubrí la colección VERSUS 2026.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row gap-4">
            <a
              href="#shop"
              className="group inline-flex items-center justify-center gap-3 bg-primary text-primary-foreground px-8 py-4 text-sm uppercase tracking-[0.2em] font-bold hover:bg-primary-glow transition-all"
            >
              Ver la colección
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </a>
            <a
              href="#custom"
              className="group inline-flex items-center justify-center gap-3 border border-foreground/30 text-foreground px-8 py-4 text-sm uppercase tracking-[0.2em] font-bold hover:border-primary hover:text-primary transition-all backdrop-blur-sm"
            >
              Personalizar
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </a>
          </div>
        </div>
      </div>

      {/* scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 hidden md:flex flex-col items-center gap-3 text-[10px] uppercase tracking-[0.4em] text-muted-foreground">
        Scroll
        <div className="w-px h-12 bg-gradient-to-b from-foreground/60 to-transparent" />
      </div>
    </section>
  );
};
