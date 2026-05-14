import { useRouter } from "next/router";
import { useTranslation } from "next-i18next";
import styled from "@emotion/styled";
import TourCreateForm from "@/components/newProject/TourCreateForm";
import { TourInformationProps } from "@/components/newProject/TourCreateForm";
import { useSnackbar } from "notistack";
import useUser from "@/components/authentication/useUser";
import { GetServerSideProps } from "next";
import { dehydrate, QueryClient } from "react-query";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import NewProjectAppBar from "@/components/newProject/NewProjectAppBar";
import NewProjectStepper from "@/components/newProject/NewProjectStepper";
import useNewProjectForm from "@/components/newProject/useNewProjectForm";
import LoadingPage from "@/components/UI/LoadingPage";
import { i18n } from "next-i18next";
import { Dialog, DialogTitle } from "@/components/UI";

const namespaces = ["common", "authentication", "projects", "users"];

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

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
`;

const NewProjectTourPage = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();
  const { user } = useUser();
  const { loading, generalInfos, setGeneralInfos, resetGeneralInfos } =
    useNewProjectForm();

  const steps = [
    t("common:dialogs.new-project.steps.project-information"),
    t("common:dialogs.new-project.steps.tour-information"),
    t("common:dialogs.new-project.steps.share"),
  ];

  const handleValidateTour = async (values: TourInformationProps) => {
    try {
      if (generalInfos) {
        setGeneralInfos({ ...generalInfos, ...values });
      }
      router.push("/projects/new/share");
    } catch (error) {
      console.error(error);
      enqueueSnackbar("Error saving tour information", { variant: "error" });
    }
  };

  if (!user || loading) {
    return <LoadingPage />;
  }

  return (
    <Dialog fullScreen open>
      <DialogTitle sx={{ position: "sticky", top: 0, zIndex: 1000 }}>
        <NewProjectAppBar title={t("common:dialogs.new-project.title")}>
          <NewProjectStepper activeStep={1} steps={steps} />
        </NewProjectAppBar>
      </DialogTitle>
      <TourCreateForm
        tourInfos={generalInfos}
        onCancel={() => {
          resetGeneralInfos();
          router.push("/projects");
        }}
        onChange={(values) => {
          if (generalInfos) {
            setGeneralInfos({
              ...generalInfos,
              ...values,
            });
          }
        }}
        onValidate={handleValidateTour}
        showPreviousButton={true}
      />
    </Dialog>
  );
};

export default NewProjectTourPage;
