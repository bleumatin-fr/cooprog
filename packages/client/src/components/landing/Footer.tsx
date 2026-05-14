import styled from "@emotion/styled";
import { useTranslation } from "next-i18next";
import Image from "next/image";

import { useState } from "react";
import { ContactDialog } from "../layout/Contact";
import logo from "../layout/logo_beige.svg";
import LegalDialog from "./LegalDialog";
import SponsorsDialog from "./SponsorsDialog";

const Page = styled.div`
  min-width: calc(100vw - 40px);
  background-color: var(--color-dark-green);
  color: var(--color-beige);
  display: flex;
  justify-content: space-between;
  padding: 20px;

  &.mobile {
    flex-direction: column;
    gap: 20px;
  }
`;

const List = styled.ul`
  list-style-type: none;
  display: flex;
  flex-direction: row;
  gap: 10px;
  flex-wrap: wrap;
  .mobile & {
    flex-direction: column;
  }
`;

const ListItem = styled.li`
  margin: 10px;
  text-transform: uppercase;
  font-family: "Libre Franklin Medium", sans-serif;
  display: flex;
  font-size: 14px;
  align-items: center;
  cursor: pointer;

  > a {
    text-decoration: none;
  }

  &:hover {
    text-decoration: underline;
  }

  &:not(:last-child):after {
    margin-left: 20px;
    content: "⬤";
    font-size: 6px;
    display: inline-block;
  }

  .mobile &:after {
    display: none;
  }
`;

const ImageContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`;

interface FooterProps {
  className?: string;
}

const Footer = ({ className }: FooterProps) => {
  const { t, i18n } = useTranslation();
  const [legalOpen, setLegalOpen] = useState(false);
  const [sponsorsOpen, setSponsorsOpen] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);

  const onClose = () => {
    setLegalOpen(false);
    setSponsorsOpen(false);
  };

  const availableLanguages = ["fr", "en"];

  const language = availableLanguages.includes(i18n.language)
    ? i18n.language
    : "en";

  return (
    <>
      <ContactDialog
        open={contactOpen}
        handleClose={() => setContactOpen(false)}
      />
      <LegalDialog open={legalOpen} onClose={onClose} />
      <SponsorsDialog open={sponsorsOpen} onClose={onClose} />
      <Page className={className}>
        <List>
          <ListItem onClick={() => setLegalOpen(true)}>
            {t("landing:footer.legal")}
          </ListItem>
          <ListItem>
            <a href={`/tos-${language}.pdf`} target="_blank">
              {t("landing:footer.tos")}
            </a>
          </ListItem>
          <ListItem>
            <a href={`/privacy-${language}.pdf`} target="_blank">
              {t("landing:footer.privacy")}
            </a>
          </ListItem>
          <ListItem onClick={() => setSponsorsOpen(true)}>
            {t("landing:footer.sponsors")}
          </ListItem>
          <ListItem>
            <a href="https://github.com/bleumatin-fr/cooprog" target="_blank">
              {t("landing:footer.github")}
            </a>
          </ListItem>
          <ListItem onClick={() => setContactOpen(true)}>
            {t("landing:footer.contact")}
          </ListItem>
        </List>
        <ImageContainer>
          <Image src={logo} alt="logo" width={100} />
        </ImageContainer>
      </Page>
    </>
  );
};

export default Footer;
