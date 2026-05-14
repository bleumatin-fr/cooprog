import { Discipline, StructureType, User } from "@cooprog/core";

import styled from "@emotion/styled";
import DirectionsWalkIcon from "@mui/icons-material/DirectionsWalk";
import FestivalIcon from "@mui/icons-material/Festival";
import HomeIcon from "@mui/icons-material/Home";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import { Chip, Tooltip } from "@mui/material";
import { useTranslation } from "next-i18next";
import Link from "next/link";
import { forwardRef, MouseEventHandler, useMemo } from "react";
import {
  Content,
  DistanceContainer,
  getCity,
  InformationContainer,
  LocationsContainer,
} from "../projects/ProjectCard";
import AccessibilityBadge from "./AccessibilityBadge";
import UserAvatar from "./UserAvatar";
import useRights, { Actions } from "./useRights";
import useUser from "../authentication/useUser";

const Container = styled.a`
  box-shadow: 0 0 4px 0 rgba(0, 0, 0, 0.1);
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

const TitleContainer = styled.div`
  margin-right: 6px;
  font-weight: bold;
  height: 40px;
  display: flex;
  flex-direction: column;
  justify-content: center;
`;

export const CompanyContainer = styled.div`
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

export const AccessibilityBadgeContainer = styled.div`
  position: absolute;
  top: 0;
  right: 0;
`;

export const ProgrammingInfoContainer = styled.div`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 8px;
`;

interface UserCardProps {
  user: User;
  work?: string;
  onMouseEnter?: MouseEventHandler<HTMLAnchorElement>;
  onMouseLeave?: MouseEventHandler<HTMLAnchorElement>;
  selected?: boolean;
  hrefOverride?: string;
  disabled?: boolean;
}

const UserCard = forwardRef<HTMLAnchorElement, UserCardProps>(
  (
    {
      user,
      onMouseEnter,
      onMouseLeave,
      selected,
      work,
      hrefOverride,
      disabled,
    },
    ref,
  ) => {
    const { t } = useTranslation();
    const { user: currentUser } = useUser();
    const { can } = useRights({ user: currentUser });

    if (!user) return null;

    const color = user.color || "#ff7446";

    const hasMusiquesActuelles = user.programmingDisciplines?.includes(
      Discipline.MUSIC,
    );

    const getStructureTypeIcon = useMemo(() => {
      return (type: StructureType) => {
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
    }, []);

    const getStructureTypeLabel = (structureType: StructureType) => {
      switch (structureType) {
        case StructureType.VENUE:
          return t("users:structureTypes.venue");
        case StructureType.FESTIVAL:
          return t("users:structureTypes.festival");
        case StructureType.ITINERANT:
          return t("users:structureTypes.itinerant");
        default:
          return "";
      }
    };

    // Vérifier si les conditions sont remplies pour afficher les types de structure
    const hasStructureTypes =
      Array.isArray(user.structureTypes) && user.structureTypes.length > 0;
    const shouldShowStructures = hasMusiquesActuelles && hasStructureTypes;

    const mainLocation = user.locations?.find((location) => location.isMain);

    return (
      <Container
        as={disabled ? "div" : Link}
        href={hrefOverride || `/users/${user._id}`}
        className={"user-card" + (selected ? " selected" : "")}
        data-testid="user-card"
        ref={ref}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      >
        <Content>
          <UserAvatar
            user={user}
            size="medium"
            showLink={false}
            showTooltip={false}
          />
          <InformationContainer>
            <TitleContainer>
              {work && <span>{`${work} @ `}</span>}
              {user.company || t("users:no-company")}
            </TitleContainer>
            <AccessibilityBadgeContainer>
              <AccessibilityBadge {...user.accessInformation} />
            </AccessibilityBadgeContainer>

            {mainLocation && (
              <LocationsContainer>
                <LocationOnOutlinedIcon />
                <p>
                  <span>{`${getCity(mainLocation.location) || ""}`}</span>
                  {" - "}
                  <DistanceContainer>
                    {Math.round(user.distance || 0)} km
                  </DistanceContainer>
                </p>
              </LocationsContainer>
            )}

            {user.profiles?.map((profile, index) => (
              <CompanyContainer key={index}>
                <PersonOutlineIcon />
                {profile.firstName} {profile.lastName}
              </CompanyContainer>
            ))}

            {/* Affichage des types de structure (maximum 3) */}
            {shouldShowStructures && (
              <ProgrammingInfoContainer>
                {(user.structureTypes as StructureType[])
                  .slice(0, 3)
                  .map((type) => (
                    <Tooltip
                      key={type}
                      title={getStructureTypeLabel(type as StructureType)}
                    >
                      <Chip
                        size="small"
                        icon={getStructureTypeIcon(type as StructureType)}
                        label={getStructureTypeLabel(type as StructureType)}
                        color="primary"
                        variant="outlined"
                      />
                    </Tooltip>
                  ))}
              </ProgrammingInfoContainer>
            )}
          </InformationContainer>
        </Content>
      </Container>
    );
  },
);

UserCard.displayName = "UserCard";

export default UserCard;
