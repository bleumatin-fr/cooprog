import { latLngBounds, LatLngBounds, LatLngTuple } from "leaflet";
import { useEffect, useRef } from "react";
import { useMap, useMapEvents } from "react-leaflet";
import { Tour } from "@cooprog/core";
import { ProgramStatuses } from "@cooprog/core";

const FitViewToTour = ({
  tour,
  onZoomChanged,
}: {
  tour: Tour;
  onZoomChanged?: (zoom: number) => void;
}) => {
  const map = useMap();
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
    if (!map) return;
    const markers =
      tour.schedule
        ?.filter(
          (program) =>
            program.location?.geolocation?.coordinates.length === 2 &&
            [
              ProgramStatuses.SHOW_CONFIRMED,
              ProgramStatuses.SHOW_PENDING,
            ].includes(program.status)
        )
        .map((program) => program.location?.geolocation.coordinates) || [];

    if (markers.length && markers.length > 0) {
      let markerBounds = latLngBounds([]);
      markers.forEach((marker) => {
        markerBounds.extend(marker?.toReversed() as LatLngTuple);
      });
      map.fitBounds(markerBounds, {
        maxZoom: map.getZoom(),
        padding: [20, 20],
      });
    }
  }, [map, tour.schedule]);

  return null;
};

export default FitViewToTour;
