import styled from "@emotion/styled";
import { ReactNode } from "react";

const TitleComponent = styled.h1`
  padding: 0 24px;
  font-size: 18px;
  > div {
    max-width: 1200px;
    margin: 0 auto;
  }
`;

const Title = ({ children }: { children: ReactNode }) => {
  return <TitleComponent>{children}</TitleComponent>;
};

export default Title;
