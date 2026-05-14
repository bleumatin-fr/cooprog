import { latLngBounds, LatLngBounds, LatLngTuple } from "leaflet";
import { useEffect, useRef, useState } from "react";
import { useMap, useMapEvents } from "react-leaflet";
import { Feature, GeoJsonProperties, Point } from "geojson";

const FitViewToMarkers = ({
  markers,
  onZoomChanged,
}: {
  markers: Feature<Point, GeoJsonProperties>[];
  onZoomChanged?: (zoom: number) => void;
}) => {
  const map = useMap();
  const bounds = useRef<LatLngBounds | null>(null);
  const [fitted, setFitted] = useState(false);

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
    if (!map) return;
    if (fitted) return;
    if (markers.length && markers.length > 0) {
      try {
        let markerBounds = latLngBounds([]);
        const validMarkers = markers.filter((marker) => {
          // Validate coordinates
          const coords = marker.geometry.coordinates;
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

        if (validMarkers.length === 0) {
          console.warn("No valid markers found for bounds fitting");
          return;
        }

        validMarkers.forEach((marker) => {
          try {
            const latLng =
              marker.geometry.coordinates.toReversed() as LatLngTuple;
            markerBounds.extend(latLng);
          } catch (error) {
            console.warn("Error extending bounds for marker:", marker, error);
          }
        });

        if (markerBounds.isValid()) {
          map.fitBounds(markerBounds, {
            maxZoom: map.getZoom(),
            padding: [20, 20],
          });
          setFitted(true);
        } else {
          console.warn("Invalid bounds calculated, skipping fitBounds");
        }
      } catch (error) {
        console.error("Error fitting bounds to markers:", error);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [markers]);

  return null;
};

export default FitViewToMarkers;
