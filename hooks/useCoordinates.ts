import { useEffect, useState } from 'react';

export interface Coordinates {
  lat: number;
  lng: number;
}

export default function useCoordinates() {
  const [coords, setCoords] = useState<Coordinates | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!('geolocation' in navigator)) {
      setError('Geolocation not supported in this browser.');
      return;
    }

    setLoading(true);

    navigator.geolocation.getCurrentPosition(
      ({ coords: { latitude, longitude } }) => {
        setCoords({ lat: latitude, lng: longitude });
        setLoading(false);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      },
      { timeout: 10000 }
    );
  }, []);

  return { coords, error, loading };
}
