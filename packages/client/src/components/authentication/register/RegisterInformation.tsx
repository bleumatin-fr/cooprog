import { ContactDialog } from "@/components/layout/Contact";
import Markdown from "@/components/UI/Markdown";
import RoundButton from "@/components/UI/RoundButton";
import styled from "@emotion/styled";
import { useTranslation } from "next-i18next";
import { useState } from "react";
import {
  Box,
  ToggleButton,
  ToggleButtonGroup,
  FormHelperText,
} from "@mui/material";
import { Role } from "@cooprog/core";
import StarIcon from "@mui/icons-material/Star";
import FestivalIcon from "@mui/icons-material/Festival";
import { FormikErrors, FormikTouched } from "formik";

const TextContainer = styled.div`
  max-width: 80%;
  margin: 20px auto;

  p {
    text-align: center !important;
  }
`;

const AccountTypeGroup = styled(ToggleButtonGroup)`
  display: flex;
  gap: 8px;
  background: transparent;
  position: relative;
  padding: 0;
  border: none;
  height: 56px;
  width: 100%;
  overflow: hidden;
  max-width: 450px;
  margin: 20px auto;
`;

const SelectedBackground = styled.div<{ selectedIndex: number }>`
  position: absolute;
  top: 0;
  left: ${({ selectedIndex }) => selectedIndex * 50}%;
  margin-left: ${({ selectedIndex }) => 8 * selectedIndex}px;
  width: calc(50% - 12px);
  height: 100%;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: left 0.3s ease-in-out;
  z-index: 0;
`;

const AccountTypeButton = styled(ToggleButton)<{ error?: boolean }>`
  position: relative;
  width: calc(50% - 6px);
  border: 2px solid
    ${({ error }) => (error ? "var(--mui-palette-error-main)" : "#e0e0e0")} !important;
  border-radius: 8px !important;
  height: 56px !important;
  padding: 6px 14px !important;
  margin: 0 !important;
  color: #666 !important;
  transition: all 0.3s ease-in-out !important;
  overflow: hidden;
  background: transparent !important;
  flex-shrink: 0;

  &.Mui-selected {
    border-color: #ff6b6b !important;
    color: #333 !important;
    font-weight: 600;
    background-color: rgba(255, 255, 255, 0.9) !important;
  }

  .icon-background {
    position: absolute;
    top: -20px;
    left: -20px;
    width: 120px;
    height: 120px;
    opacity: 0.1;
    transform: scale(0.6);
    transition: all 0.3s ease-in-out;
  }

  &.Mui-selected .icon-background {
    opacity: 0.15;
    transform: scale(1.1);
  }

  span {
    position: relative;
    z-index: 1;
  }
`;

interface RegisterInformationValues {
  accountType: Role | undefined;
}

interface RegisterInformationProps {
  value: RegisterInformationValues;
  onChange: (values: RegisterInformationValues) => void;
  touched: FormikTouched<RegisterInformationValues>;
  errors: FormikErrors<RegisterInformationValues>;
}

const RegisterInformation = ({
  value,
  onChange,
  touched,
  errors,
}: RegisterInformationProps) => {
  const [contactOpen, setContactOpen] = useState(false);
  const { t } = useTranslation();

  const handleAccountTypeChange = (
    _: React.MouseEvent<HTMLElement>,
    newValue: Role,
  ) => {
    onChange({ ...value, accountType: newValue });
  };

  const getSelectedIndex = (values: RegisterInformationValues): number => {
    switch (values.accountType) {
      case Role.DIFFUSION_STRUCTURE:
        return 0;
      case Role.ARTISTIC_TEAM:
        return 1;
      default:
        return -1;
    }
  };

  return (
    <div>
      <ContactDialog
        open={contactOpen}
        handleClose={() => setContactOpen(false)}
      />
      <TextContainer>
        <Markdown>{t("authentication:register.information")}</Markdown>
      </TextContainer>

      <AccountTypeGroup
        value={value.accountType}
        exclusive
        onChange={handleAccountTypeChange}
        aria-label="account type"
      >
        <SelectedBackground selectedIndex={getSelectedIndex(value)} />
        <AccountTypeButton
          value={Role.DIFFUSION_STRUCTURE}
          error={touched.accountType && Boolean(errors.accountType)}
        >
          <Box>
            <FestivalIcon
              className="icon-background"
              sx={{ color: "#ff6b6b", fontSize: 120 }}
            />
            <span>
              {t("authentication:register.account-type.diffusion-structure")}
            </span>
          </Box>
        </AccountTypeButton>
        <AccountTypeButton
          value={Role.ARTISTIC_TEAM}
          error={touched.accountType && Boolean(errors.accountType)}
        >
          <Box>
            <StarIcon
              className="icon-background"
              sx={{ color: "#ff6b6b", fontSize: 120 }}
            />
            <span>
              {t("authentication:register.account-type.artistic-team")}
            </span>
          </Box>
        </AccountTypeButton>
      </AccountTypeGroup>
      {touched.accountType && errors.accountType && (
        <FormHelperText error sx={{ textAlign: "center", marginTop: 1 }}>
          {errors.accountType}
        </FormHelperText>
      )}

      <TextContainer>
        <Markdown>{t("authentication:register.what-is-cooprog")}</Markdown>
      </TextContainer>
      {value.accountType === Role.DIFFUSION_STRUCTURE && (
        <TextContainer>
          <Markdown>
            {t("authentication:register.information-diffusion-structure")}
          </Markdown>
        </TextContainer>
      )}
    </div>
  );
};

export default RegisterInformation;
