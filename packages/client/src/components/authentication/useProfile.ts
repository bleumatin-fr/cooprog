import { ContactInformation, User } from "@cooprog/core";
import { useMutation, useQueryClient } from "react-query";
import { authenticatedFetch } from "./authenticatedFetch";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface CreateProfileData {
  firstName: string;
  lastName: string;
  role?: string;
  contactInformation: {
    types?: ("email" | "phone")[];
    email?: string;
    phone?: string;
    instructions?: string;
  };
}

interface UpdateProfileData extends CreateProfileData {
  profileId: string;
}

const createProfile = async (data: CreateProfileData): Promise<User> => {
  const response = await authenticatedFetch(
    `${API_URL}/authentication/me/profiles`,
    {
      method: "POST",
      body: JSON.stringify(data),
    }
  );
  return await response.json();
};

const updateProfile = async (data: UpdateProfileData): Promise<User> => {
  const { profileId, ...profileData } = data;
  const response = await authenticatedFetch(
    `${API_URL}/authentication/me/profiles/${profileId}`,
    {
      method: "PUT",
      body: JSON.stringify(profileData),
    }
  );
  return await response.json();
};

const deleteProfile = async (profileId: string): Promise<User> => {
  const response = await authenticatedFetch(
    `${API_URL}/authentication/me/profiles/${profileId}`,
    {
      method: "DELETE",
    }
  );
  return await response.json();
};

const useProfile = () => {
  const queryClient = useQueryClient();

  const createProfileMutation = useMutation(
    (data: CreateProfileData) => createProfile(data),
    {
      onSuccess: (updatedUser) => {
        queryClient.invalidateQueries(["user"]);
        queryClient.setQueryData(["user"], updatedUser);
      },
    }
  );

  const updateProfileMutation = useMutation(
    (data: UpdateProfileData) => updateProfile(data),
    {
      onSuccess: (updatedUser) => {
        queryClient.invalidateQueries(["user"]);
        queryClient.setQueryData(["user"], updatedUser);
      },
    }
  );

  const deleteProfileMutation = useMutation(
    (profileId: string) => deleteProfile(profileId),
    {
      onMutate: async (profileId) => {
        await queryClient.cancelQueries({ queryKey: ["user"] });
        const previousUser: User | undefined = queryClient.getQueryData([
          "user",
        ]);
        if (!previousUser) return { previousUser };

        // Optimistically update the user data
        previousUser.profiles = previousUser.profiles?.filter(
          (p) => p._id?.toString() !== profileId
        );
        queryClient.setQueryData(["user"], previousUser);
        return { previousUser };
      },
      onSuccess: (updatedUser) => {
        queryClient.invalidateQueries(["user"]);
        queryClient.setQueryData(["user"], updatedUser);
      },
      onError: (_, __, context) => {
        // Revert optimistic update on error
        if (context?.previousUser) {
          queryClient.setQueryData(["user"], context.previousUser);
        }
      },
    }
  );

  return {
    createProfile: createProfileMutation.mutateAsync,
    updateProfile: updateProfileMutation.mutateAsync,
    deleteProfile: deleteProfileMutation.mutateAsync,
    error:
      createProfileMutation.error ||
      updateProfileMutation.error ||
      deleteProfileMutation.error,
    loading:
      createProfileMutation.isLoading ||
      updateProfileMutation.isLoading ||
      deleteProfileMutation.isLoading,
  };
};

export default useProfile;
