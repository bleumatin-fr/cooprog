import { Location, Program, Project } from "@cooprog/core";
import styled from "@emotion/styled";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined";
import StarIcon from "@mui/icons-material/Star";
import StarBorderOutlinedIcon from "@mui/icons-material/StarBorderOutlined";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import { IconButton, Tooltip } from "@mui/material";
import { useTranslation } from "next-i18next";
import Link from "next/link";
import { forwardRef, MouseEventHandler, useMemo } from "react";
import useUser from "../authentication/useUser";
import GenreAvatar from "./GenreAvatar";
import GenreChips from "./GenreChips";
import humanizeDateRange from "./humanizeDateRange";
import useGenres from "./useGenres";
import useTargetAudiences from "./useTargetAudiences";
import { Tour } from "@cooprog/core";

export const getCity = (location: Location) => {
  let city =
    location.data?.city ||
    location.data?.village ||
    location.data?.town ||
    location.data?.municipality ||
    undefined;
  return `${city}, ${location.data?.country}`;
};

const getCityOnly = (location: Location) => {
  let city =
    location.data?.city ||
    location.data?.village ||
    location.data?.town ||
    location.data?.municipality ||
    undefined;
  return city;
};

const getCountry = (location: Location) => {
  return location.data?.country;
};

interface ProjectCardProps {
  project: Project;
  tour?: Tour;
  onMouseEnter?: MouseEventHandler<HTMLAnchorElement>;
  onMouseLeave?: MouseEventHandler<HTMLAnchorElement>;
  onFavoriteClicked?: MouseEventHandler<HTMLButtonElement>;
  selected?: boolean;
}

const DotContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  margin-left: 8px;
`;

const DotElement = styled.div`
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: var(--app-project-card-dot-background);
  transition: all 0.4s ease;
`;

const UnpublishedIndicator = styled.div`
  padding: 12px 16px;
  border-top: 1px solid var(--color-light-gray);
  background-color: #f8f9fa;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  border-radius: 0 0 8px 8px;
  margin: 0 -16px -16px -16px;
  flex-shrink: 0;
  margin-top: 32px;

  .explanation {
    display: flex;
    align-items: center;
    font-size: 10px;
    color: #6c757d;
    text-align: flex-end;
    line-height: 1.3;
    gap: 4px;
    svg {
      font-size: 14px;
    }
  }
`;

export const Dot = ({ ...props }) => {
  return (
    <Tooltip title="New project for you" placement="right">
      <DotContainer>
        <DotElement {...props} />
      </DotContainer>
    </Tooltip>
  );
};

const SuperContainer = styled.a`
  padding: 8px;
  display: flex;
  position: relative;
  text-decoration: none;
`;

const Container = styled.div`
  box-shadow: 0 0 4px 0 rgba(0, 0, 0, 0.1);
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  border-radius: 8px;
  position: relative;
  text-decoration: none;
  min-width: 300px;
  padding: 16px;
  transition: all 0.4s ease;
  background: var(--color-very-light-gray);

  &.published {
    background: #fff;
  }

  &:hover {
    background: #fff5e8;
  }

  &.selected {
    background: #fff5e8;
  }
`;

export const Content = styled.div`
  position: relative;
  display: flex;
  flex-grow: 1;
  z-index: 2;
  flex-direction: row;
  gap: 8px;
  padding-right: 8px;
`;

export const InformationContainer = styled.div`
  flex-grow: 1;
`;

export const TitleContainer = styled.div`
  margin-right: 6px;
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
`;

export const DistanceContainer = styled.span`
  display: inline;
  white-space: nowrap;
  font-size: 12px;
  color: var(--color-text-gray);
`;

export const LocationsContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #123036;
  margin-top: 12px;

  svg {
    font-size: 14px;
  }
`;

const DatesContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #123036;
  margin-top: 8px;

  svg {
    font-size: 14px;
  }
`;

const ExtraInfoContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  cursor: pointer;
  margin-top: 8px;

  > div {
    cursor: pointer;
    font-size: 12px;
  }
`;

const ExtraInfo = styled.div`
  color: #b5bfd4;
  font-size: 12px;
  display: flex;
  align-items: center;

  svg {
    font-size: 14px;
  }
`;

const LeftContainer = styled.div`
  display: flex;
  flex-direction: column;
  flex-grow: 0;
  justify-content: space-between;
`;

const ActionsContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  position: absolute;
  top: 0px;
  right: 0px;
  width: 24px;
