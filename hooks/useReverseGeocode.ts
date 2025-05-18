import { useState, useCallback } from 'react';
import axios from 'axios';

interface Coordinates {
  lat: number;
  lng: number;
}

interface UseReverseGeocodeResult {
  address: string | null;
  error: string | null;
  loading: boolean;
  reverseGeocode: (coords: Coordinates) => Promise<void>;
}

export default function useReverseGeocode(): UseReverseGeocodeResult {
  const [address, setAddress] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const reverseGeocode = useCallback(async (coords: Coordinates) => {
    setLoading(true);
    setError(null);
    
    try {
      const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY;
      if (!apiKey) {
        throw new Error('Google Maps API key is missing');
      }

      const response = await axios.get(
        'https://maps.googleapis.com/maps/api/geocode/json',
        {
          params: {
            latlng: `${coords.lat},${coords.lng}`,
            key: apiKey,
          },
        }
      );

      if (response.data.status === 'OK') {
        const formattedAddress = 
          response.data.results?.[0]?.formatted_address || 'Address not found';
        setAddress(formattedAddress);
      } else {
        throw new Error(`Geocoding error: ${response.data.status}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error fetching address');
      setAddress(null);
    } finally {
      setLoading(false);
    }
  }, []);

  return { address, error, loading, reverseGeocode };
}
