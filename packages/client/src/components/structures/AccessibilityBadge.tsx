import styled from "@emotion/styled";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import StarIcon from "@mui/icons-material/Star";
import StarHalfIcon from "@mui/icons-material/StarHalf";
import { Tooltip } from "@mui/material";
import { useTranslation } from "next-i18next";
const BadgeContainer = styled.div``;

interface AccessibilityBadgeProps {
  isFollowing?: boolean;
  isFollower?: boolean;
  isSelf?: boolean;
  showLabels?: boolean;
}

const Container = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  justify-content: center;
`;

const Label = styled.span`
  font-size: 12px;
`;

const AccessibilityBadge = ({
  isFollowing,
  isFollower,
  isSelf,
  showLabels = false,
}: AccessibilityBadgeProps) => {
  const { t } = useTranslation();
  const displaySelf = isSelf;
  const displayFollowEachother = isFollowing && isFollower && !isSelf;
  const displayFollowing = !displayFollowEachother && isFollowing && !isSelf;
  const displayFollower = !displayFollowEachother && isFollower && !isSelf;
  return (
    <BadgeContainer>
      {displayFollowEachother && (
        <Tooltip
          placement="right"
          title={showLabels ? "" : t("users:explanations.follow-eachother")}
        >
          <Container>
            <StarIcon htmlColor="var(--color-light-orange)" fontSize="small" />
            {showLabels && (
              <Label>{t("users:explanations.follow-eachother")}</Label>
            )}
          </Container>
        </Tooltip>
      )}
      {displayFollowing && (
        <Tooltip
          placement="right"
          title={showLabels ? "" : t("users:explanations.you-follow")}
        >
          <Container>
            <StarHalfIcon
              htmlColor="var(--color-light-orange)"
              fontSize="small"
            />
            {showLabels && <Label>{t("users:explanations.you-follow")}</Label>}
          </Container>
        </Tooltip>
      )}
      {displayFollower && (
        <Tooltip
          placement="right"
          title={showLabels ? "" : t("users:explanations.they-follow")}
        >
          <Container>
            <StarHalfIcon
              htmlColor="var(--color-light-orange)"
              fontSize="small"
              sx={{
                transform: "rotateY(180deg)",
              }}
            />
            {showLabels && <Label>{t("users:explanations.they-follow")}</Label>}
          </Container>
        </Tooltip>
      )}
      {displaySelf && (
        <Tooltip
          placement="right"
          title={showLabels ? "" : t("users:explanations.you")}
        >
          <Container>
            <AccountCircleIcon
              htmlColor="var(--color-orange)"
              fontSize="small"
            />
            {showLabels && <Label>{t("users:explanations.you")}</Label>}
          </Container>
        </Tooltip>
      )}
    </BadgeContainer>
  );
};

export default AccessibilityBadge;
