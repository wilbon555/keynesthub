import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, X, ZoomIn, ZoomOut, Sparkles, ChevronDown, ChevronUp } from "lucide-react";
import { AIInsightsPanel } from "./ai/AIInsightsPanel";
import { PropertyForAI } from "@/hooks/usePropertyAI";

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
  isOwner = false
}: PhotoGalleryProps) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [zoom, setZoom] = useState(1);
  const [showAIInsights, setShowAIInsights] = useState(false);

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
    setZoom(1);
  };

  const prevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
    setZoom(1);
  };

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 0.5, 3));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 0.5, 0.5));
  };

  const resetZoom = () => {
    setZoom(1);
  };

  if (!images.length) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-none w-screen h-screen p-0 bg-black border-none rounded-none [&>button]:hidden">
        <div className="relative w-full h-full flex items-center justify-center">

          {/* Navigation buttons */}
          {images.length > 1 && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="absolute left-2 md:left-6 z-10 text-white hover:bg-white/20 h-10 w-10 md:h-12 md:w-12"
                onClick={prevImage}
              >
                <ChevronLeft className="w-6 h-6 md:w-8 md:h-8" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-2 md:right-6 z-10 text-white hover:bg-white/20 h-10 w-10 md:h-12 md:w-12"
                onClick={nextImage}
              >
                <ChevronRight className="w-6 h-6 md:w-8 md:h-8" />
              </Button>
            </>
          )}

          {/* Zoom controls */}
          <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-10 flex gap-2 bg-black/60 backdrop-blur-sm rounded-full px-2 py-1">
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/20 h-8 w-8"
              onClick={handleZoomOut}
              disabled={zoom <= 0.5}
            >
              <ZoomOut className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/20 min-w-14 h-8"
              onClick={resetZoom}
            >
              {Math.round(zoom * 100)}%
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/20 h-8 w-8"
              onClick={handleZoomIn}
              disabled={zoom >= 3}  
            >
              <ZoomIn className="w-4 h-4" />
            </Button>
          </div>

          {/* Image counter */}
          {images.length > 1 && (
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10 text-white bg-black/50 backdrop-blur-sm px-4 py-1.5 rounded-full text-sm font-medium">
              {currentIndex + 1} / {images.length}
            </div>
          )}

          {/* Top bar with title and controls */}
          <div className="absolute top-4 left-4 right-4 z-10 flex items-start justify-between gap-2">
            {title && (
              <div className="text-white bg-black/50 backdrop-blur-sm px-4 py-2 rounded-lg max-w-[40%] md:max-w-md flex-shrink min-w-0">
                <p className="text-sm font-medium truncate">{title}</p>
              </div>
            )}
            
            <div className="flex items-center gap-1 flex-shrink-0 ml-auto">
              {property && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-white/20 gap-1 px-2 md:px-3"
                  onClick={() => setShowAIInsights(!showAIInsights)}
                >
                  <Sparkles className="w-4 h-4" />
                  <span className="hidden sm:inline">AI Insights</span>
                  {showAIInsights ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                </Button>
              )}
              
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/20 h-9 w-9"
                onClick={onClose}
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Main image - full screen */}
          <div className="w-full h-full overflow-hidden flex items-center justify-center">
            <img
              src={images[currentIndex]}
              alt={`Property photo ${currentIndex + 1}`}
              className="max-w-full max-h-full object-contain transition-transform duration-200"
              style={{ 
                transform: `scale(${zoom})`,
                transformOrigin: 'center center'
              }}
              draggable={false}
            />
          </div>

          {/* Thumbnail strip */}
          {images.length > 1 && (
            <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2 z-10 flex gap-2 bg-black/60 backdrop-blur-sm p-2 rounded-lg max-w-md overflow-x-auto">
              {images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setCurrentIndex(index);
                    setZoom(1);
                  }}
                  className={`flex-shrink-0 w-12 h-12 rounded overflow-hidden transition-all ${
                    currentIndex === index 
                      ? 'ring-2 ring-white scale-110' 
                      : 'opacity-60 hover:opacity-100'
                  }`}
                >
                  <img
                    src={image}
                    alt={`Thumbnail ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}

          {/* AI Insights Panel */}
          {property && showAIInsights && (
            <div className="absolute top-0 right-0 w-full md:w-[400px] h-full z-20 overflow-y-auto bg-background/95 backdrop-blur-sm">
              <AIInsightsPanel 
                property={property}
                isOwner={isOwner}
                className="rounded-none border-0 h-full"
                onClose={() => setShowAIInsights(false)}
              />
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};