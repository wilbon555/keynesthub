import { Navigation } from "@/components/Navigation";
import { HeroSection } from "@/components/HeroSection";
import { PropertyGrid } from "@/components/PropertyGrid";
import { Footer } from "@/components/Footer";
import { PropertyJsonLd } from "@/components/seo/PropertyJsonLd";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { useProperties } from "@/hooks/useProperties";

const Index = () => {
  const { properties } = useProperties();

  return (
    <div className="min-h-screen bg-background pb-14 md:pb-0">
      <Navigation />
      <PropertyJsonLd properties={properties} />
      <HeroSection />
      <PropertyGrid defaultStatus="available" />
      <Footer />
      <MobileBottomNav />
    </div>
  );
};

export default Index;
