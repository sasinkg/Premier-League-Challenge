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
  const TARGET_URL = "https://api.football-data.org/v4/competitions/PL/standings";
  
  // AllOrigins wraps the request to prevent the 'preflight' handshake from failing
  const PROXY_URL = `https://api.allorigins.win/get?url=${encodeURIComponent(TARGET_URL)}`;

  const res = await fetch(PROXY_URL);
  
  if (!res.ok) throw new Error(`Proxy Error: ${res.status}`);

  const wrapper = await res.json();
  
  // AllOrigins returns the data as a string in 'contents', so we parse it manually
  const data = JSON.parse(wrapper.contents);

  // Map the data using your existing logic
  return data.standings[0].table.map((row: TableEntry) => ({
    position: row.position,
    name: row.team.name,
    logo: row.team.crest,
  }));
}