import styled from "@emotion/styled";
import { useTranslation } from "next-i18next";
import CancelIcon from "@mui/icons-material/Cancel";
import { Program } from "@cooprog/core";
import { CircularProgress, Tooltip } from "@mui/material";
import { useState, MouseEvent } from "react";

const Container = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  padding-right: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const SubContainer = styled.div`
  position: absolute;
  right: 5px;

  & svg,
  & span {
    font-size: 1rem;
    cursor: pointer;
    transition: fill 0.3s;
    fill: var(--button-secondary-background-color);

    &:hover {
      fill: var(--button-primary-hover-color);
    }
  }
`;

interface WishedCellProps {
  programs?: Program[];
  unschedule: (id: string) => Promise<void> | void;
  canEdit?: boolean;
  canSchedule?: boolean;
}

const WishedCell = ({
  programs,
  unschedule,
  canEdit,
  canSchedule,
}: WishedCellProps) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);

  if (!programs?.length) {
    return null;
  }

  const programId = programs?.length ? programs[0]?._id : undefined;

  const handleClick = async (e: MouseEvent) => {
    if (loading || !programId) {
      return;
    }
    setLoading(true);
    await unschedule(programId);
    setTimeout(() => setLoading(false), 1000);
  };

  return (
    <Container>
      <span>{t("projects:tours.planning.wished")}</span>
      <SubContainer>
        {canEdit && programId && (
          <Tooltip
            title={t("projects:tours.planning.unschedule")}
            disableInteractive
          >
            {loading ? (
              <CircularProgress size="16px" />
            ) : (
              <CancelIcon onClick={handleClick} />
            )}
          </Tooltip>
        )}
      </SubContainer>
    </Container>
  );
};

export default WishedCell;
