import { useMutation, useQuery, useQueryClient } from "react-query";
import { ChatMessage } from "@cooprog/core";
import { authenticatedFetch } from "@/components/authentication/authenticatedFetch";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const getChatMessages = async (
  tourId: string
): Promise<ChatMessage[]> => {
  const url = `${API_URL}/chatMessages/${tourId}`;
  const response = await authenticatedFetch(url, {
    method: "GET",
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

export const createChatMessage = async (
  tourId: string,
  message: string,
  profileId?: string
): Promise<ChatMessage> => {
  const url = `${API_URL}/chatMessages/${tourId}`;
  const response = await authenticatedFetch(url, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json; charset=UTF-8",
    },
    credentials: "include",
    body: JSON.stringify({ message, profileId }),
  });
  if (response.status < 200 || response.status >= 300) {
    throw new Error(response.statusText);
  }
  return await response.json();
};

const useChatMessage = (tourId: string) => {
  const queryClient = useQueryClient();

  const chatMessagesQuery = useQuery(
    ["chatMessages", tourId],
    () => getChatMessages(tourId),
    {
      useErrorBoundary: false,
      refetchInterval: 10000,
    }
  );

  const createChatMessageMutation = useMutation(
    ({ message, profileId }: { message: string; profileId: string }) =>
      createChatMessage(tourId, message, profileId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["chatMessages", tourId]);
      },
    }
  );

  return {
    chatMessages: chatMessagesQuery.data,
    sendMessage: createChatMessageMutation.mutateAsync,
    error: chatMessagesQuery.error,
    loading: chatMessagesQuery.isLoading || createChatMessageMutation.isLoading,
  };
};

export default useChatMessage;
