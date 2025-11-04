import { Navigation } from "@/components/Navigation";
import { HeroSection } from "@/components/HeroSection";
import { PropertyGrid } from "@/components/PropertyGrid";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <HeroSection />
      <PropertyGrid defaultType="residential" defaultStatus="available" defaultListingType="sale" />
    </div>
  );
};

export default Index;
