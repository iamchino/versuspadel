import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Instagram, MessageCircle, Mail } from "lucide-react";
import { Link } from "react-router-dom";
import logo from "@/assets/Logotipo.png";
import { trackLead } from "@/lib/analytics";

export const Footer = () => {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "-5%" });

  return (
    <footer ref={ref} id="contact" className="relative bg-background border-t border-border">
      <div className="absolute top-0 inset-x-0 section-divider" />

      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-20">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="grid grid-cols-1 md:grid-cols-12 gap-10 mb-16"
        >
          <div className="md:col-span-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={inView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="mb-6"
            >
              <img src={logo} alt="VERSUS" className="h-16 md:h-24 w-auto" loading="lazy" />
            </motion.div>
            <p className="text-muted-foreground max-w-md">
              Jugás con lo que te representa.
            </p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="md:col-span-3"
          >
            <div className="text-xs uppercase tracking-[0.3em] text-primary mb-4">Navegá</div>
            <ul className="space-y-2 text-sm text-foreground/80">
              <li><Link to="/#pro" className="hover:text-primary transition-colors">Pro Players</Link></li>
              <li><Link to="/#custom" className="hover:text-primary transition-colors">Personalización</Link></li>
              <li><Link to="/store" className="hover:text-primary transition-colors">Tienda</Link></li>
              <li><Link to="/#b2b" className="hover:text-primary transition-colors">Mayoristas</Link></li>
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="md:col-span-3"
          >
            <div className="text-xs uppercase tracking-[0.3em] text-primary mb-4">Contacto</div>
            <ul className="space-y-3 text-sm text-foreground/80">
              <li>
                <a
                  href="https://wa.me/543417534534"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => trackLead("footer_whatsapp")}
                  className="inline-flex items-center gap-2 hover:text-primary transition-colors"
                >
                  <MessageCircle size={16} /> WhatsApp Ventas
                </a>
              </li>
              <li>
                <a href="mailto:versuspadel.argentina@gmail.com" className="inline-flex items-center gap-2 hover:text-primary transition-colors">
                  <Mail size={16} /> versuspadel.argentina@gmail.com
                </a>
              </li>
              <li>
                <a href="https://www.instagram.com/versuspadel/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 hover:text-primary transition-colors">
                  <Instagram size={16} /> @versuspadel
                </a>
              </li>
            </ul>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="pt-8 border-t border-border flex flex-col md:flex-row justify-between gap-4 text-xs uppercase tracking-[0.2em] text-muted-foreground"
        >
          <span>© {new Date().getFullYear()} VERSUS Pádel · Rosario</span>
          <span>Diseñada para vos.</span>
        </motion.div>
      </div>

      {/* Floating WhatsApp with glow pulse */}
      <a
        href="https://wa.me/543417534534"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="WhatsApp"
        onClick={() => trackLead("floating_whatsapp")}
        className="fixed bottom-6 right-6 z-40 bg-primary text-primary-foreground w-14 h-14 rounded-full flex items-center justify-center glow-pulse hover:scale-110 transition-transform"
      >
        <MessageCircle size={22} />
      </a>
    </footer>
  );
};
