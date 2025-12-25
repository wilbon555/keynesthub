import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';

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

const PropertyMap: React.FC<PropertyMapProps> = ({ properties }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initializeMap = async () => {
      if (!mapContainer.current) return;

      try {
        // Fetch the Mapbox token from edge function
        const { data, error: fetchError } = await supabase.functions.invoke('get-mapbox-token');
        
        if (fetchError || !data?.token) {
          throw new Error('Failed to load map configuration');
        }

        mapboxgl.accessToken = data.token;

        map.current = new mapboxgl.Map({
          container: mapContainer.current,
          style: 'mapbox://styles/mapbox/streets-v12',
          zoom: 2,
          center: [0, 20],
        });

        map.current.addControl(
          new mapboxgl.NavigationControl({
            visualizePitch: true,
          }),
          'top-right'
        );

        map.current.on('load', () => {
          setLoading(false);
          addPropertyMarkers();
        });

      } catch (err) {
        console.error('Map initialization error:', err);
        setError(err instanceof Error ? err.message : 'Failed to load map');
        setLoading(false);
      }
    };

    const addPropertyMarkers = async () => {
      if (!map.current) return;

      // Geocode and add markers for each property
      for (const property of properties) {
        try {
          const response = await fetch(
            `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(property.location)}.json?access_token=${mapboxgl.accessToken}`
          );
          const geoData = await response.json();

          if (geoData.features && geoData.features.length > 0) {
            const [lng, lat] = geoData.features[0].center;

            // Create custom marker element
            const markerEl = document.createElement('div');
            markerEl.className = 'property-marker';
            markerEl.innerHTML = `
              <div class="w-8 h-8 bg-primary rounded-full flex items-center justify-center shadow-lg cursor-pointer hover:scale-110 transition-transform">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                  <polyline points="9 22 9 12 15 12 15 22"></polyline>
                </svg>
              </div>
            `;

            // Create popup
            const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(`
              <div class="p-2 max-w-[200px]">
                ${property.image ? `<img src="${property.image}" alt="${property.title}" class="w-full h-24 object-cover rounded mb-2" />` : ''}
                <h3 class="font-semibold text-sm text-foreground">${property.title}</h3>
                <p class="text-primary font-bold text-sm">${property.price}</p>
                <p class="text-xs text-muted-foreground">${property.location}</p>
                <div class="flex gap-2 text-xs text-muted-foreground mt-1">
                  ${property.bedrooms ? `<span>${property.bedrooms} beds</span>` : ''}
                  ${property.bathrooms ? `<span>${property.bathrooms} baths</span>` : ''}
                </div>
              </div>
            `);

            new mapboxgl.Marker(markerEl)
              .setLngLat([lng, lat])
              .setPopup(popup)
              .addTo(map.current!);
          }
        } catch (err) {
          console.error(`Failed to geocode: ${property.location}`, err);
        }
      }

      // Fit map to show all markers if there are properties
      if (properties.length > 0) {
        const bounds = new mapboxgl.LngLatBounds();
        let hasValidBounds = false;

        for (const property of properties) {
          try {
            const response = await fetch(
              `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(property.location)}.json?access_token=${mapboxgl.accessToken}`
            );
            const geoData = await response.json();
            if (geoData.features && geoData.features.length > 0) {
              bounds.extend(geoData.features[0].center);
              hasValidBounds = true;
            }
          } catch (err) {
            // Skip properties that can't be geocoded
          }
        }

        if (hasValidBounds) {
          map.current.fitBounds(bounds, { padding: 50, maxZoom: 12 });
        }
      }
    };

    initializeMap();

    return () => {
      map.current?.remove();
    };
  }, [properties]);

  if (error) {
    return (
      <div className="w-full h-[500px] bg-muted rounded-lg flex items-center justify-center">
        <p className="text-muted-foreground">{error}</p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-[500px] rounded-lg overflow-hidden shadow-lg">
      {loading && (
        <div className="absolute inset-0 bg-muted flex items-center justify-center z-10">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      )}
      <div ref={mapContainer} className="absolute inset-0" />
    </div>
  );
};

export default PropertyMap;
