import UserPill from "@/components/structures/UserPill";
import { Location, Program, ProgramStatuses, User } from "@cooprog/core";
import styled from "@emotion/styled";
import {
  Button,
  ButtonProps,
  CircularProgress,
  IconButton,
  IconButtonProps,
  Tooltip,
} from "@mui/material";
import Dialog, {
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@/components/UI/Dialog";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import FavoriteIcon from "@mui/icons-material/Favorite";
import AddIcon from "@mui/icons-material/Add";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import CloseIcon from "@mui/icons-material/Close";
import { useState, MouseEvent } from "react";
import { useTranslation } from "next-i18next";
import clsx from "clsx";
import useUser from "@/components/authentication/useUser";
import BaseButton from "@/components/UI/Button";
import AddDateForOthersButton from "./buttons/AddDateForOthersButton";
import { Spacer } from "./buttons/ActionButton";

const Container = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  position: relative;
  height: 100%;

  & > div:last-of-type {
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.3s;
  }

  &.visible > div:last-of-type,
  &.loading > div:last-of-type {
    opacity: 1;
    pointer-events: all;
  }
`;

const ActionContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
  position: absolute;
  top: 0;
  // right: 20px;
  bottom: 0;
  // left: 20px;
  padding: 0.5rem;
`;
const ButtonGroup = styled.div`
  display: flex;
  align-items: center;
  border-radius: 22px;
  border: 1px solid var(--color-orange);
  background-color: var(--color-white);

  gap: 0.5rem;
  padding: 0 0.5rem;

  & > div:last-of-type {
    display: none;
  }
`;

const ActionButton = styled(IconButton)<IconButtonProps>`
  position: relative;
  text-transform: none;

  & svg:nth-of-type(1) {
    font-size: 22px;
  }

  & svg:nth-of-type(2) {
    position: absolute;
    top: 12px;
    font-size: 12px;
    right: 0;
    bottom: 0;
    left: 9px;
    width: 0.9rem;
  }
`;

const PlaceholderContainer = styled.div`
  position: absolute;
  width: 100%;
`;

interface PlanningButtonProps extends Omit<ButtonProps, "onClick"> {
  onClick?: (event: MouseEvent<HTMLButtonElement>) => Promise<void> | void;
  showLabel?: boolean;
}

const ActionButtonWithLabel = styled(BaseButton)<IconButtonProps>`
  border-radius: 22px;
  padding-left: 0.5rem;
  padding-right: 0.5rem;
  background-color: var(--color-white);
  text-transform: none;
  line-height: 1.2;

  &:hover {
    background-color: var(--color-light-gray);
  }
`;

const IconsContainer = styled.div`
  position: relative;
  width: 25px;
  height: 22px;
  margin-top: -1px;
  flex-shrink: 0;

  & svg:nth-of-type(1) {
    position: absolute;
    font-size: 22px;
    top: 0;
    left: 0;
    bottom: 0;
  }

  & svg:nth-of-type(2) {
    position: absolute;
    top: 1px;
    right: 0;
    bottom: 0;
    left: 4px;
    width: 0.9rem;
  }
`;

const AddConfirmedDateButton = ({
  onClick,
  showLabel = false,
  ...rest
}: PlanningButtonProps) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);

  const handleClick = async (event: MouseEvent<HTMLButtonElement>) => {
    if (!onClick) return;
    setLoading(true);
    await onClick(event);
    setTimeout(() => setLoading(false), 1000);
  };

  if (showLabel) {
    return (
      <Tooltip
        title={t("projects:tours.planning.actions.add-confirmed-date-tooltip")}
        disableInteractive
      >
        <ActionButtonWithLabel
          size="small"
          sx={{
            color: "var(--color-orange)",
            borderColor: "var(--color-orange)",
          }}
          onClick={handleClick}
          {...rest}
          data-testid="add-confirmed-date-button"
        >
          {loading ? (
            <CircularProgress size="22px" />
          ) : (
            <IconsContainer>
              <CalendarTodayIcon />
              <AddIcon />
            </IconsContainer>
          )}
          {t("projects:tours.planning.actions.add-confirmed-date")}
        </ActionButtonWithLabel>
      </Tooltip>
    );
  }

  return (
    <Tooltip
      title={t("projects:tours.planning.actions.add-confirmed-date-tooltip")}
      disableInteractive
    >
      <ActionButton
        size="small"
        sx={{
          color: "var(--color-orange)",
          borderColor: "var(--color-orange)",
        }}
        onClick={handleClick}
        {...rest}
        data-testid="add-confirmed-date-button"
      >
        {loading ? (
          <CircularProgress size="22px" />
        ) : (
          <>
            <CalendarTodayIcon />
            <AddIcon />
          </>
        )}
      </ActionButton>
    </Tooltip>
  );
};

