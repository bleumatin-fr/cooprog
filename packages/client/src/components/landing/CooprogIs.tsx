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

const List = styled.ul`
  list-style-type: none;
  display: flex;
  flex-direction: column;
  margin-top: 20px;
`;

const ListItem = styled.li`
  margin: 10px;
  font-weight: normal;
  font-size: 22px;
  letter-spacing: 1px;

  &:not(:last-child):after {
    margin-top: 10px;
    display: block;
    content: "⬤";
  }

  &:nth-of-type(2):after {
    content: "⬤⬤";
  }
  &:nth-of-type(3):after {
    content: "⬤⬤⬤";
  }
`;

const CooprogIs = () => {
  const { t } = useTranslation();
  return (
    <Container>
      <h3>{t("landing:cooprog-is.title")}</h3>
      <List>
        <ListItem>{t("landing:cooprog-is.definitions.0")}</ListItem>
        <ListItem>{t("landing:cooprog-is.definitions.1")}</ListItem>
        <ListItem>{t("landing:cooprog-is.definitions.2")}</ListItem>
        <ListItem>{t("landing:cooprog-is.definitions.3")}</ListItem>
      </List>
    </Container>
  );
};

export default CooprogIs;
