import styled from "@emotion/styled";
import { useRouter } from "next/router";
import ProjectCard from "../projects/ProjectCard";
import useProjects from "../projects/useProjects";

const Container = styled.div``;

const GridContainer = styled.div`
  padding: 24px 0;

  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  padding: 16px 0;
  gap: 16px;
`;

const NewProjectsBlock = () => {
  const router = useRouter();
  const { projects } = useProjects({
    sort: "createdAt",
    limit: 4,
  });

  return (
    <Container>
      <GridContainer>
        {projects?.map((project) => (
          <ProjectCard
            key={project._id}
            project={project}
          />
        ))}
      </GridContainer>
    </Container>
  );
};

export default NewProjectsBlock;
