import styled from "@emotion/styled";
import { Typography, Button } from "@mui/material";
import { useTranslation } from "next-i18next";
import Image from "next/image";
import EmptyProjectsIllustration from "./EmptyProjectsIllustration.svg";
import { useRouter } from "next/router";
import AddLocationAltIcon from "@mui/icons-material/AddLocationAlt";
import SearchIcon from "@mui/icons-material/Search";
import useUser from "../authentication/useUser";
import useRights, { Actions } from "../structures/useRights";
import BaseMarkdown from "../UI/Markdown";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 48px 32px;
  border-bottom-left-radius: 24px;
  border-bottom-right-radius: 24px;
  background-color: #fff;
  text-align: center;
  margin: 0 auto;
  width: 100%;
`;

const IllustrationContainer = styled.div`
  margin: 0 0 32px;
  position: relative;
  width: 240px;
  height: 240px;
  opacity: 0.9;
`;

const ContentContainer = styled.div`
  margin: 24px 0 32px;
  max-width: 480px;
`;

const ButtonContainer = styled.div`
  display: flex;
  flex-direction: column;
  margin-top: 32px;

  > div {
    display: flex;\
    flex-direction: column;
    align-items: center;
    gap: 16px;
  }
`;

const Markdown = styled(BaseMarkdown)`
  font-weight: 400;
  font-size: 1rem;
  line-height: 1.5;
  letter-spacing: 0.00938em;
  margin-bottom: 16px;
  color: var(--mui-palette-text-secondary);
  text-align: center;
`;

const ExplanationMarkdown = styled(Markdown)`
  margin-top: 8px;
`;

const EmptyDashboard = () => {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const { user } = useUser();
  const { can } = useRights({ user });

  const canCreateProject = can(Actions.PROJECT_CREATE);
  const canBrowseProjects = can(Actions.PAGES_ACCESS_PROJECTS);
  return (
    <Container>
      <IllustrationContainer>
        <Image
          src={EmptyProjectsIllustration}
          alt={t("home:empty_dashboard.title")}
          width={240}
          height={240}
          priority
        />
      </IllustrationContainer>

      <Typography variant="h4" gutterBottom fontWeight="600" color="primary">
        {t(`home:empty_dashboard.${user?.role.toLowerCase()}.title`)}
      </Typography>

      {(canBrowseProjects || canCreateProject) && (
        <ButtonContainer>
          <div>
            {canBrowseProjects && (
              <Button
                variant="contained"
                color="primary"
                size="large"
                startIcon={<SearchIcon />}
                onClick={() => router.push("/projects")}
              >
                {t(
                  `home:empty_dashboard.${user?.role.toLowerCase()}.browse_projects`,
                )}
              </Button>
            )}
            {canCreateProject && (
              <Button
                variant="outlined"
                color="primary"
                size="large"
                startIcon={<AddLocationAltIcon />}
                onClick={() => router.push("/projects/new")}
              >
                {t(
                  `home:empty_dashboard.${user?.role.toLowerCase()}.create_project`,
                )}
              </Button>
            )}
          </div>
          {canCreateProject &&
            i18n.exists(
              `home:empty_dashboard.${user?.role.toLowerCase()}.create_project_explanation`,
            ) && (
              <ExplanationMarkdown>
                {t(
                  `home:empty_dashboard.${user?.role.toLowerCase()}.create_project_explanation`,
                )}
              </ExplanationMarkdown>
            )}
        </ButtonContainer>
      )}
      <ContentContainer>
        <Markdown>
          {t(`home:empty_dashboard.${user?.role.toLowerCase()}.description`)}
        </Markdown>
      </ContentContainer>
    </Container>
  );
};

export default EmptyDashboard;
