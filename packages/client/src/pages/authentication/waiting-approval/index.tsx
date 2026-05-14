import {
  CenteredContainer as BaseCenteredContainer,
  default as BaseBlock,
} from "@/components/layout/Block";
import Page from "@/components/layout/Page";
import Dialog, {
  DialogTitle,
  DialogContent,
  DialogActions,
  SideActionsContainer,
} from "@/components/UI/Dialog";

import styled from "@emotion/styled";
import { GetServerSideProps } from "next";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import dynamic from "next/dynamic";
import Link from "next/link";
import { dehydrate, QueryClient } from "react-query";
import { i18n } from "next-i18next";

const Block = styled(BaseBlock)`
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-width: 600px;
  width: 100%;

  > div:first-of-type {
    display: flex;
    align-items: center;
    gap: 16px;
    justify-content: space-between;
    > div:last-of-type {
      width: 40%;
    }
  }
`;

const ContentContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  gap: 16px;
  margin-top: 16px;
  > * {
    flex: 1;
  }
`;

const ModerationSuspendedMessage = styled.div`
  margin-top: 16px;
  padding: 16px;
  background-color: #fff3cd;
  border: 1px solid #ffeaa7;
  border-radius: 4px;
  color: #856404;
  white-space: pre-line;
  font-size: 0.8rem;
`;

const namespaces = ["common", "authentication"];

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { locale } = context;
  const queryClient = new QueryClient();

  if (process.env.NODE_ENV === "development") {
    await i18n?.reloadResources();
  }

  return {
    props: {
      dehydratedState: dehydrate(queryClient),
      ...(await serverSideTranslations(locale || "en", namespaces)),
    },
  };
};
const WaitingApprovalMessage = dynamic(
  () => import("@/components/authentication/WaitingApprovalMessage"),
  { ssr: false }
);

const WaitingApproval = () => {
  const { t } = useTranslation(namespaces);

  // Check if current month is August (month index 7)
  const isAugust = new Date().getMonth() === 7;

  return (
    <Page>
      <Dialog open showCloseButton={false} hideBackdrop>
        <DialogTitle>{t("authentication:waiting-approval.title")}</DialogTitle>
        <DialogContent>
          <h3>{t("authentication:waiting-approval.subtitle")}</h3>
          <ContentContainer>
            <WaitingApprovalMessage />
            {isAugust && (
              <ModerationSuspendedMessage>
                {t("authentication:waiting-approval.moderation-suspended")}
              </ModerationSuspendedMessage>
            )}
          </ContentContainer>
        </DialogContent>
        <DialogActions>
          <SideActionsContainer>
            <Link href="/">
              <p style={{ color: "black" }}>
                {t("authentication:waiting-approval.back")}
              </p>
            </Link>
          </SideActionsContainer>
        </DialogActions>
      </Dialog>
    </Page>
  );
};

export default WaitingApproval;
