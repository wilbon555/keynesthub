import { useState, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, Loader2 } from 'lucide-react';

// Fix default marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

interface PropertyLocationMapProps {
  location: string;
  region?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
}

const defaultCenter: [number, number] = [-1.2921, 36.8219];

// Recenter map when coords change
const RecenterMap = ({ center }: { center: [number, number] }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, 15);
  }, [center, map]);
  return null;
};

export const PropertyLocationMap = ({ location, region, country, latitude, longitude }: PropertyLocationMapProps) => {
  const [geocodedCenter, setGeocodedCenter] = useState<[number, number] | null>(null);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [geocodeFailed, setGeocodeFailed] = useState(false);

  const hasExplicitCoords = latitude != null && longitude != null;

  // Geocode via Nominatim when no explicit coords
  useEffect(() => {
    if (hasExplicitCoords) return;

    // Deduplicate terms: split all parts, trim, lowercase-compare, keep unique in order
    const rawParts = [location, region, country].filter(Boolean).flatMap(s => s!.split(',').map(p => p.trim()).filter(Boolean));
    const seen = new Set<string>();
    const uniqueParts: string[] = [];
    for (const part of rawParts) {
      const key = part.toLowerCase();
      if (!seen.has(key)) { seen.add(key); uniqueParts.push(part); }
    }

    if (uniqueParts.length === 0) { setGeocodeFailed(true); return; }

    // Build progressively simpler queries for fallback
    const queries: string[] = [uniqueParts.join(', ')];
    // Try just city + country if there are 3+ parts
    if (uniqueParts.length >= 3) {
      queries.push(`${uniqueParts[0]}, ${uniqueParts[uniqueParts.length - 1]}`);
    }
    // Try just the first part (city name)
    if (uniqueParts.length >= 2) {
      queries.push(uniqueParts[0]);
    }

    let cancelled = false;
    setIsGeocoding(true);
    setGeocodeFailed(false);

    const doFetch = async () => {
      for (const query of queries) {
        if (cancelled) return;
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 8000);
          const r = await globalThis.fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`,
            { signal: controller.signal, headers: { 'Accept': 'application/json', 'User-Agent': 'KeyNestHub/1.0' } }
          );
          clearTimeout(timeoutId);
          const results: any[] = await r.json();
          if (cancelled) return;
          if (results.length > 0) {
            setGeocodedCenter([parseFloat(results[0].lat), parseFloat(results[0].lon)]);
            setIsGeocoding(false);
            return;
          }
        } catch {
          // try next query
        }
      }
      if (!cancelled) { setGeocodeFailed(true); setIsGeocoding(false); }
    };

    doFetch();

    return () => { cancelled = true; };
  }, [location, region, country, hasExplicitCoords]);

  const center: [number, number] | null = useMemo(() => {
    if (hasExplicitCoords) return [latitude!, longitude!];
    return geocodedCenter;
  }, [hasExplicitCoords, latitude, longitude, geocodedCenter]);

  // Loading state
  if (!hasExplicitCoords && isGeocoding) {
    return (
      <div className="w-full h-[300px] rounded-xl bg-muted/50 flex items-center justify-center">
        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // No coords available — show text fallback
  if (!center || geocodeFailed) {
    return (
      <div className="w-full h-[300px] rounded-xl bg-muted/50 flex items-center justify-center">
        <div className="flex items-center gap-2 text-muted-foreground text-sm">
          <MapPin className="w-4 h-4" />
          <span>{[location, region, country].filter(Boolean).join(', ')}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-[300px] rounded-xl overflow-hidden border border-border">
      <MapContainer
        center={center}
        zoom={15}
        style={{ width: '100%', height: '100%' }}
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <RecenterMap center={center} />
        <Marker position={center} />
      </MapContainer>
    </div>
  );
};
