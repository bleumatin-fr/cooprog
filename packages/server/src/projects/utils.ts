import { Position } from "geojson";

export function longitudeToKilometers(
  degrees: number,
  latitude: number
): number {
  const kilometersPerDegreeAtEquator = 111.32; // Distance per degree of longitude at the equator
  const radians = latitude * (Math.PI / 180); // Convert latitude to radians
  return degrees * kilometersPerDegreeAtEquator * Math.cos(radians);
}

export const degreesToRadians = (degrees: number) => {
  var radians = (degrees * Math.PI) / 180;

  return radians;
};

// Helper function to calculate the distance between two points on Earth (Haversine formula)
const haversineDistance = (coord1: Position, coord2: Position): number => {
  const R = 6371e3; // Earth radius in meters

  const [lon1, lat1] = coord1;
  const [lon2, lat2] = coord2;

  const φ1 = degreesToRadians(lat1);
  const φ2 = degreesToRadians(lat2);
  const Δφ = degreesToRadians(lat2 - lat1);
  const Δλ = degreesToRadians(lon2 - lon1);

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in meters
};

export const getRadius = (points: Position[], center: Position) => {
  let r: number = 0;
  points.forEach((point) => {
    const distance = haversineDistance(point, center);
    if (distance > r) r = distance;
  });
  return r;
};
