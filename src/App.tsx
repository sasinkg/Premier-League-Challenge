import React, { useEffect, useMemo, useState } from "react";
import { useWindowWidth } from "./hooks/useWindowWidth";
import {
  fetchPremierLeagueOrder,
  type LiveStanding,
} from "./api/premierLeague";
import type { TeamInfo } from "./api/premierLeague";
import { fetchLeaders, type PlayerStat } from "./api/leaders";
import { fetchAllForm, type FormResult } from "./api/form";
import type { Tiebreakers } from "./groups/predictionsApi";
import { getStyles } from "./styles/appStyles";
import { computeTotalErrorScore, computeTiebreakerBonus } from "./utils/scoring";
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

// 2026/27 season. Constructed in local time (not `new Date("2026-08-21")`,
// which parses as UTC midnight and would flip a few hours early or late
// depending on the viewer's timezone).
// Before kickoff the prediction can be reordered freely; from kickoff onwards
// it is one drag per week.
const SEASON_START = new Date(2026, 7, 21); // 21 Aug 2026
const SEASON_END = new Date(2027, 5, 30); // 30 Jun 2027

const DATE_LABEL: Intl.DateTimeFormatOptions = {
  day: "numeric",
  month: "short",
  year: "numeric",
};

// The predicted table is a season-long guess, so it is stored under one key.
// Only the weekly drag allowance is keyed by week.
const PREDICTION_KEY = "plc_prediction";

function loadStoredPrediction(): TeamInfo[] {
  try {
    const parsed = JSON.parse(localStorage.getItem(PREDICTION_KEY) ?? "null");
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (t): t is TeamInfo =>
        typeof t?.name === "string" && typeof t?.logo === "string",
    );
  } catch {
    return [];
  }
}

// Tiebreaker picks (top scorer / top assister) are stored locally so a page
// reload doesn't lose them before they've been submitted to a group.
const TIEBREAKERS_KEY = "plc_tiebreakers";

function loadStoredTiebreakers(): Tiebreakers {
  try {
    const parsed = JSON.parse(localStorage.getItem(TIEBREAKERS_KEY) ?? "null");
    if (!parsed || typeof parsed !== "object") return {};
    const { topScorer, topAssister } = parsed as Tiebreakers;
    return {
      ...(typeof topScorer === "string" ? { topScorer } : {}),
      ...(typeof topAssister === "string" ? { topAssister } : {}),
    };
  } catch {
    return {};
  }
}

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

