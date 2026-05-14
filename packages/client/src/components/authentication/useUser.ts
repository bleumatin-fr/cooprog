import {
  ContactInformation,
  Discipline,
  LabeledLocation,
  StructureType,
  User,
} from "@cooprog/core";
import { useEffect, useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { useLocalStorage } from "usehooks-ts";
import { authenticatedFetch } from "./authenticatedFetch";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const getUser = async (token?: string): Promise<User | null> => {
  try {
    const response = await authenticatedFetch(`${API_URL}/authentication/me`, {
      method: "GET",
      token,
    });
    const data = await response.json();
    return data;
  } catch (e) {
    throw e;
  }
};

interface UserPassword {
  password?: string;
  formerPassword?: string;
}

const changePassword = async (user: UserPassword): Promise<User> => {
  const response = await authenticatedFetch(`${API_URL}/authentication/me`, {
    method: "PUT",
    body: JSON.stringify(user),
  });
  return await response.json();
};

interface UserProfile {
  firstName?: string;
  lastName?: string;
  email?: string;
  company: string;
  location: {
    address: string;
    geolocation: {
      type: "Point";
      coordinates: [number, number];
    };
    data: any;
  };
  contactInformation: ContactInformation;
  programmingDisciplines?: Discipline[];
  structureTypes?: StructureType[];
  programmingPeriods?: string;
  programmingGenres?: string[];
}

const updateProfile = async (user: UserProfile): Promise<User> => {
  try {
    const response = await authenticatedFetch(`${API_URL}/authentication/me`, {
      method: "PUT",
      body: JSON.stringify(user),
    });

    const responseData = await response.json();
    return responseData;
  } catch (error) {
    throw error;
  }
};

// Nouvelle fonction pour mettre à jour uniquement certains champs sans création d'historique
interface ProgrammingFields {
  programmingDisciplines?: Discipline[];
  structureTypes?: StructureType[];
  programmingPeriods?: string;
  programmingGenres?: string[];
}

const updateProgrammingFields = async (
  fields: ProgrammingFields,
): Promise<User> => {
  try {
    const response = await authenticatedFetch(
      `${API_URL}/authentication/me/update-fields`,
      {
        method: "PUT",
        body: JSON.stringify(fields),
      },
    );

    const responseData = await response.json();
    return responseData;
  } catch (error) {
    throw error;
  }
};

const deleteNotification = async (notificationId: string): Promise<User> => {
  const response = await authenticatedFetch(
    `${API_URL}/authentication/me/notifications/${notificationId}`,
    {
      method: "DELETE",
    },
  );
  return await response.json();
};

const updateDiscipline = async (discipline: Discipline): Promise<User> => {
  try {
    const response = await authenticatedFetch(
      `${API_URL}/users/update-discipline`,
      {
        method: "PUT",
        body: JSON.stringify({ discipline }),
      },
    );

    const responseData = await response.json();
    return responseData;
  } catch (error) {
    throw error;
  }
};

export const uploadUserAvatar = async (file: File) => {
  const formData = new FormData();
  formData.append("avatar", file);

  const response = await authenticatedFetch(
    `${API_URL}/authentication/me/avatar`,
    {
      method: "POST",
      body: formData,
      credentials: "include",
    },
  );

  if (response.status < 200 || response.status >= 300) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Avatar upload failed");
  }

  const data = await response.json();
  return {
    avatarUrl: data.avatarUrl,
    avatarChangedAt: data.avatarChangedAt
      ? new Date(data.avatarChangedAt)
      : new Date(),
  };
};

interface UserUpdateData {
  company: string;
  companyDescription?: string;
  locations: LabeledLocation[];
  avatarUrl?: string;
  email?: string;
}

const updateUser = async (userData: UserUpdateData): Promise<User> => {
  const response = await authenticatedFetch(`${API_URL}/authentication/me`, {
    method: "PUT",
    body: JSON.stringify(userData),
  });
  return await response.json();
};

