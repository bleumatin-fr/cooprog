import { GetServerSideProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { dehydrate, QueryClient } from "react-query";

import AuthenticationGuard from "@/components/authentication/AuthenticationGuard";
import AppLayout from "@/components/layout/AppLayout";
import Page from "@/components/layout/Page";
import { Role, User, Discipline } from "@cooprog/core";

import useUser from "@/components/authentication/useUser";
import { Feature, GeoJsonProperties, Point } from "geojson";

import UsersSearchBar from "@/components/structures/UsersSearchBar";
import useRights, { Actions } from "@/components/structures/useRights";

import { Chip, useMediaQuery, useTheme } from "@mui/material";

import { RefCallback, useCallback, useEffect, useRef, useState } from "react";

import MapPage from "@/components/layout/MapPage";

import useInfiniteUsers from "@/components/authentication/useInfiniteUsers";
import ModeSelector from "@/components/projects/ModeSelector";
import SortSelector from "@/components/projects/SortSelector";
import EmptyUserList from "@/components/structures/EmptyUserList";
import UserCard from "@/components/structures/UserCard";
import UsersList from "@/components/structures/UsersList";
import Breadcrumbs from "@/components/UI/Breadcrumbs";
import styled from "@emotion/styled";
import { useTranslation } from "next-i18next";
import dynamic from "next/dynamic";
import {
  useDebounceValue,
  useLocalStorage,
  useSessionStorage,
} from "usehooks-ts";
import useDiscipline from "@/components/layout/useDiscipline";
import LoadingPage from "@/components/UI/LoadingPage";
import { i18n } from "next-i18next";
import { useRouter } from "next/router";

export const ROLE_URL_MAP: Record<string, Role> = {
  structures: Role.DIFFUSION_STRUCTURE,
  artistic: Role.ARTISTIC_TEAM,
};

export const getRoleURL = (role: Role) => {
  const entry = Object.entries(ROLE_URL_MAP).find(
    ([_, value]) => value === role,
  );
  return entry ? `/users/role/${entry[0]}` : undefined;
};

const namespaces = ["common", "users", "notifications", "projects"];
/**
 * This enables server side rendering for the page
 * @param context Next.js context
 * @returns Props for the page
 */
export const getServerSideProps: GetServerSideProps = async (context) => {
  const { params, query, locale } = context;
  const slug = params?.role as string;
  const role = ROLE_URL_MAP[slug];
  const queryClient = new QueryClient();

  if (!role) {
    return { notFound: true };
  }

  if (process.env.NODE_ENV === "development") {
    await i18n?.reloadResources();
  }

  return {
    props: {
      role,
      dehydratedState: dehydrate(queryClient),
      ...(await serverSideTranslations(locale || "en", namespaces)),
    },
  };
};

const UsersListMap = dynamic(
  () => import("@/components/users/maps/UsersListMap"),
  {
    ssr: false,
  },
);

const Title = styled.div`
  font-size: 24px;
  font-weight: 700;
  height: 60px;
  background-color: var(--color-bg-gray);
  top: 184px;
  position: sticky;
  z-index: 100;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`;

export const GridContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
  flex-grow: 1;
`;

export const ModeSelectorContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  gap: 8px;
`;

const FullUserCountContainer = styled.span`
  font-size: 14px;
  font-weight: 400;
  margin-left: 8px;
  color: #aaa;
`;

const UserListPage = ({ role }: { role: Role }) => {
  const { t } = useTranslation(["common", "users", "notifications"]);
  const { user, refetchUser } = useUser();
  const userRole = user?.role;
  const router = useRouter();
  const { can } = useRights({ user });

  const sortOrders = [
    { sort: "distance", label: t("users:sorts.distance") },
    { sort: "-distance", label: t("users:sorts.-distance") },
  ];

  const [mode, setMode] = useLocalStorage<string>(`users-mode-${role}`, "grid");
  const [distanceMax, setDistanceMax] = useLocalStorage<number | null>(
    `users-distance-max-${role}`,
    null,
  );
  const [sortOrder, setSortOrder] = useLocalStorage<string>(
    `users-sort-order-${role}`,
    "-distance",
  );
  const [following, setFollowing] = useLocalStorage<boolean | null>(
    `users-following-${role}`,
    null,
  );
  const [followers, setFollowers] = useLocalStorage<boolean | null>(
    `users-followers-${role}`,
    false,
  );
  const { selectedDiscipline, setPageDiscipline } = useDiscipline();

  const [genres, setGenres] = useLocalStorage<string[]>(
    `users-genres-${role}`,
    [],
  );
  const [structureTypes, setStructureTypes] = useLocalStorage<string[]>(
    `users-structure-types-${role}`,
    [],
  );
  const [countries, setCountries] = useLocalStorage<string[]>(
    `users-countries-${role}`,
    [],
  );
  const [regions, setRegions] = useLocalStorage<string[]>(
    `users-regions-${role}`,
    [],
  );
  const [cities, setCities] = useLocalStorage<string[]>(
    `users-cities-${role}`,
    [],
  );

  useEffect(() => {
    setGenres([]);
  }, [selectedDiscipline]);

  useEffect(() => {
    setPageDiscipline(undefined);
  }, []);

  const [boundingPoint, setBoundingPoint] = useState<Feature<
    Point,
    GeoJsonProperties
  > | null>(null);

  const [searchedText, setSearchedText] = useSessionStorage<string>(
    `users-searched-text-${role}`,
    "",
  );
  const [debouncedSearchedText] = useDebounceValue(searchedText, 500);

  const theme = useTheme();
  const mobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [showMap, setShowMap] = useState<boolean>(!mobile);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [zoom, setZoom] = useState<number>(5);

  const {
    users,
    markers,
    pages,
    loading,
    fetchNextPage,
    hasNextPage,
    fetching,
    fetchPreviousPage,
    totalCount,
    superTotalCount,
  } = useInfiniteUsers({
    q: debouncedSearchedText,
    distanceMax,
    role,
    discipline: selectedDiscipline,
    followers,
    following,
    sort: sortOrder,
    limit: 20,
    zoom: showMap ? zoom : undefined,
    genres: genres,
    structureTypes: structureTypes,
    countries,
    regions,
    cities,
  });

  useEffect(() => {
    setSelectedUser(null);
  }, [searchedText, distanceMax, followers, following, structureTypes]);

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
    [loading, hasNextPage],
  );

  useEffect(() => {
    if (mobile) {
      setShowMap(false);
    }
  }, [mobile]);

  const handleTextChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchedText(event.target.value as string);
  };

  const handleBoundsChanged = (
    bounds: Feature<Point, GeoJsonProperties> | null,
  ) => {
    setBoundingPoint(bounds);
  };

  if (!user) {
    return (
      <Page className="project-list" fullWidth>
        <LoadingPage />
      </Page>
    );
  }

  const hasAccess =
    role === Role.DIFFUSION_STRUCTURE
      ? can(Actions.PAGES_ACCESS_STRUCTURES)
      : can(Actions.PAGES_ACCESS_ARTISTIC_TEAMS);

  if (!hasAccess) {
    router.replace("/home");
    return null;
  }

  return (
    <AuthenticationGuard>
      <AppLayout>
        <Page className="project-list" fullWidth>
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
                  crumbs={[{ name: t(`common:breadcrumbs.users.${role}`) }]}
                />
                <UsersSearchBar
                  searchText={searchedText}
                  onSearchTextChange={setSearchedText}
                  setShowMap={setShowMap}
                  showMap={showMap}
                  distanceMax={distanceMax}
                  setDistanceMax={setDistanceMax}
                  following={following}
                  setFollowing={setFollowing}
                  followers={followers}
                  setFollowers={setFollowers}
                  usersCount={totalCount}
                  genres={genres}
                  setGenres={setGenres}
                  structureTypes={structureTypes}
                  setStructureTypes={setStructureTypes}
                  role={role}
                  countries={countries}
                  setCountries={setCountries}
                  regions={regions}
                  setRegions={setRegions}
                  cities={cities}
                  setCities={setCities}
                />
              </div>
            }
            results={
              <div
                onClick={() => setSelectedUser(null)}
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
                      {t(`users:${role}.count`, {
                        count: totalCount,
                      })}
                    </div>

                    {superTotalCount > 0 && userRole !== Role.ARTISTIC_TEAM && (
                      <FullUserCountContainer>
                        {t(`users:${role}.totalcount`, {
                          count: superTotalCount,
                        })}
                      </FullUserCountContainer>
                    )}
                  </div>
                  <ModeSelectorContainer>
                    {!mobile && userRole !== Role.ARTISTIC_TEAM && (
                      <SortSelector
                        sortOrder={sortOrder}
                        setSortOrder={setSortOrder}
                        availableSorts={sortOrders}
                        disabled={false}
                      />
                    )}
                    <ModeSelector mode={mode} setMode={setMode} />
                  </ModeSelectorContainer>
                </Title>
                {(!users || !users.length) && !loading && <EmptyUserList />}
                {mode === "list" && pages && users && users.length > 0 && (
                  <UsersList
                    users={users}
                    getNextPage={() => {
                      fetchNextPage();
                    }}
                    getPreviousPage={() => {
                      fetchPreviousPage();
                    }}
                    totalUsers={totalCount}
                    disabled={userRole === Role.ARTISTIC_TEAM}
                  />
                )}
                {mode === "grid" && users && users.length > 0 && (
                  <GridContainer>
                    {users.map((user, i) => (
                      <UserCard
                        user={user}
                        disabled={userRole === Role.ARTISTIC_TEAM}
                        key={user._id}
                        onMouseEnter={() => setSelectedUser(user)}
                        onMouseLeave={() => setSelectedUser(null)}
                        selected={selectedUser?._id === user._id}
                        ref={
                          users.length === i + 1 ? lastElementRef : undefined
                        }
                      />
                    ))}
                  </GridContainer>
                )}
              </div>
            }
            map={
              <UsersListMap
                clusters={markers}
                selectedUser={selectedUser}
                onZoomChanged={setZoom}
                setSelectedCluster={handleBoundsChanged}
              />
            }
          />
        </Page>
      </AppLayout>
    </AuthenticationGuard>
  );
};

const UsersByRolePage = ({ role }: { role: Role }) => {
  return <UserListPage role={role} />;
};

export default UsersByRolePage;
