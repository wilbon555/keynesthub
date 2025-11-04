import { Navigation } from "@/components/Navigation";
import { PropertyGrid } from "@/components/PropertyGrid";
import { SearchSection } from "@/components/SearchSection";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Shield, Home, CreditCard } from "lucide-react";

const NewDevelopments = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-4">New Developments</h1>
          <p className="text-lg text-muted-foreground max-w-3xl">
            Be the first to own in brand new housing estates and gated communities. 
            Enjoy modern amenities, flexible payment plans, and the assurance of new construction warranties.
          </p>
        </div>

        <SearchSection />

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Home className="w-5 h-5 text-primary" />
                Modern Design
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Contemporary architecture with energy-efficient features and smart home technology integration.
              </p>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-primary" />
                Payment Plans
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Flexible financing options including pre-construction pricing and developer payment schemes.
              </p>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" />
                Completion Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Clear construction schedules with guaranteed completion dates and progress tracking.
              </p>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" />
                Developer Warranty
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Comprehensive warranties and quality guarantees from verified, reputable developers.
              </p>
            </CardContent>
          </Card>
        </div>

        <PropertyGrid defaultType="residential" defaultStatus="available" defaultListingType="sale" />
      </main>
    </div>
  );
};

export default NewDevelopments;