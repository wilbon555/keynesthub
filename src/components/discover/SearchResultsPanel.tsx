import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { MapPin, Bed, Bath, Maximize2, TrendingUp, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SmartSearchResult } from '@/hooks/useSmartSearch';

interface Property {
  id: string;
  title: string;
  price: string;
  location: string;
  type: string;
  image?: string | null;
  bedrooms?: number | null;
  bathrooms?: number | null;
  area?: string;
  listing_type?: string;
}

interface SearchResultsPanelProps {
  result: SmartSearchResult | null;
  properties: Property[];
  isLoading: boolean;
  onPropertySelect: (property: Property) => void;
  selectedPropertyId?: string;
  className?: string;
}

export function SearchResultsPanel({
  result,
  properties,
  isLoading,
  onPropertySelect,
  selectedPropertyId,
  className,
}: SearchResultsPanelProps) {
  const displayProperties = result?.matchedProperties ?? properties;

  if (isLoading) {
    return (
      <Card className={cn("h-full", className)}>
        <CardHeader className="pb-3">
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("h-full flex flex-col", className)}>
      <CardHeader className="pb-3 flex-shrink-0">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            {result ? (
              <>
                <Sparkles className="w-5 h-5 text-primary" />
                AI Results
              </>
            ) : (
              'Properties'
            )}
          </CardTitle>
          <Badge variant="secondary">
            {displayProperties.length} found
          </Badge>
        </div>
        
        {/* AI Reasoning */}
        {result?.reasoning && (
          <p className="text-sm text-muted-foreground mt-2 p-2 bg-muted/50 rounded-md">
            {result.reasoning}
          </p>
        )}

        {/* Active Filters */}
        {result?.filters && Object.keys(result.filters).length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {result.filters.propertyType && (
              <Badge variant="outline" className="text-xs">
                {result.filters.propertyType}
              </Badge>
            )}
            {result.filters.location && (
              <Badge variant="outline" className="text-xs">
                <MapPin className="w-3 h-3 mr-1" />
                {result.filters.location}
              </Badge>
            )}
            {(result.filters.minPrice || result.filters.maxPrice) && (
              <Badge variant="outline" className="text-xs">
                {result.filters.minPrice ? `KES ${(result.filters.minPrice / 1000000).toFixed(1)}M` : '0'} - 
                {result.filters.maxPrice ? `KES ${(result.filters.maxPrice / 1000000).toFixed(1)}M` : '∞'}
              </Badge>
            )}
            {result.filters.bedrooms && (
              <Badge variant="outline" className="text-xs">
                {result.filters.bedrooms}+ beds
              </Badge>
            )}
            {result.filters.investmentCriteria && (
              <Badge variant="outline" className="text-xs bg-primary/10 text-primary border-primary/30">
                <TrendingUp className="w-3 h-3 mr-1" />
                Investment
              </Badge>
            )}
          </div>
        )}
      </CardHeader>

      <CardContent className="flex-1 overflow-hidden p-0">
        <ScrollArea className="h-full">
          <div className="p-4 pt-0 space-y-3">
            {displayProperties.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>No properties match your search.</p>
                <p className="text-sm mt-1">Try adjusting your criteria.</p>
              </div>
            ) : (
              displayProperties.map((property) => (
                <PropertyCard
                  key={property.id}
                  property={property}
                  isSelected={property.id === selectedPropertyId}
                  onClick={() => onPropertySelect(property)}
                />
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

function PropertyCard({
  property,
  isSelected,
  onClick,
}: {
  property: Property;
  isSelected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "w-full text-left p-3 rounded-lg border transition-all hover:shadow-md",
        isSelected
          ? "border-primary bg-primary/5 shadow-md"
          : "border-border hover:border-primary/50"
      )}
    >
      <div className="flex gap-3">
        {/* Image */}
        <div className="w-20 h-16 rounded-md overflow-hidden bg-muted flex-shrink-0">
          {property.image ? (
            <img
              src={property.image}
              alt={property.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <MapPin className="w-6 h-6 text-muted-foreground" />
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-sm truncate">{property.title}</h4>
          <p className="text-primary font-semibold text-sm">{property.price}</p>
          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
            <span className="flex items-center gap-0.5 truncate">
              <MapPin className="w-3 h-3 flex-shrink-0" />
              {property.location}
            </span>
          </div>
          <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
            {property.bedrooms && (
              <span className="flex items-center gap-0.5">
                <Bed className="w-3 h-3" />
                {property.bedrooms}
              </span>
            )}
            {property.bathrooms && (
              <span className="flex items-center gap-0.5">
                <Bath className="w-3 h-3" />
                {property.bathrooms}
              </span>
            )}
            {property.area && (
              <span className="flex items-center gap-0.5">
                <Maximize2 className="w-3 h-3" />
                {property.area}
              </span>
            )}
          </div>
        </div>
      </div>
    </button>
  );
}
