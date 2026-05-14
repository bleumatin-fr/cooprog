export const degreesToRadians = (degrees: number) => {
  var radians = (degrees * Math.PI) / 180;

  return radians;
};

const calcDistance = (
  starting: GeoJSON.Position,
  destination: GeoJSON.Position
): number => {
  if (!starting || !destination) return 0;
  if (starting.length !== 2 || destination.length !== 2) return 0;
  const startingLat = degreesToRadians(starting[1]);
  const startingLong = degreesToRadians(starting[0]);
  const destinationLat = degreesToRadians(destination[1]);
  const destinationLong = degreesToRadians(destination[0]);

  // Radius of the Earth in kilometers

  const radius: number = 6371;

  // Haversine equation

  const distanceInKilometers: number =
    Math.acos(
      Math.sin(startingLat) * Math.sin(destinationLat) +
        Math.cos(startingLat) *
          Math.cos(destinationLat) *
          Math.cos(startingLong - destinationLong)
    ) * radius;

  return Math.floor(distanceInKilometers * 100) / 100;
};

export default calcDistance;
