// src/api/premierLeague.ts

export type LiveStanding = {
  position: number;
  name: string;
  logo: string;
};
export type TeamInfo = Pick<LiveStanding, "name" | "logo">;

export async function fetchPremierLeagueOrder(): Promise<LiveStanding[]> {
  const res = await fetch("/football/v4/competitions/PL/standings", {
    headers: {
      "X-Auth-Token": import.meta.env.VITE_FOOTBALL_API_KEY,
    },
  });

  if (!res.ok) throw new Error("Failed to fetch EPL standings");

  const data = await res.json();
  return data.standings[0].table.map((row: any) => ({
    position: row.position,
    name: row.team.name,
    logo: row.team.crest,
  }));
}

