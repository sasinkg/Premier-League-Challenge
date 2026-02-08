import { useEffect, useMemo, useState } from "react";
import {
  fetchPremierLeagueOrder,
  type LiveStanding,
} from "./api/premierLeague";
import type { TeamInfo } from "./api/premierLeague";
import { styles } from "./styles/appStyles";
import { computeTotalErrorScore } from "./utils/scoring";
import { onAuthStateChanged, type User } from "firebase/auth";
import { auth } from "./firebase";
import GroupsPage from "./pages/GroupsPage";
import GroupFeedPage from "./pages/GroupFeedPage";
import type { GroupSummary } from "./groups/groupsApi";

import LiveTablePanel from "./components/LiveTablePanel";
import LeadersPanel from "./components/LeadersPanel";
import PredictionPanel from "./components/PredictionPanel";
import { signInWithGoogle, logOut } from "./auth/auth";

export default function App() {
  const [liveTable, setLiveTable] = useState<LiveStanding[] | null>(null);
  const [liveError, setLiveError] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [page, setPage] = useState<"game" | "groups">("game");
  const [activeGroup, setActiveGroup] = useState<GroupSummary | null>(null);

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

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsub();
  }, []);

  // Convert live standings into TeamInfo[] for scoring
  const liveAsTeamInfo: TeamInfo[] | null = useMemo(() => {
    if (!liveTable) return null;
    return liveTable.map((t) => ({ name: t.name, logo: t.logo }));
  }, [liveTable]);

  const points = useMemo(
    () => computeTotalErrorScore(liveAsTeamInfo, teams),
    [liveAsTeamInfo, teams],
  );
  if (page === "groupFeed") {
  if (!user || !activeGroup) {
    setPage("groups");
    return null;
  }

  return (
    <GroupFeedPage
      user={user}
      group={activeGroup}
      onBack={() => setPage("groups")}
      teams={teams}
    />
  );
}

  if (page === "groups") {
    if (!user) {
      alert("Please sign in to use Groups");
      setPage("game");
      return null;
    }

    return <GroupsPage user={user} onBack={() => setPage("game")} />;
  }

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

          <button style={styles.button} onClick={() => setPage("groups")}>
            👥 View Groups
          </button>

          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            {user ? (
              <>
                <span style={{ opacity: 0.9 }}>Signed in as: {user.email}</span>
                <button style={styles.button} onClick={logOut}>
                  Log out
                </button>
              </>
            ) : (
              <button
                style={styles.button}
                onClick={() =>
                  signInWithGoogle().catch((e) => alert(e.message))
                }
              >
                Sign in with Google
              </button>
            )}
          </div>
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
