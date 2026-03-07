// src/api/premierLeague.ts

export type LiveStanding = {
  position: number;
  name: string;
  logo: string;
};

// ADD THIS LINE BACK:
export type TeamInfo = Pick<LiveStanding, "name" | "logo">;
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
  const API_KEY = import.meta.env.VITE_FOOTBALL_API_KEY as string;
  const TARGET = "https://api.football-data.org/v4/competitions/PL/standings";
  
  // This proxy is specifically built to allow headers
  const PROXY_URL = "https://cors-anywhere.herokuapp.com/";

  const res = await fetch(`${PROXY_URL}${TARGET}`, {
    headers: {
      "X-Auth-Token": API_KEY,
    },
  });

  if (!res.ok) {
    if (res.status === 403) throw new Error("Please visit https://cors-anywhere.herokuapp.com/corsdemo and click 'Request access'");
    throw new Error(`API Error: ${res.status}`);
  }

  const data = await res.json();
  return data.standings[0].table.map((row: any) => ({
    position: row.position,
    name: row.team.name,
    logo: row.team.crest,
  }));
}