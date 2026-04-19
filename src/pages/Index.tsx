import { Navbar } from "@/components/versus/Navbar";
import { Hero } from "@/components/versus/Hero";
import { Marquee } from "@/components/versus/Marquee";
import { ProPlayers } from "@/components/versus/ProPlayers";
import { CustomFlow } from "@/components/versus/CustomFlow";
import { Shop } from "@/components/versus/Shop";
import { B2B } from "@/components/versus/B2B";
import { Footer } from "@/components/versus/Footer";

const Index = () => {
  return (
    <main className="min-h-screen bg-background text-foreground">
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
