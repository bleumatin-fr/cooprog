import {
  ContactInformation,
  Discipline,
  GeocodeAddress,
  Role,
  StructureType,
  User,
} from "@cooprog/core";
import { useRouter } from "next/router";
import { createContext, ReactNode, useContext } from "react";
import { useMutation, useQueryClient } from "react-query";
import { useLocalStorage } from "usehooks-ts";
import { authenticatedFetch } from "./authenticatedFetch";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface Auth {
  success: boolean;
  token?: string;
}

export interface RegisterParams {
  accountType: Role;
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  company?: string;
  companyDescription?: string;
  link?: string;
  address?: string;
  language?: string;
  data?: GeocodeAddress;
  coordinates?: number[];
  contactInformation?: ContactInformation;
  programmingDisciplines?: Discipline[];
  structureTypes?: StructureType[];
  programmingPeriods?: string;
  programmingGenres?: string[];
}

interface AuthenticationContextType {
  auth: Auth | null;
  error: unknown;
  loading: boolean;
  login: (email: string, password: string, token?: string) => Promise<void>;
  recover: (email: string) => Promise<void>;
  sendMessage: (
    object: string,
    message: string,
    url: string,
    email?: string
  ) => Promise<void>;
  resetPassword: (token: string, password: string) => Promise<void>;
  confirmAccount: (token: string, user: User) => Promise<void>;
  register: (params: RegisterParams) => Promise<void>;
  setLanguage: (language: string) => Promise<void>;
  logout: () => Promise<void>;
}

export const AuthenticationContext = createContext<AuthenticationContextType>({
  auth: null,
  error: null,
  loading: false,
  login: (email: string, password: string, token?: string) => Promise.resolve(),
  recover: (email: string) => Promise.resolve(),
  sendMessage: (object: string, message: string, url: string, email?: string) =>
    Promise.resolve(),
  resetPassword: (token: string, password: string) => Promise.resolve(),
  confirmAccount: (token: string, user: User) => Promise.resolve(),
  register: (params: RegisterParams) => Promise.resolve(),
  setLanguage: (language: string) => Promise.resolve(),
  logout: () => Promise.resolve(),
});

AuthenticationContext.displayName = "AuthenticationContext";

const login = async (email: string, password: string, token?: string) => {
  const response = await fetch(`${API_URL}/authentication/login`, {
    method: "POST",
    credentials: "include",
    headers: new Headers({ "Content-Type": "application/json" }),
    body: JSON.stringify({ email, password, token }),
  });
  if (response.status < 200 || response.status >= 300) {
    const body = await response.json();
    throw new Error(body.message);
  }
  return await response.json();
};

const register = async (params: RegisterParams) => {
  const response = await fetch(`${API_URL}/authentication/register`, {
    method: "POST",
    credentials: "include",
    headers: new Headers({ "Content-Type": "application/json" }),
    body: JSON.stringify(params),
  });
  const responseBody = await response.json();
  if (response.status < 200 || response.status >= 300) {
    if (responseBody.message) {
      throw new Error(responseBody.message);
    }
    throw new Error(response.statusText);
  }
  return responseBody;
};

const recover = async (email: String) => {
  const response = await fetch(`${API_URL}/authentication/recover`, {
    method: "POST",
    credentials: "include",
    headers: new Headers({ "Content-Type": "application/json" }),
    body: JSON.stringify({ email }),
  });
  if (response.status < 200 || response.status >= 300) {
    throw new Error(response.statusText);
  }
  return await response.json();
};

const resetPassword = async (token: String, password: string) => {
  const response = await fetch(`${API_URL}/authentication/reset-password`, {
    method: "POST",
    credentials: "include",
    headers: new Headers({ "Content-Type": "application/json" }),
    body: JSON.stringify({ token, password }),
  });
  if (response.status < 200 || response.status >= 300) {
    throw new Error(response.statusText);
  }
  return await response.json();
};

export const confirmAccount = async (token: String, user: User) => {
  const response = await fetch(`${API_URL}/authentication/reset-password`, {
    method: "POST",
    credentials: "include",
    headers: new Headers({ "Content-Type": "application/json" }),
    body: JSON.stringify({ token, user }),
  });
  const responseBody = await response.json();
  if (response.status < 200 || response.status >= 300) {
    if (responseBody.error && responseBody.error.code === "11000") {
      throw new Error("Cette adresse email est déjà utilisée.");
    }
    throw new Error(response.statusText);
  }
  return responseBody;
};

export const invite = async (
  profileId: string | null,
  emails: string[],
  customMessage?: string
): Promise<boolean> => {
  const url = `${API_URL}/authentication/invite`;
  const response = await authenticatedFetch(url, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json; charset=UTF-8",
    },
    credentials: "include",
    body: JSON.stringify({ profileId, emails, customMessage }),
  });
  if (response.status < 200 || response.status >= 300) {
    throw new Error(response.statusText);
  }
  return await response.json();
};

