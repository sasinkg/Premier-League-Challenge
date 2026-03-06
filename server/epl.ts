// src/api/premierLeague.ts

export type LiveStanding = {
  position: number;
  name: string;
  logo: string;
};

type FootballDataRow = {
  position: number;
  team: {
    name: string;
    crest: string;
  };
};

type FootballDataResponse = {
  standings: Array<{
    table: FootballDataRow[];
  }>;
};

/**
 * Fetches the current Premier League standings.
 * Note: Requires the Vite proxy to be configured in vite.config.ts 
 * to avoid CORS issues and a valid VITE_FOOTBALL_API_KEY in .env.local
 */
export async function fetchPremierLeagueOrder(): Promise<LiveStanding[]> {
  const res = await fetch("/api/competitions/PL/standings", {
    headers: {
      "X-Auth-Token": import.meta.env.VITE_FOOTBALL_API_KEY as string,
    },
  });

  if (!res.ok) {
    const errorBody = await res.text();
    console.error("API Error Response:", errorBody);
    throw new Error(`Failed to fetch EPL standings: ${res.status}`);
  }

  const data: FootballDataResponse = await res.json();

  // Safety check to ensure standings exist before mapping
  if (!data.standings || data.standings.length === 0) {
    throw new Error("No standings data found in the response");
  }

  return data.standings[0].table.map((row) => ({
    position: row.position,
    name: row.team.name,
    logo: row.team.crest,
  }));
}