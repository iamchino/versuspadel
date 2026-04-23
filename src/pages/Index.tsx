import { Navbar } from "@/components/versus/Navbar";
import { Footer } from "@/components/versus/Footer";
import { Hero } from "@/components/versus/Hero";
import { Shop } from "@/components/versus/Shop";
import { CustomFlow } from "@/components/versus/CustomFlow";
import { ProPlayers } from "@/components/versus/ProPlayers";
import { B2B } from "@/components/versus/B2B";
import { Marquee } from "@/components/versus/Marquee";

const Index = () => {
  return (
    <main className="min-h-screen bg-background text-foreground flex flex-col">
      <Navbar />
      <h1 className="sr-only">VERSUS Pádel — Paletas personalizadas de élite</h1>

      <Hero />
      <Marquee />
      <Shop />
      <CustomFlow />
      <B2B />
      <ProPlayers />

      <Footer />
    </main>
  );
};

export default Index;
