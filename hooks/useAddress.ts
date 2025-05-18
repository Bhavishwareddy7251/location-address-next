import { useEffect, useState } from 'react';
import axios from 'axios';

/** Canonical shape returned to components */
export interface Address {
  formatted: string;      // Human-readable address
  lat: number;
  lng: number;
}

interface OpenCageResponse {
  results: {
    formatted: string;
    geometry: { lat: number; lng: number };
  }[];
}

export default function useAddress() {
  const [address, setAddress] = useState<Address | null>(null);
  const [error,   setError]   = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (!('geolocation' in navigator)) {
      setError('Geolocation not supported in this browser.');
      return;
    }

    setLoading(true);

    navigator.geolocation.getCurrentPosition(
      async ({ coords: { latitude: lat, longitude: lng } }) => {
        try {
          const { data } = await axios.get<OpenCageResponse>(
            'https://api.opencagedata.com/geocode/v1/json',
            {
              params: {
                key: process.env.NEXT_PUBLIC_OPEN_CAGE_KEY,
                q: `${lat}+${lng}`,
                no_annotations: 1,
                language: 'en',
              },
            },
          );

          const formatted =
            data.results?.[0]?.formatted ?? 'Address not found';

          setAddress({ formatted, lat, lng });
        } catch (e) {
          setError(
            e instanceof Error ? e.message : 'Reverse-geocoding failed.',
          );
        } finally {
          setLoading(false);
        }
      },
      geoErr => {
        setError(geoErr.message);
        setLoading(false);
      },
      { enableHighAccuracy: false, timeout: 10_000 },
    );
  }, []);

  return { address, error, loading };
}
