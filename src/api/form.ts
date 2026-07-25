export type FormResult = {
  result: "W" | "D" | "L";
  opponent: string;
  scoreFor: number;
  scoreAgainst: number;
  home: boolean;
  date: string;
};

interface RawMatch {
  utcDate: string;
  status: string;
  homeTeam: { name: string };
  awayTeam: { name: string };
  score: { fullTime: { home: number | null; away: number | null } };
}

// One team's last N finished results, oldest first (so dots read left-to-right
// as "older -> more recent", matching how form strips are usually shown).
function recentFormFor(teamName: string, matches: RawMatch[], count: number): FormResult[] {
  return matches
    .filter((m) => m.homeTeam.name === teamName || m.awayTeam.name === teamName)
    .sort((a, b) => b.utcDate.localeCompare(a.utcDate))
    .slice(0, count)
    .map((m) => {
      const home = m.homeTeam.name === teamName;
      const scoreFor = (home ? m.score.fullTime.home : m.score.fullTime.away) ?? 0;
      const scoreAgainst = (home ? m.score.fullTime.away : m.score.fullTime.home) ?? 0;
      const opponent = home ? m.awayTeam.name : m.homeTeam.name;
      const result: FormResult["result"] =
        scoreFor > scoreAgainst ? "W" : scoreFor < scoreAgainst ? "L" : "D";
      return { result, opponent, scoreFor, scoreAgainst, home, date: m.utcDate };
    })
    .reverse();
}

export async function fetchAllForm(count = 5): Promise<Map<string, FormResult[]>> {
  const map = new Map<string, FormResult[]>();
  try {
    const res = await fetch("/matches.json");
    if (!res.ok) return map;
    const data = await res.json();
    const matches: RawMatch[] = Array.isArray(data?.matches) ? data.matches : [];
    const finished = matches.filter((m) => m.status === "FINISHED");
    const teamNames = new Set<string>();
    finished.forEach((m) => {
      teamNames.add(m.homeTeam.name);
      teamNames.add(m.awayTeam.name);
    });
    teamNames.forEach((name) => map.set(name, recentFormFor(name, finished, count)));
    return map;
  } catch {
    return map;
  }
}
