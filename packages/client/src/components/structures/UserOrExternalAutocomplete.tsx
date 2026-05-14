import { User } from "@cooprog/core";
import styled from "@emotion/styled";
import ClearIcon from "@mui/icons-material/Clear";
import {
  Autocomplete,
  Avatar,
  FormLabel,
  IconButton,
  TextField,
  Tooltip,
} from "@mui/material";
import React, { useState } from "react";
import { useDebounce } from "usehooks-ts";
import useUsers from "../authentication/useUsers";
import { InformationContainer, TitleContainer } from "../projects/ProjectCard";
import { CompanyContainer } from "./UserCard";

import ContactMailIcon from "@mui/icons-material/ContactMail";
import { useTranslation } from "next-i18next";
import ParticipantListItem from "../projects/ParticipantListItem";

const UserLineContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  z-index: 3001;
`;

export const isValidEmail = (email: string) => {
  return String(email)
    .toLowerCase()
    .match(
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    );
};

interface UserLineProps {
  user: User | string;
  onRemove?: (user: User | string) => void;
  renderInviteResult?: (
    user: User | string,
    onRemove?: (user: User | string) => void
  ) => React.ReactNode;
}

const InviteeListItem = styled.li`
  padding-top: 8px;
  padding-bottom: 8px;
  padding-left: 16px;
  padding-right: 0;
  display: flex;
  gap: 16px;
  width: 100%;
`;

export const UserLine = ({
  user,
  onRemove,
  renderInviteResult,
}: UserLineProps) => {
  const { t } = useTranslation();

  return (
    <UserLineContainer>
      {typeof user === "string" ? (
        renderInviteResult ? (
          renderInviteResult(user, onRemove)
        ) : (
          <InviteeListItem>
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
                  onClick={() => onRemove && onRemove(user)}
                  color="primary"
                  size="small"
                >
                  <ClearIcon />
                </IconButton>
              </Tooltip>
            )}
          </InviteeListItem>
        )
      ) : (
        <>
          <ParticipantListItem user={user} />
          {onRemove && (
            <Tooltip title={t("projects:dialogs.share-project.remove")}>
              <IconButton
                onClick={() => onRemove && onRemove(user)}
                color="primary"
                size="small"
              >
                <ClearIcon />
              </IconButton>
            </Tooltip>
          )}
        </>
      )}
    </UserLineContainer>
  );
};

export const InviteLine = ({ email }: { email: string }) => {
  const { t } = useTranslation();
  return (
    <UserLineContainer>
      <Avatar sx={{ bgcolor: "#ff7446" }}>
        <ContactMailIcon />
      </Avatar>
      <InformationContainer>
        <TitleContainer>
          {t("projects:dialogs.share-project.invite-action", { email })}
        </TitleContainer>
      </InformationContainer>
    </UserLineContainer>
  );
};

export const UserLinesContainer = styled.div`
  width: 100%;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

interface UserOrExternalAutocompleteProps {
  onChange: (value: (User | string)[]) => void;
  label?: string;
  placeholder?: string;
  multiple?: boolean;
  renderInviteOption?: (email: string) => React.ReactNode;
  renderInviteResult?: (
    user: User | string,
    onRemove?: (user: User | string) => void
  ) => React.ReactNode;
}

const UserOrExternalAutocomplete = ({
  onChange,
  label,
  placeholder,
  multiple = true,
  renderInviteOption,
  renderInviteResult,
}: UserOrExternalAutocompleteProps) => {
  const [value, setValue] = useState<(User | string)[]>([]);
  const [inputValue, setInputValue] = useState("");
  const { t } = useTranslation();
  const [autocompleteValue, setAutocompleteValue] = useState<
    string | User | null | undefined
  >(undefined);

  const q = useDebounce(inputValue.length > 2 ? inputValue : "⍓", 500);

  const { users } = useUsers({
    q,
    limit: 8,
    notIds: value
      .filter((v) => typeof v !== "string" && v._id !== undefined)
      .map((v) => (typeof v === "string" ? v : v._id)),
  });

  const handleUserRemoved = (user: User | string) => {
    const newArrayValue = value.filter((v) => v !== user);
    setValue(newArrayValue);
    onChange(newArrayValue);
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
          let newArrayValue = [];
          if (multiple) {
            newArrayValue = [...value, newValue];
          } else {
            newArrayValue = [newValue];
          }
          setValue(newArrayValue);
          onChange(newArrayValue);
        }}
        inputValue={inputValue}
        onInputChange={(event, newInputValue, reason) => {
          if (reason === "reset") return;
          setInputValue(newInputValue);
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
            autoFocus
            placeholder={
              placeholder ||
              t("projects:dialogs.share-project.field-placeholder")
            }
            hiddenLabel
          />
        )}
        renderOption={(props, option) => {
          let line;
          if (typeof option === "string") {
            if (renderInviteOption) {
              line = renderInviteOption(option);
            } else {
              line = <InviteLine email={option} />;
            }
          } else {
            line = <UserLine user={option} />;
          }
          return <li {...props}>{line}</li>;
        }}
        fullWidth
      />

      <UserLinesContainer>
        {value.length > 0 && (
          <FormLabel>
            {t("projects:dialogs.share-project.recipients")}
          </FormLabel>
        )}
        {value.map((user, index) => (
          <UserLine
            key={index}
            user={user}
            onRemove={handleUserRemoved}
            renderInviteResult={renderInviteResult}
          />
        ))}
      </UserLinesContainer>
    </>
  );
};

export default UserOrExternalAutocomplete;
