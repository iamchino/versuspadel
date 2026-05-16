/**
 * ScrollToTop.tsx
 *
 * Soluciona dos problemas de navegación:
 * 1. Al cambiar de ruta (ej: /store → /) el scroll vuelve al inicio
 * 2. Si la URL tiene un hash (/#custom, /#b2b), espera a que el
 *    componente monte y luego hace scroll suave al elemento
 */

import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export function ScrollToTop() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) {
      // Hash link: wait a tick for the page to render, then scroll
      const id = hash.replace("#", "");
      const tryScroll = (attempts = 0) => {
        const el = document.getElementById(id);
        if (el) {
          // Small offset for fixed navbar
          const offset = 80;
          const top = el.getBoundingClientRect().top + window.scrollY - offset;
          window.scrollTo({ top, behavior: "smooth" });
        } else if (attempts < 10) {
          // Element not mounted yet — retry up to 10 times (500ms total)
          setTimeout(() => tryScroll(attempts + 1), 50);
        }
      };
      tryScroll();
    } else {
      // Normal route change: scroll to top
      window.scrollTo({ top: 0, behavior: "instant" });
    }
  }, [pathname, hash]);

  return null;
}
