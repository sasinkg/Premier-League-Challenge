import type { TeamInfo } from "../api/premierLeague";

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
