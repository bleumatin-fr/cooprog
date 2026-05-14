import {
  FormControl,
  MenuItem,
  Select as BaseSelect,
  SelectChangeEvent,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { useTranslation } from "next-i18next";
import setLanguage from "next-translate/setLanguage";

import styled from "@emotion/styled";
import { useEffect } from "react";
import { useAuthentication } from "../authentication/useAuthentication";
import useUser from "../authentication/useUser";
import i18configuration from "../../../next-i18next.config";
const languages = i18configuration.i18n.locales;

const Select = styled(BaseSelect)`
  color: var(--button-secondary-text);
  --button-secondary-background-color: var(--button-secondary-text);

  svg {
    color: var(--button-secondary-text);
  }

  fieldset {
    border-color: var(--button-secondary-background-color) !important;
  }

  &:hover fieldset {
    border-color: var(--button-secondary-background-color) !important;
  }
`;

const LanguageSwitcher = () => {
  const { t, i18n } = useTranslation();
  const { setLanguage: setUserLanguage } = useAuthentication();
  const { user } = useUser({
    useErrorBoundary: false,
  });

  const theme = useTheme();
  const mobile = useMediaQuery(theme.breakpoints.down("sm"));
  const tablet = useMediaQuery(theme.breakpoints.down("md"));
  const laptop = useMediaQuery(theme.breakpoints.down("lg"));

  useEffect(() => {
    if (user && user.language && user.language !== i18n.language) {
      setLanguage(user.language);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const handleChange = (event: SelectChangeEvent<unknown>) => {
    if (user) {
      setUserLanguage(event.target.value as string);
    }
    setLanguage(event.target.value as string);
  };

  if (!languages || !languages.length) return null;

  return (
    <FormControl size="small" color="secondary">
      <Select
        value={i18n.language}
        onChange={handleChange}
        size="small"
        color="secondary"
      >
        {languages.map((language) => (
          <MenuItem key={language} value={language}>
            {mobile || tablet || laptop
              ? t(`common:languages.${language}_short`)
              : t(`common:languages.${language}`)}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export default LanguageSwitcher;
