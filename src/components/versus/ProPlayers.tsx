import { useRef } from "react";
import { motion, useInView, useScroll, useTransform } from "framer-motion";
import barruffaldi from "@/assets/2025-TEAMVERSUS-BARRUFFALDI.jpg";
import bellocchio from "@/assets/2025-TEAMVERSUS-BELLOCCHIO.jpg";
import arce from "@/assets/2025-TEAMVERSUS-CRISTIAN-ARCE.jpg";
import garri from "@/assets/2025-TEAMVERSUS-IVAN-GARRI.jpg";
import dametto from "@/assets/2025-TEAMVERSUS-NICO-DAMETTO.jpg";
import villacorta from "@/assets/2025-TEAMVERSUS-RAUIL-VILLACORTA.jpg";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

type Ambassador = { name: string; role: string; image: string };

const ambassadors: Ambassador[] = [
  { name: "Barruffaldi", role: "Team VERSUS 2025", image: barruffaldi },
  { name: "Bellocchio", role: "Team VERSUS 2025", image: bellocchio },
  { name: "Cristian Arce", role: "Team VERSUS 2025", image: arce },
  { name: "Ivan Garri", role: "Team VERSUS 2025", image: garri },
  { name: "Nico Dametto", role: "Team VERSUS 2025", image: dametto },
  { name: "Rauil Villacorta", role: "Team VERSUS 2025", image: villacorta },
];

export const ProPlayers = () => {
  const headRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement>(null);

  const headInView = useInView(headRef, { once: true, margin: "-10%" });
  const gridInView = useInView(gridRef, { once: true, margin: "-5%" });

  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start end", "end start"] });
  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "-5%"]);

  return (
    <section ref={sectionRef} id="pro" className="relative bg-secondary py-20 lg:py-28 border-t border-border overflow-hidden">
      <div className="absolute inset-0 grain opacity-50" />
      <motion.div className="absolute inset-[-5%] bg-gradient-to-b from-primary/[0.02] to-transparent pointer-events-none" style={{ y: bgY }} />

      <div className="relative max-w-7xl mx-auto px-6 lg:px-10">
        <motion.div
          ref={headRef}
          initial={{ opacity: 0, y: 50 }}
          animate={headInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-3xl mb-14"
        >
          <motion.div initial={{ opacity: 0, x: -20 }} animate={headInView ? { opacity: 1, x: 0 } : {}} transition={{ duration: 0.7, delay: 0.2 }}
            className="text-xs uppercase tracking-[0.4em] text-primary mb-5">Team VERSUS</motion.div>
          <h2 className="font-display text-4xl sm:text-5xl md:text-7xl uppercase leading-tight md:leading-[0.95] text-balance">
            Los que ya juegan con <span className="text-gold-gradient italic">VERSUS.</span>
          </h2>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={headInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.8, delay: 0.4 }}
            className="mt-6 text-muted-foreground text-lg leading-relaxed">
            Figuras del deporte que recibieron su paleta VERSUS y la hicieron parte de su juego.
          </motion.p>
        </motion.div>

        <motion.div
          ref={gridRef}
          initial={{ opacity: 0, y: 40 }}
          animate={gridInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        >
          <Carousel opts={{ align: "start", loop: true }} className="w-full">
            <CarouselContent className="-ml-2 md:-ml-4">
              {ambassadors.map((a, i) => (
                <CarouselItem key={a.name} className="pl-2 md:pl-4 basis-full md:basis-1/3">
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={gridInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.8, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
                    className="group relative aspect-[4/5] overflow-hidden bg-muted"
                  >
                    <img
                      src={a.image}
                      alt={`${a.name} con paleta VERSUS`}
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />
                    <div className="absolute bottom-5 left-5 right-5">
                      <div className="text-[10px] uppercase tracking-[0.3em] text-primary mb-1.5">{a.role}</div>
                      <div className="font-display text-2xl md:text-3xl uppercase leading-tight">{a.name}</div>
                    </div>
                  </motion.div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <div className="hidden md:block">
              <CarouselPrevious className="-left-12 bg-background border-border hover:bg-muted" />
              <CarouselNext className="-right-12 bg-background border-border hover:bg-muted" />
            </div>
          </Carousel>
        </motion.div>
      </div>
    </section>
  );
};
