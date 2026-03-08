import React, { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polygon, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Loader2, Home, Search, X, Locate, MapPin, Pencil, MousePointer2, Trash2, Save } from 'lucide-react';
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

// Fix default marker icons for Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Custom marker icon
const propertyIcon = new L.Icon({
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const userIcon = new L.DivIcon({
  html: `<div style="width:16px;height:16px;background:#3b82f6;border:2px solid white;border-radius:50%;box-shadow:0 2px 6px rgba(0,0,0,0.3);"></div>`,
  iconSize: [16, 16],
  iconAnchor: [8, 8],
  className: '',
});

// Haversine distance
const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

// Ray casting point-in-polygon
const isPointInPolygon = (point: [number, number], polygon: [number, number][]): boolean => {
  let inside = false;
  const [y, x] = point;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [yi, xi] = polygon[i];
    const [yj, xj] = polygon[j];
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
  latitude?: number | null;
  longitude?: number | null;
}

interface PropertyMapProps {
  properties: Property[];
}

interface MarkerData {
  property: Property;
  position: [number, number]; // [lat, lng]
}

const defaultCenter: [number, number] = [-1.2921, 36.8219]; // Nairobi

const RADIUS_OPTIONS = [
  { value: '5', label: '5 km' },
  { value: '10', label: '10 km' },
  { value: '25', label: '25 km' },
  { value: '50', label: '50 km' },
  { value: '100', label: '100 km' },
];

// Component to fit map bounds to markers
const FitBounds: React.FC<{ markers: MarkerData[] }> = ({ markers }) => {
  const map = useMap();
  const fitted = useRef(false);

  useEffect(() => {
    if (markers.length > 0 && !fitted.current) {
      const bounds = L.latLngBounds(markers.map(m => m.position));
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 12 });
      fitted.current = true;
    }
  }, [markers, map]);

  return null;
};

// Click handler for polygon drawing
const MapClickHandler: React.FC<{
  isDrawing: boolean;
  onMapClick: (latlng: [number, number]) => void;
}> = ({ isDrawing, onMapClick }) => {
  useMapEvents({
    click(e) {
      if (isDrawing) {
        onMapClick([e.latlng.lat, e.latlng.lng]);
      }
    },
  });
  return null;
};

