import { authenticatedFetch } from "@/components/authentication/authenticatedFetch";
import { useQuery } from "react-query";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const getConfigurations = async (): Promise<{ [key: string]: string }> => {
  const response = await authenticatedFetch(`${API_URL}/configuration`);
  if (response.status < 200 || response.status >= 300) {
    throw new Error(response.statusText);
  }
  return await response.json();
};

const useConfiguration = () => {
  const configurationQuery = useQuery(
    ["configurations"],
    () => getConfigurations(),
    {
      useErrorBoundary: true,
    }
  );

  return {
    configuration: configurationQuery.data || {},
    error: configurationQuery.error,
    loading: configurationQuery.isLoading,
  };
};

export default useConfiguration;
