const API_URL = process.env.NEXT_PUBLIC_NOMINATIM_API_URL;

export const geocode = async (q: string) => {
  const search = { q, format: "json" };
  const url = `${API_URL}/search?${new URLSearchParams(search).toString()}`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "User-Agent": "CooProg",
      referer: "https://cooprog.eu",
      Accept: "application/json",
      "Content-Type": "application/json; charset=UTF-8",
    },
  });
  if (response.status < 200 || response.status >= 300) {
    throw new Error(response.statusText);
  }
  return await response.json();
};
