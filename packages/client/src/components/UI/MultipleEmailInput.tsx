import React, { useState, useRef, useEffect } from "react";
import {
  Chip,
  TextField,
  Box,
  FormHelperText,
  FormControl,
  FormLabel,
  Autocomplete,
  Avatar,
  Tooltip,
  IconButton,
} from "@mui/material";
import styled from "@emotion/styled";
import { ProgramStatuses, User } from "@cooprog/core";
import { useDebounce } from "usehooks-ts";
import useUsers from "../authentication/useUsers";
import { InformationContainer, TitleContainer } from "../projects/ProjectCard";
import { CompanyContainer } from "../structures/UserCard";
import ContactMailIcon from "@mui/icons-material/ContactMail";
import ClearIcon from "@mui/icons-material/Clear";
import { useTranslation } from "next-i18next";
import ParticipantListItem from "../projects/ParticipantListItem";
import UserPill from "../structures/UserPill";
import { useSnackbar } from "notistack";

interface MultipleEmailInputProps {
  id?: string;
  name?: string;
  label?: string;
  value: (string | User)[];
  onChange: (emails: (string | User)[]) => void;
  error?: boolean;
  helperText?: string;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  enableUsers?: boolean;
  validateEmail?: (email: string) => Promise<string | null>;
}

interface MultipleEmailInputPropsWithUsers
  extends Omit<MultipleEmailInputProps, "value" | "onChange"> {
  enableUsers: true;
  value: (string | User)[];
  onChange: (emails: (string | User)[]) => void;
}

interface MultipleEmailInputPropsWithoutUsers
  extends Omit<MultipleEmailInputProps, "value" | "onChange" | "enableUsers"> {
  enableUsers?: false;
  value: string[];
  onChange: (emails: string[]) => void;
}

type MultipleEmailInputPropsUnion =
  | MultipleEmailInputPropsWithUsers
  | MultipleEmailInputPropsWithoutUsers;

const EmailChip = styled(Chip)`
  margin: 2px;
  background-color: var(--color-very-light-orange);
  color: var(--color-dark-green);
  border: 1px solid var(--color-light-orange);

  &:hover {
    background-color: var(--color-light-orange);
  }

  .MuiChip-deleteIcon {
    color: var(--color-gray);

    &:hover {
      color: var(--color-orange);
    }
  }
`;

// Custom pill component for email addresses
const EmailPill = ({
  email,
  onRemove,
}: {
  email: string;
  onRemove: () => void;
}) => {
  const { t } = useTranslation();

  return (
    <Chip
      avatar={
        <Avatar sx={{ bgcolor: "#ff7446", width: 24, height: 24 }}>
          <ContactMailIcon sx={{ fontSize: 16 }} />
        </Avatar>
      }
      label={email}
      variant="outlined"
      onDelete={onRemove}
      size="small"
      sx={{
        maxWidth: 200,
        height: 32,
        flexShrink: 0,
        backgroundColor: "var(--color-very-light-orange)",
        color: "var(--color-dark-green)",
        border: "1px solid var(--color-light-orange)",
        "&.MuiChip-outlined:hover": {
          backgroundColor: "var(--color-light-orange)",
        },
        "& .MuiChip-deleteIcon": {
          color: "var(--color-gray)",
          "&:hover": {
            color: "var(--color-orange)",
          },
        },
      }}
    />
  );
};

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

const InputWrapper = styled.div`
  display: flex;
  flex-wrap: nowrap;
  align-items: center;
  gap: 8px;
  border: 1px solid
    ${({ error }: { error?: boolean }) =>
      error ? "var(--error-background-color)" : "var(--color-light-gray)"};
  border-radius: 4px;
  background-color: var(--color-white);
  transition: border-color 0.2s ease;
  padding: 16px 14px;
  min-height: 56px;
  width: 100%;
  overflow-x: auto;
  overflow-y: hidden;

  &:hover {
    border-color: ${({ error }: { error?: boolean }) =>
      error ? "var(--error-background-color)" : "var(--color-gray)"};
  }

  &:focus-within {
    border-color: var(--color-orange) !important;
    border-width: 2px;
    padding: 15px 13px;
  }
`;

const StyledInput = styled.input`
  border: none;
  background-color: transparent;
  font-size: 1rem;
  font-family: inherit;
  flex: 1;
  min-width: 120px;
  outline: none;
  padding: 0;
  height: 24px;
  line-height: 24px;
  flex-shrink: 0;

  &::placeholder {
    color: var(--color-text-gray);
  }
`;

interface UserLineProps {
  user: User | string;
  onRemove?: (user: User | string) => void;
}