const PropertyMap: React.FC<PropertyMapProps> = ({ properties }) => {
  const { toast } = useToast();
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [showNearby, setShowNearby] = useState(false);
  const [radius, setRadius] = useState(25);
  const [isLocating, setIsLocating] = useState(false);

  // Polygon drawing state
  const [isDrawing, setIsDrawing] = useState(false);
  const [polygonPoints, setPolygonPoints] = useState<[number, number][]>([]);

  // Build markers from properties that have lat/lng
  const markers: MarkerData[] = useMemo(() => {
    return properties
      .filter(p => p.latitude != null && p.longitude != null)
      .map(p => ({
        property: p,
        position: [p.latitude!, p.longitude!] as [number, number],
      }));
  }, [properties]);

  // Nearby markers
  const nearbyMarkerIds = useMemo(() => {
    if (!userLocation || !showNearby) return new Set<string>();
    const nearby = new Set<string>();
    markers.forEach(m => {
      if (calculateDistance(userLocation[0], userLocation[1], m.position[0], m.position[1]) <= radius) {
        nearby.add(m.property.id);
      }
    });
    return nearby;
  }, [userLocation, showNearby, radius, markers]);

  // Properties in polygon
  const propertiesInPolygon = useMemo(() => {
    if (polygonPoints.length < 3) return new Set<string>();
    const inPoly = new Set<string>();
    markers.forEach(m => {
      if (isPointInPolygon(m.position, polygonPoints)) {
        inPoly.add(m.property.id);
      }
    });
    return inPoly;
  }, [markers, polygonPoints]);

  // Visible markers
  const visibleMarkers = useMemo(() => {
    if (polygonPoints.length >= 3) return markers.filter(m => propertiesInPolygon.has(m.property.id));
    if (showNearby && userLocation) return markers.filter(m => nearbyMarkerIds.has(m.property.id));
    return markers;
  }, [markers, polygonPoints, propertiesInPolygon, showNearby, userLocation, nearbyMarkerIds]);

  const handleLocateMe = useCallback(() => {
    if (!navigator.geolocation) {
      toast({ title: "Geolocation not supported", variant: "destructive" });
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const loc: [number, number] = [pos.coords.latitude, pos.coords.longitude];
        setUserLocation(loc);
        setShowNearby(true);
        setIsLocating(false);
      },
      (err) => {
        setIsLocating(false);
        toast({ title: "Location error", description: err.message, variant: "destructive" });
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, [toast]);

  const handleMapClick = useCallback((latlng: [number, number]) => {
    setPolygonPoints(prev => [...prev, latlng]);
  }, []);

  // Convert polygon points for PolygonDrawingControls (uses {lat, lng} format)
  const polygonPointsLatLng = useMemo(() =>
    polygonPoints.map(([lat, lng]) => ({ lat, lng })),
    [polygonPoints]
  );

  const mapCenter = markers.length > 0 ? markers[0].position : defaultCenter;

  if (markers.length === 0) {
    return (
      <div className="w-full h-[500px] bg-muted rounded-lg flex items-center justify-center">
        <div className="text-center">
          <MapPin className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-muted-foreground">No properties with coordinates to display on the map</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-[500px] rounded-lg overflow-hidden shadow-lg border border-border">
      {/* Controls overlay */}
      <div className="absolute top-4 right-4 z-[1000]">
        <Button
          variant="outline"
          size="icon"
          className="bg-background/95 backdrop-blur-sm shadow-lg border-border/50"
          onClick={handleLocateMe}
          disabled={isLocating}
          aria-label="Locate me"
        >
          {isLocating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Locate className="w-4 h-4" />}
        </Button>
      </div>

      <div className="absolute top-4 right-16 z-[1000]">
        <PolygonDrawingControls
          isDrawing={isDrawing}
          onStartDrawing={() => { setIsDrawing(true); setPolygonPoints([]); setShowNearby(false); }}
          onStopDrawing={() => setIsDrawing(false)}
          onClearPolygon={() => { setPolygonPoints([]); setIsDrawing(false); }}
          polygonPoints={polygonPointsLatLng}
          propertiesInPolygon={propertiesInPolygon.size}
        />
      </div>

      {userLocation && (
        <div className="absolute bottom-4 left-4 z-[1000] flex items-center gap-2">
          <Button
            variant={showNearby ? "default" : "outline"}
            size="sm"
            className="bg-background/95 backdrop-blur-sm shadow-lg border-border/50"
            onClick={() => setShowNearby(prev => !prev)}
          >
            <MapPin className="w-4 h-4 mr-2" />
            {showNearby ? `Nearby (${nearbyMarkerIds.size})` : 'Show Nearby'}
          </Button>
          {showNearby && (
            <Select value={radius.toString()} onValueChange={(v) => setRadius(parseInt(v))}>
              <SelectTrigger className="w-24 bg-background/95 backdrop-blur-sm shadow-lg border-border/50">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {RADIUS_OPTIONS.map(o => (
                  <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      )}

      {isDrawing && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-[1000] bg-primary text-primary-foreground px-4 py-2 rounded-full text-sm shadow-lg">
          Click on the map to draw your search area
        </div>
      )}

      <MapContainer
        center={mapCenter}
        zoom={6}
        style={{ width: '100%', height: '100%' }}
        className="z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <FitBounds markers={markers} />
        <MapClickHandler isDrawing={isDrawing} onMapClick={handleMapClick} />

        {/* Polygon */}
        {polygonPoints.length >= 3 && (
          <Polygon
            positions={polygonPoints}
            pathOptions={{ color: '#8B5CF6', fillColor: '#8B5CF6', fillOpacity: 0.2, weight: 2 }}
          />
        )}
        {isDrawing && polygonPoints.length > 0 && polygonPoints.length < 3 && (
          <Polygon
            positions={polygonPoints}
            pathOptions={{ color: '#8B5CF6', fillOpacity: 0.1, weight: 2, dashArray: '5,5' }}
          />
        )}

        {/* Property markers */}
        {visibleMarkers.map(marker => (
          <Marker key={marker.property.id} position={marker.position} icon={propertyIcon}>
            <Popup>
              <div className="max-w-[200px]">
                {marker.property.image && (
                  <img src={marker.property.image} alt={marker.property.title} className="w-full h-24 object-cover rounded mb-2" />
                )}
                <h3 className="font-semibold text-sm">{marker.property.title}</h3>
                <p className="font-bold text-sm text-green-600">{marker.property.price}</p>
                <p className="text-xs text-gray-500">{marker.property.location}</p>
                <div className="flex gap-2 text-xs text-gray-500 mt-1">
                  {marker.property.bedrooms && <span>{marker.property.bedrooms} beds</span>}
                  {marker.property.bathrooms && <span>{marker.property.bathrooms} baths</span>}
                </div>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* User location */}
        {userLocation && <Marker position={userLocation} icon={userIcon} />}
      </MapContainer>
    </div>
  );
};

export default PropertyMap;
