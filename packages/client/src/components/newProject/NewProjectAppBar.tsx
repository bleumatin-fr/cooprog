import {
  Button,
  styled,
  Typography,
  Container as BaseContainer,
} from "@mui/material";
import { Toolbar } from "@mui/material";
import { AppBar } from "@mui/material";
import Logo from "../layout/Logo";

const Container = styled(BaseContainer)`
  --mui-palette-primary-main: var(--button-primary-background-color);
  padding: 0 16px !important;
  max-width: 1280px !important;
`;

const NewProjectAppBar = ({
  title,
  children,
}: {
  title: string;
  children?: React.ReactNode;
}) => {
  return (
    <AppBar
      sx={{
        backgroundColor: "var(--color-white)",
        color: "var(--color-blacK)",
        position: "sticky",
        top: 0,
        zIndex: 1000,
      }}
    >
      <Container>
        <Toolbar>
          <Logo />
          <Typography sx={{ ml: 2, flex: 1 }} variant="h6" component="div">
            {title}
          </Typography>
          {children}
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default NewProjectAppBar;
