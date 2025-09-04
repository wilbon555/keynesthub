import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Bed, Bath, Square, Phone, MessageCircle } from "lucide-react";

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
  featured = false,
  phone
}: PropertyCardProps) => {
  return (
    <Card className="group cursor-pointer transition-smooth hover:shadow-elegant hover:-translate-y-1 overflow-hidden bg-gradient-card">
      <div className="relative overflow-hidden">
        <img 
          src={image} 
          alt={title}
          className="w-full h-48 object-cover transition-smooth group-hover:scale-105"
        />
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
      
      <CardContent className="p-4">
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
    </Card>
  );
};