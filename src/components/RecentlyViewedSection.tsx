import { useRecentlyViewed } from "@/hooks/useRecentlyViewed";
import { useProperties } from "@/hooks/useProperties";
import { PropertyCard } from "./PropertyCard";
import { Button } from "@/components/ui/button";
import { Clock, Trash2 } from "lucide-react";

export const RecentlyViewedSection = () => {
  const { recentPropertyIds, clearRecentlyViewed } = useRecentlyViewed();
  const { properties } = useProperties();

  // Filter properties to only those in recently viewed, maintaining order
  const recentProperties = recentPropertyIds
    .map(id => properties.find(p => p.id === id))
    .filter(Boolean);

  if (recentProperties.length === 0) {
    return (
      <div className="text-center py-12">
        <Clock className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold text-foreground mb-2">No Recently Viewed Properties</h3>
        <p className="text-muted-foreground">
          Properties you view will appear here for quick access.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing the last {recentProperties.length} properties you've viewed
        </p>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={clearRecentlyViewed}
          className="text-muted-foreground hover:text-destructive"
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Clear History
        </Button>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {recentProperties.map((property) => (
          <PropertyCard 
            key={property!.id} 
            {...property!}
            listing_type={property!.listing_type as 'sale' | 'rent'}
          />
        ))}
      </div>
    </div>
  );
};
