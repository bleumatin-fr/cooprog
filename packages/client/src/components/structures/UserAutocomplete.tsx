import { User } from "@cooprog/core";
import styled from "@emotion/styled";
import ClearIcon from "@mui/icons-material/Clear";
import {
  Autocomplete,
  Avatar,
  IconButton,
  ListItemProps,
  TextField,
  Tooltip,
} from "@mui/material";
import { useState } from "react";
import { useDebounceValue } from "usehooks-ts";
import useUsers from "../authentication/useUsers";
import { InformationContainer, TitleContainer } from "../projects/ProjectCard";
import { CompanyContainer } from "./UserCard";

import { Role } from "@cooprog/core";
import ContactMailIcon from "@mui/icons-material/ContactMail";
import { FormikErrors } from "formik";
import { useTranslation } from "next-i18next";
import useUser from "../authentication/useUser";
import ParticipantListItem from "../projects/ParticipantListItem";
import { isValidEmail } from "./UserOrExternalAutocomplete";

const UserLineContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 8px 0;
  z-index: 3001;
`;
const UserListItemContainer = styled.li`
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 8px 0;
  z-index: 3001;
`;

const AccessibilityBadgeContainer = styled.div`
  > div > div {
    justify-content: flex-start;
  }
`;

interface UserLineProps extends ListItemProps {
  user: Partial<User>;
  onRemove?: () => void;
}

export const UserLine = ({ user, onRemove, ...rest }: UserLineProps) => {
  const { t } = useTranslation();

  return (
    <UserListItemContainer {...rest}>
      {typeof user === "string" ? (
        <>
          <Avatar sx={{ bgcolor: "#ff7446" }}>
            <ContactMailIcon />
          </Avatar>
          <InformationContainer>
            <TitleContainer>{user}</TitleContainer>
            <CompanyContainer>
              {t("projects:dialogs.share-project.invite")}
            </CompanyContainer>
          </InformationContainer>
          {onRemove && (
            <Tooltip title={t("projects:dialogs.share-project.remove")}>
              <IconButton
                onClick={() => onRemove && onRemove()}
                color="primary"
                size="small"
              >
                <ClearIcon />
              </IconButton>
            </Tooltip>
          )}
        </>
      ) : (
        <>
          <ParticipantListItem user={user} />
          {onRemove && (
            <Tooltip title={t("projects:dialogs.share-project.remove")}>
              <IconButton
                onClick={() => onRemove && onRemove()}
                color="primary"
                size="small"
              >
                <ClearIcon />
              </IconButton>
            </Tooltip>
          )}
        </>
      )}
    </UserListItemContainer>
  );
};

interface InviteLineProps extends ListItemProps {
  userEmail: string;
  inviteText?: string;
}

export const InviteLine = ({
  userEmail,
  inviteText,
  ...rest
}: InviteLineProps) => {
  const { t } = useTranslation();
  return (
    <UserListItemContainer {...rest}>
      <Avatar sx={{ bgcolor: "#ff7446" }}>
        <ContactMailIcon />
      </Avatar>
      <InformationContainer>
        <TitleContainer style={{ fontSize: 14 }}>
          {inviteText ||
            t("projects:dialogs.share-project.invite-action", {
              userEmail,
              role: t("common:roles.participant"),
            })}
        </TitleContainer>
      </InformationContainer>
    </UserListItemContainer>
  );
};

export const UserLinesContainer = styled.div`
  width: 100%;
  // max-height: 450px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

interface UserAutocompleteProps {
  onInputChange?: (event: any, newInputValue: string, reason: string) => void;
  onChange: (value: Partial<User> | null) => void;
  onChangeNotFound?: (value: string) => void;
  label?: string;
  placeholder?: string;
  inviteText?: string;
  showResults?: boolean;
  role?: Role[];
  discipline?: string;
  touched?: boolean;
  errors?: FormikErrors<any>;
  required?: boolean;
}

const UserAutocomplete = ({
  onInputChange,
  onChange,
  label,
  placeholder,
  inviteText,
  showResults,
  role,
  discipline,
  touched,
  errors,
  required = false,
}: UserAutocompleteProps) => {
  const { t } = useTranslation();

  const [value, setValue] = useState<Partial<User> | null>(null);
  const [inputValue, setInputValue] = useState("");
  const [autocompleteValue, setAutocompleteValue] = useState<
    string | User | null | undefined
  >(undefined);
  const [q] = useDebounceValue(inputValue, 500);

  const { user } = useUser();

  const { users } = useUsers({
    q: q.length > 2 ? q : "⍓",
    limit: 8,
    notIds: [user?._id],
    role,
    discipline,
  });

  const handleUserRemoved = () => {
    setValue(null);
    onChange(null);
  };

  const suggestions: string[] = [];

  if (inputValue.length > 2) {
    suggestions.push(inputValue);
  }

  return (
    <>
      <Autocomplete
        filterOptions={(x) => x}
        includeInputInList
        key={autocompleteValue?.toString() || ""}
        autoComplete
        value={autocompleteValue}
        onChange={(event: any, newValue: string | User | null) => {
          setAutocompleteValue(undefined);
          setInputValue("");
          if (newValue === null) return;
          if (typeof newValue === "string") {
            const newUser: Partial<User> = {};
            if (isValidEmail(newValue)) {
              newUser.email = newValue;
            } else {
              newUser.company = newValue;
            }
            setValue(newUser);
            onChange(newUser);
            return;
          }
          setValue(newValue);
          onChange(newValue);
        }}
        inputValue={inputValue}
        onInputChange={(event, newInputValue, reason) => {
          if (reason === "reset") return;
          setInputValue(newInputValue);
          onInputChange?.(event, newInputValue, reason);
        }}
        getOptionLabel={(option) =>
          typeof option === "string"
            ? option
            : option.company +
              " " +
              option.profiles?.[0]?.firstName +
              " " +
              option.profiles?.[0]?.lastName
        }
        isOptionEqualToValue={(option, value) =>
          value === option || value === ""
        }
        options={[...(users || []), ...suggestions]}
        filterSelectedOptions
        freeSolo
        renderInput={(params) => (
          <TextField
            {...params}
            label={label || t("projects:dialogs.share-project.field-label")}
            fullWidth
            InputLabelProps={{ shrink: true }}
            placeholder={
              placeholder ||
              t("projects:dialogs.share-project.field-placeholder")
            }
            error={touched && !!errors}
            hiddenLabel
          />
        )}
        renderOption={(props, option) => {
          const { key, ...rest } = props;
          if (typeof option === "string") {
            return (
              <InviteLine
                userEmail={option}
                inviteText={inviteText}
                {...props}
              />
            );
          }
          return <UserLine user={option} {...props} />;
        }}
        fullWidth
      />
      {showResults && value && (
        <UserLinesContainer>
          <UserLine user={value} onRemove={handleUserRemoved} />
        </UserLinesContainer>
      )}
    </>
  );
};

export default UserAutocomplete;
