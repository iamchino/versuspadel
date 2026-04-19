import { Navbar } from "@/components/versus/Navbar";
import { Footer } from "@/components/versus/Footer";

const Index = () => {
  return (
    <main className="min-h-screen bg-background text-foreground flex flex-col">
      <Navbar />
      <h1 className="sr-only">VERSUS Pádel — Paletas personalizadas de élite</h1>
      
      <div className="flex-1 flex flex-col items-center justify-center py-32 px-6 text-center mt-24">
        <div className="animate-fade-in-up">
          <div className="inline-block text-xs uppercase tracking-[0.4em] text-primary mb-8 border border-primary/30 px-4 py-2 rounded-full bg-primary/5 backdrop-blur-sm">
            Sitio en construcción
          </div>
          <h2 className="font-display text-5xl sm:text-6xl md:text-[7vw] lg:text-[7rem] leading-tight md:leading-[0.9] uppercase text-balance mb-8">
            Próxima<span className="text-gold-gradient italic">mente</span>
          </h2>
          <p className="max-w-xl mx-auto text-base md:text-lg text-muted-foreground leading-relaxed">
            Estamos preparando la nueva plataforma VERSUS. Equipamiento de élite para jugadores exigentes. Dejanos tu email o contáctanos para ser el primero en enterarte.
          </p>
        </div>
      </div>

      <Footer />
    </main>
  );
};

export default Index;
