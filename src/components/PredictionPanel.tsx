import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import type { TeamInfo } from "../api/premierLeague";
import PanelHeader from "./PanelHeader";
import { styles } from "../styles/appStyles";
import type { DropResult } from "@hello-pangea/dnd";

export default function PredictionPanel({
  teams,
  onDragEnd,
  changesLeft,
  points,
}: {
  teams: TeamInfo[];
  onDragEnd: (result: DropResult) => void;
  changesLeft: number;
  points: number;
}) {
  return (
    <section style={styles.panel}>
      <PanelHeader
        title="Your Prediction"
        subtitle="Drag to reorder your table"
        right={
          <span
            style={{ ...styles.pill, background: "#06402F", color: "lime" }}
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

      <div style={styles.footer}>
        <span style={styles.pill}>Score (lower wins): {points}</span>
        <span style={{ opacity: 0.8 }}>* 1 change per week</span>
      </div>
    </section>
  );
}
