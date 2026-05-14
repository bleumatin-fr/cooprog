const API_URL = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL;

export interface Stats {
  projectCount: number;
  lastMonthProjectCount: number;
  usersCount: number;
  lastMonthUserCount: number;
  tonsCount: number;
  artisticTeamsCount: number;
  artisticTeamsLastMonthCount: number;
}

export const getStats = async (): Promise<Stats> => {
  const response = await fetch(`${API_URL}/stats`, {
    method: "GET",
  });
  return await response.json();
};
