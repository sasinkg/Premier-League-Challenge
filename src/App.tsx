import { useEffect, useMemo, useState } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { fetchPremierLeagueTable } from "./api/premierLeague";
import type { TeamInfo } from "./api/premierLeague";

// If you're already using your own initialTeams list, you can keep it.
// Otherwise we’ll initialize from liveTable when it loads.

function PanelHeader({
  title,
  subtitle,
  right,
}: {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
        gap: 12,
        paddingBottom: 12,
        borderBottom: "1px solid rgba(255,255,255,0.08)",
        marginBottom: 12,
      }}
    >
      <div>
        <div style={{ fontSize: 18, fontWeight: 800 }}>{title}</div>
        {subtitle && (
          <div
            style={{
              marginTop: 4,
              fontSize: 12,
              color: "rgba(255,255,255,0.65)",
            }}
          >
            {subtitle}
          </div>
        )}
      </div>
      {right}
    </div>
  );
}

export default function App() {
  const [liveTable, setLiveTable] = useState<TeamInfo[] | null>(null);
  const [liveError, setLiveError] = useState<string | null>(null);

  // User prediction list
  const [teams, setTeams] = useState<TeamInfo[]>([]);

  const weekLabel = "Week 5";
  const changesLeft = 1;

  // Fetch dummy "live table" (local list)
  useEffect(() => {
    fetchPremierLeagueTable()
      .then((data) => {
        setLiveTable(data);
        // Initialize prediction list once (so drag/drop starts with something)
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

  // Score based on how close your prediction is to "liveTable" order
  const points = useMemo(() => {
    if (!liveTable) return 0;

    const liveIndex = new Map<string, number>();
    liveTable.forEach((t, i) => liveIndex.set(t.name, i));

    let score = 0;
    teams.forEach((t, i) => {
      const actual = liveIndex.get(t.name);
      if (actual === undefined) return;
      const diff = Math.abs(i - actual);
      score += Math.max(0, 5 - diff);
    });

    return score;
  }, [teams, liveTable]);

  const styles = {
    page: {
      minHeight: "100vh",
      background:
        "radial-gradient(1200px 600px at 50% -10%, rgba(120,170,255,0.16), transparent 60%), #0b0d10",
      color: "#fff",
      fontFamily:
        'Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Arial',
      padding: "28px 18px",
    } as React.CSSProperties,

    board: {
      maxWidth: 1280,
      margin: "0 auto",
      borderRadius: 28,
      padding: 18,
      background: "rgba(255,255,255,0.04)",
      border: "1px solid rgba(255,255,255,0.08)",
      boxShadow: "0 30px 80px rgba(0,0,0,0.55)",
    } as React.CSSProperties,

    topbar: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 16,
      padding: "10px 8px 18px",
    } as React.CSSProperties,

    title: {
      fontSize: 24,
      fontWeight: 900,
      letterSpacing: 0.2,
    } as React.CSSProperties,

    linkish: {
      display: "inline-flex",
      alignItems: "center",
      gap: 8,
      cursor: "pointer",
      color: "rgba(255,255,255,0.75)",
      fontSize: 13,
      fontWeight: 700,
      userSelect: "none",
    } as React.CSSProperties,

    button: {
      display: "inline-flex",
      alignItems: "center",
      gap: 10,
      background: "rgba(120,170,255,0.95)",
      color: "#0b0d10",
      border: "none",
      borderRadius: 14,
      padding: "10px 14px",
      fontWeight: 900,
      cursor: "pointer",
      boxShadow: "0 12px 30px rgba(120,170,255,0.20)",
    } as React.CSSProperties,

    grid: {
      display: "grid",
      gridTemplateColumns: "5fr 2.4fr 5fr",
      gap: 16,
      alignItems: "start",
    } as React.CSSProperties,

    panel: {
      borderRadius: 22,
      padding: 16,
      background: "rgba(10,12,16,0.60)",
      border: "1px solid rgba(255,255,255,0.08)",
      boxShadow: "0 18px 55px rgba(0,0,0,0.45)",
      backdropFilter: "blur(10px)",
    } as React.CSSProperties,

    listWrap: {
      maxHeight: 560,
      overflow: "auto",
      borderRadius: 18,
      border: "1px solid rgba(255,255,255,0.08)",
      background: "rgba(255,255,255,0.02)",
    } as React.CSSProperties,

    row: {
      display: "grid",
      gridTemplateColumns: "44px 30px 1fr",
      alignItems: "center",
      gap: 10,
      padding: "10px 12px",
      borderBottom: "1px solid rgba(255,255,255,0.06)",
      fontSize: 14,
    } as React.CSSProperties,

    dragRow: {
      display: "grid",
      gridTemplateColumns: "44px 24px 30px 1fr",
      alignItems: "center",
      gap: 10,
      padding: "10px 12px",
      borderBottom: "1px solid rgba(255,255,255,0.06)",
      fontSize: 14,
    } as React.CSSProperties,

    pos: {
      height: 26,
      width: 26,
      borderRadius: 10,
      display: "grid",
      placeItems: "center",
      background: "rgba(255,255,255,0.05)",
      border: "1px solid rgba(255,255,255,0.08)",
      fontWeight: 900,
      fontSize: 12,
    } as React.CSSProperties,

    clubName: {
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap",
      fontWeight: 750,
    } as React.CSSProperties,

    pill: {
      display: "inline-flex",
      alignItems: "center",
      gap: 8,
      padding: "8px 10px",
      borderRadius: 999,
      background: "rgba(255,255,255,0.05)",
      border: "1px solid rgba(255,255,255,0.08)",
      fontVariantNumeric: "tabular-nums",
      fontSize: 12,
      fontWeight: 800,
      color: "rgba(255,255,255,0.78)",
    } as React.CSSProperties,

    footer: {
      marginTop: 12,
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 12,
      paddingTop: 12,
      borderTop: "1px solid rgba(255,255,255,0.08)",
      color: "rgba(255,255,255,0.72)",
      fontSize: 12,
      fontWeight: 700,
    } as React.CSSProperties,
  };

  return (
    <div style={styles.page}>
      <div style={styles.board}>
        {/* TOP BAR */}
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
          {/* LEFT — LIVE TABLE */}
          <section style={styles.panel}>
            <PanelHeader
              title="Live Table"
              subtitle={weekLabel}
              right={<span style={{...styles.pill, background: "#06402F", color:"lime"}}>● Live</span>}
            />

            {liveError && (
              <div
                style={{
                  padding: 12,
                  borderRadius: 14,
                  border: "1px solid rgba(255,120,120,0.25)",
                  background: "rgba(255,120,120,0.08)",
                  color: "rgba(255,180,180,0.95)",
                  fontSize: 13,
                  fontWeight: 700,
                }}
              >
                Error loading live table: {liveError}
              </div>
            )}

            {!liveTable && !liveError && (
              <div style={{ color: "rgba(255,255,255,0.7)", fontSize: 13 }}>
                Loading…
              </div>
            )}

            {liveTable && (
              <div style={styles.listWrap}>
                {liveTable.map((row, idx) => (
                  <div key={row.name} style={styles.row}>
                    <div style={styles.pos}>{idx + 1}</div>
<img
  src={row.logo}
  alt={row.name}
  style={{
    width: 26,
    height: 26,
    objectFit: "contain",
  }}
/>

                    <div style={styles.clubName}>{row.name}</div>
                  </div>
                ))}
              </div>
            )}

            <div style={styles.footer}>
              <span style={{ opacity: 0.9 }}>Static (auto-updates weekly)</span>
              <span style={styles.pill}>Updated: just now</span>
            </div>
          </section>

          {/* MIDDLE — STATS */}
          <aside style={styles.panel}>
            <PanelHeader title="Leaders" subtitle="(stub for now)" />
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {["Top Scorer", "Top Assists", "Clean Sheets"].map((label) => (
                <div
                  key={label}
                  style={{
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: 16,
                    padding: 14,
                  }}
                >
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.7)" }}>
                    {label}
                  </div>
                  <div
                    style={{
                      marginTop: 8,
                      height: 92,
                      borderRadius: 14,
                      background: "rgba(255,255,255,0.04)",
                    }}
                  />
                </div>
              ))}
            </div>
          </aside>

          {/* RIGHT — PREDICTION */}
          <section style={styles.panel}>
            <PanelHeader
              title="Your Prediction"
              subtitle="Drag to reorder your table"
              right={
                <span style={{...styles.pill, background: "#06402F", color:"lime"}}>Changes left: {changesLeft}</span>
              }
            />

            <DragDropContext onDragEnd={handleDrag}>
              <Droppable droppableId="predicted">
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    style={styles.listWrap}
                  >
                    {teams.map((team, index) => (
                      <Draggable
                        key={team.name}
                        draggableId={team.name}
                        index={index}
                      >
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            style={{
                              ...styles.dragRow,
                              background: snapshot.isDragging
                                ? "rgba(120,170,255,0.08)"
                                : "transparent",
                              boxShadow: snapshot.isDragging
                                ? "0 18px 40px rgba(0,0,0,0.50)"
                                : undefined,
                              ...provided.draggableProps.style,
                            }}
                          >
                            <div style={styles.pos}>{index + 1}</div>

                            <div
                              {...provided.dragHandleProps}
                              style={{
                                cursor: "grab",
                                color: "rgba(255,255,255,0.55)",
                                fontWeight: 900,
                              }}
                              title="Drag"
                            >
                              ≡
                            </div>

                            <img
                              src={team.logo}
                              alt={team.name}
                              style={{
                                width: 26,
                                height: 26,
                                objectFit: "contain",
                              }}
                            />
                            <div style={styles.clubName}>{team.name}</div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>

            <div style={styles.footer}>
              <span style={styles.pill}>Points: {points}</span>
              <span style={{ opacity: 0.8 }}>* 1 change per week</span>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
