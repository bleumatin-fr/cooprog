import React, { useState, useRef } from "react";
import styled from "@emotion/styled";
import UserAvatar from "@/components/structures/UserAvatar";
import useUser from "@/components/authentication/useUser";
import { useTranslation } from "next-i18next";
import { TextField, InputAdornment, Popover } from "@mui/material";
import data from "@emoji-mart/data";
import Picker from "@emoji-mart/react";

const namespaces = ["common", "projects"];

const InputContainer = styled.div`
  display: flex;
  flex-direction: column;
  background: #fff;
  border-top: 1px solid var(--color-light-gray);
  padding: 1rem 1rem 0 1rem;
`;

const InputRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const ProfileText = styled.div`
  font-size: 0.7rem;
  color: var(--color-gray);
  margin-top: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const ChangeProfileLink = styled.a`
  color: var(--color-orange);
  cursor: pointer;
  text-decoration: underline;
  &:hover {
    color: var(--color-light-orange);
  }
`;

const StyledTextField = styled(TextField)`
  flex: 1;
  .MuiOutlinedInput-root {
    border-radius: 1.5rem;
    background: var(--color-light-gray);
    color: var(--color-black);
    height: 40px;

    &:hover fieldset {
      border-color: #e0e0e0;
    }

    &.Mui-focused fieldset {
      border-color: var(--color-orange);
    }
  }
`;

const SendButton = styled.button`
  margin-left: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: var(--color-orange);
  color: white;
  border: none;
  border-radius: 1.5rem;
  cursor: pointer;
  font-size: 1rem;

  &:hover {
    background: var(--color-light-orange);
  }

  &:disabled {
    background: #ccc;
    cursor: not-allowed;
  }
`;

const EmojiButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  font-size: 1.2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-gray);

  &:hover {
    color: var(--color-orange);
  }
`;

interface MessageInputProps {
  placeholder?: string;
  onSend: (message: string) => void;
}

const MessageInput: React.FC<MessageInputProps> = ({ placeholder, onSend }) => {
  const [message, setMessage] = useState("");
  const [anchorEl, setAnchorEl] = useState<HTMLDivElement | null>(null);
  const { user, selectedProfile, setSelectedProfileId } = useUser();
  const { t } = useTranslation(namespaces);
  const inputContainerRef = useRef<HTMLDivElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      onSend(message.trim());
      setMessage("");
    }
  };

  const handleEmojiClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setAnchorEl(inputContainerRef.current as HTMLDivElement);
  };

  const handleEmojiSelect = (emoji: any) => {
    setMessage((prev) => prev + emoji.native);
    setAnchorEl(null);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);

  return (
    <form onSubmit={handleSubmit}>
      <InputContainer ref={inputContainerRef}>
        {user && (
          <>
            <InputRow>
              <UserAvatar
                user={user}
                size="medium"
                showTooltip={false}
                showLink={false}
                showProfile
                showRole
              />
              <StyledTextField
                value={message}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setMessage(e.target.value)
                }
                onKeyDown={(e: React.KeyboardEvent) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit(e);
                  }
                }}
                placeholder={placeholder}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <EmojiButton onClick={handleEmojiClick}>😃</EmojiButton>
                    </InputAdornment>
                  ),
                }}
              />
              <SendButton type="submit" disabled={!message.trim()}>
                {t("projects:tours.chat.send")}
              </SendButton>
            </InputRow>
            {selectedProfile && user.profiles && user.profiles.length > 1 && (
              <ProfileText>
                {t("projects:tours.chat.posting-as", {
                  firstName: selectedProfile.firstName,
                  lastName: selectedProfile.lastName,
                })}
                <ChangeProfileLink
                  onClick={() => setSelectedProfileId(undefined)}
                >
                  {t("projects:tours.chat.change-profile")}
                </ChangeProfileLink>
              </ProfileText>
            )}
            <Popover
              open={open}
              anchorEl={anchorEl}
              onClose={handleClose}
              anchorOrigin={{
                vertical: "top",
                horizontal: "center",
              }}
              transformOrigin={{
                vertical: "bottom",
                horizontal: "center",
              }}
            >
              <Picker
                data={data}
                onEmojiSelect={handleEmojiSelect}
                theme="light"
                previewPosition="none"
                skinTonePosition="none"
                perLine={8}
                emojiSize={20}
                emojiButtonSize={28}
              />
            </Popover>
          </>
        )}
      </InputContainer>
    </form>
  );
};

export default MessageInput;
