// src/api/premierLeague.ts

export type LiveStanding = {
  position: number;
  name: string;
  logo: string;
};

// ADD THIS LINE BACK:
export type TeamInfo = Pick<LiveStanding, "name" | "logo">;
// VARS
// const BASE_URL = import.meta.env.DEV 
//   ? '/api' 
//   : (import.meta.env.VITE_API_BASE_URL || 'https://api.football-data.org/v4');
const FOOTBALL_API_URL = "https://api.football-data.org/v4/competitions/PL/standings";
const PROXY_PREFIX = "https://corsproxy.io/?url=";

type FootballDataResponse = {
  standings: Array<{
    table: Array<{
      position: number;
      team: { name: string; crest: string };
    }>;
  }>;
};

export async function fetchPremierLeagueOrder(): Promise<LiveStanding[]> {
  // Use the proxy on the live site to bypass CORS, but use your local /api proxy in dev
  const fetchUrl = import.meta.env.DEV 
    ? "/api/competitions/PL/standings" 
    : `${PROXY_PREFIX}${encodeURIComponent(FOOTBALL_API_URL)}`;

  const res = await fetch(fetchUrl, {
    headers: {
      "X-Auth-Token": import.meta.env.VITE_FOOTBALL_API_KEY as string,
    },
  });

  if (!res.ok) {
    // This helps us see if the proxy or the API is failing
    const errorText = await res.text();
    console.error("Fetch failed:", errorText);
    throw new Error(`API Error: ${res.status}`);
  }

  const data: FootballDataResponse = await res.json();

  return data.standings[0].table.map((row) => ({
    position: row.position,
    name: row.team.name,
    logo: row.team.crest,
  }));
}