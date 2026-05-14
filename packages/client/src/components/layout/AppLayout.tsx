import styled from "@emotion/styled";
import { useMediaQuery, useTheme, useColorScheme } from "@mui/material";
import { useTranslation } from "next-i18next";
import { ReactNode, useEffect } from "react";
import DisciplineSelectDialog from "../UI/DisciplineSelectDialog";
import AppBar from "./AppBar";
import Contact from "./Contact";
import NoMainLocationBanner from "./NoMainLocationBanner";
import useDiscipline, { colors } from "./useDiscipline";

const Container = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: stretch;
`;

const Layout = ({
  children,
  showContact = true,
  showDiscipline = true,
}: {
  children: ReactNode;
  showContact?: boolean;
  showDiscipline?: boolean;
}) => {
  const theme = useTheme();
  const mobile = useMediaQuery(theme.breakpoints.down("sm"));
  const { mode, setMode } = useColorScheme();
  const { i18n } = useTranslation();
  const { discipline } = useDiscipline();

  useEffect(() => {
    setMode("light");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (process.env.NODE_ENV === "development") {
    i18n?.reloadResources();
  }

  let indicatorColors = undefined;
  if (showDiscipline) {
    indicatorColors = discipline
      ? colors[discipline as keyof typeof colors]
      : undefined;
  }

  return (
    <Container
      className={mobile ? "mobile" : ""}
      style={{
        backgroundColor: indicatorColors?.background,
      }}
    >
      <AppBar indicatorColor={indicatorColors?.accent} />
      <NoMainLocationBanner />
      {showContact && <Contact />}
      <DisciplineSelectDialog />
      {children}
    </Container>
  );
};

export default Layout;
