import { PropertyCard } from "./PropertyCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SlidersHorizontal, Grid, List } from "lucide-react";
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";

// Import property images
import property1 from "@/assets/property-1.jpg";
import property2 from "@/assets/property-2.jpg";
import property3 from "@/assets/property-3.jpg";
import property4 from "@/assets/property-4.jpg";
import property5 from "@/assets/property-5.jpg";
import property6 from "@/assets/property-6.jpg";

const sampleProperties = [
  {
    id: "1",
    title: "Modern Family Home with Garden",
    price: "$450,000",
    location: "Suburbia Heights, CA",
    bedrooms: 4,
    bathrooms: 3,
    area: "2,400 sq ft",
    type: "House",
    image: property1,
    featured: true
  },
  {
    id: "2",
    title: "Luxury Downtown Apartment",
    price: "$320,000",
    location: "Downtown Metro, NY",
    bedrooms: 2,
    bathrooms: 2,
    area: "1,200 sq ft",
    type: "Apartment",
    image: property2,
    featured: false
  },
  {
    id: "3",
    title: "Beautiful Development Land",
    price: "$180,000",
    location: "Green Valley, TX",
    area: "5.2 acres",
    type: "Land",
    image: property3,
    featured: false
  },
  {
    id: "4",
    title: "Elegant Two-Story Residence",
    price: "$625,000",
    location: "Maple Street, WA",
    bedrooms: 5,
    bathrooms: 4,
    area: "3,100 sq ft",
    type: "House",
    image: property4,
    featured: true
  },
  {
    id: "5",
    title: "Commercial Office Building",
    price: "$1,200,000",
    location: "Business District, FL",
    area: "8,500 sq ft",
    type: "Commercial",
    image: property5,
    featured: false
  },
  {
    id: "6",
    title: "Charming Suburban Home",
    price: "$385,000",
    location: "Oak Lane, OR",
    bedrooms: 3,
    bathrooms: 2,
    area: "1,800 sq ft",
    type: "House",
    image: property6,
    featured: false
  }
];

export const PropertyGrid = () => {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const typeParam = (searchParams.get("type") || "all").toLowerCase();
    setSelectedType(typeParam);
  }, [searchParams]);

  const query = (searchParams.get("q") || "").toLowerCase();
  const priceParam = searchParams.get("price") || "";

  const propertyTypes = ["all", "house", "apartment", "land", "commercial"];

  const priceToNumber = (price: string) => {
    const num = Number(price.replace(/[^0-9]/g, ""));
    return isNaN(num) ? 0 : num;
  };

  const inPriceRange = (price: number) => {
    switch (priceParam) {
      case "0-100k":
        return price <= 100000;
      case "100k-300k":
        return price >= 100000 && price <= 300000;
      case "300k-500k":
        return price >= 300000 && price <= 500000;
      case "500k-1m":
        return price >= 500000 && price <= 1000000;
      case "1m+":
        return price > 1000000;
      default:
        return true;
    }
  };

  const filteredProperties = sampleProperties
    .filter((property) =>
      selectedType === "all"
        ? true
        : property.type.toLowerCase() === selectedType
    )
    .filter((property) => {
      if (!query) return true;
      const text = `${property.title} ${property.location}`.toLowerCase();
      return text.includes(query);
    })
    .filter((property) => inPriceRange(priceToNumber(property.price)));
  return (
    <section id="featured" className="py-16 bg-background">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Featured Properties
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Discover our hand-picked selection of premium properties available for sale and rent
          </p>
        </div>

        {/* Filters and Controls */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <div className="flex flex-wrap gap-3">
            {propertyTypes.map((type) => (
              <Badge
                key={type}
                variant={selectedType === type ? "default" : "outline"}
                className={`cursor-pointer transition-smooth capitalize ${
                  selectedType === type 
                    ? "bg-primary text-primary-foreground" 
                    : "hover:bg-muted"
                }`}
                onClick={() => setSelectedType(type)}
              >
                {type === "all" ? "All Properties" : type}
              </Badge>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <SlidersHorizontal className="w-4 h-4 mr-2" />
              Filters
            </Button>
            <div className="flex border rounded-lg overflow-hidden">
              <Button
                variant={viewMode === "grid" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("grid")}
                className="rounded-none"
              >
                <Grid className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("list")}
                className="rounded-none"
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Results count */}
        <div className="mb-6">
          <p className="text-muted-foreground">
            Showing {filteredProperties.length} properties
          </p>
        </div>

        {/* Property Grid */}
        <div className={`grid gap-6 ${
          viewMode === "grid" 
            ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" 
            : "grid-cols-1"
        } animate-fade-in`}>
          {filteredProperties.map((property) => (
            <PropertyCard key={property.id} {...property} />
          ))}
        </div>

        {/* Load More Button */}
        <div className="text-center mt-12">
          <Button variant="outline" size="lg" className="px-8">
            Load More Properties
          </Button>
        </div>
      </div>
    </section>
  );
};