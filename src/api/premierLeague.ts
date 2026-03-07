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
  const res = await fetch("/api/v4/competitions/PL/standings", {
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