import { Navigation } from "@/components/Navigation";
import { PropertyGrid } from "@/components/PropertyGrid";
import { SearchSection } from "@/components/SearchSection";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TreePine, Zap, Droplets, MapIcon } from "lucide-react";

const Land = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-4">Land & Development</h1>
          <p className="text-lg text-muted-foreground max-w-3xl">
            Explore prime land opportunities for development, agriculture, or investment. 
            From residential plots to vast agricultural acreage, find the perfect piece of land for your vision.
          </p>
        </div>

        <SearchSection />

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TreePine className="w-5 h-5 text-primary" />
                Agricultural Land
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Fertile farmland with soil quality reports, water access, and agricultural potential assessments.
              </p>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-primary" />
                Utilities Available
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Land with existing or planned utility connections including electricity, water, and internet.
              </p>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Droplets className="w-5 h-5 text-primary" />
                Water Rights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Properties with established water rights and access to natural water sources.
              </p>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapIcon className="w-5 h-5 text-primary" />
                Development Ready
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Zoned and permitted land ready for immediate development with infrastructure access.
              </p>
            </CardContent>
          </Card>
        </div>

        <PropertyGrid defaultType="land" defaultStatus="available" defaultListingType="sale" />
      </main>
    </div>
  );
};

export default Land;