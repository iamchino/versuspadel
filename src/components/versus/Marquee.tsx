import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

const phrases = [
  "Piezas únicas",
  "Hecho a medida",
  "Envíos gratis a todo el país",
  "Performance pro",
  "Identidad propia",
  "Edición limitada",
];

export const Marquee = () => {
  const items = [...phrases, ...phrases, ...phrases, ...phrases];
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  // Parallax shift — marquee slides left as you scroll
  const x = useTransform(scrollYProgress, [0, 1], ["0%", "-8%"]);

  return (
    <div ref={ref} className="relative border-y border-border bg-background py-6 overflow-hidden" style={{ touchAction: "pan-y" }}>
      {/* Subtle gold glow behind */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/[0.03] to-transparent pointer-events-none" />
      <motion.div style={{ x }} className="flex animate-marquee whitespace-nowrap" aria-hidden>
        {items.map((p, i) => (
          <span
            key={i}
            className="font-display text-3xl md:text-5xl uppercase tracking-tight px-8 text-foreground/80"
          >
            {p}
            <span className="inline-block mx-8 text-primary">✦</span>
          </span>
        ))}
      </motion.div>
    </div>
  );
};
