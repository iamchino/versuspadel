import { useEffect, useState, useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Menu, X } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import logo from "@/assets/Logotipo.png";

const links = [
  { label: "Inicio", href: "/" },
  { label: "Tienda", href: "/store" },
  { label: "Personalización", href: "/#custom" },
  { label: "Mayoristas", href: "/#b2b" }
];

export const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const navRef = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll();
  const logoScale = useTransform(scrollYProgress, [0, 0.05], [1, 0.85]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href.startsWith("/#") && location.pathname === "/") {
      e.preventDefault();
      const id = href.replace("/#", "");
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
        setOpen(false);
      }
    } else {
      setOpen(false);
    }
  };

  return (
    <motion.header
      ref={navRef}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ${scrolled ? "bg-background/85 backdrop-blur-xl border-b border-border" : "bg-transparent"
        }`}
    >
      {/* Scroll progress indicator */}
      <motion.div
        className="absolute bottom-0 left-0 h-px bg-primary origin-left"
        style={{ scaleX: scrollYProgress }}
      />

      <nav className="max-w-7xl mx-auto px-6 lg:px-10 h-24 flex items-center justify-between">
        <Link to="/" className="flex items-center">
          <motion.img
            src={logo}
            alt="VERSUS"
            className="h-14 md:h-20 w-auto"
            style={{ scale: logoScale }}
          />
        </Link>

        <ul className="hidden md:flex items-center gap-10 text-sm uppercase tracking-[0.18em] text-muted-foreground">
          {links.map((l, i) => (
            <motion.li
              key={l.href}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 + i * 0.08, ease: [0.16, 1, 0.3, 1] }}
            >
              <Link
                to={l.href}
                onClick={(e) => handleLinkClick(e, l.href)}
                className="relative hover:text-foreground transition-colors duration-300 group py-1"
              >
                {l.label}
                <span className="absolute bottom-0 left-0 w-full h-px bg-primary scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
              </Link>
            </motion.li>
          ))}
        </ul>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <Link
            to="/store"
            className="hidden md:inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] font-semibold text-primary-foreground bg-primary px-5 py-2.5 rounded-sm shimmer-btn hover:shadow-[0_0_25px_hsl(42_88%_55%/0.3)] transition-all duration-500"
          >
            Comprar
          </Link>
        </motion.div>

        <button
          onClick={() => setOpen((v) => !v)}
          aria-label="Menu"
          className="md:hidden text-foreground p-2"
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </nav>

      {open && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="md:hidden bg-background/95 backdrop-blur-xl border-b border-border"
        >
          <ul className="px-6 py-6 space-y-5 text-sm uppercase tracking-[0.18em]">
            {links.map((l) => (
              <li key={l.href}>
                <Link
                  to={l.href}
                  onClick={(e) => handleLinkClick(e, l.href)}
                  className="block text-foreground/80"
                >
                  {l.label}
                </Link>
              </li>
            ))}
            <li>
              <Link
                to="/store"
                onClick={() => setOpen(false)}
                className="inline-block bg-primary text-primary-foreground px-5 py-2.5 font-semibold"
              >
                Comprar
              </Link>
            </li>
          </ul>
        </motion.div>
      )}
    </motion.header>
  );
};
