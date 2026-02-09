import { Navigation } from "@/components/Navigation";
import { HeroSection } from "@/components/HeroSection";
import { PropertyGrid } from "@/components/PropertyGrid";
import { Footer } from "@/components/Footer";
import { PropertyJsonLd } from "@/components/seo/PropertyJsonLd";
import { useProperties } from "@/hooks/useProperties";

const Index = () => {
  const { properties } = useProperties();

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <PropertyJsonLd properties={properties} />
      <HeroSection />
      <PropertyGrid defaultStatus="available" />
      <Footer />
    </div>
  );
};

export default Index;
