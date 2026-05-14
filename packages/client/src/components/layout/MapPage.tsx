import styled from "@emotion/styled";
import { Button, useMediaQuery, useTheme } from "@mui/material";
import { ReactNode } from "react";
import useDiscipline, { colors } from "./useDiscipline";

const Container = styled.div`
  width: 100%;
  display: flex;
`;

const LeftPanel = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  transition: width 0.4s ease-in-out;
  .show-map & {
    width: 65%;
  }
`;

const RightPanel = styled.div`
  width: 0%;
  position: sticky;
  border-radius: 16px;
  overflow: hidden;
  margin: 16px;
  top: calc(64px + 16px);
  height: calc(100vh - 64px - 32px);
  transition: transform 0.4s ease-in-out, width 0.4s ease-in-out;
  transform: translateX(100%);

  .show-map & {
    transform: translateX(0%);
    width: 35%;
  }

  .mobile & {
    position: absolute;
    left: 0;
    top: 0;
    right: 0;
    bottom: 0;
    width: 100% !important;
    height: 100vh;
    z-index: 3000;
    display: none;
  }
  .mobile.show-map & {
    transform: translateX(0%);
    display: block;
  }
`;

const SearchContainer = styled.div<{ backgroundColor?: string }>`
  position: sticky;
  top: 64px;
  box-shadow: 0px 8px 10px -15px #111;
  background-color: #fff;

  .mobile & {
    top: 56px;
  }
  left: auto;
  right: 0;
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 16px;
  z-index: 1000;
  > div {
    flex-wrap: wrap;
  }
`;

const HeaderContainer = styled.div`
  width: 100%;
  padding: 0 16px 16px;
  position: sticky;
  top: 142px;
  .mobile & {
    top: 122px;
  }
  justify-content: space-between;
  z-index: 1000;
  left: auto;
  right: 0;
  width: 100%;
  display: flex;
  align-items: center;
`;

export const GridContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  flex-grow: 1;
`;

const ResultsContainer = styled.div`
  position: relative;
  padding: 0 16px 16px 16px;
  flex-grow: 1;
  display: flex;
`;

interface MapPageProps {
  search: ReactNode;
  header?: ReactNode;
  map: ReactNode;
  results: ReactNode;
  showMap: boolean;
  setShowMap: (showMap: boolean) => void;
}

const MapPage = ({
  showMap,
  setShowMap,
  search,
  header,
  map,
  results,
}: MapPageProps) => {
  const theme = useTheme();
  const mobile = useMediaQuery(theme.breakpoints.down("sm"));
  const { discipline } = useDiscipline();

  let indicatorColors = discipline
    ? colors[discipline as keyof typeof colors]
    : undefined;

  return (
    <Container
      className={(showMap ? " show-map " : "") + (mobile ? " mobile " : "")}
    >
      <LeftPanel>
        <SearchContainer
          style={{ backgroundColor: indicatorColors?.background }}
        >
          {search}
        </SearchContainer>
        {header && <HeaderContainer>{header}</HeaderContainer>}
        <ResultsContainer>{results}</ResultsContainer>
      </LeftPanel>
      <RightPanel key={`${mobile}${showMap}`}>
        {mobile && (
          <Button
            variant="contained"
            onClick={() => {
              setShowMap(false);
            }}
            fullWidth
          >
            Hide map
          </Button>
        )}
        {map}
      </RightPanel>
    </Container>
  );
};

export default MapPage;
