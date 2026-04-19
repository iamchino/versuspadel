import { useReveal } from "@/hooks/useReveal";
import { Check } from "lucide-react";

const points = [
  "Calidad de Élite: Construcción en carbono 12K/24K y núcleos de EVA.",
  "Catálogo respaldado por jugadores profesionales",
  "Rentabilidad Superior: Márgenes competitivos frente a marcas masivas.",
  "Stock Real: Disponibilidad inmediata y despacho a todo el país.",
];

export const B2B = () => {
  const ref = useReveal<HTMLDivElement>();
  return (
    <section id="b2b" className="relative bg-background py-24 lg:py-32 border-t border-border">
      <div ref={ref} className="reveal max-w-7xl mx-auto px-6 lg:px-10 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <div>
          <div className="text-xs uppercase tracking-[0.4em] text-primary mb-6">B2B · Mayoristas</div>
          <h2 className="font-display text-5xl md:text-7xl uppercase leading-[0.92] mb-6">
            Vendé lo que <span className="text-gold-gradient italic">nadie más</span> tiene.
          </h2>
          <p className="text-muted-foreground text-lg leading-relaxed mb-8">
            VERSUS equipamiento de alta gama para distribuidores.
          </p>
          <a
            href="https://wa.me/1234567890?text=Hola!%20Quisiera%20solicitar%20el%20cat%C3%A1logo%20mayorista%20de%20VERSUS."
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 bg-primary text-primary-foreground px-8 py-4 text-sm uppercase tracking-[0.2em] font-bold hover:bg-primary-glow transition-all"
          >
            Solicitar catálogo mayorista
          </a>
        </div>

        <ul className="space-y-5">
          {points.map((pt) => (
            <li key={pt} className="flex gap-4 border-l-2 border-primary/40 pl-5 py-2">
              <Check className="text-primary shrink-0 mt-1" size={18} />
              <span className="text-foreground/90 leading-relaxed">{pt}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};
