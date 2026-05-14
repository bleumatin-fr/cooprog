import styled from "@emotion/styled";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import { Button } from "@mui/material";
import { Trans, useTranslation } from "next-i18next";
import Link from "next/link";
import { Stats } from "../landing/getStats";
import ProjectsIcon from "./ProjectsIcon";

const Title = styled.h2`
  font-size: 24px;
  margin-top: 2px;
  margin-bottom: 16px;
  font-variant: small-caps;
  text-align: center;
  font-family: "Libre Franklin Medium", sans-serif;
`;

const Container = styled.div`
  border-radius: 8px;
  box-shadow: 0 0 4px 0 rgba(0, 0, 0, 0.1);
  background-color: white;
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 16px 32px;
`;

const ContentRow = styled.div`
  display: flex;
  flex-direction: row;
  gap: 32px;
`;

const StatsContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 16px;
`;

const Stat = styled.div`
  font-size: 32px;

  > *:nth-of-type(1) {
    color: var(--color-light-orange);
  }

  > *:nth-of-type(2) {
    margin-left: 8px;
  }
`;
const Substat = styled.div`
  display: flex;
  flex-direction: row;
  gap: 8px;
  align-items: baseline;
  font-size: 22px;
  color: var(--color-text-gray);
`;

const Value = styled.div`
  font-size: 2em;
`;

const Label = styled.div`
  font-size: 0.5em;
`;

const IconContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  width: 100px;

  > svg {
    width: 100%;
  }
`;

interface AllProjectsBlockProps {
  stats: Stats;
}

const AllProjectsBlock = ({ stats }: AllProjectsBlockProps) => {
  const { t } = useTranslation();

  return (
    <div>
      <Container>
        <ContentRow>
          <IconContainer>
            <ProjectsIcon />
          </IconContainer>
          <StatsContainer>
            <Stat>
              <Trans
                i18nKey="home:all-cooprog.all-projects.main"
                components={[<Value key={1} />, <Label key={2} />]}
                values={{ count: stats.projectCount }}
              />
            </Stat>
            {stats.lastMonthProjectCount > 1 && (
              <Substat>
                <TrendingUpIcon />
                <Trans
                  i18nKey="home:all-cooprog.all-projects.sub"
                  components={[<Value key={1} />, <Label key={2} />]}
                  values={{ count: stats.lastMonthProjectCount }}
                />
              </Substat>
            )}
          </StatsContainer>
        </ContentRow>
        <Button
          variant="contained"
          color="primary"
          component={Link}
          href="/projects"
          fullWidth
          sx={{
            fontSize: "11px",
            textAlign: "center",
          }}
        >
          {t("home:all-cooprog.all-projects.submit")}
        </Button>
      </Container>
    </div>
  );
};

export default AllProjectsBlock;