export default function App() {
  const { dark, toggleTheme } = useTheme();
  const isMobile = useWindowWidth() < 768;
  const styles = getStyles(dark, isMobile);

  const [liveTable, setLiveTable] = useState<LiveStanding[] | null>(null);
  const [liveError, setLiveError] = useState<string | null>(null);
  const [leaders, setLeaders] = useState<PlayerStat[]>([]);
  const [formByTeam, setFormByTeam] = useState<Map<string, FormResult[]>>(new Map());
  const [tiebreakers, setTiebreakers] = useState<Tiebreakers>(loadStoredTiebreakers);
  const [showRules, setShowRules] = useState(() => localStorage.getItem("plc_rules_seen") !== "1");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [page, setPage] = useState<"game" | "groups" | "groupFeed">("game");
  const [activeGroup, setActiveGroup] = useState<GroupSummary | null>(null);

  // This is what the user drags (name + logo only)
  const [teams, setTeams] = useState<TeamInfo[]>(loadStoredPrediction);

  const weekKey = getWeekKey();
  const now = new Date();
  const seasonActive = now >= SEASON_START;
  // Tiebreaker picks are locked for the duration of the season, matching the
  // "locked once the season begins" rule shown in the rules modal.
  const tiebreakerLocked = seasonActive && now < SEASON_END;
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
    fetchAllForm().then(setFormByTeam);
  }, []);

  useEffect(() => {
    fetchPremierLeagueOrder()
      .then((data) => {
        setLiveTable(data);

        // Initialize prediction list ONCE (alphabetical by default)
        const alphabetical: TeamInfo[] = [...data]
          .map((t) => ({ name: t.name, logo: t.logo }))
          .sort((a, b) => a.name.localeCompare(b.name));

        setTeams((prev) => {
          if (!prev.length) return alphabetical;
          // Keep the saved order, but drop teams no longer in the league and
          // append any new ones so the list always matches the live table.
          const current = new Map(alphabetical.map((t) => [t.name, t]));
          const kept = prev
            .map((t) => current.get(t.name))
            .filter((t): t is TeamInfo => t !== undefined);
          const keptNames = new Set(kept.map((t) => t.name));
          return [...kept, ...alphabetical.filter((t) => !keptNames.has(t.name))];
        });
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

  // Persist the predicted order so a page reload does not wipe it while the
  // weekly drag allowance stays used up.
  useEffect(() => {
    if (teams.length) localStorage.setItem(PREDICTION_KEY, JSON.stringify(teams));
  }, [teams]);

  useEffect(() => {
    localStorage.setItem(TIEBREAKERS_KEY, JSON.stringify(tiebreakers));
  }, [tiebreakers]);

  // Convert live standings into TeamInfo[] for scoring
  const liveAsTeamInfo: TeamInfo[] | null = useMemo(() => {
    if (!liveTable) return null;
    return liveTable.map((t) => ({ name: t.name, logo: t.logo }));
  }, [liveTable]);

  // Null while the live table is still loading, so the UI can show a
  // placeholder instead of a "0" that reads as a perfect score.
  const points = useMemo(() => {
    if (!liveAsTeamInfo) return null;
    return (
      computeTotalErrorScore(liveAsTeamInfo, teams) +
      computeTiebreakerBonus(leaders, tiebreakers)
    );
  }, [liveAsTeamInfo, teams, leaders, tiebreakers]);

  // Both group pages require a signed-in user (and a selected group). Deriving
  // this rather than correcting `page` in an effect means signing out while on
  // a group page falls back to the game instead of rendering with a null user.
  if (page === "groupFeed" && user && activeGroup) {
    return (
      <div key="groupFeed" className="page-enter">
        <GroupFeedPage
          user={user}
          group={activeGroup}
          onBack={() => setPage("groups")}
          teams={teams}
          liveTable={liveAsTeamInfo}
          leaders={leaders}
          tiebreakers={tiebreakers}
        />
      </div>
    );
  }

  if (page === "groups" && user) {
    return (
      <div key="groups" className="page-enter">
        <GroupsPage
          user={user}
          onBack={() => setPage("game")}
          onOpenGroup={(g) => { setActiveGroup(g); setPage("groupFeed"); }}
        />
      </div>
    );
  }

  const settingsDropdown = settingsOpen && (
    <>
      <div style={{ position: "fixed", inset: 0, zIndex: 99 }} onClick={() => setSettingsOpen(false)} />
      <div style={{ position: "absolute", top: "calc(100% + 8px)", right: 0, zIndex: 100, background: dark ? "#1a1a2e" : "#fff", border: dark ? "1px solid rgba(255,255,255,0.15)" : "1px solid rgba(0,0,0,0.12)", borderRadius: 14, overflow: "hidden", boxShadow: "0 8px 32px rgba(0,0,0,0.3)", minWidth: 180 }}>
        <button onClick={() => { toggleTheme(); setSettingsOpen(false); }} style={dropdownItem(dark)}>
          {dark ? "☀️" : "🌙"} {dark ? "Light mode" : "Dark mode"}
        </button>
        {user
          ? <button onClick={() => { logOut(); setSettingsOpen(false); }} style={{ ...dropdownItem(dark), color: "rgba(255,100,100,0.9)" }}>🚪 Log out</button>
          : <button onClick={() => { signInWithGoogle().catch(e => alert(e.message)); setSettingsOpen(false); }} style={dropdownItem(dark)}>🔑 Sign in</button>
        }
      </div>
    </>
  );

  const iconButtons = (
    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
      <button onClick={() => setShowRules(true)} title="Rules" style={iconBtn(dark)}>ⓘ</button>
      <button
        onClick={() => {
          if (!user) {
            alert("Please sign in to use Groups");
            return;
          }
          setPage("groups");
        }}
        title="Groups"
        style={iconBtn(dark)}
      >
        👥
      </button>
      <div style={{ position: "relative" }}>
        <button
          onClick={() => setSettingsOpen(o => !o)}
          title="Settings"
          style={{ ...iconBtn(dark), background: settingsOpen ? (dark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.10)") : iconBtn(dark).background }}
        >
          ⚙️
        </button>
        {settingsDropdown}
      </div>
    </div>
  );

  return (
    <div key="game" className="page-enter" style={styles.page}>
      {showRules && (
        <RulesModal onClose={() => {
          localStorage.setItem("plc_rules_seen", "1");
          setShowRules(false);
        }} />
      )}
      <div style={styles.board}>
        <div style={{
          ...styles.topbar,
          display: isMobile ? "flex" : "grid",
          gridTemplateColumns: isMobile ? undefined : "1fr auto 1fr",
          flexDirection: isMobile ? "column" : undefined,
          gap: isMobile ? 12 : 16,
          alignItems: isMobile ? "stretch" : "center",
        }}>
          {/* Title row — on mobile also contains icon buttons */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={styles.title}>⚽</div>
            {isMobile && iconButtons}
          </div>

          {/* Score — centered */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
            <div style={{ fontSize: 11, opacity: 0.45, fontWeight: 700, letterSpacing: "0.10em", textTransform: "uppercase" }}>Your Score</div>
            <div style={{
              background: dark ? "rgba(120,170,255,0.12)" : "rgba(80,120,255,0.10)",
              border: dark ? "1px solid rgba(120,170,255,0.25)" : "1px solid rgba(80,120,255,0.20)",
              borderRadius: 16,
              padding: isMobile ? "6px 24px" : "8px 32px",
              lineHeight: 1,
              width: isMobile ? "100%" : undefined,
              textAlign: "center",
              boxSizing: "border-box",
            }}>
              <span style={{ fontSize: isMobile ? 40 : 48, fontWeight: 900, letterSpacing: "-0.03em" }}>{points ?? "—"}</span>
            </div>
          </div>

          {/* Desktop icon buttons */}
          {!isMobile && (
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              {iconButtons}
            </div>
          )}
        </div>

        <div style={styles.grid}>
          {/* LiveTablePanel expects TeamInfo[] (name+logo), so pass liveAsTeamInfo */}
          <LiveTablePanel
            liveTable={liveAsTeamInfo}
            liveError={liveError}
            weekLabel={weekLabel}
            formByTeam={formByTeam}
          />
          <LeadersPanel
            players={leaders}
            tiebreakers={tiebreakers}
            locked={tiebreakerLocked}
            unlockLabel={SEASON_END.toLocaleDateString("en-GB", DATE_LABEL)}
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
            unlimitedUntil={
              seasonActive
                ? undefined
                : SEASON_START.toLocaleDateString("en-GB", DATE_LABEL)
            }
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
