// src/api/premierLeague.ts

export type LiveStanding = {
  position: number;
  name: string;
  logo: string;
};

export type TeamInfo = Pick<LiveStanding, "name" | "logo">;

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

// src/api/premierLeague.ts

export async function fetchPremierLeagueOrder(): Promise<LiveStanding[]> {
  const res = await fetch("/api/competitions/PL/standings", {
    headers: {
      "X-Auth-Token": import.meta.env.VITE_FOOTBALL_API_KEY as string,
    },
  });

  const data = await res.json();
  return data.standings[0].table.map((row: any) => ({
    position: row.position,
    name: row.team.name,
    logo: row.team.crest,
  }));
}
