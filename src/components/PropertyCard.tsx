import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Bed, Bath, Square, Phone, MessageCircle } from "lucide-react";
import { PhotoGallery } from "./PhotoGallery";

interface PropertyCardProps {
  id: string;
  title: string;
  price: string;
  location: string;
  bedrooms?: number;
  bathrooms?: number;
  area: string;
  type: string;
  image: string;
  images?: string[];
  featured?: boolean;
  phone?: string;
}

export const PropertyCard = ({
  title,
  price,
  location,
  bedrooms,
  bathrooms,
  area,
  type,
  image,
  images: propertyImages,
  featured = false,
  phone
}: PropertyCardProps) => {
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  
  // Use multiple images if available, fallback to single image
  const images = propertyImages && propertyImages.length > 0 ? propertyImages : [image];
  return (
    <Card className="group cursor-pointer transition-smooth hover:shadow-elegant hover:-translate-y-1 overflow-hidden bg-gradient-card">
      <div className="relative overflow-hidden">
        <div className="relative">
          <img 
            src={images[0]} 
            alt={title}
            className="w-full h-48 object-cover transition-smooth group-hover:scale-105"
          />
          {images.length > 1 && (
            <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded-full">
              +{images.length - 1} photos
            </div>
          )}
        </div>
        {featured && (
          <Badge className="absolute top-3 left-3 bg-gradient-primary border-0 text-primary-foreground">
            Featured
          </Badge>
        )}
        <Badge variant="secondary" className="absolute top-3 right-3">
          {type}
        </Badge>
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-smooth" />
      </div>
      
      <CardContent 
        className="p-4 cursor-pointer" 
        onClick={() => setIsGalleryOpen(true)}
      >
        <div className="space-y-3">
          <div>
            <h3 className="font-semibold text-lg leading-tight line-clamp-2 group-hover:text-primary transition-smooth">
              {title}
            </h3>
            <div className="flex items-center text-muted-foreground text-sm mt-1">
              <MapPin className="w-4 h-4 mr-1" />
              {location}
            </div>
          </div>
          
          <div className="text-2xl font-bold text-primary">
            {price}
          </div>
          
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            {bedrooms && (
              <div className="flex items-center gap-1">
                <Bed className="w-4 h-4" />
                {bedrooms} beds
              </div>
            )}
            {bathrooms && (
              <div className="flex items-center gap-1">
                <Bath className="w-4 h-4" />
                {bathrooms} baths
              </div>
            )}
            <div className="flex items-center gap-1">
              <Square className="w-4 h-4" />
              {area}
            </div>
          </div>

          {phone && (
            <div className="flex gap-2 pt-2">
              <Button 
                size="sm" 
                variant="outline" 
                className="flex-1" 
                onClick={() => window.open(`tel:${phone}`, '_self')}
              >
                <Phone className="w-4 h-4 mr-2" />
                Call
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                className="flex-1"
                onClick={() => window.open(`sms:${phone}?body=Hi, I'm interested in your property: ${title}`, '_self')}
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Message
              </Button>
            </div>
          )}
        </div>
      </CardContent>
      
      <PhotoGallery
        images={images}
        isOpen={isGalleryOpen}
        onClose={() => setIsGalleryOpen(false)}
        title={title}
      />
    </Card>
  );
};