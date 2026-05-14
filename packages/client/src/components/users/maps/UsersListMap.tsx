import { ProgramStatuses, Role, User } from "@cooprog/core";
import { Feature, GeoJsonProperties, Point } from "geojson";
import "leaflet/dist/leaflet.css";
import { useMemo, useRef } from "react";

import RoomIcon from "@mui/icons-material/Room";
import { useTranslation } from "next-i18next";
import { Map } from "@/components/map/Map";
import Legend from "@/components/map/Legend";
import FitViewToMarkers from "@/components/map/FitViewToMarkers";
import Title from "@/components/map/Title";
import Explanation from "@/components/UI/Explanation";
import { ClusterIcon } from "@/components/map/Marker";
import Cluster from "@/components/map/Cluster";
import Leaflet, { LatLngTuple } from "leaflet";
import { Marker, Popup } from "react-leaflet";
import { UserTooltipContent } from "@/components/structures/UserTooltip";
import useUser from "@/components/authentication/useUser";

const createMarker = (own: boolean) => {
  let backgroundColor = "var(--in-range-color)";

  if (own) {
    backgroundColor = "var(--my-background-color)";
  }

  return Leaflet.divIcon({
    html: `
<div style="fill: ${backgroundColor};">
    <svg
        width="45"
        height="45"
        viewBox="0 0 700 700" 
        xmlns="http://www.w3.org/2000/svg"
    >
        <path d="m374.25 506.52c-22.051 13.379-50.785 6.3633-64.176-15.664-82.293-135.37-123.4-227.49-123.4-281.03 0-90.113 73.125-163.16 163.33-163.16s163.33 73.047 163.33 163.16c0 53.539-41.109 145.66-123.4 281.03-3.8906 6.4023-9.2695 11.777-15.684 15.664zm-24.074-226.52c38.703 0 70.078-31.34 70.078-70s-31.375-70-70.078-70c-38.699 0-70.074 31.34-70.074 70s31.375 70 70.074 70z"/>
  </svg></div>`,
    className: "svg-icon",
    iconSize: [45, 45],
    iconAnchor: [22, 40],
    popupAnchor: [3, 3],
    tooltipAnchor: [16, -28],
    shadowSize: [41, 41],
  });
};
interface MapProps {
  clusters: Feature<Point, GeoJsonProperties>[];
  setSelectedCluster: (
    cluster: Feature<Point, GeoJsonProperties> | null,
  ) => void;
  defaultZoom?: number;
  onZoomChanged?: (zoom: number) => void;
  selectedUser: User | null;
}

const UsersListMap = ({
  clusters,
  setSelectedCluster,
  defaultZoom = 5,
  onZoomChanged,
  selectedUser,
}: MapProps) => {
  const { t } = useTranslation();
  const zoom = useRef(defaultZoom);
  const { user } = useUser();
  const userRole = user?.role;
  const handleSetSelectedCluster = (
    cluster: Feature<Point, GeoJsonProperties> | null,
    map?: Leaflet.Map,
  ) => {
    if (!cluster) {
      setSelectedCluster(null);
      return;
    }
    const r = 100 / (512 * Math.pow(2, zoom.current));
    const bounds: Feature<Point, GeoJsonProperties> = {
      type: "Feature",
      geometry: cluster.geometry,
      properties: {
        radius: r,
      },
    };
    setSelectedCluster(bounds);

    map?.flyTo(
      [cluster.geometry.coordinates[1], cluster.geometry.coordinates[0]],
      map.getZoom() + 2,
    );
  };

  const handleZoomChanged = (newZoom: number) => {
    zoom.current = newZoom;
    onZoomChanged && onZoomChanged(newZoom);
  };

  const selectedCluster = useMemo(() => {
    return clusters.find((cluster) =>
      cluster.properties?.userIds?.includes(selectedUser?._id),
    );
  }, [clusters, selectedUser]);

  const dedupedClusters = useMemo(() => {
    return clusters.filter(
      (cluster, index, self) =>
        index ===
        self.findIndex(
          (t) =>
            t.geometry.coordinates.toString() ===
            cluster.geometry.coordinates.toString(),
        ),
    );
  }, [clusters]);

  return (
    <Map>
      <FitViewToMarkers
        markers={clusters}
        onZoomChanged={handleZoomChanged}
      ></FitViewToMarkers>
      <Title>
        {t("common:legends.users-title")}
        <Explanation title={t("common:legends.users-title")}>
          {t("common:legends.users-title-explanation")}
        </Explanation>
      </Title>

      {dedupedClusters.map((cluster) => {
        if (cluster.properties?.cluster) {
          return (
            <Cluster
              key={
                cluster.properties?._id ||
                cluster.geometry.coordinates.toString()
              }
              cluster={cluster}
              onClick={handleSetSelectedCluster}
              selected={
                selectedCluster?.geometry.coordinates.toString() ===
                cluster.geometry.coordinates.toString()
              }
              text={`${cluster.properties?.userIds?.length}`}
            />
          );
        }
        return (
          <Marker
            key={
              cluster.properties?._id || cluster.geometry.coordinates.toString()
            }
            position={
              cluster.geometry.coordinates.slice().reverse() as LatLngTuple
            }
            icon={createMarker(
              cluster.properties?.userIds?.includes(selectedUser?._id),
            )}
          >
            <Popup>
              <UserTooltipContent
                user={cluster.properties as Partial<User>}
                showLink={userRole !== Role.ARTISTIC_TEAM}
              />
            </Popup>
          </Marker>
        );
      })}

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
    </Map>
  );
};

export default UsersListMap;
