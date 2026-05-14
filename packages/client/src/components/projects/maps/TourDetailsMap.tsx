import TourStepsView from "@/components/map/TourStepsView";
import { Tour } from "@cooprog/core";
import "leaflet/dist/leaflet.css";
import Map from "@/components/map/Map";
import FitViewToTour from "@/components/map/FitViewToTour";
import TourPerimeterView from "@/components/map/TourPerimeterView";
import Title from "@/components/map/Title";
import { useTranslation } from "next-i18next";
import Legend from "@/components/map/Legend";
import CircleIcon from "@mui/icons-material/Circle";
import CircleOutlinedIcon from "@mui/icons-material/CircleOutlined";

type TourDetailsMapProps = {
  tour: Tour;
  dragging?: boolean;
  doubleClickZoom?: boolean;
  scrollWheelZoom?: boolean;
  attributionControl?: boolean;
  zoomControl?: boolean;
  title?: boolean;
};

const TourDetailsMap = ({
  tour,
  dragging = true,
  doubleClickZoom = true,
  scrollWheelZoom = true,
  attributionControl = true,
  zoomControl = true,
}: TourDetailsMapProps) => {
  const { t } = useTranslation();
  return (
    <Map
      dragging={dragging}
      doubleClickZoom={doubleClickZoom}
      scrollWheelZoom={scrollWheelZoom}
      attributionControl={attributionControl}
      zoomControl={zoomControl}
    >
      <FitViewToTour tour={tour} />
      <Title>{t("common:legends.tour-title")}</Title>
      <TourPerimeterView tour={tour} showTooltip={false} clickable={false} />
      <TourStepsView tour={tour} />
      <Legend>
        <div>
          <CircleIcon sx={{ color: "var(--pending-background-color)" }} />{" "}
          {t("common:legends.pending-programmation")}
        </div>
        <div>
          <CircleIcon sx={{ color: "var(--confirmed-background-color)" }} />{" "}
          {t("common:legends.confirmed-programmation")}
        </div>
        <div>
          <CircleOutlinedIcon sx={{ color: "var(--my-background-color)" }} />{" "}
          {t("common:legends.my-programmation")}
        </div>
      </Legend>
    </Map>
  );
};

export default TourDetailsMap;
