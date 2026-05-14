import React, { forwardRef } from "react";
import styled from "@emotion/styled";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  padding: 1rem;
  gap: 1rem;
  overflow-y: auto;
  flex: 1;
  min-height: 0;
  height: 100%;
`;

interface MessageListProps {
  children: React.ReactNode;
}

const MessageList = forwardRef<HTMLDivElement, MessageListProps>(
  ({ children }, ref) => {
    return <Container ref={ref}>{children}</Container>;
  }
);

MessageList.displayName = "MessageList";

export default MessageList;
