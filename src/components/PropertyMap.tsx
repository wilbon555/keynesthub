import React, { useState, useCallback, useEffect, useRef } from 'react';
import { GoogleMap, useJsApiLoader, OverlayView, InfoWindow, Autocomplete, Polygon } from '@react-google-maps/api';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Home, Search, X, Locate, MapPin } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { PolygonDrawingControls } from './PolygonDrawingControls';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// Calculate distance between two coordinates using Haversine formula (returns km)
const calculateDistance = (
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number => {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// Check if a point is inside a polygon using ray casting algorithm
const isPointInPolygon = (
  point: google.maps.LatLngLiteral,
  polygon: google.maps.LatLngLiteral[]
): boolean => {
  let inside = false;
  const x = point.lng;
  const y = point.lat;

  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].lng;
    const yi = polygon[i].lat;
    const xj = polygon[j].lng;
    const yj = polygon[j].lat;

    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) {
      inside = !inside;
    }
  }

  return inside;
};

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

const libraries: ("places" | "drawing")[] = ["places", "drawing"];

// Custom marker component
const CustomMarker: React.FC<{
  position: google.maps.LatLngLiteral;
  onClick: () => void;
  isSelected: boolean;
  isNearby?: boolean;
  isInPolygon?: boolean;
}> = ({ position, onClick, isSelected, isNearby, isInPolygon }) => {
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
            : isInPolygon
            ? 'bg-purple-500 hover:bg-purple-600 ring-2 ring-purple-300'
            : isNearby
            ? 'bg-green-500 hover:bg-green-600 ring-2 ring-green-300'
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

// User location marker component
const UserLocationMarker: React.FC<{
  position: google.maps.LatLngLiteral;
}> = ({ position }) => {
  return (
    <OverlayView
      position={position}
      mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
      getPixelPositionOffset={(width, height) => ({
        x: -(width / 2),
        y: -(height / 2),
      })}
    >
      <div className="relative">
        <div className="w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-lg" />
        <div className="absolute inset-0 w-4 h-4 bg-blue-500 rounded-full animate-ping opacity-75" />
      </div>
    </OverlayView>
  );
};

// Locate Me button component
const LocateMeButton: React.FC<{
  onLocate: (position: google.maps.LatLngLiteral) => void;
}> = ({ onLocate }) => {
  const [isLocating, setIsLocating] = useState(false);
  const { toast } = useToast();

  const handleLocateMe = useCallback(() => {
    if (!navigator.geolocation) {
      toast({
        title: "Geolocation not supported",
        description: "Your browser doesn't support geolocation.",
        variant: "destructive",
      });
      return;
    }

    setIsLocating(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        onLocate(location);
        setIsLocating(false);
      },
      (error) => {
        setIsLocating(false);
        let message = "Unable to get your location.";
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            message = "Location permission was denied.";
            break;
          case error.POSITION_UNAVAILABLE:
            message = "Location information is unavailable.";
            break;
          case error.TIMEOUT:
            message = "Location request timed out.";
            break;
        }
        
        toast({
          title: "Location error",
          description: message,
          variant: "destructive",
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  }, [onLocate, toast]);

  return (
    <Button
      variant="outline"
      size="icon"
      className="absolute top-4 right-4 z-20 bg-background/95 backdrop-blur-sm shadow-lg border-border/50"
      onClick={handleLocateMe}
      disabled={isLocating}
      aria-label="Locate me"
    >
      {isLocating ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <Locate className="w-4 h-4" />
      )}
    </Button>
  );
};

// Radius options in km
const RADIUS_OPTIONS = [
  { value: '5', label: '5 km' },
  { value: '10', label: '10 km' },
  { value: '25', label: '25 km' },
  { value: '50', label: '50 km' },
  { value: '100', label: '100 km' },
];

// Nearby properties control component
const NearbyPropertiesControl: React.FC<{
  userLocation: google.maps.LatLngLiteral | null;
  showNearby: boolean;
  radius: number;
  nearbyCount: number;
  onToggleNearby: () => void;
  onRadiusChange: (radius: number) => void;
}> = ({ userLocation, showNearby, radius, nearbyCount, onToggleNearby, onRadiusChange }) => {
  if (!userLocation) return null;

  return (
    <div className="absolute bottom-4 left-4 z-20 flex items-center gap-2">
      <Button
        variant={showNearby ? "default" : "outline"}
        size="sm"
        className="bg-background/95 backdrop-blur-sm shadow-lg border-border/50"
        onClick={onToggleNearby}
      >
        <MapPin className="w-4 h-4 mr-2" />
        {showNearby ? `Nearby (${nearbyCount})` : 'Show Nearby'}
      </Button>
      {showNearby && (
        <Select
          value={radius.toString()}
          onValueChange={(value) => onRadiusChange(parseInt(value))}
        >
          <SelectTrigger className="w-24 bg-background/95 backdrop-blur-sm shadow-lg border-border/50">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {RADIUS_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </div>
  );
};

// Polygon options
const polygonOptions = {
  fillColor: '#8B5CF6',
  fillOpacity: 0.2,
  strokeColor: '#8B5CF6',
  strokeOpacity: 0.8,
  strokeWeight: 2,
  clickable: false,
  draggable: false,
  editable: false,
  geodesic: false,
  zIndex: 1,
};

// Inner component that only renders after API key is available
const GoogleMapWrapper: React.FC<{ apiKey: string; properties: Property[] }> = ({ apiKey, properties }) => {
  const [markers, setMarkers] = useState<MarkerData[]>([]);
  const [selectedMarker, setSelectedMarker] = useState<MarkerData | null>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [userLocation, setUserLocation] = useState<google.maps.LatLngLiteral | null>(null);
  const [showNearby, setShowNearby] = useState(false);
  const [radius, setRadius] = useState(25);
  const [geocoding, setGeocoding] = useState(true);
  
  // Polygon drawing state
  const [isDrawing, setIsDrawing] = useState(false);
  const [polygonPoints, setPolygonPoints] = useState<google.maps.LatLngLiteral[]>([]);

  // Calculate nearby properties
  const nearbyMarkerIds = React.useMemo(() => {
    if (!userLocation || !showNearby) return new Set<string>();
    
    const nearby = new Set<string>();
    markers.forEach((marker) => {
      const distance = calculateDistance(
        userLocation.lat,
        userLocation.lng,
        marker.position.lat,
        marker.position.lng
      );
      if (distance <= radius) {
        nearby.add(marker.property.id);
      }
    });
    return nearby;
  }, [userLocation, showNearby, radius, markers]);

  // Calculate properties in polygon
  const propertiesInPolygon = React.useMemo(() => {
    if (polygonPoints.length < 3) return new Set<string>();
    
    const inPolygon = new Set<string>();
    markers.forEach((marker) => {
      if (isPointInPolygon(marker.position, polygonPoints)) {
        inPolygon.add(marker.property.id);
      }
    });
    return inPolygon;
  }, [markers, polygonPoints]);

  // Filter markers based on polygon or nearby
  const visibleMarkers = React.useMemo(() => {
    if (polygonPoints.length >= 3) {
      return markers.filter((marker) => propertiesInPolygon.has(marker.property.id));
    }
    if (showNearby && userLocation) {
      return markers.filter((marker) => nearbyMarkerIds.has(marker.property.id));
    }
    return markers;
  }, [markers, polygonPoints, propertiesInPolygon, showNearby, userLocation, nearbyMarkerIds]);

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

  const handleLocate = useCallback((location: google.maps.LatLngLiteral) => {
    setUserLocation(location);
    setShowNearby(true);
    if (map) {
      map.panTo(location);
      map.setZoom(14);
    }
  }, [map]);

  const handleToggleNearby = useCallback(() => {
    setShowNearby((prev) => !prev);
  }, []);

  const handleRadiusChange = useCallback((newRadius: number) => {
    setRadius(newRadius);
  }, []);

  // Polygon drawing handlers
  const handleStartDrawing = useCallback(() => {
    setIsDrawing(true);
    setPolygonPoints([]);
    setShowNearby(false);
  }, []);

  const handleStopDrawing = useCallback(() => {
    setIsDrawing(false);
  }, []);

  const handleClearPolygon = useCallback(() => {
    setPolygonPoints([]);
    setIsDrawing(false);
  }, []);

  const handleMapClick = useCallback((e: google.maps.MapMouseEvent) => {
    if (!isDrawing || !e.latLng) return;
    
    setPolygonPoints(prev => [
      ...prev,
      { lat: e.latLng!.lat(), lng: e.latLng!.lng() }
    ]);
  }, [isDrawing]);

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
          <LocateMeButton onLocate={handleLocate} />
          <PolygonDrawingControls
            isDrawing={isDrawing}
            onStartDrawing={handleStartDrawing}
            onStopDrawing={handleStopDrawing}
            onClearPolygon={handleClearPolygon}
            polygonPoints={polygonPoints}
            propertiesInPolygon={propertiesInPolygon.size}
          />
          <GoogleMap
            mapContainerStyle={containerStyle}
            center={defaultCenter}
            zoom={2}
            onLoad={onLoad}
            onUnmount={onUnmount}
            onClick={handleMapClick}
            options={{
              streetViewControl: false,
              mapTypeControl: false,
              draggableCursor: isDrawing ? 'crosshair' : undefined,
            }}
          >
            {/* Polygon overlay */}
            {polygonPoints.length >= 3 && (
              <Polygon
                paths={polygonPoints}
                options={polygonOptions}
              />
            )}

            {/* Drawing preview line */}
            {isDrawing && polygonPoints.length > 0 && (
              <Polygon
                paths={polygonPoints}
                options={{
                  ...polygonOptions,
                  fillOpacity: 0.1,
                  strokeOpacity: 0.5,
                }}
              />
            )}

            {visibleMarkers.map((marker) => (
              <CustomMarker
                key={marker.property.id}
                position={marker.position}
                onClick={() => setSelectedMarker(marker)}
                isSelected={selectedMarker?.property.id === marker.property.id}
                isNearby={nearbyMarkerIds.has(marker.property.id)}
                isInPolygon={propertiesInPolygon.has(marker.property.id)}
              />
            ))}

            {userLocation && (
              <UserLocationMarker position={userLocation} />
            )}

            <NearbyPropertiesControl
              userLocation={userLocation}
              showNearby={showNearby}
              radius={radius}
              nearbyCount={nearbyMarkerIds.size}
              onToggleNearby={handleToggleNearby}
              onRadiusChange={handleRadiusChange}
            />

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

          {/* Drawing mode indicator */}
          {isDrawing && (
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-20 bg-primary text-primary-foreground px-4 py-2 rounded-full text-sm shadow-lg">
              Click on the map to draw your search area
            </div>
          )}
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
