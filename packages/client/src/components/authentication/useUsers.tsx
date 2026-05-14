import { User } from "@cooprog/core";
import { Feature, GeoJsonProperties, Point } from "geojson";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { buildParams } from "../projects/useProjects";
import { authenticatedFetch } from "./authenticatedFetch";
import { getUser } from "./useUser";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const countNearby = async (coordinates: number[]) => {
  const response = await fetch(`${API_URL}/users/nearby`, {
    method: "POST",
    credentials: "include",
    headers: new Headers({ "Content-Type": "application/json" }),
    body: JSON.stringify({ coordinates }),
  });
  if (response.status < 200 || response.status >= 300) {
    const body = await response.json();
    throw new Error(body.message);
  }
  return await response.json();
};

export const getUserById = async (id: string): Promise<User> => {
  const response = await authenticatedFetch(`${API_URL}/users/${id}`, {
    method: "GET",
  });
  return await response.json();
};

export const getUsers = async (
  filter?: any,
  token?: string
): Promise<{
  data: { users: User[]; markers: Feature<Point, GeoJsonProperties>[] };
  totalCount: number;
  superTotalCount: number;
}> => {
  const url = filter
    ? `${API_URL}/users?${buildParams(filter)}`
    : `${API_URL}/users`;
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

const followUser = async (user: User): Promise<User> => {
  const response = await authenticatedFetch(
    `${API_URL}/users/${user._id}/follow-request`,
    {
      method: "POST",
    }
  );
  if (response.status < 200 || response.status >= 300) {
    throw new Error(response.statusText);
  }
  return await response.json();
};

const acceptFollow = async (
  user: User,
  followBack: boolean = false
): Promise<User> => {
  const response = await authenticatedFetch(
    `${API_URL}/users/${user._id}/accept`,
    {
      method: "POST",
      body: JSON.stringify({ followBack }),
    }
  );
  if (response.status < 200 || response.status >= 300) {
    throw new Error(response.statusText);
  }
  return await response.json();
};

const refuseFollow = async (
  user: User,
  followBack: boolean = false
): Promise<User> => {
  const response = await authenticatedFetch(
    `${API_URL}/users/${user._id}/refuse`,
    {
      method: "POST",
      body: JSON.stringify({ followBack }),
    }
  );

  if (response.status < 200 || response.status >= 300) {
    throw new Error(response.statusText);
  }
  return await response.json();
};

const useUsers = (selector?: any) => {
  const queryClient = useQueryClient();

  const usersQuery = useQuery(
    ["users", JSON.stringify(selector)],
    async () => {
      if (selector._id) {
        const user = await getUserById(selector._id);
        return [user];
      }
      const { data } = await getUsers(selector);
      return data.users;
    },
    {
      useErrorBoundary: false,
    }
  );

  const followUserMutation = useMutation((user: User) => followUser(user), {
    onSuccess: (updatedUser) => {
      queryClient.invalidateQueries();
      queryClient.setQueryData("user", updatedUser);
    },
  });

  const acceptFollowMutation = useMutation(
    ({ user, followBack }: { user: User; followBack?: boolean }) =>
      acceptFollow(user, followBack),
    {
      onSuccess: (updatedUser) => {
        queryClient.invalidateQueries();
        queryClient.setQueryData("user", updatedUser);
      },
    }
  );

  const refuseFollowMutation = useMutation((user: User) => refuseFollow(user), {
    onSuccess: (updatedUser) => {
      queryClient.invalidateQueries();
      queryClient.setQueryData("user", updatedUser);
    },
  });

  return {
    users: usersQuery.data,
    followUser: followUserMutation.mutateAsync,
    acceptFollow: acceptFollowMutation.mutateAsync,
    refuseFollow: refuseFollowMutation.mutateAsync,
    error:
      usersQuery.error ||
      followUserMutation.error ||
      acceptFollowMutation.error ||
      refuseFollowMutation.error,
    loading: usersQuery.isLoading,
  };
};

export default useUsers;
