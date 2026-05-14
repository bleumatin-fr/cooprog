import styled from "@emotion/styled";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import { useTranslation } from "next-i18next";

import Markdown from "../UI/Markdown";

const Container = styled.div`
  border: 2px solid var(--my-background-color);
  padding: 1rem;
  border-radius: 0.5rem;
`;

const Title = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.25rem;
  font-weight: 500;
  margin-bottom: 1rem;

  > span {
    flex-grow: 1;
  }
`;

const ExplanationContainer = styled.div`
  margin-top: 1rem;
`;

const ArtisticTeamExplanation = () => {
  const { t } = useTranslation();

  return (
    <Container>
      <Title>
        <CalendarMonthOutlinedIcon />
        <span>{t("projects:tours.artistic-team-programmation.title")}</span>
      </Title>
      <ExplanationContainer>
        <Markdown>
          {t(`projects:tours.artistic-team-programmation.explanation`)}
        </Markdown>
      </ExplanationContainer>
    </Container>
  );
};

export default ArtisticTeamExplanation;
