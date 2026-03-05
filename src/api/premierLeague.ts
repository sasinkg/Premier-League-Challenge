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

export async function fetchPremierLeagueOrder(): Promise<LiveStanding[]> {
  // Add the base domain here
  const BASE_URL = "https://api.football-data.org";
  
  const res = await fetch(`${BASE_URL}/v4/competitions/PL/standings`, {
    headers: {
      "X-Auth-Token": import.meta.env.VITE_FOOTBALL_API_KEY as string,
      "Content-Type": "application/json", // Good practice to include this
    },
  });

  if (!res.ok) {
    const errorBody = await res.text();
    console.error("API Error Response:", errorBody);
    throw new Error(`Failed to fetch EPL standings: ${res.status}`);
  }

  const data = (await res.json()) as FootballDataResponse;

  return data.standings[0].table.map((row) => ({
    position: row.position,
    name: row.team.name,
    logo: row.team.crest,
  }));
}
