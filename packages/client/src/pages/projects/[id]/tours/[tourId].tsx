import AuthenticationGuard from "@/components/authentication/AuthenticationGuard";
import useUser from "@/components/authentication/useUser";
import AppLayout from "@/components/layout/AppLayout";
import Header from "@/components/layout/Header";
import BasePage from "@/components/layout/Page";
import TourEditDialog from "@/components/projects/TourEditDialog";
import GenreAvatar from "@/components/projects/GenreAvatar";
import MyProgrammationBlock, {
  ProgrammationSteps,
} from "@/components/projects/MyProgrammationBlock";
import ParticipantList from "@/components/projects/ParticipantList";
import Planning from "@/components/projects/Planning";
import ProjectShareDialog from "@/components/projects/ProjectShareDialog";
import useProject from "@/components/projects/useProject";
import useTour from "@/components/projects/useTour";
import Breadcrumbs from "@/components/UI/Breadcrumbs";
import Explanation from "@/components/UI/Explanation";
import { TopRightIllustration } from "@/components/UI/Illustrations";
import { ProgramStatuses, User, Location, Role, Project } from "@cooprog/core";
import { Tour } from "@cooprog/core";
import styled from "@emotion/styled";
import { Edit, QuestionAnswer } from "@mui/icons-material";
import ShareIcon from "@mui/icons-material/Share";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import StarIcon from "@mui/icons-material/Star";
import {
  Button,
  IconButton,
  Tabs,
  Tab,
  useMediaQuery,
  Box,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Typography,
  useTheme,
  FormHelperText,
} from "@mui/material";
import { GetServerSideProps } from "next";
import { i18n, useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import { useSnackbar } from "notistack";
import { useEffect, useMemo, useState } from "react";
import { dehydrate, QueryClient } from "react-query";
import useRights, { Actions } from "@/components/structures/useRights";
import TourTechnicalDetails from "@/components/projects/TourTechnicalDetails";
import PublicIcon from "@mui/icons-material/Public";
import Chat from "@/components/projects/chat/Chat";
import ArtisticTeamExplanation from "@/components/projects/ArtisticTeamExplanation";
import useDiscipline from "@/components/layout/useDiscipline";
import useGenres from "@/components/projects/useGenres";
import UserEditDialog from "@/components/authentication/UserEditDialog";
import LoadingPage from "@/components/UI/LoadingPage";
import CO2Block from "@/components/projects/CO2Block";
import leafIcon from "@/components/UI/icons/leaf.svg";
import Image from "next/image";
import Link from "next/link";
import BaseMarkdown from "@/components/UI/Markdown";
import ProjectEditDialog, {
  ProjectUpdate,
  validationSchema,
} from "@/components/projects/ProjectEditDialog";
import { TempFile } from "@/components/newProject/useNewProjectForm";
import { getRequiredFields } from "..";

const Map = dynamic(
  () => import("../../../../components/projects/maps/TourDetailsMap"),
  {
    ssr: false,
  }
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

const Markdown = styled(BaseMarkdown)`
  margin-top: 8px;
  font-size: 14px !important;
`;

const TitleContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  align-items: flex-start;
  margin-bottom: 16px;

  > div:first-of-type {
    display: flex;
    flex-direction: column;
    gap: 16px;
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

const Section = styled.section`
  position: relative;
  display: flex;
  flex-direction: column;
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

const ParticipantsTitle = styled.h4`
  margin-top: 24px;
  margin-bottom: 8px;
`;

const Left = styled.div`
  display: flex;
  padding: 16px;
  flex-direction: column;
  flex-shrink: 1;
  flex-grow: 1;

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

  width: 800px;

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

const SectionTitleContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  position: relative;
`;

const SectionTitle = styled.h4`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const SectionActions = styled.div`
  display: flex;
  position: sticky;
  top: 70px;
  gap: 8px;
  justify-content: flex-end;
  z-index: 10000;
  align-self: flex-end;
  padding: 1rem 0 0 1rem;
  margin-top: -2.5rem;

  @media (max-width: 700px) {
    top: 60px;
  }
`;

const ProjectTitle = styled(Link)`
  margin-right: 6px;
  font-size: 16px;
  p {
    display: inline;
  }
  p:first-of-type:not(:last-of-type):after {
    content: " ● ";
  }

  p:first-of-type {
    font-weight: bold;
  }

  p:last-of-type {
    font-weight: normal;
  }

  button {
    margin-left: 8px;
  }
`;

const Title = styled.div`
  margin-right: 6px;
  font-size: 24px;

  button {
    margin-left: 8px;
  }

  p:nth-of-type(2) {
    font-size: 14px;
    display: flex;
    align-items: center;
    align-content: center;

    svg {
      margin-right: 8px;
      position: relative;
      top: -2px;
      width: 14px;
    }
  }
`;

const TabsContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  border-radius: 8px;
  background-color: #fff;
`;

const TabContainer = styled.div`
  flex-grow: 1;
  min-height: 0;
  max-width: 800px;
  margin: 0;
`;

const TabLabelContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const DarkLeafIcon = styled(Image)`
  filter: brightness(0) opacity(0.6);

  .Mui-selected & {
    filter: brightness(0) saturate(100%) invert(27%) sepia(51%) saturate(2878%)
      hue-rotate(346deg) brightness(119%) contrast(119%) opacity(0.75);
  }
`;

const InformationContainer = styled.div``;

const LocationSelect = styled(Select)`
  max-width: 280px;
  .MuiSelect-select {
    display: flex;
    align-items: center;
    gap: 8px;
  }
`;

const LocationMenuItem = styled(MenuItem)`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 8px 16px;
  gap: 4px;
`;

const LocationLabel = styled.div`
  font-weight: 500;
  color: #123036;
  display: flex;
  align-items: center;
  gap: 4px;
`;

const LocationAddress = styled.div`
  font-size: 0.875rem;
  color: #666;
`;

const LocationBadge = styled.div`
  font-size: 0.75rem;
  color: #666;
  background-color: #f5f5f5;
  padding: 2px 6px;
  border-radius: 4px;
  margin-top: 2px;
`;

const TourDetails = () => {
  const { t, i18n } = useTranslation(namespaces);
  const { enqueueSnackbar } = useSnackbar();
  const router = useRouter();
  const { id, tourId } = router.query;
  const [tourEditDialogOpen, setTourEditDialogOpen] = useState<boolean>(false);
  const [userEditDialogOpen, setUserEditDialogOpen] = useState<boolean>(false);
  const {
    project,
    claim,
    edit: editProject,
    uploadFiles,
    deleteFiles,
  } = useProject(id as string);
  const {
    tour,
    edit,
    schedule,
    unschedule,
    editProgram,
    showInterest,
    removeInterest,
  } = useTour(id as string, tourId as string);
  const { user } = useUser();
  const { can } = useRights({ user, tour });
  const { setPageDiscipline } = useDiscipline();
  const [projectEditDialogOpen, setProjectEditDialogOpen] =
    useState<boolean>(false);
  const [isMissingRequiredFields, setIsMissingRequiredFields] =
    useState<boolean>(false);
  const requiredFields = useMemo(() => getRequiredFields(validationSchema), []);

  const theme = useTheme();
  const mobile = useMediaQuery(theme.breakpoints.down("sm"));
  const tablet = useMediaQuery(theme.breakpoints.down("md"));
  const [shareProjectDialogOpen, setShareProjectDialogOpen] =
    useState<boolean>(false);
  const [selectedTab, setSelectedTab] = useState(() => {
    // Initialize based on URL hash
    if (typeof window !== "undefined") {
      const hash = window.location.hash.replace("#", "");
      switch (hash) {
        case "map":
          return 0;
        case "chat":
          return 1;
        case "co2":
          return 2;
        default:
          return 1; // Default to chat tab
      }
    }
    return 1; // Default to chat tab for SSR
  });
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);

  useEffect(() => {
    if (mobile && selectedTab === 2) {
      setSelectedTab(0);
    }
  }, [mobile, selectedTab]);
  // Use the new hook for CO2 calculation - moved to top with other hooks

  useEffect(() => {
    setPageDiscipline(project?.discipline);
    return () => {
      setPageDiscipline(undefined);
    };
  }, [project]);

  useEffect(() => {
    if (user && tour?.schedule) {
      const userScheduledDates = tour.schedule.filter(
        (program) => program.user?._id === user._id
      );
      if (userScheduledDates.length > 0) {
        const mostRecentDate = userScheduledDates.sort(
          (a, b) =>
            new Date(b.updatedAt || new Date()).getTime() -
            new Date(a.updatedAt || new Date()).getTime()
        )[0];
        const correspondingUserLocation = user.locations?.find(
          (loc) =>
            loc.location.geolocation.coordinates[0] ===
              mostRecentDate?.location?.geolocation.coordinates[0] &&
            loc.location.geolocation.coordinates[1] ===
              mostRecentDate?.location?.geolocation.coordinates[1]
        );
        if (correspondingUserLocation?._id) {
          setSelectedLocation(correspondingUserLocation._id);
        }
      } else {
        const mainLocation = user.locations?.find((loc) => loc.isMain);
        if (mainLocation?._id) {
          setSelectedLocation(mainLocation._id);
        }
      }
    }
  }, [user, tour?.schedule]);

  const programmationStep = useMemo(() => {
    const programs =
      tour?.schedule?.filter((program) => program.user?._id === user?._id) ||
      [];

    if (
      programs.some(
        (program) => program.status === ProgramStatuses.SHOW_CONFIRMED
      )
    ) {
      return ProgrammationSteps.CONFIRMED;
    }

    if (
      programs.some(
        (program) => program.status === ProgramStatuses.SHOW_PENDING
      )
    ) {
      return ProgrammationSteps.OPTION;
    }

    if (can(Actions.TOUR_SCHEDULE)) {
      return ProgrammationSteps.INTERESTED;
    }
    return null;
  }, [can, tour?.schedule, user?._id]);

  const genres = useGenres();

  if (!project || !tour || !user) {
    return (
      <AuthenticationGuard>
        <LoadingPage />
      </AuthenticationGuard>
    );
  }

  const handleOpenTourEditDialog = () => {
    setTourEditDialogOpen(true);
  };

  const handleCloseTourEditDialog = () => {
    setTourEditDialogOpen(false);
  };

  const handleEditTour = async (update: Partial<Tour>) => {
    try {
      await edit(update);
      enqueueSnackbar(t("projects:tours.edit.success-as-owner"), {
        variant: "success",
      });
    } catch (error) {
      console.error("Error editing tour:", error);
      enqueueSnackbar(t("projects:tours.edit.error"), {
        variant: "error",
      });
    } finally {
      handleCloseTourEditDialog();
    }
  };

  const handleShareClicked = () => {
    setShareProjectDialogOpen(true);
  };

  const handleSelectedTabChange = (
    event: React.SyntheticEvent,
    newValue: number
  ) => {
    setSelectedTab(newValue);

    // Update URL hash to match selected tab
    const hashMap = {
      0: "map",
      1: "chat",
      2: "co2",
    };
    const newHash = hashMap[newValue as keyof typeof hashMap];
    if (newHash && typeof window !== "undefined") {
      window.location.hash = newHash;
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

  const handleOpenEditProject = () => {
    setProjectEditDialogOpen(true);
  };

  const handleEditProject = async (
    update: ProjectUpdate,
    newFiles: TempFile[],
    deletedFiles: string[]
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
      await editProject({
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

  const checkIfProjectIsMissingFields = (projectToCheck: Project) => {
    return requiredFields.some((field) => {
      const value = projectToCheck[field as keyof Project];
      return !value || (Array.isArray(value) && value.length === 0);
    });
  };

  const handleCloseEditProject = () => {
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
  const handleAddArtisticTeamAsDiffusionStructureClicked = async () => {
    handleOpenEditProject();
    setTimeout(() => {
      (document.querySelector("#artisticTeam") as HTMLElement)?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 100);
  };

  const isArtisticTeam = project.users.some(
    (projectUser) =>
      projectUser.role === Role.ARTISTIC_TEAM && projectUser._id === user?._id
  );

  const handleLocationChange = (event: any) => {
    setSelectedLocation(event.target.value);
  };

  return (
    <AuthenticationGuard>
      {projectEditDialogOpen && (
        <ProjectEditDialog
          open={projectEditDialogOpen}
          onValidate={handleEditProject}
          project={project}
          onClose={handleCloseEditProject}
          isMissingRequiredFields={isMissingRequiredFields}
        />
      )}
      <TourEditDialog
        open={tourEditDialogOpen}
        onValidate={handleEditTour}
        tour={tour}
        onClose={handleCloseTourEditDialog}
      />

      <ProjectShareDialog
        open={shareProjectDialogOpen}
        handleClose={() => setShareProjectDialogOpen(false)}
        projectId={project._id}
        tourId={tour._id}
      />

      <UserEditDialog
        open={userEditDialogOpen}
        onClose={() => setUserEditDialogOpen(false)}
        user={user}
        initialTab={1}
      />

      <AppLayout showContact={false}>
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
                  path: `/projects/${project._id}`,
                },
                {
                  name: t("common:breadcrumbs.tour", {
                    title: tour.name,
                  }),
                },
              ]}
            />
            <Header>
              <TopRightIllustration color="rgba(255, 245, 232, 0.71)" />
              <Content>
                {!mobile && !tablet && (
                  <GenreAvatar
                    value={project.genres || []}
                    genres={genres}
                    complementaryGenre={project.complementaryGenre}
                  />
                )}
                <InformationContainer>
                  <TitleContainer>
                    <div>
                      <ProjectTitle href={`/projects/${project._id}`}>
                        <p>{project.artist}</p>
                        {!!project.work && <p>{project.work}</p>}
                      </ProjectTitle>
                      <Title>
                        <p>
                          {tour.name}
                          {can(Actions.TOUR_EDIT_INFORMATION) && (
                            <IconButton
                              color="primary"
                              size="small"
                              onClick={() => handleOpenTourEditDialog()}
                              data-testid="edit-tour-button"
                            >
                              <Edit />
                            </IconButton>
                          )}
                        </p>
                      </Title>
                    </div>
                    {!mobile && (
                      <ActionsContainer>
                        {can(Actions.PROJECT_SHARE) && (
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
                        )}
                      </ActionsContainer>
                    )}
                  </TitleContainer>
                  <TourTechnicalDetails tour={tour} />

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
                  <ParticipantsTitle>
                    {t("projects:participants.title", {
                      count: tour.users.length,
                    })}
                  </ParticipantsTitle>
                  <ParticipantList
                    users={tour.users}
                    accessUserPage={can(Actions.PAGES_ACCESS_STRUCTURE)}
                    projectId={project._id}
                    tourId={tour._id}
                    sx={{ marginBottom: "24px" }}
                  />
                  {can(Actions.TOUR_SHOW_INTEREST) && (
                    <>
                      <Button
                        variant="contained"
                        color="primary"
                        sx={{ whiteSpace: "nowrap" }}
                        onClick={() => {
                          showInterest();
                        }}
                        fullWidth
                      >
                        {t("projects:tours.interested")}
                      </Button>
                      <Markdown>
                        {t("projects:tours.interested-helper-text")}
                      </Markdown>
                    </>
                  )}
                  {can(Actions.TOUR_VIEW_MY_PROGRAM) &&
                    programmationStep !== null && (
                      <MyProgrammationBlock
                        step={programmationStep}
                        removeInterest={removeInterest}
                      />
                    )}
                  {isArtisticTeam && !tour.archived && (
                    <ArtisticTeamExplanation />
                  )}
                </InformationContainer>
              </Content>
            </Header>
            {can(Actions.TOUR_SEE_PLANNING) && (
              <Section>
                <SectionTitle>
                  {t("projects:tours.planning.title")}
                </SectionTitle>
                {(can(Actions.TOUR_SCHEDULE) ||
                  can(Actions.TOUR_SCHEDULE_FOR_OTHERS)) &&
                  user?.locations &&
                  user.locations.length > 1 &&
                  !mobile && (
                    <SectionActions>
                      <FormControl size="small" sx={{ minWidth: 200 }}>
                        <InputLabel id="location-select-label">
                          {t("projects:tours.location")}
                        </InputLabel>
                        <LocationSelect
                          labelId="location-select-label"
                          value={selectedLocation || ""}
                          label={t("projects:tours.location")}
                          onChange={handleLocationChange}
                          renderValue={(value) => {
                            const location = user.locations.find(
                              (loc) => loc._id === value
                            );
                            return location?.label;
                          }}
                          startAdornment={
                            <LocationOnIcon
                              sx={{
                                color: "primary.main",
                                fontSize: "1.2rem",
                                marginRight: "4px",
                              }}
                            />
                          }
                        >
                          {user.locations.map((location) => (
                            <LocationMenuItem
                              key={location._id}
                              value={location._id}
                            >
                              <LocationLabel>
                                {location.label}
                                {location.isMain && (
                                  <StarIcon
                                    sx={{
                                      color: "#FFD700",
                                      fontSize: "1rem",
                                    }}
                                  />
                                )}
                              </LocationLabel>
                              <LocationAddress>
                                {location.location.address}
                              </LocationAddress>
                            </LocationMenuItem>
                          ))}
                        </LocationSelect>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{
                            mt: "4px",
                            textAlign: "right",
                            cursor: "pointer",
                            fontSize: "0.7rem",
                            fontStyle: "italic",
                            "&:hover": {
                              textDecoration: "underline",
                            },
                          }}
                          onClick={() => {
                            setUserEditDialogOpen(true);
                            const modal =
                              document.querySelector('[role="tabpanel"]');
                            if (modal) {
                              const tabs =
                                modal.querySelectorAll('[role="tab"]');
                              if (tabs[1]) {
                                (tabs[1] as HTMLElement).click();
                              }
                            }
                          }}
                        >
                          {t("projects:tours.handle-locations")}
                        </Typography>
                      </FormControl>
                    </SectionActions>
                  )}
                <Content>
                  <Planning
                    tour={tour}
                    onEditTour={handleOpenTourEditDialog}
                    schedule={(
                      date: Date,
                      status: ProgramStatuses,
                      otherUser?: Partial<User> | null,
                      location?: Location,
                      customMessage?: string
                    ) => {
                      schedule({
                        date,
                        status,
                        user: otherUser,
                        location:
                          location ||
                          user?.locations?.find(
                            (loc) => loc._id === selectedLocation
                          )?.location,
                        customMessage,
                      });
                    }}
                    unschedule={async (programId: string) => {
                      await unschedule({ id: programId });
                    }}
                    editProgram={(programId: string, params: Partial<Tour>) => {
                      editProgram({ programId, params });
                    }}
                    canBlock={can(Actions.TOUR_BLOCK)}
                    canWish={can(Actions.TOUR_ADD_WISH)}
                    canSchedule={can(Actions.TOUR_SCHEDULE)}
                    canEdit={can(Actions.TOUR_EDIT_DAYS)}
                    canScheduleForOthers={can(Actions.TOUR_SCHEDULE_FOR_OTHERS)}
                    canAddUnavailable={can(Actions.TOUR_ADD_UNAVAILABLE)}
                  />
                </Content>
              </Section>
            )}
            {tour.archived && (
              <Section>
                <CO2Block project={project} tour={tour} />
              </Section>
            )}
          </Left>
          <Right>
            {can(Actions.TOUR_VIEW_CHAT) && (
              <TabsContainer>
                <Box
                  sx={{
                    borderBottom: 1,
                    borderColor: "divider",
                    overflowX: "auto",
                    minHeight: "61px",
                  }}
                >
                  <Tabs
                    value={selectedTab}
                    onChange={handleSelectedTabChange}
                    sx={{
                      "& .MuiTabs-flexContainer": {
                        justifyContent: "space-evenly",
                      },
                      "& .MuiTab-root": {
                        flex: 1,
                        minWidth: 0,
                        maxWidth: "none",
                        overflow: "hidden",
                      },
                      "& .MuiTab-root .MuiTab-wrapper": {
                        width: "100%",
                        overflow: "hidden",
                      },
                    }}
                  >
                    <Tab
                      label={
                        <TabLabelContainer>
                          <PublicIcon />
                          {t("projects:tours.map.title")}
                        </TabLabelContainer>
                      }
                    />
                    <Tab
                      label={
                        <TabLabelContainer>
                          <QuestionAnswer />
                          {t("projects:tours.chat.title")}
                        </TabLabelContainer>
                      }
                    />
                    {!mobile && (
                      <Tab
                        label={
                          <TabLabelContainer>
                            <DarkLeafIcon
                              src={leafIcon}
                              alt="Eco"
                              width={20}
                              height={20}
                            />
                            {t("projects:tours.avoided-co2.title")}
                          </TabLabelContainer>
                        }
                      />
                    )}
                  </Tabs>
                </Box>
                {selectedTab === 0 && (
                  <TabContainer>
                    <Map
                      tour={tour}
                      dragging={!mobile}
                      doubleClickZoom={!mobile}
                      scrollWheelZoom={!mobile}
                      attributionControl={!mobile}
                      zoomControl={!mobile}
                    />
                  </TabContainer>
                )}
                {selectedTab === 1 && (
                  <TabContainer>
                    <Chat />
                  </TabContainer>
                )}
                {selectedTab === 2 && !mobile && (
                  <TabContainer
                    style={{
                      padding: "0 16px 16px 16px",
                      overflow: "auto",
                    }}
                  >
                    <CO2Block project={project} tour={tour} showTitle={false} />
                  </TabContainer>
                )}
              </TabsContainer>
            )}
            {!can(Actions.TOUR_VIEW_CHAT) && (
              <Map
                tour={tour}
                dragging={!mobile}
                doubleClickZoom={!mobile}
                scrollWheelZoom={!mobile}
                attributionControl={!mobile}
                zoomControl={!mobile}
              />
            )}
          </Right>
        </Page>
      </AppLayout>
    </AuthenticationGuard>
  );
};

export default TourDetails;
