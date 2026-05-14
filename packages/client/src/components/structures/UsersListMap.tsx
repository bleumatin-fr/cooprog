import { User } from "@cooprog/core";
import styled from "@emotion/styled";
import { Feature, GeoJsonProperties, Point } from "geojson";
import { LatLngBounds, latLngBounds, LatLngTuple } from "leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect, useRef, useState } from "react";

import RoomIcon from "@mui/icons-material/Room";
import { isEmpty } from "lodash";
import { useTranslation } from "next-i18next";
import {
  MapContainer,
  Marker,
  MarkerProps,
  Popup,
  TileLayer,
  useMap,
  useMapEvents,
} from "react-leaflet";
import Legend from "../map/Legend";
import createMarker, { ClusterIcon } from "../map/Marker";
import Title from "../map/Title";
import Explanation from "../UI/Explanation";
import useConfiguration from "../useConfiguration";
import { UserTooltipContent } from "./UserTooltip";

const AccessibilityBadgeContainer = styled.div`
  margin-top: 8px;
  > div {
    display: flex;
    flex-direction: row;
  }
`;

const MAP_WORLD_BOUNDS: [[number, number], [number, number]] = [
  [-90, -180],
  [90, 180],
];

const ChangeView = ({
  markers,
  selectedUser,
  onZoomChanged,
}: {
  markers: Feature<Point, GeoJsonProperties>[];
  selectedUser: User | null;
  onZoomChanged?: (zoom: number) => void;
}) => {
  const map = useMap();
  const fitted = useRef(false);
  const bounds = useRef<LatLngBounds | null>(null);

  useMapEvents({
    zoomend: () => {
      bounds.current = map.getBounds();
      onZoomChanged && onZoomChanged(map.getZoom());
    },
    moveend: () => {
      bounds.current = map.getBounds();
    },
  });

  useEffect(() => {
    if (!map || !bounds.current) return;
    if (
      markers.every(
        (marker) =>
          !bounds?.current?.contains(
            marker.geometry.coordinates.toReversed() as LatLngTuple
          ) && !marker.properties?.cluster
      ) &&
      markers.length > 0
    ) {
      map.flyTo([
        markers[0].geometry.coordinates[1],
        markers[0].geometry.coordinates[0],
      ]);
      return;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [markers]);

  useEffect(() => {
    if (!map) return;
    if (fitted.current) return;
    if (markers.length && markers.length > 0) {
      let markerBounds = latLngBounds([]);
      markers
        .filter((marker) => {
          if (!selectedUser) return true;
          return marker.properties?.userIds?.includes(selectedUser._id);
        })
        .forEach((marker) => {
          markerBounds.extend(
            marker.geometry.coordinates.toReversed() as LatLngTuple
          );
        });
      map.fitBounds(markerBounds, {
        maxZoom: map.getZoom(),
        padding: [20, 20],
      });
      fitted.current = true;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [markers, map]);

  return null;
};

interface UsersListMapProps {
  markers: Feature<Point, GeoJsonProperties>[];
  selected: User | null;
  user: User;
  onZoomChanged?: (zoom: number) => void;
}

const Cluster = ({ ...props }: MarkerProps) => {
  const map = useMap();

  return (
    <Marker
      {...props}
      eventHandlers={{
        click: () => {
          map.flyTo(props.position, map.getZoom() + 2);
        },
      }}
    ></Marker>
  );
};
const UserPopup = ({ user }: { user: User }) => {
  return (
    <Popup>
      <UserTooltipContent user={user} />
    </Popup>
  );
};

type UserMarkerProps = MarkerProps & {
  user: User | null;
};

export const UserMarker = ({ user, ...props }: UserMarkerProps) => {
  const { t } = useTranslation();
  return <Marker {...props}>{!!user?._id && <UserPopup user={user} />}</Marker>;
};

const UsersListMap = ({
  markers,
  selected,
  user,
  onZoomChanged,
}: UsersListMapProps) => {
  const [zoom, setZoom] = useState(5);
  const { t } = useTranslation();
  const { configuration } = useConfiguration();

  if (!configuration || isEmpty(configuration)) return null;

  const handleZoomChanged = (newZoom: number) => {
    setZoom(newZoom);
    onZoomChanged && onZoomChanged(newZoom);
  };

  const mainUserLocation = user.locations?.find((loc) => loc.isMain);
  if (!mainUserLocation) return null;

  return (
    <MapContainer
      style={{ width: "100%", height: "100%" }}
      center={[
        mainUserLocation.location.geolocation.coordinates[1],
        mainUserLocation.location.geolocation.coordinates[0],
      ]}
      maxBounds={MAP_WORLD_BOUNDS}
      maxBoundsViscosity={1}
    >
      <TileLayer
        attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        noWrap
      />
      <ChangeView
        selectedUser={selected}
        markers={markers}
        onZoomChanged={handleZoomChanged}
      />

      {markers.map((marker) => {
        let backgroundColor = "var(--in-range-color)";
        let opacity = 1;

        if (selected && !marker.properties?.userIds.includes(selected?._id)) {
          opacity = 0.5;
        }

        if (marker.properties?.cluster) {
          return (
            <Cluster
              position={marker.geometry.coordinates.toReversed() as LatLngTuple}
              key={marker.id || marker.geometry.coordinates.toString()}
              opacity={opacity}
              icon={createMarker(
                marker.properties?.userIds.includes(selected?._id)
                  ? "var(--color-light-orange)"
                  : "var(--confirmed-background-color)",

                "cluster",
                marker.properties?.userIds.length
              )}
            ></Cluster>
          );
        }

        if (marker.properties?.userIds.includes(selected?._id)) {
          backgroundColor = "var(--color-light-orange)";
        }

        return (
          <UserMarker
            position={marker.geometry.coordinates.toReversed() as LatLngTuple}
            key={marker.id || marker.geometry.coordinates.toString()}
            opacity={opacity}
            icon={createMarker(backgroundColor, "default")}
            user={marker.properties as User}
          ></UserMarker>
        );
      })}

      <Title>
        {t("common:legends.users-title")}
        <Explanation title={t("common:legends.users-title")}>
          {t("common:legends.users-title-explanation")}
        </Explanation>
      </Title>
      <Legend>
        <div style={{ fill: "var(--confirmed-background-color)" }}>
          <ClusterIcon width={30} height={30}>
            #
          </ClusterIcon>
          {t("common:legends.user-cluster")}
        </div>
        <div>
          <RoomIcon sx={{ color: "var(--in-range-color)" }} />{" "}
          {t("common:legends.people-within")}
        </div>
      </Legend>
    </MapContainer>
  );
};

export default UsersListMap;
