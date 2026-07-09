import { PropertyCard } from "./PropertyCard";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Skeleton } from "./ui/skeleton";
import { useProperties, Property } from "@/hooks/useProperties";
import PropertyMap from "./PropertyMap";
import { AdvancedSearchFilters, SearchFilters, defaultFilters } from "./AdvancedSearchFilters";

import { Grid, List, MapPin, AlertCircle, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";

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
  const { properties, loading, loadingMore, hasMore, fetchError, loadMore, fetchProperties } = useProperties();

  useEffect(() => {
    const typeParam = (searchParams.get("type") || defaultType || "all").toLowerCase();
    setSelectedType(typeParam);
    
    // Sync URL params with filters
    const query = searchParams.get("q") || "";
    const priceParam = searchParams.get("price") || "";
    const bedsParam = searchParams.get("bedrooms") || "";

    // Map bedrooms param to min/max bedroom filters
    let minBedrooms = defaultFilters.minBedrooms;
    let maxBedrooms = defaultFilters.maxBedrooms;
    if (bedsParam) {
      if (bedsParam === "studio" || bedsParam === "bedsitter") {
        minBedrooms = 0;
        maxBedrooms = 0;
      } else if (bedsParam === "5") {
        minBedrooms = 5;
        maxBedrooms = 10;
      } else {
        const n = parseInt(bedsParam);
        if (!Number.isNaN(n)) {
          minBedrooms = n;
          maxBedrooms = n;
        }
      }
    }

    if (query || priceParam || typeParam !== "all" || bedsParam) {
      setFilters(prev => ({
        ...prev,
        location: query,
        propertyType: typeParam,
        minBedrooms,
        maxBedrooms,
      }));
    }
  }, [searchParams, defaultType]);

  const propertyTypes = ["all", "residential", "house", "apartment", "land", "commercial"];

  const priceToNumber = (price: string) => {
    // Extract only the first number from the price string (handles ranges like "Ksh56,000,000 - Ksh60,000,000")
    // Remove currency symbols and get the first number
    const cleanPrice = price.replace(/[^\d,.-]/g, '');
    // Split by common range separators and take the first price
    const firstPrice = cleanPrice.split(/[-–—]/)[0].trim();
    // Remove commas and parse
    const num = Number(firstPrice.replace(/,/g, ''));
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

  const filteredProperties = properties
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
          {/* Horizontally scrollable pills on mobile */}
          <div className="w-full md:w-auto overflow-x-auto scrollbar-hide">
            <div className="flex gap-2 md:gap-3 md:flex-wrap min-w-max md:min-w-0 pb-1 md:pb-0">
              {propertyTypes.map((type) => (
                <Badge
                  key={type}
                  variant={selectedType === type ? "default" : "outline"}
                  className={`cursor-pointer transition-smooth capitalize whitespace-nowrap min-h-[36px] md:min-h-0 px-4 md:px-3 text-sm md:text-xs ${
                    selectedType === type 
                      ? "bg-primary text-primary-foreground" 
                      : "hover:bg-muted"
                  }`}
                  onClick={() => setSelectedType(type)}
                >
                  {type === "all" ? "All" : type}
                </Badge>
              ))}
            </div>
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

        {/* Properties Grid/List */}
        <div className="mt-8">
          {loading ? (
            <div className={`grid gap-6 ${
              viewMode === "grid"
                ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
                : "grid-cols-1"
            }`}>
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="rounded-lg border bg-card overflow-hidden">
                  <Skeleton className="w-full aspect-[16/9]" />
                  <div className="p-4 space-y-3">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <div className="flex gap-3 pt-2">
                      <Skeleton className="h-4 w-12" />
                      <Skeleton className="h-4 w-12" />
                      <Skeleton className="h-4 w-16" />
                    </div>
                    <Skeleton className="h-6 w-1/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : fetchError && properties.length === 0 ? (
            <div className="text-center py-12 border border-dashed rounded-lg bg-muted/30">
              <AlertCircle className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-foreground font-medium mb-1">{fetchError}</p>
              <p className="text-sm text-muted-foreground mb-4">Check your connection and try again.</p>
              <Button variant="outline" onClick={() => fetchProperties()}>
                Refresh
              </Button>
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
                    title_deed_verified={property.title_deed_verified}
                    taxes_paid_verified={property.taxes_paid_verified}
                    physical_inspection_done={property.physical_inspection_done}
                    total_units={property.total_units}
                    vacant_units={property.vacant_units}
                  />
                ))}
              </div>

              {/* Load More Button — only when more DB properties are available */}
              {hasMore && (
                <div className="text-center mt-12">
                  <Button
                    variant="outline"
                    size="lg"
                    className="px-8"
                    onClick={() => loadMore()}
                    disabled={loadingMore}
                  >
                    {loadingMore ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Loading...
                      </>
                    ) : (
                      'Load More Properties'
                    )}
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </section>
  );
};