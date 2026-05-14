import { Feature, GeoJsonProperties, Point } from "geojson";
import { LatLngTuple } from "leaflet";
import { Marker, useMap } from "react-leaflet";
import Leaflet from "leaflet";

const createMarker = (text: string, selected: boolean) => {
  let backgroundColor = "var(--confirmed-background-color)";
  let textColor = "white";
  let borderColor = "unset";

  if (selected) {
    backgroundColor = "var(--color-light-orange)";
  }

  return Leaflet.divIcon({
    html: `
              <div style="fill: ${backgroundColor}; transition: all 0.5s;">
                  <svg
                      width="45"
                      height="45"
                      viewBox="0 0 700 700" 
                      xmlns="http://www.w3.org/2000/svg"
                  >
                    <circle cx="350" cy="350" r="300" stroke="${borderColor}" stroke-width="40" fill-opacity="0.4"/>
                    <circle cx="350" cy="350" r="250" stroke="${borderColor}" stroke-width="40" fill-opacity="0.6"/>
                    <circle cx="350" cy="350" r="200" stroke="${borderColor}" stroke-width="40" fill-opacity="0.8"/>
                    <circle cx="350" cy="350" r="150" stroke="${borderColor}" stroke-width="40" />
                    <text font-size="15em" x="50%" y="50%" fill="${textColor}" text-anchor="middle" dominant-baseline="central">
                      ${text || ""}
                    </text>
                  </svg>
              </div>`,
    className: "svg-icon",
    iconSize: [45, 45],
    iconAnchor: [22, 22],
    popupAnchor: [1, 20],
    tooltipAnchor: [16, -28],
    shadowSize: [41, 41],
  });
};

interface ClusterProps {
  cluster: Feature<Point, GeoJsonProperties>;
  onClick: (
    cluster: Feature<Point, GeoJsonProperties>,
    map?: Leaflet.Map
  ) => void;
  selected?: boolean;
  disabled?: boolean;
  text?: string;
}

const Cluster = ({
  cluster,
  onClick,
  selected = false,
  disabled,
  text = `${cluster.properties?.projectIds?.length}`,
}: ClusterProps) => {
  const map = useMap();
  let opacity = 1;
  if (disabled) {
    opacity = 0.4;
  }

  // Validate coordinates before rendering
  const coords = cluster.geometry.coordinates;
  if (
    !coords ||
    !Array.isArray(coords) ||
    coords.length !== 2 ||
    typeof coords[0] !== "number" ||
    typeof coords[1] !== "number" ||
    isNaN(coords[0]) ||
    isNaN(coords[1]) ||
    coords[0] < -180 ||
    coords[0] > 180 ||
    coords[1] < -90 ||
    coords[1] > 90
  ) {
    console.warn("Invalid coordinates for cluster:", cluster);
    return null;
  }

  try {
    const position = coords.toReversed() as LatLngTuple;

    return (
      <Marker
        position={position}
        key={cluster.properties?._id || cluster.geometry.coordinates.toString()}
        opacity={opacity}
        icon={createMarker(text, selected)}
        eventHandlers={{
          click: () => {
            if (disabled) {
              return;
            }
            onClick(cluster, map);
          },
        }}
      ></Marker>
    );
  } catch (error) {
    console.error("Error creating cluster marker:", error, cluster);
    return null;
  }
};

export default Cluster;
