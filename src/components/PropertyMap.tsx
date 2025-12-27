import React, { useState, useCallback, useEffect, useRef } from 'react';
import { GoogleMap, useJsApiLoader, OverlayView, InfoWindow, Autocomplete } from '@react-google-maps/api';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Home, Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface Property {
  id: string;
  title: string;
  price: string;
  location: string;
  type: string;
  image?: string | null;
  bedrooms?: number | null;
  bathrooms?: number | null;
}

interface PropertyMapProps {
  properties: Property[];
}

interface MarkerData {
  property: Property;
  position: google.maps.LatLngLiteral;
}

const containerStyle = {
  width: '100%',
  height: '500px'
};

const defaultCenter = {
  lat: 20,
  lng: 0
};

const libraries: ("places")[] = ["places"];

// Custom marker component
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
        className={`
          flex items-center justify-center w-10 h-10 rounded-full 
          shadow-lg cursor-pointer transition-all duration-200 
          hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2
          ${isSelected 
            ? 'bg-primary scale-110 ring-2 ring-primary/50' 
            : 'bg-primary hover:bg-primary/90'
          }
        `}
        aria-label="Property location"
      >
        <Home className="w-5 h-5 text-primary-foreground" />
      </button>
    </OverlayView>
  );
};

// Search box component
const MapSearchBox: React.FC<{
  onPlaceSelected: (location: google.maps.LatLngLiteral, zoom: number) => void;
}> = ({ onPlaceSelected }) => {
  const [autocomplete, setAutocomplete] = useState<google.maps.places.Autocomplete | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const onLoad = useCallback((autocompleteInstance: google.maps.places.Autocomplete) => {
    setAutocomplete(autocompleteInstance);
  }, []);

  const onPlaceChanged = useCallback(() => {
    if (autocomplete) {
      const place = autocomplete.getPlace();
      if (place.geometry?.location) {
        const location = {
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng()
        };
        
        // Determine zoom level based on place type
        let zoom = 12;
        if (place.types?.includes('country')) {
          zoom = 5;
        } else if (place.types?.includes('administrative_area_level_1')) {
          zoom = 7;
        } else if (place.types?.includes('locality')) {
          zoom = 12;
        } else if (place.types?.includes('neighborhood') || place.types?.includes('sublocality')) {
          zoom = 14;
        } else if (place.types?.includes('street_address') || place.types?.includes('premise')) {
          zoom = 16;
        }
        
        onPlaceSelected(location, zoom);
      }
    }
  }, [autocomplete, onPlaceSelected]);

  const clearSearch = useCallback(() => {
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  }, []);

  return (
    <div className="absolute top-4 left-4 z-20 w-72">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
        <Autocomplete
          onLoad={onLoad}
          onPlaceChanged={onPlaceChanged}
        >
          <Input
            ref={inputRef}
            type="text"
            placeholder="Search locations..."
            className="pl-9 pr-9 bg-background/95 backdrop-blur-sm shadow-lg border-border/50"
          />
        </Autocomplete>
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
          onClick={clearSearch}
        >
          <X className="w-3 h-3" />
        </Button>
      </div>
    </div>
  );
};

// Inner component that only renders after API key is available
const GoogleMapWrapper: React.FC<{ apiKey: string; properties: Property[] }> = ({ apiKey, properties }) => {
  const [markers, setMarkers] = useState<MarkerData[]>([]);
  const [selectedMarker, setSelectedMarker] = useState<MarkerData | null>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [geocoding, setGeocoding] = useState(true);

  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: apiKey,
    libraries,
  });

  // Geocode properties when map is loaded
  useEffect(() => {
    if (!isLoaded || !map) return;

    const geocodeProperties = async () => {
      const geocoder = new google.maps.Geocoder();
      const newMarkers: MarkerData[] = [];
      const bounds = new google.maps.LatLngBounds();

      for (const property of properties) {
        try {
          const result = await new Promise<google.maps.GeocoderResult[]>((resolve, reject) => {
            geocoder.geocode({ address: property.location }, (results, status) => {
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
              lng: result[0].geometry.location.lng()
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
      
      setGeocoding(false);
    };

    geocodeProperties();
  }, [isLoaded, properties, map]);

  const onLoad = useCallback((map: google.maps.Map) => {
    setMap(map);
  }, []);

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  const handlePlaceSelected = useCallback((location: google.maps.LatLngLiteral, zoom: number) => {
    if (map) {
      map.panTo(location);
      map.setZoom(zoom);
    }
  }, [map]);

  if (loadError) {
    return (
      <div className="w-full h-[500px] bg-muted rounded-lg flex items-center justify-center">
        <p className="text-muted-foreground">Failed to load map</p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-[500px] rounded-lg overflow-hidden shadow-lg">
      {(!isLoaded || geocoding) && (
        <div className="absolute inset-0 bg-muted flex items-center justify-center z-10">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      )}
      {isLoaded && (
        <>
          <MapSearchBox onPlaceSelected={handlePlaceSelected} />
          <GoogleMap
            mapContainerStyle={containerStyle}
            center={defaultCenter}
            zoom={2}
            onLoad={onLoad}
            onUnmount={onUnmount}
            options={{
              streetViewControl: false,
              mapTypeControl: false,
            }}
          >
            {markers.map((marker) => (
              <CustomMarker
                key={marker.property.id}
                position={marker.position}
                onClick={() => setSelectedMarker(marker)}
                isSelected={selectedMarker?.property.id === marker.property.id}
              />
            ))}

            {selectedMarker && (
              <InfoWindow
                position={selectedMarker.position}
                onCloseClick={() => setSelectedMarker(null)}
              >
                <div className="p-2 max-w-[200px]">
                  {selectedMarker.property.image && (
                    <img 
                      src={selectedMarker.property.image} 
                      alt={selectedMarker.property.title} 
                      className="w-full h-24 object-cover rounded mb-2" 
                    />
                  )}
                  <h3 className="font-semibold text-sm">{selectedMarker.property.title}</h3>
                  <p className="font-bold text-sm text-green-600">{selectedMarker.property.price}</p>
                  <p className="text-xs text-gray-500">{selectedMarker.property.location}</p>
                  <div className="flex gap-2 text-xs text-gray-500 mt-1">
                    {selectedMarker.property.bedrooms && <span>{selectedMarker.property.bedrooms} beds</span>}
                    {selectedMarker.property.bathrooms && <span>{selectedMarker.property.bathrooms} baths</span>}
                  </div>
                </div>
              </InfoWindow>
            )}
          </GoogleMap>
        </>
      )}
    </div>
  );
};

// Main component that fetches API key first
const PropertyMap: React.FC<PropertyMapProps> = ({ properties }) => {
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchApiKey = async () => {
      try {
        const { data, error: fetchError } = await supabase.functions.invoke('get-google-maps-key');
        
        if (fetchError || !data?.apiKey) {
          throw new Error('Failed to load map configuration');
        }
        
        setApiKey(data.apiKey);
      } catch (err) {
        console.error('Failed to fetch Google Maps API key:', err);
        setError(err instanceof Error ? err.message : 'Failed to load map');
      }
    };

    fetchApiKey();
  }, []);

  if (error) {
    return (
      <div className="w-full h-[500px] bg-muted rounded-lg flex items-center justify-center">
        <p className="text-muted-foreground">{error}</p>
      </div>
    );
  }

  if (!apiKey) {
    return (
      <div className="w-full h-[500px] bg-muted rounded-lg flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return <GoogleMapWrapper apiKey={apiKey} properties={properties} />;
};

export default PropertyMap;
