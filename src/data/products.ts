import racketImage from "@/assets/racket-custom.jpg";

export type Category = "Paletas" | "Indumentaria" | "Accesorios";

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  image: string;
  category: Category;
  inStock: boolean;
  features?: string[];
}

export const products: Product[] = [
  {
    id: "p1",
    name: "VERSUS Elite Pro",
    slug: "versus-elite-pro",
    description: "Paleta de alto rendimiento diseñada para jugadores profesionales. Balance perfecto entre potencia y control.",
    price: 120000,
    image: racketImage,
    category: "Paletas",
    inStock: true,
    features: ["Forma de lágrima", "Carbono 12K", "Núcleo EVA Soft"],
  },
  {
    id: "p2",
    name: "VERSUS Control Series",
    slug: "versus-control-series",
    description: "Máximo control en cada golpe. Ideal para jugadores técnicos que buscan precisión milimétrica.",
    price: 110000,
    image: racketImage,
    category: "Paletas",
    inStock: true,
    features: ["Forma redonda", "Carbono 3K", "Punto dulce amplio"],
  },
  {
    id: "p3",
    name: "VERSUS Power Max",
    slug: "versus-power-max",
    description: "Diseñada para la potencia pura. Perfecta para rematadores y juego ofensivo.",
    price: 115000,
    image: racketImage,
    category: "Paletas",
    inStock: false,
    features: ["Forma diamante", "Carbono 18K", "Balance alto"],
  },
  {
    id: "p4",
    name: "Remera Técnica VERSUS",
    slug: "remera-tecnica-versus",
    description: "Remera de entrenamiento ultraligera con tecnología de absorción de sudor.",
    price: 25000,
    image: racketImage,
    category: "Indumentaria",
    inStock: true,
  },
  {
    id: "p5",
    name: "Bolso Paletero Pro",
    slug: "bolso-paletero-pro",
    description: "Capacidad para 4 paletas, compartimento térmico y espacio ventilado para zapatillas.",
    price: 65000,
    image: racketImage,
    category: "Accesorios",
    inStock: true,
  },
  {
    id: "p6",
    name: "Overgrips VERSUS (x3)",
    slug: "overgrips-versus-x3",
    description: "Pack de 3 overgrips de alta adherencia y durabilidad.",
    price: 8500,
    image: racketImage,
    category: "Accesorios",
    inStock: true,
  },
];
