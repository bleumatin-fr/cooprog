import styled from "@emotion/styled";
import BaseBlock from "../layout/Block";

const Block = styled(BaseBlock)`
  display: flex;
  flex-direction: column;
  padding: 0;

  background-color: var(--dashboard-${({ color }) => color}-main);
  color: var(--dashboard-${({ color }) => color}-contrastText);
`;

const Title = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  white-space: nowrap;

  h2 {
    font-size: 24px;
    margin-top: 2px;
    text-align: center;
    font-variant: small-caps;
    flex-grow: 1;
    font-family: "Libre Franklin Medium", sans-serif;
  }

  > div {
    display: flex;
  }
`;

interface BlockProps {
  title?: string;
  children?: React.ReactNode;
  button?: React.ReactNode;
  style?: React.CSSProperties;
  color?: string;
}

const Dashblock = ({
  title,
  children,
  button,
  style,
  color = "default",
}: BlockProps) => {
  return (
    <Block color={color} style={style}>
      {title && (
        <Title>
          <h2>{title}</h2>
          {button && <div>{button}</div>}
        </Title>
      )}
      {children}
    </Block>
  );
};

export default Dashblock;
