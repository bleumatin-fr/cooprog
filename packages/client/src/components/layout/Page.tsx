import styled from "@emotion/styled";
import { ReactNode } from "react";
import LanguageSwitcher from "./LanguageSwitcher";

interface StyleProps {
  fullWidth?: boolean;
}

const PageContainer = styled.main<StyleProps>`
  padding: ${(props) => !props.fullWidth && "0 24px"};
  flex-grow: 1;
  display: flex;
`;

const Container = styled.div<StyleProps>`
  margin: 0 auto;
  max-width: ${(props) => !props.fullWidth && "1280px"};
  width: 100%;
  display: flex;
  flex-direction: column;
`;

const LanguageSwitcherContainer = styled.div`
  position: fixed;
  top: 16px;
  right: 16px;

  > div {
    position: sticky;
    top: 16px;
  }
`;

interface PageProps {
  children: ReactNode;
  className?: string;
  mainClass?: string;
  fullWidth?: boolean;
  style?: React.CSSProperties;
}

const Page = ({
  children,
  className,
  fullWidth,
  style,
  mainClass,
}: PageProps) => (
  <PageContainer fullWidth={fullWidth} className={mainClass}>
    <LanguageSwitcherContainer>
      <LanguageSwitcher />
    </LanguageSwitcherContainer>
    <Container fullWidth={fullWidth} style={style} className={className}>
      {children}
    </Container>
  </PageContainer>
);

export default Page;
