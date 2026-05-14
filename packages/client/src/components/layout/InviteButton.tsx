import PersonAddIcon from "@mui/icons-material/PersonAdd";
import { IconButton, Tooltip } from "@mui/material";
import { useTranslation } from "next-i18next";
import { useState } from "react";
import DisableIfSpectator from "../authentication/DisableIfSpectator";
import useRights, { Actions } from "../structures/useRights";
import useUser from "../authentication/useUser";
import InviteDialog from "./InviteDialog";

const InviteButton = () => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const { user } = useUser();
  const { can } = useRights({ user });

  if (!can(Actions.USERS_INVITE)) {
    return null;
  }

  const handleOpen = (event: React.MouseEvent<HTMLElement>) => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <>
      <DisableIfSpectator>
        {(disabled) => (
          <IconButton
            onClick={handleOpen}
            color="secondary"
            disabled={disabled}
          >
            <Tooltip
              title={
                disabled ? undefined : t("common:dialogs.invite-people.tooltip")
              }
            >
              <PersonAddIcon />
            </Tooltip>
          </IconButton>
        )}
      </DisableIfSpectator>

      <InviteDialog open={open} onClose={handleClose} />
    </>
  );
};

export default InviteButton;
