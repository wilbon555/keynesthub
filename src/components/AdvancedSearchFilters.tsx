import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetFooter } from "@/components/ui/sheet";
import { Filter, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export interface SearchFilters {
  location: string;
  propertyType: string;
  minPrice: number;
  maxPrice: number;
  minBedrooms: number;
  maxBedrooms: number;
  minBathrooms: number;
  maxBathrooms: number;
  listingType: 'all' | 'sale' | 'rent';
}

interface AdvancedSearchFiltersProps {
  filters: SearchFilters;
  onFiltersChange: (filters: SearchFilters) => void;
  onClearFilters: () => void;
}

export const defaultFilters: SearchFilters = {
  location: '',
  propertyType: 'all',
  minPrice: 0,
  maxPrice: 100000000,
  minBedrooms: 0,
  maxBedrooms: 10,
  minBathrooms: 0,
  maxBathrooms: 10,
  listingType: 'all'
};

const formatPrice = (value: number): string => {
  if (value >= 1000000) {
    return `KES ${(value / 1000000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return `KES ${(value / 1000).toFixed(0)}K`;
  }
  return `KES ${value}`;
};

export const AdvancedSearchFilters = ({
  filters,
  onFiltersChange,
  onClearFilters
}: AdvancedSearchFiltersProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [localFilters, setLocalFilters] = useState(filters);

  const activeFiltersCount = [
    filters.location,
    filters.propertyType !== 'all' ? filters.propertyType : null,
    filters.minPrice > 0,
    filters.maxPrice < 100000000,
    filters.minBedrooms > 0,
    filters.maxBedrooms < 10,
    filters.minBathrooms > 0,
    filters.maxBathrooms < 10,
    filters.listingType !== 'all' ? filters.listingType : null,
  ].filter(Boolean).length;

  const handleApply = () => {
    onFiltersChange(localFilters);
    setIsOpen(false);
  };

  const handleReset = () => {
    setLocalFilters(defaultFilters);
    onClearFilters();
    setIsOpen(false);
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" className="relative">
          <Filter className="w-4 h-4 mr-2" />
          Filters
          {activeFiltersCount > 0 && (
            <Badge 
              className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs bg-primary"
            >
              {activeFiltersCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Advanced Filters</SheetTitle>
        </SheetHeader>

        <div className="space-y-6 py-6">
          {/* Location */}
          <div className="space-y-2">
            <Label>Location</Label>
            <Input
              placeholder="City, neighborhood, or ZIP"
              value={localFilters.location}
              onChange={(e) => setLocalFilters(prev => ({ ...prev, location: e.target.value }))}
            />
          </div>

          {/* Listing Type */}
          <div className="space-y-2">
            <Label>Listing Type</Label>
            <Select 
              value={localFilters.listingType} 
              onValueChange={(value: 'all' | 'sale' | 'rent') => 
                setLocalFilters(prev => ({ ...prev, listingType: value }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="sale">For Sale</SelectItem>
                <SelectItem value="rent">For Rent</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Property Type */}
          <div className="space-y-2">
            <Label>Property Type</Label>
            <Select 
              value={localFilters.propertyType} 
              onValueChange={(value) => setLocalFilters(prev => ({ ...prev, propertyType: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="house">House</SelectItem>
                <SelectItem value="apartment">Apartment</SelectItem>
                <SelectItem value="land">Land</SelectItem>
                <SelectItem value="commercial">Commercial</SelectItem>
                <SelectItem value="condo">Condo</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Price Range */}
          <div className="space-y-4">
            <Label>Price Range</Label>
            <div className="px-2">
              <Slider
                value={[localFilters.minPrice, localFilters.maxPrice]}
                min={0}
                max={100000000}
                step={500000}
                onValueChange={([min, max]) => 
                  setLocalFilters(prev => ({ ...prev, minPrice: min, maxPrice: max }))
                }
                className="w-full"
              />
            </div>
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>{formatPrice(localFilters.minPrice)}</span>
              <span>{formatPrice(localFilters.maxPrice)}</span>
            </div>
          </div>

          {/* Bedrooms */}
          <div className="space-y-2">
            <Label>Bedrooms</Label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs text-muted-foreground">Min</Label>
                <Select 
                  value={localFilters.minBedrooms.toString()} 
                  onValueChange={(value) => 
                    setLocalFilters(prev => ({ ...prev, minBedrooms: parseInt(value) }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[0, 1, 2, 3, 4, 5, 6].map(n => (
                      <SelectItem key={n} value={n.toString()}>
                        {n === 0 ? 'Any' : `${n}+`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Max</Label>
                <Select 
                  value={localFilters.maxBedrooms.toString()} 
                  onValueChange={(value) => 
                    setLocalFilters(prev => ({ ...prev, maxBedrooms: parseInt(value) }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
                      <SelectItem key={n} value={n.toString()}>
                        {n === 10 ? 'Any' : n.toString()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Bathrooms */}
          <div className="space-y-2">
            <Label>Bathrooms</Label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs text-muted-foreground">Min</Label>
                <Select 
                  value={localFilters.minBathrooms.toString()} 
                  onValueChange={(value) => 
                    setLocalFilters(prev => ({ ...prev, minBathrooms: parseInt(value) }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[0, 1, 2, 3, 4, 5].map(n => (
                      <SelectItem key={n} value={n.toString()}>
                        {n === 0 ? 'Any' : `${n}+`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Max</Label>
                <Select 
                  value={localFilters.maxBathrooms.toString()} 
                  onValueChange={(value) => 
                    setLocalFilters(prev => ({ ...prev, maxBathrooms: parseInt(value) }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
                      <SelectItem key={n} value={n.toString()}>
                        {n === 10 ? 'Any' : n.toString()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>

        <SheetFooter className="flex gap-2">
          <Button variant="outline" onClick={handleReset} className="flex-1">
            <X className="w-4 h-4 mr-2" />
            Clear All
          </Button>
          <Button onClick={handleApply} className="flex-1">
            Apply Filters
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};
