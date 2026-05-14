import React from "react";
import { useTranslation } from "next-i18next";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import { ButtonContent, CaretIcon, CollapseRow } from "./styles";

interface CollapseButtonProps {
  isCollapsed: boolean;
  onClick: () => void;
  hiddenDays: number;
  isStartCollapse: boolean;
}

const CollapseButton: React.FC<CollapseButtonProps> = ({
  isCollapsed,
  onClick,
  hiddenDays,
  isStartCollapse,
}) => {
  const { t } = useTranslation(["projects"]);

  return (
    <CollapseRow onClick={onClick}>
      <td colSpan={4}>
        <div>
          <CaretIcon>
            {isStartCollapse ? (
              isCollapsed ? (
                <KeyboardArrowUpIcon />
              ) : (
                <KeyboardArrowDownIcon />
              )
            ) : isCollapsed ? (
              <KeyboardArrowDownIcon />
            ) : (
              <KeyboardArrowUpIcon />
            )}
          </CaretIcon>
          <ButtonContent>
            {isStartCollapse
              ? isCollapsed
                ? t("projects:tours.planning.showHiddenStartDays", {
                    days: hiddenDays,
                  })
                : t("projects:tours.planning.hideStartDays")
              : isCollapsed
              ? t("projects:tours.planning.showHiddenEndDays", {
                  days: hiddenDays,
                })
              : t("projects:tours.planning.hideEndDays")}
          </ButtonContent>
          <CaretIcon>
            {isStartCollapse ? (
              isCollapsed ? (
                <KeyboardArrowUpIcon />
              ) : (
                <KeyboardArrowDownIcon />
              )
            ) : isCollapsed ? (
              <KeyboardArrowDownIcon />
            ) : (
              <KeyboardArrowUpIcon />
            )}
          </CaretIcon>
        </div>
      </td>
    </CollapseRow>
  );
};

export default CollapseButton;
