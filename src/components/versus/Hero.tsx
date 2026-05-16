import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import heroImg from "@/assets/hero2.jpg";
import { ArrowRight, Sparkles, Truck } from "lucide-react";
import { Link } from "react-router-dom";

const wordReveal = {
  hidden: {},
  visible: (i: number) => ({
    y: "0%",
    rotateX: 0,
    opacity: 1,
    transition: { duration: 1, delay: 0.5 + i * 0.08, ease: [0.16, 1, 0.3, 1] },
  }),
};

export const Hero = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "35%"]);
  const bgScale = useTransform(scrollYProgress, [0, 1], [1.05, 1.25]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.55], [1, 0]);
  const contentY = useTransform(scrollYProgress, [0, 0.55], ["0%", "12%"]);

  const line1 = ["Paletas", "que"];
  const line2 = ["marcan", "la", "cancha."];

  return (
    <section ref={sectionRef} className="relative h-screen min-h-[720px] w-full overflow-hidden bg-background">
      {/* Parallax background */}
      <motion.div className="absolute inset-[-10%] parallax-layer" style={{ y: bgY, scale: bgScale }}>
        <img
          src={heroImg}
          alt="Jugador profesional con paleta personalizada VERSUS"
          width={1600}
          height={1024}
          className="w-full h-full object-cover opacity-40 mix-blend-luminosity"
        />
        <div className="absolute inset-0 hero-overlay bg-black/40" />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/40 to-transparent" />
      </motion.div>

      {/* Content — fades out on scroll */}
      <motion.div
        style={{ opacity: contentOpacity, y: contentY }}
        className="relative z-10 h-full max-w-7xl mx-auto px-6 lg:px-10 flex flex-col justify-end pb-24 lg:pb-32"
      >
        <div className="max-w-4xl" style={{ perspective: "800px" }}>
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, x: -30, filter: "blur(8px)" }}
            animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.9, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-primary mb-8 border border-primary/30 px-4 py-2 rounded-full bg-primary/5 backdrop-blur-sm"
          >
            <Sparkles size={12} /> Edición exclusiva 2026
          </motion.div>

          {/* Title — word by word reveal */}
          <h1 className="font-display text-5xl sm:text-6xl md:text-[7vw] lg:text-[7rem] leading-tight md:leading-[0.9] uppercase">
            <span className="block overflow-hidden">
              {line1.map((word, i) => (
                <motion.span
                  key={word}
                  className="inline-block mr-[0.22em]"
                  initial={{ y: "120%", rotateX: -60, opacity: 0 }}
                  animate="visible"
                  custom={i}
                  variants={wordReveal}
                >
                  {word}
                </motion.span>
              ))}
            </span>
            <span className="block overflow-hidden">
              {line2.map((word, i) => (
                <motion.span
                  key={word}
                  className={`inline-block mr-[0.22em] ${i === 0 ? "text-gold-gradient italic pr-2" : ""}`}
                  initial={{ y: "120%", rotateX: -60, opacity: 0 }}
                  animate="visible"
                  custom={i + line1.length}
                  variants={wordReveal}
                >
                  {word}
                </motion.span>
              ))}
            </span>
          </h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 24, filter: "blur(6px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.9, delay: 1.1, ease: [0.16, 1, 0.3, 1] }}
            className="mt-8 max-w-xl text-base md:text-lg text-muted-foreground leading-relaxed"
          >
            Paletas de alto rendimiento. Descubrí la colección VERSUS 2026.
          </motion.p>

          {/* Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 1.35, ease: [0.16, 1, 0.3, 1] }}
            className="mt-10 flex flex-col sm:flex-row gap-4"
          >
            <Link
              to="/store"
              className="shimmer-btn group inline-flex items-center justify-center gap-3 bg-primary text-primary-foreground px-8 py-4 text-sm uppercase tracking-[0.2em] font-bold hover:shadow-[0_0_40px_hsl(42_88%_55%/0.4)] transition-all duration-500"
            >
              Ver la colección
              <ArrowRight size={16} className="group-hover:translate-x-1.5 transition-transform duration-300" />
            </Link>
            <a
              href="#custom"
              className="group inline-flex items-center justify-center gap-3 border border-foreground/30 text-foreground px-8 py-4 text-sm uppercase tracking-[0.2em] font-bold hover:border-primary hover:text-primary transition-all duration-500 backdrop-blur-sm"
            >
              Personalizar
              <ArrowRight size={16} className="group-hover:translate-x-1.5 transition-transform duration-300" />
            </a>
          </motion.div>

          {/* Free shipping badge */}
          <motion.div
            initial={{ opacity: 0, y: 16, filter: "blur(4px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 1, delay: 1.7, ease: [0.16, 1, 0.3, 1] }}
            className="mt-8 inline-flex items-center gap-3 text-sm text-foreground/70"
          >
            <span className="flex items-center justify-center w-9 h-9 rounded-full border border-primary/30 bg-primary/10 backdrop-blur-sm">
              <Truck size={16} className="text-primary" />
            </span>
            <span className="uppercase tracking-[0.15em] text-xs font-semibold">
              Envíos gratis <span className="text-primary">a todo el país</span>
            </span>
            <span className="hidden sm:block w-16 h-px bg-gradient-to-r from-primary/40 to-transparent" />
          </motion.div>
        </div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.2, duration: 1.2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-3"
      >
        <span className="text-[9px] uppercase tracking-[0.35em] text-muted-foreground/60">Scroll</span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          className="w-px h-10 bg-gradient-to-b from-primary/80 to-transparent"
        />
      </motion.div>
    </section>
  );
};
