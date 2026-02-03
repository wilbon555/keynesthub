import React, { useState, useCallback, useEffect, useRef } from 'react';
import { GoogleMap, useJsApiLoader, OverlayView, InfoWindow, Autocomplete } from '@react-google-maps/api';
import { supabase } from '@/integrations/supabase/client';
import { Navigation } from '@/components/Navigation';
import { SmartSearchInput } from '@/components/discover/SmartSearchInput';
import { SearchResultsPanel } from '@/components/discover/SearchResultsPanel';
import { useSmartSearch } from '@/hooks/useSmartSearch';
import { Loader2, Home, Locate, Layers, Map as MapIcon, Satellite, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface Property {
  id: string;
  title: string;
  price: string;
  location: string;
  type: string;
  image?: string | null;
  bedrooms?: number | null;
  bathrooms?: number | null;
  area: string;
  listing_type: string;
  status?: string | null;
  verification_status?: string;
}

const containerStyle = {
  width: '100%',
  height: '100%',
};

const defaultCenter = {
  lat: -1.2921,
  lng: 36.8219,
};

const libraries: ("places")[] = ["places"];

const CustomMarker: React.FC<{
  position: google.maps.LatLngLiteral;
  onClick: () => void;
  isSelected: boolean;
}> = ({ position, onClick, isSelected }) => {
  return (
    <OverlayView
      position={position}
      mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
      getPixelPositionOffset={(width, height) => ({
        x: -(width / 2),
        y: -height,
      })}
    >
      <button
        onClick={onClick}
        className={cn(
          "flex items-center justify-center w-10 h-10 rounded-full shadow-lg cursor-pointer transition-all duration-200 hover:scale-110",
          isSelected
            ? 'bg-primary scale-110 ring-2 ring-primary/50'
            : 'bg-primary hover:bg-primary/90'
        )}
        aria-label="Property location"
      >
        <Home className="w-5 h-5 text-primary-foreground" />
      </button>
    </OverlayView>
  );
};

export default function Discover() {
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [apiKeyLoading, setApiKeyLoading] = useState(true);
  const [properties, setProperties] = useState<Property[]>([]);
  const [propertiesLoading, setPropertiesLoading] = useState(true);
  const [markers, setMarkers] = useState<Array<{ property: Property; position: google.maps.LatLngLiteral }>>([]);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [mapType, setMapType] = useState<'roadmap' | 'satellite' | 'hybrid'>('roadmap');
  const [showPanel, setShowPanel] = useState(true);
  const { toast } = useToast();

  const { search, isSearching, lastResult, clearSearch } = useSmartSearch();

  // Fetch API key
  useEffect(() => {
    const fetchApiKey = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('get-google-maps-key');
        if (error) throw error;
        if (data?.apiKey) {
          setApiKey(data.apiKey);
        }
      } catch (err) {
        console.error('Failed to fetch Google Maps API key:', err);
        toast({
          title: "Map Error",
          description: "Failed to load map. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setApiKeyLoading(false);
      }
    };
    fetchApiKey();
  }, [toast]);

  // Fetch properties
  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const { data, error } = await supabase
          .from('properties')
          .select('*')
          .eq('verification_status', 'verified')
          .eq('status', 'available');

        if (error) throw error;
        setProperties(data || []);
      } catch (err) {
        console.error('Failed to fetch properties:', err);
      } finally {
        setPropertiesLoading(false);
      }
    };
    fetchProperties();
  }, []);

  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script-discover',
    googleMapsApiKey: apiKey || '',
    libraries,
  });

  // Geocode properties when map is loaded
  useEffect(() => {
    if (!isLoaded || !map || properties.length === 0) return;

    const geocodeProperties = async () => {
      const geocoder = new google.maps.Geocoder();
      const newMarkers: Array<{ property: Property; position: google.maps.LatLngLiteral }> = [];
      const bounds = new google.maps.LatLngBounds();

      for (const property of properties) {
        try {
          const result = await new Promise<google.maps.GeocoderResult[]>((resolve, reject) => {
            geocoder.geocode({ address: property.location + ', Kenya' }, (results, status) => {
              if (status === 'OK' && results) {
                resolve(results);
              } else {
                reject(new Error(`Geocoding failed: ${status}`));
              }
            });
          });

          if (result[0]) {
            const position = {
              lat: result[0].geometry.location.lat(),
              lng: result[0].geometry.location.lng(),
            };
            newMarkers.push({ property, position });
            bounds.extend(position);
          }
        } catch (err) {
          console.error(`Failed to geocode: ${property.location}`, err);
        }
      }

      setMarkers(newMarkers);

      if (newMarkers.length > 0) {
        map.fitBounds(bounds, 50);
        google.maps.event.addListenerOnce(map, 'bounds_changed', () => {
          if (map.getZoom()! > 12) {
            map.setZoom(12);
          }
        });
      }
    };

    geocodeProperties();
  }, [isLoaded, map, properties]);

  const onLoad = useCallback((map: google.maps.Map) => {
    setMap(map);
  }, []);

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  const handleSearch = async (query: string) => {
    const result = await search(query, properties);
    if (result?.matchedProperties && result.matchedProperties.length > 0) {
      // Focus map on matched properties
      const matchedIds = new Set(result.matchedProperties.map((p: any) => p.id));
      const matchedMarkers = markers.filter(m => matchedIds.has(m.property.id));
      
      if (matchedMarkers.length > 0 && map) {
        const bounds = new google.maps.LatLngBounds();
        matchedMarkers.forEach(m => bounds.extend(m.position));
        map.fitBounds(bounds, 50);
      }
    }
  };

  const handlePropertySelect = (property: Property) => {
    setSelectedProperty(property);
    
    // Pan to property on map
    const marker = markers.find(m => m.property.id === property.id);
    if (marker && map) {
      map.panTo(marker.position);
      map.setZoom(14);
    }
  };

  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      toast({
        title: "Geolocation not supported",
        description: "Your browser doesn't support geolocation.",
        variant: "destructive",
      });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        if (map) {
          map.panTo(location);
          map.setZoom(14);
        }
      },
      (error) => {
        toast({
          title: "Location error",
          description: "Unable to get your location.",
          variant: "destructive",
        });
      }
    );
  };

  const toggleMapType = () => {
    const types: Array<'roadmap' | 'satellite' | 'hybrid'> = ['roadmap', 'satellite', 'hybrid'];
    const currentIndex = types.indexOf(mapType);
    const nextIndex = (currentIndex + 1) % types.length;
    setMapType(types[nextIndex]);
    if (map) {
      map.setMapTypeId(types[nextIndex]);
    }
  };

  // Filter markers based on search results
  const displayMarkers = lastResult?.matchedProperties
    ? markers.filter(m => lastResult.matchedProperties?.some((p: any) => p.id === m.property.id))
    : markers;

  if (apiKeyLoading || propertiesLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!apiKey || loadError) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="flex items-center justify-center h-[calc(100vh-80px)]">
          <div className="text-center">
            <p className="text-destructive">Failed to load map.</p>
            <Link to="/" className="text-primary hover:underline mt-2 inline-block">
              Return to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-background">
      <Navigation />
      
      <div className="flex-1 relative overflow-hidden">
        {/* Search Bar - Floating */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 w-full max-w-2xl px-4">
          <SmartSearchInput
            onSearch={handleSearch}
            isSearching={isSearching}
            suggestions={lastResult?.suggestions}
            onSuggestionClick={handleSearch}
          />
        </div>

        {/* Map Controls */}
        <div className="absolute top-4 right-4 z-20 flex flex-col gap-2">
          <Button
            variant="outline"
            size="icon"
            className="bg-background/95 backdrop-blur-sm shadow-lg"
            onClick={handleLocateMe}
            title="Locate me"
          >
            <Locate className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="bg-background/95 backdrop-blur-sm shadow-lg"
            onClick={toggleMapType}
            title={`Switch to ${mapType === 'roadmap' ? 'satellite' : mapType === 'satellite' ? 'hybrid' : 'roadmap'} view`}
          >
            {mapType === 'satellite' || mapType === 'hybrid' ? (
              <MapIcon className="w-4 h-4" />
            ) : (
              <Satellite className="w-4 h-4" />
            )}
          </Button>
          <Button
            variant="outline"
            size="icon"
            className={cn(
              "bg-background/95 backdrop-blur-sm shadow-lg",
              showPanel && "bg-primary text-primary-foreground"
            )}
            onClick={() => setShowPanel(!showPanel)}
            title={showPanel ? "Hide results" : "Show results"}
          >
            <Layers className="w-4 h-4" />
          </Button>
        </div>

        {/* Results Panel */}
        {showPanel && (
          <div className="absolute left-4 top-24 bottom-4 z-20 w-80">
            <SearchResultsPanel
              result={lastResult}
              properties={properties}
              isLoading={isSearching}
              onPropertySelect={handlePropertySelect}
              selectedPropertyId={selectedProperty?.id}
              className="h-full bg-background/95 backdrop-blur-sm"
            />
          </div>
        )}

        {/* Clear Search Button */}
        {lastResult && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20">
            <Button
              variant="secondary"
              size="sm"
              onClick={clearSearch}
              className="shadow-lg"
            >
              <X className="w-4 h-4 mr-2" />
              Clear Search
            </Button>
          </div>
        )}

        {/* Google Map */}
        {isLoaded && (
          <GoogleMap
            mapContainerStyle={containerStyle}
            center={defaultCenter}
            zoom={10}
            onLoad={onLoad}
            onUnmount={onUnmount}
            options={{
              mapTypeId: mapType,
              mapTypeControl: false,
              streetViewControl: false,
              fullscreenControl: false,
              zoomControl: true,
              zoomControlOptions: {
                position: google.maps.ControlPosition.RIGHT_BOTTOM,
              },
            }}
          >
            {displayMarkers.map((marker) => (
              <CustomMarker
                key={marker.property.id}
                position={marker.position}
                isSelected={selectedProperty?.id === marker.property.id}
                onClick={() => handlePropertySelect(marker.property)}
              />
            ))}

            {selectedProperty && (
              <InfoWindow
                position={markers.find(m => m.property.id === selectedProperty.id)?.position}
                onCloseClick={() => setSelectedProperty(null)}
              >
                <div className="p-2 max-w-xs">
                  {selectedProperty.image && (
                    <img
                      src={selectedProperty.image}
                      alt={selectedProperty.title}
                      className="w-full h-24 object-cover rounded-md mb-2"
                    />
                  )}
                  <h3 className="font-semibold text-sm">{selectedProperty.title}</h3>
                  <p className="text-primary font-bold text-sm">{selectedProperty.price}</p>
                  <p className="text-xs text-muted-foreground">{selectedProperty.location}</p>
                  <Link
                    to={`/buy/${selectedProperty.type.toLowerCase()}`}
                    className="text-xs text-primary hover:underline mt-2 inline-block"
                  >
                    View Details →
                  </Link>
                </div>
              </InfoWindow>
            )}
          </GoogleMap>
        )}

        {!isLoaded && (
          <div className="w-full h-full flex items-center justify-center bg-muted">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        )}
      </div>
    </div>
  );
}
