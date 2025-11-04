import { Navigation } from "@/components/Navigation";
import { PropertyGrid } from "@/components/PropertyGrid";
import { SearchSection } from "@/components/SearchSection";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building, Wifi, Car, Heart } from "lucide-react";

const Apartments = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-4">Apartment Rentals</h1>
          <p className="text-lg text-muted-foreground max-w-3xl">
            Discover modern apartments perfect for singles, couples, and small families. 
            Browse furnished and unfurnished options with flexible lease terms and premium amenities.
          </p>
        </div>

        <SearchSection />

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="w-5 h-5 text-primary" />
                Modern Living
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Contemporary apartments with updated kitchens, bathrooms, and modern appliances.
              </p>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wifi className="w-5 h-5 text-primary" />
                Utilities Included
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Many apartments include utilities like water, electricity, internet, and cable TV.
              </p>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Car className="w-5 h-5 text-primary" />
                Parking Available
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Secure parking options including covered parking, garages, and assigned spaces.
              </p>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-primary" />
                Pet-Friendly
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Pet-friendly apartments with nearby parks and pet amenities for your furry friends.
              </p>
            </CardContent>
          </Card>
        </div>

        <PropertyGrid defaultType="apartment" defaultStatus="available" defaultListingType="rent" />
      </main>
    </div>
  );
};

export default Apartments;