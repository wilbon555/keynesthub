import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useFavorites } from "@/hooks/useFavorites";
import { cn } from "@/lib/utils";

interface FavoriteButtonProps {
  propertyId: string;
  className?: string;
  size?: "sm" | "default" | "lg" | "icon";
}

export const FavoriteButton = ({ 
  propertyId, 
  className,
  size = "icon"
}: FavoriteButtonProps) => {
  const { isFavorite, toggleFavorite } = useFavorites();
  const isFav = isFavorite(propertyId);

  const handleClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await toggleFavorite(propertyId);
  };

  return (
    <Button
      variant="ghost"
      size={size}
      className={cn(
        "h-8 w-8 p-0 bg-white/80 hover:bg-white backdrop-blur-sm rounded-full shadow-md",
        className
      )}
      onClick={handleClick}
      aria-label={isFav ? "Remove from wishlist" : "Add to wishlist"}
    >
      <Heart
        className={cn(
          "h-4 w-4 transition-colors",
          isFav ? "fill-red-500 text-red-500" : "text-gray-600"
        )}
      />
    </Button>
  );
};
