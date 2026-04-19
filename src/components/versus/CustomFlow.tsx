import { useReveal } from "@/hooks/useReveal";
import { ArrowRight, ImagePlus } from "lucide-react";

const steps = [
  { n: "01", title: "Elegís base", desc: "Seleccioná el modelo que se adapta a tu juego." },
  { n: "02", title: "Personalizás diseño", desc: "Color, gráfica, iniciales, todo es tuyo." },
  { n: "03", title: "Creamos tu pieza única", desc: "La fabricamos a mano, exclusivamente para vos." },
];

export const CustomFlow = () => {
  const headRef = useReveal<HTMLDivElement>();
  const stepsRef = useReveal<HTMLDivElement>();
  const galleryRef = useReveal<HTMLDivElement>();

  return (
    <section id="custom" className="relative bg-secondary py-24 lg:py-32 border-t border-border overflow-hidden">
      <div className="absolute inset-0 grain" />
      <div className="relative max-w-7xl mx-auto px-6 lg:px-10">
        <div ref={headRef} className="reveal max-w-4xl mb-16">
          <div className="text-xs uppercase tracking-[0.4em] text-primary mb-6">Personalización</div>
          <h2 className="font-display text-5xl md:text-7xl lg:text-8xl uppercase leading-[0.92] mb-8">
            <span className="text-gold-gradient italic">Creada por vos</span>
          </h2>
          <p className="text-muted-foreground text-lg leading-relaxed max-w-2xl">
            Llevamos la personalización al siguiente nivel. Configurá el peso exacto, balance y estética de tu pala con materiales de alta gama. Un equipo diseñado por vos, con estándares de calidad.
          </p>
        </div>

        {/* Galería de imágenes asimétrica */}
        <div ref={galleryRef} className="reveal mb-20">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            {/* Imagen 1: Principal, más grande */}
            <div className="md:col-span-7 aspect-[4/3] relative bg-card border border-border group overflow-hidden flex flex-col items-center justify-center text-muted-foreground hover:border-primary/50 transition-colors">
              <ImagePlus size={48} className="mb-4 opacity-50 group-hover:scale-110 transition-transform duration-500 group-hover:text-primary" />
              <div className="text-xs uppercase tracking-[0.2em] font-semibold text-foreground/80">Imagen Principal</div>
              <div className="text-[10px] uppercase tracking-widest mt-1 opacity-60">Recomendado: 4:3 Horizontal</div>
              {/* Cuando tengas la imagen, descomenta esto y borra lo de arriba:
              <img src="/assets/tu-imagen-1.jpg" alt="Detalle" className="absolute inset-0 w-full h-full object-cover" />
              */}
            </div>

            {/* Columna derecha con 3 imágenes */}
            <div className="md:col-span-5 grid grid-rows-2 gap-4">
              {/* Imagen 2: Horizontal ancha */}
              <div className="relative bg-card border border-border group overflow-hidden flex flex-col items-center justify-center text-muted-foreground hover:border-primary/50 transition-colors">
                <ImagePlus size={32} className="mb-2 opacity-50 group-hover:scale-110 transition-transform duration-500 group-hover:text-primary" />
                <div className="text-[10px] uppercase tracking-[0.2em] font-semibold text-foreground/80">Detalle Textura</div>
                {/* <img src="/assets/tu-imagen-2.jpg" alt="Textura" className="absolute inset-0 w-full h-full object-cover" /> */}
              </div>

              {/* Fila inferior con 2 imágenes cuadradas */}
              <div className="grid grid-cols-2 gap-4">
                {/* Imagen 3 */}
                <div className="aspect-square relative bg-card border border-border group overflow-hidden flex flex-col items-center justify-center text-muted-foreground hover:border-primary/50 transition-colors">
                  <ImagePlus size={24} className="mb-2 opacity-50 group-hover:scale-110 transition-transform duration-500 group-hover:text-primary" />
                  <div className="text-[9px] uppercase tracking-[0.2em] font-semibold text-foreground/80 text-center px-2">Canto / Grip</div>
                  {/* <img src="/assets/tu-imagen-3.jpg" alt="Grip" className="absolute inset-0 w-full h-full object-cover" /> */}
                </div>

                {/* Imagen 4 */}
                <div className="aspect-square relative bg-card border border-border group overflow-hidden flex flex-col items-center justify-center text-muted-foreground hover:border-primary/50 transition-colors">
                  <ImagePlus size={24} className="mb-2 opacity-50 group-hover:scale-110 transition-transform duration-500 group-hover:text-primary" />
                  <div className="text-[9px] uppercase tracking-[0.2em] font-semibold text-foreground/80 text-center px-2">Jugador</div>
                  {/* <img src="/assets/tu-imagen-4.jpg" alt="Acción" className="absolute inset-0 w-full h-full object-cover" /> */}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div ref={stepsRef} className="reveal grid grid-cols-1 md:grid-cols-3 gap-px bg-border">
          {steps.map((s) => (
            <div key={s.n} className="bg-secondary p-8 lg:p-10 group hover:bg-card transition-colors duration-500">
              <div className="font-display text-6xl text-gold-gradient mb-6">{s.n}</div>
              <h3 className="font-display text-2xl uppercase mb-3">{s.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-16 flex flex-col sm:flex-row gap-4">
          <a
            href="https://wa.me/1234567890?text=Hola!%20Me%20interesa%20personalizar%20una%20paleta%20VERSUS%20de%20%C3%A9lite."
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center justify-center gap-3 bg-primary text-primary-foreground px-8 py-4 text-sm uppercase tracking-[0.2em] font-bold hover:bg-primary-glow transition-all"
          >
            Empezar diseño
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </a>
        </div>
      </div>
    </section>
  );
};
