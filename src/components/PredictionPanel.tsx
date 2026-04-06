import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import type { TeamInfo } from "../api/premierLeague";
import PanelHeader from "./PanelHeader";
import { getStyles } from "../styles/appStyles";
import type { DropResult } from "@hello-pangea/dnd";
import { useTheme } from "../context/ThemeContext";
import { useWindowWidth } from "../hooks/useWindowWidth";

function getTeamDelta(
  liveTable: TeamInfo[],
  teamName: string,
  predictedPos: number,
): number | null {
  const actualPos = liveTable.findIndex((t) => t.name === teamName);
  if (actualPos === -1) return null;
  return actualPos + 1 - predictedPos;
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

export default function PredictionPanel({
  teams,
  liveTable,
  onDragEnd,
  changesLeft,
  canDrag,
  onRevert,
  onSubmit,
}: {
  teams: TeamInfo[];
  liveTable: TeamInfo[] | null;
  onDragEnd: (result: DropResult) => void;
  changesLeft: number;
  canDrag: boolean;
  onRevert?: () => void;
  onSubmit?: () => void;
}) {
  const { dark } = useTheme();
  const isMobile = useWindowWidth() < 768;
  const styles = getStyles(dark, isMobile);

  return (
    <section style={styles.panel}>
      <PanelHeader
        title="Your Prediction"
        subtitle={
          canDrag
            ? "Drag one team to reorder your table"
            : "No changes left this week"
        }
        right={
          <span
            style={{
              ...styles.pill,
              background: changesLeft > 0 ? "#06402F" : "rgba(255,60,60,0.15)",
              color: changesLeft > 0 ? "lime" : "rgba(255,100,100,0.9)",
            }}
          >
            Changes left: {changesLeft}
          </span>
        }
      />

      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="predicted">
          {(provided) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              style={{
                ...styles.listWrap,
                opacity: canDrag ? 1 : 0.6,
              }}
            >
              {teams.map((team, index) => {
                const predictedPos = index + 1;
                const delta = liveTable
                  ? getTeamDelta(liveTable, team.name, predictedPos)
                  : null;
                const error = delta !== null ? Math.abs(delta) : 0;
                const badgeStyle =
                  delta !== null ? getPositionBadgeStyle(error, dark) : null;

                return (
                  <Draggable
                    key={team.name}
                    draggableId={team.name}
                    index={index}
                    isDragDisabled={!canDrag}
                  >
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        style={{
                          ...styles.dragRow,
                          gridTemplateColumns: "44px 24px 30px 1fr auto",
                          background: snapshot.isDragging
                            ? "rgba(120,170,255,0.10)"
                            : "transparent",
                          boxShadow: snapshot.isDragging
                            ? "0 18px 40px rgba(0,0,0,0.30)"
                            : undefined,
                          ...provided.draggableProps.style,
                        }}
                      >
                        <span
                          style={{
                            ...styles.pos,
                            background: badgeStyle
                              ? badgeStyle.background
                              : styles.pos.background,
                            border: badgeStyle
                              ? badgeStyle.border
                              : styles.pos.border,
                          }}
                        >
                          {predictedPos}
                        </span>

                        <div
                          {...provided.dragHandleProps}
                          style={{
                            cursor: canDrag ? "grab" : "not-allowed",
                            color: canDrag
                              ? dark
                                ? "rgba(255,255,255,0.55)"
                                : "rgba(0,0,0,0.40)"
                              : dark
                                ? "rgba(255,255,255,0.20)"
                                : "rgba(0,0,0,0.20)",
                            fontWeight: 900,
                          }}
                          title={
                            canDrag ? "Drag" : "No changes left this week"
                          }
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

                        <span
                          style={{
                            fontSize: 11,
                            fontWeight: 800,
                            color:
                              delta !== null
                                ? getDeltaColor(delta)
                                : "transparent",
                            textAlign: "right",
                            paddingRight: 2,
                          }}
                        >
                          {delta !== null ? formatDelta(delta) : ""}
                        </span>
                      </div>
                    )}
                  </Draggable>
                );
              })}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      {(onRevert || onSubmit) && (
        <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
          {onRevert && (
            <button
              onClick={onRevert}
              style={{
                ...styles.button,
                background: dark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)",
                color: dark ? "rgba(255,255,255,0.85)" : "rgba(0,0,0,0.75)",
                boxShadow: "none",
                padding: "14px 16px",
                borderRadius: 16,
                flex: "0 0 auto",
              }}
            >
              ↩ Revert
            </button>
          )}
          {onSubmit && (
            <button
              onClick={onSubmit}
              style={{
                ...styles.button,
                flex: 1,
                padding: "14px 20px",
                fontSize: 15,
                borderRadius: 16,
                justifyContent: "center",
                boxShadow: "0 16px 40px rgba(120,170,255,0.30)",
              }}
            >
              Submit Prediction to Group
            </button>
          )}
        </div>
      )}

      <div style={styles.footer}>
        <span style={{ opacity: 0.6, fontSize: 12 }}>* 1 change per week</span>
      </div>
    </section>
  );
}
