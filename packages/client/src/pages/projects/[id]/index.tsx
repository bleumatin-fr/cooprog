import AuthenticationGuard from "@/components/authentication/AuthenticationGuard";
import useUser from "@/components/authentication/useUser";
import AppLayout from "@/components/layout/AppLayout";
import Header from "@/components/layout/Header";
import BasePage from "@/components/layout/Page";
import AvoidedCO2 from "@/components/projects/AvoidedCO2";
import ProjectEditDialog, {
  ProjectUpdate,
  validationSchema,
} from "@/components/projects/ProjectEditDialog";
import GenreAvatar from "@/components/projects/GenreAvatar";
import GenreChips from "@/components/projects/GenreChips";
import ParticipantList from "@/components/projects/ParticipantList";
import ProjectShareDialog from "@/components/projects/ProjectShareDialog";
import Status from "@/components/projects/Status";
import TourCard from "@/components/projects/TourCard";
import useProject from "@/components/projects/useProject";
import Breadcrumbs from "@/components/UI/Breadcrumbs";
import Explanation from "@/components/UI/Explanation";
import { TopRightIllustration } from "@/components/UI/Illustrations";
import { Project, Role } from "@cooprog/core";
import styled from "@emotion/styled";
import { Edit, Star, StarOutline } from "@mui/icons-material";
import AddIcon from "@mui/icons-material/Add";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import SchoolIcon from "@mui/icons-material/School";
import { useEffect, useMemo } from "react";
import * as yup from "yup";
import StarIcon from "@mui/icons-material/Star";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import { TempFile } from "@/components/newProject/useNewProjectForm";
import TourCreateDialog from "@/components/projects/TourCreateDialog";
import TechnicalDetails from "@/components/projects/TechnicalDetails";
import useRights, { Actions } from "@/components/structures/useRights";
import ShareIcon from "@mui/icons-material/Share";
import {
  Button,
  IconButton,
  Tooltip,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import Linkify from "linkify-react";
import { GetServerSideProps } from "next";
import { i18n, useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import { useSnackbar } from "notistack";
import { useState } from "react";
import { dehydrate, QueryClient } from "react-query";
import Markdown from "@/components/UI/Markdown";
import useDiscipline from "@/components/layout/useDiscipline";
import useGenres from "@/components/projects/useGenres";
import useTargetAudiences from "@/components/projects/useTargetAudiences";
import EmptyState from "@/components/UI/EmptyStateIllustration";
import LoadingPage from "@/components/UI/LoadingPage";

const Map = dynamic(
  () => import("../../../components/projects/maps/ProjectDetailsMap"),
  {
    ssr: false,
  },
);

const namespaces = ["common", "projects", "users", "notifications"];

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { query, locale } = context;
  const queryClient = new QueryClient();

  if (process.env.NODE_ENV === "development") {
    await i18n?.reloadResources();
  }

  return {
    props: {
      dehydratedState: dehydrate(queryClient),
      ...(await serverSideTranslations(locale || "en", namespaces)),
    },
  };
};

export const getRequiredFields = (schema: yup.ObjectSchema<any>) => {
  const schemaDescription = schema.describe(); // Get schema details
  return Object.entries(schemaDescription.fields)
    .filter(
      ([_, fieldDesc]) =>
        "tests" in fieldDesc &&
        Array.isArray(fieldDesc.tests) &&
        fieldDesc.tests.some(
          (test) => test.name === "required" || test.name === "has-places",
        ),
    )
    .map(([field]) => field);
};

const ParticipantsTitle = styled.h4`
  margin-top: 24px;
  margin-bottom: 8px;
`;

const ParticipantsExplanation = styled.p`
  margin-top: 8px;
  margin-bottom: 24px;
  font-size: 14px;
  font-style: italic;
`;

const TitleContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  align-items: flex-start;

  > div:first-of-type {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
  }
`;

const ActionsContainer = styled.div`
  display: flex;
  gap: 8px;
  min-width: 160px;
  justify-content: flex-end;
  flex-wrap: wrap;
  flex-direction: column;
  align-items: stretch;
`;

const ActionContainer = styled.div`
  white-space: nowrap;
  display: flex;
  justify-content: stretch;
  align-items: center;

  > span:first-of-type {
    flex-grow: 1;

    > button {
      width: 100%;
    }
  }
`;

const Statuses = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 16px;
  > div {
    display: flex;
    gap: 8px;
  }
`;

const Section = styled.section`
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 32px;
  margin-top: 32px;
  background-color: #fff;
  border-radius: 8px;
  padding: 32px;

  h4 {
    color: #123036;
    font-variant: normal;
  }
`;

const Page = styled(BasePage)`
  flex-direction: row;
  &.mobile {
    flex-direction: column !important;
  }
`;

const Left = styled.div`
  display: flex;
  padding: 16px;
  flex-direction: column;
  flex-shrink: 1;
  flex-grow: 1;
  width: 815px;
  max-width: 1000px;

  .mobile & {
    min-width: 0;
    max-width: 100%;
  }
`;

const Right = styled.div`
  display: flex;
  position: sticky;
  height: calc(100vh - 64px - 16px - 16px);
  top: calc(64px + 16px);
  right: 0;
  flex-grow: 1;
  flex-shrink: 1;
  min-width: 400px;
  .mobile & {
    position: relative;
    top: 0;
    height: 400px;
    min-width: 0;
  }

  > div {
    flex-grow: 1;
  }
  border-radius: 8px;
  overflow: hidden;
  margin: 16px;
`;

const Content = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: stretch;
  flex-grow: 1;
  z-index: 2;
  flex-direction: row;

  > *:first-of-type {
    flex-grow: 0;
  }

  > *:not(:first-of-type) {
    flex-grow: 1;
  }
`;

const SectionTitle = styled.h4`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const SectionActions = styled.div`
  display: flex;
  gap: 8px;
  justify-content: flex-end;
  position: absolute;
  top: 0;
  right: 0;
  padding: 1rem;
  padding-top: 22px;
`;

const Title = styled.div`
  margin-right: 6px;
  font-size: 24px;
  p {
    display: inline;
  }
  p:first-of-type:not(:last-of-type):after {
    content: " ● ";
  }

  p:first-of-type {
    font-weight: bold;
  }

  p:last-of-type:not(:first-of-type) {
    font-weight: normal;
  }

  button {
    margin-left: 8px;
  }
`;

const InformationContainer = styled.div``;

const Description = styled.div`
  background-color: var(--color-light-blue);
  padding: 16px;
  margin: 16px 0;
  border-radius: 8px;
  color: var(--color-dark-blue);
  display: flex;
  gap: 8px;

  > svg {
    font-size: 32px;
    flex-grow: 0;
  }

  > * {
    flex-grow: 1;
  }

  a {
    max-width: 300px;
    overflow: hidden;
    text-overflow: ellipsis;
    display: inline-block;
    white-space: nowrap;
  }
`;

const GenreChipsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin: 16px 0;
`;

const StatusChipsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 16px;
  margin-bottom: 8px;
`;

const StatusChipsRow = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 16px;
  margin-bottom: 8px;
`;

const StatusChip = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  border-radius: 12px;
  // margin-top: 8px;
  font-size: 14px;
  background-color: rgba(0, 123, 255, 0.1);
  color: #007bff;

  svg {
    font-size: 16px;
  }

  &.emerging {
    background-color: rgba(255, 193, 7, 0.1);
    color: #ff9800;
  }

  &.cultural {
    background-color: rgba(76, 175, 80, 0.1);
    color: #4caf50;
  }
`;

const ToursContainer = styled.div`
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
`;

const ProjectDetails = () => {
  const { t } = useTranslation(namespaces);
  const { enqueueSnackbar } = useSnackbar();
  const router = useRouter();
  const { id } = router.query;
  const [projectEditDialogOpen, setProjectEditDialogOpen] =
    useState<boolean>(false);
  const [isMissingRequiredFields, setIsMissingRequiredFields] =
    useState<boolean>(false);
  const {
    project,
    favorite,
    edit,
    claim,
    uploadFiles,
    deleteFiles,
  } = useProject(id as string);
  const { user } = useUser();
  const { can } = useRights({ user, project });
  const theme = useTheme();
  const mobile = useMediaQuery(theme.breakpoints.down("sm"));
  const tablet = useMediaQuery(theme.breakpoints.down("md"));

  const [projectShareDialogOpen, setProjectShareDialogOpen] =
    useState<boolean>(false);
  const [tourCreateDialogOpen, setTourCreateDialogOpen] =
    useState<boolean>(false);
  const { setPageDiscipline } = useDiscipline();

  const genres = useGenres();
  const targetAudiences = useTargetAudiences();

  const requiredFields = useMemo(() => getRequiredFields(validationSchema), []);

  useEffect(() => {
    setPageDiscipline(project?.discipline);

    return () => {
      setPageDiscipline(null);
    };
  }, [project]);

  useEffect(() => {
    if (!project) return;

    const isMissingFields = requiredFields.some((field) => {
      const value = project[field as keyof Project];
      return !value || (Array.isArray(value) && value.length === 0);
    });

    const canEdit = can(Actions.PROJECT_EDIT);

    if (isMissingFields && canEdit) {
      setProjectEditDialogOpen(true);
      setIsMissingRequiredFields(true);
    }
  }, [project, requiredFields, can]);

  if (!project || !user) {
    return (
      <AuthenticationGuard>
        <LoadingPage />
      </AuthenticationGuard>
    );
  }

  const isFavorited = !!project.favoritedBy?.find(
    (u) => u._id?.toString() === user._id?.toString(),
  );
  const handleFavoriteClick = () => {
    favorite();
  };

  const handleAddTourClicked = () => {
    setTourCreateDialogOpen(true);
  };

  const handleOpenEdit = () => {
    setProjectEditDialogOpen(true);
  };

  const checkIfProjectIsMissingFields = (projectToCheck: Project) => {
    return requiredFields.some((field) => {
      const value = projectToCheck[field as keyof Project];
      return !value || (Array.isArray(value) && value.length === 0);
    });
  };

  const handleCloseEdit = () => {
    if (!project) return;

    if (checkIfProjectIsMissingFields(project)) {
      enqueueSnackbar(t("projects:edit.fill-required-fields"), {
        variant: "error",
      });
      router.back();
      return;
    }

    setProjectEditDialogOpen(false);
    setIsMissingRequiredFields(false);
  };

  const handleEditProject = async (
    update: ProjectUpdate,
    newFiles: TempFile[],
    deletedFiles: string[],
  ) => {
    if (
      checkIfProjectIsMissingFields({
        ...project,
        ...update,
        users: update.users?.map((user) => user.user) || [],
      })
    ) {
      enqueueSnackbar(t("projects:edit.fill-required-fields"), {
        variant: "error",
      });
      return;
    }

    try {
      await edit({
        ...update,
      });
      if (newFiles.length > 0) {
        setTimeout(async () => {
          await uploadFiles(newFiles);
        }, 0);
      }
      if (deletedFiles.length > 0) {
        setTimeout(async () => {
          await deleteFiles(deletedFiles);
        }, 0);
      }
      enqueueSnackbar(t("projects:edit.success-as-owner"), {
        variant: "success",
      });
    } catch (error) {
      console.error("Error editing project:", error);
      enqueueSnackbar(t("projects:edit.error"), {
        variant: "error",
      });
    } finally {
      setProjectEditDialogOpen(false);
    }
  };

  const handleAddArtisticTeamClicked = async () => {
    try {
      await claim();
    } catch (error) {
      console.error("Error claiming project:", error);
      enqueueSnackbar(t("projects:actions.claim-error"), {
        variant: "error",
      });
    }
    enqueueSnackbar(t("projects:actions.claim-success"), {
      variant: "success",
    });
  };

  const handleAddArtisticTeamAsDiffusionStructureClicked = async () => {
    handleOpenEdit();
    setTimeout(() => {
      (document.querySelector("#artisticTeam") as HTMLElement)?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 100);
  };

  const handleShareClicked = () => {
    setProjectShareDialogOpen(true);
  };

  const scrollToTours = () => {
    enqueueSnackbar(t("projects:tours.scroll-to-tours"), {
      variant: "info",
    });
    const toursSection = document.querySelector('[data-section="tours"]');
    if (toursSection) {
      toursSection.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <AuthenticationGuard>
      {projectEditDialogOpen && (
        <ProjectEditDialog
          open={projectEditDialogOpen}
          onValidate={handleEditProject}
          project={project}
          onClose={handleCloseEdit}
          isMissingRequiredFields={isMissingRequiredFields}
        />
      )}
      {tourCreateDialogOpen && (
        <TourCreateDialog
          open={tourCreateDialogOpen}
          onClose={() => setTourCreateDialogOpen(false)}
          projectId={project._id}
        />
      )}

      {projectShareDialogOpen && (
        <ProjectShareDialog
          open={projectShareDialogOpen}
          handleClose={() => setProjectShareDialogOpen(false)}
          projectId={project._id}
        />
      )}

      <AppLayout>
        <Page
          fullWidth
          className={
            "project-details selected" + (mobile || tablet ? " mobile" : "")
          }
        >
          <Left>
            <Breadcrumbs
              crumbs={[
                { name: t("common:breadcrumbs.projects"), path: "/projects" },
                {
                  name: t("common:breadcrumbs.project", {
                    title: !!project.work
                      ? `${project.artist} · ${project.work}`
                      : project.artist,
                  }),
                },
              ]}
            />
            <Header>
              <TopRightIllustration color="rgba(255, 245, 232, 0.71)" />
              <Content>
                {!mobile && (
                  <GenreAvatar
                    value={project.genres || []}
                    genres={genres.sort((a, b) => a.name.localeCompare(b.name))}
                    complementaryGenre={project.complementaryGenre}
                  />
                )}
                <InformationContainer>
                  <TitleContainer>
                    <div>
                      <Title>
                        <p>{project.artist}</p>
                        {!!project.work && <p>{project.work}</p>}
                        {can(Actions.PROJECT_EDIT) && (
                          <IconButton
                            color="primary"
                            size="small"
                            data-testid="edit-project-button"
                            onClick={() => handleOpenEdit()}
                          >
                            <Edit />
                          </IconButton>
                        )}
                      </Title>
                      <GenreChipsContainer>
                        <GenreChips
                          genreValue={project.genres || []}
                          targetAudienceValue={project.targetAudiences || []}
                          genres={genres.sort((a, b) =>
                            a.name.localeCompare(b.name),
                          )}
                          targetAudiences={targetAudiences}
                          complementaryGenre={project.complementaryGenre}
                          size="medium"
                        />
                        {project.emergingArtist && (
                          <StatusChip className="emerging">
                            <Star fontSize="small" />
                            {t("projects:status.emergingArtist")}
                          </StatusChip>
                        )}
                        {project.culturalActionInterest && (
                          <StatusChip className="cultural">
                            <SchoolIcon fontSize="small" />
                            {t("projects:status.culturalActionInterest")}
                          </StatusChip>
                        )}
                      </GenreChipsContainer>
                    </div>
                    {!mobile && (
                      <ActionsContainer>
                        <ActionContainer style={{ justifyContent: "flex-end" }}>
                          <Tooltip title={t("projects:actions.copy-link")}>
                            <IconButton
                              color="primary"
                              size="small"
                              onClick={() => {
                                navigator.clipboard.writeText(
                                  window.location.href,
                                );
                                enqueueSnackbar(
                                  t("projects:actions.copy-link-success"),
                                  {
                                    variant: "success",
                                  },
                                );
                              }}
                            >
                              <ContentCopyIcon />
                            </IconButton>
                          </Tooltip>
                        </ActionContainer>
                        {(can(Actions.PROJECT_FAVORITE) ||
                          can(Actions.PROJECT_SHARE)) && (
                          <>
                            {can(Actions.PROJECT_FAVORITE) && (
                              <ActionContainer>
                                <Button
                                  startIcon={
                                    isFavorited ? <Star /> : <StarOutline />
                                  }
                                  onClick={handleFavoriteClick}
                                  color="primary"
                                  size="small"
                                  variant="outlined"
                                >
                                  {t("projects:actions.favorite")}
                                </Button>
                                <Explanation
                                  title={t(
                                    "common:explanations.favorite.title",
                                  )}
                                >
                                  {t(
                                    "common:explanations.favorite.explanation",
                                  )}
                                </Explanation>
                              </ActionContainer>
                            )}
                            {can(Actions.PROJECT_SHARE) && (
                              <>
                                <ActionContainer>
                                  <Button
                                    startIcon={<ShareIcon />}
                                    onClick={handleShareClicked}
                                    color="primary"
                                    size="small"
                                    variant="outlined"
                                  >
                                    {t("projects:actions.share")}
                                  </Button>
                                  <Explanation
                                    title={t("common:explanations.share.title")}
                                  >
                                    {t("common:explanations.share.explanation")}
                                  </Explanation>
                                </ActionContainer>
                              </>
                            )}
                          </>
                        )}
                      </ActionsContainer>
                    )}
                  </TitleContainer>

                  {project.description && (
                    <Description>
                      <DescriptionOutlinedIcon />
                      <Linkify
                        as="p"
                        options={{ target: "_blank", nl2br: true }}
                      >
                        {project.description}
                      </Linkify>
                    </Description>
                  )}

                  <TechnicalDetails project={project} />

                  {project.users.filter((u) => !!u).length > 0 && (
                    <>
                      <ParticipantsTitle>
                        {t("projects:coordinators.title", {
                          count: project.users.filter((u) => !!u).length,
                        })}
                      </ParticipantsTitle>

                      <ParticipantList
                        users={project.users.filter((u) => !!u)}
                        translationKey="coordinators"
                        accessUserPage={can(Actions.PAGES_ACCESS_STRUCTURE)}
                        projectId={project._id}
                      />
                    </>
                  )}

                  {project.users.filter((u) => !!u).length === 0 &&
                    user.role === Role.DIFFUSION_STRUCTURE &&
                    can(Actions.PROJECT_EDIT) && (
                      <Button
                        startIcon={<StarIcon />}
                        onClick={
                          handleAddArtisticTeamAsDiffusionStructureClicked
                        }
                        color="primary"
                        variant="contained"
                      >
                        {t("projects:actions.invite-artistic-team")}
                      </Button>
                    )}

                  {can(Actions.PROJECT_CLAIM) && (
                    <Button
                      startIcon={<StarIcon />}
                      onClick={handleAddArtisticTeamClicked}
                      color="primary"
                      variant="contained"
                    >
                      {t("projects:actions.claim")}
                    </Button>
                  )}

                  <Statuses>
                    <div>
                      <AvoidedCO2 project={project} onClick={scrollToTours} />
                    </div>
                    <div>
                      <Status
                        project={project}
                        type="favorited"
                        checked={isFavorited}
                        hideIfZero
                      />
                    </div>
                  </Statuses>
                </InformationContainer>
              </Content>
            </Header>
            {(can(Actions.TOUR_CREATE) ||
              !project.tours ||
              project.tours.length === 0) && (
              <>
                <Section data-section="tours">
                  {can(Actions.TOUR_CREATE) && (
                    <SectionActions>
                      <Button
                        startIcon={<AddIcon />}
                        onClick={handleAddTourClicked}
                        color="secondary"
                        size="small"
                        variant="outlined"
                      >
                        {t("projects:actions.create-tour")}
                      </Button>
                    </SectionActions>
                  )}
                  <SectionTitle>{t("projects:tours.title")}</SectionTitle>
                  {!project.tours || project.tours.length === 0 ? (
                    <>
                      {user.role === Role.ARTISTIC_TEAM && (
                        <EmptyState
                          title={t("projects:tours.empty-title")}
                          description={t(
                            `projects:tours.empty-description-artistic-team`,
                          )}
                        />
                      )}
                      {user.role !== Role.ARTISTIC_TEAM && (
                        <EmptyState
                          title={t("projects:tours.empty-title")}
                          description={t(`projects:tours.empty-description`)}
                        />
                      )}
                    </>
                  ) : (
                    <>
                      {can(Actions.TOUR_CREATE) && (
                        <Markdown
                          style={{
                            fontStyle: "italic",
                          }}
                        >
                          {t("projects:tours.description")}
                        </Markdown>
                      )}
                      <ToursContainer>
                        {project.tours &&
                          project.tours
                            .filter((tour) => !tour.archived)
                            .sort(
                              (a, b) =>
                                new Date(a.start!).getTime() -
                                new Date(b.start!).getTime(),
                            )
                            .map((tour) => (
                              <TourCard
                                key={tour._id}
                                project={project}
                                tour={tour}
                                accessUserPage={can(
                                  Actions.PAGES_ACCESS_STRUCTURE,
                                )}
                              />
                            ))}
                      </ToursContainer>
                    </>
                  )}
                </Section>
              </>
            )}
            {/* Archived tours block in its own Section */}
            {project.tours && project.tours.some((tour) => tour.archived) && (
              <Section>
                <SectionTitle>
                  {t("projects:tours.archived-title")}
                </SectionTitle>
                <Markdown style={{ fontStyle: "italic", marginBottom: 16 }}>
                  {t("projects:tours.archived-description")}
                </Markdown>
                <ToursContainer>
                  {project.tours
                    .filter((tour) => tour.archived)
                    .sort(
                      (a, b) =>
                        new Date(a.start!).getTime() -
                        new Date(b.start!).getTime(),
                    )
                    .map((tour) => (
                      <div
                        key={tour._id}
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "flex-start",
                          minWidth: 300,
                        }}
                      >
                        <TourCard
                          project={project}
                          tour={tour}
                          accessUserPage={can(Actions.PAGES_ACCESS_STRUCTURE)}
                        />
                      </div>
                    ))}
                </ToursContainer>
              </Section>
            )}
          </Left>
          <Right>
            <Map
              project={project}
              dragging={!mobile}
              doubleClickZoom={!mobile}
              scrollWheelZoom={!mobile}
              attributionControl={!mobile}
              zoomControl={!mobile}
            />
          </Right>
        </Page>
      </AppLayout>
    </AuthenticationGuard>
  );
};

export default ProjectDetails;
