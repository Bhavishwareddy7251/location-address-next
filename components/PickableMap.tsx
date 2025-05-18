import { useEffect, useRef, useState, useCallback } from 'react';
import { Loader } from '@googlemaps/js-api-loader';

interface Coordinates {
  lat: number;
  lng: number;
}

interface PickableMapProps {
  initialCoordinates?: Coordinates;
  onCoordinatesChange: (coords: Coordinates) => void;
  height?: string;
  width?: string;
  zoom?: number;
}

export default function PickableMap({
  initialCoordinates = { lat: 40.7128, lng: -74.006 }, // Default to NYC
  onCoordinatesChange,
  height = '400px',
  width = '100%',
  zoom = 13,
}: PickableMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [mapInstance, setMapInstance] = useState<google.maps.Map | null>(null);
  const [marker, setMarker] = useState<google.maps.Marker | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize the map
  useEffect(() => {
    if (!mapRef.current) return;

    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY;
    if (!apiKey) {
      setError('Google Maps API key is missing');
      return;
    }

    const loader = new Loader({
      apiKey,
      version: 'weekly',
    });

    loader
      .load()
      .then(() => {
        const map = new google.maps.Map(mapRef.current!, {
          center: initialCoordinates,
          zoom,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
        });

        const newMarker = new google.maps.Marker({
          position: initialCoordinates,
          map,
          draggable: true,
        });

        setMapInstance(map);
        setMarker(newMarker);
        setMapLoaded(true);

        // Notify parent of initial coordinates
        onCoordinatesChange(initialCoordinates);
      })
      .catch((err) => {
        setError(`Failed to load Google Maps: ${err.message}`);
      });
  }, [initialCoordinates, zoom, onCoordinatesChange]);

  // Set up event listeners once map and marker are loaded
  useEffect(() => {
    if (!mapInstance || !marker || !mapLoaded) return;

    // Handle map click
    const clickListener = mapInstance.addListener('click', (e: google.maps.MapMouseEvent) => {
      if (!e.latLng) return;
      
      const newPosition = {
        lat: e.latLng.lat(),
        lng: e.latLng.lng(),
      };
      
      marker.setPosition(newPosition);
      onCoordinatesChange(newPosition);
    });

    // Handle marker drag end
    const dragEndListener = marker.addListener('dragend', () => {
      const position = marker.getPosition();
      if (!position) return;
      
      const newPosition = {
        lat: position.lat(),
        lng: position.lng(),
      };
      
      onCoordinatesChange(newPosition);
    });

    // Cleanup listeners
    return () => {
      google.maps.event.removeListener(clickListener);
      google.maps.event.removeListener(dragEndListener);
    };
  }, [mapInstance, marker, mapLoaded, onCoordinatesChange]);

  // Update marker position if initialCoordinates change
  useEffect(() => {
    if (!marker || !mapInstance) return;
    
    marker.setPosition(initialCoordinates);
    mapInstance.panTo(initialCoordinates);
  }, [initialCoordinates, marker, mapInstance]);

  return (
    <div style={{ position: 'relative', width, height }}>
      {error && (
        <div style={{ 
          position: 'absolute', 
          top: 0, 
          left: 0, 
          right: 0, 
          padding: '10px', 
          background: 'rgba(255,0,0,0.7)', 
          color: 'white', 
          zIndex: 10 
        }}>
          {error}
        </div>
      )}
      <div 
        ref={mapRef} 
        style={{ width: '100%', height: '100%' }}
      />
      {!mapLoaded && !error && (
        <div style={{ 
          position: 'absolute', 
          top: '50%', 
          left: '50%', 
          transform: 'translate(-50%, -50%)',
          background: 'rgba(255,255,255,0.8)',
          padding: '10px',
          borderRadius: '4px'
        }}>
          Loading map...
        </div>
      )}
    </div>
  );
}
