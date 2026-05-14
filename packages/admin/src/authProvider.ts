import { AuthProvider } from "react-admin";
import httpClient from "./httpClient";

const API_URL =
  import.meta.env.VITE_APP_AUTH_API_URL ||
  "http://localhost:3000/api/authentication";

const getStoredAuth = (): { token?: string } | null => {
  const rawAuth = localStorage.getItem("admin-auth");
  if (!rawAuth) {
    return null;
  }
  try {
    return JSON.parse(rawAuth);
  } catch (error) {
    localStorage.removeItem("admin-auth");
    return null;
  }
};

const getStoredToken = (): string | null => {
  const auth = getStoredAuth();
  return auth?.token || null;
};

const getMe = async (token: string) => {
  const response = await httpClient(`${API_URL}/me`, {
    method: "GET",
    credentials: "include",
    headers: new Headers({
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    }),
  });

  return response.json;
};

const authProvider: AuthProvider = {
  login: async ({ username, password }) => {
    const request = new Request(`${API_URL}/login`, {
      method: "POST",
      body: JSON.stringify({ email: username, password }),
      credentials: "include",
      headers: new Headers({ "Content-Type": "application/json" }),
    });
    const response = await fetch(request);
    if (response.status < 200 || response.status >= 300) {
      throw new Error(response.statusText);
    }
    const auth = await response.json();
    localStorage.setItem("admin-auth", JSON.stringify(auth));

    const user = await getMe(auth.token);
    if (user?.role !== "admin") {
      localStorage.removeItem("admin-auth");
      throw new Error("Unauthorized");
    }
  },
  logout: async () => {
    const token = getStoredToken();
    if (token) {
      try {
        await fetch(`${API_URL}/logout`, {
          method: "GET",
          credentials: "include",
          headers: new Headers({
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          }),
        });
      } catch (error) {
        // Ignore network errors on logout, local session cleanup is primary.
      }
    }
    localStorage.removeItem("admin-auth");
    return Promise.resolve(undefined);
  },
  checkAuth: async () => {
    const token = getStoredToken();
    if (!token) {
      return Promise.reject();
    }
    try {
      const user = await getMe(token);
      if (user?.role !== "admin") {
        localStorage.removeItem("admin-auth");
        return Promise.reject();
      }
      return Promise.resolve();
    } catch (error) {
      localStorage.removeItem("admin-auth");
      return Promise.reject();
    }
  },
  checkError: (error) => {
    if (error.status === 401 || error.status === 403) {
      localStorage.removeItem("admin-auth");
      return Promise.reject();
    }
    return Promise.resolve();
  },
  getIdentity: async () => {
    const token = getStoredToken();
    if (!token) {
      throw new Error("Unauthorized");
    }
    return await getMe(token);
  },
  getPermissions: () => Promise.resolve(""),
};

export default authProvider;
