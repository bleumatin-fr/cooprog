import { Location, Program, Project } from "@cooprog/core";
import styled from "@emotion/styled";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import { Tooltip } from "@mui/material";
import { useTranslation } from "next-i18next";
import Link from "next/link";
import { forwardRef, MouseEventHandler, useMemo } from "react";
import useUser from "../authentication/useUser";
import { humanizeMultipleDates } from "./humanizeDateRange";
import useGenres from "./useGenres";
import useTargetAudiences from "./useTargetAudiences";
import { Tour } from "@cooprog/core";
import { ProgramStatuses } from "@cooprog/core";
import UserAvatar from "../structures/UserAvatar";
import { convertLocationToPlace } from "../authentication/register/Address";

export const getCity = (location: Location) => {
  return (
    location.data?.city ||
    location.data?.village ||
    location.data?.town ||
    location.data?.municipality ||
    undefined
  );
};

interface ProjectCardProps {
  project: Project;
  tour?: Tour;
  onMouseEnter?: MouseEventHandler<HTMLAnchorElement>;
  onMouseLeave?: MouseEventHandler<HTMLAnchorElement>;
  onFavoriteClicked?: MouseEventHandler<HTMLButtonElement>;
  onHideClicked?: MouseEventHandler<HTMLButtonElement>;
  selected?: boolean;
  month: number;
  year: number;
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
  border-radius: 8px;
  position: relative;
  text-decoration: none;
  min-width: 300px;
  padding: 16px;
  transition: all 0.4s ease;
  background: #fff;

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

export const SubtitleContainer = styled.div`
  margin-right: 6px;
  font-weight: bold;
  p {
    display: inline;
    display: inline-block;
    max-width: 180px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    padding-right: 4px;
  }
  p:first-of-type:not(:last-of-type):after {
    content: " ● ";
  }

  p:first-of-type {
  }

  p:last-of-type:not(:first-of-type) {
    font-weight: normal;
  }
`;
export const TitleContainer = styled.div`
  margin-right: 6px;
  p {
    display: inline;
  }
  p:first-of-type {
    font-style: italic;
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
  array: (string | undefined)[],
) => {
  return array.indexOf(value) === index;
};

interface ProgramWithLocation extends Omit<Program, "location"> {
  location: Location;
}

interface ProgramWithManyDates extends Omit<Program, "date"> {
  dates: Date[];
}

const getDistance = (
  location1: Location | undefined,
  location2: Location | undefined,
) => {
  if (
    !location1?.geolocation?.coordinates ||
    !location2?.geolocation?.coordinates
  )
    return 0;

  const R = 6371; // Earth's radius in kilometers
  const [lon1, lat1] = location1.geolocation.coordinates;
  const [lon2, lat2] = location2.geolocation.coordinates;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const lat1Rad = toRad(lat1);
  const lat2Rad = toRad(lat2);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLon / 2) *
      Math.sin(dLon / 2) *
      Math.cos(lat1Rad) *
      Math.cos(lat2Rad);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return Math.round(distance);
};

const toRad = (value: number): number => {
  return (value * Math.PI) / 180;
};

const ArtisticTeamProjectCard = forwardRef<HTMLAnchorElement, ProjectCardProps>(
  (
    {
      project,
      tour,
      onMouseEnter,
      onMouseLeave,
      onFavoriteClicked,
      onHideClicked,
      selected,
      month,
      year,
    },
    ref,
  ) => {
    const { t, i18n } = useTranslation(["projects", "common"]);
    const { user } = useUser();

    const rightSchedules = useMemo(() => {
      return project.tours
        ?.flatMap((tour) => tour.schedule)
        .filter((program) => !!program)
        .filter((program) => {
          if (!program) return false;
          const programDate = new Date(program.date);
          return (
            programDate.getUTCMonth() === month &&
            programDate.getUTCFullYear() === year
          );
        })
        .filter((program) =>
          [
            ProgramStatuses.SHOW_CONFIRMED,
            ProgramStatuses.SHOW_PENDING,
          ].includes(program!.status),
        )
        .filter(
          (program) => program?.location?.geolocation.coordinates,
        ) as ProgramWithLocation[];
    }, [project, month, year]);

    if (!user) return null;

    const rightSchedulesMergedByDateAndUserId = useMemo(() => {
      return rightSchedules.reduce((acc, schedule) => {
        const date = new Date(schedule.date);
        const userId = schedule.user?._id;
        const foundSchedule = acc.find((s) => s.user?._id === userId);
        if (foundSchedule) {
          foundSchedule.dates.push(date);
        } else {
          acc.push({ ...schedule, dates: [date] });
        }
        return acc;
      }, [] as ProgramWithManyDates[]);
    }, [rightSchedules]);

    const mainLocation = user.locations.find((loc) => loc.isMain);

    return (
      <>
        {rightSchedulesMergedByDateAndUserId.map((schedule) => {
          const { city, country } = convertLocationToPlace(schedule.location);

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
                className={"project-card"}
              >
                <Content>
                  <LeftContainer>
                    {schedule.user && (
                      <UserAvatar
                        user={schedule.user}
                        size="medium"
                        showLink={false}
                        showTooltip={false}
                      />
                    )}
                  </LeftContainer>
                  <InformationContainer>
                    <ActionsContainer>
                      {!project.viewed && <Dot className="dot" />}
                    </ActionsContainer>
                    <SubtitleContainer>
                      <p>{project.artist}</p>
                      {!!project.work && <p>{project.work}</p>}
                    </SubtitleContainer>
                    <TitleContainer>
                      <p>{schedule.user?.company}</p>
                    </TitleContainer>
                    <LocationsContainer>
                      <LocationOnOutlinedIcon />
                      <p>
                        {city}, {country}
                        {" - "}
                        <DistanceContainer>
                          {getDistance(
                            mainLocation?.location,
                            schedule.location,
                          )}{" "}
                          km
                        </DistanceContainer>
                      </p>
                    </LocationsContainer>
                    <DatesContainer>
                      <CalendarMonthOutlinedIcon />{" "}
                      {humanizeMultipleDates(schedule.dates, i18n)}
                    </DatesContainer>
                  </InformationContainer>
                </Content>
              </Container>
            </SuperContainer>
          );
        })}
      </>
    );
  },
);

ArtisticTeamProjectCard.displayName = "ArtisticTeamProjectCard";

export default ArtisticTeamProjectCard;
