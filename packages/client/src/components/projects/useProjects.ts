import { Project, User, Link, Place, Discipline } from "@cooprog/core";
import { Feature, Point, GeoJsonProperties } from "geojson";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { authenticatedFetch } from "../../components/authentication/authenticatedFetch";
import { TempFile } from "../newProject/useNewProjectForm";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const buildParams = (data: any) => {
  const params = new URLSearchParams();
  Object.entries(data).forEach(([key, value]) => {
    if (value === null || value === undefined) return;
    if (Array.isArray(value)) {
      value.forEach((value) => {
        if (value === null || value === undefined) return;
        params.append(key, value.toString());
      });
    } else {
      params.append(key, (value as any).toString());
    }
  });

  return params.toString();
};

export const getProjects = async (
  filter?: any,
  token?: string
): Promise<{
  data: { projects: Project[]; markers: Feature<Point, GeoJsonProperties>[] };
  totalCount: number;
  superTotalCount: number;
}> => {
  if (!filter) {
    return {
      data: {
        projects: [],
        markers: [],
      },
      totalCount: 0,
      superTotalCount: 0,
    };
  }
  const url = filter
    ? `${API_URL}/projects?${buildParams(filter)}`
    : `${API_URL}/projects`;

  const response = await authenticatedFetch(url, {
    method: "GET",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json; charset=UTF-8",
    },
    credentials: "include",
    token,
  });

  if (response.status < 200 || response.status >= 300) {
    throw new Error(response.statusText);
  }
  const totalCountHeader = (response.headers.get("x-total-count") || "").split(
    "/"
  );

  return {
    totalCount: parseInt(totalCountHeader[0]),
    superTotalCount: parseInt(totalCountHeader[1]),
    data: await response.json(),
  };
};

interface CreateParams {
  artist: string;
  work?: string;
  genres: string[];
  complementaryGenre?: string;
  description: string;
  places?: Place[];
  targetAudiences?: string[];
  financialSupport?: string;
  gauge?: string[];
  minimumStageSize?: string[];
  averagePerformanceFee?: string | string[];
  numberOfPeopleOnTour?: number;
  numberOfArtistOnStage?: number;
  venueConfigurationType?: string[];
  venueConfigurationSpace?: string[];
  venueConfigurationAudience?: string[];
  performanceLanguages?: string[];
  accessibilityVisual?: boolean;
  accessibilityAudio?: boolean;
  discipline?: Discipline;
  emergingArtist?: boolean;
  culturalActionInterest?: boolean;
  numberOfMenOnStage?: number;
  numberOfWomenOnStage?: number;
  numberOfNonBinaryOnStage?: number;
  artisticTeam?: Partial<User>;
  artisticTeamCustomMessage?: string;

  tourName?: string;
  start?: Date;
  end?: Date;
  artisticTeamPlace?: Place;
  links?: Link[];
  schedule?: {
    date: Date | null;
    status: string;
  }[];
  notify?: string[];
  customMessage?: string;
}

export const createProject = async (params: CreateParams): Promise<Project> => {
  const url = `${API_URL}/projects/`;
  const response = await authenticatedFetch(url, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json; charset=UTF-8",
    },
    credentials: "include",
    body: JSON.stringify(params),
  });
  if (response.status < 200 || response.status >= 300) {
    throw new Error(response.statusText);
  }
  return await response.json();
};

export const uploadProjectFiles = async (
  projectId: string,
  files: TempFile[]
) => {
  const formData = new FormData();
  files.forEach(({ file, name, originalFilename }) => {
    if (file) {
      formData.append("files", file);
    }
    formData.append("names[]", name);
    formData.append("originalFilenames[]", originalFilename);
  });

  const response = await authenticatedFetch(
    `${API_URL}/projects/${projectId}/files`,
    {
      method: "POST",
      body: formData,
      credentials: "include",
    }
  );

  if (response.status < 200 || response.status >= 300) {
    throw new Error("File upload failed");
  }

  return await response.json();
};

const useProjects = (filter?: any) => {
  const queryClient = useQueryClient();
  const [totalCount, setTotalCount] = useState<number | undefined>(undefined);

  const projectsQuery = useQuery(
    ["projects", JSON.stringify(filter)],
    async () => {
      const { data, totalCount } = await getProjects(filter);
      setTotalCount(totalCount);
      return data.projects;
    },
    {
      useErrorBoundary: false,
      refetchOnMount: true,
      refetchOnWindowFocus: false,
      staleTime: 0,
    }
  );

  const createProjectMutation = useMutation(
    (params: CreateParams) => createProject(params),
    {
      onSuccess: () => {
        queryClient.invalidateQueries("projects");
      },
    }
  );

  const uploadFilesMutation = useMutation(
    ({ projectId, files }: { projectId: string; files: TempFile[] }) =>
      uploadProjectFiles(projectId, files),
    {
      onSuccess: (_, { projectId }) => {
        queryClient.invalidateQueries("projects");
        queryClient.invalidateQueries(["project", projectId]);
      },
    }
  );

  return {
    projects: projectsQuery.data,
    totalCount,
    create: createProjectMutation.mutateAsync,
    uploadFiles: uploadFilesMutation.mutateAsync,
    error: projectsQuery.error,
    loading:
      projectsQuery.isLoading ||
      projectsQuery.isFetching ||
      createProjectMutation.isLoading ||
      uploadFilesMutation.isLoading,
  };
};

export default useProjects;
