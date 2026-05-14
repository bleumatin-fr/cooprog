import styled from "@emotion/styled";
import { ReactNode } from "react";

const HeaderComponent = styled.header`
  position: relative;
  background-color: var(--color-white);
  border-radius: 8px;
  padding: 16px;
  > div {
    max-width: 1280px;
    margin: 0 auto;
    gap: 16px;

    h1,
    h2 {
      padding-left: 0;
      padding-right: 0;
    }

    h2 {
      padding-top: 0;
      margin-top: -16px;
    }
  }
`;


const Header = ({ children }: { children: ReactNode }) => {
  return (
    <HeaderComponent>
      {children}
    </HeaderComponent>
  );
};

export default Header;
