import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { PhotoGallery } from "@/components/PhotoGallery";
import ContactDialog from "@/components/ContactDialog";
import { VerificationBadge, AgentVerifiedBadge } from "@/components/VerificationBadge";
import { FavoriteButton } from "@/components/FavoriteButton";
import ShareButtons from "@/components/ShareButtons";
import { VirtualTourViewer } from "@/components/VirtualTourViewer";
import { QuickAIBadges } from "@/components/ai/QuickAIBadges";
import { PropertyLocationMap } from "@/components/PropertyLocationMap";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/useAuth";
import { useRecentlyViewed } from "@/hooks/useRecentlyViewed";
import { usePropertyViews } from "@/hooks/usePropertyViews";
import {
  MapPin, Bed, Bath, Square, MessageCircle, ArrowLeft, Video,
  Calendar, Building2, Layers, Clock, ChevronLeft, ChevronRight,
  Phone, Mail, Home
} from "lucide-react";
import type { Property } from "@/hooks/useProperties";

interface PropertyWithTour extends Property {
  virtual_tour_url?: string;
  virtual_tour_type?: string;
}

const formatPriceWithSuffix = (price: string, listingType: string, stayType?: string) => {
  if (listingType === 'sale') return price;
  if (stayType === 'short-term') return `${price}/night`;
  return `${price}/mo`;
};

const PropertyDetailJsonLd = ({ property }: { property: PropertyWithTour }) => {
  useEffect(() => {
    const existing = document.getElementById("property-detail-jsonld");
    if (existing) existing.remove();

    const priceNum = parseInt(property.price.replace(/[^\d]/g, ""), 10) || 0;
    const imageUrl = property.images?.[0] || property.image || "";

    const jsonLd = {
      "@context": "https://schema.org",
      "@type": "RealEstateListing",
      name: property.title,
      description: property.description || `${property.type} property in ${property.location}`,
      url: `${window.location.origin}/property/${property.id}`,
      image: property.images?.length ? property.images : imageUrl ? [imageUrl] : undefined,
      address: {
        "@type": "PostalAddress",
        addressLocality: property.location,
        ...(property.region && { addressRegion: property.region }),
        addressCountry: property.country || "KE",
      },
      offers: {
        "@type": "Offer",
        price: priceNum,
        priceCurrency: "KES",
        availability: property.status === "available"
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
      },
      ...(property.bedrooms && { numberOfRooms: property.bedrooms }),
      ...(property.bathrooms && { numberOfBathroomsTotal: property.bathrooms }),
      ...(property.area && {
        floorSize: { "@type": "QuantitativeValue", value: property.area, unitCode: "FTK" },
      }),
      datePosted: property.created_at,
    };

    const script = document.createElement("script");
    script.id = "property-detail-jsonld";
    script.type = "application/ld+json";
    script.textContent = JSON.stringify(jsonLd);
    document.head.appendChild(script);

    return () => {
      const el = document.getElementById("property-detail-jsonld");
      if (el) el.remove();
    };
  }, [property]);

  return null;
};

const PropertyDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToRecentlyViewed } = useRecentlyViewed();
  const { recordView } = usePropertyViews();

  const [property, setProperty] = useState<PropertyWithTour | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [galleryStartIndex, setGalleryStartIndex] = useState(0);
  const [showContactDialog, setShowContactDialog] = useState(false);
  const [showVirtualTour, setShowVirtualTour] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    if (!id) return;
    const fetchProperty = async () => {
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from("properties")
        .select("*")
        .eq("id", id)
        .single();

      if (fetchError || !data) {
        setError("Property not found");
        setLoading(false);
        return;
      }

      const prop = {
        ...data,
        image: data.images?.[0] || data.image || "/placeholder.svg",
        images: data.images?.length ? data.images : [data.image || "/placeholder.svg"],
      } as PropertyWithTour;

      setProperty(prop);
      setLoading(false);

      // Track view
      addToRecentlyViewed(id);
      recordView(id);
    };
    fetchProperty();
  }, [id]);

  // Update page title
  useEffect(() => {
    if (property) {
      document.title = `${property.title} - ${property.price} | KeyNestHub`;
    }
    return () => { document.title = "KeyNestHub - Premium Real Estate Platform"; };
  }, [property]);

  const images = property?.images?.length ? property.images : [property?.image || "/placeholder.svg"];
  const isOwner = user && property?.user_id && user.id === property.user_id;

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-6 max-w-5xl">
          <Skeleton className="h-8 w-32 mb-4" />
          <Skeleton className="w-full aspect-[16/9] rounded-xl mb-6" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-4">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-5 w-1/2" />
              <Skeleton className="h-24 w-full" />
            </div>
            <div>
              <Skeleton className="h-64 w-full rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-20 text-center">
          <Home className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <h1 className="text-2xl font-bold text-foreground mb-2">Property Not Found</h1>
          <p className="text-muted-foreground mb-6">This property may have been removed or is no longer available.</p>
          <Button onClick={() => navigate("/")}>Back to Home</Button>
        </div>
      </div>
    );
  }

  const openGallery = (index: number) => {
    setGalleryStartIndex(index);
    setIsGalleryOpen(true);
  };

  const contactButtonText = property.listing_type === "rent" ? "Inquire to Rent" : "Contact Owner";

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <PropertyDetailJsonLd property={property} />

      {/* Back button */}
      <div className="container mx-auto px-4 pt-4 max-w-5xl">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(-1)}
          className="text-muted-foreground hover:text-foreground mb-2"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back
        </Button>
      </div>

      {/* Hero Image Gallery */}
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="relative rounded-xl overflow-hidden">
          {/* Main image + grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-1 md:gap-2">
            {/* Main large image */}
            <div
              className="md:col-span-2 md:row-span-2 relative aspect-[16/9] md:aspect-auto md:h-[400px] cursor-pointer group"
              onClick={() => openGallery(0)}
            >
              <img
                src={images[0]}
                alt={property.title}
                className="w-full h-full object-cover rounded-xl md:rounded-l-xl md:rounded-r-none transition-transform duration-300 group-hover:scale-[1.02]"
              />
              {/* Mobile image nav */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={(e) => { e.stopPropagation(); setCurrentImageIndex((p) => (p - 1 + images.length) % images.length); }}
                    className="md:hidden absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-black/40 text-white flex items-center justify-center"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); setCurrentImageIndex((p) => (p + 1) % images.length); }}
                    className="md:hidden absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-black/40 text-white flex items-center justify-center"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                  <div className="md:hidden absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-0.5 rounded-full">
                    {currentImageIndex + 1}/{images.length}
                  </div>
                </>
              )}
            </div>

            {/* Side images (desktop only) */}
            {images.slice(1, 5).map((img, idx) => (
              <div
                key={idx}
                className="hidden md:block relative h-[196px] cursor-pointer group"
                onClick={() => openGallery(idx + 1)}
              >
                <img
                  src={img}
                  alt={`${property.title} - Photo ${idx + 2}`}
                  className="w-full h-full object-cover rounded-md transition-transform duration-300 group-hover:scale-[1.02]"
                />
                {idx === 3 && images.length > 5 && (
                  <div className="absolute inset-0 bg-black/50 rounded-md flex items-center justify-center">
                    <span className="text-white text-lg font-semibold">+{images.length - 5} more</span>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* View all photos button */}
          {images.length > 1 && (
            <Button
              variant="secondary"
              size="sm"
              className="absolute bottom-3 right-3 bg-background/90 backdrop-blur-sm shadow-md"
              onClick={() => openGallery(0)}
            >
              View all {images.length} photos
            </Button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-6 max-w-5xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Left: Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Title, price, badges */}
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <VerificationBadge
                  status={property.verification_status || "pending"}
                  details={{
                    titleDeedVerified: property.title_deed_verified,
                    taxesPaidVerified: property.taxes_paid_verified,
                    physicalInspectionDone: property.physical_inspection_done,
                  }}
                />
                <QuickAIBadges
                  property={{
                    id: property.id, title: property.title, price: property.price,
                    location: property.location, type: property.type,
                    bedrooms: property.bedrooms, bathrooms: property.bathrooms,
                    area: property.area, listing_type: property.listing_type,
                  }}
                />
                <Badge variant="secondary">{property.type}</Badge>
                <Badge variant="outline" className="capitalize">
                  {property.listing_type === "rent" ? "For Rent" : "For Sale"}
                </Badge>
              </div>

              <h1 className="text-2xl md:text-3xl font-bold text-foreground leading-tight">
                {property.title}
              </h1>

              <div className="flex items-center text-muted-foreground mt-1.5">
                <MapPin className="w-4 h-4 mr-1.5 shrink-0" />
                <span className="text-sm md:text-base">
                  {property.location}
                  {property.region && `, ${property.region}`}
                  {property.country && `, ${property.country}`}
                </span>
              </div>

              <div className="text-2xl md:text-3xl font-bold text-primary mt-3">
                {formatPriceWithSuffix(property.price, property.listing_type, property.stay_type)}
              </div>

              {/* Actions row */}
              <div className="flex items-center gap-2 mt-3">
                <FavoriteButton propertyId={property.id} />
                <ShareButtons propertyId={property.id} title={property.title} price={property.price} />
                {property.virtual_tour_url && property.virtual_tour_type !== "none" && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowVirtualTour(true)}
                  >
                    <Video className="w-4 h-4 mr-1" />
                    360° Tour
                  </Button>
                )}
              </div>
            </div>

            {/* Key features */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {property.bedrooms != null && (
                <div className="flex items-center gap-2 bg-muted/50 rounded-lg p-3">
                  <Bed className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-sm font-medium text-foreground">{property.bedrooms}</p>
                    <p className="text-xs text-muted-foreground">Bedrooms</p>
                  </div>
                </div>
              )}
              {property.bathrooms != null && (
                <div className="flex items-center gap-2 bg-muted/50 rounded-lg p-3">
                  <Bath className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-sm font-medium text-foreground">{property.bathrooms}</p>
                    <p className="text-xs text-muted-foreground">Bathrooms</p>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-2 bg-muted/50 rounded-lg p-3">
                <Square className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-sm font-medium text-foreground">{property.area}</p>
                  <p className="text-xs text-muted-foreground">Area</p>
                </div>
              </div>
              {property.listing_type === "rent" && property.stay_type && (
                <div className="flex items-center gap-2 bg-muted/50 rounded-lg p-3">
                  <Clock className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-sm font-medium text-foreground capitalize">{property.stay_type}</p>
                    <p className="text-xs text-muted-foreground">Stay Type</p>
                  </div>
                </div>
              )}
            </div>

            {/* Additional details */}
            {(property.floors || property.building_age != null || property.developer || property.total_units) && (
              <div>
                <h2 className="text-lg font-semibold text-foreground mb-3">Property Details</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {property.floors && (
                    <div className="flex items-center gap-2">
                      <Layers className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm text-foreground">{property.floors} Floors</span>
                    </div>
                  )}
                  {property.building_age != null && (
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm text-foreground">{property.building_age} years old</span>
                    </div>
                  )}
                  {property.developer && (
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm text-foreground">{property.developer}</span>
                    </div>
                  )}
                  {property.total_units && (
                    <div className="flex items-center gap-2">
                      <Home className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm text-foreground">
                        {property.vacant_units ?? 0}/{property.total_units} units available
                      </span>
                    </div>
                  )}
                  {property.maintenance_quality && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">Maintenance:</span>
                      <span className="text-sm text-foreground capitalize">{property.maintenance_quality}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Description */}
            {property.description && (
              <div>
                <h2 className="text-lg font-semibold text-foreground mb-3">Description</h2>
                <p className="text-sm md:text-base text-muted-foreground leading-relaxed whitespace-pre-line">
                  {property.description}
                </p>
              </div>
            )}

            {/* Listed date */}
            <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2 border-t border-border">
              <Calendar className="w-3.5 h-3.5" />
              <span>Listed on {new Date(property.created_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</span>
            </div>
          </div>

          {/* Right: Contact card (sticky on desktop) */}
          <div className="lg:col-span-1">
            <div className="sticky top-20 space-y-4">
              <div className="bg-card border border-border rounded-xl p-5 shadow-sm space-y-4">
                <h3 className="font-semibold text-foreground text-lg">Interested in this property?</h3>
                <p className="text-sm text-muted-foreground">
                  Submit an inquiry and a KeyNestHub agent will contact you to schedule a viewing.
                </p>

                {property.phone && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Phone className="w-4 h-4" />
                    <span>
                      {property.phone.length >= 6
                        ? `${property.phone.replace(/\D/g, "").slice(0, 3)}-***-**${property.phone.replace(/\D/g, "").slice(-2)}`
                        : property.phone}
                    </span>
                  </div>
                )}

                {!isOwner && (
                  <Button
                    className="w-full"
                    size="lg"
                    onClick={() => setShowContactDialog(true)}
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    {contactButtonText}
                  </Button>
                )}

                {isOwner && (
                  <p className="text-sm text-muted-foreground italic text-center">
                    This is your property listing.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
      <MobileBottomNav />

      {/* Dialogs */}
      <PhotoGallery
        images={images}
        isOpen={isGalleryOpen}
        onClose={() => setIsGalleryOpen(false)}
        initialIndex={galleryStartIndex}
        title={property.title}
        property={{
          id: property.id, title: property.title, price: property.price,
          location: property.location, type: property.type,
          bedrooms: property.bedrooms, bathrooms: property.bathrooms,
          area: property.area, listing_type: property.listing_type,
        }}
        isOwner={!!isOwner}
      />

      <ContactDialog
        isOpen={showContactDialog}
        onClose={() => setShowContactDialog(false)}
        propertyId={property.id}
        propertyTitle={property.title}
        phoneNumber={property.phone || ""}
        listingType={property.listing_type as "sale" | "rent"}
        propertyType={property.type}
      />

      {property.virtual_tour_url && property.virtual_tour_type !== "none" && (
        <VirtualTourViewer
          isOpen={showVirtualTour}
          onClose={() => setShowVirtualTour(false)}
          tourUrl={property.virtual_tour_url}
          tourType={property.virtual_tour_type as any}
          title={property.title}
        />
      )}
    </div>
  );
};

export default PropertyDetail;
