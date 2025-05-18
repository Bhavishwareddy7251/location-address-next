interface Coordinates {
  lat: number;
  lng: number;
}

/**
 * Calculate the distance between two coordinates using the Haversine formula
 * @param coords1 First coordinates
 * @param coords2 Second coordinates
 * @returns Distance in kilometers
 */
export function calculateDistance(coords1: Coordinates, coords2: Coordinates): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRadians(coords2.lat - coords1.lat);
  const dLng = toRadians(coords2.lng - coords1.lng);
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(coords1.lat)) * Math.cos(toRadians(coords2.lat)) * 
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance in kilometers
  
  return distance;
}

/**
 * Convert degrees to radians
 * @param degrees Angle in degrees
 * @returns Angle in radians
 */
function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Check if coordinates are within a specified distance of any allowed location
 * @param userCoords User's coordinates
 * @param allowedLocations List of allowed locations
 * @param maxDistance Maximum allowed distance in kilometers
 * @returns True if within range, false otherwise
 */
export function isWithinAllowedDistance(
  userCoords: Coordinates, 
  allowedLocations: Coordinates[] = [
  { lat: 17.385044, lng: 78.486671 }, // Hyderabad City Center
  { lat: 17.4375, lng: 78.4452 },     // Banjara Hills
  { lat: 17.3850, lng: 78.4867 },     // Somajiguda
  { lat: 17.4933, lng: 78.3915 },     // Kukatpally
  { lat: 17.4500, lng: 78.3800 },     // Hitech City
  { lat: 17.4180, lng: 78.5430 },     // Uppal
  { lat: 17.5000, lng: 78.5300 },     // Medchal
  { lat: 17.3555, lng: 78.5522 },     // LB Nagar
], 
  maxDistance: number
): boolean {
  return allowedLocations.some(location => 
    calculateDistance(userCoords, location) <= maxDistance
  );
}
