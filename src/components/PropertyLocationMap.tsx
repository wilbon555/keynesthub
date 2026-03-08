import { useMemo } from 'react';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin } from 'lucide-react';

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

const defaultCenter: [number, number] = [-1.2921, 36.8219]; // Nairobi

export const PropertyLocationMap = ({ location, region, country, latitude, longitude }: PropertyLocationMapProps) => {
  const center: [number, number] = useMemo(() => {
    if (latitude != null && longitude != null) return [latitude, longitude];
    return defaultCenter;
  }, [latitude, longitude]);

  const hasCoords = latitude != null && longitude != null;

  if (!hasCoords) {
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
        <Marker position={center} />
      </MapContainer>
    </div>
  );
};
