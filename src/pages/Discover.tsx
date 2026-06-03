import React, { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { supabase } from '@/integrations/supabase/client';
import { Navigation } from '@/components/Navigation';
import { SmartSearchInput } from '@/components/discover/SmartSearchInput';
import { SearchResultsPanel } from '@/components/discover/SearchResultsPanel';
import { PageHead } from '@/components/seo/PageHead';
import { useSmartSearch } from '@/hooks/useSmartSearch';
import { Loader2, Locate, Layers, X, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

// Fix default marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const createPropertyIcon = (title: string, price: string) => {
  const shortTitle = title.length > 20 ? title.substring(0, 20) + '…' : title;
  return L.divIcon({
    className: 'custom-property-marker',
    html: `
      <div style="display:flex;flex-direction:column;align-items:center;pointer-events:none;">
        <div style="background:hsl(var(--primary));color:hsl(var(--primary-foreground));font-size:11px;font-weight:600;padding:3px 8px;border-radius:6px;white-space:nowrap;box-shadow:0 2px 8px rgba(0,0,0,0.25);max-width:160px;overflow:hidden;text-overflow:ellipsis;line-height:1.3;">
          ${shortTitle}<br/><span style="font-size:10px;opacity:0.9;">${price}</span>
        </div>
        <div style="width:0;height:0;border-left:6px solid transparent;border-right:6px solid transparent;border-top:6px solid hsl(var(--primary));margin-top:-1px;"></div>
      </div>
    `,
    iconSize: [160, 50],
    iconAnchor: [80, 50],
    popupAnchor: [0, -50],
  });
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
  area: string;
  listing_type: string;
  status?: string | null;
  verification_status?: string;
}

interface MarkerData {
  property: Property;
  position: [number, number];
}

const defaultCenter: [number, number] = [-1.2921, 36.8219];

// Geocode properties using Nominatim
const geocodeProperties = async (properties: Property[]): Promise<MarkerData[]> => {
  const markers: MarkerData[] = [];
  for (const property of properties) {
    try {
      const query = `${property.location}, Kenya`;
      const res = await globalThis.fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`,
        { headers: { 'Accept': 'application/json', 'User-Agent': 'KeyNestHub/1.0' } }
      );
      const results = await res.json();
      if (results.length > 0) {
        markers.push({
          property,
          position: [parseFloat(results[0].lat), parseFloat(results[0].lon)],
        });
      }
      // Rate limit: Nominatim requires 1 req/sec
      await new Promise(r => setTimeout(r, 1100));
    } catch (err) {
      console.error(`Failed to geocode: ${property.location}`, err);
    }
  }
  return markers;
};

// Component to fit bounds and handle map actions
const MapController: React.FC<{
  markers: MarkerData[];
  flyTo?: [number, number] | null;
  flyToZoom?: number;
}> = ({ markers, flyTo, flyToZoom }) => {
  const map = useMap();
  const fitted = useRef(false);

  useEffect(() => {
    if (markers.length > 0 && !fitted.current) {
      const bounds = L.latLngBounds(markers.map(m => m.position));
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 12 });
      fitted.current = true;
    }
  }, [markers, map]);

  useEffect(() => {
    if (flyTo) {
      map.flyTo(flyTo, flyToZoom ?? 14);
    }
  }, [flyTo, flyToZoom, map]);

  return null;
};

const DiscoverMap: React.FC<{ properties: Property[] }> = ({ properties }) => {
  const [markers, setMarkers] = useState<MarkerData[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [showPanel, setShowPanel] = useState(true);
  const [geocoding, setGeocoding] = useState(true);
  const [flyTo, setFlyTo] = useState<[number, number] | null>(null);
  const { toast } = useToast();
  const { search, isSearching, lastResult, clearSearch } = useSmartSearch();

  // Geocode on mount
  useEffect(() => {
    if (properties.length === 0) { setGeocoding(false); return; }
    let cancelled = false;
    geocodeProperties(properties).then(result => {
      if (!cancelled) {
        setMarkers(result);
        setGeocoding(false);
      }
    });
    return () => { cancelled = true; };
  }, [properties]);

  const handleSearch = async (query: string) => {
    const result = await search(query, properties);
    if (result?.matchedProperties?.length > 0) {
      const matchedIds = new Set(result.matchedProperties.map((p: any) => p.id));
      const matchedMarkers = markers.filter(m => matchedIds.has(m.property.id));
      if (matchedMarkers.length > 0) {
        // Fly to first matched marker
        setFlyTo(matchedMarkers[0].position);
      }
    }
  };

  const handlePropertySelect = (property: Property) => {
    setSelectedProperty(property);
    const marker = markers.find(m => m.property.id === property.id);
    if (marker) {
      setFlyTo(marker.position);
    }
  };

  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      toast({ title: "Geolocation not supported", variant: "destructive" });
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => setFlyTo([pos.coords.latitude, pos.coords.longitude]),
      () => toast({ title: "Location error", description: "Unable to get your location.", variant: "destructive" })
    );
  };

  const displayMarkers = lastResult?.matchedProperties
    ? markers.filter(m => lastResult.matchedProperties?.some((p: any) => p.id === m.property.id))
    : markers;

  return (
    <div className="flex-1 relative overflow-hidden">
      {/* Search Bar */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] w-full max-w-2xl px-4 flex flex-col gap-2">
        <SmartSearchInput
          onSearch={handleSearch}
          isSearching={isSearching}
          suggestions={lastResult?.suggestions}
          onSuggestionClick={handleSearch}
        />
      </div>

      {/* Map Controls */}
      <div className="absolute top-4 right-4 z-[1000] flex flex-col gap-2">
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
        <div className="absolute left-4 top-28 bottom-4 z-[1000] w-80">
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

      {/* Clear Search */}
      {lastResult && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-[1000]">
          <Button variant="secondary" size="sm" onClick={clearSearch} className="shadow-lg">
            <X className="w-4 h-4 mr-2" />
            Clear Search
          </Button>
        </div>
      )}

      {/* Geocoding overlay */}
      {geocoding && (
        <div className="absolute inset-0 z-[999] bg-muted/50 flex items-center justify-center">
          <div className="bg-background/95 backdrop-blur-sm rounded-lg p-4 shadow-lg flex items-center gap-3">
            <Loader2 className="w-5 h-5 animate-spin text-primary" />
            <span className="text-sm text-muted-foreground">Locating properties on map…</span>
          </div>
        </div>
      )}

      {/* Leaflet Map */}
      <MapContainer
        center={defaultCenter}
        zoom={7}
        style={{ width: '100%', height: '100%' }}
        className="z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapController markers={markers} flyTo={flyTo} />

        {displayMarkers.map(marker => (
          <Marker
            key={marker.property.id}
            position={marker.position}
            icon={createPropertyIcon(marker.property.title, marker.property.price)}
            eventHandlers={{ click: () => handlePropertySelect(marker.property) }}
          >
            <Popup>
              <div className="max-w-[220px]">
                {marker.property.image && (
                  <img
                    src={marker.property.image}
                    alt={marker.property.title}
                    className="w-full h-24 object-cover rounded-md mb-2"
                  />
                )}
                <h3 className="font-semibold text-sm">{marker.property.title}</h3>
                <p className="font-bold text-sm text-green-600">{marker.property.price}</p>
                <p className="text-xs text-gray-500">{marker.property.location}</p>
                <div className="flex gap-2 text-xs text-gray-500 mt-1">
                  {marker.property.bedrooms && <span>{marker.property.bedrooms} beds</span>}
                  {marker.property.bathrooms && <span>{marker.property.bathrooms} baths</span>}
                </div>
                <Link
                  to={`/property/${marker.property.id}`}
                  className="text-xs text-primary hover:underline mt-2 inline-block"
                >
                  View Details →
                </Link>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default function Discover() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [propertiesLoading, setPropertiesLoading] = useState(true);

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

  if (propertiesLoading) {
    return (
      <div className="h-screen flex flex-col bg-background">
        <Navigation />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-background">
      <PageHead
        title="Discover Properties in Kenya — Map & AI Search | KeyNestHub"
        description="Explore verified properties for sale and rent across Kenya on an interactive map with AI-powered semantic search."
        canonical="https://www.keynesthub.com/discover"
      />
      <h1 className="sr-only">Discover Properties in Kenya</h1>
      <Navigation />
      <DiscoverMap properties={properties} />
    </div>
  );
}
