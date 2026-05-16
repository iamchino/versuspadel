import { useRef } from "react";
import { motion, useScroll, useTransform, useInView } from "framer-motion";
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
  { src: imgDibu, alt: "Dibu Martínez con paleta VERSUS personalizada", label: "Dibu Martínez", pos: "center top" },
  { src: imgMr11, alt: "Maxi Rodríguez con paleta VERSUS MR11", label: "Maxi Rodríguez", pos: "center 40%" },
  { src: imgDiMaria, alt: "Di María con paleta VERSUS personalizada", label: "Di María", pos: "center top" },
  { src: imgVert1, alt: "Jugador con paleta VERSUS personalizada", label: "Kily González", pos: "center top" },
  { src: imgVert3, alt: "Jugador con paleta VERSUS personalizada", label: "Coronel y Santi Lopez", pos: "center 30%" },
  { src: imgLavezzi, alt: "Pocho Lavezzi con paleta VERSUS", label: "Pocho Lavezzi", pos: "center center" },
  { src: imgVert2, alt: "Jugador con paleta VERSUS personalizada", label: "Alejo Veliz", pos: "center 30%" },
  { src: imgGustavo, alt: "Gustavo Lietti con paleta VERSUS", label: "Gustavo Lietti", pos: "center 25%" },
];

const stepVariant = {
  hidden: { opacity: 0, y: 40 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, delay: i * 0.2, ease: [0.16, 1, 0.3, 1] },
  }),
};

const imgVariant = {
  hidden: { opacity: 0, scale: 0.92 },
  visible: (i: number) => ({
    opacity: 1,
    scale: 1,
    transition: { duration: 0.9, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] },
  }),
};

