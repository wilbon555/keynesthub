import { Navigation } from "@/components/Navigation";
import { PropertyGrid } from "@/components/PropertyGrid";
import { SearchSection } from "@/components/SearchSection";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Star, Shield, Clock } from "lucide-react";

const ShortTerm = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-4">Short-Term Rentals</h1>
          <p className="text-lg text-muted-foreground max-w-3xl">
            Perfect for tourists, business travelers, and digital nomads. 
            Find fully furnished accommodations for daily, weekly, or monthly stays with flexible booking options.
          </p>
        </div>

        <SearchSection />

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" />
                Flexible Booking
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Daily, weekly, and monthly rental options with easy online booking and instant confirmation.
              </p>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="w-5 h-5 text-primary" />
                Verified Reviews
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Read authentic reviews from previous guests to make informed decisions about your stay.
              </p>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" />
                Trusted Hosts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                All hosts are verified and rated, ensuring safe and reliable short-term rental experiences.
              </p>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" />
                Instant Booking
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Book immediately available properties with instant confirmation and digital check-in options.
              </p>
            </CardContent>
          </Card>
        </div>

        <PropertyGrid />
      </main>
    </div>
  );
};

export default ShortTerm;