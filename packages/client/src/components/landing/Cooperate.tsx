import styled from "@emotion/styled";
import { useTranslation } from "next-i18next";

const Container = styled.div`
  color: var(--color-orange);
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

const MembersContainer = styled.div`
  border-left: 15px solid var(--color-light-green);
  border-right: 15px solid var(--color-light-green);
  display: flex;
  flex-direction: column;
  margin-top: 20px;
  gap: 20px;

  color: var(--color-light-green);

  > div:nth-of-type(2) {
    font-size: 32px;
  }
  > div:nth-of-type(3) {
    text-tranform: uppercase;
    font-size: 18px;
  }
`;

const Cooperate = ({ value }: { value?: number }) => {
  const { t } = useTranslation();
  return (
    <Container>
      <h3>{t("landing:cooperate.title")}</h3>
      <MembersContainer>
        <div></div>
        <div>{value}</div>
        <div>{t("landing:cooperate.members")}</div>
      </MembersContainer>
    </Container>
  );
};

export default Cooperate;
