import styled from "@emotion/styled";
import { ReactNode } from "react";

const SubtitleComponent = styled.h2`
  padding: 24px;

  > div {
    max-width: 1200px;
    margin: 0 auto;
  }
`;

const Subtitle = ({ children }: { children: ReactNode }) => {
  return <SubtitleComponent>{children}</SubtitleComponent>;
};

export default Subtitle;
