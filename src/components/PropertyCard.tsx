import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Bed, Bath, Square, MessageCircle, Trash2, Edit, Video, MoreVertical, Heart, Share2, ChevronLeft, ChevronRight } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu";
import { PhotoGallery } from "./PhotoGallery";
import ContactDialog from "./ContactDialog";
import { EditPropertyDialog } from "./EditPropertyDialog";
import { VerificationBadge } from "./VerificationBadge";
import { useFavorites } from "@/hooks/useFavorites";
import { VirtualTourViewer } from "./VirtualTourViewer";
import { QuickAIBadges } from "./ai/QuickAIBadges";
import { useProperties, Property } from "@/hooks/useProperties";
import { useAuth } from "@/hooks/useAuth";
import { useRecentlyViewed } from "@/hooks/useRecentlyViewed";
import { usePropertyViews } from "@/hooks/usePropertyViews";
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
  listing_type?: 'sale' | 'rent';
  verification_status?: string;
  title_deed_verified?: boolean;
  taxes_paid_verified?: boolean;
  physical_inspection_done?: boolean;
  virtual_tour_url?: string;
  virtual_tour_type?: 'none' | '360_image' | 'video' | 'matterport' | 'external';
  total_units?: number;
  vacant_units?: number;
  stay_type?: 'long-term' | 'short-term';
}

const formatPriceWithSuffix = (price: string, listingType: string, stayType?: string) => {
  if (listingType === 'sale') return price;
  if (stayType === 'short-term') return `${price}/night`;
  return `${price}/mo`;
};

