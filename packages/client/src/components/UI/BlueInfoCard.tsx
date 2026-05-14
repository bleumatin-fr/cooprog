import styled from "@emotion/styled";
import { ReactNode } from "react";

const Card = styled.div`
  margin: 16px 0;
  font-size: 1rem;
  line-height: 1.5;
  color: var(--color-dark-blue);
  background-color: var(--color-light-blue);
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  display: flex;
  align-items: flex-start;
  gap: 16px;
`;

const IconContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-dark-blue);
  fill: var(--color-dark-blue) !important;
  background: linear-gradient(
    135deg,
    var(--color-primary) 0%,
    var(--color-primary-light) 100%
  );

  svg {
    fill: var(--color-dark-blue) !important;
  }
`;

const Content = styled.div`
  flex: 1;

  > p {
    margin: 0;
  }
`;

interface BlueInfoCardProps {
  icon?: ReactNode;
  children: ReactNode;
}

const BlueInfoCard = ({ icon, children }: BlueInfoCardProps) => {
  return (
    <Card>
      {icon ? <IconContainer>{icon}</IconContainer> : null}
      <Content>{children}</Content>
    </Card>
  );
};

export default BlueInfoCard;
