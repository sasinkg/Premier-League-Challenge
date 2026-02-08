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
import { styles } from "../styles/appStyles";
import type { GroupSummary } from "../groups/groupsApi";

type Member = {
  uid: string;
  role: "owner" | "member";
  displayName: string;
  email: string;
  joinedAt?: Timestamp;
};

type Props = {
  user: User;
  group: GroupSummary;
  onBack: () => void;
};

export default function GroupFeedPage({ user, group, onBack }: Props) {
  const [members, setMembers] = useState<Member[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(true);
  const [msg, setMsg] = useState<string | null>(null);

  async function loadMembers() {
    setLoadingMembers(true);
    try {
      const q = query(
        collection(db, "groups", group.id, "members"),
        orderBy("joinedAt", "asc"),
      );
      const snap = await getDocs(q);
      const list: Member[] = snap.docs.map((d) => {
        const data = d.data() as any;
        return {
          uid: d.id,
          role: (data.role as "owner" | "member") ?? "member",
          displayName: String(data.displayName ?? data.email ?? "Unknown"),
          email: String(data.email ?? ""),
          joinedAt: data.joinedAt,
        };
      });
      setMembers(list);
    } catch (e: any) {
      setMsg(e?.message ?? "Failed to load members");
    } finally {
      setLoadingMembers(false);
    }
  }

  useEffect(() => {
    loadMembers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [group.id]);

  const owner = useMemo(() => members.find((m) => m.role === "owner") ?? null, [members]);

  async function copyCode() {
    try {
      await navigator.clipboard.writeText(group.code);
      setMsg("Copied group code!");
      setTimeout(() => setMsg(null), 1200);
    } catch {
      setMsg("Could not copy. Your browser may block clipboard access.");
    }
  }

  return (
    <div style={styles.page}>
      <div style={styles.board}>
        <div style={styles.topbar}>
          <div>
            <div style={styles.title}>{group.name}</div>
            <div style={{ marginTop: 6, display: "flex", gap: 12, flexWrap: "wrap" }}>
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
          {msg && (
            <div style={{ opacity: 0.9 }}>
              {msg}
            </div>
          )}

          {/* Members */}
          <div
            style={{
              padding: 12,
              borderRadius: 16,
              border: "1px solid rgba(255,255,255,0.12)",
              background: "rgba(0,0,0,0.25)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
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
                        border: "1px solid rgba(255,255,255,0.10)",
                        background: "rgba(0,0,0,0.15)",
                      }}
                    >
                      <div style={{ display: "grid" }}>
                        <div style={{ fontWeight: 700 }}>
                          {m.displayName}
                          {m.uid === user.uid ? " (you)" : ""}
                        </div>
                        <div style={{ opacity: 0.75, fontSize: 13 }}>{m.email}</div>
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

          {/* Placeholder for the real “feed” */}
          <div
            style={{
              padding: 12,
              borderRadius: 16,
              border: "1px solid rgba(255,255,255,0.12)",
              background: "rgba(0,0,0,0.25)",
            }}
          >
            <div style={{ fontWeight: 800, fontSize: 16 }}>Group Feed</div>
            <div style={{ marginTop: 8, opacity: 0.8, lineHeight: 1.5 }}>
              Next we’ll store and display each member’s prediction for the week here.
              <br />
              Planned shape:
              <br />
              <span style={{ opacity: 0.75 }}>
                groups/{group.id}/predictions/{weekKey}/users/{user.uid}
              </span>
            </div>

            <div style={{ marginTop: 12 }}>
              <button
                style={styles.button}
                onClick={() => alert("Next: post your prediction to Firestore")}
              >
                Post my prediction (next)
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
