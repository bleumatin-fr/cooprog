import AuthenticationGuard from "@/components/authentication/AuthenticationGuard";
import useUser from "@/components/authentication/useUser";
import AppLayout from "@/components/layout/AppLayout";
import MapPage, { GridContainer } from "@/components/layout/MapPage";
import Page from "@/components/layout/Page";
import EmptyProjectList from "@/components/projects/EmptyProjectList";
import ModeSelector from "@/components/projects/ModeSelector";
import ProjectCard from "@/components/projects/ProjectCard";
import ProjectList from "@/components/projects/ProjectList";
import SearchBar from "@/components/projects/SearchBar";
import SortSelector from "@/components/projects/SortSelector";
import useInfiniteProjects from "@/components/projects/useInfiniteProjects";
import Breadcrumbs from "@/components/UI/Breadcrumbs";
import LoadingPage from "@/components/UI/LoadingPage";
import { Discipline, Project, Role } from "@cooprog/core";
import styled from "@emotion/styled";
import { Chip, Tooltip, useMediaQuery, useTheme } from "@mui/material";
import { Feature, GeoJsonProperties, Point } from "geojson";
import { GetServerSideProps } from "next";
import { i18n, useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import {
  RefCallback,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { dehydrate, QueryClient } from "react-query";
import { useLocalStorage, useSessionStorage } from "usehooks-ts";
import useDiscipline from "@/components/layout/useDiscipline";
import { useDebounceValue } from "usehooks-ts";

const ProjectListMap = dynamic(
  () => import("../../components/projects/maps/ProjectListMap"),
  {
    ssr: false,
  }
);

const namespaces = [
  "common",
  "projects",
  "notifications",
  "users",
  "authentication",
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

export const ModeSelectorContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  gap: 8px;
`;

const Title = styled.div`
  font-size: 24px;
  font-weight: 700;
  height: 60px;
  line-height: 40px;
  top: 184px;
  position: sticky;
  z-index: 100;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`;

const FullProjectCountContainer = styled.span`
  font-size: 14px;
  font-weight: 400;
  color: #aaa;
  white-space: nowrap;
`;

export const reinitializeLocalStorage = () => {
  localStorage.removeItem("project-artist");
  localStorage.removeItem("project-work");
  localStorage.removeItem("project-countries");
  localStorage.removeItem("project-regions");
  localStorage.removeItem("project-cities");
  localStorage.removeItem("project-selected-genres");
  localStorage.removeItem("project-selected-disciplines");
  localStorage.removeItem("project-selected-target-audiences");
  localStorage.removeItem("project-selected-gauge");
  localStorage.removeItem("project-selected-minimum-stage-size");
  localStorage.removeItem("project-selected-average-performance-fee");
  localStorage.removeItem("project-selected-venue-configuration-type");
  localStorage.removeItem("project-selected-venue-configuration-space");
  localStorage.removeItem("project-selected-venue-configuration-audience");
  localStorage.removeItem("project-selected-performance-languages");
  localStorage.removeItem("project-minimum-people-on-tour");
  localStorage.removeItem("project-maximum-people-on-tour");
  localStorage.removeItem("project-minimum-artist-on-stage");
  localStorage.removeItem("project-maximum-artist-on-stage");
  localStorage.removeItem("project-date-min");
  localStorage.removeItem("project-date-max");
  localStorage.removeItem("project-distance-max");
  localStorage.removeItem("project-sort-order");
  localStorage.removeItem("project-favorites");
  localStorage.removeItem("project-mode");
  localStorage.removeItem("project-discipline");
  localStorage.removeItem("project-emerging-artist");
  localStorage.removeItem("project-cultural-action-interest");
  localStorage.removeItem("project-accessibility-visual");
  localStorage.removeItem("project-accessibility-audio");
  localStorage.removeItem("project-min-gender-percentage");
  localStorage.removeItem("project-max-gender-percentage");
  localStorage.removeItem("project-min-gender-type");
  localStorage.removeItem("project-max-gender-type");
};

const ProjectSearch = () => {
  const { t } = useTranslation(namespaces);
  const {
    user,
    error: userError,
    loading: userLoading,
    refetchUser,
  } = useUser();

  const sortOrders = [
    { sort: "minDate", label: t("projects:sorts.minDate") },
    { sort: "-minDate", label: t("projects:sorts.-minDate") },
    { sort: "distance", label: t("projects:sorts.distance") },
    { sort: "-distance", label: t("projects:sorts.-distance") },
  ];

  const [artist, setArtist] = useLocalStorage<string>("project-artist", "");
  const [work, setWork] = useLocalStorage<string>("project-work", "");
  const [countries, setCountries] = useLocalStorage<string[]>(
    "project-countries",
    []
  );
  const [regions, setRegions] = useLocalStorage<string[]>(
    "project-regions",
    []
  );
  const [cities, setCities] = useLocalStorage<string[]>("project-cities", []);
  const [selectedGenres, setSelectedGenres] = useLocalStorage<string[]>(
    "project-selected-genres",
    []
  );
  const { selectedDiscipline, setPageDiscipline, setSelectedDiscipline } =
    useDiscipline();

  useEffect(() => {
    setPageDiscipline(undefined);
  }, []);

  const [selectedTargetAudiences, setSelectedTargetAudiences] = useLocalStorage<
    string[]
  >("project-selected-targetAudiences", []);
  const [mode, setMode] = useLocalStorage<string>("project-mode", "grid");
  const [dateMin, setDateMin] = useLocalStorage<Date | null>(
    "project-date-min",
    null
  );
  const [dateMax, setDateMax] = useLocalStorage<Date | null>(
    "project-date-max",
    null
  );
  const [distanceMax, setDistanceMax] = useLocalStorage<number | null>(
    "project-distance-max",
    null
  );
  const [sortOrder, setSortOrder] = useLocalStorage<string>(
    "project-sort-order",
    "minDate"
  );
  const [favorite, setFavorite] = useLocalStorage<boolean>(
    "project-favorites",
    false
  );
  const [selectedGauge, setSelectedGauge] = useLocalStorage<string[]>(
    "project-selected-gauge",
    []
  );
  const [selectedMinimumStageSize, setSelectedMinimumStageSize] =
    useLocalStorage<string[]>("project-selected-minimum-stage-size", []);
  const [selectedAveragePerformanceFee, setSelectedAveragePerformanceFee] =
    useLocalStorage<string[]>("project-selected-average-performance-fee", []);
  const [selectedVenueConfigurationType, setSelectedVenueConfigurationType] =
    useLocalStorage<string[]>("project-selected-venue-configuration-type", []);
  const [selectedVenueConfigurationSpace, setSelectedVenueConfigurationSpace] =
    useLocalStorage<string[]>("project-selected-venue-configuration-space", []);
  const [
    selectedVenueConfigurationAudience,
    setSelectedVenueConfigurationAudience,
  ] = useLocalStorage<string[]>(
    "project-selected-venue-configuration-audience",
    []
  );
  const [selectedPerformanceLanguages, setSelectedPerformanceLanguages] =
    useLocalStorage<string[]>("project-selected-performance-languages", []);

  const [minimumPeopleOnTour, setMinimumPeopleOnTour] = useLocalStorage<
    number | undefined
  >("project-minimum-people-on-tour", undefined);
  const [maximumPeopleOnTour, setMaximumPeopleOnTour] = useLocalStorage<
    number | undefined
  >("project-maximum-people-on-tour", undefined);
  const [minimumArtistOnStage, setMinimumArtistOnStage] = useLocalStorage<
    number | undefined
  >("project-minimum-artist-on-stage", undefined);
  const [maximumArtistOnStage, setMaximumArtistOnStage] = useLocalStorage<
    number | undefined
  >("project-maximum-artist-on-stage", undefined);

  const [minGenderPercentage, setMinGenderPercentage] = useLocalStorage<
    number | undefined
  >("project-min-gender-percentage", undefined);
  const [maxGenderPercentage, setMaxGenderPercentage] = useLocalStorage<
    number | undefined
  >("project-max-gender-percentage", undefined);
  const [minGenderType, setMinGenderType] = useLocalStorage<string | undefined>(
    "project-min-gender-type",
    undefined
  );
  const [maxGenderType, setMaxGenderType] = useLocalStorage<string | undefined>(
    "project-max-gender-type",
    undefined
  );
  const [selectedPublished, setSelectedPublished] = useLocalStorage<
    boolean | undefined
  >(
    "project-selected-published",
    user?.role === Role.ARTISTIC_TEAM ? undefined : true
  );

  const [emergingArtist, setEmergingArtist] = useLocalStorage<boolean>(
    "project-emerging-artist",
    false
  );
  const [culturalActionInterest, setCulturalActionInterest] =
    useLocalStorage<boolean>("project-cultural-action-interest", false);
  const [accessibilityVisual, setAccessibilityVisual] =
    useLocalStorage<boolean>("project-accessibility-visual", false);
  const [accessibilityAudio, setAccessibilityAudio] = useLocalStorage<boolean>(
    "project-accessibility-audio",
    false
  );

  const [boundingPoint, setBoundingPoint] = useState<Feature<
    Point,
    GeoJsonProperties
  > | null>(null);

  const [searchedText, setSearchedText] = useSessionStorage<string>(
    "project-searched-text",
    ""
  );
  const [debouncedSearchedText] = useDebounceValue(searchedText, 500);
  const theme = useTheme();

  const mobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [showMap, setShowMap] = useState<boolean>(!mobile);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [zoom, setZoom] = useState<number>(5);

  const isSearchingByText = useMemo<boolean>(() => {
    return !!debouncedSearchedText;
  }, [debouncedSearchedText]);

  const {
    projects,
    markers,
    pages,
    hasNextPage,
    loading,
    fetching,
    fetchNextPage,
    fetchPreviousPage,
    totalCount,
    superTotalCount,
    addToFavorites,
  } = useInfiniteProjects({
    q: debouncedSearchedText,
    artist: artist,
    work: work,
    countries,
    regions,
    cities,
    genres: selectedGenres,
    disciplines: [selectedDiscipline],
    targetAudiences: selectedTargetAudiences,
    gauge: selectedGauge,
    minimumStageSize: selectedMinimumStageSize,
    averagePerformanceFee: selectedAveragePerformanceFee,
    venueConfigurationAudience: selectedVenueConfigurationAudience,
    venueConfigurationSpace: selectedVenueConfigurationSpace,
    venueConfigurationType: selectedVenueConfigurationType,
    performanceLanguages: selectedPerformanceLanguages,
    minimumPeopleOnTour,
    maximumPeopleOnTour,
    minimumArtistOnStage,
    maximumArtistOnStage,
    favorite,
    dateMin: dateMin ? new Date(dateMin).toISOString() : undefined,
    dateMax: dateMax ? new Date(dateMax).toISOString() : undefined,
    distanceMax,
    boundingCenter: showMap
      ? boundingPoint?.geometry.coordinates.join(",")
      : undefined,
    boundingRadius: showMap ? boundingPoint?.properties?.radius : undefined,
    zoom: showMap ? zoom : undefined,
    emergingArtist,
    culturalActionInterest,
    accessibilityVisual: accessibilityVisual ? true : undefined,
    accessibilityAudio: accessibilityAudio ? true : undefined,
    minGenderPercentage,
    maxGenderPercentage,
    minGenderType,
    maxGenderType,
    limit: 20,
    published: selectedPublished,
    sort: sortOrder,
  });

  useEffect(() => {
    setSelectedProject(null);
  }, [
    searchedText,
    selectedGenres,
    selectedDiscipline,
    favorite,
    dateMin,
    dateMax,
    sortOrder,
    selectedTargetAudiences,
    distanceMax,
    emergingArtist,
    culturalActionInterest,
    accessibilityVisual,
    accessibilityAudio,
  ]);

  const router = useRouter();

  useEffect(() => {
    if (router.query.q && router.query.disciplines) {
      reinitializeLocalStorage();
      setSearchedText(router.query.q as string);
      setSelectedDiscipline(router.query.disciplines as Discipline);
      setSelectedPublished(undefined);
    }
  }, [router.query.q, router.query.disciplines]);

  const observer = useRef<IntersectionObserver>(null);
  const lastElementRef: RefCallback<HTMLAnchorElement> = useCallback(
    (node: HTMLAnchorElement): void => {
      if (loading) {
        return;
      }
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasNextPage && !fetching) {
          fetchNextPage();
        }
      });
      if (node) observer.current.observe(node);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [loading, hasNextPage]
  );

  useEffect(() => {
    if (mobile) {
      setShowMap(false);
    }
  }, [mobile]);

  const handleFavoriteClicked = (id: string) => async () => {
    await addToFavorites(id);
  };

  const handleTextChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchedText(event.target.value as string);
  };

  const handleBoundsChanged = (
    bounds: Feature<Point, GeoJsonProperties> | null
  ) => {
    setBoundingPoint(bounds);
  };
  if (!user) {
    return (
      <Page fullWidth>
        <LoadingPage />
      </Page>
    );
  }
  return (
    <AuthenticationGuard>
      <AppLayout>
        <Page fullWidth className="project-list">
          <MapPage
            showMap={showMap}
            setShowMap={setShowMap}
            search={
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  flexGrow: 1,
                }}
              >
                <Breadcrumbs
                  crumbs={[{ name: t("common:breadcrumbs.projects") }]}
                />
                <SearchBar
                  searchText={searchedText}
                  onTextChange={handleTextChange}
                  artist={artist}
                  setArtist={setArtist}
                  work={work}
                  setWork={setWork}
                  countries={countries}
                  setCountries={setCountries}
                  regions={regions}
                  setRegions={setRegions}
                  cities={cities}
                  setCities={setCities}
                  selectedGenres={selectedGenres}
                  setSelectedGenres={setSelectedGenres}
                  selectedTargetAudiences={selectedTargetAudiences}
                  setSelectedTargetAudiences={setSelectedTargetAudiences}
                  selectedGauge={selectedGauge}
                  setSelectedGauge={setSelectedGauge}
                  selectedMinimumStageSize={selectedMinimumStageSize}
                  setSelectedMinimumStageSize={setSelectedMinimumStageSize}
                  selectedAveragePerformanceFee={selectedAveragePerformanceFee}
                  setSelectedAveragePerformanceFee={
                    setSelectedAveragePerformanceFee
                  }
                  selectedVenueConfigurationType={
                    selectedVenueConfigurationType
                  }
                  setSelectedVenueConfigurationType={
                    setSelectedVenueConfigurationType
                  }
                  selectedVenueConfigurationSpace={
                    selectedVenueConfigurationSpace
                  }
                  setSelectedVenueConfigurationSpace={
                    setSelectedVenueConfigurationSpace
                  }
                  selectedVenueConfigurationAudience={
                    selectedVenueConfigurationAudience
                  }
                  setSelectedVenueConfigurationAudience={
                    setSelectedVenueConfigurationAudience
                  }
                  selectedPerformanceLanguages={selectedPerformanceLanguages}
                  setSelectedPerformanceLanguages={
                    setSelectedPerformanceLanguages
                  }
                  minimumPeopleOnTour={minimumPeopleOnTour}
                  setMinimumPeopleOnTour={setMinimumPeopleOnTour}
                  maximumPeopleOnTour={maximumPeopleOnTour}
                  setMaximumPeopleOnTour={setMaximumPeopleOnTour}
                  minimumArtistOnStage={minimumArtistOnStage}
                  setMinimumArtistOnStage={setMinimumArtistOnStage}
                  maximumArtistOnStage={maximumArtistOnStage}
                  setMaximumArtistOnStage={setMaximumArtistOnStage}
                  favorite={favorite}
                  setFavorite={setFavorite}
                  dateMin={dateMin}
                  setDateMin={setDateMin}
                  dateMax={dateMax}
                  setDateMax={setDateMax}
                  distanceMax={distanceMax}
                  setDistanceMax={setDistanceMax}
                  showMap={showMap}
                  setShowMap={setShowMap}
                  projectCount={totalCount || 0}
                  showFilters={true}
                  setShowFilters={() => {}}
                  filtersDisabled={isSearchingByText}
                  emergingArtist={emergingArtist}
                  setEmergingArtist={setEmergingArtist}
                  culturalActionInterest={culturalActionInterest}
                  setCulturalActionInterest={setCulturalActionInterest}
                  accessibilityVisual={accessibilityVisual}
                  setAccessibilityVisual={setAccessibilityVisual}
                  accessibilityAudio={accessibilityAudio}
                  setAccessibilityAudio={setAccessibilityAudio}
                  minGenderPercentage={minGenderPercentage}
                  setMinGenderPercentage={setMinGenderPercentage}
                  maxGenderPercentage={maxGenderPercentage}
                  setMaxGenderPercentage={setMaxGenderPercentage}
                  minGenderType={minGenderType}
                  setMinGenderType={setMinGenderType}
                  maxGenderType={maxGenderType}
                  setMaxGenderType={setMaxGenderType}
                  selectedPublished={selectedPublished}
                  setSelectedPublished={setSelectedPublished}
                />
              </div>
            }
            results={
              <div
                onClick={() => setSelectedProject(null)}
                style={{ flexGrow: 1, maxWidth: "100%" }}
              >
                <Title>
                  <div
                    style={{
                      lineHeight: "0.8",
                      display: "flex",
                      alignItems: "baseline",
                      gap: "8px",
                      flexWrap: "wrap",
                    }}
                  >
                    <div style={{ whiteSpace: "nowrap" }}>
                      {t("projects:count", {
                        count: totalCount,
                      })}
                    </div>
                    {superTotalCount > 0 && (
                      <FullProjectCountContainer>
                        {t("projects:totalcount", {
                          count: superTotalCount,
                        })}
                      </FullProjectCountContainer>
                    )}
                  </div>
                  <div>
                    {boundingPoint && (
                      <Chip
                        label={t("projects:cluster-filtered")}
                        color="primary"
                        variant="filled"
                        size="medium"
                        onDelete={() => setBoundingPoint(null)}
                      />
                    )}
                  </div>
                  <ModeSelectorContainer>
                    {!mobile && (
                      <SortSelector
                        sortOrder={isSearchingByText ? "relevance" : sortOrder}
                        setSortOrder={setSortOrder}
                        availableSorts={
                          [
                            ...sortOrders,
                            isSearchingByText
                              ? {
                                  sort: "relevance",
                                  label: t("projects:sorts.relevance"),
                                }
                              : undefined,
                          ].filter(Boolean) as {
                            sort: string;
                            label: string;
                          }[]
                        }
                        disabled={isSearchingByText}
                      />
                    )}
                    <ModeSelector mode={mode} setMode={setMode} />
                  </ModeSelectorContainer>
                </Title>
                {(!projects || !projects.length) && !loading && (
                  <EmptyProjectList />
                )}
                {mode === "list" && pages && projects && projects.length && (
                  <ProjectList
                    // projectsPages={pages}
                    projects={projects}
                    getNextPage={() => {
                      fetchNextPage();
                    }}
                    getPreviousPage={() => {
                      fetchPreviousPage();
                    }}
                    totalProjects={totalCount}
                    onFavoriteClicked={handleFavoriteClicked}
                  />
                )}
                {mode === "grid" && projects && (
                  <GridContainer>
                    {projects.map((project, i) => (
                      <ProjectCard
                        key={project._id}
                        project={project}
                        onMouseEnter={() => setSelectedProject(project)}
                        onMouseLeave={() => setSelectedProject(null)}
                        selected={selectedProject?._id === project?._id}
                        onFavoriteClicked={handleFavoriteClicked(project._id)}
                        ref={projects.length === i + 1 ? lastElementRef : null}
                      />
                    ))}
                  </GridContainer>
                )}
              </div>
            }
            map={
              <ProjectListMap
                clusters={markers.filter(
                  (m) => m.geometry.coordinates.toString() !== [0, 0].toString()
                )}
                selectedProject={selectedProject}
                selectedCluster={boundingPoint}
                setSelectedCluster={handleBoundsChanged}
                onZoomChanged={setZoom}
              />
            }
          />
        </Page>
      </AppLayout>
    </AuthenticationGuard>
  );
};

export default ProjectSearch;
