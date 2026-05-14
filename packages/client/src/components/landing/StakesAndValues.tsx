import styled from "@emotion/styled";
import { useTranslation } from "next-i18next";

const Container = styled.div`
  color: var(--color-beige);
  max-width: 800px;
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
    color: var(--color-dark-green);
  }

  &:nth-of-type(2):after {
    content: "⬤⬤";
  }
  &:nth-of-type(3):after {
    content: "⬤⬤⬤";
  }
  &:nth-of-type(4):after {
    content: "⬤⬤⬤⬤";
  }
  &:nth-of-type(5):after {
    content: "⬤⬤⬤⬤⬤";
  }
  &:nth-of-type(6):after {
    content: "⬤⬤⬤⬤⬤⬤";
  }
`;

const StakesAndValues = () => {
  const { t } = useTranslation();

  return (
    <Container>
      <List>
        <ListItem>{t("landing:stakes-and-values.definitions.0")}</ListItem>
        <ListItem>{t("landing:stakes-and-values.definitions.1")}</ListItem>
        <ListItem>{t("landing:stakes-and-values.definitions.2")}</ListItem>
        <ListItem>{t("landing:stakes-and-values.definitions.3")}</ListItem>
        <ListItem>{t("landing:stakes-and-values.definitions.4")}</ListItem>
        <ListItem>{t("landing:stakes-and-values.definitions.5")}</ListItem>
        <ListItem>{t("landing:stakes-and-values.definitions.6")}</ListItem>
      </List>
    </Container>
  );
};

export default StakesAndValues;
