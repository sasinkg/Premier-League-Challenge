import { useEffect, useState } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { fetchPremierLeagueTable } from "./api/premierLeague";
import type { StandingsRow } from "./api/premierLeague";

// LOCAL LOGOS
import arsenal from "./assets/logos/Arsenal FC.png";
import bournemouth from "./assets/logos/AFC Bournemouth.png";
import astonvilla from "./assets/logos/Aston Villa.png";
import brentford from "./assets/logos/Brentford FC.png";
import brighton from "./assets/logos/Brighton & Hove Albion.png";
import burnley from "./assets/logos/Burnley FC.png";
import chelsea from "./assets/logos/Chelsea FC.png";
import crystalpalace from "./assets/logos/Crystal Palace.png";
import everton from "./assets/logos/Everton FC.png";
import fulham from "./assets/logos/Fulham FC.png";
import leeds from "./assets/logos/Leeds United.png";
import liverpool from "./assets/logos/Liverpool FC.png";
import mancity from "./assets/logos/Manchester City.png";
import manutd from "./assets/logos/Manchester United.png";
import newcastle from "./assets/logos/Newcastle United.png";
import forest from "./assets/logos/Nottingham Forest.png";
import sunderland from "./assets/logos/Sunderland AFC.png";
import spurs from "./assets/logos/Tottenham Hotspur.png";
import westham from "./assets/logos/West Ham United.png";
import wolves from "./assets/logos/Wolverhampton Wanderers.png";

const initialTeams = [
  { name: "Arsenal", logo: arsenal },
  { name: "AFC Bournemouth", logo: bournemouth },
  { name: "Aston Villa", logo: astonvilla },
  { name: "Brentford", logo: brentford },
  { name: "Brighton & Hove Albion", logo: brighton },
  { name: "Burnley", logo: burnley },
  { name: "Chelsea", logo: chelsea },
  { name: "Crystal Palace", logo: crystalpalace },
  { name: "Everton", logo: everton },
  { name: "Fulham", logo: fulham },
  { name: "Leeds United", logo: leeds },
  { name: "Liverpool", logo: liverpool },
  { name: "Manchester City", logo: mancity },
  { name: "Manchester United", logo: manutd },
  { name: "Newcastle United", logo: newcastle },
  { name: "Nottingham Forest", logo: forest },
  { name: "Sunderland", logo: sunderland },
  { name: "Tottenham Hotspur", logo: spurs },
  { name: "West Ham United", logo: westham },
  { name: "Wolverhampton Wanderers", logo: wolves },
];

