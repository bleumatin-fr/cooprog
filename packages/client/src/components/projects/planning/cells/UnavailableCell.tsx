import styled from "@emotion/styled";
import { useTranslation } from "next-i18next";
import CancelIcon from "@mui/icons-material/Cancel";
import { Program } from "@cooprog/core";
import {
  Button,
  CircularProgress,
  IconButtonProps,
  Tooltip,
} from "@mui/material";
import { useState, MouseEvent } from "react";
import { useRouter } from "next/router";
import EditIcon from "@mui/icons-material/Edit";

const Container = styled.div`
  position: relative;
  width: 100%;
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

const ActionButton = styled(Button)<IconButtonProps>`
  border-radius: 22px;
  padding-left: 0.5rem;
  padding-right: 0.5rem;
  background-color: var(--color-white);
  text-transform: none;

  &:hover {
    background-color: var(--color-light-gray);
  }
`;

const ExtendDaysButtonContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 0.5rem;
`;

interface ExtendDaysButtonProps {
  option: "start" | "end";
  readOnly?: boolean;
  onEdit?: () => void;
}

const ExtendDaysButton = ({
  option,
  readOnly = false,
  onEdit,
}: ExtendDaysButtonProps) => {
  const { t } = useTranslation();
  const router = useRouter();

  return (
    <ExtendDaysButtonContainer>
      <div>{t(`projects:tours.planning.${option}.label`)}</div>
      {!readOnly && (
        <>
          <ActionButton startIcon={<EditIcon />} size="small" onClick={onEdit}>
            {t(`projects:tours.planning.${option}.edit`)}
          </ActionButton>
        </>
      )}
      {readOnly && (
        <div>{t(`projects:tours.planning.${option}.explanation`)}</div>
      )}
    </ExtendDaysButtonContainer>
  );
};

interface UnavailableCellProps {
  label?: string;
  programs?: Program[];
  unschedule: (id: string) => Promise<void> | void;
  canEdit?: boolean;
  extendDateOption?: "start" | "end";
  onEditTour?: () => void;
}

const UnavailableCell = ({
  label,
  unschedule,
  programs,
  canEdit = false,
  extendDateOption,
  onEditTour,
}: UnavailableCellProps) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);

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
    <td colSpan={2}>
      <Container>
        <span>{label}</span>
        {onEditTour && !!extendDateOption && (
          <ExtendDaysButton
            option={extendDateOption}
            readOnly={!canEdit}
            onEdit={onEditTour}
          />
        )}
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
    </td>
  );
};

export default UnavailableCell;
