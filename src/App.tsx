import { useEffect, useMemo, useState } from "react";
import {
  fetchPremierLeagueOrder,
  type LiveStanding,
} from "./api/premierLeague";
import type { TeamInfo } from "./api/premierLeague";
import { getStyles } from "./styles/appStyles";
import { computeTotalErrorScore } from "./utils/scoring";
import { onAuthStateChanged, type User } from "firebase/auth";
import { auth } from "./firebase";
import GroupsPage from "./pages/GroupsPage";
import GroupFeedPage from "./pages/GroupFeedPage";
import type { GroupSummary } from "./groups/groupsApi";
import type { DropResult } from "@hello-pangea/dnd";

import LiveTablePanel from "./components/LiveTablePanel";
import LeadersPanel from "./components/LeadersPanel";
import PredictionPanel from "./components/PredictionPanel";
import { signInWithGoogle, logOut } from "./auth/auth";
import { getWeekKey } from "./utils/weekKey";
import { useTheme } from "./context/ThemeContext";

const SEASON_START = new Date("2025-08-15");

export default function App() {
  const { dark, toggleTheme } = useTheme();
  const styles = getStyles(dark);

  const [liveTable, setLiveTable] = useState<LiveStanding[] | null>(null);
  const [liveError, setLiveError] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [page, setPage] = useState<"game" | "groups" | "groupFeed">("game");
  const [activeGroup, setActiveGroup] = useState<GroupSummary | null>(null);

  // This is what the user drags (name + logo only)
  const [teams, setTeams] = useState<TeamInfo[]>([]);

  const weekKey = getWeekKey();
  const seasonActive = new Date() >= SEASON_START;
  const dragStorageKey = `plc_dragged_${weekKey}`;

  const [hasUsedDrag, setHasUsedDrag] = useState(() =>
    seasonActive ? localStorage.getItem(dragStorageKey) === "1" : false,
  );
  const [teamsBeforeDrag, setTeamsBeforeDrag] = useState<TeamInfo[] | null>(null);

  const weekLabel = "Live";
  const changesLeft = seasonActive ? (hasUsedDrag ? 0 : 1) : 1;
  const canDrag = !seasonActive || !hasUsedDrag;

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

  function handleDrag(result: DropResult) {
    if (!result.destination) return;
    if (!canDrag) return;
    setTeamsBeforeDrag([...teams]);
    const items = [...teams];
    const [moved] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, moved);
    setTeams(items);
    if (seasonActive) {
      setHasUsedDrag(true);
      localStorage.setItem(dragStorageKey, "1");
    }
  }

  function handleRevert() {
    if (!teamsBeforeDrag) return;
    setTeams(teamsBeforeDrag);
    setTeamsBeforeDrag(null);
    setHasUsedDrag(false);
    localStorage.removeItem(dragStorageKey);
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
    // If this happens, it means the user refreshed or state got lost.
    // Just show groups page instead of setting state during render.
    if (!user || !activeGroup) {
      return (
        <GroupsPage
          user={user!}
          onBack={() => setPage("game")}
          onOpenGroup={(g) => {
            setActiveGroup(g);
            setPage("groupFeed");
          }}
        />
      );
    }

    return (
      <GroupFeedPage
        user={user}
        group={activeGroup}
        onBack={() => setPage("groups")}
        teams={teams}
        liveTable={liveAsTeamInfo}
      />
    );
  }

  if (page === "groups") {
    if (!user) {
      alert("Please sign in to use Groups");
      setPage("game");
      return null;
    }

    return (
      <GroupsPage
        user={user}
        onBack={() => setPage("game")}
        onOpenGroup={(g) => {
          setActiveGroup(g);
          setPage("groupFeed");
        }}
      />
    );
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
            <button style={styles.themeToggle} onClick={toggleTheme}>
              {dark ? "Light mode" : "Dark mode"}
            </button>

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
            liveTable={liveAsTeamInfo}
            onDragEnd={handleDrag}
            changesLeft={changesLeft}
            canDrag={canDrag}
            points={points}
            onRevert={teamsBeforeDrag ? handleRevert : undefined}
            onSubmit={() => {
              if (!user) {
                alert("Sign in to submit a prediction.");
              } else {
                setTeamsBeforeDrag(null);
                setPage("groups");
              }
            }}
          />
        </div>
      </div>
    </div>
  );
}
