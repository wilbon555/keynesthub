import { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X, Maximize2, Minimize2, RotateCcw, Play, Pause } from 'lucide-react';

interface VirtualTourViewerProps {
  isOpen: boolean;
  onClose: () => void;
  tourUrl: string;
  tourType: 'none' | '360_image' | 'video' | 'matterport' | 'external';
  title?: string;
}

export const VirtualTourViewer = ({
  isOpen,
  onClose,
  tourUrl,
  tourType,
  title
}: VirtualTourViewerProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<any>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isAutoRotating, setIsAutoRotating] = useState(true);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (!isOpen || tourType !== '360_image' || !tourUrl) return;

    // Dynamically load Pannellum CSS
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://cdn.jsdelivr.net/npm/pannellum@2.5.6/build/pannellum.css';
    document.head.appendChild(link);

    // Dynamically load Pannellum JS
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/pannellum@2.5.6/build/pannellum.js';
    script.onload = () => {
      if (containerRef.current && (window as any).pannellum) {
        viewerRef.current = (window as any).pannellum.viewer(containerRef.current, {
          type: 'equirectangular',
          panorama: tourUrl,
          autoLoad: true,
          autoRotate: isAutoRotating ? -2 : 0,
          compass: true,
          showControls: false,
          mouseZoom: true,
          keyboardZoom: true,
          hfov: 100,
          minHfov: 50,
          maxHfov: 120,
        });
        setIsLoaded(true);
      }
    };
    document.body.appendChild(script);

    return () => {
      if (viewerRef.current) {
        viewerRef.current.destroy();
        viewerRef.current = null;
      }
      setIsLoaded(false);
    };
  }, [isOpen, tourUrl, tourType]);

  useEffect(() => {
    if (viewerRef.current && isLoaded) {
      viewerRef.current.setAutoRotate(isAutoRotating ? -2 : 0);
    }
  }, [isAutoRotating, isLoaded]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const resetView = () => {
    if (viewerRef.current) {
      viewerRef.current.setPitch(0);
      viewerRef.current.setYaw(0);
      viewerRef.current.setHfov(100);
    }
  };

  const renderContent = () => {
    switch (tourType) {
      case '360_image':
        return (
          <div 
            ref={containerRef} 
            className="w-full h-full min-h-[400px] bg-black"
            style={{ height: '70vh' }}
          />
        );
      
      case 'video':
        return (
          <video
            src={tourUrl}
            controls
            autoPlay
            className="w-full h-full object-contain"
            style={{ maxHeight: '70vh' }}
          />
        );
      
      case 'matterport':
      case 'external':
        return (
          <iframe
            src={tourUrl}
            className="w-full h-full border-0"
            style={{ height: '70vh' }}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; xr-spatial-tracking"
            allowFullScreen
          />
        );
      
      default:
        return (
          <div className="flex items-center justify-center h-64 text-muted-foreground">
            No virtual tour available
          </div>
        );
    }
  };

  if (tourType === 'none' || !tourUrl) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl w-full p-0 bg-black overflow-hidden">
        <div className="relative w-full">
          {/* Header */}
          <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between p-4 bg-gradient-to-b from-black/80 to-transparent">
            {title && (
              <h3 className="text-white font-medium truncate max-w-md">{title}</h3>
            )}
            <div className="flex items-center gap-2 ml-auto">
              {tourType === '360_image' && isLoaded && (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-white hover:bg-white/20"
                    onClick={() => setIsAutoRotating(!isAutoRotating)}
                    title={isAutoRotating ? 'Stop auto-rotate' : 'Start auto-rotate'}
                  >
                    {isAutoRotating ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-white hover:bg-white/20"
                    onClick={resetView}
                    title="Reset view"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-white hover:bg-white/20"
                    onClick={toggleFullscreen}
                    title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
                  >
                    {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                  </Button>
                </>
              )}
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/20"
                onClick={onClose}
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Tour content */}
          {renderContent()}

          {/* Instructions for 360 */}
          {tourType === '360_image' && (
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10 bg-black/60 text-white text-sm px-4 py-2 rounded-full">
              Drag to look around • Scroll to zoom
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
