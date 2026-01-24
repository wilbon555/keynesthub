import { Navigation } from "@/components/Navigation";
import { HeroSection } from "@/components/HeroSection";
import { PropertyGrid } from "@/components/PropertyGrid";
import { Footer } from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <HeroSection />
      <PropertyGrid defaultStatus="available" />
      <Footer />
    </div>
  );
};

export default Index;
