import { ProgramStatuses, Project, Tour, User } from "@cooprog/core";
import styled from "@emotion/styled";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import { useTranslation } from "next-i18next";
import Link from "next/link";
import { forwardRef, MouseEventHandler } from "react";
import Button from "../Button";
import useUser from "../authentication/useUser";
import humanizeDateRange from "./humanizeDateRange";
import ProjectParticipantList from "./ParticipantList";
import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined";
import AvoidedCO2 from "./AvoidedCO2";
import { useRouter } from "next/router";

interface TourCardProps {
  project: Project;
  tour: Tour;
  accessUserPage: boolean;
  onClick?: MouseEventHandler<HTMLAnchorElement>;
}

const TourBullet = styled.div`
  font-size: 12px;
  padding: 8px;
  height: 47px;
  width: 47px;
  border: 2px solid;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0.8;
`;

const SuperContainer = styled.div`
  display: flex;
  position: relative;
  text-decoration: none;
  max-width: 300px;
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
  border: 2px solid transparent;

  &.selected {
    background: #fff5e8;
  }

  &.user-participates {
    border-color: var(--color-orange);
    box-shadow: 0 0 8px 0 rgba(255, 116, 70, 0.3);
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
  font-weight: bold;
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

const AvoidedCO2Container = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #123036;
  margin-top: 8px;
  margin-bottom: 8px;
`;

const ExtraInfoContainer = styled.div`
  display: flex;
  gap: 4px;
  margin-top: 8px;
  margin-bottom: 16px;
  flex-direction: column;

  > div {
    cursor: pointer;
    font-size: 12px;
  }

  > p {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 12px;
    color: #123036;
    margin-bottom: 8px;

    svg {
      font-size: 14px;
    }
  }
`;

const LeftContainer = styled.div`
  display: flex;
  flex-direction: column;
  flex-grow: 0;
  justify-content: space-between;
`;

const TourCard = forwardRef<HTMLAnchorElement, TourCardProps>(
  ({ project, tour, onClick, accessUserPage }, ref) => {
    const { t, i18n } = useTranslation();
    const { user } = useUser();
    const { name, start, end, archived } = tour;
    const router = useRouter();

    if (!user) return null;

    const userParticipates = tour.users?.some(
      (tourUser) => tourUser?._id === user._id
    );

    return (
      <SuperContainer>
        <Container
          id={`project-card-${project._id}`}
          className={`project-card${
            userParticipates ? " user-participates" : ""
          }`}
        >
          <Content>
            <LeftContainer>
              <TourBullet
                style={{
                  backgroundColor: tour.color,
                  borderColor: `oklch(from ${tour.color} calc(l - .2) c h)`,
                }}
              />
            </LeftContainer>
            <InformationContainer>
              <TitleContainer>
                <p>{name}</p>
              </TitleContainer>
              <DatesContainer>
                <CalendarMonthOutlinedIcon />{" "}
                {start && <>{humanizeDateRange(start, end || null, i18n)}</>}
              </DatesContainer>
              {tour.users.length > 0 && (
                <ExtraInfoContainer>
                  <p>
                    <PersonOutlinedIcon />
                    {t("projects:tours.card.attendees", {
                      count: tour.users.length,
                    })}
                  </p>
                  <ProjectParticipantList
                    users={tour.users}
                    accessUserPage={accessUserPage}
                    size="small"
                    projectId={project._id}
                    tourId={tour._id}
                  />
                </ExtraInfoContainer>
              )}
              <AvoidedCO2Container>
                <AvoidedCO2
                  project={project}
                  tour={tour}
                  size="small"
                  onClick={() => {
                    router.push(
                      `/projects/${project._id}/tours/${tour._id}${
                        tour.archived ? "" : "#co2"
                      }`
                    );
                  }}
                />
              </AvoidedCO2Container>
              <Link
                href={`/projects/${project._id}/tours/${tour._id}`}
                style={{ textDecoration: "none" }}
              >
                <Button
                  variant={archived ? "outlined" : "contained"}
                  color={"primary"}
                  fullWidth
                >
                  {t("projects:tours.card.view")}
                </Button>
              </Link>
            </InformationContainer>
          </Content>
        </Container>
      </SuperContainer>
    );
  }
);

TourCard.displayName = "TourCard";

export default TourCard;
