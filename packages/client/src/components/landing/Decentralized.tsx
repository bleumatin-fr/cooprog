import styled from "@emotion/styled";
import { useTranslation } from "next-i18next";

const Container = styled.div`
  color: var(--color-orange);
  > h3 {
    color: var(--color-light-green);
    font-variant: all-petite-caps;
    font-size: 52px;
    font-family: "Libre Frankin Medium", sans-serif;
    -webkit-text-stroke: 2px var(--color-dark-green);
    text-stroke: 2px var(--color-dark-green);
    letter-spacing: 2px;
    word-break: break-word;
  }
`;

const Decentralized = () => {
  const { t } = useTranslation();
  return (
    <Container>
      <h3>{t("landing:stakes-and-values.decentralized")}</h3>
    </Container>
  );
};

export default Decentralized;
