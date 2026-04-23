import { Navbar } from "@/components/versus/Navbar";
import { Footer } from "@/components/versus/Footer";
import { CustomFlow } from "@/components/versus/CustomFlow";
import heroImg from "@/assets/hero2.jpg";

const Index = () => {
  return (
    <main className="min-h-screen bg-background text-foreground flex flex-col">
      <Navbar />
      <h1 className="sr-only">VERSUS Pádel — Paletas personalizadas de élite</h1>

      <section className="relative flex-1 min-h-[80vh] flex flex-col items-center justify-center py-32 px-6 text-center w-full overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={heroImg}
            alt="Versus Padel Background"
            width={1600}
            height={1024}
            className="w-full h-full object-cover ken-burns opacity-40 mix-blend-luminosity"
          />
          <div className="absolute inset-0 hero-overlay bg-black/40" />
          <div className="absolute inset-0 bg-gradient-to-b from-background/50 via-transparent to-background" />
        </div>

        <div className="relative z-10 animate-fade-in-up mt-20">
          <div className="inline-block text-xs uppercase tracking-[0.4em] text-primary mb-8 border border-primary/30 px-4 py-2 rounded-full bg-primary/5 backdrop-blur-sm">
            Sitio en construcción
          </div>
          <h2 className="font-display text-5xl sm:text-6xl md:text-[7vw] lg:text-[7rem] leading-tight md:leading-[0.9] uppercase text-balance mb-8">
            <span className="text-white">Próxima</span><span className="text-gold-gradient">mente</span>
          </h2>
          <p className="max-w-xl mx-auto text-base md:text-lg text-muted-foreground leading-relaxed">
            Estamos preparando la nueva plataforma VERSUS. Equipamiento de élite para jugadores exigentes. Contáctanos para ser el primero en enterarte.
          </p>
          <div className="mt-10 flex justify-center">
            <a
              href="http://wa.me/543412694610"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-8 py-4 text-sm uppercase tracking-[0.2em] font-bold hover:bg-primary-glow transition-all"
            >
              Contactar por WhatsApp
            </a>
          </div>
        </div>
      </section>

      <CustomFlow />

      <Footer />
    </main>
  );
};

export default Index;
