'use client';

import { useEffect, useRef, useState } from 'react';
import { MapPin, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MapViewProps {
  latitude: number;
  longitude: number;
  patientName?: string;
  showDistance?: boolean;
  caretakerLat?: number;
  caretakerLng?: number;
}

declare global {
  interface Window {
    google: any;
  }
}

export function MapView({
  latitude,
  longitude,
  patientName = 'Patient Location',
  showDistance = true,
  caretakerLat = 40.7138,
  caretakerLng = -74.0060,
}: MapViewProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<any>(null);
  const [distance, setDistance] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    // Calculate distance using Haversine formula
    if (showDistance) {
      const lat1 = (caretakerLat * Math.PI) / 180;
      const lat2 = (latitude * Math.PI) / 180;
      const deltaLat = ((latitude - caretakerLat) * Math.PI) / 180;
      const deltaLng = ((longitude - caretakerLng) * Math.PI) / 180;

      const a =
        Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
        Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLng / 2) * Math.sin(deltaLng / 2);

      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const R = 3959; // Earth's radius in miles
      const dist = R * c;
      setDistance(dist);
    }
  }, [latitude, longitude, caretakerLat, caretakerLng, showDistance]);

  useEffect(() => {
    if (!mapContainer.current) return;

    // Load Google Maps script
    const loadGoogleMaps = () => {
      if (window.google && window.google.maps) {
        initMap();
        return;
      }

      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${
        process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || 'AIzaSyAB...'
      }`;
      script.async = true;
      script.defer = true;
      script.onload = initMap;
      script.onerror = () => {
        setHasError(true);
        setIsLoading(false);
      };
      document.head.appendChild(script);
    };

    const initMap = () => {
      if (!window.google || !window.google.maps) {
        // Fallback to simple map visualization
        setHasError(true);
        setIsLoading(false);
        return;
      }

      try {
        const mapOptions = {
          zoom: 15,
          center: { lat: latitude, lng: longitude },
          mapTypeControl: false,
          fullscreenControl: true,
          styles: [
            {
              featureType: 'water',
              elementType: 'geometry',
              stylers: [{ color: '#c9c9c9' }],
            },
            {
              featureType: 'landscape',
              elementType: 'geometry',
              stylers: [{ color: '#f3f3f3' }],
            },
          ],
        };

        map.current = new window.google.maps.Map(mapContainer.current, mapOptions);

        // Patient marker
        new window.google.maps.Marker({
          position: { lat: latitude, lng: longitude },
          map: map.current,
          title: patientName,
          icon: {
            path: window.google.maps.SymbolPath.CIRCLE,
            scale: 10,
            fillColor: '#ef4444',
            fillOpacity: 1,
            strokeColor: '#fff',
            strokeWeight: 2,
          },
        });

        // Caretaker marker
        if (showDistance) {
          new window.google.maps.Marker({
            position: { lat: caretakerLat, lng: caretakerLng },
            map: map.current,
            title: 'Your Location',
            icon: {
              path: window.google.maps.SymbolPath.CIRCLE,
              scale: 8,
              fillColor: '#3b82f6',
              fillOpacity: 1,
              strokeColor: '#fff',
              strokeWeight: 2,
            },
          });

          // Draw line between locations
          new window.google.maps.Polyline({
            path: [
              { lat: latitude, lng: longitude },
              { lat: caretakerLat, lng: caretakerLng },
            ],
            geodesic: true,
            strokeColor: '#3b82f6',
            strokeOpacity: 0.5,
            strokeWeight: 2,
            map: map.current,
          });
        }

        setIsLoading(false);
      } catch (error) {
        console.error('Map initialization error:', error);
        setHasError(true);
        setIsLoading(false);
      }
    };

    loadGoogleMaps();
  }, [latitude, longitude, patientName, caretakerLat, caretakerLng, showDistance]);

  const handleOpenInGoogleMaps = () => {
    const url = `https://www.google.com/maps?q=${latitude},${longitude}`;
    window.open(url, '_blank');
  };

  return (
    <div className="w-full">
      <div className="relative h-64 w-full overflow-hidden rounded-lg border border-border bg-muted">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-sm">
            <div className="text-center">
              <div className="mb-2 h-8 w-8 animate-spin rounded-full border-4 border-border border-t-primary mx-auto"></div>
              <p className="text-sm text-muted-foreground">Loading map...</p>
            </div>
          </div>
        )}
        {hasError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/50 backdrop-blur-sm">
            <MapPin className="mb-2 h-8 w-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              {latitude.toFixed(4)}, {longitude.toFixed(4)}
            </p>
            <p className="text-xs text-muted-foreground">Map requires API key</p>
          </div>
        )}
        <div ref={mapContainer} className="h-full w-full" />
      </div>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">Location Coordinates</p>
          <p className="mt-1 font-mono text-sm">
            {latitude.toFixed(6)}, {longitude.toFixed(6)}
          </p>
          {distance !== null && (
            <p className="mt-1 text-sm text-muted-foreground">
              <strong>Distance:</strong> {distance.toFixed(2)} miles
            </p>
          )}
        </div>
        <Button
          onClick={handleOpenInGoogleMaps}
          variant="outline"
          className="gap-2"
          size="sm"
        >
          <ExternalLink size={16} />
          Open Map
        </Button>
      </div>
    </div>
  );
}
