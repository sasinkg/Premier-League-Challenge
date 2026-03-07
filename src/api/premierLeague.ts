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
  const PROXY_URL = `https://api.allorigins.win/get?url=${encodeURIComponent(TARGET_URL)}`;

  const res = await fetch(PROXY_URL);
  if (!res.ok) throw new Error(`Proxy Error: ${res.status}`);

  const wrapper = await res.json();
  
  // LOG IT: This will show up in your browser console
  console.log("AllOrigins Wrapper:", wrapper);

  if (!wrapper.contents) {
    throw new Error("Proxy returned empty contents");
  }

  const data = JSON.parse(wrapper.contents);
  console.log("Parsed Football Data:", data);

  // DEFENSIVE CHECK: Make sure standings exists before touching [0]
  if (!data.standings || !data.standings[0]) {
    console.error("Standings missing in data:", data);
    throw new Error("API response format recognized but standings are missing");
  }

  return data.standings[0].table.map((row: TableEntry) => ({
    position: row.position,
    name: row.team.name,
    logo: row.team.crest,
  }));
}