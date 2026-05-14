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
      let markerBounds = latLngBounds([]);
      markers
        // .filter((marker) => {
        //   if (!selectedProject) return true;
        //   return marker.properties?.projectIds?.includes(selectedProject._id);
        // })
        .forEach((marker) => {
          markerBounds.extend(
            marker.geometry.coordinates.toReversed() as LatLngTuple
          );
        });
      map?.fitBounds(markerBounds, {
        maxZoom: map?.getZoom(),
        padding: [20, 20],
      });
      setFitted(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, markers]);

  return null;
};

export default FitViewToMarkers;