export const CustomFlow = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const headRef = useRef<HTMLDivElement>(null);
  const galleryRef = useRef<HTMLDivElement>(null);
  const stepsRef = useRef<HTMLDivElement>(null);

  const headInView = useInView(headRef, { once: true, margin: "-10%" });
  const galleryInView = useInView(galleryRef, { once: true, margin: "-5%" });
  const stepsInView = useInView(stepsRef, { once: true, margin: "-10%" });

  // Parallax for the gallery images at different speeds
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start end", "end start"] });
  const parallax1 = useTransform(scrollYProgress, [0, 1], ["0%", "-6%"]);
  const parallax2 = useTransform(scrollYProgress, [0, 1], ["0%", "-10%"]);
  const parallax3 = useTransform(scrollYProgress, [0, 1], ["0%", "-4%"]);

  const parallaxMap = [parallax1, parallax2, parallax3, parallax1, parallax2, parallax3, parallax1, parallax2];

  return (
    <section ref={sectionRef} id="custom" className="relative bg-secondary py-24 lg:py-32 border-t border-border overflow-hidden">
      <div className="absolute inset-0 grain" />

      {/* Decorative radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/[0.03] rounded-full blur-[120px] pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-6 lg:px-10">
        <motion.div
          ref={headRef}
          initial={{ opacity: 0, y: 50 }}
          animate={headInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-4xl mb-16"
        >
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={headInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="text-xs uppercase tracking-[0.4em] text-primary mb-6"
          >
            Personalización
          </motion.div>
          <h2 className="font-display text-5xl md:text-7xl lg:text-8xl uppercase leading-[0.92] mb-8">
            <span className="text-gold-gradient italic">Creada por vos</span>
          </h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={headInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="text-muted-foreground text-lg leading-relaxed max-w-2xl"
          >
            Llevamos la personalización al siguiente nivel. Configurá el peso exacto, balance y estética de tu pala con materiales de alta gama. Un equipo diseñado por vos, con estándares de calidad.
          </motion.p>
        </motion.div>

        {/* Galería asimétrica — con parallax en cada imagen */}
        <div ref={galleryRef} className="mb-20">
          <div className="grid grid-cols-2 md:grid-cols-12 gap-3 md:gap-4 auto-rows-[200px] md:auto-rows-[220px] lg:auto-rows-[260px]">

            {/* Fila 1: Dibu (hero grande) + Maxi Rodríguez */}
            <motion.div
              custom={0}
              initial="hidden"
              animate={galleryInView ? "visible" : "hidden"}
              variants={imgVariant}
              className="col-span-2 md:col-span-7 row-span-2 relative bg-card border border-border group overflow-hidden rounded-xl"
            >
              <motion.div className="absolute inset-0" style={{ y: parallaxMap[0] }}>
                <img src={galleryImages[0].src} alt={galleryImages[0].alt} style={{ objectPosition: galleryImages[0].pos }} className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105" loading="lazy" decoding="async" />
              </motion.div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out">
                <span className="text-xs uppercase tracking-[0.3em] text-primary font-semibold">{galleryImages[0].label}</span>
              </div>
              <div className="absolute top-3 left-3 md:top-4 md:left-4">
                <span className="text-[10px] uppercase tracking-[0.3em] bg-primary/90 text-primary-foreground px-3 py-1 font-bold backdrop-blur-sm">Custom</span>
              </div>
            </motion.div>

            <motion.div custom={1} initial="hidden" animate={galleryInView ? "visible" : "hidden"} variants={imgVariant}
              className="col-span-1 md:col-span-5 row-span-2 relative bg-card border border-border group overflow-hidden rounded-xl">
              <motion.div className="absolute inset-0" style={{ y: parallaxMap[1] }}>
                <img src={galleryImages[1].src} alt={galleryImages[1].alt} style={{ objectPosition: galleryImages[1].pos }} className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105" loading="lazy" decoding="async" />
              </motion.div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out">
                <span className="text-xs uppercase tracking-[0.3em] text-primary font-semibold">{galleryImages[1].label}</span>
              </div>
            </motion.div>

            {/* Fila 2: Di María + Vert1 + Vert3 */}
            {[2, 3, 4].map((idx) => (
              <motion.div key={idx} custom={idx} initial="hidden" animate={galleryInView ? "visible" : "hidden"} variants={imgVariant}
                className="col-span-1 md:col-span-4 row-span-2 relative bg-card border border-border group overflow-hidden rounded-xl">
                <motion.div className="absolute inset-0" style={{ y: parallaxMap[idx] }}>
                  <img src={galleryImages[idx].src} alt={galleryImages[idx].alt} style={{ objectPosition: galleryImages[idx].pos }} className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105" loading="lazy" decoding="async" />
                </motion.div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out">
                  <span className="text-xs uppercase tracking-[0.3em] text-primary font-semibold">{galleryImages[idx].label}</span>
                </div>
              </motion.div>
            ))}

            {/* Fila 3: Lavezzi + Alejo Veliz + Gustavo Lietti */}
            {[5, 6, 7].map((idx) => (
              <motion.div key={idx} custom={idx} initial="hidden" animate={galleryInView ? "visible" : "hidden"} variants={imgVariant}
                className="col-span-1 md:col-span-4 row-span-2 relative bg-card border border-border group overflow-hidden rounded-xl">
                <motion.div className="absolute inset-0" style={{ y: parallaxMap[idx] }}>
                  <img src={galleryImages[idx].src} alt={galleryImages[idx].alt} style={{ objectPosition: galleryImages[idx].pos }} className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105" loading="lazy" decoding="async" />
                </motion.div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out">
                  <span className="text-xs uppercase tracking-[0.3em] text-primary font-semibold">{galleryImages[idx].label}</span>
                </div>
              </motion.div>
            ))}

          </div>
        </div>

        <div ref={stepsRef} className="grid grid-cols-1 md:grid-cols-3 gap-px bg-border">
          {steps.map((s, i) => (
            <motion.div
              key={s.n}
              custom={i}
              initial="hidden"
              animate={stepsInView ? "visible" : "hidden"}
              variants={stepVariant}
              className="bg-secondary p-8 lg:p-10 group hover:bg-card transition-colors duration-500"
            >
              <div className="font-display text-6xl text-gold-gradient mb-6">{s.n}</div>
              <h3 className="font-display text-2xl uppercase mb-3">{s.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{s.desc}</p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={stepsInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="mt-16 flex flex-col sm:flex-row gap-4"
        >
          <a
            href="https://wa.me/543417534534?text=Hola!%20Me%20interesa%20personalizar%20una%20paleta%20VERSUS."
            target="_blank"
            rel="noopener noreferrer"
            className="shimmer-btn group inline-flex items-center justify-center gap-3 bg-primary text-primary-foreground px-8 py-4 text-sm uppercase tracking-[0.2em] font-bold hover:shadow-[0_0_40px_hsl(42_88%_55%/0.4)] transition-all duration-500"
          >
            Empezar diseño
            <ArrowRight size={16} className="group-hover:translate-x-1.5 transition-transform duration-300" />
          </a>
        </motion.div>
      </div>
    </section>
  );
};
