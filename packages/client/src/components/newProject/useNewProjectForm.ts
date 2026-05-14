import {
  Discipline,
  Link,
  Place,
  ProgramStatuses,
  Project,
  User,
} from "@cooprog/core";
import { useEffect, useMemo, useState } from "react";
import { useLocalStorage } from "usehooks-ts";
import * as yup from "yup";

export interface TempFile {
  file: File;
  name: string;
  originalFilename: string;
  userId: string;
}

export interface SerializedTempFile {
  file: string;
  name: string;
  originalFilename: string;
  userId: string;
}

export interface GeneralInfoProps<
  T extends TempFile | SerializedTempFile = TempFile
> extends Omit<Partial<Project>, "files"> {
  discipline?: Discipline | undefined;
  artist: string;
  work?: string | undefined;
  places: Place[];
  genres: string[];
  complementaryGenre?: string | undefined;
  targetAudiences: string[];
  description: string;
  artisticTeam?: Partial<User> | undefined;
  artisticTeamCustomMessage?: string | undefined;
  financialSupport: string;
  gauge: string[];
  minimumStageSize: string[];
  averagePerformanceFee: string[];
  venueConfigurationType: string[];
  venueConfigurationSpace: string[];
  venueConfigurationAudience: string[];
  numberOfPeopleOnTour?: number;
  numberOfArtistOnStage?: number;
  numberOfMenOnStage?: number;
  numberOfWomenOnStage?: number;
  numberOfNonBinaryOnStage?: number;
  performanceLanguages: string[];
  accessibilityVisual?: boolean;
  accessibilityAudio?: boolean;
  emergingArtist?: boolean;
  culturalActionInterest?: boolean;

  tourName?: string;
  start?: Date;
  end?: Date;
  artisticTeamPlace?: Place;
  links?: Link[];
  files?: T[];
  peopleTransportMode?: string;
  decorationsTransportMode?: string;
  decorationsWeight?: number;
  month?: number;
  year?: number;
  schedule: {
    _id: string;
    date: Date;
    status: ProgramStatuses;
    user?: User;
  }[];
}

const defaultGeneralInfos: GeneralInfoProps<SerializedTempFile> = {
  artist: "",
  work: "",
  places: [],
  genres: [],
  targetAudiences: [],
  description: "",
  financialSupport: "",
  minimumStageSize: [],
  gauge: [],
  averagePerformanceFee: [],
  venueConfigurationType: [],
  venueConfigurationSpace: [],
  venueConfigurationAudience: [],
  performanceLanguages: [],
  accessibilityVisual: false,
  accessibilityAudio: false,
  tourName: "",
  start: undefined,
  end: undefined,
  links: [],
  files: [],
  artisticTeamPlace: undefined,
  schedule: [],
};

const generalInfosSchema = yup.object({
  artisticTeamCustomMessage: yup.string().optional(),
  artist: yup.string(),
  work: yup.string(),
  places: yup.array(yup.object()),
  genres: yup.array(yup.string()),
  targetAudiences: yup.array(yup.string()),
  description: yup.string(),
  financialSupport: yup.string(),
  minimumStageSize: yup.array(yup.string()),
  gauge: yup.array(yup.string()),
  averagePerformanceFee: yup.array(yup.string()),
  venueConfigurationType: yup.array(yup.string()),
  venueConfigurationSpace: yup.array(yup.string()),
  venueConfigurationAudience: yup.array(yup.string()),
  performanceLanguages: yup.array(yup.string()),
  accessibilityVisual: yup.boolean().optional(),
  accessibilityAudio: yup.boolean().optional(),
  tourName: yup.string(),
  start: yup.date().optional(),
  end: yup.date().optional(),
  artisticTeamPlace: yup.object().optional(),
  links: yup.array(yup.object()),
  files: yup.array(yup.object()),
  schedule: yup.array(yup.object()),
  discipline: yup.string().optional(),
  complementaryGenre: yup.string().optional(),
  emergingArtist: yup.boolean().optional(),
  culturalActionInterest: yup.boolean().optional(),
  numberOfMenOnStage: yup.number().optional(),
  numberOfWomenOnStage: yup.number().optional(),
  numberOfNonBinaryOnStage: yup.number().optional(),
});

const tempFileToSerializedTempFile = async (
  file: TempFile
): Promise<SerializedTempFile> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file.file);
    reader.onloadend = function () {
      resolve({
        file: reader.result as string,
        name: file.name,
        originalFilename: file.originalFilename,
        userId: file.userId,
      });
    };
  });
};

const dataURItoFile = function (fileName: string, dataURI: string) {
  const byteString = atob(dataURI.split(",")[1]);
  const mimeType = dataURI.split(",")[0].split(":")[1].split(";")[0];
  const typedArray = new Uint8Array(byteString.length);
  for (let i = 0; i < byteString.length; i++) {
    typedArray[i] = byteString.charCodeAt(i);
  }
  return new File([typedArray], fileName, { type: mimeType });
};

const serializedTempFileToTempFile = async (
  file: SerializedTempFile
): Promise<TempFile> => {
  return {
    file: dataURItoFile(file.originalFilename, file.file),
    name: file.name,
    originalFilename: file.originalFilename,
    userId: file.userId,
  };
};

const useNewProjectForm = () => {
  const [generalInfosStorage, setGeneralInfosStorage] = useLocalStorage<
    GeneralInfoProps<SerializedTempFile>
  >("newProjectData", defaultGeneralInfos, {
    serializer: (value) => {
      try {
        return JSON.stringify(value);
      } catch (error) {
        console.error("Error serializing new project data", error);
        return JSON.stringify(defaultGeneralInfos);
      }
    },
    deserializer: (value) => {
      try {
        return JSON.parse(value);
      } catch (error) {
        console.error("Error deserializing new project data", error);
        return defaultGeneralInfos;
      }
    },
  });

  const [generalInfosState, setGeneralInfosState] =
    useState<GeneralInfoProps<TempFile>>();

  useEffect(() => {
    (async () => {
      const newFiles = await Promise.all(
        (generalInfosStorage.files ?? []).map(async (file) => {
          return await serializedTempFileToTempFile(file);
        })
      );
      setGeneralInfosState({ ...generalInfosStorage, files: newFiles });
    })();
  }, [generalInfosStorage]);

  const setGeneralInfos = async (value: GeneralInfoProps<TempFile>) => {
    const newFiles = await Promise.all(
      (value.files ?? []).map(async (file) => {
        if (file.file instanceof File) {
          return await tempFileToSerializedTempFile(file);
        }
        return file as unknown as SerializedTempFile;
      })
    );
    setGeneralInfosStorage({
      ...value,
      files: newFiles,
    });
  };

  const resetGeneralInfos = () => {
    setGeneralInfosStorage(defaultGeneralInfos);
  };

  useEffect(() => {
    try {
      generalInfosSchema.validateSync(generalInfosStorage);
    } catch (error) {
      console.log("New project form is invalid, resetting to default", error);
      resetGeneralInfos();
    }
  }, [generalInfosStorage]);

  const loading = useMemo(() => {
    return Object.keys(generalInfosState ?? {}).length === 0;
  }, [generalInfosState]);

  return {
    generalInfos: generalInfosState,
    setGeneralInfos,
    resetGeneralInfos,
    loading,
  };
};

export default useNewProjectForm;
