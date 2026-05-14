import React from "react";
import styled from "@emotion/styled";
import { ChatMessage, User } from "@cooprog/core";
import UserAvatar from "@/components/structures/UserAvatar";
import { Actions } from "@/components/structures/useRights";
import useUser from "@/components/authentication/useUser";
import useRights from "@/components/structures/useRights";
import { decodeHtmlEntities } from "./decodeHtmlEntities";

interface StyledProps {
  isOutgoing: boolean;
}

const MessageContainer = styled.div<StyledProps>`
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  flex-direction: ${(props: StyledProps) =>
    props.isOutgoing ? "row-reverse" : "row"};
  max-width: 80%;
  margin-left: ${(props: StyledProps) => (props.isOutgoing ? "auto" : "0")};
`;

const MessageContent = styled.div<StyledProps>`
  background: ${(props: StyledProps) =>
    props.isOutgoing ? "var(--color-light-orange)" : "var(--color-light-gray)"};
  color: #000000;
  padding: 0.75rem 1rem;
  border-radius: 1rem;
  position: relative;
  word-wrap: break-word;
  font-size: 0.8rem;
`;

const CompanyName = styled.div<StyledProps>`
  font-size: 0.7rem;
  color: var(--color-gray);
  margin-bottom: 0.25rem;
  text-align: ${(props: StyledProps) => (props.isOutgoing ? "right" : "left")};
  display: flex;
  flex-direction: column;
  margin-left: ${(props: StyledProps) => (props.isOutgoing ? "0" : "3.5rem")};
  margin-right: ${(props: StyledProps) => (props.isOutgoing ? "3.5rem" : "0")};
`;

const ProfileName = styled.span`
  font-size: 0.8rem;
  font-weight: bold;
`;

const CompanyText = styled.span`
  font-size: 0.7rem;
  color: var(--color-gray);
`;

export const TimeStamp = styled.div`
  font-size: 0.6rem;
  color: #666;
  margin-top: 0.25rem;
  text-align: right;
`;

const AvatarContainer = styled.div`
  flex-shrink: 0;
`;

interface MessageProps {
  message: ChatMessage;
  user: User;
  isCurrentUser: boolean;
}

const Message: React.FC<MessageProps> = ({ message, isCurrentUser, user }) => {
  const { user: currentUser } = useUser();
  const { can } = useRights({ user: currentUser });

  return (
    <div>
      <CompanyName isOutgoing={isCurrentUser}>
        {message.profile && (
          <ProfileName>
            {message.profile.firstName} {message.profile.lastName}
          </ProfileName>
        )}
        <CompanyText>{user.company}</CompanyText>
      </CompanyName>
      <MessageContainer isOutgoing={isCurrentUser}>
        <AvatarContainer>
          <UserAvatar
            user={message.sender!}
            showProfile
            profile={message.profile}
            showTooltip
            showLink={can(Actions.PAGES_ACCESS_STRUCTURE)}
            showRole
          />
        </AvatarContainer>
        <MessageContent isOutgoing={isCurrentUser}>
          <div>{decodeHtmlEntities(message.message)}</div>
          <TimeStamp>{new Date(message.createdAt!).toLocaleString()}</TimeStamp>
        </MessageContent>
      </MessageContainer>
    </div>
  );
};

export default Message;