const useUser = ({
  useErrorBoundary = false,
}: {
  useErrorBoundary?: boolean;
} = {}) => {
  const queryClient = useQueryClient();
  const [selectedProfileId, setSelectedProfileId] = useLocalStorage<
    string | null | undefined
  >("selectedProfileIndex", null);
  const [previouslySelectedProfileId, setPreviouslySelectedProfileId] =
    useLocalStorage<string | null | undefined>(
      "previouslySelectedProfileId",
      null,
    );
  const [openUserEditTabOnNextOpen, setOpenUserEditTabOnNextOpen] =
    useLocalStorage<number | null>("openUserEditTabOnNextOpen", null);

  const userQuery = useQuery(["user"], () => getUser(), {
    useErrorBoundary,
  });

  const selectedProfile = useMemo(
    () =>
      userQuery.data?.profiles?.find(
        (p) => p._id?.toString() === selectedProfileId,
      ) ?? null,
    [userQuery.data?.profiles, selectedProfileId],
  );

  useEffect(() => {
    const isSelectedProfileIdInProfiles = userQuery.data?.profiles?.some(
      (p) => p._id?.toString() === selectedProfileId?.toString(),
    );
    if (
      userQuery.data &&
      typeof selectedProfileId !== "undefined" &&
      (selectedProfileId === null || !isSelectedProfileIdInProfiles) &&
      userQuery.data.profiles?.length &&
      userQuery.data.profiles.length > 0
    ) {
      setSelectedProfileId(userQuery.data.profiles?.[0]?._id ?? null);
    }
  }, [
    userQuery.data,
    selectedProfile,
    selectedProfileId,
    setSelectedProfileId,
  ]);

  const changePasswordMutation = useMutation(
    (user: UserPassword) => changePassword(user),
    {
      onSuccess: (updatedUser) => {
        queryClient.invalidateQueries();
        queryClient.setQueryData("user", updatedUser);
      },
    },
  );

  const updateProfileMutation = useMutation(
    (user: UserProfile) => updateProfile(user),
    {
      onSuccess: (updatedUser) => {
        queryClient.invalidateQueries();
        queryClient.setQueryData("user", updatedUser);
      },
    },
  );

  const updateProgrammingFieldsMutation = useMutation(
    (fields: ProgrammingFields) => updateProgrammingFields(fields),
    {
      onSuccess: (updatedUser) => {
        queryClient.invalidateQueries();
        queryClient.setQueryData("user", updatedUser);
      },
    },
  );

  const updateDisciplineMutation = useMutation(
    (discipline: Discipline) => updateDiscipline(discipline),
    {
      onSuccess: (updatedUser) => {
        queryClient.invalidateQueries();
        queryClient.setQueryData("user", updatedUser);
      },
    },
  );

  const deleteNotificationMutation = useMutation(
    (id: string) => deleteNotification(id),
    {
      onMutate: async (id) => {
        await queryClient.cancelQueries({ queryKey: ["user"] });
        const previousUser: User | undefined = queryClient.getQueryData([
          "user",
        ]);
        if (!previousUser) return { previousUser };
        previousUser.notifications = previousUser.notifications?.filter(
          (n) => n._id !== id,
        );
        queryClient.setQueryData(["user"], previousUser);
        return { previousUser };
      },
      onSuccess: () => {
        queryClient.invalidateQueries("user");
      },
    },
  );

  const uploadAvatarMutation = useMutation(
    ({ file }: { file: File }) => uploadUserAvatar(file),
    {
      onSuccess: ({ avatarUrl, avatarChangedAt }) => {
        queryClient.setQueryData("user", {
          ...userQuery.data,
          avatarUrl,
          avatarChangedAt,
        });
        queryClient.invalidateQueries("user");
      },
    },
  );

  const updateUserMutation = useMutation(
    (userData: UserUpdateData) => updateUser(userData),
    {
      onSuccess: (updatedUser) => {
        queryClient.invalidateQueries();
        queryClient.setQueryData("user", updatedUser);
      },
    },
  );

  return {
    user: userQuery.data,
    selectedProfile,
    selectedProfileId,
    previouslySelectedProfileId,
    setSelectedProfileId: (profileId: string | null | undefined) => {
      setPreviouslySelectedProfileId(selectedProfileId);
      setSelectedProfileId(profileId);
    },
    openUserEditTabOnNextOpen,
    setOpenUserEditTabOnNextOpen,
    openProfileForLocationEdit: () => {
      setOpenUserEditTabOnNextOpen(1);
      setPreviouslySelectedProfileId(selectedProfileId);
      setSelectedProfileId(undefined);
    },
    refetchUser: userQuery.refetch,
    changePassword: changePasswordMutation.mutateAsync,
    updateProfile: updateProfileMutation.mutateAsync,
    updateProgrammingFields: updateProgrammingFieldsMutation.mutateAsync,
    updateDiscipline: updateDisciplineMutation.mutateAsync,
    updateUser: updateUserMutation.mutateAsync,
    deleteNotification: deleteNotificationMutation.mutateAsync,
    uploadAvatar: uploadAvatarMutation.mutateAsync,
    error:
      userQuery.error ||
      changePasswordMutation.error ||
      deleteNotificationMutation.error ||
      updateProfileMutation.error ||
      updateProgrammingFieldsMutation.error ||
      updateDisciplineMutation.error ||
      updateUserMutation.error ||
      uploadAvatarMutation.error,
    loading:
      userQuery.isLoading ||
      changePasswordMutation.isLoading ||
      deleteNotificationMutation.isLoading ||
      updateProfileMutation.isLoading ||
      updateProgrammingFieldsMutation.isLoading ||
      updateDisciplineMutation.isLoading ||
      updateUserMutation.isLoading ||
      uploadAvatarMutation.isLoading,
  };
};

export default useUser;
