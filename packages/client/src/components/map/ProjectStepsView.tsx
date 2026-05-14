import { Project } from "@cooprog/core";
import TourStepsView from "./TourStepsView";

interface ProjectStepsViewProps {
  project: Project;
}

const ProjectStepsView = ({ project }: ProjectStepsViewProps) => {
  return (
    <>
      {project.tours?.map((tour) => (
        <TourStepsView
          key={tour._id || tour.perimeter?.toString()}
          tour={tour}
        />
      ))}
    </>
  );
};

export default ProjectStepsView;