const AddWishedDateButton = ({ onClick, ...rest }: PlanningButtonProps) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);

  const handleClick = async (event: MouseEvent<HTMLButtonElement>) => {
    if (!onClick) return;
    setLoading(true);
    await onClick(event);
    setTimeout(() => setLoading(false), 1000);
  };

  return (
    <Tooltip
      title={t("projects:tours.planning.actions.add-wished-date")}
      disableInteractive
    >
      <ActionButton
        size="small"
        sx={{
          color: "var(--color-orange)",
          borderColor: "var(--color-orange)",
        }}
        onClick={handleClick}
        {...rest}
        data-testid="add-wished-date-button"
      >
        {loading ? (
          <CircularProgress size="22px" />
        ) : (
          <>
            <CalendarTodayIcon />
            <FavoriteIcon />
          </>
        )}
      </ActionButton>
    </Tooltip>
  );
};

const AddBlockedDateButton = ({
  onClick,
  alert,
  ...rest
}: PlanningButtonProps & {
  alert?: boolean;
}) => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: MouseEvent<HTMLButtonElement>) => {
    if (!onClick) return;
    setLoading(true);
    await onClick(event);
    setTimeout(() => setLoading(false), 1000);
  };

  const handleClick = async (event: React.MouseEvent<HTMLButtonElement>) => {
    if (alert) {
      setOpen(true);
      return;
    }
    await handleSubmit(event);
  };

  return (
    <>
      <Dialog open={open} onClose={() => setOpen(false)} showCloseButton={true}>
        <DialogTitle>
          {t("projects:tours.planning.actions.add-booked-date-modal.title")}
        </DialogTitle>
        <DialogContent>
          <div>
            {t("projects:tours.planning.actions.add-booked-date-modal.content")}
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>
            {t("projects:tours.planning.actions.add-booked-date-modal.cancel")}
          </Button>
          <Button variant="contained" onClick={handleSubmit}>
            {t("projects:tours.planning.actions.add-booked-date-modal.confirm")}
          </Button>
        </DialogActions>
      </Dialog>
      <Tooltip
        title={t("projects:tours.planning.actions.add-booked-date")}
        disableInteractive
      >
        <ActionButton
          size="small"
          sx={{
            color: "var(--color-orange)",
            borderColor: "var(--color-orange)",
            backgroundColor: "var(--color-white)",
          }}
          onClick={handleClick}
          {...rest}
        >
          {loading ? (
            <CircularProgress size="22px" />
          ) : (
            <>
              <CalendarTodayIcon />
              <CloseIcon />
            </>
          )}
        </ActionButton>
      </Tooltip>
    </>
  );
};

const AddUnavailableDateButton = ({
  onClick,
  alert,
  ...rest
}: PlanningButtonProps & {
  alert?: boolean;
}) => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: MouseEvent<HTMLButtonElement>) => {
    if (!onClick) return;
    setLoading(true);
    await onClick(event);
    setTimeout(() => setLoading(false), 1000);
  };

  const handleClick = async (event: React.MouseEvent<HTMLButtonElement>) => {
    if (alert) {
      setOpen(true);
      return;
    }
    await handleSubmit(event);
  };

  return (
    <>
      <Dialog open={open} onClose={() => setOpen(false)} showCloseButton={true}>
        <DialogTitle>
          {t(
            "projects:tours.planning.actions.add-unavailable-date-modal.title"
          )}
        </DialogTitle>
        <DialogContent>
          <div>
            {t(
              "projects:tours.planning.actions.add-unavailable-date-modal.content"
            )}
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>
            {t(
              "projects:tours.planning.actions.add-unavailable-date-modal.cancel"
            )}
          </Button>
          <Button variant="contained" onClick={handleSubmit}>
            {t(
              "projects:tours.planning.actions.add-unavailable-date-modal.confirm"
            )}
          </Button>
        </DialogActions>
      </Dialog>
      <Tooltip
        title={t("projects:tours.planning.actions.add-unavailable-date")}
        disableInteractive
      >
        <ActionButton
          size="small"
          sx={{
            color: "var(--color-orange)",
            borderColor: "var(--color-orange)",
          }}
          onClick={handleClick}
          {...rest}
        >
          {loading ? (
            <CircularProgress size="22px" />
          ) : (
            <>
              <CalendarTodayIcon />
              <CloseIcon />
            </>
          )}
        </ActionButton>
      </Tooltip>
    </>
  );
};

interface PlanningCellProps {
  date: Date;
  programs: Program[];
  placeholder?: React.ReactNode;
  schedule: (
    date: Date,
    status: ProgramStatuses,
    user?: Partial<User> | null,
    location?: Location,
    customMessage?: string
  ) => Promise<void> | void;
  unschedule: (id: string) => Promise<void> | void;

  unavailable?: boolean;
  blocked?: boolean;
  hasConfirmedDates?: boolean;
  hasPendingDates?: boolean;
  wished?: boolean;

