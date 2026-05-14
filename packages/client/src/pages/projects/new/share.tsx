import { useRouter } from "next/router";
import { useTranslation } from "next-i18next";
import styled from "@emotion/styled";
import ShareInformation from "@/components/newProject/ShareInformation";
import { useSnackbar } from "notistack";
import useProjects from "@/components/projects/useProjects";
import useUser from "@/components/authentication/useUser";
import { User } from "@cooprog/core";
import { QueryClient, dehydrate } from "react-query";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { GetServerSideProps } from "next";
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

const NewProjectSharePage = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();
  const { create, uploadFiles, loading } = useProjects(null);
  const { user } = useUser();
  const { generalInfos, resetGeneralInfos } = useNewProjectForm();

  const steps = [
    t("common:dialogs.new-project.steps.project-information"),
    t("common:dialogs.new-project.steps.tour-information"),
    t("common:dialogs.new-project.steps.share"),
  ];

  const handleValidateShare = async (
    values: (User | string)[],
    customMessage?: string
  ) => {
    try {
      if (!generalInfos) {
        enqueueSnackbar("Error creating project", { variant: "error" });
        return;
      }
      // Extraire tous les champs pertinents pour s'assurer qu'ils sont inclus
      const {
        artist,
        work,
        places,
        genres,
        targetAudiences,
        description,
        artisticTeam,
        artisticTeamCustomMessage,
        financialSupport,
        gauge,
        minimumStageSize,
        averagePerformanceFee,
        numberOfPeopleOnTour,
        numberOfArtistOnStage,
        venueConfigurationType,
        venueConfigurationSpace,
        venueConfigurationAudience,
        performanceLanguages,
        accessibilityVisual,
        accessibilityAudio,
        tourName,
        start,
        end,
        artisticTeamPlace,
        links,
        schedule,
        discipline,
        complementaryGenre,
        emergingArtist,
        culturalActionInterest,
        numberOfMenOnStage,
        numberOfWomenOnStage,
        numberOfNonBinaryOnStage,
      } = generalInfos;

      const project = await create({
        artist,
        work,
        places,
        genres,
        targetAudiences,
        description,
        artisticTeam,
        artisticTeamCustomMessage,
        financialSupport,
        gauge,
        minimumStageSize,
        averagePerformanceFee,
        numberOfPeopleOnTour,
        numberOfArtistOnStage,
        venueConfigurationType,
        venueConfigurationSpace,
        venueConfigurationAudience,
        performanceLanguages,
        accessibilityVisual,
        accessibilityAudio,
        tourName,
        start,
        end,
        artisticTeamPlace,
        links,
        schedule,
        discipline,
        complementaryGenre,
        emergingArtist,
        culturalActionInterest,
        numberOfMenOnStage,
        numberOfWomenOnStage,
        numberOfNonBinaryOnStage,
        notify: values.map((user) => {
          if (typeof user === "string") return user;
          return user._id;
        }),
        customMessage,
      });
      if (generalInfos.files && generalInfos.files.length > 0) {
        const response = await uploadFiles({
          projectId: project._id,
          files: generalInfos.files,
        });
      }
      enqueueSnackbar("Project created!", { variant: "success" });
      resetGeneralInfos();
      router.push(`/projects/${project._id}`);
    } catch (error) {
      console.log(error);
      enqueueSnackbar("Error creating project", { variant: "error" });
    }
  };

  if (!user) {
    return <LoadingPage />;
  }

  return (
    <Dialog fullScreen open>
      <DialogTitle sx={{ position: "sticky", top: 0, zIndex: 1000 }}>
        <NewProjectAppBar title={t("common:dialogs.new-project.title")}>
          <NewProjectStepper activeStep={2} steps={steps} />
        </NewProjectAppBar>
      </DialogTitle>
      <ShareInformation
        onPrevious={() => router.push("/projects/new/tour")}
        onValidate={handleValidateShare}
        user={user}
        loading={loading}
      />
    </Dialog>
  );
};

export default NewProjectSharePage;
