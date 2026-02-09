import { useParams } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { PropertyGrid } from "@/components/PropertyGrid";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, School, Utensils, TrendingUp, Bus, ShieldCheck, TreePine } from "lucide-react";
import { useEffect } from "react";

const neighborhoodData: Record<string, {
  name: string;
  region: string;
  description: string;
  highlights: string[];
  schools: string[];
  restaurants: string[];
  transport: string[];
  marketTrend: string;
  avgPrice: string;
  safetyRating: string;
}> = {
  "kisumu-cbd": {
    name: "Kisumu CBD",
    region: "Kisumu",
    description: "The bustling heart of Kisumu city, offering a mix of commercial and residential properties with easy access to Lake Victoria, shopping centers, and government offices.",
    highlights: ["Lakefront proximity", "Commercial hub", "Public transport access", "Cultural landmarks"],
    schools: ["Kisumu Boys High School", "Kisumu Girls High School", "Aga Khan Academy", "Lake Primary School"],
    restaurants: ["Kiboko Bay Resort", "Dunga Hill Camp", "The Vic Restaurant", "Tilapia Beach"],
    transport: ["Kisumu International Airport (20 min)", "Main bus terminus", "Matatu routes to all estates"],
    marketTrend: "Steady growth of 8-12% annually. Increasing demand for mixed-use developments.",
    avgPrice: "Ksh 3.5M - Ksh 15M",
    safetyRating: "Good",
  },
  "nairobi-westlands": {
    name: "Westlands",
    region: "Nairobi",
    description: "Nairobi's premier commercial and upscale residential hub. Known for modern high-rises, international restaurants, and a vibrant nightlife scene alongside family-friendly amenities.",
    highlights: ["Business district", "International dining", "Modern apartments", "Shopping malls"],
    schools: ["Aga Khan High School", "Brookhouse School", "St. Austin's Academy", "Westlands Primary"],
    restaurants: ["Java House Westlands", "Artcaffe", "Sushi Soo", "Brew Bistro"],
    transport: ["Westlands BRT Station", "15 min to JKIA via Thika Road", "Multiple matatu routes"],
    marketTrend: "Premium market with 10-15% appreciation. High demand for serviced apartments.",
    avgPrice: "Ksh 8M - Ksh 45M",
    safetyRating: "Excellent",
  },
  "jooust-area": {
    name: "JOOUST Area",
    region: "Kisumu",
    description: "The vibrant neighborhood surrounding Jaramogi Oginga Odinga University of Science and Technology (JOOUST). Popular with students and young professionals seeking affordable rentals.",
    highlights: ["Student-friendly", "Affordable rentals", "Growing market", "Close to campus"],
    schools: ["JOOUST", "Bondo Township Primary", "Maranda High School (nearby)"],
    restaurants: ["Campus eateries", "Local restaurants along the highway", "Bondo town restaurants"],
    transport: ["Matatu to Kisumu (1hr)", "Boda boda network", "Bondo bus stage"],
    marketTrend: "High rental demand during academic terms. Bedsitters and single rooms most popular.",
    avgPrice: "Ksh 3,000 - Ksh 15,000/month (rentals)",
    safetyRating: "Good",
  },
  "mombasa-nyali": {
    name: "Nyali",
    region: "Mombasa",
    description: "An affluent coastal suburb known for its beautiful beaches, family-friendly environment, and a mix of luxury villas and modern apartments overlooking the Indian Ocean.",
    highlights: ["Beachfront living", "Luxury villas", "Tourism hub", "Golf courses"],
    schools: ["Nyali International Academy", "Light Academy", "Aga Khan Academy Mombasa"],
    restaurants: ["Tamarind Restaurant", "Moorings Restaurant", "Sails Beach Bar", "La Veranda"],
    transport: ["Moi International Airport (30 min)", "Nyali Bridge access", "Matatu to CBD"],
    marketTrend: "Coastal tourism driving 6-10% appreciation. Holiday homes and Airbnb popular.",
    avgPrice: "Ksh 10M - Ksh 60M",
    safetyRating: "Excellent",
  },
  "nakuru-milimani": {
    name: "Milimani",
    region: "Nakuru",
    description: "Nakuru's upscale residential area offering serene living with tree-lined streets, proximity to Lake Nakuru National Park, and growing infrastructure developments.",
    highlights: ["Serene environment", "Near Lake Nakuru", "Growing infrastructure", "Family-friendly"],
    schools: ["Nakuru High School", "Menengai High School", "Greensteds International"],
    restaurants: ["Merica Hotel", "Gilanis Supermarket & Deli", "Crater Lake Tented Camp"],
    transport: ["Nakuru Railway Station", "A104 highway access", "Matatu to Nairobi (2hrs)"],
    marketTrend: "Rapid urbanization driving 12-18% growth. New city status boosting demand.",
    avgPrice: "Ksh 5M - Ksh 25M",
    safetyRating: "Very Good",
  },
};

