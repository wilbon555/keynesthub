import { useState, useRef, useCallback, useEffect } from "react";
import { X, Sparkles, MoreVertical, Share2, Edit, Trash2, Heart, ChevronLeft, ChevronRight } from "lucide-react";
import { AIInsightsPanel } from "./ai/AIInsightsPanel";
import { PropertyForAI } from "@/hooks/usePropertyAI";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

interface PhotoGalleryProps {
  images: string[];
  isOpen: boolean;
  onClose: () => void;
  initialIndex?: number;
  title?: string;
  property?: PropertyForAI;
  isOwner?: boolean;
}

export const PhotoGallery = ({
  images,
  isOpen,
  onClose,
  initialIndex = 0,
  title,
  property,
  isOwner = false,
}: PhotoGalleryProps) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [zoom, setZoom] = useState(1);
  const [showAIInsights, setShowAIInsights] = useState(false);

  // Touch/gesture state
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);
  const [translateX, setTranslateX] = useState(0);
  const [translateY, setTranslateY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [opacity, setOpacity] = useState(1);
  const [pinchDistance, setPinchDistance] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(initialIndex);
      setZoom(1);
      setTranslateX(0);
      setTranslateY(0);
      setOpacity(1);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isOpen, initialIndex]);

  const nextImage = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
    setZoom(1);
  }, [images.length]);

  const prevImage = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
    setZoom(1);
  }, [images.length]);

  // Pinch distance helper
  const getDistance = (touches: React.TouchList) => {
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      setPinchDistance(getDistance(e.touches));
      return;
    }
    if (zoom > 1) return; // don't swipe while zoomed
    setTouchStart({ x: e.touches[0].clientX, y: e.touches[0].clientY });
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    // Pinch-to-zoom
    if (e.touches.length === 2 && pinchDistance !== null) {
      const newDist = getDistance(e.touches);
      const scale = newDist / pinchDistance;
      setZoom((prev) => Math.min(Math.max(prev * scale, 0.5), 4));
      setPinchDistance(newDist);
      return;
    }
    if (!touchStart || zoom > 1) return;
    const dx = e.touches[0].clientX - touchStart.x;
    const dy = e.touches[0].clientY - touchStart.y;

    // Determine dominant direction
    if (Math.abs(dy) > Math.abs(dx) && dy > 0) {
      // Swipe down
      setTranslateY(dy);
      setOpacity(Math.max(1 - dy / 400, 0.2));
    } else {
      // Horizontal swipe
      setTranslateX(dx);
    }
  };

  const handleTouchEnd = () => {
    setPinchDistance(null);
    if (!touchStart) return;

    // Swipe down to close
    if (translateY > 120) {
      onClose();
    }
    // Horizontal swipe
    else if (Math.abs(translateX) > 60) {
      if (translateX < 0) nextImage();
      else prevImage();
    }

    setTouchStart(null);
    setTranslateX(0);
    setTranslateY(0);
    setOpacity(1);
    setIsDragging(false);
  };

  // Sharing helpers
  const getShareUrl = () => `${window.location.origin}/property/${property?.id || ""}`;
  const getShareText = () => `Check out: ${title || "this property"}`;
  const shareOnWhatsApp = () => window.open(`https://wa.me/?text=${encodeURIComponent(`${getShareText()} ${getShareUrl()}`)}`, "_blank");
  const shareOnFacebook = () => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(getShareUrl())}`, "_blank");
  const shareOnTwitter = () => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(getShareText())}&url=${encodeURIComponent(getShareUrl())}`, "_blank");
  const copyLink = async () => {
    try { await navigator.clipboard.writeText(getShareUrl()); toast.success("Link copied!"); } catch { toast.error("Failed to copy"); }
  };

  if (!isOpen || !images.length) return null;

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 bg-black flex flex-col"
      style={{ opacity }}
    >
      {/* Top bar */}
      <div className="absolute top-0 left-0 right-0 z-30 flex items-center justify-between px-3 pt-[env(safe-area-inset-top,12px)] pb-2">
        {/* Left: AI Insights */}
        <div className="flex items-center gap-2">
          {property && (
            <button
              onClick={() => setShowAIInsights(!showAIInsights)}
              className="text-white/80 hover:text-white p-2"
            >
              <Sparkles className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Center: counter */}
        {images.length > 1 && (
          <span className="text-white/70 text-sm font-medium">
            {currentIndex + 1} / {images.length}
          </span>
        )}

        {/* Right: 3-dot menu + close */}
        <div className="flex items-center gap-1">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="text-white/80 hover:text-white p-2">
                <MoreVertical className="w-5 h-5" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuSub>
                <DropdownMenuSubTrigger className="gap-2">
                  <Share2 className="h-4 w-4" /> Share
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  <DropdownMenuItem onClick={shareOnWhatsApp}>WhatsApp</DropdownMenuItem>
                  <DropdownMenuItem onClick={shareOnFacebook}>Facebook</DropdownMenuItem>
                  <DropdownMenuItem onClick={shareOnTwitter}>Twitter / X</DropdownMenuItem>
                  <DropdownMenuItem onClick={copyLink}>Copy Link</DropdownMenuItem>
                </DropdownMenuSubContent>
              </DropdownMenuSub>
              <DropdownMenuItem onClick={() => toast.info("Like feature")}>
                <Heart className="h-4 w-4 mr-2" /> Like
              </DropdownMenuItem>
              {isOwner && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => toast.info("Edit")}>
                    <Edit className="h-4 w-4 mr-2" /> Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => toast.info("Delete")}>
                    <Trash2 className="h-4 w-4 mr-2" /> Delete
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          <button onClick={onClose} className="text-white/80 hover:text-white p-2">
            <X className="w-5 h-5" strokeWidth={1.5} />
          </button>
        </div>
      </div>

      {/* Main image area with touch gestures */}
      <div
        className="flex-1 flex items-center justify-center overflow-hidden select-none"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <img
          src={images[currentIndex]}
          alt={`Property photo ${currentIndex + 1}`}
          className="max-w-full max-h-full object-contain"
          style={{
            transform: `translate(${translateX}px, ${translateY}px) scale(${zoom})`,
            transition: isDragging ? "none" : "transform 0.25s ease-out",
            touchAction: "none",
          }}
          draggable={false}
        />
      </div>

      {/* Desktop nav arrows */}
      {images.length > 1 && (
        <>
          <button
            onClick={prevImage}
            className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 z-20 text-white/60 hover:text-white p-2"
          >
            <ChevronLeft className="w-8 h-8" />
          </button>
          <button
            onClick={nextImage}
            className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 z-20 text-white/60 hover:text-white p-2"
          >
            <ChevronRight className="w-8 h-8" />
          </button>
        </>
      )}

      {/* Bottom pagination dots (mobile) / thumbnails (desktop) */}
      <div className="absolute bottom-6 left-0 right-0 z-20 flex justify-center">
        {/* Mobile: dots */}
        <div className="flex md:hidden gap-1.5">
          {images.map((_, idx) => (
            <button
              key={idx}
              onClick={() => { setCurrentIndex(idx); setZoom(1); }}
              className={`rounded-full transition-all ${
                currentIndex === idx
                  ? "w-6 h-2 bg-white"
                  : "w-2 h-2 bg-white/40"
              }`}
            />
          ))}
        </div>
        {/* Desktop: thumbnails without white borders */}
        <div className="hidden md:flex gap-2 bg-black/60 p-2 rounded-lg max-w-lg overflow-x-auto">
          {images.map((img, idx) => (
            <button
              key={idx}
              onClick={() => { setCurrentIndex(idx); setZoom(1); }}
              className={`flex-shrink-0 w-14 h-10 rounded-md overflow-hidden transition-all ${
                currentIndex === idx ? "ring-2 ring-white/60 scale-105" : "opacity-50 hover:opacity-80"
              }`}
            >
              <img src={img} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      </div>

      {/* Swipe-down indicator */}
      {translateY > 20 && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-30 text-white/50 text-xs">
          ↓ Release to close
        </div>
      )}

      {/* AI Insights Panel */}
      {property && showAIInsights && (
        <div className="absolute top-0 right-0 w-full md:w-[400px] h-full z-40 overflow-y-auto bg-background border-l">
          <AIInsightsPanel
            property={property}
            isOwner={isOwner}
            className="rounded-none border-0 h-full"
            onClose={() => setShowAIInsights(false)}
          />
        </div>
      )}
    </div>
  );
};