`;

const unique = (
  value: string | undefined,
  index: number,
  array: (string | undefined)[]
) => {
  return array.indexOf(value) === index;
};

interface ProgramWithLocation extends Omit<Program, "location"> {
  location: Location;
}

const ProjectCard = forwardRef<HTMLAnchorElement, ProjectCardProps>(
  (
    {
      project,
      onMouseEnter,
      onMouseLeave,
      onFavoriteClicked,
      selected,
      tour,
    },
    ref
  ) => {
    const { t, i18n } = useTranslation(["projects", "common"]);
    const { user } = useUser();
    const { artist, work, distance, minDate, maxDate } = project;

    const genres = useGenres(project.discipline);
    const targetAudiences = useTargetAudiences();

    const allSchedules = useMemo(() => {
      return project.tours
        ?.reduce((acc, tour) => {
          if (!tour.schedule) {
            return acc;
          }
          return [...acc, ...tour.schedule];
        }, [] as Program[])
        .filter(
          (schedule) => schedule.location?.geolocation.coordinates
        ) as ProgramWithLocation[];
    }, [project]);

    const locations = useMemo(() => {
      if (!allSchedules || allSchedules.length === 0) return "";

      // Get locations with their countries and dates, preserving order
      const locationsWithDates = allSchedules
        .map((program) => ({
          city: getCityOnly(program.location),
          country: getCountry(program.location),
          date: program.date,
        }))
        .filter((loc) => !!loc.city && !!loc.country)
        .sort((a, b) => {
          // Sort by date if available
          if (a.date && b.date) {
            return new Date(a.date).getTime() - new Date(b.date).getTime();
          }
          return 0;
        });

      if (locationsWithDates.length === 0) return "";

      // Remove duplicates while preserving order
      const uniqueLocations = locationsWithDates.filter(
        (loc, index, array) =>
          array.findIndex(
            (l) => l.city === loc.city && l.country === loc.country
          ) === index
      );

      if (uniqueLocations.length === 0) return "";

      // Group by country while preserving order
      const locationsByCountry = uniqueLocations.reduce((acc, loc) => {
        const country = loc.country || "";
        if (!acc[country]) {
          acc[country] = [];
        }
        acc[country].push(loc.city || "");
        return acc;
      }, {} as Record<string, string[]>);

      // Format locations with country only on the last one per country
      const formattedLocations = Object.entries(locationsByCountry).map(
        ([country, cities]) => {
          if (cities.length === 1) {
            return `${cities[0]}, ${country}`;
          } else {
            const citiesWithoutCountry = cities.slice(0, -1);
            const lastCity = cities[cities.length - 1];
            return [...citiesWithoutCountry, `${lastCity}, ${country}`].join(
              " • "
            );
          }
        }
      );

      return formattedLocations.join(" • ");
    }, [allSchedules]);

    if (!user) return null;

    const isFavorited = !!project.favoritedBy?.find(
      (u) => u?._id?.toString() === user?._id?.toString()
    );

    const attendeesCount = allSchedules?.reduce((acc, program, index) => {
      if (
        allSchedules?.findIndex(
          (p) =>
            p.location.geolocation.coordinates.join(",") ===
            program.location.geolocation.coordinates.join(",")
        ) === index
      ) {
        return acc + 1;
      }
      return acc;
    }, 0);

    const published =
      project.tours?.filter((tour) => tour.archived !== true).length ?? 0 > 0;

    return (
      <SuperContainer
        as={Link}
        href={`/projects/${project._id}${tour ? `/tours/${tour._id}` : ""}`}
        ref={ref}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      >
        <Container
          id={`project-card-${project._id}`}
          className={
            "project-card" +
            (selected ? " selected" : "") +
            (project.viewed ? " visited" : "") +
            (published ? " published" : "")
          }
          data-testid="project-card"
        >
          <Content>
            <LeftContainer>
              <GenreAvatar
                genres={genres}
                value={project.genres}
                complementaryGenre={project.complementaryGenre}
              />
            </LeftContainer>
            <InformationContainer>
              <ActionsContainer>
                {!project.viewed && <Dot className="dot" />}
                {onFavoriteClicked && (
                  <Tooltip
                    title={t("projects:actions.favorite")}
                    placement="right"
                  >
                    <IconButton
                      style={{ padding: 0, marginLeft: 8 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        onFavoriteClicked(e);
                      }}
                    >
                      {isFavorited ? (
                        <StarIcon></StarIcon>
                      ) : (
                        <StarBorderOutlinedIcon></StarBorderOutlinedIcon>
                      )}
                    </IconButton>
                  </Tooltip>
                )}
              </ActionsContainer>
              <TitleContainer>
                <p>{artist}</p>
                {!!work && <p>{work}</p>}
              </TitleContainer>
              {locations && (
                <LocationsContainer>
                  <LocationOnOutlinedIcon />
                  <p>
                    {locations} -{" "}
                    <DistanceContainer>
                      {Math.round(distance || 0)} km
                    </DistanceContainer>
                  </p>
                </LocationsContainer>
              )}
              {!!minDate && !!maxDate && (
                <DatesContainer>
                  <CalendarMonthOutlinedIcon />{" "}
                  {humanizeDateRange(minDate, maxDate, i18n)}
                </DatesContainer>
              )}
              <ExtraInfoContainer>
                {(project.favoritedBy || []).length > 0 && (
                  <ExtraInfo>
                    <StarBorderOutlinedIcon />{" "}
                    {t("projects:card.favorites", {
                      count: project.favoritedBy?.length || 0,
                    })}
                  </ExtraInfo>
                )}
                {attendeesCount > 0 && (
                  <ExtraInfo>
                    <PersonOutlinedIcon />{" "}
                    {t("projects:card.attendees", {
                      count: attendeesCount || 0,
                    })}
                  </ExtraInfo>
                )}
              </ExtraInfoContainer>
              <GenreChips
                genres={genres}
                genreValue={project.genres || []}
                targetAudienceValue={project.targetAudiences || []}
                limit={2}
                targetAudiences={targetAudiences}
                complementaryGenre={project.complementaryGenre}
              />
            </InformationContainer>
          </Content>
          {!published && (
            <UnpublishedIndicator>
              <div className="explanation">
                <VisibilityOffIcon />
                {t("projects:card.draftExplanation")}
              </div>
            </UnpublishedIndicator>
          )}
        </Container>
      </SuperContainer>
    );
  }
);

ProjectCard.displayName = "ProjectCard";

export default ProjectCard;
