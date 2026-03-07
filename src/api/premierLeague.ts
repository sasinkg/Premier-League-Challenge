// src/api/premierLeague.ts

export type LiveStanding = {
  position: number;
  name: string;
  logo: string;
};

// ADD THIS LINE BACK:
export type TeamInfo = Pick<LiveStanding, "name" | "logo">;

type FootballDataResponse = {
  standings: Array<{
    table: Array<{
      position: number;
      team: { name: string; crest: string };
    }>;
  }>;
};

export async function fetchPremierLeagueOrder(): Promise<LiveStanding[]> {
  // Use the proxy path locally, but the direct URL in production
  const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.football-data.org/v4';
  
  const res = await fetch(`${BASE_URL}/competitions/PL/standings`, {
    headers: {
      "X-Auth-Token": import.meta.env.VITE_FOOTBALL_API_KEY as string,
    },
  });

  if (!res.ok) throw new Error(`API Error: ${res.status}`);

  const data: FootballDataResponse = await res.json();

  return data.standings[0].table.map((row) => ({
    position: row.position,
    name: row.team.name,
    logo: row.team.crest,
  }));
}