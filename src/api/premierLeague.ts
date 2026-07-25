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

interface RosterTeam {
  name: string;
  crest: string;
}

// /teams.json lists this season's 20 clubs directly, so it stays correct
// even before any matches are played (unlike /standings.json, which can
// keep serving last season's final table for a while after promotion and
// relegation, before the new season has results of its own).
async function fetchRoster(): Promise<TeamInfo[]> {
  const res = await fetch("/teams.json");
  if (!res.ok) return [];
  const data = await res.json();
  const teams: RosterTeam[] = Array.isArray(data?.teams) ? data.teams : [];
  return teams
    .map((t) => ({ name: t.name, logo: t.crest }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

export async function fetchPremierLeagueOrder(): Promise<LiveStanding[]> {
  // No proxy, no headers, no secrets needed in the browser!
  const res = await fetch("/standings.json");

  if (!res.ok) throw new Error("Could not load standings data");

  const data = await res.json();

  const table: TeamInfo[] = data.standings[0].table.map((row: TableRow) => ({
    name: row.team.name,
    logo: row.team.crest,
  }));

  // Cross-check the standings table against the authoritative roster. If the
  // two disagree (e.g. standings still lists relegated clubs / is missing
  // promoted ones), fall back to the roster in alphabetical order until the
  // standings feed catches up with real results for the current teams.
  const roster = await fetchRoster();
  const rosterNames = new Set(roster.map((t) => t.name));
  const tableNames = new Set(table.map((t) => t.name));
  const standingsMatchRoster =
    roster.length > 0 &&
    rosterNames.size === tableNames.size &&
    [...rosterNames].every((name) => tableNames.has(name));

  const ordered = standingsMatchRoster ? table : roster;

  return ordered.map((t, i) => ({ position: i + 1, name: t.name, logo: t.logo }));
}