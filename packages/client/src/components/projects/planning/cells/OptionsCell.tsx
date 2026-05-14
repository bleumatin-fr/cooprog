import UserPill from "@/components/structures/UserPill";
import { Location, Program, ProgramStatuses, User } from "@cooprog/core";
import styled from "@emotion/styled";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import AddIcon from "@mui/icons-material/Add";
import {
  ButtonProps,
  CircularProgress,
  IconButtonProps,
  Tooltip,
} from "@mui/material";
import Button from "@/components/UI/Button";
import useUser from "@/components/authentication/useUser";
import { useTranslation } from "next-i18next";
import { useState, MouseEvent } from "react";
import clsx from "clsx";
import AddDateForOthersButton from "./buttons/AddDateForOthersButton";

const Container = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;

  &.visible > div,
  &.loading > div {
    opacity: 1;
  }
`;

const ButtonContainer = styled.div`
  opacity: 0;
  transition: opacity 0.3s;
`;

const IconsContainer = styled.div`
  position: relative;
  width: 25px;
  height: 22px;
  margin-top: -1px;

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

const ActionButton = styled(Button)<IconButtonProps>`
  border-radius: 22px;
  padding-left: 0.5rem;
  padding-right: 0.5rem;
  background-color: var(--color-white);
  text-transform: none;
  line-height: 1.2;
`;

interface AddPendingDateButtonProps extends Omit<ButtonProps, "onClick"> {
  onClick?: (event: MouseEvent<HTMLButtonElement>) => Promise<void> | void;
}

const AddPendingDateButton = ({
  onClick,
  ...rest
}: AddPendingDateButtonProps) => {
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
      title={t("projects:tours.planning.actions.add-option-date-tooltip")}
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
          <IconsContainer>
            <CalendarTodayIcon />
            <AddIcon />
          </IconsContainer>
        )}
        {t("projects:tours.planning.actions.add-option-date")}
      </ActionButton>
    </Tooltip>
  );
};
interface OptionsCellProps {
  date: Date;
  schedule: (
    date: Date,
    status: ProgramStatuses,
    user?: Partial<User> | null,
    location?: Location,
    customMessage?: string
  ) => Promise<void> | void;
  unschedule: (id: string) => Promise<void> | void;
  programs: Program[];
  canEdit?: boolean;
  canSchedule?: boolean;
}

const OptionsCell = ({
  date,
  schedule,
  unschedule,
  programs,
  canEdit = false,
  canSchedule = false,
}: OptionsCellProps) => {
  const { user } = useUser();
  const { t } = useTranslation();
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  const optionAlreadyExists = programs?.some(
    (program) =>
      program.status === ProgramStatuses.SHOW_PENDING &&
      program.user?._id === user?._id
  );

  const handlePendingDateButtonClicked = async () => {
    setLoading(true);
    await schedule(date, ProgramStatuses.SHOW_PENDING);
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
      ProgramStatuses.SHOW_PENDING,
      user,
      mainUserLocation,
      customMessage
    );
    setTimeout(() => setLoading(false), 1000);
  };

  return (
    <td>
      <Container
        className={clsx({
          visible: visible,
          loading: loading,
        })}
        onMouseEnter={() => setVisible(true)}
        onMouseLeave={() => setVisible(false)}
      >
        {programs?.map((program) => {
          return (
            <UserPill
              key={program._id}
              user={program.user}
              location={program.location}
              status={program.status}
              sx={{
                backgroundColor: "var(--pending-background-color)",
                color: "var(--pending-color)",
                filter: "brightness(100%)",
                transition: "filter 0.3s",
                "&:hover": {
                  filter: "brightness(110%)",
                },
              }}
              onDelete={
                canEdit || program.user?._id === user?._id
                  ? async (event) => {
                      event.stopPropagation();
                      event.preventDefault();
                      if (!program._id) {
                        return;
                      }
                      await unschedule(program._id);
                      setVisible(false);
                    }
                  : undefined
              }
            />
          );
        })}
        <ButtonContainer>
          {!optionAlreadyExists && canSchedule && (
            <AddPendingDateButton onClick={handlePendingDateButtonClicked} />
          )}
          {canEdit && (
            <AddDateForOthersButton
              tooltip={t(
                "projects:tours.planning.actions.add-option-date-for-others-tooltip"
              )}
              onClick={handleDateForOthersButtonClicked}
              onClose={() => setVisible(false)}
            />
          )}
        </ButtonContainer>
      </Container>
    </td>
  );
};

export default OptionsCell;
