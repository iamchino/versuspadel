const phrases = [
  "Piezas únicas",
  "Hecho a medida",
  "Performance pro",
  "Identidad propia",
  "Edición limitada",
];

export const Marquee = () => {
  const items = [...phrases, ...phrases, ...phrases, ...phrases];
  return (
    <div className="relative border-y border-border bg-background py-6 overflow-hidden">
      <div className="flex animate-marquee whitespace-nowrap">
        {items.map((p, i) => (
          <span
            key={i}
            className="font-display text-3xl md:text-5xl uppercase tracking-tight px-8 text-foreground/80"
          >
            {p}
            <span className="inline-block mx-8 text-primary">✦</span>
          </span>
        ))}
      </div>
    </div>
  );
};
