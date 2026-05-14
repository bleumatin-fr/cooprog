import styled from "@emotion/styled";
import { ReactElement } from "react";

const SubtitleContainer = styled.h2`
  color: ${(props) => props.color};
  margin: 20px 0 20px 20px;
  font-size: 32px;
  font-weight: 500;
  font-family: 'Libre Franklin Medium', sans-serif;
`;

interface SubtitleProps {
  id?: string;
  color: string;
  children: ReactElement | string;
}

const Subtitle = ({ id, color, children }: SubtitleProps) => {
  return (
    <SubtitleContainer id={id} color={color}>
      ⬤ {children}
    </SubtitleContainer>
  );
};

export default Subtitle;
