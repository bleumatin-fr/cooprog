import AuthenticationGuard from "@/components/authentication/AuthenticationGuard";
import DisableIfSpectator from "@/components/authentication/DisableIfSpectator";
import useUser from "@/components/authentication/useUser";
import useUsers from "@/components/authentication/useUsers";
import AppLayout from "@/components/layout/AppLayout";
import BaseBlock from "@/components/layout/Block";
import BasePage from "@/components/layout/Page";
import ProjectCard, { TitleContainer } from "@/components/projects/ProjectCard";
import useProjects from "@/components/projects/useProjects";
import UserAvatar from "@/components/structures/UserAvatar";
import useRights, { Actions } from "@/components/structures/useRights";
import Breadcrumbs from "@/components/UI/Breadcrumbs";
import { Discipline, Project, Role, StructureType } from "@cooprog/core";
import styled from "@emotion/styled";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import DirectionsWalkIcon from "@mui/icons-material/DirectionsWalk";
import EditIcon from "@mui/icons-material/Edit";
import FestivalIcon from "@mui/icons-material/Festival";
import HomeIcon from "@mui/icons-material/Home";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import MusicNoteIcon from "@mui/icons-material/MusicNote";
import TheaterComedyIcon from "@mui/icons-material/TheaterComedy";
import {
  Button,
  IconButton,
  Chip as MuiChip,
  Tooltip,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { GetServerSideProps } from "next";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import { useSnackbar } from "notistack";
import React, { useEffect, useMemo } from "react";
import { dehydrate, QueryClient } from "react-query";
import { getRoleURL } from "./role/[role]";
import { ProfileAvatar } from "@/components/authentication/ProfileSelectDialog";
import useDiscipline from "@/components/layout/useDiscipline";
import useGenres from "@/components/projects/useGenres";
import { useLocalStorage } from "usehooks-ts";
import LoadingPage from "@/components/UI/LoadingPage";
import { i18n } from "next-i18next";

const Map = dynamic(
  () => import("../../components/structures/UserDetailsMap"),
  {
    ssr: false,
  }
);

const namespaces = [
  "common",
  "authentication",
  "users",
  "projects",
  "notifications",
];
/**
 * This enables server side rendering for the page
 * @param context Next.js context
 * @returns Props for the page
 */
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

const Block = styled(BaseBlock)`
  display: flex;
  position: relative;
  padding: 42px;
  flex-direction: row;

  > div:first-of-type {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .mobile & {
    flex-direction: column;
  }

  > div:nth-of-type(2) {
    padding: 2rem 1rem 0 1rem;
  }
`;

const Page = styled(BasePage)`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 16px;
`;

const ProjectsContainer = styled.div`
  width: 100%;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
`;

const Projects = ({ projects }: { projects: Project[] }) => {
  const { t } = useTranslation(namespaces);
  return (
    <ProjectsContainer>
      {projects.length === 0 && <p>{t("users:no-projects")}</p>}
      {projects.length > 0 &&
        projects.map((project) => (
          <ProjectCard key={project._id} project={project} selected={false} />
        ))}
    </ProjectsContainer>
  );
};

const Header = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  gap: 16px;

  > :first-of-type {
    flex-grow: 1;
    max-width: 700px;
    :not(.mobile) & {
      min-width: 500px;
    }
  }
`;

const MapContainer = styled.div`
  min-width: 300px;
  flex-grow: 1;
  height: 300px;
  border-radius: 5px;
  overflow: hidden;

  .leaflet-div-icon {
    background: none;
    border: none;
  }
`;

const Left = styled.div`
  border-right: 1px solid #769bde;
  padding-right: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  justify-content: center;
  align-items: center;
  width: 50%;

  .mobile & {
    border-right: none;
    border-bottom: 1px solid #769bde;
    padding-right: 0;
    padding-bottom: 24px;
  }
`;

const Right = styled.div`
  padding-left: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  justify-content: center;

  .mobile & {
    padding-left: 0;
    padding-top: 24px;
  }
`;

const ChipsContainer = styled.div`
  display: flex;
  flex-direction: row;
  gap: 8px;
`;

const Chip = styled.div`
  background: #f5f7fa;
  border-radius: 12px;
  padding: 4px 8px;
  font-size: 12px;
  color: #123036;
`;

const ProgrammingInfoContainer = styled.div`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 8px;
`;

const GenresChipsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 8px;
`;

const GenresChip = styled.div`
  background: #f5f7fa;
  border-radius: 12px;
  padding: 4px 8px;
  font-size: 12px;
  color: #123036;
`;

const Title = styled.h2`
  padding: 16px 0;
  font-size: 16px;

  > span {
    margin-left: 8px;
    color: #829661;
  }
`;

const RoleContainer = styled.p`
  font-size: 14px;
  text-align: center;
  font-style: italic;
`;

const Field = styled.div`
  margin-bottom: 16px;
`;

const Label = styled.div`
  font-size: 16px;
  color: var(--color-text-gray);
  margin-bottom: 8px;
`;

const LocationsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 16px;
  color: var(--color-black);
  margin-top: 12px;
  svg {
    font-size: 14px;
  }
`;

const LocationHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  color: var(--color-text-gray);
  font-size: 14px;
`;

const LocationAddress = styled.div`
  padding-left: 18px;
  font-weight: 500;
  font-size: 16px;
`;

const DistanceContainer = styled.span`
  display: inline;
  white-space: nowrap;
  font-size: 16px;
  color: var(--color-black);
`;

const ProfileRole = styled.span`
  font-size: 0.9em;
  color: var(--color-gray);
  font-style: italic;
`;

const CompanyContainer = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  font-size: 16px;
  color: var(--color-black);
  margin-top: 24px;
  width: 100%;
  svg {
    font-size: 14px;
    flex-shrink: 0;
  }

  &:nth-of-type(2) {
    margin-top: 8px;
  }
`;

const UserPage = () => {
  const router = useRouter();
  const { t } = useTranslation(namespaces);
  const theme = useTheme();
  const mobile = useMediaQuery(theme.breakpoints.down("md"));
  const { id } = router.query;
  const { setSelectedProfileId } = useUser();
  const { users, followUser } = useUsers({ _id: id as string });
  const { enqueueSnackbar } = useSnackbar();
  const { user: me } = useUser();
  const { can } = useRights({ user: me });
  const user = users?.[0];

  const { projects } = useProjects({
    userId: id,
  });

  const { activeProjects, inactiveProjects } = useMemo(() => {
    let active: Project[] = [];
    let inactive: Project[] = [];

    if (user?.role === Role.ARTISTIC_TEAM) {
      // at least one tour is not archived
      active =
        projects?.filter((project) =>
          project.tours?.some((tour) => !tour.archived)
        ) || [];
      // all tours are archived
      inactive =
        projects?.filter((project) =>
          project.tours?.every((tour) => tour.archived)
        ) || [];
    } else if (user?.role === Role.DIFFUSION_STRUCTURE) {
      // at least one tour, where the user is in is not archived
      active =
        projects?.filter((project) => {
          return project.tours?.some((tour) => {
            return tour.users.some(
              (user) => user._id === user?._id && !tour.archived
            );
          });
        }) || [];
      // all tours, where the user is in are archived
      inactive =
        projects?.filter((project) => {
          return project.tours?.every((tour) =>
            tour.users.some((user) => user._id === user?._id && tour.archived)
          );
        }) || [];
    }

    return { activeProjects: active, inactiveProjects: inactive };
  }, [projects, user?.role, user?._id]);

  const { setPageDiscipline } = useDiscipline();
  const genres = useGenres();
  const [pageSelectedTab, setPageSelectedTab] = useLocalStorage<number | null>(
    "page-selected-tab",
    null
  );

  useEffect(() => {
    if (!user) {
      return;
    }
    if (user.programmingDisciplines) {
      if (user.programmingDisciplines.length === 1) {
        setPageDiscipline(user.programmingDisciplines[0]);
      } else {
        setPageDiscipline(undefined);
      }
    }
    if (user.role === Role.DIFFUSION_STRUCTURE) {
      setPageSelectedTab(2);
    }
    if (user.role === Role.ARTISTIC_TEAM) {
      setPageSelectedTab(3);
    }
    return () => {
      setPageDiscipline(undefined);
      setPageSelectedTab(null);
    };
  }, [user, setPageDiscipline]);

  if (!user || !me) {
    return (
      <Page mainClass="oo-background">
        <LoadingPage />
      </Page>
    );
  }

  if (
    user.role === Role.DIFFUSION_STRUCTURE &&
    !can(Actions.PAGES_ACCESS_STRUCTURE)
  ) {
    router.replace("/404");
    return null;
  }

  // DISABLED: Follow user functionality
  // /**
  //  * Handles the follow/unfollow user action
  //  * This function toggles the follow state for the current user
  //  */
  // const handleFollowUser = async () => {
  //   try {
  //     // Check if the current user is already following this user
  //     const isFollowed = !!me.following?.find((u) => u._id === user._id);

  //     // Call the followUser function (this will toggle the follow state)
  //     await followUser(user);

  //     // Show success message based on the previous state
  //     enqueueSnackbar(
  //       t(`users:${isFollowed ? "unfollow" : "follow"}.success`),
  //       {
  //         variant: "success",
  //       }
  //     );
  //   } catch (error) {
  //     // Show error message if follow request fails (e.g., already requested)
  //     enqueueSnackbar(t("users:follow.errors.already-requested"), {
  //       variant: "error",
  //     });
  //   }
  // };

  const handleCopyToClipboard =
    (value?: string) => (event: React.MouseEvent) => {
      event.stopPropagation();

      if (value) {
        navigator.clipboard.writeText(value);
        enqueueSnackbar(t("users:actions.copy-success"), {
          variant: "success",
        });
      }
    };

  // DISABLED: Check if the current user is already following this user (used for button state)
  // const isFollowed = !!me.following?.find((u) => u._id === user._id);

  const handleEditProfile = () => {
    setSelectedProfileId(undefined);
  };

  // Fonction pour obtenir l'icône du type de structure
  const getStructureTypeIcon = (type: StructureType) => {
    switch (type) {
      case StructureType.VENUE:
        return <HomeIcon fontSize="small" />;
      case StructureType.FESTIVAL:
        return <FestivalIcon fontSize="small" />;
      case StructureType.ITINERANT:
        return <DirectionsWalkIcon fontSize="small" />;
      default:
        return <HomeIcon fontSize="small" />;
    }
  };

  // Fonction pour obtenir le libellé du type de structure
  const getStructureTypeLabel = (type: StructureType) => {
    switch (type) {
      case StructureType.VENUE:
        return t("users:structureTypes.venue");
      case StructureType.FESTIVAL:
        return t("users:structureTypes.festival");
      case StructureType.ITINERANT:
        return t("users:structureTypes.itinerant");
      default:
        return type;
    }
  };

  // Fonction pour obtenir le libellé des disciplines
  const getDisciplineLabel = (discipline: Discipline) => {
    switch (discipline) {
      case Discipline.MUSIC:
        return t("users:disciplines.music");
      case Discipline.PERFORMING_ARTS:
        return t("users:disciplines.performingArts");
      default:
        return discipline;
    }
  };

  // Fonction pour obtenir l'icône des disciplines
  const getDisciplineIcon = (discipline: Discipline) => {
    switch (discipline) {
      case Discipline.MUSIC:
        return <MusicNoteIcon fontSize="small" />;
      case Discipline.PERFORMING_ARTS:
        return <TheaterComedyIcon fontSize="small" />;
      default:
        return <MusicNoteIcon fontSize="small" />;
    }
  };

  // Helper to get main location from locations array
  const getMainLocation = (userObj: typeof user) =>
    userObj.locations?.find((loc) => loc.isMain);

  // Helper to get city from location object
  const getCityFromLocation = (locationObj: any) => {
    if (!locationObj) return "";
    if (locationObj.data?.city) return locationObj.data.city;
    if (locationObj.data?.town) return locationObj.data.town;
    if (locationObj.data?.village) return locationObj.data.village;
    if (locationObj.data?.municipality) return locationObj.data.municipality;
    return locationObj.address || "";
  };

  const displayableLocations = user.locations?.filter(
    (location) => location.label
  );

  const mainLocation = displayableLocations?.find(
    (location) => location.isMain
  );

  const displayableProfiles = user.profiles?.filter((profile) =>
    [profile.firstName, profile.lastName].some(Boolean)
  );

  return (
    <AuthenticationGuard>
      <AppLayout>
        <Page mainClass="oo-background" className="user-details">
          <Breadcrumbs
            crumbs={[
              {
                name: t(`common:breadcrumbs.users.${user.role}`),
                path: getRoleURL(user.role) || "",
              },
              {
                name: t("common:breadcrumbs.user", {
                  name: user.company,
                }),
              },
            ]}
          />
          <Header>
            <Block style={{ alignItems: "center" }}>
              {/* DISABLED: Follow button - only show for other users who are not artistic team members */}
              {/* {user._id !== me._id && user.role !== Role.ARTISTIC_TEAM && (
                <div style={{ position: "absolute", top: 16, right: 16 }}>
                  <DisableIfSpectator>
                    {(disabled) => (
                      <Button
                        variant="outlined"
                        onClick={handleFollowUser}
                        startIcon={isFollowed ? <Star /> : <StarBorder />}
                        color={isFollowed ? "secondary" : "primary"}
                        disabled={user._id === me._id || isFollowed || disabled}
                      >
                        {isFollowed
                          ? t("users:followed")
                          : t("users:actions.follow")}
                      </Button>
                    )}
                  </DisableIfSpectator>
                  <Explanation title={t("common:explanations.follow.title")}>
                    {t("common:explanations.follow.explanation")}
                  </Explanation>
                </div>
              )} */}
              {user._id === me._id && (
                <div style={{ position: "absolute", top: 16, right: 16 }}>
                  <DisableIfSpectator>
                    {(disabled) => (
                      <Button
                        variant="outlined"
                        onClick={handleEditProfile}
                        startIcon={<EditIcon />}
                        color={"primary"}
                        disabled={disabled}
                      >
                        {t("users:actions.edit-profile")}
                      </Button>
                    )}
                  </DisableIfSpectator>
                </div>
              )}
              <Left>
                <UserAvatar
                  user={user}
                  size="large"
                  showTooltip={false}
                  showLink={false}
                />
                <TitleContainer style={{ fontSize: 20, textAlign: "center" }}>
                  {user.company}
                </TitleContainer>

                <RoleContainer>{t(`common:${user.role}_name`)}</RoleContainer>

                {!!user.programmingDisciplines &&
                  user.programmingDisciplines.length > 0 && (
                    <div
                      style={{
                        display: "flex",
                        gap: "8px",
                        justifyContent: "center",
                        flexWrap: "wrap",
                      }}
                    >
                      {user.programmingDisciplines.map((discipline) => {
                        const disciplineStyle =
                          {
                            [Discipline.PERFORMING_ARTS]: {
                              backgroundColor: "#FF8A47",
                              color: "#FFFFFF",
                            },
                            [Discipline.MUSIC]: {
                              backgroundColor: "#6BAF48",
                              color: "#FFFFFF",
                            },
                          }[discipline as Discipline] || {};

                        return (
                          <MuiChip
                            key={discipline}
                            icon={getDisciplineIcon(discipline as Discipline)}
                            label={getDisciplineLabel(discipline as Discipline)}
                            style={disciplineStyle}
                            size="small"
                          />
                        );
                      })}
                    </div>
                  )}
              </Left>
              <Right style={{ paddingTop: "16px", gap: "8px" }}>
                {displayableLocations && displayableLocations.length > 0 && (
                  <Field style={{ marginTop: "8px", marginBottom: "8px" }}>
                    <Label>{t("users:location")}</Label>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 4,
                      }}
                    >
                      {user.locations.length === 1 ? (
                        <LocationsContainer>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 8,
                            }}
                          >
                            <LocationOnOutlinedIcon
                              sx={{
                                color: user.locations[0].isMain
                                  ? "#FFD700"
                                  : "inherit",
                              }}
                            />
                            <span style={{ fontWeight: 500, fontSize: 16 }}>
                              {getCityFromLocation(user.locations[0].location)}
                            </span>
                          </div>
                        </LocationsContainer>
                      ) : (
                        user.locations.map((loc) => (
                          <LocationsContainer key={loc._id}>
                            <LocationHeader>
                              <LocationOnOutlinedIcon
                                sx={{
                                  color: loc.isMain ? "#FFD700" : "inherit",
                                }}
                              />
                              <span>{loc.label}</span>
                            </LocationHeader>
                            <LocationAddress>
                              {getCityFromLocation(loc.location)}
                            </LocationAddress>
                          </LocationsContainer>
                        ))
                      )}
                    </div>
                  </Field>
                )}

                {user.programmingPeriods && (
                  <Field style={{ marginBottom: "8px" }}>
                    <Label>{t("users:programmingPeriods")}</Label>
                    <div
                      style={{
                        fontSize: "15px",
                        color: "#123036",
                        marginBottom: 4,
                      }}
                    >
                      {user.programmingPeriods}
                    </div>
                  </Field>
                )}

                {displayableProfiles && displayableProfiles.length > 0 && (
                  <Field>
                    <Label>{t("users:profiles")}</Label>
                    {displayableProfiles?.map((profile) => (
                      <CompanyContainer key={profile._id}>
                        <ProfileAvatar
                          sx={{
                            bgcolor: profile.color || "var(--color-orange)",
                            width: 32,
                            height: 32,
                            fontSize: "0.875rem",
                          }}
                          alt={`${profile.firstName} ${profile.lastName}`}
                        >
                          {profile.firstName?.[0].toUpperCase()}
                          {profile.lastName?.[0].toUpperCase()}
                        </ProfileAvatar>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "8px",
                              flexWrap: "wrap",
                            }}
                          >
                            {profile.firstName} {profile.lastName}
                            <ProfileRole>{profile.role}</ProfileRole>
                          </div>
                          {profile.contactInformation &&
                            profile.contactInformation.phone &&
                            can(Actions.USER_SEE_CONTACT_INFORMATION) && (
                              <Tooltip title={t("users:actions.copy")}>
                                <CompanyContainer
                                  style={{
                                    flexDirection: "row",
                                    alignItems: "center",
                                    cursor: "pointer",
                                    marginTop: 0,
                                    gap: 4,
                                  }}
                                  onClick={handleCopyToClipboard(
                                    profile.contactInformation?.phone
                                  )}
                                >
                                  <span style={{ textDecoration: "underline" }}>
                                    {profile.contactInformation.phone}
                                  </span>
                                  <IconButton
                                    onClick={handleCopyToClipboard(
                                      profile.contactInformation?.phone
                                    )}
                                  >
                                    <ContentCopyIcon />
                                  </IconButton>
                                </CompanyContainer>
                              </Tooltip>
                            )}
                          {profile.contactInformation &&
                            profile.contactInformation.email &&
                            can(Actions.USER_SEE_CONTACT_INFORMATION) && (
                              <Tooltip title={t("users:actions.copy")}>
                                <CompanyContainer
                                  style={{
                                    flexDirection: "row",
                                    alignItems: "center",
                                    cursor: "pointer",
                                    marginTop: 0,
                                    gap: 4,
                                  }}
                                  onClick={handleCopyToClipboard(
                                    profile.contactInformation?.email
                                  )}
                                >
                                  <span style={{ textDecoration: "underline" }}>
                                    {profile.contactInformation.email}
                                  </span>
                                  <IconButton
                                    onClick={handleCopyToClipboard(
                                      profile.contactInformation?.email
                                    )}
                                  >
                                    <ContentCopyIcon />
                                  </IconButton>
                                </CompanyContainer>
                              </Tooltip>
                            )}
                          {profile.contactInformation?.instructions &&
                            can(Actions.USER_SEE_CONTACT_INFORMATION) && (
                              <div
                                style={{
                                  fontSize: "0.9em",
                                  color: "var(--color-gray)",
                                  marginTop: "4px",
                                  width: "100%",
                                }}
                              >
                                {profile.contactInformation.instructions}
                              </div>
                            )}
                        </div>
                      </CompanyContainer>
                    ))}
                  </Field>
                )}

                {user.structureTypes && (
                  <Field style={{ marginBottom: "8px" }}>
                    <Label>{t("users:structureTypes.title")}</Label>
                    <ProgrammingInfoContainer style={{ marginTop: "0" }}>
                      {user.structureTypes?.map((type) => {
                        const structureTypeStyle = {
                          backgroundColor: "#FF7A2F",
                          color: "#FFFFFF",
                        };

                        return (
                          <Tooltip
                            key={type}
                            title={getStructureTypeLabel(type as StructureType)}
                          >
                            <MuiChip
                              size="small"
                              icon={getStructureTypeIcon(type as StructureType)}
                              label={getStructureTypeLabel(
                                type as StructureType
                              )}
                              style={structureTypeStyle}
                            />
                          </Tooltip>
                        );
                      })}
                    </ProgrammingInfoContainer>
                  </Field>
                )}

                {user.programmingGenres &&
                  user.programmingGenres.length > 0 && (
                    <Field style={{ marginBottom: "8px" }}>
                      <Label>{t("users:genres")}</Label>
                      <GenresChipsContainer style={{ marginTop: "0" }}>
                        {[...new Set(user.programmingGenres)]?.map(
                          (genreId) => {
                            const genre = genres.find((g) => g.id === genreId);
                            if (!genre) return null;
                            return (
                              <GenresChip
                                key={genreId}
                                style={{
                                  backgroundColor:
                                    genre.backgroundColor || "red",
                                  color: genre.color || "#fff",
                                }}
                              >
                                {t(`projects:genres.${genreId}.name`)}
                              </GenresChip>
                            );
                          }
                        )}
                      </GenresChipsContainer>
                    </Field>
                  )}
              </Right>
            </Block>
            {!mobile && mainLocation && (
              <MapContainer>
                <Map
                  start={mainLocation?.location?.geolocation?.coordinates || []}
                  end={mainLocation?.location?.geolocation?.coordinates || []}
                  otherLocations={user.locations.filter((loc) => !loc.isMain)}
                  distance={user.distance}
                  color={user.color}
                />
              </MapContainer>
            )}
          </Header>
          {activeProjects.length > 0 && (
            <>
              <Title>
                {t("users:published-project-count", {
                  count: activeProjects.length || 0,
                })}
              </Title>
              <Projects projects={activeProjects} />
            </>
          )}
          {inactiveProjects && inactiveProjects.length > 0 && (
            <>
              <Title>
                {t("users:unpublished-project-count", {
                  count: inactiveProjects.length || 0,
                })}
              </Title>
              <Projects projects={inactiveProjects} />
            </>
          )}
        </Page>
      </AppLayout>
    </AuthenticationGuard>
  );
};

export default UserPage;
