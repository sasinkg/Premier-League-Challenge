// src/api/premierLeague.ts

export type LiveStanding = {
  position: number;
  name: string;
  logo: string;
};
// 1. Define the interfaces to satisfy the 'no-explicit-any' rule
interface FootballTeam {
  name: string;
  crest: string;
}

interface TableRow {
  position: number;
  team: FootballTeam;
}

interface StandingsResponse {
  standings: Array<{
    table: TableRow[];
  }>;
}

export async function fetchPremierLeagueOrder(): Promise<LiveStanding[]> {
  const TARGET_URL = "https://api.football-data.org/v4/competitions/PL/standings";
  const API_KEY = import.meta.env.VITE_FOOTBALL_API_KEY as string;
  
  // We use the 'get' endpoint because it wraps the response in a JSON object,
  // which helps bypass the browser's immediate CORS "preflight" block.
  const PROXY_URL = `https://api.allorigins.win/get?url=${encodeURIComponent(TARGET_URL)}`;

  const res = await fetch(PROXY_URL, {
    // Note: Some public proxies strip headers. If this fails, the API returns a 403.
    headers: {
      "X-Auth-Token": API_KEY,
    },
  });

  if (!res.ok) throw new Error(`Proxy Error: ${res.status}`);

  const wrapper = await res.json();
  
  // AllOrigins returns a string in 'contents', we parse it into our typed interface
  const data: StandingsResponse = JSON.parse(wrapper.contents);

  // Defensive check to avoid the "reading '0' of undefined" error
  if (!data.standings || data.standings.length === 0) {
    throw new Error("No standings data found in API response");
  }

  // No more 'any'! TypeScript now knows exactly what 'row' is.
  return data.standings[0].table.map((row: TableRow) => ({
    position: row.position,
    name: row.team.name,
    logo: row.team.crest,
  }));
}