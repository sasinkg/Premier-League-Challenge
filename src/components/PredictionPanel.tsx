import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import type { TeamInfo } from "../api/premierLeague";
import PanelHeader from "./PanelHeader";
import { styles } from "../styles/appStyles";
import type { DropResult } from "@hello-pangea/dnd";

export default function PredictionPanel({
  teams,
  onDragEnd,
  changesLeft,
  canDrag,
  points,
  onSubmit,
}: {
  teams: TeamInfo[];
  onDragEnd: (result: DropResult) => void;
  changesLeft: number;
  canDrag: boolean;
  points: number;
  onSubmit?: () => void;
}) {
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
                pointerEvents: canDrag ? undefined : "none",
              }}
            >
              {teams.map((team, index) => (
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
                          cursor: canDrag ? "grab" : "not-allowed",
                          color: canDrag
                            ? "rgba(255,255,255,0.55)"
                            : "rgba(255,255,255,0.2)",
                          fontWeight: 900,
                        }}
                        title={canDrag ? "Drag" : "No changes left this week"}
                      >
                        ≡
                      </div>

                      <img
                        src={team.logo}
                        alt={team.name}
                        style={{ width: 26, height: 26, objectFit: "contain" }}
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

      {onSubmit && (
        <button
          onClick={onSubmit}
          style={{
            ...styles.button,
            width: "100%",
            marginTop: 12,
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

      <div style={styles.footer}>
        <span style={styles.pill}>Score (lower wins): {points}</span>
        <span style={{ opacity: 0.8 }}>* 1 change per week</span>
      </div>
    </section>
  );
}