const UserLine = ({ user, onRemove }: UserLineProps) => {
  const { t } = useTranslation();

  return (
    <UserLineContainer>
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
                onClick={() => onRemove && onRemove(user)}
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

const InviteLine = ({ email }: { email: string }) => {
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

const MultipleEmailInput: React.FC<MultipleEmailInputPropsUnion> = ({
  id,
  name,
  label,
  value,
  onChange,
  error = false,
  helperText = "",
  placeholder = "Enter email addresses...",
  disabled = false,
  required = false,
  enableUsers = false,
  validateEmail,
}) => {
  const [inputValue, setInputValue] = useState("");
  const [isValidating, setIsValidating] = useState(false);
  const [autocompleteValue, setAutocompleteValue] = useState<
    string | User | null | undefined
  >(undefined);
  const { enqueueSnackbar } = useSnackbar();
  const inputRef = useRef<HTMLInputElement>(null);
  const { t } = useTranslation();

  const q = useDebounce(inputValue.length > 2 ? inputValue : "⍓", 500);

  const { users } = useUsers({
    q,
    limit: 8,
    notIds: value
      .filter((v) => typeof v !== "string" && v._id !== undefined)
      .map((v) => (typeof v === "string" ? v : v._id)),
  });

  const handleValidateEmail = async (email: string): Promise<string | null> => {
    const isFormatValid = isValidEmail(email.trim()) !== null;
    if (!isFormatValid)
      return t("common:dialogs.invite-people.error-email-invalid-format");
    if (!validateEmail) return null;
    return await validateEmail(email.trim());
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === "," || e.key === " ") {
      e.preventDefault();
      addEmail();
    } else if (e.key === "Backspace" && inputValue === "" && value.length > 0) {
      // Remove last email on backspace if input is empty
      const newEmails = value.slice(0, -1);
      onChange(newEmails as any);
    }
  };

  const addEmail = async () => {
    const email = inputValue.trim();
    const error = await handleValidateEmail(email);
    if (email && !error && !value.includes(email)) {
      onChange([...value, email] as any);
      setInputValue("");
      setIsValidating(false);
    } else if (email && error) {
      enqueueSnackbar(error, {
        variant: "error",
      });
      setIsValidating(true);
      setTimeout(() => setIsValidating(false), 2000);
    }
  };

  const suggestions: string[] = [];
  if (inputValue.length > 2) {
    suggestions.push(inputValue);
  }

  const removeEmail = (emailToRemove: string | User) => {
    onChange(value.filter((email) => email !== emailToRemove) as any);
  };

  const handleBlur = () => {
    if (inputValue.trim()) {
      addEmail();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData("text");
    const emails = pastedText
      .split(/[,;\s]+/)
      .map((email) => email.trim())
      .filter(
        async (email) => email && (await handleValidateEmail(email)) === null
      );

    const newEmails = [...value];
    emails.forEach((email) => {
      if (!newEmails.includes(email)) {
        newEmails.push(email);
      }
    });

    onChange(newEmails as any);
  };

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  return (
    <FormControl
      error={error}
      disabled={disabled}
      required={required}
      fullWidth
    >
      {label && (
        <FormLabel
          sx={{
            fontSize: "0.875rem",
            marginBottom: "8px",
            color: error
              ? "var(--error-background-color)"
              : "var(--color-dark-green)",
          }}
        >
          {label}
        </FormLabel>
      )}

      {enableUsers ? (
        <InputWrapper error={error}>
          {value.map((item, index) => {
            if (typeof item === "string") {
              return (
                <EmailPill
                  key={`${item}-${index}`}
                  email={item}
                  onRemove={() => removeEmail(item)}
                />
              );
            } else {
              return (
                <UserPill
                  key={`${item._id}-${index}`}
                  user={item}
                  status={ProgramStatuses.SHOW_CONFIRMED}
                  onDelete={() => removeEmail(item)}
                  sx={{ margin: "2px", height: "32px", flexShrink: 0 }}
                />
              );
            }
          })}

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
              const newArrayValue = [...value, newValue];
              onChange(newArrayValue as any);
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
                fullWidth
                InputLabelProps={{ shrink: true }}
                autoFocus
                placeholder={value.length === 0 ? placeholder : ""}
                hiddenLabel
                sx={{
                  flex: 1,
                  minWidth: 0,
                  "& .MuiOutlinedInput-root": {
                    border: "none",
                    padding: 0,
                    minHeight: "auto",
                    "& fieldset": {
                      border: "none",
                    },
                    "&:hover fieldset": {
                      border: "none",
                    },
                    "&.Mui-focused fieldset": {
                      border: "none",
                    },
                    "& .MuiOutlinedInput-input": {
                      padding: 0,
                      height: "24px",
                      lineHeight: "24px",
                    },
                  },
                }}
              />
            )}
            renderOption={(props, option) => {
              let line;
              if (typeof option === "string") {
                line = <InviteLine email={option} />;
              } else {
                line = <UserLine user={option} />;
              }
              return <li {...props}>{line}</li>;
            }}
            fullWidth
          />
        </InputWrapper>
      ) : (
        <InputWrapper error={error}>
          {value.map((email, index) => (
            <EmailChip
              key={`${email}-${index}`}
              label={typeof email === "string" ? email : email.company}
              onDelete={() => removeEmail(email)}
              size="medium"
              variant="outlined"
            />
          ))}

          <StyledInput
            ref={inputRef}
            type="email"
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleInputKeyDown}
            onBlur={handleBlur}
            onPaste={handlePaste}
            placeholder={value.length === 0 ? placeholder : ""}
            disabled={disabled}
          />
        </InputWrapper>
      )}

      {(helperText || isValidating) && (
        <FormHelperText
          sx={{
            marginLeft: 0,
            marginRight: 0,
            marginTop: "4px",
            fontSize: "0.8rem",
            color: isValidating ? "var(--error-background-color)" : undefined,
          }}
        >
          {isValidating ? "Please enter a valid email address" : helperText}
        </FormHelperText>
      )}
    </FormControl>
  );
};

export default MultipleEmailInput;
