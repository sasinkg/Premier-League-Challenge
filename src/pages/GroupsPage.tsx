import { useEffect, useState } from "react";
import type { User } from "firebase/auth";
import { styles } from "../styles/appStyles";
import {
  createGroup,
  joinGroupByCode,
  listMyGroups,
  type GroupSummary,
} from "../groups/groupsApi";

type Props = {
  user: User;
  onBack: () => void;
};

export default function GroupsPage({ user, onBack }: Props) {
  const [myGroups, setMyGroups] = useState<GroupSummary[]>([]);
  const [loading, setLoading] = useState(true);

  const [newGroupName, setNewGroupName] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [msg, setMsg] = useState<string | null>(null);

  async function refresh() {
    setLoading(true);
    try {
      const groups = await listMyGroups(user);
      setMyGroups(groups);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user.uid]);

  async function onCreate() {
    setMsg(null);
    try {
      const g = await createGroup(user, newGroupName);
      setNewGroupName("");
      setMsg(`Created "${g.name}" (code: ${g.code})`);
      await refresh();
    } catch (e: any) {
      setMsg(e?.message ?? "Failed to create group");
    }
  }

  async function onJoin() {
    setMsg(null);
    try {
      const g = await joinGroupByCode(user, joinCode);
      setJoinCode("");
      setMsg(`Joined "${g.name}"`);
      await refresh();
    } catch (e: any) {
      setMsg(e?.message ?? "Failed to join group");
    }
  }

  return (
    <div style={styles.page}>
      <div style={styles.board}>
        <div style={styles.topbar}>
          <div>
            <div style={styles.title}>Groups</div>
            <div style={{ marginTop: 6 }}>
              <span style={styles.linkish} onClick={onBack}>
                ← Back
              </span>
            </div>
          </div>

          <div style={{ opacity: 0.9 }}>Signed in as: {user.email}</div>
        </div>

        <div style={{ display: "grid", gap: 16, padding: 16 }}>
          {msg && <div style={{ opacity: 0.9 }}>{msg}</div>}

          <div style={{ display: "grid", gap: 10 }}>
            <div style={{ fontWeight: 700, fontSize: 18 }}>Create a group</div>
            <div
              style={{
                display: "flex",
                gap: 10,
                alignItems: "center",
                flexWrap: "wrap",
              }}
            >
              <input
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                placeholder="Group name"
                style={{
                  padding: "10px 12px",
                  borderRadius: 12,
                  border: "1px solid rgba(255,255,255,0.15)",
                  background: "rgba(0,0,0,0.2)",
                  color: "white",
                  minWidth: 260,
                }}
              />
              <button style={styles.button} onClick={onCreate}>
                Create
              </button>
            </div>
          </div>

          <div style={{ display: "grid", gap: 10 }}>
            <div style={{ fontWeight: 700, fontSize: 18 }}>Join with code</div>
            <div
              style={{
                display: "flex",
                gap: 10,
                alignItems: "center",
                flexWrap: "wrap",
              }}
            >
              <input
                value={joinCode}
                onChange={(e) =>
                  setJoinCode(e.target.value.replace(/\D/g, "").slice(0, 6))
                }
                placeholder="4-digit code"
                style={{
                  padding: "10px 12px",
                  borderRadius: 12,
                  border: "1px solid rgba(255,255,255,0.15)",
                  background: "rgba(0,0,0,0.2)",
                  color: "white",
                  minWidth: 180,
                }}
              />
              <button style={styles.button} onClick={onJoin}>
                Join
              </button>
            </div>
          </div>

          <div style={{ display: "grid", gap: 10 }}>
            <div style={{ fontWeight: 700, fontSize: 18 }}>My groups</div>
            {loading ? (
              <div style={{ opacity: 0.7 }}>Loading…</div>
            ) : myGroups.length === 0 ? (
              <div style={{ opacity: 0.7 }}>
                No groups yet. Create or join one above.
              </div>
            ) : (
              <div style={{ display: "grid", gap: 10 }}>
                {myGroups.map((g) => (
                  <div
                    key={g.id}
                    style={{
                      padding: 12,
                      borderRadius: 16,
                      border: "1px solid rgba(255,255,255,0.12)",
                      background: "rgba(0,0,0,0.25)",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: 12,
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 700 }}>{g.name}</div>
                      <div style={{ opacity: 0.75, fontSize: 13 }}>
                        Code: {g.code}
                      </div>
                    </div>

                    <button
                      style={styles.button}
                      onClick={() => alert(`Open group feed for: ${g.name}`)}
                    >
                      Open
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
