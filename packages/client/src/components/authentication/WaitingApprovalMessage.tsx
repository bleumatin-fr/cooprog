"use client";

import { useTranslation } from "next-i18next";
import Markdown from "@/components/UI/Markdown";

const WaitingApprovalMessage = () => {
  const { t } = useTranslation();

  return (
    <div style={{ fontSize: "0.8rem", width: "100%", whiteSpace: "pre-line" }}>
      <Markdown>{t("authentication:waiting-approval.message")}</Markdown>
    </div>
  );
};

export default WaitingApprovalMessage;
