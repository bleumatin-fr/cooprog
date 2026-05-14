import { IconButton } from "@mui/material";

import MapIcon from "@mui/icons-material/Map";
import { useTranslation } from 'next-i18next'
const ShowMapSwitcher = ({
  value,
  onChange,
}: {
  value: boolean;
  onChange: (value: boolean) => void;
}) => {
  const { t } = useTranslation();
  return (
    <IconButton
      color={value ? "secondary" : "default"}
      onClick={() => {
        onChange(!value);
      }}
      title={value ? t("common:filters.hide-map") :t("common:filters.show-map") }
    >
      <MapIcon />
    </IconButton>
  );
};

export default ShowMapSwitcher;
