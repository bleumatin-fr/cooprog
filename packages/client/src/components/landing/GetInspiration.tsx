import styled from "@emotion/styled";
import { useTranslation } from "next-i18next";

const Container = styled.div`
  color: var(--color-orange);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  > h3 {
    color: var(--color-beige);
    font-variant: all-petite-caps;
    font-size: 52px;
    font-family: 'Libre Frankin Medium', sans-serif;
    -webkit-text-stroke: 2px var(--color-orange);
    text-stroke: 2px var(--color-orange);
    letter-spacing: 2px;
    max-width: 70%;

    .mobile & {
      max-width: 100%;
    }
  }
`;

const BarContainer = styled.div`
  margin-top: 20px;
  display: flex;
  color: var(--color-light-green);
  gap: 8px;
  font-size: 32px;
  align-items: center;
`;

const Bar = styled.div`
  background-color: var(--color-light-green);
  flex-grow: 1;
  height: 15px;
`;

const SubBarContainer = styled.div`
  color: var(--color-light-green);
  text-align: left;
  text-transform: uppercase;
  font-size: 18px;
`;

const GetInspiration = ({ value }: { value?: number }) => {
  const { t } = useTranslation();
  return (
    <Container>
      <h3>{t("landing:get-inspiration.title")}</h3>
      <div style={{ maxWidth: "400px", width: "100%" }}>
        <BarContainer>
          <Bar /> <div>{value}</div>
        </BarContainer>
        <SubBarContainer>
          {t("landing:get-inspiration.shared-projects")}
        </SubBarContainer>
      </div>
    </Container>
  );
};

export default GetInspiration;
