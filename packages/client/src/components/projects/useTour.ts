import { Program, Tour, User, Location } from "@cooprog/core";
import { useRef } from "react";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { authenticatedFetch } from "../authentication/authenticatedFetch";
import { ProgramStatuses } from "@cooprog/core";
import useUser from "../authentication/useUser";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const patchProgram = async (
  projectId: string,
  tourId: string,
  programId: string,
  params: Partial<Program>
): Promise<Tour> => {
  const url = `${API_URL}/projects/${projectId}/tours/${tourId}/programs/${programId}`;
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

export const getTour = async (
  projectId: string,
  tourId: string,
  token?: string
): Promise<Tour> => {
  const url = `${API_URL}/projects/${projectId}/tours/${tourId}`;
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

export const editTour = async (
  projectId: string,
  tourId: string,
  params: Partial<Tour>
): Promise<Tour> => {
  const url = `${API_URL}/projects/${projectId}/tours/${tourId}`;
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

const showInterest = async (
  projectId: string,
  tourId: string
): Promise<Tour> => {
  const url = `${API_URL}/projects/${projectId}/tours/${tourId}/interest`;
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

const addParticipants = async (
  projectId: string,
  tourId: string,
  user: Partial<User>,
  customMessage?: string
): Promise<Tour> => {
  const url = `${API_URL}/projects/${projectId}/tours/${tourId}/users`;
  const response = await authenticatedFetch(url, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json; charset=UTF-8",
    },
    body: JSON.stringify({ user, customMessage }),
    credentials: "include",
  });
  if (response.status < 200 || response.status >= 300) {
    throw new Error(response.statusText);
  }
  return await response.json();
};

const removeInterest = async (
  projectId: string,
  tourId: string
): Promise<Tour> => {
  const url = `${API_URL}/projects/${projectId}/tours/${tourId}/interest`;
  const response = await authenticatedFetch(url, {
    method: "DELETE",
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

export const schedule = async (
  projectId: string,
  tourId: string,
  date: Date,
  status: ProgramStatuses,
  user?: Partial<User> | null,
  location?: Location,
  customMessage?: string
): Promise<Tour> => {
  const url = `${API_URL}/projects/${projectId}/tours/${tourId}/schedule`;
  const response = await authenticatedFetch(url, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json; charset=UTF-8",
    },
    body: JSON.stringify({ date, status, user, location, customMessage }),
    credentials: "include",
  });
  if (response.status < 200 || response.status >= 300) {
    throw new Error(response.statusText);
  }
  return await response.json();
};

export const updateLastSeen = async (
  projectId: string,
  tourId: string
): Promise<Tour> => {
  const url = `${API_URL}/projects/${projectId}/tours/${tourId}/last-seen`;
  const response = await authenticatedFetch(url, {
    method: "PATCH",
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

export const unschedule = async (
  projectId: string,
  tourId: string,
  programId: string
): Promise<Tour> => {
  const url = `${API_URL}/projects/${projectId}/tours/${tourId}/unschedule`;
  const response = await authenticatedFetch(url, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json; charset=UTF-8",
    },
    body: JSON.stringify({ id: programId }),
    credentials: "include",
  });
  if (response.status < 200 || response.status >= 300) {
    throw new Error(response.statusText);
  }
  return await response.json();
};

const useTour = (projectId: string, tourId: string) => {
  const queryClient = useQueryClient();
  const ongoingMutations = useRef(0);
  const { user } = useUser();

  const tourQuery = useQuery(
    ["tour", tourId],
    () => getTour(projectId, tourId),
    {
      useErrorBoundary: false,
      refetchInterval: 10000,
      enabled: tourId !== "disabled" && !!tourId,
    }
  );

  const editTourMutation = useMutation(
    (params: Partial<Tour>) => editTour(projectId, tourId, params),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["tour", tourId]);
      },
      onSettled: (updatedTour) => {
        ongoingMutations.current -= 1;
        ongoingMutations.current === 0 &&
          queryClient.setQueryData(["tour", tourId], updatedTour);

        queryClient.invalidateQueries("user");
      },
    }
  );

  const addParticipantsMutation = useMutation(
    ({
      user,
      customMessage,
    }: {
      user: Partial<User>;
      customMessage?: string;
    }) => addParticipants(projectId, tourId, user, customMessage),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["tour", tourId]);
      },
      onSettled: (updatedTour) => {
        ongoingMutations.current -= 1;
        ongoingMutations.current === 0 &&
          queryClient.setQueryData(["tour", tourId], updatedTour);
      },
    }
  );

  const editProgramMutation = useMutation(
    ({
      programId,
      params,
    }: {
      programId: string;
      params: Partial<Program>;
    }) => {
      return patchProgram(projectId, tourId, programId, params);
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["tour", tourId]);
      },
      onSettled: (updatedTour) => {
        ongoingMutations.current -= 1;
        ongoingMutations.current === 0 &&
          queryClient.setQueryData(["tour", tourId], updatedTour);
      },
    }
  );

  const showInterestMutation = useMutation(
    () => showInterest(projectId, tourId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["tour", tourId]);
      },
      onSettled: (updatedTour) => {
        ongoingMutations.current -= 1;
        ongoingMutations.current === 0 &&
          queryClient.setQueryData(["tour", tourId], updatedTour);
      },
    }
  );

  const removeInterestMutation = useMutation(
    () => removeInterest(projectId, tourId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["tour", tourId]);
      },
      onSettled: (updatedTour) => {
        ongoingMutations.current -= 1;
        ongoingMutations.current === 0 &&
          queryClient.setQueryData(["tour", tourId], updatedTour);
      },
    }
  );

  const scheduleTourMutation = useMutation(
    ({
      date,
      status,
      user,
      location,
      customMessage,
    }: {
      date: Date;
      status: ProgramStatuses;
      user?: Partial<User> | null;
      location?: Location;
      customMessage?: string;
    }) =>
      schedule(projectId, tourId, date, status, user, location, customMessage),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["tour", tourId]);
      },
      onSettled: (updatedTour) => {
        ongoingMutations.current -= 1;
        ongoingMutations.current === 0 &&
          queryClient.setQueryData(["tour", tourId], updatedTour);
      },
    }
  );

  const unscheduleTourMutation = useMutation(
    ({ id }: { id: string }) => unschedule(projectId, tourId, id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["tour", tourId]);
      },
      onSettled: (updatedTour) => {
        ongoingMutations.current -= 1;
        ongoingMutations.current === 0 &&
          queryClient.setQueryData(["tour", tourId], updatedTour);
      },
    }
  );

  const updateLastSeenMutation = useMutation(
    () => updateLastSeen(projectId, tourId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["tour", tourId]);
      },
      onSettled: (updatedTour) => {
        ongoingMutations.current -= 1;
        ongoingMutations.current === 0 &&
          queryClient.setQueryData(["tour", tourId], updatedTour);
      },
    }
  );

  return {
    tour: tourQuery.data,
    showInterest: showInterestMutation.mutateAsync,
    addParticipants: addParticipantsMutation.mutateAsync,
    removeInterest: removeInterestMutation.mutateAsync,
    edit: editTourMutation.mutateAsync,
    editProgram: editProgramMutation.mutateAsync,
    schedule: scheduleTourMutation.mutateAsync,
    unschedule: unscheduleTourMutation.mutateAsync,
    updateLastSeen: updateLastSeenMutation.mutateAsync,
    error: tourQuery.error,
    loading:
      tourQuery.isLoading ||
      editTourMutation.isLoading ||
      editProgramMutation.isLoading ||
      scheduleTourMutation.isLoading ||
      addParticipantsMutation.isLoading ||
      showInterestMutation.isLoading ||
      removeInterestMutation.isLoading ||
      unscheduleTourMutation.isLoading,
  };
};

export default useTour;
