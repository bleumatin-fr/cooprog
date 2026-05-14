import { Project, Tour } from "@cooprog/core";
import styled from "@emotion/styled";
import { useTranslation } from "next-i18next";
import { useMemo } from "react";
import Image from "next/image";
import { useSnackbar } from "notistack";
import leafIcon from "../UI/icons/leaf.svg";
import { useProjectAvoidedCO2, useTourAvoidedCO2 } from "./useAvoidedCO2";
import { formatCO2 } from "./co2Utils";
import { darken } from "@mui/material";

type Size = "small" | "medium" | "large";

const StatusContainer = styled.div`
  --mui-palette-primary-main: var(--color-light-green);
  --mui-palette-primary-contrastText: var(--color-white);

  svg {
    fill: white;
  }
`;

const AvoidedCO2Title = styled.div<{ size: Size }>`
  background: #028868;
  color: #fff;
  border-radius: 20px;
  padding: ${({ size }) => {
    switch (size) {
      case "small":
        return "4px 8px";
      case "large":
        return "10px 32px";
      default: // medium
        return "6px 16px";
    }
  }};
  align-self: center;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.07);
  display: inline-flex;
  flex-direction: row;
  align-items: center;
  gap: ${({ size }) => {
    switch (size) {
      case "small":
        return "4px";
      case "large":
        return "12px";
      default: // medium
        return "8px";
    }
  }};
  width: 100%;
  justify-content: center;
  cursor: pointer;
  transition: background-color 0.2s ease;

  &:hover {
    background: ${darken("#028868", 0.1)};
  }
`;

const TitleIcon = styled.span<{ size: Size }>`
  display: flex;
  align-items: center;
  margin-right: ${({ size }) => {
    switch (size) {
      case "small":
        return "2px";
      case "large":
        return "6px";
      default: // medium
        return "6px";
    }
  }};
`;

const TitleNumber = styled.span<{ size: Size }>`
  font-size: ${({ size }) => {
    switch (size) {
      case "small":
        return "0.875rem";
      case "large":
        return "2.2rem";
      default: // medium
        return "1.3rem";
    }
  }};
  font-weight: bold;
  line-height: ${({ size }) => {
    switch (size) {
      case "small":
        return "1";
      case "large":
        return "1.1";
      default: // medium
        return "1";
    }
  }};
  white-space: nowrap;
`;

const TitleLabel = styled.span<{ size: Size }>`
  font-size: ${({ size }) => {
    switch (size) {
      case "small":
        return "0.75rem";
      case "large":
        return "1.1rem";
      default: // medium
        return "1rem";
    }
  }};
  font-weight: 400;
  margin-top: 0;
`;

interface AvoidedCO2Props {
  project: Project;
  size?: Size;
  tour?: Tour;
  avoided?: boolean;
  onClick?: () => void;
}

const AvoidedCO2 = ({
  project,
  tour,
  size = "medium",
  onClick,
}: AvoidedCO2Props) => {
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();

  const { totalAvoidedCO2Tons: projectTotalAvoidedCO2Tons } =
    useProjectAvoidedCO2(project);
  const { totalAvoidedCO2Tons: tourTotalAvoidedCO2Tons } =
    useTourAvoidedCO2(tour);

  const totalAvoidedCO2Tons = !!tour
    ? tourTotalAvoidedCO2Tons
    : projectTotalAvoidedCO2Tons;
  if (totalAvoidedCO2Tons <= 0) return null;

  const iconSize = size === "small" ? 12 : size === "large" ? 22 : 18;

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      enqueueSnackbar(t("projects:avoided-co2-simulator.click-notification"), {
        variant: "info",
      });
    }
  };
  return (
    <StatusContainer>
      <AvoidedCO2Title size={size} onClick={handleClick}>
        <TitleIcon size={size}>
          <Image
            src={leafIcon}
            width={iconSize}
            height={iconSize}
            alt="Leaf icon"
            style={{ marginRight: 2, verticalAlign: "middle" }}
            priority
          />
        </TitleIcon>
        <TitleNumber size={size}>
          {formatCO2(totalAvoidedCO2Tons * 1000)}
        </TitleNumber>
        <TitleLabel size={size}>
          {t("projects:avoided-co2-simulator.section-title-label")}
        </TitleLabel>
      </AvoidedCO2Title>
    </StatusContainer>
  );
};

export default AvoidedCO2;
