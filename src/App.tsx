import { useEffect, useMemo, useState } from "react";
import { fetchPremierLeagueTable } from "./api/premierLeague";
import type { TeamInfo } from "./api/premierLeague";
import { styles } from "./styles/appStyles";
import { computeTotalErrorScore } from "./utils/scoring";

import LiveTablePanel from "./components/LiveTablePanel";
import LeadersPanel from "./components/LeadersPanel";
import PredictionPanel from "./components/PredictionPanel";

export default function App() {
  const [liveTable, setLiveTable] = useState<TeamInfo[] | null>(null);
  const [liveError, setLiveError] = useState<string | null>(null);
  const [teams, setTeams] = useState<TeamInfo[]>([]);

  const weekLabel = "Week 5";
  const changesLeft = 1;

  useEffect(() => {
    fetchPremierLeagueTable()
      .then((data) => {
        setLiveTable(data);
        setTeams((prev) => (prev.length ? prev : data));
      })
      .catch((err) => setLiveError(err.message));
  }, []);

  function handleDrag(result: any) {
    if (!result.destination) return;
    const items = [...teams];
    const [moved] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, moved);
    setTeams(items);
  }

  const points = useMemo(
    () => computeTotalErrorScore(liveTable, teams),
    [liveTable, teams]
  );

  return (
    <div style={styles.page}>
      <div style={styles.board}>
        <div style={styles.topbar}>
          <div>
            <div style={styles.title}>Welcome to the Premier League Guessing Game!</div>
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
          <LiveTablePanel liveTable={liveTable} liveError={liveError} weekLabel={weekLabel} />
          <LeadersPanel />
          <PredictionPanel teams={teams} onDragEnd={handleDrag} changesLeft={changesLeft} points={points} />
        </div>
      </div>
    </div>
  );
}
