import { useEffect, useState } from "react";
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

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Handle smooth scroll for hash links if we are already on the homepage
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
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ${scrolled ? "bg-background/85 backdrop-blur-xl border-b border-border" : "bg-transparent"
        }`}
    >
      <nav className="max-w-7xl mx-auto px-6 lg:px-10 h-24 flex items-center justify-between">
        <Link to="/" className="flex items-center">
          <img src={logo} alt="VERSUS" className="h-14 md:h-20 w-auto" />
        </Link>

        <ul className="hidden md:flex items-center gap-10 text-sm uppercase tracking-[0.18em] text-muted-foreground">
          {links.map((l) => (
            <li key={l.href}>
              <Link
                to={l.href}
                onClick={(e) => handleLinkClick(e, l.href)}
                className="hover:text-foreground transition-colors duration-300"
              >
                {l.label}
              </Link>
            </li>
          ))}
        </ul>

        <Link
          to="/store"
          className="hidden md:inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] font-semibold text-primary-foreground bg-primary px-5 py-2.5 rounded-sm hover:bg-primary-glow transition-colors"
        >
          Comprar
        </Link>

        <button
          onClick={() => setOpen((v) => !v)}
          aria-label="Menu"
          className="md:hidden text-foreground p-2"
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </nav>

      {open && (
        <div className="md:hidden bg-background/95 backdrop-blur-xl border-b border-border animate-fade-in">
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
        </div>
      )}
    </header>
  );
};
