import { Project, User } from "@cooprog/core";
import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { authenticatedFetch } from "../../components/authentication/authenticatedFetch";
import useUser from "../authentication/useUser";
import { uploadProjectFiles } from "./useProjects";
import { TempFile } from "../newProject/useNewProjectForm";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const getProject = async (
  id: string,
  token?: string
): Promise<Project> => {
  const url = `${API_URL}/projects/${id}`;
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
  return await response.json();
};

interface UserWithMessage {
  user: User;
  customMessage?: string;
}

type projectParams = Omit<Partial<Project>, "users"> & {
  users?: UserWithMessage[];
};

export const editProject = async (
  id: string,
  params: projectParams
): Promise<Project> => {
  const url = `${API_URL}/projects/${id}`;
  const response = await authenticatedFetch(url, {
    method: "PATCH",
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

interface TourParams {
  name: string;
  start: Date;
  end?: Date;
  schedule: {
    date: Date;
    status: string;
    user?: Partial<User>;
    customMessage?: string;
  }[];
}

export const createTour = async (
  id: string,
  params: TourParams
): Promise<Project> => {
  const url = `${API_URL}/projects/${id}/tours`;
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
interface ParticipantParams {
  user: Partial<User>;
  customMessage?: string;
}

export const addParticipants = async (
  id: string,
  params: ParticipantParams
): Promise<Project> => {
  const url = `${API_URL}/projects/${id}/users`;
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

export const favoriteProject = async (id: string): Promise<Project> => {
  const url = `${API_URL}/projects/${id}/favorite`;
  const response = await authenticatedFetch(url, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json; charset=UTF-8",
    },
    credentials: "include",
  });
  if (response.status < 200 || response.status >= 300) {
    throw new Error(response.statusText);
  }
  return await response.json();
};

export const claimProject = async (id: string): Promise<Project> => {
  const url = `${API_URL}/projects/${id}/claim`;
  const response = await authenticatedFetch(url, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json; charset=UTF-8",
    },
    credentials: "include",
  });
  if (response.status < 200 || response.status >= 300) {
    throw new Error(response.statusText);
  }
  return await response.json();
};

export const shareProject = async (
  id: string,
  users: ({ _id: string } | string)[],
  message: string,
  tourId?: string
): Promise<Project> => {
  const url = `${API_URL}/projects/${id}/share`;
  const response = await authenticatedFetch(url, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json; charset=UTF-8",
    },
    credentials: "include",
    body: JSON.stringify({ users, message, tourId }),
  });
  if (response.status < 200 || response.status >= 300) {
    throw new Error(response.statusText);
  }
  return await response.json();
};

export const deleteProjectFiles = async (
  projectId: string,
  fileIds: string[]
): Promise<Project> => {
  const response = await authenticatedFetch(
    `${API_URL}/projects/${projectId}/files`,
    {
      method: "DELETE",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ fileIds }),
    }
  );

  if (response.status < 200 || response.status >= 300) {
    throw new Error("File deletion failed");
  }

  return await response.json();
};

const useProject = (id: string) => {
  const queryClient = useQueryClient();
  const { user } = useUser();

  const projectsQuery = useQuery(["project", id], () => getProject(id), {
    useErrorBoundary: false,
  });

  const editProjectMutation = useMutation(
    (params: projectParams) => editProject(id, params),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["project", id]);
      },
    }
  );

  const favoriteProjectMutation = useMutation(() => favoriteProject(id), {
    onSuccess: () => {
      queryClient.invalidateQueries(["project", id]);
    },
  });

  const claimProjectMutation = useMutation(() => claimProject(id), {
    onSuccess: () => {
      queryClient.invalidateQueries(["project", id]);
    },
  });

  const createTourMutation = useMutation(
    (params: TourParams) => createTour(id, params),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["project", id]);
      },
    }
  );

  const addParticipantsMutation = useMutation(
    (params: ParticipantParams) => addParticipants(id, params),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["project", id]);
      },
    }
  );

  const uploadFilesMutation = useMutation(
    (files: TempFile[]) => uploadProjectFiles(id, files),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["project", id]);
      },
    }
  );

  const deleteFilesMutation = useMutation(
    (fileIds: string[]) => deleteProjectFiles(id, fileIds),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["project", id]);
      },
    }
  );

  const downloadProjectFile = async (
    fileId: string,
    fileName: string
  ): Promise<void> => {
    const res = await authenticatedFetch(
      `${API_URL}/projects/${id}/files/${fileId}/download`,
      {
        method: "GET",
        credentials: "include",
      }
    );
    if (!res.ok) throw new Error("Failed to download file");
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  };

  return {
    project: projectsQuery.data,
    favorite: favoriteProjectMutation.mutateAsync,
    edit: editProjectMutation.mutateAsync,
    claim: claimProjectMutation.mutateAsync,
    createTour: createTourMutation.mutateAsync,
    addParticipants: addParticipantsMutation.mutateAsync,
    uploadFiles: uploadFilesMutation.mutateAsync,
    deleteFiles: deleteFilesMutation.mutateAsync,
    downloadProjectFile,
    error: projectsQuery.error,
    loading:
      projectsQuery.isLoading ||
      favoriteProjectMutation.isLoading ||
      editProjectMutation.isLoading ||
      addParticipantsMutation.isLoading ||
      createTourMutation.isLoading ||
      uploadFilesMutation.isLoading ||
      deleteFilesMutation.isLoading,
  };
};

export default useProject;
