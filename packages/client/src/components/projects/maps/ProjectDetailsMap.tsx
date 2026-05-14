import "leaflet/dist/leaflet.css";
import { useTranslation } from "next-i18next";
import { Project } from "@cooprog/core";
import Map from "@/components/map/Map";
import TourMapView from "@/components/map/TourPerimeterView";
import FitViewToProject from "@/components/map/FitViewToProject";
import TourStepsView from "@/components/map/TourStepsView";
import Title from "@/components/map/Title";
import Legend from "@/components/map/Legend";
import CircleIcon from "@mui/icons-material/Circle";
import CircleOutlinedIcon from "@mui/icons-material/CircleOutlined";

type ProjectMapProps = {
  project: Project;
  dragging?: boolean;
  doubleClickZoom?: boolean;
  scrollWheelZoom?: boolean;
  attributionControl?: boolean;
  zoomControl?: boolean;
};

const ProjectDetailsMap = ({
  project,
  dragging = true,
  doubleClickZoom = true,
  scrollWheelZoom = true,
  attributionControl = true,
  zoomControl = true,
}: ProjectMapProps) => {
  const { t, i18n } = useTranslation("projects");

  if (!project) {
    return null;
  }

  return (
    <Map
      key={`map-${project._id}`}
      dragging={dragging}
      doubleClickZoom={doubleClickZoom}
      scrollWheelZoom={scrollWheelZoom}
      attributionControl={attributionControl}
      zoomControl={zoomControl}
    >
      <FitViewToProject project={project} />
      <Title>{t("common:legends.project-title")}</Title>
      {project.tours?.map((tour, index) => (
        <div key={`tour-${tour._id}`}>
          <TourStepsView key={`steps-${tour._id}`} tour={tour} />
          <TourMapView key={`map-${tour._id}`} tour={tour} />
        </div>
      ))}
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

export default ProjectDetailsMap;