const NeighborhoodGuide = () => {
  const { slug } = useParams<{ slug: string }>();
  const neighborhood = slug ? neighborhoodData[slug] : null;

  useEffect(() => {
    if (neighborhood) {
      document.title = `${neighborhood.name} Neighborhood Guide | KeyNestHub`;
      const meta = document.querySelector('meta[name="description"]');
      if (meta) {
        meta.setAttribute("content", `Explore ${neighborhood.name} - ${neighborhood.description.slice(0, 140)}`);
      }
    }
  }, [neighborhood]);

  if (!neighborhood) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="container mx-auto px-4 py-12">
          <h1 className="text-3xl font-bold text-foreground mb-4">Neighborhood Guides</h1>
          <p className="text-muted-foreground mb-8">Explore local areas to find your perfect neighborhood.</p>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Object.entries(neighborhoodData).map(([key, data]) => (
              <Card key={key} className="hover:shadow-elegant transition-smooth cursor-pointer" onClick={() => window.location.href = `/neighborhoods/${key}`}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{data.name}</CardTitle>
                    <Badge variant="secondary">{data.region}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-3">{data.description}</p>
                  <div className="mt-3 flex items-center gap-2 text-sm text-primary font-medium">
                    <MapPin className="w-4 h-4" />
                    Avg: {data.avgPrice}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const sections = [
    { icon: School, title: "Schools & Education", items: neighborhood.schools, color: "text-blue-600" },
    { icon: Utensils, title: "Restaurants & Dining", items: neighborhood.restaurants, color: "text-orange-600" },
    { icon: Bus, title: "Transport & Accessibility", items: neighborhood.transport, color: "text-green-600" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main>
        {/* Hero */}
        <section className="bg-gradient-hero py-16 px-4">
          <div className="container mx-auto max-w-4xl text-center">
            <Badge className="mb-4 bg-accent text-accent-foreground">{neighborhood.region}</Badge>
            <h1 className="text-4xl md:text-5xl font-bold text-primary-foreground mb-4">
              {neighborhood.name} Neighborhood Guide
            </h1>
            <p className="text-lg text-primary-foreground/90 max-w-2xl mx-auto">
              {neighborhood.description}
            </p>
          </div>
        </section>

        <div className="container mx-auto px-4 py-12 space-y-12">
          {/* Highlights */}
          <div className="flex flex-wrap gap-3 justify-center">
            {neighborhood.highlights.map((h) => (
              <Badge key={h} variant="outline" className="text-sm px-4 py-2">
                <TreePine className="w-4 h-4 mr-1" /> {h}
              </Badge>
            ))}
          </div>

          {/* Key Info Cards */}
          <div className="grid gap-6 sm:grid-cols-3">
            <Card>
              <CardContent className="pt-6 text-center">
                <TrendingUp className="w-8 h-8 mx-auto mb-2 text-primary" />
                <h3 className="font-semibold mb-1">Market Trend</h3>
                <p className="text-sm text-muted-foreground">{neighborhood.marketTrend}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <MapPin className="w-8 h-8 mx-auto mb-2 text-primary" />
                <h3 className="font-semibold mb-1">Average Price</h3>
                <p className="text-sm text-muted-foreground">{neighborhood.avgPrice}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <ShieldCheck className="w-8 h-8 mx-auto mb-2 text-primary" />
                <h3 className="font-semibold mb-1">Safety Rating</h3>
                <p className="text-sm text-muted-foreground">{neighborhood.safetyRating}</p>
              </CardContent>
            </Card>
          </div>

          {/* Local Amenities */}
          <div className="grid gap-6 md:grid-cols-3">
            {sections.map(({ icon: Icon, title, items, color }) => (
              <Card key={title}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Icon className={`w-5 h-5 ${color}`} />
                    {title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {items.map((item) => (
                      <li key={item} className="text-sm text-muted-foreground flex items-start gap-2">
                        <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Properties in this area */}
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-6">
              Properties in {neighborhood.name}
            </h2>
            <PropertyGrid defaultStatus="available" />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default NeighborhoodGuide;
