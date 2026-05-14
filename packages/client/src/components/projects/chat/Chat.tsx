import React, { useEffect, useRef, useState } from "react";
import styled from "@emotion/styled";
import useUser from "@/components/authentication/useUser";
import { useTranslation } from "next-i18next";
import { ChatMessage, ChatMessageType, SystemDataType } from "@cooprog/core";
import ChatContainer from "./ChatContainer";
import MessageList from "./MessageList";
import Message from "./Message";
import MessageInput from "./MessageInput";
import useChatMessage from "./useChatMessage";
import { useSnackbar } from "notistack";
import useRights, { Actions } from "@/components/structures/useRights";
import SystemMessage from "./SystemMessage";
import useTour from "../useTour";
import { useRouter } from "next/router";
import { Typography } from "@mui/material";

const MainContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
  padding: 0 0 1rem 0;
  flex: 1;
  min-height: 0;
`;

const Chat = () => {
  const router = useRouter();
  const { id, tourId } = router.query;
  const { updateLastSeen, tour } = useTour(id as string, tourId as string);
  const { user, selectedProfileId } = useUser();
  const { enqueueSnackbar } = useSnackbar();
  const [firstUnreadIndex, setFirstUnreadIndex] = useState<number | undefined>(
    undefined
  );

  const { can } = useRights({ user });

  const { t } = useTranslation(["projects"]);
  const { chatMessages, sendMessage } = useChatMessage(tourId as string);

  const messageListRef = useRef<HTMLDivElement>(null);
  const unreadMessageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user && tour && chatMessages && chatMessages.length > 1) {
      const lastSeen = tour?.lastSeenByUser?.[user._id] || new Date(0);
      setFirstUnreadIndex(
        chatMessages
          .filter((msg) => msg.sender?._id.toString() !== user._id.toString())
          .findIndex(
            (msg) => new Date(msg.createdAt as Date) > new Date(lastSeen)
          )
      );
    }
  }, [user, tour, chatMessages]);

  useEffect(() => {
    const updateLastSeenWhenLeaving = () => {
      updateLastSeen();
    };

    window.addEventListener("beforeunload", updateLastSeenWhenLeaving);
    router.events.on("routeChangeStart", updateLastSeenWhenLeaving);

    return () => {
      window.removeEventListener("beforeunload", updateLastSeenWhenLeaving);
      router.events.off("routeChangeStart", updateLastSeenWhenLeaving);
    };
  }, [updateLastSeen, router.events]);

  useEffect(() => {
    if (!chatMessages || firstUnreadIndex === undefined) return;

    if (messageListRef.current) {
      messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
    }
  }, [chatMessages, firstUnreadIndex]);

  if (!user || !tour || !chatMessages || !selectedProfileId) return null;

  const handleSendMessage = async (message: string) => {
    try {
      await sendMessage({ message, profileId: selectedProfileId });
      enqueueSnackbar(t("projects:tours.chat.message-created-ok"), {
        variant: "success",
      });
    } catch (e) {
      enqueueSnackbar(t("projects:tours.chat.message-created-error"), {
        variant: "error",
      });
    }
  };

  return (
    <MainContainer>
      <ChatContainer>
        <MessageList ref={messageListRef}>
          <SystemMessage
            key={`first-message`}
            message={{
              type: ChatMessageType.SYSTEM,
              tour: tour,
              message: t("projects:tours.chat.first-message"),
              createdAt: new Date(tour.createdAt!),
              systemData: [
                {
                  type: SystemDataType.DIRECT_VALUE,
                  fieldName: "tourName",
                  value: tour.name,
                },
              ],
            }}
          />
          {(() => {
            type GroupedMessage = ChatMessage | ChatMessage[] | "separator";
            const groupedMessages: GroupedMessage[] = [];
            let currentSystemGroup: ChatMessage[] = [];
            let currentCompany: string | undefined;

            chatMessages.forEach((message, index) => {
              if (index === firstUnreadIndex) {
                if (currentSystemGroup.length > 0) {
                  groupedMessages.push(currentSystemGroup);
                  currentSystemGroup = [];
                  currentCompany = undefined;
                }
                groupedMessages.push("separator");
              }

              if (message.type === ChatMessageType.SYSTEM) {
                const company = message.systemData?.find(
                  (data) =>
                    data.type === SystemDataType.DIRECT_VALUE &&
                    data.fieldName === "company"
                ) as
                  | { type: SystemDataType.DIRECT_VALUE; value: string }
                  | undefined;

                if (currentCompany === undefined) {
                  if (currentSystemGroup.length > 0) {
                    groupedMessages.push(currentSystemGroup);
                  }
                  currentCompany = company?.value;
                  currentSystemGroup = [message];
                } else if (currentCompany === company?.value) {
                  currentSystemGroup.push(message);
                } else {
                  if (currentSystemGroup.length > 0) {
                    groupedMessages.push(currentSystemGroup);
                  }
                  currentCompany = company?.value;
                  currentSystemGroup = [message];
                }
              } else {
                if (currentSystemGroup.length > 0) {
                  groupedMessages.push(currentSystemGroup);
                  currentSystemGroup = [];
                  currentCompany = undefined;
                }
                groupedMessages.push(message);
              }
            });

            if (currentSystemGroup.length > 0) {
              groupedMessages.push(currentSystemGroup);
            }

            return groupedMessages.map((item, index) => {
              if (item === "separator") {
                return (
                  <div key={`separator-${index}`} ref={unreadMessageRef}>
                    <NewMessagesSeparator />
                  </div>
                );
              }

              if (Array.isArray(item)) {
                return (
                  <SystemMessage
                    key={`system-group-${index}`}
                    message={item[0]}
                    messages={item}
                  />
                );
              }

              const message = item as ChatMessage;
              if (message.type === ChatMessageType.USER && message.sender) {
                return (
                  <Message
                    key={message._id}
                    message={message}
                    user={message.sender}
                    isCurrentUser={user._id === message.sender?._id}
                  />
                );
              }

              return null;
            });
          })()}
        </MessageList>
        {can(Actions.CHAT_CREATE_POST) && (
          <MessageInput
            placeholder={t("projects:tours.chat.placeholder")}
            onSend={handleSendMessage}
          />
        )}
      </ChatContainer>
    </MainContainer>
  );
};

const SeparatorContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  margin: 10px 0;
`;

const Line = styled.div`
  flex-grow: 1;
  height: 1px;
  background-color: var(--color-orange);
  margin: 0 10px;
`;

const SeparatorText = styled.span`
  font-size: 14px;
  font-style: italic;
  font-weight: bold;
  color: var(--color-orange);
`;

const NewMessagesSeparator = () => {
  const { t } = useTranslation(["projects"]);

  return (
    <SeparatorContainer>
      <Line />
      <SeparatorText>{t("projects:tours.chat.new-messages")}</SeparatorText>
      <Line />
    </SeparatorContainer>
  );
};

export default Chat;
