export type PlayerStat = {
  id: number;
  name: string;
  teamName: string;
  teamCrest: string;
  goals: number;
  assists: number;
};

interface RawScorer {
  player: { id: number; name: string };
  team: { name: string; crest: string };
  goals: number | null;
  assists: number | null;
}

interface RawSquadPlayer {
  id: number;
  name: string;
}

interface RawTeam {
  name: string;
  crest: string;
  squad?: RawSquadPlayer[];
}

// The scorers leaderboard is empty until goals are actually scored (e.g. the
// whole preseason before a ball is kicked), which would otherwise leave the
// player search with nothing to find. /teams.json's squads give every
// current player a zero-stat entry so search always works; real scorer
// stats below override those defaults wherever they exist.
async function fetchSquadPlayers(): Promise<PlayerStat[]> {
  try {
    const res = await fetch("/teams.json");
    if (!res.ok) return [];
    const data = await res.json();
    const teams: RawTeam[] = Array.isArray(data?.teams) ? data.teams : [];
    return teams.flatMap((t) =>
      (t.squad ?? []).map((p) => ({
        id: p.id,
        name: p.name,
        teamName: t.name,
        teamCrest: t.crest,
        goals: 0,
        assists: 0,
      })),
    );
  } catch {
    return [];
  }
}

async function fetchScorers(): Promise<PlayerStat[]> {
  try {
    const res = await fetch("/scorers.json");
    if (!res.ok) return [];
    const data = await res.json();
    if (!Array.isArray(data?.scorers)) return [];
    return data.scorers.map((s: RawScorer) => ({
      id: s.player.id,
      name: s.player.name,
      teamName: s.team.name,
      teamCrest: s.team.crest,
      goals: s.goals ?? 0,
      assists: s.assists ?? 0,
    }));
  } catch {
    return [];
  }
}

export async function fetchLeaders(): Promise<PlayerStat[]> {
  const [squad, scorers] = await Promise.all([fetchSquadPlayers(), fetchScorers()]);
  const byId = new Map<number, PlayerStat>(squad.map((p) => [p.id, p]));
  for (const s of scorers) byId.set(s.id, { ...byId.get(s.id), ...s });
  return [...byId.values()];
}