export default function App() {
  const [liveTable, setLiveTable] = useState<StandingsRow[] | null>(null);
  const [liveError, setLiveError] = useState<string | null>(null);
  const [teams, setTeams] = useState(initialTeams);

  // Fetch live table
  useEffect(() => {
    fetchPremierLeagueTable()
      .then(setLiveTable)
      .catch((err) => setLiveError(err.message));
  }, []);

  function handleDrag(result: any) {
    if (!result.destination) return;
    const items = [...teams];
    const [moved] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, moved);
    setTeams(items);
  }

  return (
    <div
      style={{
        padding: "40px",
        fontFamily: "Inter, system-ui, sans-serif",
        background: "#111",
        minHeight: "100vh",
        color: "#fff",
      }}
    >
      {/* THREE COLUMN LAYOUT */}
      <div
        style={{
          display: "flex",
          gap: "24px",
          alignItems: "flex-start",
          justifyContent: "center",
        }}
      >
        {/* LEFT COLUMN — LIVE TABLE */}
        <section
          style={{
            flex: "0 0 40%",
            padding: "20px",
            borderRadius: "16px",
            background: "#1c1c1c",
            boxShadow: "0 4px 20px rgba(0,0,0,0.45)",
          }}
        >
          <h2 style={{ marginBottom: "16px", fontSize: "22px" }}>
            Live Premier League Table
          </h2>

          {liveError && (
            <p style={{ color: "salmon" }}>
              Error loading live table: {liveError}
            </p>
          )}

          {!liveTable && !liveError && <p>Loading…</p>}

          {liveTable && (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#222" }}>
                  <th style={{ padding: "10px", textAlign: "left" }}>Pos</th>
                  <th style={{ padding: "10px", textAlign: "left" }}>Club</th>
                </tr>
              </thead>
              <tbody>
                {liveTable.map((row) => (
                  <tr
                    key={row.name}
                    style={{
                      background: row.position % 2 ? "#1a1a1a" : "#151515",
                      borderBottom: "1px solid #2a2a2a",
                      height: "44px",
                    }}
                  >
                    <td style={{ width: "40px", textAlign: "center" }}>
                      {row.position}
                    </td>
                    <td
                      style={{
                        padding: "8px",
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                      }}
                    >
                      <img
                        src={row.logo}
                        alt={row.name}
                        style={{ width: 28, height: 28 }}
                      />
                      {row.name}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>

        {/* MIDDLE COLUMN — TOP SCORERS / ASSISTS */}
        <aside
          style={{
            flex: "0 0 20%",
            display: "flex",
            flexDirection: "column",
            gap: "24px",
          }}
        >
          <div
            style={{
              padding: "16px",
              borderRadius: "16px",
              background: "#1c1c1c",
              boxShadow: "0 4px 20px rgba(0,0,0,0.45)",
            }}
          >
            <h3 style={{ marginBottom: "12px" }}>Top Scorer</h3>
            <div
              style={{
                height: "120px",
                background: "#222",
                borderRadius: "12px",
                marginBottom: "8px",
              }}
            ></div>
            <p>Haaland</p>
          </div>

          <div
            style={{
              padding: "16px",
              borderRadius: "16px",
              background: "#1c1c1c",
              boxShadow: "0 4px 20px rgba(0,0,0,0.45)",
            }}
          >
            <h3 style={{ marginBottom: "12px" }}>2nd Top Scorer</h3>
            <div
              style={{
                height: "120px",
                background: "#222",
                borderRadius: "12px",
                marginBottom: "8px",
              }}
            ></div>
            <p>Salah</p>
          </div>

          <div
            style={{
              padding: "16px",
              borderRadius: "16px",
              background: "#1c1c1c",
              boxShadow: "0 4px 20px rgba(0,0,0,0.45)",
            }}
          >
            <h3 style={{ marginBottom: "12px" }}>Top Assists</h3>
            <div
              style={{
                height: "120px",
                background: "#222",
                borderRadius: "12px",
                marginBottom: "8px",
              }}
            ></div>
            <p>Player Name</p>
          </div>
        </aside>

        {/* RIGHT COLUMN — DRAG + DROP PREDICTION */}
        <section
          style={{
            flex: "0 0 40%",
            padding: "20px",
            borderRadius: "16px",
            background: "#1c1c1c",
            boxShadow: "0 4px 20px rgba(0,0,0,0.45)",
          }}
        >
          <h2 style={{ marginBottom: "16px", fontSize: "22px" }}>
            Your Prediction
          </h2>

          <DragDropContext onDragEnd={handleDrag}>
            <Droppable droppableId="predicted">
              {(provided) => (
                <div ref={provided.innerRef} {...provided.droppableProps}>
                  <table
                    style={{ width: "100%", borderCollapse: "collapse" }}
                  >
                    <thead>
                      <tr style={{ background: "#222" }}>
                        <th style={{ padding: "10px", textAlign: "left" }}>
                          Pos
                        </th>
                        <th style={{ padding: "10px", textAlign: "left" }}>
                          Club
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {teams.map((team, index) => (
                        <Draggable
                          key={team.name}
                          draggableId={team.name}
                          index={index}
                        >
                          {(provided) => (
                            <tr
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              style={{
                                background: index % 2 ? "#1a1a1a" : "#151515",
                                borderBottom: "1px solid #2a2a2a",
                                cursor: "grab",
                                height: "44px",
                                ...provided.draggableProps.style,
                              }}
                            >
                              <td
                                style={{
                                  width: "40px",
                                  textAlign: "center",
                                }}
                              >
                                {index + 1}
                              </td>
                              <td
                                style={{
                                  padding: "10px",
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "12px",
                                }}
                              >
                                <img
                                  src={team.logo}
                                  alt={team.name}
                                  style={{ width: 28, height: 28 }}
                                />
                                {team.name}
                              </td>
                            </tr>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </tbody>
                  </table>
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </section>
      </div>
    </div>
  );
}
