import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Bed, Bath, Square, MessageCircle, Trash2, Edit } from "lucide-react";
import { PhotoGallery } from "./PhotoGallery";
import ContactDialog from "./ContactDialog";
import { EditPropertyDialog } from "./EditPropertyDialog";
import { useProperties, Property } from "@/hooks/useProperties";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface PropertyCardProps {
  id: string;
  title: string;
  price: string;
  location: string;
  bedrooms?: number;
  bathrooms?: number;
  area: string;
  type: string;
  image?: string;
  images?: string[];
  featured?: boolean;
  phone?: string;
  user_id?: string;
}

export const PropertyCard = ({
  id,
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
  phone,
  user_id
}: PropertyCardProps) => {
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [showContactDialog, setShowContactDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const { deleteProperty, updateProperty } = useProperties();
  const { user } = useAuth();
  
  // Check if current user is the owner of this property
  const isOwner = user && user_id && user.id === user_id;
  
  const handleRemoveProperty = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (window.confirm('Are you sure you want to remove this property? This action cannot be undone.')) {
      const success = await deleteProperty(id);
      if (success) {
        toast.success('Property removed successfully');
      }
    }
  };

  const handleEditProperty = async (updatedData: Partial<Property> & { uploadedFiles?: File[] }) => {
    await updateProperty(id, updatedData);
  };

  const currentProperty: Property = {
    id,
    title,
    price,
    location,
    bedrooms,
    bathrooms,
    area,
    type,
    image,
    images: propertyImages,
    featured: featured || false,
    phone,
    user_id: user_id || '',
    status: 'available',
    listing_type: 'sale',
    created_at: '',
    updated_at: '',
  };
  
  // Use multiple images if available, fallback to single image or placeholder
  const images = propertyImages && propertyImages.length > 0 
    ? propertyImages 
    : (image ? [image] : ['/placeholder.svg']);
  
  // Mask phone number for display
  const maskPhoneNumber = (phone: string) => {
    if (!phone || phone.length < 6) return phone;
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length < 6) return phone;
    return `${cleaned.slice(0, 3)}-***-**${cleaned.slice(-2)}`;
  };
  
  return (
    <Card className="group cursor-pointer transition-smooth hover:shadow-elegant hover:-translate-y-1 overflow-hidden bg-gradient-card">
      <div className="relative overflow-hidden">
        {/* Image Grid */}
        <div className="relative">
          {images.length === 1 ? (
            <img 
              src={images[0]} 
              alt={title}
              className="w-full h-48 object-cover transition-smooth group-hover:scale-105"
              onClick={() => setIsGalleryOpen(true)}
            />
          ) : images.length === 2 ? (
            <div className="grid grid-cols-2 gap-1 h-48">
              {images.slice(0, 2).map((img, idx) => (
                <img
                  key={idx}
                  src={img}
                  alt={`${title} - Photo ${idx + 1}`}
                  className="w-full h-full object-cover transition-smooth group-hover:scale-105 cursor-pointer"
                  onClick={() => setIsGalleryOpen(true)}
                />
              ))}
            </div>
          ) : images.length === 3 ? (
            <div className="grid grid-cols-2 gap-1 h-48">
              <img
                src={images[0]}
                alt={`${title} - Photo 1`}
                className="w-full h-full object-cover transition-smooth group-hover:scale-105 cursor-pointer"
                onClick={() => setIsGalleryOpen(true)}
              />
              <div className="grid grid-rows-2 gap-1">
                {images.slice(1, 3).map((img, idx) => (
                  <img
                    key={idx}
                    src={img}
                    alt={`${title} - Photo ${idx + 2}`}
                    className="w-full h-full object-cover transition-smooth group-hover:scale-105 cursor-pointer"
                    onClick={() => setIsGalleryOpen(true)}
                  />
                ))}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-1 h-48">
              <img
                src={images[0]}
                alt={`${title} - Photo 1`}
                className="w-full h-full object-cover transition-smooth group-hover:scale-105 cursor-pointer"
                onClick={() => setIsGalleryOpen(true)}
              />
              <div className="grid grid-rows-2 gap-1">
                {images.slice(1, 3).map((img, idx) => (
                  <img
                    key={idx}
                    src={img}
                    alt={`${title} - Photo ${idx + 2}`}
                    className="w-full h-full object-cover transition-smooth group-hover:scale-105 cursor-pointer"
                    onClick={() => setIsGalleryOpen(true)}
                  />
                ))}
                {images.length > 3 && (
                  <div 
                    className="relative cursor-pointer"
                    onClick={() => setIsGalleryOpen(true)}
                  >
                    <img
                      src={images[3]}
                      alt={`${title} - Photo 4`}
                      className="w-full h-full object-cover transition-smooth group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/70 flex items-center justify-center text-white font-semibold text-lg">
                      +{images.length - 3} more
                    </div>
                  </div>
                )}
              </div>
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
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-smooth flex items-center justify-center pointer-events-none">
          <div className="text-white text-center">
            <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2 border border-white/30">
              <span className="text-sm font-medium">📸 Click to View & Zoom</span>
            </div>
          </div>
        </div>
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

          {phone && !isOwner && (
            <div className="space-y-2 pt-2">
              <div className="text-sm text-muted-foreground flex items-center gap-2">
                <MessageCircle className="h-4 w-4" />
                <span>Contact: {maskPhoneNumber(phone)}</span>
              </div>
              <Button
                size="sm"
                className="w-full bg-[#25D366] hover:bg-[#20BA5A] text-white"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowContactDialog(true);
                }}
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                Contact via WhatsApp
              </Button>
            </div>
          )}

          {isOwner && (
            <div className="pt-2 space-y-2">
              <Button 
                size="sm" 
                variant="outline" 
                className="w-full"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowEditDialog(true);
                }}
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit Property
              </Button>
              <Button 
                size="sm" 
                variant="destructive" 
                className="w-full"
                onClick={handleRemoveProperty}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Remove Property
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
      
      <ContactDialog
        isOpen={showContactDialog}
        onClose={() => setShowContactDialog(false)}
        propertyId={id}
        propertyTitle={title}
        phoneNumber={phone || ''}
      />
      
      <EditPropertyDialog
        isOpen={showEditDialog}
        onClose={() => setShowEditDialog(false)}
        property={currentProperty}
        onSave={handleEditProperty}
      />
    </Card>
  );
};