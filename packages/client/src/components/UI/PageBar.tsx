import styled from "@emotion/styled";
import {
  AppBar as BaseAppBar,
  AppBarProps,
  Container as BaseContainer,
} from "@mui/material";

const AppBar = styled(BaseAppBar)`
  --mui-palette-primary-main: var(--app-bar-background-color);
  --AppBar-color: var(--app-bar-color);
`;

const Container = styled(BaseContainer)`
  --mui-palette-primary-main: var(--button-primary-background-color);
  padding: 0 16px !important;
  max-width: 1280px !important;
`;

const PageBar = ({ children, className, ...rest }: AppBarProps) => {
  return (
    <AppBar className="app-bar" {...rest} >
      <Container>{children}</Container>
    </AppBar>
  );
};
export default PageBar;
