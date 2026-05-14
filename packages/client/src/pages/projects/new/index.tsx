import { useRouter } from "next/router";
import { useTranslation } from "next-i18next";
import ProjectCreationForm from "@/components/newProject/ProjectCreationForm";
import useNewProjectForm, {
  GeneralInfoProps,
} from "@/components/newProject/useNewProjectForm";
import { useSnackbar } from "notistack";
import useProjects from "@/components/projects/useProjects";
import useUser from "@/components/authentication/useUser";
import { GetServerSideProps } from "next";
import { dehydrate, QueryClient } from "react-query";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import NewProjectAppBar from "@/components/newProject/NewProjectAppBar";
import NewProjectStepper from "@/components/newProject/NewProjectStepper";
import LoadingPage from "@/components/UI/LoadingPage";
import { i18n } from "next-i18next";
import { Dialog, DialogTitle } from "@/components/UI";
import { Place, Role } from "@cooprog/core";
import ProjectCreatedArtisticTeamDialog from "@/components/projects/ProjectCreatedArtisticTeamDialog";
import { useRef, useState } from "react";

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

const NewProjectPage = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();
  const { create, uploadFiles, loading: projectsLoading } = useProjects(null);
  const { user } = useUser();
  const { loading, generalInfos, setGeneralInfos, resetGeneralInfos } =
    useNewProjectForm();
  const [
    showProjectCreatedArtisticTeamDialog,
    setShowProjectCreatedArtisticTeamDialog,
  ] = useState(false);
  const createdProjectId = useRef<string | null>(null);

  const steps = [
    t("common:dialogs.new-project.steps.project-information"),
    t("common:dialogs.new-project.steps.tour-information"),
    t("common:dialogs.new-project.steps.share"),
  ];
  const newProjectTitle =
    user?.role === Role.ARTISTIC_TEAM
      ? t("common:dialogs.new-project.title-artistic-team")
      : t("common:dialogs.new-project.title");
  const handleValidateProjectAsArtisticTeam = async (
    values: GeneralInfoProps
  ) => {
    try {
      const mainUserLocation = user?.locations.find(
        (location) => location.isMain
      );
      if (!generalInfos || !user || !mainUserLocation) {
        enqueueSnackbar("Error creating project, please set a main location", {
          variant: "error",
        });
        return;
      }
      // Extraire tous les champs pertinents pour s'assurer qu'ils sont inclus
      const {
        artist,
        work,
        genres,
        targetAudiences,
        description,
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
        links,
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
        places: [
          {
            id: mainUserLocation?._id || "",
            country: mainUserLocation?.location.data.country || "",
            region: mainUserLocation?.location.data.state || "",
            city: mainUserLocation?.location.data.city || "",
            geolocation: {
              coordinates: mainUserLocation?.location.geolocation
                .coordinates || [0, 0],
            },
          } as Place,
        ],
        genres,
        targetAudiences,
        description,
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
        links,
        discipline,
        complementaryGenre,
        emergingArtist,
        culturalActionInterest,
        numberOfMenOnStage,
        numberOfWomenOnStage,
        numberOfNonBinaryOnStage,
      });
      if (generalInfos.files && generalInfos.files.length > 0) {
        const response = await uploadFiles({
          projectId: project._id,
          files: generalInfos.files,
        });
      }
      setShowProjectCreatedArtisticTeamDialog(true);
      createdProjectId.current = project._id;
    } catch (error) {
      console.error(error);
      enqueueSnackbar("Error saving project information", { variant: "error" });
    }
  };

  const handleValidateProjectAsDiffusionStructure = async (
    values: GeneralInfoProps
  ) => {
    try {
      let extra: Partial<GeneralInfoProps> = {};
      if (
        values.places &&
        values.places.length &&
        !generalInfos?.artisticTeamPlace
      ) {
        extra.artisticTeamPlace = values.places[0];
      }

      setGeneralInfos({
        ...generalInfos,
        ...values,
        ...extra,
      });
      router.push("/projects/new/tour");
    } catch (error) {
      console.error(error);
      enqueueSnackbar("Error saving project information", { variant: "error" });
    }
  };

  const handleValidateProject = async (values: GeneralInfoProps) => {
    if (user?.role === Role.ARTISTIC_TEAM) {
      return handleValidateProjectAsArtisticTeam(values);
    } else {
      return handleValidateProjectAsDiffusionStructure(values);
    }
  };

  if (!user || loading) {
    return <LoadingPage />;
  }

  return (
    <Dialog fullScreen open>
      <DialogTitle sx={{ position: "sticky", top: 0, zIndex: 1000 }}>
        <NewProjectAppBar title={newProjectTitle}>
          {user?.role !== Role.ARTISTIC_TEAM && (
            <NewProjectStepper activeStep={0} steps={steps} />
          )}
        </NewProjectAppBar>
      </DialogTitle>
      {user?.role === Role.ARTISTIC_TEAM && (
        <ProjectCreatedArtisticTeamDialog
          open={showProjectCreatedArtisticTeamDialog}
          onClose={() => {
            setShowProjectCreatedArtisticTeamDialog(false);
            resetGeneralInfos();
            router.push(`/projects/${createdProjectId.current}`);
          }}
        />
      )}
      <ProjectCreationForm
        generalInfos={generalInfos}
        onCancel={() => {
          resetGeneralInfos();
          router.push("/projects");
        }}
        onChange={(values) => {
          setGeneralInfos({
            ...generalInfos,
            ...values,
          });
        }}
        onValidate={handleValidateProject}
        loading={projectsLoading}
      />
    </Dialog>
  );
};

export default NewProjectPage;
