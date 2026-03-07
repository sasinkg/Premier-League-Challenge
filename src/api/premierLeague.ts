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
// const FOOTBALL_API_URL = "https://api.football-data.org/v4/competitions/PL/standings";
// const PROXY_PREFIX = "https://corsproxy.io/?url=";

// type FootballDataResponse = {
//   standings: Array<{
//     table: Array<{
//       position: number;
//       team: { name: string; crest: string };
//     }>;
//   }>;
// };
interface TableEntry {
  position: number;
  team: {
    name: string;
    crest: string;
  };
}
export async function fetchPremierLeagueOrder(): Promise<LiveStanding[]> {
  const API_KEY = import.meta.env.VITE_FOOTBALL_API_KEY as string;
  const TARGET_URL = "https://api.football-data.org/v4/competitions/PL/standings";
  
  // 1. Switch from /get to /raw
  // 2. We don't need JSON.parse(wrapper.contents) anymore with /raw
  const PROXY_URL = `https://api.allorigins.win/raw?url=${encodeURIComponent(TARGET_URL)}`;

  const res = await fetch(PROXY_URL, {
    headers: {
      "X-Auth-Token": API_KEY,
    },
  });

  if (!res.ok) throw new Error(`API Error: ${res.status}`);

  const data = await res.json();

  if (!data.standings || !data.standings[0]) {
    throw new Error("Standings data missing from API response");
  }

  return data.standings[0].table.map((row: any) => ({
    position: row.position,
    name: row.team.name,
    logo: row.team.crest,
  }));
}