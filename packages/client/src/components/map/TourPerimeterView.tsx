import { ProgramStatuses, Tour } from "@cooprog/core";
import { LatLngTuple, Point } from "leaflet";
import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";
import { Circle, Tooltip, useMap } from "react-leaflet";
import humanizeDateRange from "../projects/humanizeDateRange";
import { useState, useEffect } from "react";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined";

interface TourPerimeterViewProps {
  tour: Tour;
  showTooltip?: boolean;
  clickable?: boolean;
}

const TourPerimeterView = ({
  tour,
  showTooltip = true,
  clickable = true,
}: TourPerimeterViewProps) => {
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const [hover, setHover] = useState(false);
  const [isMapReady, setIsMapReady] = useState(false);
  const map = useMap();

  useEffect(() => {
    if (!map) return;

    let isMounted = true;

    // Wait for map to be fully ready before rendering Circle
    map.whenReady(() => {
      if (!isMounted) return;
      
      // Additional check to ensure canvas context is ready
      try {
        const container = map.getContainer();
        if (container && container.querySelector("canvas")) {
          setIsMapReady(true);
        } else {
          // If canvas doesn't exist yet, wait a bit more
          setTimeout(() => {
            if (isMounted) {
              setIsMapReady(true);
            }
          }, 100);
        }
      } catch (error) {
        // If there's an error, still try to render after a delay
        setTimeout(() => {
          if (isMounted) {
            setIsMapReady(true);
          }
        }, 200);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [map]);

  if (
    !tour.perimeter?.geometry?.coordinates ||
    !tour.perimeter?.properties?.radius
  ) {
    return null;
  }

  // Don't render Circle until map is ready
  if (!isMapReady) {
    return null;
  }

  const numberOfSteps = tour.schedule?.filter(
    (program) =>
      program.location?.geolocation?.coordinates.length === 2 &&
      [ProgramStatuses.SHOW_PENDING, ProgramStatuses.SHOW_CONFIRMED].includes(
        program.status
      )
  ).length;

  return (
    <Circle
      center={
        tour.perimeter.geometry.coordinates.slice().reverse() as LatLngTuple
      }
      radius={tour.perimeter.properties.radius * 1000}
      pathOptions={{
        color: tour.color || "blue",
        opacity: hover ? 1 : 0.5,
        weight: 5,
      }}
      fillOpacity={0.5}
      eventHandlers={{
        mouseover: () => setHover(true),
        mouseout: () => setHover(false),
        click: () => {
          if (!clickable) return;
          const currentPath = router.asPath;
          router.push(`${currentPath}/tours/${tour._id}`);
        },
      }}
    >
      {showTooltip && (
        <Tooltip
          permanent
          direction="center"
          className="tour-circle-tooltip"
          offset={numberOfSteps === 1 ? new Point(0, 70) : new Point(0, 0)}
        >
          <strong>{tour.name}</strong>
          <br />
          <span>
            <CalendarMonthOutlinedIcon
              sx={{
                verticalAlign: "middle",
                fontSize: "14px",
                marginRight: "0.5rem",
              }}
            />
            {humanizeDateRange(tour.start!, tour.end || null, i18n)}
          </span>
          <br />
          <span>
            <PersonOutlinedIcon
              sx={{
                verticalAlign: "middle",
                fontSize: "14px",
                marginRight: "0.5rem",
              }}
            />
            {t("projects:tours.card.attendees", {
              count: tour.users.length || 0,
            })}
          </span>
        </Tooltip>
      )}
    </Circle>
  );
};

export default TourPerimeterView;
