import { Project } from "@cooprog/core";
import TourPerimeterView from "./TourPerimeterView";

interface ProjectMapViewProps {
  project: Project;
}

const ProjectMapView = ({ project }: ProjectMapViewProps) => {
  return (
    <>
      {project.tours?.map((tour) => (
        <TourPerimeterView
          key={tour._id || tour.perimeter?.toString()}
          tour={tour}
        />
      ))}
    </>
  );
};

export default ProjectMapView;
