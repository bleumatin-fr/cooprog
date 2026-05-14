import { TargetAudience, Discipline } from "@cooprog/core";
import { useTranslation } from "react-i18next";

const useTargetAudiences = () => {
  const { t } = useTranslation();
  const targetAudiences = t("projects:targetAudiences", {
    returnObjects: true,
  }) as TargetAudience[];

  return targetAudiences;
};

export default useTargetAudiences;
