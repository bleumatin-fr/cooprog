import {
  Avatar,
  Button,
  ButtonGroup,
  Checkbox,
  FormControlLabel,
  FormLabel,
  TextField,
} from "@mui/material";
import { ProgramStatuses, Role, User } from "@cooprog/core";
import { useTranslation } from "next-i18next";
import AddressAutocomplete from "@/components/UI/AddressAutocomplete";
import PeopleIcon from "@mui/icons-material/People";
import styled from "@emotion/styled";
import EventIcon from "@mui/icons-material/Event";

const UserFormContainer = styled.div`
  display: flex;
  flex-direction: row;
  gap: 8px;
  width: 100%;
  margin-top: 16px;
`;

const FormContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
`;

interface UserFormProps<T> {
  user: Partial<User>;
  onChange: (user: Partial<User>, role?: T) => void;
  disabled?: boolean;
  touched?: boolean;
  errors?: any;
  entity?: "project" | "tour";
  required?: {
    company: boolean;
    email: boolean;
    firstName: boolean;
    lastName: boolean;
    location: boolean;
  };
  shouldInvite?: boolean;
  namePrefix?: string;
}

const UserForm = <T extends Role | ProgramStatuses>({
  user,
  onChange,
  disabled,
  touched,
  errors,
  entity,
  required,
  shouldInvite = true,
  namePrefix = "",
}: UserFormProps<T>) => {
  const { t } = useTranslation();

  const handleFieldChange = (field: string) => (e: any) => {
    onChange({
      ...user,
      [field]: e.target.type === "checkbox" ? e.target.checked : e.target.value,
    });
  };

  const mainLocation = user.locations?.find((loc) => loc.isMain);

  return (
    <UserFormContainer>
      <Avatar sx={{ bgcolor: user.color }}>
        <PeopleIcon />
      </Avatar>
      <FormContainer>
        <TextField
          label={t("projects:dialogs.add-date-for-others.form.company")}
          value={user.company}
          onChange={handleFieldChange("company")}
          fullWidth
          disabled={disabled}
          error={touched && Boolean(errors?.user?.company)}
          helperText={
            (touched &&
              typeof errors?.user?.company === "string" &&
              errors?.user?.company) ||
            null
          }
          required={required?.company !== undefined ? required.company : true}
          autoComplete="off"
          name={`${namePrefix}company`}
        />
        <TextField
          label={t("projects:dialogs.add-date-for-others.form.email")}
          value={user.email}
          onChange={handleFieldChange("email")}
          fullWidth
          disabled={disabled}
          error={touched && Boolean(errors?.user?.email)}
          helperText={
            (touched &&
              typeof errors?.user?.email === "string" &&
              errors?.user?.email) ||
            null
          }
          required={required?.email !== undefined ? required.email : true}
          autoComplete="off"
          name={`${namePrefix}email`}
        />
        {!user._id && (
          <>
            <TextField
              label={t("projects:dialogs.add-date-for-others.form.first-name")}
              onChange={handleFieldChange("firstName")}
              fullWidth
              disabled={disabled}
              error={touched && Boolean(errors?.user?.firstName)}
              helperText={
                (touched &&
                  typeof errors?.user?.firstName === "string" &&
                  errors?.user?.firstName) ||
                null
              }
              required={
                required?.firstName !== undefined ? required.firstName : true
              }
              autoComplete="off"
              name={`${namePrefix}firstName`}
            />
            <TextField
              label={t("projects:dialogs.add-date-for-others.form.last-name")}
              onChange={handleFieldChange("lastName")}
              fullWidth
              disabled={disabled}
              error={touched && Boolean(errors?.user?.lastName)}
              helperText={
                (touched &&
                  typeof errors?.user?.lastName === "string" &&
                  errors?.user?.lastName) ||
                null
              }
              required={
                required?.lastName !== undefined ? required.lastName : true
              }
              autoComplete="off"
              name={`${namePrefix}lastName`}
            />
          </>
        )}
        <AddressAutocomplete
          label={t("projects:dialogs.add-date-for-others.form.address")}
          placeholder={t(
            "projects:dialogs.add-date-for-others.form.address-placeholder",
          )}
          value={mainLocation?.location || null}
          onChange={(value) => {
            if (!value) {
              return;
            }
            return onChange({
              ...user,
              locations: [
                ...(user.locations || []),
                {
                  location: value,
                  isMain: true,
                  label: "Main",
                },
              ],
            });
          }}
          disabled={disabled}
          error={touched && Boolean(errors?.user?.location)}
          helperText={
            (touched &&
              typeof errors?.user?.location === "string" &&
              errors?.user?.location) ||
            null
          }
          required={required?.location !== undefined ? required.location : true}
          autoComplete="off"
          name={`${namePrefix}location`}
        />
        {!!entity && (
          <>
            <FormLabel>
              {t("projects:dialogs.add-date-for-others.form.role")}
            </FormLabel>
            <ButtonGroup>
              <Button
                startIcon={<EventIcon />}
                variant={
                  user.role === Role.DIFFUSION_STRUCTURE
                    ? "contained"
                    : "outlined"
                }
                disabled={disabled || !!user.role}
              >
                {t("common:structures_name")}
              </Button>
              <Button
                startIcon={<PeopleIcon />}
                onClick={() => {
                  onChange({ ...user, role: Role.ARTISTIC_TEAM });
                }}
                variant={
                  user.role === Role.ARTISTIC_TEAM ? "contained" : "outlined"
                }
                disabled={disabled || !!user.role}
              >
                {t("common:artistic_team_name")}
              </Button>
            </ButtonGroup>
          </>
        )}
        {!disabled && shouldInvite && (
          <FormControlLabel
            value={true}
            checked={
              typeof user.shouldInvite === "boolean" ? user.shouldInvite : true
            }
            defaultChecked={true}
            control={<Checkbox />}
            label={t("projects:dialogs.add-date-for-others.form.should-invite")}
            onChange={handleFieldChange("shouldInvite")}
            labelPlacement="end"
          />
        )}
      </FormContainer>
    </UserFormContainer>
  );
};

export default UserForm;
