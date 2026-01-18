import { PropertyCard } from "./PropertyCard";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { useProperties, Property } from "@/hooks/useProperties";
import PropertyMap from "./PropertyMap";
import { AdvancedSearchFilters, SearchFilters, defaultFilters } from "./AdvancedSearchFilters";

import { Grid, List, MapPin } from "lucide-react";
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import property1 from "@/assets/property-1.jpg";
import property2 from "@/assets/property-2.jpg";
import property3 from "@/assets/property-3.jpg";
import property4 from "@/assets/property-4.jpg";
import property5 from "@/assets/property-5.jpg";
import property6 from "@/assets/property-6.jpg";

const sampleProperties: Property[] = [
  {
    id: "00000000-0000-0000-0000-000000000001",
    title: "Modern Family Home with Garden",
    price: "$450,000",
    location: "Suburbia Heights, CA",
    bedrooms: 4,
    bathrooms: 3,
    area: "2,400 sq ft",
    type: "House",
    image: property1,
    images: [property1],
    featured: true,
    status: 'available',
    listing_type: 'sale',
    user_id: 'sample',
    phone: '5551234567',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "00000000-0000-0000-0000-000000000002",
    title: "Luxury Downtown Apartment",
    price: "$320,000",
    location: "Downtown Metro, NY",
    bedrooms: 2,
    bathrooms: 2,
    area: "1,200 sq ft",
    type: "Apartment",
    image: property2,
    images: [property2],
    featured: false,
    status: 'available',
    listing_type: 'sale',
    user_id: 'sample',
    phone: '5552345678',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "00000000-0000-0000-0000-000000000003",
    title: "Beautiful Development Land",
    price: "$180,000",
    location: "Green Valley, TX",
    area: "5.2 acres",
    type: "Land",
    image: property3,
    images: [property3],
    featured: false,
    status: 'available',
    listing_type: 'sale',
    user_id: 'sample',
    phone: '5553456789',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "00000000-0000-0000-0000-000000000004",
    title: "Elegant Two-Story Residence",
    price: "$625,000",
    location: "Maple Street, WA",
    bedrooms: 5,
    bathrooms: 4,
    area: "3,100 sq ft",
    type: "House",
    image: property4,
    images: [property4],
    featured: true,
    status: 'available',
    listing_type: 'sale',
    user_id: 'sample',
    phone: '5554567890',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "00000000-0000-0000-0000-000000000005",
    title: "Commercial Office Building",
    price: "$1,200,000",
    location: "Business District, FL",
    area: "8,500 sq ft",
    type: "Commercial",
    image: property5,
    images: [property5],
    featured: false,
    status: 'available',
    listing_type: 'sale',
    user_id: 'sample',
    phone: '5555678901',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "00000000-0000-0000-0000-000000000006",
    title: "Charming Suburban Home",
    price: "$385,000",
    location: "Oak Lane, OR",
    bedrooms: 3,
    bathrooms: 2,
    area: "1,800 sq ft",
    type: "House",
    image: property6,
    images: [property6],
    featured: false,
    status: 'available',
    listing_type: 'sale',
    user_id: 'sample',
    phone: '5556789012',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

interface PropertyGridProps {
  defaultType?: string;
  defaultStatus?: string;
  defaultListingType?: 'sale' | 'rent';
}

export const PropertyGrid = ({ defaultType, defaultStatus, defaultListingType }: PropertyGridProps = {}) => {
  const [viewMode, setViewMode] = useState<"grid" | "list" | "map">("grid");
  const [selectedType, setSelectedType] = useState<string>(defaultType || "all");
  const [filters, setFilters] = useState<SearchFilters>({
    ...defaultFilters,
    listingType: defaultListingType || 'all'
  });
  const [searchParams] = useSearchParams();
  const { properties, loading } = useProperties();

  useEffect(() => {
    const typeParam = (searchParams.get("type") || defaultType || "all").toLowerCase();
    setSelectedType(typeParam);
    
    // Sync URL params with filters
    const query = searchParams.get("q") || "";
    const priceParam = searchParams.get("price") || "";
    
    if (query || priceParam || typeParam !== "all") {
      setFilters(prev => ({
        ...prev,
        location: query,
        propertyType: typeParam,
      }));
    }
  }, [searchParams, defaultType]);

  const propertyTypes = ["all", "residential", "house", "apartment", "land", "commercial"];

  const priceToNumber = (price: string) => {
    const num = Number(price.replace(/[^0-9]/g, ""));
    return isNaN(num) ? 0 : num;
  };

  const handleFiltersChange = (newFilters: SearchFilters) => {
    setFilters(newFilters);
    if (newFilters.propertyType !== 'all') {
      setSelectedType(newFilters.propertyType);
    }
  };

  const handleClearFilters = () => {
    setFilters({ ...defaultFilters, listingType: defaultListingType || 'all' });
    setSelectedType('all');
  };

  // Combine database properties with sample properties, with database ones first
  const allProperties = [...properties, ...sampleProperties];
  
  const filteredProperties = allProperties
    .filter((property) => 
      defaultStatus ? property.status === defaultStatus : true
    )
    .filter((property) => {
      // Listing type filter
      if (filters.listingType === 'all') return true;
      return property.listing_type === filters.listingType;
    })
    .filter((property) => {
      // Property type filter
      if (selectedType === "all" && filters.propertyType === "all") return true;
      const typeToCheck = selectedType !== "all" ? selectedType : filters.propertyType;
      if (typeToCheck === "residential") {
        return property.type.toLowerCase() === "house" || property.type.toLowerCase() === "apartment";
      }
      return property.type.toLowerCase() === typeToCheck;
    })
    .filter((property) => {
      // Location filter
      if (!filters.location) return true;
      const text = `${property.title} ${property.location}`.toLowerCase();
      return text.includes(filters.location.toLowerCase());
    })
    .filter((property) => {
      // Price range filter
      const price = priceToNumber(property.price);
      return price >= filters.minPrice && price <= filters.maxPrice;
    })
    .filter((property) => {
      // Bedroom filter
      if (filters.minBedrooms === 0 && filters.maxBedrooms === 10) return true;
      const bedrooms = property.bedrooms || 0;
      return bedrooms >= filters.minBedrooms && bedrooms <= filters.maxBedrooms;
    })
    .filter((property) => {
      // Bathroom filter
      if (filters.minBathrooms === 0 && filters.maxBathrooms === 10) return true;
      const bathrooms = property.bathrooms || 0;
      return bathrooms >= filters.minBathrooms && bathrooms <= filters.maxBathrooms;
    });
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
            <AdvancedSearchFilters
              filters={filters}
              onFiltersChange={handleFiltersChange}
              onClearFilters={handleClearFilters}
            />
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
              <Button
                variant={viewMode === "map" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("map")}
                className="rounded-none"
              >
                <MapPin className="w-4 h-4" />
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

        {/* Properties Grid/List */}
        <div className="mt-8">
          {loading ? (
            <div className="text-center text-muted-foreground py-12">
              <p>Loading properties...</p>
            </div>
          ) : filteredProperties.length === 0 ? (
            <div className="text-center text-muted-foreground py-12">
              <p>No properties found matching your criteria.</p>
            </div>
          ) : viewMode === "map" ? (
            <PropertyMap properties={filteredProperties} />
          ) : (
            <>
              {/* Property Grid */}
              <div className={`grid gap-6 ${
                viewMode === "grid" 
                  ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" 
                  : "grid-cols-1"
              } animate-fade-in`}>
              {filteredProperties.map((property) => (
                  <PropertyCard 
                    key={property.id} 
                    {...property} 
                    images={property.images}
                    listing_type={property.listing_type}
                    verification_status={property.verification_status || 'verified'}
                  />
                ))}
              </div>

              {/* Load More Button */}
              <div className="text-center mt-12">
                <Button variant="outline" size="lg" className="px-8">
                  Load More Properties
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
};