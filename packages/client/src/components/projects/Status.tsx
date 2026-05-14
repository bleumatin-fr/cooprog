import { Program, Project } from "@cooprog/core";
import styled from "@emotion/styled";
import DoneIcon from "@mui/icons-material/Done";
import { Chip } from "@mui/material";
import { useTranslation } from "next-i18next";
import { useMemo } from "react";

interface StatusProps {
  project: Project;
  type: "favorited" | "pending" | "confirmed";
  checked: boolean;
  hideIfZero?: boolean;
}

const StatusContainer = styled.div`
  --mui-palette-primary-main: var(
    --${({ type }: { type: string }) => type}-background-color
  );
  --mui-palette-primary-contrastText: var(
    --${({ type }: { type: string }) => type}-color
  );
`;

const Status = ({
  project,
  type,
  checked,
  hideIfZero = false,
}: StatusProps) => {
  const { t } = useTranslation();

  const allSchedules = useMemo(() => {
    return project.tours?.reduce((acc, tour) => {
      if (!tour.schedule) {
        return acc;
      }
      return [...acc, ...tour.schedule];
    }, [] as Program[]);
  }, [project.tours]);

  const count = useMemo(() => {
    if (type === "favorited") return project.favoritedBy?.length || 0;
    return (
      allSchedules?.filter((program) => {
        return program.status === type;
      }).length || 0
    );
  }, [allSchedules, project.favoritedBy?.length, type]);

  if (hideIfZero && count === 0) return null;

  return (
    <StatusContainer type={type}>
      <Chip
        label={t(`projects:statuses.${type}`, { count })}
        deleteIcon={checked ? <DoneIcon /> : undefined}
        onDelete={checked ? () => {} : undefined}
        color="primary"
      />
    </StatusContainer>
  );
};

export default Status;
