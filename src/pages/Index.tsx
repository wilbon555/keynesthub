import { Navigation } from "@/components/Navigation";
import { HeroSection } from "@/components/HeroSection";
import { PropertyGrid } from "@/components/PropertyGrid";
import { Footer } from "@/components/Footer";
import { PropertyJsonLd } from "@/components/seo/PropertyJsonLd";
import { PageHead } from "@/components/seo/PageHead";

import { useProperties } from "@/hooks/useProperties";

const Index = () => {
  const { properties } = useProperties();

  return (
    <div className="min-h-screen bg-background pb-14 md:pb-0">
      <PageHead
        title="KeyNestHub - Premium Real Estate in Kenya"
        description="Discover 10,000+ properties, land, and real estate opportunities across Kenya. Buy, sell, or rent with verified listings and trusted agents."
      />
      <Navigation />
      <PropertyJsonLd properties={properties} />
      <HeroSection />
      <PropertyGrid defaultStatus="available" />
      <Footer />
      
    </div>
  );
};

export default Index;