  canEdit?: boolean;
  canSchedule?: boolean;
  canBlock?: boolean;
  canWish?: boolean;
  canScheduleForOthers?: boolean;
  canAddUnavailable?: boolean;
  preserveScrollForDate: (dateStr: string) => void;
}

const PlanningCell = ({
  date,
  programs,
  placeholder,
  unavailable,
  blocked,
  hasConfirmedDates,
  hasPendingDates,
  wished,
  schedule,
  unschedule,
  canEdit = false,
  canSchedule = false,
  canBlock = false,
  canWish = false,
  canScheduleForOthers = false,
  canAddUnavailable = false,
  preserveScrollForDate,
}: PlanningCellProps) => {
  const { t } = useTranslation();
  const { user } = useUser();
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleButtonClicked =
    (status: ProgramStatuses, user?: Partial<User>, customMessage?: string) =>
    async () => {
      preserveScrollForDate(date.toISOString().slice(0, 10));
      setLoading(true);
      await schedule(date, status, user, undefined, customMessage);
      setTimeout(() => setLoading(false), 1000);
    };

  const handleDateForOthersButtonClicked = async (
    e: MouseEvent<HTMLButtonElement>,
    user: Partial<User> | null,
    customMessage?: string
  ) => {
    setLoading(true);
    const mainUserLocation = user?.locations?.find(
      (loc) => loc.isMain
    )?.location;
    if (!mainUserLocation) {
      setTimeout(() => setLoading(false), 1000);
      return;
    }
    await schedule(
      date,
      ProgramStatuses.SHOW_CONFIRMED,
      user,
      mainUserLocation,
      customMessage
    );
    setTimeout(() => setLoading(false), 1000);
  };

  const buttons = {
    schedule: !hasConfirmedDates && !unavailable && !blocked && canSchedule,
    scheduleForOthers:
      !hasConfirmedDates && !unavailable && !blocked && canScheduleForOthers,
    wish: !hasConfirmedDates && !unavailable && !blocked && !wished && canWish,
    block: !unavailable && !blocked && canBlock,
    unavailable: false,
  };

  const buttonsCount = Object.values(buttons).filter(Boolean).length;

  return (
    <td>
      <Container
        className={clsx({
          visible,
          loading,
        })}
        onMouseEnter={() => setVisible(true)}
        onMouseLeave={() => setVisible(false)}
        data-testid="planning-cell"
      >
        {!programs?.length && (
          <PlaceholderContainer>{placeholder}</PlaceholderContainer>
        )}
        {!!programs?.length &&
          programs?.map((program) => {
            if (!program.user) return null;
            return (
              <UserPill
                key={program._id}
                user={program.user}
                location={program.location}
                status={program.status}
                onDelete={
                  canEdit || program.user?._id === user?._id
                    ? async (event) => {
                        event.stopPropagation();
                        event.preventDefault();
                        if (!program._id) {
                          return;
                        }
                        await unschedule(program._id);
                      }
                    : undefined
                }
                sx={{
                  backgroundColor: "var(--confirmed-background-color)",
                  color: "var(--confirmed-color)",
                  filter: "brightness(100%)",
                  transition: "filter 0.3s",
                  "&:hover": {
                    filter: "brightness(110%)",
                  },
                }}
              />
            );
          })}
        {!unavailable && !blocked && !programs?.length && (
          <ActionContainer>
            <>
              {buttons.schedule && (
                <AddConfirmedDateButton
                  onClick={handleButtonClicked(ProgramStatuses.SHOW_CONFIRMED)}
                  showLabel
                />
              )}
              {!buttons.schedule && buttons.scheduleForOthers && (
                <AddDateForOthersButton
                  tooltip={t(
                    "projects:tours.planning.actions.add-confirmed-date-for-others-tooltip"
                  )}
                  onClick={handleDateForOthersButtonClicked}
                  onClose={() => setVisible(false)}
                  showLabel
                />
              )}
              {buttons.wish && (
                <AddWishedDateButton
                  onClick={handleButtonClicked(ProgramStatuses.SHOW_WISHED)}
                />
              )}
              {buttons.block && (
                <AddBlockedDateButton
                  alert={hasPendingDates || hasConfirmedDates}
                  onClick={handleButtonClicked(ProgramStatuses.BLOCKED)}
                />
              )}
              {buttons.unavailable && (
                <AddUnavailableDateButton
                  alert={hasPendingDates || hasConfirmedDates}
                  onClick={handleButtonClicked(ProgramStatuses.UNAVAILABLE)}
                />
              )}
              {buttons.schedule && buttons.scheduleForOthers && (
                <AddDateForOthersButton
                  tooltip={t(
                    "projects:tours.planning.actions.add-confirmed-date-for-others-tooltip"
                  )}
                  onClick={handleDateForOthersButtonClicked}
                  onClose={() => setVisible(false)}
                />
              )}
            </>
          </ActionContainer>
        )}
      </Container>
    </td>
  );
};

export default PlanningCell;
