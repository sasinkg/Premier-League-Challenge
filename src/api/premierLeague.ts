// src/api/premierLeague.ts

export type LiveStanding = {
  position: number;
  name: string;
  logo: string;
};

type FootballDataResponse = {
  standings: Array<{
    table: Array<{
      position: number;
      team: { name: string; crest: string };
    }>;
  }>;
};

export async function fetchPremierLeagueOrder(): Promise<LiveStanding[]> {
  // This calls the proxy you just set up in vite.config.ts
  const res = await fetch("/api/competitions/PL/standings", {
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