'use client';

import { useState, useCallback } from 'react';
import PickableMap from '../components/PickableMap';
import useReverseGeocode from '../hooks/useReverseGeocode';
import "../app/page.module.css";
import { isWithinAllowedDistance } from '../utils/distance';
import allowedLocations, { MAX_ALLOWED_DISTANCE } from '../data/allowedLocations';

interface Coordinates {
  lat: number;
  lng: number;
}

export default function Home() {
  const [coordinates, setCoordinates] = useState<Coordinates | null>(null);
  const { address, error, loading, reverseGeocode } = useReverseGeocode();
  const [geoLocationError, setGeoLocationError] = useState<string | null>(null);
  const [locationAvailable, setLocationAvailable] = useState<boolean>(true);
  const [confirmedLocation, setConfirmedLocation] = useState<{
    coordinates: Coordinates;
    address: string;
    mapLink: string;
  } | null>(null);

  const handleCoordinatesChange = useCallback((coords: Coordinates) => {
    setCoordinates(coords);
    reverseGeocode(coords);
    setConfirmedLocation(null);
    setLocationAvailable(true); // Reset location availability when coordinates change
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
        setConfirmedLocation(null);
        setLocationAvailable(true); // Reset location availability when using current location
      },
      (err) => {
        setGeoLocationError(`Error getting location: ${err.message}`);
      }
    );
  }, [reverseGeocode]);

  const handleConfirmLocation = useCallback(() => {
    if (coordinates) {
      // Check if the user's location is within the allowed distance
      const isAvailable = isWithinAllowedDistance(
        coordinates,
        allowedLocations,
        MAX_ALLOWED_DISTANCE
      );

      setLocationAvailable(isAvailable);

      // If the location is available, set the confirmed location
      if (isAvailable) {
        const mapLink = `https://www.google.com/maps?q=${coordinates.lat},${coordinates.lng}`;
        setConfirmedLocation({
          coordinates,
          address: address || 'Address not available',
          mapLink
        });
      } else {
        // If the location is not available, clear the confirmed location
        setConfirmedLocation(null);
      }
    }
  }, [coordinates, address]);

  return (
    <main className="main-container">
      <div className="content-box">
        <h1 className="title">Interactive Location Finder</h1>

        <p className="subtitle">
          Click on the map or drag the marker to find an address
        </p>

        <button
          onClick={handleUseMyLocation}
          disabled={loading}
          className="use-location-btn"
        >
          Use My Current Location
        </button>

        {geoLocationError && (
          <div className="geo-error">
            <p>{geoLocationError}</p>
          </div>
        )}

        <div className="map-wrapper">
          <PickableMap
            initialCoordinates={coordinates || undefined}
            onCoordinatesChange={handleCoordinatesChange}
            height="100%"
          />
        </div>

        {coordinates && !confirmedLocation && (
          <div className="confirm-wrapper">
            <button
              onClick={handleConfirmLocation}
              disabled={loading}
              className="confirm-btn"
            >
              <span>CONFIRM LOCATION</span>
            </button>
          </div>
        )}

        {!locationAvailable && (
          <div className="error-box" style={{ marginBottom: '1.5rem' }}>
            <p>Sorry, we are not available at your location.</p>
            <p>Please select a location within {MAX_ALLOWED_DISTANCE} km of our service areas.</p>
          </div>
        )}

        <div className="location-info">
          <h2 className="section-heading">Selected Location</h2>

          {loading && (
            <div className="loading">
              <div className="spinner" />
              <p>Loading address...</p>
            </div>
          )}

          {error && (
            <div className="error-box">
              <p>{error}</p>
            </div>
          )}

          {coordinates && (
            <div className="coords-row">
              <div className="coord-box">Lat: {coordinates.lat.toFixed(6)}</div>
              <div className="coord-box">Lng: {coordinates.lng.toFixed(6)}</div>
            </div>
          )}

          {address && (
            <div>
              <h3 className="address-title">Address</h3>
              <p className="address-box">{address}</p>
            </div>
          )}

          {confirmedLocation && (
            <div className="confirmed-box">
              <h3 className="confirmed-title">Location Confirmed</h3>

              <div className="confirmed-details">
                <div className="coords-row">
                  <div className="coord-box">Lat: {confirmedLocation.coordinates.lat.toFixed(6)}</div>
                  <div className="coord-box">Lng: {confirmedLocation.coordinates.lng.toFixed(6)}</div>
                </div>

                <p className="address-box">{confirmedLocation.address}</p>

                <div className="map-link-wrapper">
                  <a
                    href={confirmedLocation.mapLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="map-link"
                  >
                    Open in Google Maps
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
