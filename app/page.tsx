'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';

interface Coordinates {
  lat: number;
  lng: number;
}

export default function Home() {
  const [coords, setCoords] = useState<Coordinates | null>(null);
  const [address, setAddress] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!('geolocation' in navigator)) {
      setError('Geolocation is not supported by your browser.');
      return;
    }

    setLoading(true);

    navigator.geolocation.getCurrentPosition(
      async ({ coords: { latitude, longitude } }) => {
        setCoords({ lat: latitude, lng: longitude });

        try {
          const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY;
          if (!apiKey) {
            setError('Google Maps API key is missing');
            setLoading(false);
            return;
          }

          const response = await axios.get(
            'https://maps.googleapis.com/maps/api/geocode/json',
            {
              params: {
                latlng: `${latitude},${longitude}`,
                key: apiKey,
              },
            }
          );

          if (response.data.status === 'OK') {
            const formattedAddress =
              response.data.results?.[0]?.formatted_address || 'Address not found';
            setAddress(formattedAddress);
          } else {
            setError('Failed to get address from Google Maps API');
          }
        } catch (e) {
          setError(e instanceof Error ? e.message : 'Error fetching address');
        } finally {
          setLoading(false);
        }
      },
      (geoError) => {
        setError(geoError.message);
        setLoading(false);
      },
      { timeout: 10000 }
    );
  }, []);

  return (
    <main
      className="min-h-screen flex items-center justify-center p-6"
      style={{
        background: `var(--background)`,
        backgroundImage: `radial-gradient(var(--accent) 0.5px, transparent 0.5px)`,
        backgroundSize: `20px 20px`
      }}
    >
      <div
        className="max-w-lg w-full text-center space-y-6"
        style={{
          background: `var(--card-bg)`,
          borderRadius: `var(--radius-lg)`,
          boxShadow: `var(--shadow-lg)`,
          padding: `2rem`,
          border: `1px solid var(--border)`
        }}
      >
        <h1 style={{
          fontSize: `1.75rem`,
          fontWeight: 600,
          marginBottom: `1.5rem`,
          background: `linear-gradient(90deg, var(--primary) 0%, var(--accent) 100%)`,
          WebkitBackgroundClip: `text`,
          WebkitTextFillColor: `transparent`,
          display: `inline-block`
        }}>
          Your Location & Address
        </h1>

        {loading && (
          <div className="flex justify-center items-center py-4">
            <div style={{
              width: `2rem`,
              height: `2rem`,
              border: `3px solid var(--secondary)`,
              borderTop: `3px solid var(--primary)`,
              borderRadius: `50%`,
              animation: `spin 1s linear infinite`
            }} />
            <style jsx>{`
              @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
            `}</style>
            <p style={{ marginLeft: `1rem` }}>Fetching location and address...</p>
          </div>
        )}

        {error && (
          <div style={{
            padding: `1rem`,
            borderRadius: `var(--radius)`,
            background: `rgba(230, 57, 70, 0.1)`,
            border: `1px solid var(--error)`,
            color: `var(--error)`
          }}>
            <p>{error}</p>
          </div>
        )}

        {coords && (
          <div style={{
            padding: `1rem`,
            borderRadius: `var(--radius)`,
            background: `var(--secondary)`,
            display: `flex`,
            flexDirection: `column`,
            gap: `0.5rem`
          }}>
            <h2 style={{ fontSize: `1rem`, fontWeight: 600 }}>Coordinates</h2>
            <div style={{
              display: `flex`,
              justifyContent: `center`,
              gap: `1rem`,
              fontFamily: `var(--font-geist-mono)`,
              fontSize: `0.9rem`
            }}>
              <div style={{
                padding: `0.5rem 1rem`,
                background: `var(--card-bg)`,
                borderRadius: `var(--radius)`,
                boxShadow: `var(--shadow)`,
                flex: 1
              }}>
                <span style={{ opacity: 0.7 }}>Lat:</span> {coords.lat.toFixed(5)}
              </div>
              <div style={{
                padding: `0.5rem 1rem`,
                background: `var(--card-bg)`,
                borderRadius: `var(--radius)`,
                boxShadow: `var(--shadow)`,
                flex: 1
              }}>
                <span style={{ opacity: 0.7 }}>Lng:</span> {coords.lng.toFixed(5)}
              </div>
            </div>
          </div>
        )}

        {address && (
          <div style={{
            display: `flex`,
            flexDirection: `column`,
            gap: `0.5rem`
          }}>
            <h2 style={{ fontSize: `1rem`, fontWeight: 600 }}>Address</h2>
            <textarea
              readOnly
              style={{
                width: `100%`,
                padding: `1rem`,
                borderRadius: `var(--radius)`,
                border: `1px solid var(--border)`,
                background: `var(--secondary)`,
                fontFamily: `inherit`,
                resize: `none`,
                textAlign: `left`,
                lineHeight: 1.5,
                color: `var(--foreground)`,
                fontSize: `0.95rem`
              }}
              rows={3}
              value={address}
            />
          </div>
        )}

        {coords && (
          <a
            href={`https://www.google.com/maps?q=${coords.lat},${coords.lng}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: `inline-flex`,
              alignItems: `center`,
              justifyContent: `center`,
              gap: `0.5rem`,
              padding: `0.75rem 1.5rem`,
              borderRadius: `var(--radius)`,
              background: `var(--primary)`,
              color: `white`,
              fontWeight: 500,
              textDecoration: `none`,
              transition: `var(--transition)`,
              boxShadow: `var(--shadow)`,
              marginTop: `1rem`
            }}
            onMouseOver={(e) => e.currentTarget.style.background = `var(--primary-hover)`}
            onMouseOut={(e) => e.currentTarget.style.background = `var(--primary)`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
              <circle cx="12" cy="10" r="3"></circle>
            </svg>
            Open in Google Maps
          </a>
        )}
      </div>
    </main>
  );
}
