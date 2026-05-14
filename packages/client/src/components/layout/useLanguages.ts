import { authenticatedFetch } from "@/components/authentication/authenticatedFetch";
import { useQuery } from "react-query";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const getLanguages = async (): Promise<[string]> => {
  const response = await authenticatedFetch(`${API_URL}/translations`);
  if (response.status < 200 || response.status >= 300) {
    throw new Error(response.statusText);
  }
  return await response.json();
};

const useLanguages = () => {
  const languagesQuery = useQuery(["languages"], () => getLanguages(), {
    useErrorBoundary: true,
    refetchOnWindowFocus: false,
  });

  return {
    languages: languagesQuery.data || [],
    error: languagesQuery.error,
    loading: languagesQuery.isLoading,
  };
};

export default useLanguages;
