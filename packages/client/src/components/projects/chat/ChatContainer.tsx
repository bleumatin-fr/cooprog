import React from "react";
import styled from "@emotion/styled";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  max-width: 100%;
  background: #fff;
  flex: 1;
  min-height: 0;
`;

interface ChatContainerProps {
  children: React.ReactNode;
}

const ChatContainer: React.FC<ChatContainerProps> = ({ children }) => {
  return <Container>{children}</Container>;
};

export default ChatContainer;
