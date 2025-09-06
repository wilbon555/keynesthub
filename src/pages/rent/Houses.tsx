import { Navigation } from "@/components/Navigation";
import { PropertyGrid } from "@/components/PropertyGrid";
import { SearchSection } from "@/components/SearchSection";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Home, Calendar, Shield, MapPin } from "lucide-react";

const Houses = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-4">House Rentals</h1>
          <p className="text-lg text-muted-foreground max-w-3xl">
            Find the perfect family home with our extensive collection of rental houses. 
            From cozy townhomes to spacious villas, discover properties with yards, privacy, and room to grow.
          </p>
        </div>

        <SearchSection />

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Home className="w-5 h-5 text-primary" />
                Family Spaces
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Spacious homes with multiple bedrooms, private yards, and family-friendly neighborhoods.
              </p>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" />
                Flexible Terms
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Short-term and long-term lease options to accommodate your specific timing needs.
              </p>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" />
                Maintenance Included
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Many properties include lawn care, maintenance, and repair services for worry-free living.
              </p>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-primary" />
                Prime Locations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Houses in desirable neighborhoods with access to schools, parks, and shopping centers.
              </p>
            </CardContent>
          </Card>
        </div>

        <PropertyGrid />
      </main>
    </div>
  );
};

export default Houses;