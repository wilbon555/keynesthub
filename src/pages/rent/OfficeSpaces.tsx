import { Navigation } from "@/components/Navigation";
import { PropertyGrid } from "@/components/PropertyGrid";
import { SearchSection } from "@/components/SearchSection";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Users, Wifi, Coffee } from "lucide-react";

const OfficeSpaces = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-4">Office Space Rentals</h1>
          <p className="text-lg text-muted-foreground max-w-3xl">
            Find the ideal workspace for your business with our comprehensive office rental listings. 
            From co-working spaces to corporate offices, discover professional environments that inspire productivity.
          </p>
        </div>

        <SearchSection />

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-primary" />
                Professional Spaces
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Modern office buildings with professional reception areas and business-grade facilities.
              </p>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                Meeting Rooms
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Equipped conference rooms, presentation facilities, and collaboration spaces for teams.
              </p>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wifi className="w-5 h-5 text-primary" />
                High-Speed Internet
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Reliable high-speed internet, IT support, and telecommunications infrastructure included.
              </p>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Coffee className="w-5 h-5 text-primary" />
                Business Amenities
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Break rooms, parking, security systems, and cleaning services for complete convenience.
              </p>
            </CardContent>
          </Card>
        </div>

        <PropertyGrid />
      </main>
    </div>
  );
};

export default OfficeSpaces;