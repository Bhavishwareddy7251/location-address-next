'use client';

import { useState, useCallback } from 'react';
import PickableMap from '../components/PickableMap';
import useReverseGeocode from '../hooks/useReverseGeocode';

interface Coordinates {
  lat: number;
  lng: number;
}

export default function Home() {
  const [coordinates, setCoordinates] = useState<Coordinates | null>(null);
  const { address, error, loading, reverseGeocode } = useReverseGeocode();
  const [geoLocationError, setGeoLocationError] = useState<string | null>(null);
  const [confirmedLocation, setConfirmedLocation] = useState<{
    coordinates: Coordinates;
    address: string;
    mapLink: string;
  } | null>(null);

  const handleCoordinatesChange = useCallback((coords: Coordinates) => {
    setCoordinates(coords);
    reverseGeocode(coords);
    // Reset confirmed location when coordinates change
    setConfirmedLocation(null);
  }, [reverseGeocode]);

  const handleUseMyLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setGeoLocationError('Geolocation is not supported by your browser');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setCoordinates(coords);
        reverseGeocode(coords);
        setGeoLocationError(null);
        // Reset confirmed location when using current location
        setConfirmedLocation(null);
      },
      (err) => {
        setGeoLocationError(`Error getting location: ${err.message}`);
      }
    );
  }, [reverseGeocode]);

  const handleConfirmLocation = useCallback(() => {
    if (coordinates) {
      const mapLink = `https://www.google.com/maps?q=${coordinates.lat},${coordinates.lng}`;
      setConfirmedLocation({
        coordinates,
        address: address || 'Address not available',
        mapLink
      });
      console.log('Location confirmed:', coordinates, address);
    } else {
      console.log('Cannot confirm location: coordinates not available');
    }
  }, [coordinates, address]);

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
        className="max-w-4xl w-full text-center space-y-6"
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
          WebkitBackgroundClip: `text`,
          color: `black`,
          display: `inline-block`
        }}>
          Interactive Location Finder
        </h1>

        <p style={{ marginBottom: '1rem' }}>
          Click on the map or drag the marker to find an address
        </p>

        <button
          onClick={handleUseMyLocation}
          disabled={loading}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1.5rem',
            borderRadius: 'var(--radius)',
            background: 'var(--secondary)',
            border: '1px solid var(--border)',
            color: 'var(--foreground)',
            fontWeight: 500,
            cursor: 'pointer',
            transition: 'var(--transition)',
            marginBottom: '1.5rem'
          }}
          onMouseOver={(e) => e.currentTarget.style.background = 'var(--secondary-hover)'}
          onMouseOut={(e) => e.currentTarget.style.background = 'var(--secondary)'}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <circle cx="12" cy="12" r="1"></circle>
          </svg>
          Use My Current Location
        </button>

        {geoLocationError && (
          <div style={{
            padding: '0.75rem',
            borderRadius: 'var(--radius)',
            background: 'rgba(230, 57, 70, 0.1)',
            border: '1px solid var(--error)',
            color: 'var(--error)',
            marginBottom: '1rem'
          }}>
            <p>{geoLocationError}</p>
          </div>
        )}

        <div style={{ height: '400px', marginBottom: '1.5rem' }}>
          <PickableMap
            initialCoordinates={coordinates || { lat: 40.7128, lng: -74.006 }}
            onCoordinatesChange={handleCoordinatesChange}
            height="100%"
          />
        </div>

        {coordinates && !confirmedLocation && (
          <div style={{
            marginBottom: '1.5rem',
            textAlign: 'center',
            animation: 'fadeIn 0.5s ease-in-out'
          }}>
            <style jsx>{`
              @keyframes fadeIn {
                from { opacity: 0; transform: translateY(10px); }
                to { opacity: 1; transform: translateY(0); }
              }
              @keyframes pulse {
                0% { box-shadow: 0 0 0 0 rgba(37, 99, 235, 0.7); }
                70% { box-shadow: 0 0 0 10px rgba(37, 99, 235, 0); }
                100% { box-shadow: 0 0 0 0 rgba(37, 99, 235, 0); }
              }
              button {
                animation: pulse 2s infinite;
              }
            `}</style>
            <button
              onClick={handleConfirmLocation}
              disabled={loading}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.75rem',
                padding: '1rem 2rem',
                borderRadius: 'var(--radius)',
                background: '#2563eb', /* Bright blue background */
                color: 'white',
                fontWeight: 600,
                border: 'none',
                cursor: 'pointer',
                transition: 'var(--transition)',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.08)',
                fontSize: '1.1rem',
                letterSpacing: '0.01em'
              }}
              onMouseOver={(e) => e.currentTarget.style.background = '#1d4ed8'} /* Darker blue on hover */
              onMouseOut={(e) => e.currentTarget.style.background = '#2563eb'} /* Back to original blue */
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 13l4 4L19 7"></path>
              </svg>
              <span style={{ fontWeight: 600 }}>CONFIRM LOCATION</span>
            </button>
          </div>
        )}

        <div style={{
          padding: '1.5rem',
          borderRadius: 'var(--radius)',
          background: 'var(--secondary)',
          textAlign: 'left'
        }}>
          <h2 style={{
            fontSize: '1.25rem',
            fontWeight: 600,
            marginBottom: '1rem',
            color: 'var(--foreground)'
          }}>
            Selected Location
          </h2>

          {loading && (
            <div className="flex items-center py-2">
              <div style={{
                width: '1.5rem',
                height: '1.5rem',
                border: '3px solid var(--card-bg)',
                borderTop: '3px solid var(--primary)',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }} />
              <style jsx>{`
                @keyframes spin {
                  0% { transform: rotate(0deg); }
                  100% { transform: rotate(360deg); }
                }
              `}</style>
              <p style={{ marginLeft: '0.75rem' }}>Loading address...</p>
            </div>
          )}

          {error && (
            <div style={{
              padding: '0.75rem',
              borderRadius: 'var(--radius)',
              background: 'rgba(230, 57, 70, 0.1)',
              border: '1px solid var(--error)',
              color: 'var(--error)'
            }}>
              <p>{error}</p>
            </div>
          )}

          {coordinates && (
            <div style={{
              display: 'flex',
              gap: '1rem',
              fontFamily: 'var(--font-geist-mono)',
              fontSize: '0.9rem',
              marginBottom: '1rem'
            }}>
              <div style={{
                padding: '0.5rem 1rem',
                background: 'var(--card-bg)',
                borderRadius: 'var(--radius)',
                boxShadow: 'var(--shadow)',
                flex: 1
              }}>
                <span style={{ opacity: 0.7 }}>Lat:</span> {coordinates.lat.toFixed(6)}
              </div>
              <div style={{
                padding: '0.5rem 1rem',
                background: 'var(--card-bg)',
                borderRadius: 'var(--radius)',
                boxShadow: 'var(--shadow)',
                flex: 1
              }}>
                <span style={{ opacity: 0.7 }}>Lng:</span> {coordinates.lng.toFixed(6)}
              </div>
            </div>
          )}

          {address && (
            <div>
              <h3 style={{
                fontSize: '1rem',
                fontWeight: 600,
                marginBottom: '0.5rem',
                color: 'var(--foreground)'
              }}>
                Address
              </h3>
              <p style={{
                padding: '1rem',
                background: 'var(--card-bg)',
                borderRadius: 'var(--radius)',
                border: '1px solid var(--border)',
                lineHeight: 1.5
              }}>
                {address}
              </p>
            </div>
          )}

          {confirmedLocation && (
            <div style={{
              marginTop: '2rem',
              padding: '1.5rem',
              borderRadius: 'var(--radius)',
              background: 'rgba(42, 157, 143, 0.1)',
              border: '1px solid var(--success)'
            }}>
              <h3 style={{
                fontSize: '1.1rem',
                fontWeight: 600,
                marginBottom: '1rem',
                color: 'var(--success)'
              }}>
                Location Confirmed
              </h3>

              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem'
              }}>
                <div style={{
                  display: 'flex',
                  gap: '1rem',
                  fontFamily: 'var(--font-geist-mono)',
                  fontSize: '0.9rem'
                }}>
                  <div style={{
                    padding: '0.5rem 1rem',
                    background: 'var(--card-bg)',
                    borderRadius: 'var(--radius)',
                    boxShadow: 'var(--shadow)',
                    flex: 1
                  }}>
                    <span style={{ opacity: 0.7 }}>Lat:</span> {confirmedLocation.coordinates.lat.toFixed(6)}
                  </div>
                  <div style={{
                    padding: '0.5rem 1rem',
                    background: 'var(--card-bg)',
                    borderRadius: 'var(--radius)',
                    boxShadow: 'var(--shadow)',
                    flex: 1
                  }}>
                    <span style={{ opacity: 0.7 }}>Lng:</span> {confirmedLocation.coordinates.lng.toFixed(6)}
                  </div>
                </div>

                <div>
                  <p style={{
                    padding: '1rem',
                    background: 'var(--card-bg)',
                    borderRadius: 'var(--radius)',
                    border: '1px solid var(--border)',
                    lineHeight: 1.5,
                    marginBottom: '1rem'
                  }}>
                    {confirmedLocation.address}
                  </p>

                  <div className='hello' style={{ textAlign: 'center' }}>
                    <a
                      href={confirmedLocation.mapLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem',
                        padding: '0.75rem 1.5rem',
                        borderRadius: 'var(--radius)',
                        background: 'black !important',
                        color: 'white',
                        fontWeight: 500,
                        textDecoration: 'none',
                        transition: 'var(--transition)',
                        boxShadow: 'var(--shadow)'
                      }}
                      onMouseOver={(e) => e.currentTarget.style.background = '#238b7d'}
                      onMouseOut={(e) => e.currentTarget.style.background = 'var(--success)'}
                    >
                      Open in Google Maps
                    </a>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
