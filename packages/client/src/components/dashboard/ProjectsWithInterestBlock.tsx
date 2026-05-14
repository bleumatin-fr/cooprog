import Block from "../layout/Block";
import useUser from "../authentication/useUser";
import ProjectCard from "../projects/ProjectCard";
import TitleWithIcon from "../UI/TitleWithIcon";
import StarBorderOutlinedIcon from "@mui/icons-material/StarBorderOutlined";
import { useTranslation } from "next-i18next";
import styled from "@emotion/styled";
import { Project } from "@cooprog/core";

const GridContainer = styled.div`
  padding: 24px 0;

  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  padding: 16px 0;
  gap: 16px;
`;

const ProjectsWithInterestBlock = ({
  projects,
  style,
}: {
  projects: Project[];
  style?: React.CSSProperties;
}) => {
  const { t } = useTranslation();
  const { user } = useUser();

  return (
    <Block style={style}>
      <TitleWithIcon
        title={t("home:venue_dashboard.project_with_interest.title")}
        icon={StarBorderOutlinedIcon}
      />
      <GridContainer>
        {projects.map((project) => (
          <ProjectCard key={project._id} project={project} />
        ))}
      </GridContainer>
    </Block>
  );
};

export default ProjectsWithInterestBlock;
