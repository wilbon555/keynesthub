import React, { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polygon, Circle, CircleMarker, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Loader2, Home, Search, X, Locate, MapPin, Pencil, MousePointer2, Trash2, Save, Clock, Layers, Building2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { PolygonDrawingControls } from './PolygonDrawingControls';
import {
  NEIGHBORHOODS,
  COMMUTE_MODES,
  type CommuteMode,
  estimateCommuteMinutes,
} from '@/lib/neighborhoodsData';
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

const destinationIcon = new L.DivIcon({
  html: `<div style="width:22px;height:22px;background:#ef4444;border:3px solid white;border-radius:50%;box-shadow:0 2px 8px rgba(0,0,0,0.4);display:flex;align-items:center;justify-content:center;color:white;font-size:12px;font-weight:bold;">📍</div>`,
  iconSize: [22, 22],
  iconAnchor: [11, 11],
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

  // Commute filter state
  const [commuteOpen, setCommuteOpen] = useState(false);
  const [commuteQuery, setCommuteQuery] = useState('');
  const [commuteDest, setCommuteDest] = useState<{ lat: number; lng: number; label: string } | null>(null);
  const [commuteMode, setCommuteMode] = useState<CommuteMode>('drive');
  const [maxMinutes, setMaxMinutes] = useState(30);
  const [isGeocoding, setIsGeocoding] = useState(false);

  // Neighborhood data layer toggle
  const [showNeighborhoods, setShowNeighborhoods] = useState(false);

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

  // Commute time per property (minutes) — computed from destination
  const commuteTimes = useMemo(() => {
    const map = new Map<string, number>();
    if (!commuteDest) return map;
    markers.forEach(m => {
      const km = calculateDistance(commuteDest.lat, commuteDest.lng, m.position[0], m.position[1]);
      map.set(m.property.id, estimateCommuteMinutes(km, commuteMode));
    });
    return map;
  }, [markers, commuteDest, commuteMode]);

  const withinCommute = useMemo(() => {
    if (!commuteDest) return new Set<string>();
    const s = new Set<string>();
    commuteTimes.forEach((mins, id) => {
      if (mins <= maxMinutes) s.add(id);
    });
    return s;
  }, [commuteTimes, commuteDest, maxMinutes]);

  // Visible markers — filters compose (polygon > nearby > commute)
  const visibleMarkers = useMemo(() => {
    let base = markers;
    if (polygonPoints.length >= 3) base = base.filter(m => propertiesInPolygon.has(m.property.id));
    else if (showNearby && userLocation) base = base.filter(m => nearbyMarkerIds.has(m.property.id));
    if (commuteDest) base = base.filter(m => withinCommute.has(m.property.id));
    return base;
  }, [markers, polygonPoints, propertiesInPolygon, showNearby, userLocation, nearbyMarkerIds, commuteDest, withinCommute]);

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

  const handleGeocodeDestination = useCallback(async () => {
    const q = commuteQuery.trim();
    if (!q) return;
    setIsGeocoding(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=ke&q=${encodeURIComponent(q)}`,
        { headers: { 'Accept-Language': 'en' } }
      );
      const data = await res.json();
      if (!Array.isArray(data) || data.length === 0) {
        toast({ title: 'Location not found', description: 'Try a landmark, road, or estate name.', variant: 'destructive' });
        return;
      }
      const hit = data[0];
      setCommuteDest({ lat: parseFloat(hit.lat), lng: parseFloat(hit.lon), label: hit.display_name.split(',').slice(0, 2).join(',') });
    } catch (err) {
      toast({ title: 'Geocoding failed', description: 'Check your connection and try again.', variant: 'destructive' });
    } finally {
      setIsGeocoding(false);
    }
  }, [commuteQuery, toast]);

  const clearCommute = useCallback(() => {
    setCommuteDest(null);
    setCommuteQuery('');
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
      <div className="absolute top-4 right-4 z-[1000] flex flex-col gap-2">
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
        <Button
          variant={showNeighborhoods ? 'default' : 'outline'}
          size="icon"
          className={showNeighborhoods ? 'shadow-lg' : 'bg-background/95 backdrop-blur-sm shadow-lg border-border/50'}
          onClick={() => setShowNeighborhoods(v => !v)}
          aria-label="Toggle neighborhood layer"
          title="Neighborhood data layer"
        >
          <Layers className="w-4 h-4" />
        </Button>
        <Button
          variant={commuteOpen || commuteDest ? 'default' : 'outline'}
          size="icon"
          className={commuteOpen || commuteDest ? 'shadow-lg' : 'bg-background/95 backdrop-blur-sm shadow-lg border-border/50'}
          onClick={() => setCommuteOpen(v => !v)}
          aria-label="Commute filter"
          title="Commute-time filter"
        >
          <Clock className="w-4 h-4" />
        </Button>
      </div>

      <div className="absolute top-4 right-[4.5rem] z-[1000]">
        <PolygonDrawingControls
          isDrawing={isDrawing}
          onStartDrawing={() => { setIsDrawing(true); setPolygonPoints([]); setShowNearby(false); }}
          onStopDrawing={() => setIsDrawing(false)}
          onClearPolygon={() => { setPolygonPoints([]); setIsDrawing(false); }}
          polygonPoints={polygonPointsLatLng}
          propertiesInPolygon={propertiesInPolygon.size}
        />
      </div>

      {/* Commute filter panel */}
      {commuteOpen && (
        <div className="absolute top-4 left-4 z-[1000] w-[290px] bg-background/95 backdrop-blur-sm shadow-lg border border-border/50 rounded-lg p-3 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Clock className="w-4 h-4 text-primary" />
              Commute filter
            </div>
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setCommuteOpen(false)}>
              <X className="w-3.5 h-3.5" />
            </Button>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">Destination (workplace, school, landmark)</Label>
            <div className="flex gap-1.5">
              <Input
                value={commuteQuery}
                onChange={(e) => setCommuteQuery(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleGeocodeDestination(); } }}
                placeholder="e.g. Westgate Mall, KU"
                className="h-8 text-sm"
              />
              <Button size="sm" className="h-8 px-2" onClick={handleGeocodeDestination} disabled={isGeocoding || !commuteQuery.trim()}>
                {isGeocoding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1.5">
              <Label className="text-xs">Mode</Label>
              <Select value={commuteMode} onValueChange={(v: CommuteMode) => setCommuteMode(v)}>
                <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {(Object.keys(COMMUTE_MODES) as CommuteMode[]).map(m => (
                    <SelectItem key={m} value={m}>{COMMUTE_MODES[m].icon} {COMMUTE_MODES[m].label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Max minutes</Label>
              <Select value={maxMinutes.toString()} onValueChange={(v) => setMaxMinutes(parseInt(v))}>
                <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {[10, 15, 20, 30, 45, 60, 90].map(n => (
                    <SelectItem key={n} value={n.toString()}>≤ {n} min</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {commuteDest && (
            <div className="text-xs bg-primary/10 border border-primary/20 rounded-md p-2 space-y-1">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 truncate">
                  <span className="font-medium">To:</span> {commuteDest.label}
                </div>
                <button onClick={clearCommute} className="text-muted-foreground hover:text-foreground">
                  <X className="w-3 h-3" />
                </button>
              </div>
              <div className="flex items-center gap-1.5">
                <Badge variant="secondary" className="h-5 text-[10px]">
                  {withinCommute.size} match{withinCommute.size === 1 ? '' : 'es'} within {maxMinutes} min
                </Badge>
              </div>
              <p className="text-[10px] text-muted-foreground">
                Estimate uses avg {COMMUTE_MODES[commuteMode].speedKmh} km/h with a 1.3× detour factor.
              </p>
            </div>
          )}
        </div>
      )}

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

        {/* Neighborhood data layer */}
        {showNeighborhoods && NEIGHBORHOODS.map(n => (
          <CircleMarker
            key={n.slug}
            center={[n.lat, n.lng]}
            radius={10}
            pathOptions={{ color: '#0ea5e9', fillColor: '#0ea5e9', fillOpacity: 0.55, weight: 2 }}
          >
            <Popup>
              <div className="max-w-[240px] space-y-1.5">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold text-sm leading-tight">{n.name}</h3>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-sky-100 text-sky-800">{n.region}</span>
                </div>
                <div className="text-xs"><strong>Avg price:</strong> {n.avgPrice}</div>
                <div className="text-xs"><strong>Safety:</strong> {n.safety}</div>
                <div className="text-xs"><strong>Schools:</strong> {n.schools.slice(0, 3).join(', ')}</div>
                <div className="text-xs"><strong>Transport:</strong> {n.transport.slice(0, 2).join(' • ')}</div>
                <div className="flex flex-wrap gap-1 pt-1">
                  {n.highlights.slice(0, 3).map(h => (
                    <span key={h} className="text-[10px] px-1.5 py-0.5 rounded bg-muted">{h}</span>
                  ))}
                </div>
              </div>
            </Popup>
          </CircleMarker>
        ))}

        {/* Commute destination + reach ring */}
        {commuteDest && (
          <>
            <Marker position={[commuteDest.lat, commuteDest.lng]} icon={destinationIcon}>
              <Popup>
                <div className="text-xs">
                  <div className="font-semibold mb-0.5">Commute destination</div>
                  <div className="text-gray-600">{commuteDest.label}</div>
                </div>
              </Popup>
            </Marker>
            <Circle
              center={[commuteDest.lat, commuteDest.lng]}
              radius={(COMMUTE_MODES[commuteMode].speedKmh * (maxMinutes / 60) / 1.3) * 1000}
              pathOptions={{ color: '#ef4444', fillColor: '#ef4444', fillOpacity: 0.08, weight: 1, dashArray: '4,4' }}
            />
          </>
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
                {commuteDest && commuteTimes.has(marker.property.id) && (
                  <div className="mt-2 pt-2 border-t border-gray-200 text-xs flex items-center gap-1 text-primary font-medium">
                    <span>{COMMUTE_MODES[commuteMode].icon}</span>
                    ~{commuteTimes.get(marker.property.id)} min to {commuteDest.label.split(',')[0]}
                  </div>
                )}
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
