import { Navigation } from "@/components/Navigation";
import { PropertyGrid } from "@/components/PropertyGrid";
import { SearchSection } from "@/components/SearchSection";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Home, Users, Shield, MapPin } from "lucide-react";

const Residential = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-4">Residential Properties</h1>
          <p className="text-lg text-muted-foreground max-w-3xl">
            Find your dream home with our extensive collection of houses, apartments, townhouses, and villas. 
            From cozy starter homes to luxury estates, we have properties for every lifestyle and budget.
          </p>
        </div>

        <SearchSection />

        <div className="grid gap-6 md:grid-cols-3 mb-8">
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Home className="w-5 h-5 text-primary" />
                Family Homes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Spacious family homes with multiple bedrooms, modern amenities, and child-friendly neighborhoods.
              </p>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                Starter Homes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Perfect first homes for young professionals and couples starting their homeownership journey.
              </p>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" />
                Luxury Properties
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Premium properties with high-end finishes, exclusive locations, and luxury amenities.
              </p>
            </CardContent>
          </Card>
        </div>

        <PropertyGrid defaultType="residential" defaultStatus="available" defaultListingType="sale" />
      </main>
    </div>
  );
};

export default Residential;