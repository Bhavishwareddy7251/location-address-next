interface Coordinates {
  lat: number;
  lng: number;
}

// List of allowed locations with their coordinates
// These are example locations - replace with your actual service areas
const allowedLocations: Coordinates[] = [
  { lat: 17.3850, lng: 78.4867 }, // Hyderabad
  { lat: 12.9716, lng: 77.5946 }, // Bangalore
  { lat: 19.0760, lng: 72.8777 }, // Mumbai
  { lat: 28.6139, lng: 77.2090 }, // Delhi
  { lat: 13.0827, lng: 80.2707 }, // Chennai
];

// Maximum allowed distance in kilometers
export const MAX_ALLOWED_DISTANCE = 5;

export default allowedLocations;
