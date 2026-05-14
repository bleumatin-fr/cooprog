import { Project } from "@cooprog/core";
import { Feature, GeoJsonProperties, Point } from "geojson";
import "leaflet/dist/leaflet.css";
import { useTranslation } from "next-i18next";
import { useEffect, useRef } from "react";

import Map from "@/components/map/Map";
import Title from "@/components/map/Title";
import Explanation from "@/components/UI/Explanation";
import Cluster from "@/components/map/Cluster";
import FitViewToMarkersOnce from "@/components/map/FitViewToMarkersOnce";
import ProjectStepsView from "@/components/map/ProjectStepsView";
import Legend from "@/components/map/Legend";

import CircleIcon from "@mui/icons-material/Circle";
import CircleOutlinedIcon from "@mui/icons-material/CircleOutlined";
import ClusterIcon from "@/components/UI/icons/ClusterIcon";
import ProjectMapView from "@/components/map/ProjectMapView";
import FitViewToProject from "@/components/map/FitViewToProject";

interface MapProps {
  clusters: Feature<Point, GeoJsonProperties>[];
  selectedCluster: Feature<Point, GeoJsonProperties> | null;
  setSelectedCluster: (
    cluster: Feature<Point, GeoJsonProperties> | null
  ) => void;

  defaultZoom?: number;
  onZoomChanged?: (zoom: number) => void;

  selectedProject: Project | null;
}

const ProjectListMap = ({
  clusters,
  selectedCluster,
  setSelectedCluster,

  defaultZoom = 5,
  onZoomChanged,

  selectedProject,
}: MapProps) => {
  const { t } = useTranslation();
  const zoom = useRef(defaultZoom);

  const handleSetSelectedCluster = (
    cluster: Feature<Point, GeoJsonProperties> | null
  ) => {
    if (!cluster) {
      setSelectedCluster(null);
      return;
    }
    try {
      const r = 100 / (512 * Math.pow(2, zoom.current));
      const bounds: Feature<Point, GeoJsonProperties> = {
        type: "Feature",
        geometry: cluster.geometry,
        properties: {
          radius: r,
        },
      };
      setSelectedCluster(bounds);
    } catch (error) {
      console.error("Error setting selected cluster:", error);
    }
  };

  useEffect(() => {
    if (selectedProject) return;
    if (!selectedCluster || !clusters.length) {
      setSelectedCluster(null);
      return;
    }

    try {
      const isSelectedClusterInClusters = clusters.some(
        (cluster) =>
          cluster.geometry.coordinates.toString() ===
          selectedCluster?.geometry.coordinates.toString()
      );
      if (!isSelectedClusterInClusters) {
        setSelectedCluster(null);
      }
    } catch (error) {
      console.error("Error checking selected cluster:", error);
      setSelectedCluster(null);
    }
  }, [clusters, selectedCluster, selectedProject, setSelectedCluster]);

  const handleZoomChanged = (newZoom: number) => {
    zoom.current = newZoom;
    if (selectedProject) return;
    // A selected cluster represents a zoom-level specific grouping.
    // Clear it on zoom changes to avoid keeping stale selection highlights/filters.
    if (selectedCluster) {
      setSelectedCluster(null);
    }
    onZoomChanged && onZoomChanged(newZoom);
  };

  // Filter out invalid clusters
  const validClusters = clusters.filter((cluster) => {
    const coords = cluster.geometry.coordinates;
    return (
      coords &&
      Array.isArray(coords) &&
      coords.length === 2 &&
      typeof coords[0] === "number" &&
      typeof coords[1] === "number" &&
      !isNaN(coords[0]) &&
      !isNaN(coords[1]) &&
      coords[0] >= -180 &&
      coords[0] <= 180 &&
      coords[1] >= -90 &&
      coords[1] <= 90
    );
  });

  return (
    <Map>
      <FitViewToMarkersOnce
        markers={validClusters}
        onZoomChanged={handleZoomChanged}
      ></FitViewToMarkersOnce>
      {selectedProject && (
        <FitViewToProject
          project={selectedProject}
          backToPreviousZoomOnDestroy
        ></FitViewToProject>
      )}
      <Title>
        {t("common:legends.projects-title")}
        <Explanation title={t("common:legends.projects-title")}>
          {t("common:legends.projects-title-explanation")}
        </Explanation>
      </Title>
      {validClusters.map((cluster) => (
        <Cluster
          key={
            cluster.properties?._id || cluster.geometry.coordinates.toString()
          }
          cluster={cluster}
          onClick={handleSetSelectedCluster}
          selected={
            selectedCluster?.geometry.coordinates.toString() ===
            cluster.geometry.coordinates.toString()
          }
          disabled={selectedProject !== null}
        />
      ))}
      {selectedProject && (
        <>
          <ProjectMapView project={selectedProject} />
          <ProjectStepsView project={selectedProject} />
        </>
      )}
      <Legend>
        {selectedProject && (
          <>
            <div>
              <CircleIcon sx={{ color: "var(--pending-background-color)" }} />{" "}
              {t("common:legends.pending-programmation")}
            </div>
            <div>
              <CircleIcon sx={{ color: "var(--confirmed-background-color)" }} />{" "}
              {t("common:legends.confirmed-programmation")}
            </div>
            <div>
              <CircleOutlinedIcon
                sx={{ color: "var(--my-background-color)" }}
              />{" "}
              {t("common:legends.my-programmation")}
            </div>
          </>
        )}
        {!selectedProject && (
          <>
            <div style={{ fill: "var(--confirmed-background-color)" }}>
              <ClusterIcon width={30} height={30}>
                #
              </ClusterIcon>
              {t("common:legends.project-cluster")}
            </div>
            <div style={{ fill: "var(--color-light-orange)" }}>
              <ClusterIcon width={30} height={30}>
                #
              </ClusterIcon>
              {t("common:legends.project-cluster-selected")}
            </div>
          </>
        )}
      </Legend>
    </Map>
  );
};

export default ProjectListMap;
