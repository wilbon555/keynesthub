import { useState, useEffect, useCallback } from 'react';
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, MapPin } from 'lucide-react';

interface PropertyLocationMapProps {
  location: string;
  region?: string;
  country?: string;
}

const mapContainerStyle = {
  width: '100%',
  height: '100%',
};

const defaultCenter = { lat: -1.2921, lng: 36.8219 }; // Nairobi

/** Inner component — only mounted once apiKey is known & stable */
const MapInner = ({ apiKey, location, region, country }: { apiKey: string } & PropertyLocationMapProps) => {
  const [center, setCenter] = useState(defaultCenter);
  const [geocoded, setGeocoded] = useState(false);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: apiKey,
    id: 'property-location-map',
  });

  const onMapLoad = useCallback(() => {
    if (!window.google || geocoded) return;
    const geocoder = new window.google.maps.Geocoder();
    const query = [location, region, country].filter(Boolean).join(', ');
    geocoder.geocode({ address: query }, (results, status) => {
      if (status === 'OK' && results?.[0]) {
        const { lat, lng } = results[0].geometry.location;
        setCenter({ lat: lat(), lng: lng() });
        setGeocoded(true);
      }
    });
  }, [location, region, country, geocoded]);

  if (!isLoaded) {
    return (
      <div className="w-full h-[300px] rounded-xl bg-muted/50 flex items-center justify-center">
        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="w-full h-[300px] rounded-xl overflow-hidden border border-border">
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={center}
        zoom={15}
        onLoad={onMapLoad}
        options={{
          disableDefaultUI: true,
          zoomControl: true,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: true,
        }}
      >
        <Marker position={center} />
      </GoogleMap>
    </div>
  );
};

export const PropertyLocationMap = ({ location, region, country }: PropertyLocationMapProps) => {
  const [apiKey, setApiKey] = useState<string | null>(null);

  useEffect(() => {
    const fetchKey = async () => {
      try {
        const { data } = await supabase.functions.invoke('get-google-maps-key');
        if (data?.apiKey) setApiKey(data.apiKey);
      } catch (e) {
        console.error('Failed to fetch Maps key:', e);
      }
    };
    fetchKey();
  }, []);

  if (!apiKey) {
    return (
      <div className="w-full h-[300px] rounded-xl bg-muted/50 flex items-center justify-center">
        <div className="flex items-center gap-2 text-muted-foreground text-sm">
          <MapPin className="w-4 h-4" />
          <span>{[location, region, country].filter(Boolean).join(', ')}</span>
        </div>
      </div>
    );
  }

  return <MapInner apiKey={apiKey} location={location} region={region} country={country} />;
};
