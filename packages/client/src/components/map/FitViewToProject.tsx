import { LatLngBounds, latLngBounds, LatLngTuple } from "leaflet";
import { useEffect, useRef } from "react";
import { useMap } from "react-leaflet";
import { Project } from "@cooprog/core";

const FitViewToProject = ({
  project,
  onZoomChanged,
  backToPreviousZoomOnDestroy = false,
}: {
  project: Project;
  onZoomChanged?: (zoom: number) => void;
  backToPreviousZoomOnDestroy?: boolean;
}) => {
  const map = useMap();
  const previousBounds = useRef<LatLngBounds | null>(null);
  const previousZoom = useRef<number | null>(null);

  useEffect(() => {
    if (!map) return;
    if (!project) return;

    let isMounted = true;

    // Wait for map to be fully ready
    map.whenReady(() => {
      if (!isMounted) return;

      try {
        // Ensure map size is correct
        map.invalidateSize();

        const circles = project.tours
          ?.map((tour) => {
            return tour.perimeter;
          })
          .filter(Boolean);

        if (circles && circles.length > 0) {
          let bounds = latLngBounds([]);
          circles.forEach((circle) => {
            if (!circle) return;
            const coordinates = circle.geometry.coordinates as LatLngTuple;
            const radiusInDegrees = circle.properties?.radius / 111;
            const topLeft = [
              coordinates[1] + radiusInDegrees,
              coordinates[0] - radiusInDegrees,
            ] as LatLngTuple;
            const bottomRight = [
              coordinates[1] - radiusInDegrees,
              coordinates[0] + radiusInDegrees,
            ] as LatLngTuple;
            bounds.extend(topLeft);
            bounds.extend(bottomRight);
          });

          if (bounds.isValid()) {
            if (backToPreviousZoomOnDestroy) {
              previousBounds.current = map.getBounds();
              previousZoom.current = map.getZoom();
            }
            
            // Use animate: false to prevent animation timing issues
            map.fitBounds(bounds, {
              padding: [20, 20],
              animate: false,
            });
          }
        }
      } catch (error) {
        console.warn("Error fitting map bounds:", error);
      }
    });

    return () => {
      isMounted = false;

      if (
        backToPreviousZoomOnDestroy &&
        previousBounds.current &&
        previousZoom.current &&
        map
      ) {
        try {
          // Check if map container still exists in DOM before manipulating
          const container = map.getContainer();
          if (container && container.parentNode) {
            map.setZoom(previousZoom.current, { animate: false });
            map.setView(previousBounds.current.getCenter(), previousZoom.current, {
              animate: false,
            });
          }
        } catch (error) {
          // Ignore errors during cleanup
          console.warn("Error during map cleanup:", error);
        } finally {
          previousBounds.current = null;
          previousZoom.current = null;
        }
      }
    };
  }, [map, project, backToPreviousZoomOnDestroy]);

  return null;
};

export default FitViewToProject;
