import styled from "@emotion/styled";
import { useTranslation } from "next-i18next";
import Image from "next/image";
import mobility from "../UI/icons/mobility.svg";
import Markdown from "../UI/Markdown";
import { Button } from "@mui/material";
import AddLocationAltIcon from "@mui/icons-material/AddLocationAlt";
import { useRouter } from "next/router";

const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  gap: 32px;
  padding: 64px 0;

  > img {
    max-width: 200px;
    max-height: 200px;
    flex-grow: 0;
    flex-shrink: 1;
    opacity: 0.5;
  }

  > div {
    max-width: 400px;
    text-align: center !important;
  }
`;

const EmptyProjectList = () => {
  const { t } = useTranslation();
  const router = useRouter();
  return (
    <Container>
      <Image src={mobility} alt="" />
      <Markdown>{t("projects:empty")}</Markdown>
      <Button
        variant="contained"
        color="primary"
        startIcon={<AddLocationAltIcon />}
        onClick={() => {
          router.push("/projects/new");
        }}
      >
        {t("common:new-project")}
      </Button>
    </Container>
  );
};

export default EmptyProjectList;
