import { useEffect, useState } from "react";
import { PropertyCard } from "@/components/PropertyCard";
import { useFavorites } from "@/hooks/useFavorites";
import { supabase } from "@/integrations/supabase/client";
import { Heart, Loader2 } from "lucide-react";
import { Property } from "@/hooks/useProperties";

export const WishlistSection = () => {
  const { favorites, loading: favoritesLoading } = useFavorites();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFavoriteProperties = async () => {
      if (favorites.length === 0) {
        setProperties([]);
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('properties')
          .select('*')
          .in('id', favorites);

        if (error) throw error;

        setProperties((data as Property[]) || []);
      } catch (error) {
        console.error('Error fetching favorite properties:', error);
      } finally {
        setLoading(false);
      }
    };

    if (!favoritesLoading) {
      fetchFavoriteProperties();
    }
  }, [favorites, favoritesLoading]);

  if (loading || favoritesLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (properties.length === 0) {
    return (
      <div className="text-center py-12">
        <Heart className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold text-foreground mb-2">No Saved Properties</h3>
        <p className="text-muted-foreground">
          Click the heart icon on properties to save them to your wishlist.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {properties.map((property) => (
        <PropertyCard
          key={property.id}
          id={property.id}
          title={property.title}
          price={property.price}
          location={property.location}
          bedrooms={property.bedrooms}
          bathrooms={property.bathrooms}
          area={property.area}
          type={property.type}
          image={property.image}
          images={property.images}
          featured={property.featured}
          phone={property.phone}
          user_id={property.user_id}
          listing_type={property.listing_type}
          verification_status={property.verification_status}
        />
      ))}
    </div>
  );
};
