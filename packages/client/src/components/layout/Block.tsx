import styled from "@emotion/styled";
import { useMediaQuery, useTheme } from "@mui/material";
import { ReactElement } from "react";

const Block = styled.div`
  background-color: #fff;
  border-radius: 16px;
  padding: 24px;
  // filter: drop-shadow(0px 4px 4px rgba(183, 183, 183, 0.25));
  border-radius: 5px;
  > h4 {
    margin-bottom: 16px;
  }
`;

export const CenteredContainerDesktop = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 32px;
  min-height: 100vh;
`;

export const CenteredContainerMobile = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  margin-top: 72px;
`;

export const CenteredContainer = ({ children }: { children: ReactElement }) => {
  const theme = useTheme();
  const mobile = useMediaQuery(theme.breakpoints.down("sm"));

  if (mobile) {
    return <CenteredContainerMobile>{children}</CenteredContainerMobile>;
  }
  return <CenteredContainerDesktop>{children}</CenteredContainerDesktop>;
};

export default Block;
