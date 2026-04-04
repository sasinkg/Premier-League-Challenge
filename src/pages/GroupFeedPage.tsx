import { useEffect, useMemo, useState } from "react";
import type { User } from "firebase/auth";
import {
  collection,
  getDocs,
  orderBy,
  query,
  type Timestamp,
} from "firebase/firestore";
import { db } from "../firebase";
import { getStyles } from "../styles/appStyles";
import type { GroupSummary } from "../groups/groupsApi";
import type { TeamInfo } from "../api/premierLeague";
import { getWeekKey } from "../utils/weekKey";
import {
  saveMyPrediction,
  listPredictionsForWeek,
  type UserPrediction,
} from "../groups/predictionsApi";
import { computeTotalErrorScore } from "../utils/scoring";
import { useTheme } from "../context/ThemeContext";

function getTeamDelta(
  liveTable: TeamInfo[],
  teamName: string,
  predictedPos: number,
): number | null {
  const actualPos = liveTable.findIndex((t) => t.name === teamName);
  if (actualPos === -1) return null;
  return actualPos + 1 - predictedPos;
  // positive → team LOWER than predicted (▼)
  // negative → team HIGHER than predicted (▲)
  // zero     → exact match (✓)
}

function getPositionBadgeStyle(
  error: number,
  dark: boolean,
): { background: string; border: string } {
  if (error === 0)
    return {
      background: dark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)",
      border: dark
        ? "1px solid rgba(255,255,255,0.10)"
        : "1px solid rgba(0,0,0,0.10)",
    };
  if (error <= 2)
    return {
      background: "rgba(251,191,36,0.28)",
      border: "1px solid rgba(251,191,36,0.45)",
    };
  if (error <= 5)
    return {
      background: "rgba(249,115,22,0.28)",
      border: "1px solid rgba(249,115,22,0.45)",
    };
  return {
    background: "rgba(239,68,68,0.28)",
    border: "1px solid rgba(239,68,68,0.45)",
  };
}

function formatDelta(delta: number): string {
  if (delta === 0) return "✓";
  if (delta < 0) return `▲${Math.abs(delta)}`;
  return `▼${delta}`;
}

function getDeltaColor(delta: number): string {
  if (delta === 0) return "rgba(120,255,160,0.90)";
  if (delta < 0) return "rgba(120,200,255,0.90)";
  return "rgba(255,120,120,0.90)";
}

type Member = {
  uid: string;
  role: "owner" | "member";
  displayName: string;
  email: string;
  joinedAt?: Timestamp;
};
type MemberDoc = {
  role?: "owner" | "member";
  displayName?: string;
  email?: string;
  joinedAt?: Timestamp;
};

type Props = {
  user: User;
  group: GroupSummary;
  onBack: () => void;
  teams: TeamInfo[];
  liveTable: TeamInfo[] | null;
};

