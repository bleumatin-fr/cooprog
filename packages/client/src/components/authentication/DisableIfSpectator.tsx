import { Tooltip } from "@mui/material";
import { useTranslation } from "next-i18next";
import useUser from "./useUser";

interface DisableIfSpectatorProps {
  children: (disabled: boolean) => React.ReactNode;
}

const DisableIfSpectator = ({ children }: DisableIfSpectatorProps) => {
  const { user } = useUser();
  const { t } = useTranslation();

  if (user?.role === "spectator") {
    return (
      <Tooltip title={t("common:spectator.tooltip-message")}>
        <span>{children(true)}</span>
      </Tooltip>
    );
  }

  return <>{children(false)}</>;
};

export default DisableIfSpectator;
