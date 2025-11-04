import { Navigation } from "@/components/Navigation";
import { PropertyGrid } from "@/components/PropertyGrid";
import { SearchSection } from "@/components/SearchSection";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, TrendingUp, Users, Calculator } from "lucide-react";

const Commercial = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-4">Commercial Properties</h1>
          <p className="text-lg text-muted-foreground max-w-3xl">
            Discover lucrative commercial real estate opportunities including office buildings, retail spaces, 
            warehouses, and mixed-use developments perfect for business expansion and investment portfolios.
          </p>
        </div>

        <SearchSection />

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-primary" />
                Office Buildings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Modern office spaces in prime business districts with excellent accessibility and amenities.
              </p>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                Retail Spaces
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                High-traffic retail locations perfect for businesses looking to maximize customer footfall.
              </p>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                Investment Properties
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Income-generating properties with strong rental yields and appreciation potential.
              </p>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="w-5 h-5 text-primary" />
                ROI Calculator
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Built-in tools to calculate return on investment and analyze commercial property profitability.
              </p>
            </CardContent>
          </Card>
        </div>

        <PropertyGrid defaultType="commercial" defaultStatus="available" />
      </main>
    </div>
  );
};

export default Commercial;