export default function GroupFeedPage({
  user,
  group,
  onBack,
  teams,
  liveTable,
}: Props) {
  const { dark } = useTheme();
  const styles = getStyles(dark);

  const [members, setMembers] = useState<Member[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(true);
  const [predictions, setPredictions] = useState<UserPrediction[]>([]);
  const [loadingPredictions, setLoadingPredictions] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const weekKey = getWeekKey();

  async function loadMembers() {
    setLoadingMembers(true);
    try {
      const q = query(
        collection(db, "groups", group.id, "members"),
        orderBy("joinedAt", "asc"),
      );
      const snap = await getDocs(q);
      const list: Member[] = snap.docs.map((d) => {
        const data = d.data() as MemberDoc;
        const role: "owner" | "member" =
          data.role === "owner" || data.role === "member"
            ? data.role
            : "member";
        const email = typeof data.email === "string" ? data.email : "";
        const displayNameRaw =
          typeof data.displayName === "string" ? data.displayName : "";
        return {
          uid: d.id,
          role,
          displayName: displayNameRaw || email || "Unknown",
          email,
          joinedAt: data.joinedAt,
        };
      });
      setMembers(list);
    } catch (e: unknown) {
      setMsg(e instanceof Error ? e.message : "Failed to load members");
    } finally {
      setLoadingMembers(false);
    }
  }

  async function loadPredictions() {
    setLoadingPredictions(true);
    try {
      const list = await listPredictionsForWeek(group.id, weekKey);
      setPredictions(list);
    } catch (e: unknown) {
      setMsg(e instanceof Error ? e.message : "Failed to load predictions");
    } finally {
      setLoadingPredictions(false);
    }
  }

  useEffect(() => {
    loadMembers();
    loadPredictions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [group.id]);

  const owner = useMemo(
    () => members.find((m) => m.role === "owner") ?? null,
    [members],
  );

  const myPrediction = useMemo(
    () => predictions.find((p) => p.uid === user.uid) ?? null,
    [predictions, user.uid],
  );

  const rankedPredictions = useMemo(() => {
    if (!liveTable) return predictions;
    return [...predictions].sort(
      (a, b) =>
        computeTotalErrorScore(liveTable, a.teams) -
        computeTotalErrorScore(liveTable, b.teams),
    );
  }, [predictions, liveTable]);

  async function handleSubmit() {
    setSubmitting(true);
    try {
      await saveMyPrediction(user, group.id, weekKey, teams);
      setMsg("Prediction submitted!");
      setTimeout(() => setMsg(null), 2000);
      await loadPredictions();
    } catch (e: unknown) {
      setMsg(e instanceof Error ? e.message : "Failed to submit prediction");
    } finally {
      setSubmitting(false);
    }
  }

  async function copyCode() {
    try {
      await navigator.clipboard.writeText(group.code);
      setMsg("Copied group code!");
      setTimeout(() => setMsg(null), 1200);
    } catch {
      setMsg("Could not copy. Your browser may block clipboard access.");
    }
  }

  const sectionCard = {
    padding: 12,
    borderRadius: 16,
    border: dark ? "1px solid rgba(255,255,255,0.12)" : "1px solid rgba(0,0,0,0.10)",
    background: dark ? "rgba(0,0,0,0.25)" : "rgba(255,255,255,0.80)",
  };

  return (
    <div style={styles.page}>
      <div style={styles.board}>
        <div style={styles.topbar}>
          <div>
            <div style={styles.title}>{group.name}</div>
            <div
              style={{
                marginTop: 6,
                display: "flex",
                gap: 12,
                flexWrap: "wrap",
              }}
            >
              <span style={styles.linkish} onClick={onBack}>
                ← Back to Groups
              </span>
              <span style={{ opacity: 0.75 }}>
                Code: <span style={{ fontWeight: 700 }}>{group.code}</span>
              </span>
              <span style={styles.linkish} onClick={copyCode} title="Copy code">
                Copy code
              </span>
            </div>
            {owner && (
              <div style={{ marginTop: 6, opacity: 0.75, fontSize: 13 }}>
                Owner: {owner.displayName}
              </div>
            )}
          </div>

          <div style={{ opacity: 0.9, textAlign: "right" }}>
            <div>Signed in as:</div>
            <div style={{ fontWeight: 700 }}>{user.email}</div>
          </div>
        </div>

        <div style={{ padding: 16, display: "grid", gap: 16 }}>
          {msg && <div style={{ opacity: 0.9 }}>{msg}</div>}

          {/* Submit prediction */}
          <div style={sectionCard}>
            <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 10 }}>
              {myPrediction ? "Update My Prediction" : "Post My Prediction"}
            </div>
            <div style={{ opacity: 0.75, fontSize: 13, marginBottom: 10 }}>
              Week of {weekKey} — submits your current predicted table order
            </div>
            <button
              style={{
                ...styles.button,
                width: "100%",
                padding: "16px 20px",
                fontSize: 16,
                borderRadius: 16,
                justifyContent: "center",
                boxShadow: "0 16px 40px rgba(120,170,255,0.30)",
                opacity: submitting ? 0.6 : 1,
              }}
              onClick={handleSubmit}
              disabled={submitting}
            >
              {submitting
                ? "Submitting…"
                : myPrediction
                  ? "Update My Prediction"
                  : "Submit My Prediction"}
            </button>
          </div>

          {/* Group leaderboard / predictions feed */}
          <div style={sectionCard}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: 12,
                marginBottom: 10,
              }}
            >
              <div style={{ fontWeight: 800, fontSize: 16 }}>
                Group Predictions
              </div>
              <button style={styles.button} onClick={loadPredictions}>
                Refresh
              </button>
            </div>

            {loadingPredictions ? (
              <div style={{ opacity: 0.7 }}>Loading predictions…</div>
            ) : rankedPredictions.length === 0 ? (
              <div style={{ opacity: 0.7 }}>
                No predictions submitted yet for this week.
              </div>
            ) : (
              <div style={{ display: "grid", gap: 12 }}>
                {rankedPredictions.map((pred, i) => {
                  const score = liveTable
                    ? computeTotalErrorScore(liveTable, pred.teams)
                    : null;
                  const isMe = pred.uid === user.uid;

                  return (
                    <div
                      key={pred.uid}
                      style={{
                        padding: "10px 12px",
                        borderRadius: 12,
                        border: isMe
                          ? dark
                            ? "1px solid rgba(255,255,255,0.35)"
                            : "1px solid rgba(0,0,0,0.25)"
                          : dark
                            ? "1px solid rgba(255,255,255,0.10)"
                            : "1px solid rgba(0,0,0,0.08)",
                        background: isMe
                          ? dark
                            ? "rgba(255,255,255,0.08)"
                            : "rgba(120,170,255,0.10)"
                          : dark
                            ? "rgba(0,0,0,0.15)"
                            : "rgba(0,0,0,0.02)",
                      }}
                    >
                      {/* Header row */}
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          marginBottom: 8,
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <span
                            style={{
                              fontWeight: 800,
                              fontSize: 15,
                              opacity: 0.5,
                              minWidth: 20,
                            }}
                          >
                            #{i + 1}
                          </span>
                          <span style={{ fontWeight: 700 }}>
                            {pred.displayName || pred.email}
                            {isMe ? " (you)" : ""}
                          </span>
                        </div>
                        {score !== null && (
                          <span
                            style={{
                              fontWeight: 700,
                              fontSize: 14,
                              opacity: 0.9,
                            }}
                          >
                            Score: {score}
                          </span>
                        )}
                      </div>

                      {/* Team list */}
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns:
                            "repeat(auto-fill, minmax(160px, 1fr))",
                          gap: 4,
                        }}
                      >
                        {pred.teams.map((team, pos) => {
                          const predictedPos = pos + 1;
                          const delta = liveTable
                            ? getTeamDelta(liveTable, team.name, predictedPos)
                            : null;
                          const error = delta !== null ? Math.abs(delta) : 0;
                          const badgeStyle =
                            delta !== null
                              ? getPositionBadgeStyle(error, dark)
                              : null;

                          return (
                            <div
                              key={team.name}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 4,
                                fontSize: 12,
                              }}
                            >
                              <span
                                style={{
                                  minWidth: 18,
                                  height: 18,
                                  borderRadius: 5,
                                  display: "inline-flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  fontWeight: 800,
                                  fontSize: 11,
                                  flexShrink: 0,
                                  background: badgeStyle
                                    ? badgeStyle.background
                                    : dark
                                      ? "rgba(255,255,255,0.06)"
                                      : "rgba(0,0,0,0.06)",
                                  border: badgeStyle
                                    ? badgeStyle.border
                                    : dark
                                      ? "1px solid rgba(255,255,255,0.10)"
                                      : "1px solid rgba(0,0,0,0.10)",
                                }}
                              >
                                {predictedPos}
                              </span>
                              <img
                                src={team.logo}
                                alt={team.name}
                                style={{
                                  width: 16,
                                  height: 16,
                                  objectFit: "contain",
                                  flexShrink: 0,
                                }}
                              />
                              <span
                                style={{
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  whiteSpace: "nowrap",
                                  opacity: 0.85,
                                  flex: 1,
                                }}
                              >
                                {team.name}
                              </span>
                              {delta !== null && (
                                <span
                                  style={{
                                    fontSize: 10,
                                    fontWeight: 800,
                                    color: getDeltaColor(delta),
                                    flexShrink: 0,
                                  }}
                                >
                                  {formatDelta(delta)}
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Members */}
          <div style={sectionCard}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: 12,
              }}
            >
              <div style={{ fontWeight: 800, fontSize: 16 }}>Members</div>
              <button style={styles.button} onClick={loadMembers}>
                Refresh
              </button>
            </div>

            <div style={{ marginTop: 10 }}>
              {loadingMembers ? (
                <div style={{ opacity: 0.7 }}>Loading…</div>
              ) : members.length === 0 ? (
                <div style={{ opacity: 0.7 }}>No members found.</div>
              ) : (
                <div style={{ display: "grid", gap: 8 }}>
                  {members.map((m) => (
                    <div
                      key={m.uid}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: 12,
                        padding: "8px 10px",
                        borderRadius: 12,
                        border: dark
                          ? "1px solid rgba(255,255,255,0.10)"
                          : "1px solid rgba(0,0,0,0.08)",
                        background: dark
                          ? "rgba(0,0,0,0.15)"
                          : "rgba(0,0,0,0.02)",
                      }}
                    >
                      <div style={{ display: "grid" }}>
                        <div style={{ fontWeight: 700 }}>
                          {m.displayName}
                          {m.uid === user.uid ? " (you)" : ""}
                        </div>
                        <div style={{ opacity: 0.75, fontSize: 13 }}>
                          {m.email}
                        </div>
                      </div>
                      <div style={{ opacity: 0.75, fontSize: 13 }}>
                        {m.role === "owner" ? "Owner" : "Member"}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
