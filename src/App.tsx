import { useEffect, useMemo, useState } from "react";
import {
  fetchPremierLeagueOrder,
  type LiveStanding,
} from "./api/premierLeague";
import type { TeamInfo } from "./api/premierLeague";
import { styles } from "./styles/appStyles";
import { computeTotalErrorScore } from "./utils/scoring";

import LiveTablePanel from "./components/LiveTablePanel";
import LeadersPanel from "./components/LeadersPanel";
import PredictionPanel from "./components/PredictionPanel";

export default function App() {
  const [liveTable, setLiveTable] = useState<LiveStanding[] | null>(null);
  const [liveError, setLiveError] = useState<string | null>(null);

  // This is what the user drags (name + logo only)
  const [teams, setTeams] = useState<TeamInfo[]>([]);

  const weekLabel = "Live";
  const changesLeft = 1;

  useEffect(() => {
    fetchPremierLeagueOrder()
      .then((data) => {
        setLiveTable(data);

        // Initialize prediction list ONCE (alphabetical by default)
        const alphabetical: TeamInfo[] = [...data]
          .map((t) => ({ name: t.name, logo: t.logo }))
          .sort((a, b) => a.name.localeCompare(b.name));

        setTeams((prev) => (prev.length ? prev : alphabetical));
      })
      .catch((err) => {
        setLiveError(err?.message ?? "Failed to load live table");
      });
  }, []);

  function handleDrag(result: any) {
    if (!result.destination) return;
    const items = [...teams];
    const [moved] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, moved);
    setTeams(items);
  }

  // Convert live standings into TeamInfo[] for scoring
  const liveAsTeamInfo: TeamInfo[] | null = useMemo(() => {
    if (!liveTable) return null;
    return liveTable.map((t) => ({ name: t.name, logo: t.logo }));
  }, [liveTable]);

  const points = useMemo(
    () => computeTotalErrorScore(liveAsTeamInfo, teams),
    [liveAsTeamInfo, teams]
  );

  return (
    <div style={styles.page}>
      <div style={styles.board}>
        <div style={styles.topbar}>
          <div>
            <div style={styles.title}>
              Welcome to the Premier League Guessing Game!
            </div>
            <div style={{ marginTop: 6 }}>
              <span
                style={styles.linkish}
                onClick={() => alert("Rules modal goes here")}
                title="Rules"
              >
                ⓘ Rules
              </span>
            </div>
          </div>

          <button style={styles.button} onClick={() => alert("Go to Groups")}>
            👥 View Groups
          </button>
        </div>

        <div style={styles.grid}>
          {/* LiveTablePanel expects TeamInfo[] (name+logo), so pass liveAsTeamInfo */}
          <LiveTablePanel
            liveTable={liveAsTeamInfo}
            liveError={liveError}
            weekLabel={weekLabel}
          />
          <LeadersPanel />
          <PredictionPanel
            teams={teams}
            onDragEnd={handleDrag}
            changesLeft={changesLeft}
            points={points}
          />
        </div>
      </div>
    </div>
  );
}
