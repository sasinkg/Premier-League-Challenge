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

export async function fetchLeaders(): Promise<PlayerStat[]> {
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
