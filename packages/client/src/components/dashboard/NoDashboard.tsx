import styled from "@emotion/styled";
import { Typography, Box } from "@mui/material";
import { useTranslation } from "next-i18next";
import useUser from "../authentication/useUser";
import Markdown from "../UI/Markdown";
import Image from "next/image";
import NoDashboardIllustration from "./NoDashboardIllustration.svg";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 32px;
  border-radius: 16px;
  background-color: #fff;
  text-align: center;
  max-width: 600px;
  margin: 0 auto;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const IllustrationContainer = styled.div`
  margin: 24px 0;
  position: relative;
  width: 200px;
  height: 200px;
`;

const ContentContainer = styled.div`
  margin-top: 16px;
`;

const NoDashboard = () => {
  const { t } = useTranslation();
  const { user } = useUser();

  return (
    <Container>
      <IllustrationContainer>
        <Image
          src={NoDashboardIllustration}
          alt="No Dashboard Illustration"
          width={200}
          height={200}
          priority
        />
      </IllustrationContainer>
      <Typography variant="h5" gutterBottom>
        {t("home:no_dashboard.title", {
          role: t(`common:roles.${user?.role.toLowerCase()}`),
        })}
      </Typography>

      <ContentContainer>
        <Markdown>
          {t("home:no_dashboard.description", {
            role: t(`common:roles.${user?.role.toLowerCase()}`),
          })}
        </Markdown>
      </ContentContainer>
    </Container>
  );
};

export default NoDashboard;
