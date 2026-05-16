import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Check } from "lucide-react";

const points = [
  "Calidad de Élite: Construcción en carbono 12K/24K y núcleos de EVA.",
  "Catálogo respaldado por jugadores profesionales",
  "Rentabilidad Superior: Márgenes competitivos frente a marcas masivas.",
  "Stock Real: Disponibilidad inmediata y despacho a todo el país.",
];

const pointVariant = {
  hidden: { opacity: 0, x: -30 },
  visible: (i: number) => ({
    opacity: 1, x: 0,
    transition: { duration: 0.7, delay: 0.3 + i * 0.15, ease: [0.16, 1, 0.3, 1] },
  }),
};

export const B2B = () => {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10%" });

  return (
    <section id="b2b" className="relative bg-background py-24 lg:py-32 border-t border-border overflow-hidden">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/[0.02] rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute top-0 inset-x-0 section-divider" />

      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 50 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        className="max-w-7xl mx-auto px-6 lg:px-10 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center"
      >
        <div>
          <motion.div initial={{ opacity: 0, x: -20 }} animate={inView ? { opacity: 1, x: 0 } : {}} transition={{ duration: 0.7, delay: 0.2 }} className="text-xs uppercase tracking-[0.4em] text-primary mb-6">B2B · Mayoristas</motion.div>
          <motion.h2 initial={{ opacity: 0, y: 30 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.8, delay: 0.3 }} className="font-display text-5xl md:text-7xl uppercase leading-[0.92] mb-6">
            Vendé lo que <span className="text-gold-gradient italic">nadie más</span> tiene.
          </motion.h2>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.7, delay: 0.4 }} className="text-muted-foreground text-lg leading-relaxed mb-8">
            VERSUS equipamiento de alta gama para distribuidores.
          </motion.p>
          <motion.a
            initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.7, delay: 0.5 }}
            href="https://wa.me/543512550594?text=Hola!%20Quisiera%20solicitar%20el%20cat%C3%A1logo%20mayorista%20de%20VERSUS."
            target="_blank" rel="noopener noreferrer"
            className="shimmer-btn inline-flex items-center gap-3 bg-primary text-primary-foreground px-8 py-4 text-sm uppercase tracking-[0.2em] font-bold hover:shadow-[0_0_40px_hsl(42_88%_55%/0.4)] transition-all duration-500"
          >
            Solicitar catálogo mayorista
          </motion.a>
        </div>

        <ul className="space-y-5">
          {points.map((pt, i) => (
            <motion.li key={pt} custom={i} initial="hidden" animate={inView ? "visible" : "hidden"} variants={pointVariant}
              className="flex gap-4 border-l-2 border-primary/40 pl-5 py-2 hover:border-primary transition-colors duration-500">
              <motion.div initial={{ scale: 0 }} animate={inView ? { scale: 1 } : {}} transition={{ duration: 0.4, delay: 0.5 + i * 0.15 }}>
                <Check className="text-primary shrink-0 mt-1" size={18} />
              </motion.div>
              <span className="text-foreground/90 leading-relaxed">{pt}</span>
            </motion.li>
          ))}
        </ul>
      </motion.div>
    </section>
  );
};
