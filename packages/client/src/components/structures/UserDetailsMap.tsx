import L, { latLngBounds, LatLngTuple } from "leaflet";
import "leaflet/dist/leaflet.css";
import { isEqual } from "lodash";
import { useEffect } from "react";
import {
  MapContainer,
  Marker,
  Polyline,
  TileLayer,
  useMap,
} from "react-leaflet";
import { CircularProgress } from "@mui/material";
import createMarker from "../map/Marker";
import { LabeledLocation } from "@cooprog/core";

const DefaultIcon = L.icon({
  iconUrl: "/images/leaflet/marker-icon.png",
  shadowUrl: "/images/leaflet/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

const MAP_WORLD_BOUNDS: [[number, number], [number, number]] = [
  [-90, -180],
  [90, 180],
];

const ChangeView = ({ positions }: { positions: GeoJSON.Position[] }) => {
  const map = useMap();
  useEffect(() => {
    if (!positions || positions.length === 0) return;
    if (positions?.length === 1 || isEqual(positions[0], positions[1])) {
      map.setZoom(6);
      map.panTo(positions[0] as LatLngTuple);
      return;
    }
    const markerBounds = latLngBounds([]);
    positions?.forEach((position) => {
      markerBounds.extend(position as LatLngTuple);
    });
    map.fitBounds(markerBounds, { padding: [50, 50] });
  }, [map, positions]);

  return null;
};

type MapProps = {
  start: GeoJSON.Position;
  end: GeoJSON.Position;
  distance?: number;
  color?: string;
  otherLocations?: LabeledLocation[];
};

const NotDynamicMap = ({
  start,
  end,
  distance,
  color,
  otherLocations,
}: MapProps) => {
  if (!start || !end) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100%",
          width: "100%",
          backgroundColor: "#f5f5f5",
          borderRadius: "8px",
        }}
      >
        <CircularProgress size={40} style={{ color: "var(--color-orange)" }} />
      </div>
    );
  }

  const positions = [
    Array.from(start).slice().reverse(),
    Array.from(end).slice().reverse(),
  ];
  return (
    <MapContainer
      style={{ width: "100%", height: "100%" }}
      maxBounds={MAP_WORLD_BOUNDS}
      maxBoundsViscosity={1}
    >
      <TileLayer
        attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        noWrap
      />
      <Polyline
        positions={[positions[0] as LatLngTuple, positions[1] as LatLngTuple]}
        pathOptions={{ color: "var(--color-light-orange)" }}
        dashArray={[5, 5]}
      />
      <Marker
        position={positions[0] as LatLngTuple}
        icon={createMarker("var(--color-orange)")}
      />
      <Marker
        position={positions[1] as LatLngTuple}
        icon={createMarker("#FFD700")}
      />
      {otherLocations?.map((location) => (
        <Marker
          position={
            Array.from(location.location.geolocation.coordinates)
              .slice()
              .reverse() as LatLngTuple
          }
          icon={createMarker(color || "var(--color-green)")}
        />
      ))}
      {positions?.length === 2 && !isEqual(positions[0], positions[1]) && (
        <DistanceLabel
          start={positions[0]}
          end={positions[1]}
          distance={distance}
        />
      )}
      <ChangeView positions={positions} />
    </MapContainer>
  );
};

const DistanceLabel = ({ start, end, distance }: MapProps) => {
  if (!start || !end) return null;
  if (!distance) return null;
  if (start.length !== 2 || end.length !== 2) return null;

  const label = L.divIcon({
    html: `<p style="font-size: 16px; color: var(--color-light-orange); font-weight: bold; text-align:left; width: 100px; ">${distance?.toFixed(
      0
    )} km</p>`,
  });

  const center = [
    (start[0] + end[0]) / 2 + Math.abs((start[0] - end[0]) / 4),
    (start[1] + end[1]) / 2 + Math.abs((start[0] - end[0]) / 4),
  ];

  return <Marker position={center as LatLngTuple} icon={label} />;
};

export default NotDynamicMap;
