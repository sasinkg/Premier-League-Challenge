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

export async function fetchPremierLeagueOrder(): Promise<LiveStanding[]> {
  // No proxy, no headers, no secrets needed in the browser!
  const res = await fetch("/standings.json");

  if (!res.ok) throw new Error("Could not load standings data");

  const data = await res.json();

  return data.standings[0].table.map((row: TableRow) => ({
    position: row.position,
    name: row.team.name,
    logo: row.team.crest,
  }));
}