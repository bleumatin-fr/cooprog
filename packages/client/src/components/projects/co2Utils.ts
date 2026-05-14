import { Location } from "@cooprog/core";

// Helper to calculate distance between coordinates (Haversine formula)
// Accepts 2 or more points and returns the sum of distances between consecutive points
export const distanceBetween = (...points: [number, number][]): number => {
  if (points.length < 2) {
    return 0;
  }

  const R = 6371; // km
  const toRad = (deg: number) => (deg * Math.PI) / 180;

  let totalDistance = 0;

  for (let i = 0; i < points.length - 1; i++) {
    const p1 = points[i];
    const p2 = points[i + 1];

    const dLat = toRad(p2[1] - p1[1]);
    const dLon = toRad(p2[0] - p1[0]);
    const lat1 = toRad(p1[1]);
    const lat2 = toRad(p2[1]);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    totalDistance += R * c;
  }

  return Math.round(totalDistance);
};

export const distanceBetweenLocations = (...locations: Location[]): number => {
  return distanceBetween(
    ...locations.map(
      (location) => location.geolocation?.coordinates as [number, number]
    )
  );
};

export const getCenter = (points: GeoJSON.Position[]): [number, number] => {
  const xs = points.map((p) => p[0]);
  const ys = points.map((p) => p[1]);

  const xMin = Math.min(...xs);
  const xMax = Math.max(...xs);
  const yMin = Math.min(...ys);
  const yMax = Math.max(...ys);

  return [(xMin + xMax) / 2, (yMin + yMax) / 2];
};

export const getEmissionFactor = (
  transportModeOptions: Record<
    string,
    {
      label: string;
      icon: string;
      emissionFactor: number;
      default?: boolean;
      source?: { label: string; link: string };
    }
  >,
  transportMode: string
): {
  label: string;
  icon: string;
  emissionFactor: number;
  source?: { label: string; link: string };
} => {
  if (Object.keys(transportModeOptions).includes(transportMode)) {
    return transportModeOptions[transportMode];
  }
  return Object.values(transportModeOptions).find((mode) => mode.default)!;
};

export const formatCO2 = (valueInKg: number) => {
  if (valueInKg >= 1000) {
    return `${(valueInKg / 1000).toLocaleString(undefined, {
      maximumFractionDigits: 2,
    })} tCO₂e`;
  }
  return `${valueInKg.toLocaleString(undefined, {
    maximumFractionDigits: 1,
  })} kgCO₂e`;
};