export const PropertyCard = ({
  id, title, price, location, bedrooms, bathrooms, area, type, image,
  images: propertyImages, featured = false, phone, user_id,
  listing_type = 'sale', verification_status = 'pending',
  title_deed_verified, taxes_paid_verified, physical_inspection_done,
  virtual_tour_url, virtual_tour_type = 'none', total_units, vacant_units,
  stay_type
}: PropertyCardProps) => {
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [showContactDialog, setShowContactDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showVirtualTour, setShowVirtualTour] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const { deleteProperty, updateProperty } = useProperties();
  const { user } = useAuth();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { addToRecentlyViewed } = useRecentlyViewed();
  const { recordView } = usePropertyViews();
  
  useEffect(() => {
    if (isGalleryOpen) {
      addToRecentlyViewed(id);
      recordView(id);
    }
  }, [isGalleryOpen, id, addToRecentlyViewed, recordView]);
  
  const isOwner = user && user_id && user.id === user_id;
  
  const handleRemoveProperty = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to remove this property? This action cannot be undone.')) {
      const success = await deleteProperty(id);
      if (success) toast.success('Property removed successfully');
    }
  };

  const handleEditProperty = async (updatedData: Partial<Property> & { uploadedFiles?: File[] }) => {
    await updateProperty(id, updatedData);
  };

  const currentProperty: Property = {
    id, title, price, location, bedrooms, bathrooms, area, type, image,
    images: propertyImages, featured: featured || false, phone,
    user_id: user_id || '', status: 'available', listing_type,
    created_at: '', updated_at: '',
  };

  const contactButtonText = listing_type === 'rent' ? 'Inquire to Rent' : 'Contact Owner';
  
  const images = propertyImages && propertyImages.length > 0 
    ? propertyImages 
    : (image ? [image] : ['/placeholder.svg']);
  
  const isFav = isFavorite(id);

  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await toggleFavorite(id);
  };

  const getShareUrl = () => `${window.location.origin}/property/${id}`;
  const getShareText = () => `Check out this property: ${title} - ${price}`;

  const shareOnWhatsApp = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.open(`https://wa.me/?text=${encodeURIComponent(`${getShareText()} ${getShareUrl()}`)}`, "_blank", "noopener,noreferrer");
  };
  const shareOnFacebook = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(getShareUrl())}`, "_blank", "noopener,noreferrer");
  };
  const shareOnTwitter = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(getShareText())}&url=${encodeURIComponent(getShareUrl())}`, "_blank", "noopener,noreferrer");
  };
  const copyLink = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try { await navigator.clipboard.writeText(getShareUrl()); toast.success("Link copied!"); } catch { toast.error("Failed to copy"); }
  };

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };
  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <Card className="group cursor-pointer transition-smooth hover:shadow-elegant hover:-translate-y-1 overflow-hidden bg-gradient-card">
      <div className="relative overflow-hidden">
        {/* Full-width 16:9 on mobile, fixed height on desktop */}
        <div className="relative aspect-[16/9] md:aspect-auto md:h-48">
          <img
            src={images[currentImageIndex]}
            alt={`${title} - Photo ${currentImageIndex + 1}`}
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover transition-all duration-300"
            onClick={() => setIsGalleryOpen(true)}
          />

          {/* Left/Right arrows */}
          {images.length > 1 && (
            <>
              <button
                onClick={prevImage}
                className="absolute left-1 top-1/2 -translate-y-1/2 z-10 h-7 w-7 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-1 top-1/2 -translate-y-1/2 z-10 h-7 w-7 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </>
          )}

          {/* Image counter */}
          {images.length > 1 && (
            <div className="absolute bottom-2 right-2 z-10 bg-black/60 text-white text-xs px-2 py-0.5 rounded-full">
              {currentImageIndex + 1}/{images.length}
            </div>
          )}

          {/* Dot indicators */}
          {images.length > 1 && (
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-10 flex gap-1">
              {images.slice(0, Math.min(images.length, 5)).map((_, idx) => (
                <span
                  key={idx}
                  className={`h-1.5 w-1.5 rounded-full transition-all ${
                    currentImageIndex === idx ? 'bg-white scale-125' : 'bg-white/50'
                  }`}
                />
              ))}
              {images.length > 5 && <span className="text-white/50 text-[8px] leading-none">…</span>}
            </div>
          )}
        </div>

        {/* Top-left badges - verification & AI overlaid on image for mobile */}
        <div className="absolute top-2 left-2 md:top-3 md:left-3 flex items-center gap-1 md:gap-2 flex-wrap z-30" onClick={(e) => e.stopPropagation()}>
          {/* Mobile-only: verification & AI badges on image */}
          <div className="flex md:hidden items-center gap-1">
            <VerificationBadge 
              status={verification_status} 
              details={{ titleDeedVerified: title_deed_verified, taxesPaidVerified: taxes_paid_verified, physicalInspectionDone: physical_inspection_done }}
            />
            <QuickAIBadges 
              property={{ id, title, price, location, type, bedrooms, bathrooms, area, listing_type }}
            />
          </div>
          {listing_type === 'rent' && vacant_units !== undefined && total_units !== undefined && (
            <Badge
              className={`border-0 text-[10px] md:text-xs ${
                vacant_units === 0
                  ? 'bg-destructive text-destructive-foreground'
                  : vacant_units <= 3
                    ? 'bg-orange-500 text-white'
                    : 'bg-green-600 text-white'
              }`}
            >
              {vacant_units === 0 ? 'Fully Rented' : `${vacant_units}/${total_units} Available`}
            </Badge>
          )}
          {virtual_tour_url && virtual_tour_type !== 'none' && (
            <Badge
              className="bg-accent text-accent-foreground border-0 cursor-pointer text-[10px] md:text-xs"
              onClick={(e) => { e.stopPropagation(); setShowVirtualTour(true); }}
            >
              <Video className="w-3 h-3 mr-1" />
              360°
            </Badge>
          )}
        </div>

        {/* Mobile-only: price overlay on bottom-left of image */}
        <div className="absolute bottom-2 left-2 z-10 md:hidden">
          <span className="bg-black/70 backdrop-blur-sm text-white font-bold text-sm px-2.5 py-1 rounded-xl">
            {formatPriceWithSuffix(price, listing_type, stay_type)}
          </span>
        </div>

        {/* Top-right: type badge + 3-dot menu */}
        <div className="absolute top-2 right-2 md:top-3 md:right-3 flex items-center gap-1.5 z-10">
          <Badge variant="secondary" className="text-[10px] md:text-xs">{type}</Badge>
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <button className="h-7 w-7 md:h-8 md:w-8 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-sm text-white flex items-center justify-center">
                <MoreVertical className="w-4 h-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48" onClick={(e) => e.stopPropagation()}>
              <DropdownMenuItem onClick={handleToggleFavorite} className="cursor-pointer gap-2">
                <Heart className={`h-4 w-4 ${isFav ? 'fill-red-500 text-red-500' : ''}`} />
                {isFav ? 'Remove from Wishlist' : 'Add to Wishlist'}
              </DropdownMenuItem>
              <DropdownMenuSub>
                <DropdownMenuSubTrigger className="gap-2">
                  <Share2 className="h-4 w-4" />
                  Share
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  <DropdownMenuItem onClick={shareOnWhatsApp} className="cursor-pointer">WhatsApp</DropdownMenuItem>
                  <DropdownMenuItem onClick={shareOnFacebook} className="cursor-pointer">Facebook</DropdownMenuItem>
                  <DropdownMenuItem onClick={shareOnTwitter} className="cursor-pointer">Twitter / X</DropdownMenuItem>
                  <DropdownMenuItem onClick={copyLink} className="cursor-pointer">Copy Link</DropdownMenuItem>
                </DropdownMenuSubContent>
              </DropdownMenuSub>
              {isOwner && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={(e) => { e.stopPropagation(); setShowEditDialog(true); }}
                    className="cursor-pointer gap-2"
                  >
                    <Edit className="h-4 w-4" />
                    Edit Property
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={handleRemoveProperty}
                    className="cursor-pointer gap-2 text-destructive focus:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete Property
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      
      <CardContent 
        className="p-3 md:p-4 cursor-pointer" 
        onClick={() => setIsGalleryOpen(true)}
      >
        <div className="space-y-2 md:space-y-3">
          <div>
            {/* Desktop-only: verification & AI badges inline */}
            <div className="hidden md:flex items-center gap-2 mb-1 flex-wrap">
              <VerificationBadge 
                status={verification_status} 
                details={{ titleDeedVerified: title_deed_verified, taxesPaidVerified: taxes_paid_verified, physicalInspectionDone: physical_inspection_done }}
              />
              <QuickAIBadges 
                property={{ id, title, price, location, type, bedrooms, bathrooms, area, listing_type }}
              />
            </div>
            <h3 className="font-semibold text-base md:text-lg leading-tight line-clamp-1 md:line-clamp-2 group-hover:text-primary transition-smooth">
              {title}
            </h3>
            <div className="flex items-center text-muted-foreground text-xs md:text-sm mt-0.5 md:mt-1">
              <MapPin className="w-3 h-3 md:w-4 md:h-4 mr-1" />
              {location}
            </div>
          </div>
          
          <div className="hidden md:block text-xl md:text-2xl font-bold text-primary">
            {formatPriceWithSuffix(price, listing_type, stay_type)}
          </div>
          
          {/* Icons only on mobile, icons + text labels on desktop */}
          <div className="flex items-center gap-3 md:gap-4 text-xs md:text-sm text-muted-foreground">
            {bedrooms && (
              <div className="flex items-center gap-1" title={`${bedrooms} bedrooms`}>
                <Bed className="w-3.5 h-3.5 md:w-4 md:h-4" />
                <span className="md:hidden">{bedrooms}</span>
                <span className="hidden md:inline">{bedrooms} beds</span>
              </div>
            )}
            {bathrooms && (
              <div className="flex items-center gap-1" title={`${bathrooms} bathrooms`}>
                <Bath className="w-3.5 h-3.5 md:w-4 md:h-4" />
                <span className="md:hidden">{bathrooms}</span>
                <span className="hidden md:inline">{bathrooms} baths</span>
              </div>
            )}
            <div className="flex items-center gap-1" title={area}>
              <Square className="w-3.5 h-3.5 md:w-4 md:h-4" />
              {area}
            </div>
          </div>

          {!isOwner && (
            <div className="space-y-2 pt-1 md:pt-2">
              {phone && (
                <div className="text-xs md:text-sm text-muted-foreground flex items-center gap-2">
                  <MessageCircle className="h-3.5 w-3.5 md:h-4 md:w-4" />
                  <span>Contact: {phone.length >= 6 ? `${phone.replace(/\D/g, '').slice(0, 3)}-***-**${phone.replace(/\D/g, '').slice(-2)}` : phone}</span>
                </div>
              )}
              <Button
                size="sm"
                className="w-full bg-primary hover:bg-primary/90"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowContactDialog(true);
                }}
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                {contactButtonText}
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
        property={{ id, title, price, location, type, bedrooms, bathrooms, area, listing_type }}
        isOwner={isOwner}
      />
      
      <ContactDialog
        isOpen={showContactDialog}
        onClose={() => setShowContactDialog(false)}
        propertyId={id}
        propertyTitle={title}
        phoneNumber={phone || ''}
        listingType={listing_type}
        propertyType={type}
      />
      
      <EditPropertyDialog
        isOpen={showEditDialog}
        onClose={() => setShowEditDialog(false)}
        property={currentProperty}
        onSave={handleEditProperty}
      />
      
      {virtual_tour_url && virtual_tour_type !== 'none' && (
        <VirtualTourViewer
          isOpen={showVirtualTour}
          onClose={() => setShowVirtualTour(false)}
          tourUrl={virtual_tour_url}
          tourType={virtual_tour_type}
          title={title}
        />
      )}
    </Card>
  );
};
