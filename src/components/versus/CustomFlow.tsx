import { useReveal } from "@/hooks/useReveal";
import { ArrowRight } from "lucide-react";

import imgDibu from "@/assets/VDibu1.jpg";
import imgDiMaria from "@/assets/VDiMaria.jpg";
import imgVert1 from "@/assets/Vert1.jpg";
import imgVert2 from "@/assets/Vert2.jpg";
import imgVert3 from "@/assets/vert3.jpg";
import imgLavezzi from "@/assets/Vlavezzi.jpg";
import imgMr11 from "@/assets/VMr11.jpg";
import imgGustavo from "@/assets/gustavolietti.jpeg";

const steps = [
  { n: "01", title: "Elegís base", desc: "Seleccioná el modelo que se adapta a tu juego." },
  { n: "02", title: "Personalizás diseño", desc: "Color, gráfica, iniciales, todo es tuyo." },
  { n: "03", title: "Creamos tu pieza única", desc: "La fabricamos a mano, exclusivamente para vos." },
];

const galleryImages = [
  { src: imgDibu, alt: "Dibu Martínez con paleta VERSUS personalizada", label: "Dibu Martínez" },
  { src: imgMr11, alt: "Maxi Rodríguez con paleta VERSUS MR11", label: "Maxi Rodríguez" },
  { src: imgDiMaria, alt: "Di María con paleta VERSUS personalizada", label: "Di María" },
  { src: imgVert1, alt: "Jugador con paleta VERSUS personalizada", label: "Kily González" },
  { src: imgVert3, alt: "Jugador con paleta VERSUS personalizada", label: "Coronel y Santi Lopez" },
  { src: imgLavezzi, alt: "Pocho Lavezzi con paleta VERSUS", label: "Pocho Lavezzi" },
  { src: imgVert2, alt: "Jugador con paleta VERSUS personalizada", label: "Alejo Veliz" },
  { src: imgGustavo, alt: "Gustavo Lietti con paleta VERSUS", label: "Gustavo Lietti" },
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

        {/* Galería asimétrica — 7 imágenes */}
        <div ref={galleryRef} className="reveal mb-20">
          <div className="grid grid-cols-2 md:grid-cols-12 gap-3 md:gap-4 auto-rows-[200px] md:auto-rows-[220px] lg:auto-rows-[260px]">

            {/* Fila 1: Dibu (hero grande) + Maxi Rodríguez */}
            <div className="col-span-2 md:col-span-7 row-span-2 relative bg-card border border-border group overflow-hidden rounded-xl">
              <img
                src={galleryImages[0].src}
                alt={galleryImages[0].alt}
                className="absolute inset-0 w-full h-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out">
                <span className="text-xs uppercase tracking-[0.3em] text-primary font-semibold">{galleryImages[0].label}</span>
              </div>
              <div className="absolute top-3 left-3 md:top-4 md:left-4">
                <span className="text-[10px] uppercase tracking-[0.3em] bg-primary/90 text-primary-foreground px-3 py-1 font-bold backdrop-blur-sm">Custom</span>
              </div>
            </div>

            <div className="col-span-1 md:col-span-5 row-span-2 relative bg-card border border-border group overflow-hidden rounded-xl">
              <img
                src={galleryImages[1].src}
                alt={galleryImages[1].alt}
                className="absolute inset-0 w-full h-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out">
                <span className="text-xs uppercase tracking-[0.3em] text-primary font-semibold">{galleryImages[1].label}</span>
              </div>
            </div>

            {/* Fila 2: Di María + Vert1 + Vert3 */}
            <div className="col-span-1 md:col-span-4 row-span-2 relative bg-card border border-border group overflow-hidden rounded-xl">
              <img
                src={galleryImages[2].src}
                alt={galleryImages[2].alt}
                className="absolute inset-0 w-full h-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out">
                <span className="text-xs uppercase tracking-[0.3em] text-primary font-semibold">{galleryImages[2].label}</span>
              </div>
            </div>

            <div className="col-span-1 md:col-span-4 row-span-2 relative bg-card border border-border group overflow-hidden rounded-xl">
              <img
                src={galleryImages[3].src}
                alt={galleryImages[3].alt}
                className="absolute inset-0 w-full h-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out">
                <span className="text-xs uppercase tracking-[0.3em] text-primary font-semibold">{galleryImages[3].label}</span>
              </div>
            </div>

            <div className="col-span-1 md:col-span-4 row-span-2 relative bg-card border border-border group overflow-hidden rounded-xl">
              <img
                src={galleryImages[4].src}
                alt={galleryImages[4].alt}
                className="absolute inset-0 w-full h-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out">
                <span className="text-xs uppercase tracking-[0.3em] text-primary font-semibold">{galleryImages[4].label}</span>
              </div>
            </div>

            {/* Fila 3: Lavezzi + Kily Gonzalez + Gustavo Lietti */}
            <div className="col-span-1 md:col-span-4 row-span-2 relative bg-card border border-border group overflow-hidden rounded-xl">
              <img
                src={galleryImages[5].src}
                alt={galleryImages[5].alt}
                className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out">
                <span className="text-xs uppercase tracking-[0.3em] text-primary font-semibold">{galleryImages[5].label}</span>
              </div>
            </div>

            <div className="col-span-1 md:col-span-4 row-span-2 relative bg-card border border-border group overflow-hidden rounded-xl">
              <img
                src={galleryImages[6].src}
                alt={galleryImages[6].alt}
                className="absolute inset-0 w-full h-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out">
                <span className="text-xs uppercase tracking-[0.3em] text-primary font-semibold">{galleryImages[6].label}</span>
              </div>
            </div>

            <div className="col-span-1 md:col-span-4 row-span-2 relative bg-card border border-border group overflow-hidden rounded-xl">
              <img
                src={galleryImages[7].src}
                alt={galleryImages[7].alt}
                className="absolute inset-0 w-full h-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out">
                <span className="text-xs uppercase tracking-[0.3em] text-primary font-semibold">{galleryImages[7].label}</span>
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
            href="https://wa.me/543412694610?text=Hola!%20Me%20interesa%20personalizar%20una%20paleta%20VERSUS%20de%20%C3%A9lite."
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
