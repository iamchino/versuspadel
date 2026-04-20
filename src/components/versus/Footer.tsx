import { Instagram, MessageCircle } from "lucide-react";
import logo from "@/assets/Logotipo.png";

export const Footer = () => {
  return (
    <footer id="contact" className="relative bg-background border-t border-border">
      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-20">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 mb-16">
          <div className="md:col-span-6">
            <div className="mb-6">
              <img src={logo} alt="VERSUS" className="h-16 md:h-24 w-auto" loading="lazy" />
            </div>
            <p className="text-muted-foreground max-w-md">
              Jugás con lo que te representa.
            </p>
          </div>

          <div className="md:col-span-3">
            <div className="text-xs uppercase tracking-[0.3em] text-primary mb-4">Navegá</div>
            <ul className="space-y-2 text-sm text-foreground/80">
              <li><a href="#pro" className="hover:text-primary transition-colors">Pro Players</a></li>
              <li><a href="#custom" className="hover:text-primary transition-colors">Personalización</a></li>
              <li><a href="#shop" className="hover:text-primary transition-colors">Shop</a></li>
              <li><a href="#b2b" className="hover:text-primary transition-colors">Mayoristas</a></li>
            </ul>
          </div>

          <div className="md:col-span-3">
            <div className="text-xs uppercase tracking-[0.3em] text-primary mb-4">Contacto</div>
            <ul className="space-y-3 text-sm text-foreground/80">
              <li>
                <a href="http://wa.me/543412694610" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 hover:text-primary transition-colors">
                  <MessageCircle size={16} /> WhatsApp
                </a>
              </li>
              <li>
                <a href="https://www.instagram.com/versuspadel/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 hover:text-primary transition-colors">
                  <Instagram size={16} /> @versuspadel
                </a>
              </li>
              <li>hola@versuspadel.com</li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-border flex flex-col md:flex-row justify-between gap-4 text-xs uppercase tracking-[0.2em] text-muted-foreground">
          <span>© {new Date().getFullYear()} VERSUS Pádel · Rosario</span>
          <span>Diseñada para vos.</span>
        </div>
      </div>

      {/* Floating WhatsApp */}
      <a
        href="http://wa.me/543412694610"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="WhatsApp"
        className="fixed bottom-6 right-6 z-40 bg-primary text-primary-foreground w-14 h-14 rounded-full flex items-center justify-center shadow-[0_10px_30px_-5px_hsl(42_88%_55%/0.5)] hover:scale-110 transition-transform"
      >
        <MessageCircle size={22} />
      </a>
    </footer>
  );
};