const sendMessage = async (
  subject: string,
  message: string,
  url: string,
  email?: string
) => {
  const response = await authenticatedFetch(
    `${API_URL}/authentication/send-message`,
    {
      method: "POST",
      credentials: "include",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json; charset=UTF-8",
      },
      body: JSON.stringify({ subject, message, url, email }),
    }
  );
  if (response.status < 200 || response.status >= 300) {
    throw new Error(response.statusText);
  }
  return await response.json();
};

const setLanguage = async (language: string) => {
  const response = await authenticatedFetch(
    `${API_URL}/authentication/set-language`,
    {
      method: "POST",
      credentials: "include",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json; charset=UTF-8",
      },
      body: JSON.stringify({ language }),
    }
  );
  if (response.status < 200 || response.status >= 300) {
    throw new Error(response.statusText);
  }
  return await response.json();
};

export const AuthenticationProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [auth, setAuth] = useLocalStorage<Auth | null>("auth", null);
  const router = useRouter();
  const queryClient = useQueryClient();

  const loginMutation = useMutation(
    (params: { email: string; password: string; token?: string }) => {
      return login(params.email, params.password, params.token);
    },
    {
      onSuccess: (auth) => {
        setAuth(auth);
        queryClient.invalidateQueries("user");
      },
    }
  );

  const recoverMutation = useMutation(
    ({ email }: { email: string }) => recover(email),
    {
      useErrorBoundary: false,
    }
  );

  const resetPasswordMutation = useMutation(
    ({ token, password }: { token: string; password: string }) =>
      resetPassword(token, password),
    {
      useErrorBoundary: false,
    }
  );

  const confirmAccountMutation = useMutation(
    ({ token, user }: { token: string; user: User }) =>
      confirmAccount(token, user),
    {
      useErrorBoundary: false,
    }
  );

  const registerMutation = useMutation(
    (params: RegisterParams) => register(params),
    {
      useErrorBoundary: false,
      onSuccess: (auth) => {
        setAuth(auth);
      },
    }
  );

  const sendMessageMutation = useMutation(
    ({
      object,
      message,
      url,
      email,
    }: {
      object: string;
      message: string;
      url: string;
      email?: string;
    }) => sendMessage(object, message, url, email),
    {
      useErrorBoundary: false,
    }
  );
  const setLanguageMutation = useMutation(
    ({ language }: { language: string }) => setLanguage(language),
    {
      useErrorBoundary: false,
      onMutate: async ({ language }) => {
        const user = queryClient.getQueryData("user");
        if (user) {
          queryClient.setQueryData("user", { ...user, language });
        }
      },
    }
  );

  const logout = async () => {
    router.push("/");
    setTimeout(() => {
      queryClient.invalidateQueries("user");
      queryClient.setQueryData("user", null);
      localStorage.removeItem("auth");
      setAuth(null);
    }, 1000);
    return Promise.resolve();
  };

  const authenticationValues = {
    auth,
    error:
      loginMutation.error ||
      registerMutation.error ||
      recoverMutation.error ||
      resetPasswordMutation.error ||
      sendMessageMutation.error ||
      confirmAccountMutation.error ||
      setLanguageMutation.error,
    loading:
      loginMutation.isLoading ||
      registerMutation.isLoading ||
      recoverMutation.isLoading ||
      resetPasswordMutation.isLoading ||
      sendMessageMutation.isLoading ||
      confirmAccountMutation.isLoading ||
      setLanguageMutation.isLoading,
    login: (email: string, password: string, token?: string) =>
      loginMutation.mutateAsync({ email, password, token }),
    recover: (email: string) => recoverMutation.mutateAsync({ email }),
    sendMessage: (
      object: string,
      message: string,
      url: string,
      email?: string
    ) => sendMessageMutation.mutateAsync({ object, message, url, email }),
    resetPassword: async (token: string, password: string) => {
      const { user } = await resetPasswordMutation.mutateAsync({
        token,
        password,
      });
      if (!user) {
        throw new Error("User not found");
      }
      return await loginMutation.mutateAsync({ email: user.email, password });
    },
    confirmAccount: async (token: string, user: User) =>
      confirmAccountMutation.mutateAsync({ token, user }),
    register: async (params: RegisterParams) =>
      registerMutation.mutateAsync(params),
    setLanguage: async (language: string) =>
      setLanguageMutation.mutateAsync({ language }),
    logout,
  };

  return (
    <AuthenticationContext.Provider value={authenticationValues}>
      {children}
    </AuthenticationContext.Provider>
  );
};

export const useAuthentication = () => {
  return useContext(AuthenticationContext);
};
