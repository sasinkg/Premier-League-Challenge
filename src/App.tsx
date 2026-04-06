import React, { useEffect, useMemo, useState } from "react";
import {
  fetchPremierLeagueOrder,
  type LiveStanding,
} from "./api/premierLeague";
import type { TeamInfo } from "./api/premierLeague";
import { fetchLeaders, type PlayerStat } from "./api/leaders";
import type { Tiebreakers } from "./groups/predictionsApi";
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
import RulesModal from "./components/RulesModal";
import PredictionPanel from "./components/PredictionPanel";
import { signInWithGoogle, logOut } from "./auth/auth";
import { getWeekKey } from "./utils/weekKey";
import { useTheme } from "./context/ThemeContext";

const SEASON_START = new Date("2025-08-15");

function iconBtn(dark: boolean): React.CSSProperties {
  return {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: 38,
    height: 38,
    borderRadius: 12,
    border: dark ? "1px solid rgba(255,255,255,0.10)" : "1px solid rgba(0,0,0,0.10)",
    background: dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)",
    color: dark ? "rgba(255,255,255,0.75)" : "rgba(0,0,0,0.65)",
    cursor: "pointer",
    transition: "background 0.15s",
  };
}

function dropdownItem(dark: boolean): React.CSSProperties {
  return {
    display: "flex",
    alignItems: "center",
    gap: 10,
    width: "100%",
    padding: "11px 14px",
    background: "none",
    border: "none",
    cursor: "pointer",
    fontSize: 14,
    fontWeight: 600,
    color: dark ? "rgba(255,255,255,0.85)" : "rgba(0,0,0,0.80)",
    textAlign: "left",
  };
}
const TIEBREAKER_LOCK = new Date("2025-08-15");
const TIEBREAKER_UNLOCK = new Date("2026-06-30");

export default function App() {
  const { dark, toggleTheme } = useTheme();
  const styles = getStyles(dark);

  const [liveTable, setLiveTable] = useState<LiveStanding[] | null>(null);
  const [liveError, setLiveError] = useState<string | null>(null);
  const [leaders, setLeaders] = useState<PlayerStat[]>([]);
  const [tiebreakers, setTiebreakers] = useState<Tiebreakers>({});
  const [showRules, setShowRules] = useState(() => localStorage.getItem("plc_rules_seen") !== "1");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [page, setPage] = useState<"game" | "groups" | "groupFeed">("game");
  const [activeGroup, setActiveGroup] = useState<GroupSummary | null>(null);

  // This is what the user drags (name + logo only)
  const [teams, setTeams] = useState<TeamInfo[]>([]);

  const weekKey = getWeekKey();
  const now = new Date();
  const tiebreakerLocked = now >= TIEBREAKER_LOCK && now < TIEBREAKER_UNLOCK;
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
    fetchLeaders().then(setLeaders);
  }, []);

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
        leaders={leaders}
        tiebreakers={tiebreakers}
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
      {showRules && (
        <RulesModal onClose={() => {
          localStorage.setItem("plc_rules_seen", "1");
          setShowRules(false);
        }} />
      )}
      <div style={styles.board}>
        <div style={{ ...styles.topbar, display: "grid", gridTemplateColumns: "1fr auto 1fr", alignItems: "center" }}>
          {/* Left: title */}
          <div>
            <div style={styles.title}>⚽</div>
          </div>

          {/* Center: Score */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
            <div style={{ fontSize: 11, opacity: 0.45, fontWeight: 700, letterSpacing: "0.10em", textTransform: "uppercase" }}>Your Score</div>
            <div style={{
              background: dark ? "rgba(120,170,255,0.12)" : "rgba(80,120,255,0.10)",
              border: dark ? "1px solid rgba(120,170,255,0.25)" : "1px solid rgba(80,120,255,0.20)",
              borderRadius: 16,
              padding: "8px 32px",
              lineHeight: 1,
            }}>
              <span style={{ fontSize: 48, fontWeight: 900, letterSpacing: "-0.03em" }}>{points}</span>
            </div>
          </div>

          {/* Right: icon buttons */}
          <div style={{ display: "flex", gap: 8, alignItems: "center", justifyContent: "flex-end" }}>

            {/* Rules */}
            <button onClick={() => setShowRules(true)} title="Rules" style={iconBtn(dark)}>ⓘ</button>

            {/* Groups */}
            <button onClick={() => setPage("groups")} title="Groups" style={iconBtn(dark)}>👥</button>

            {/* Settings */}
            <div style={{ position: "relative" }}>
              <button
                onClick={() => setSettingsOpen(o => !o)}
                title="Settings"
                style={{ ...iconBtn(dark), background: settingsOpen ? (dark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.10)") : iconBtn(dark).background }}
              >
                ⚙️
              </button>

              {settingsOpen && (
                <>
                  <div style={{ position: "fixed", inset: 0, zIndex: 99 }} onClick={() => setSettingsOpen(false)} />
                  <div style={{
                    position: "absolute",
                    top: "calc(100% + 8px)",
                    right: 0,
                    zIndex: 100,
                    background: dark ? "#1a1a2e" : "#fff",
                    border: dark ? "1px solid rgba(255,255,255,0.15)" : "1px solid rgba(0,0,0,0.12)",
                    borderRadius: 14,
                    overflow: "hidden",
                    boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
                    minWidth: 180,
                  }}>
                    <button onClick={() => { toggleTheme(); setSettingsOpen(false); }} style={dropdownItem(dark)}>
                      {dark ? "☀️" : "🌙"} {dark ? "Light mode" : "Dark mode"}
                    </button>
                    {user ? (
                      <button onClick={() => { logOut(); setSettingsOpen(false); }} style={{ ...dropdownItem(dark), color: "rgba(255,100,100,0.9)" }}>
                        🚪 Log out
                      </button>
                    ) : (
                      <button onClick={() => { signInWithGoogle().catch(e => alert(e.message)); setSettingsOpen(false); }} style={dropdownItem(dark)}>
                        🔑 Sign in
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>

          </div>
        </div>

        <div style={styles.grid}>
          {/* LiveTablePanel expects TeamInfo[] (name+logo), so pass liveAsTeamInfo */}
          <LiveTablePanel
            liveTable={liveAsTeamInfo}
            liveError={liveError}
            weekLabel={weekLabel}
          />
          <LeadersPanel
            players={leaders}
            tiebreakers={tiebreakers}
            locked={tiebreakerLocked}
            onTiebreakerChange={(key, value) =>
              setTiebreakers(prev => ({ ...prev, [key]: value }))
            }
          />
          <PredictionPanel
            teams={teams}
            liveTable={liveAsTeamInfo}
            onDragEnd={handleDrag}
            changesLeft={changesLeft}
            canDrag={canDrag}
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
