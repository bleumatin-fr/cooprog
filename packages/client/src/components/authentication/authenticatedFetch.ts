const API_URL = process.env.NEXT_PUBLIC_API_URL;

const refreshToken = async () => {
  const request = new Request(`${API_URL}/authentication/refresh`, {
    method: "POST",
    credentials: "include",
    headers: new Headers({ "Content-Type": "application/json" }),
  });
  const response = await fetch(request);
  if (response.status < 200 || response.status >= 300) {
    throw new Error("Unauthorized");
  }
  const auth = await response.json();

  localStorage.setItem("auth", JSON.stringify(auth));
};

type CustomRequestInit = RequestInit & {
  token?: string;
};

export const authenticatedFetch = async (
  input: RequestInfo | URL,
  options: CustomRequestInit | undefined = {},
  iteration: number = 0
): Promise<Response> => {
  const isFormData = options.body instanceof FormData;

  if (!options.headers) {
    options.headers = {
      Accept: "application/json",
    };

    if (!isFormData) {
      options.headers["Content-Type"] = "application/json; charset=UTF-8";
    }
  }

  if (options.token) {
    options.headers = {
      ...options.headers,
      Authorization: `Bearer ${options.token}`,
    };
  } else if (typeof localStorage !== "undefined") {
    const authItem = localStorage.getItem("auth");
    let selectedProfileId: string | null | undefined = null;
    try {
      selectedProfileId = JSON.parse(
        localStorage.getItem("selectedProfileIndex") || "null"
      );
    } catch (e) {
      console.error(
        "Error parsing selectedProfileIndex",
        e,
        localStorage.getItem("selectedProfileIndex")
      );
      selectedProfileId = null;
    }
    if (authItem) {
      try {
        const auth = JSON.parse(authItem);

        if (auth && auth.token) {
          options.headers = {
            ...options.headers,
            Authorization: `Bearer ${auth.token}`,
            ...(selectedProfileId
              ? { "X-Selected-Profile-Id": selectedProfileId }
              : {}),
          };
        }
      } catch (e) {
        console.error("Error parsing auth", e, authItem);
      }
    }
  } else {
    console.error("No token found");
  }
  options.credentials = "include";

  try {
    const response = await fetch(input, options);
    if (response.status === 401) {
      const { message } = await response.json();
      if (iteration === 0 && message === "Token expired") {
        await refreshToken();
        return await authenticatedFetch(input, options, iteration + 1);
      }
      throw new Error("Unauthorized");
    }
    return response;
  } catch (e) {
    throw e;
  }
};
