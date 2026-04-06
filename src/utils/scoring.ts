import type { TeamInfo } from "../api/premierLeague";
import type { PlayerStat } from "../api/leaders";

export function computeTiebreakerBonus(
  players: PlayerStat[],
  tiebreakers?: { topScorer?: string; topAssister?: string }
): number {
  if (!tiebreakers || players.length === 0) return 0;
  const topScorer = [...players].sort((a, b) => b.goals - a.goals)[0];
  const topAssister = [...players].sort((a, b) => b.assists - a.assists)[0];
  let bonus = 0;
  if (tiebreakers.topScorer && topScorer?.name === tiebreakers.topScorer) bonus -= 2;
  if (tiebreakers.topAssister && topAssister?.name === tiebreakers.topAssister) bonus -= 2;
  return bonus;
}

export function computeTotalErrorScore(
  liveTable: TeamInfo[] | null,
  teams: TeamInfo[]
): number {
  if (!liveTable) return 0;

  const actualPosition = new Map<string, number>();
  liveTable.forEach((team, index) => {
    actualPosition.set(team.name, index + 1);
  });

  let total = 0;

  teams.forEach((team, index) => {
    const predictedPos = index + 1;
    const actualPos = actualPosition.get(team.name);
    if (!actualPos) return;
    total += Math.abs(predictedPos - actualPos);
  });

  return total;
}
