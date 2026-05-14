import { ButtonProps, Tooltip } from "@mui/material";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import PersonIcon from "@mui/icons-material/Person";
import ActionButton from "./ActionButton";
import { useState, MouseEvent, useRef } from "react";
import { User } from "@cooprog/core";
import AddDateForOthersDialog from "../../AddDateForOthersDialog";
import styled from "@emotion/styled";
import BaseButton from "@/components/UI/Button";
import { IconButtonProps } from "@mui/material";
import { useTranslation } from "next-i18next";

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

interface AddDateForOthersButtonButtonProps
  extends Omit<ButtonProps, "onClick"> {
  tooltip?: string;
  onClick?: (
    e: MouseEvent<HTMLButtonElement>,
    user: Partial<User> | null,
    customMessage?: string
  ) => Promise<void> | void;
  showLabel?: boolean;
  onClose?: () => void;
}

const AddDateForOthersButton = ({
  onClick,
  tooltip,
  showLabel = false,
  onClose,
  ...rest
}: AddDateForOthersButtonButtonProps) => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const event = useRef<MouseEvent<HTMLButtonElement>>(null);

  if (showLabel) {
    return (
      <>
        <AddDateForOthersDialog
          open={open}
          onClose={() => {
            setOpen(false);
            if (onClose) {
              onClose();
            }
          }}
          onSubmit={async (user: Partial<User>, customMessage?: string) => {
            if (!onClick) {
              return;
            }
            await onClick(event.current!, user, customMessage);
          }}
        />
        <Tooltip
          title={t(
            "projects:tours.planning.actions.add-confirmed-date-tooltip"
          )}
          disableInteractive
        >
          <ActionButtonWithLabel
            size="small"
            sx={{
              color: "var(--color-orange)",
              borderColor: "var(--color-orange)",
            }}
            onClick={(e) => {
              event.current = e;
              setOpen(true);
            }}
            {...rest}
          >
            <IconsContainer>
              <CalendarTodayIcon />
              <PersonIcon />
            </IconsContainer>
            {t("projects:tours.planning.actions.add-confirmed-date")}
          </ActionButtonWithLabel>
        </Tooltip>
      </>
    );
  }

  return (
    <>
      <AddDateForOthersDialog
        open={open}
        onClose={() => setOpen(false)}
        onSubmit={async (user: Partial<User>, customMessage?: string) => {
          if (!onClick) {
            return;
          }
          await onClick(event.current!, user, customMessage);
        }}
      />
      <Tooltip title={tooltip} disableInteractive>
        <ActionButton
          size="small"
          sx={{
            color: "var(--color-orange)",
            borderColor: "var(--color-orange)",
            marginLeft: "4px",
          }}
          onClick={(e) => {
            event.current = e;
            setOpen(true);
          }}
          {...rest}
          data-testid="add-confirmed-date-for-others-button"
        >
          <CalendarTodayIcon />
          <PersonIcon />
        </ActionButton>
      </Tooltip>
    </>
  );
};

export default AddDateForOthersButton;
