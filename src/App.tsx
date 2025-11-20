import { useState } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

// Logos
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
  const [teams, setTeams] = useState(initialTeams);

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
        fontFamily: "Inter, Arial, sans-serif",
        background: "#111",
        minHeight: "100vh",
        color: "#fff",
      }}
    >
      <h1
        style={{
          textAlign: "center",
          marginBottom: "30px",
          fontSize: "36px",
          fontWeight: 700,
        }}
      >
        Premier League Table
      </h1>

<div
  style={{
    padding: "20px",
    borderRadius: "16px",
    background: "#1c1c1c",
    width: "90%",            // 👉 expands to most of the screen
    maxWidth: "1200px",      // 👉 caps at a nice readable width
    margin: "0 auto",        // 👉 keeps it centered
    boxShadow: "0 4px 20px rgba(0,0,0,0.45)",
  }}
>

        <DragDropContext onDragEnd={handleDrag}>
          <Droppable droppableId="teams">
            {(provided) => (
              <div ref={provided.innerRef} {...provided.droppableProps}>
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    color: "white",
                  }}
                >
                  <thead>
                    <tr style={{ background: "#222" }}>
                      <th
                        style={{
                          padding: "12px",
                          textAlign: "left",
                          fontSize: "14px",
                          fontWeight: 700,
                          letterSpacing: "0.5px",
                          color: "#ddd",
                        }}
                      >
                        Rank
                      </th>
                      <th
                        style={{
                          padding: "12px",
                          textAlign: "left",
                          fontSize: "14px",
                          fontWeight: 700,
                          letterSpacing: "0.5px",
                          color: "#ddd",
                        }}
                      >
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
                              transition: "background 0.15s ease",
                              ...provided.draggableProps.style,
                            }}
                            onMouseEnter={(e) =>
                              (e.currentTarget.style.background = "#222")
                            }
                            onMouseLeave={(e) =>
                              (e.currentTarget.style.background =
                                index % 2 ? "#1a1a1a" : "#151515")
                            }
                          >
                            <td style={{ padding: "12px", color: "#ccc" }}>
                              {index + 1}
                            </td>

                            <td
                              style={{
                                padding: "12px",
                                display: "flex",
                                alignItems: "center",
                                gap: "14px",
                                color: "#fff",
                                fontSize: "15px",
                                fontWeight: 500,
                              }}
                            >
                              <img
                                src={team.logo}
                                alt={team.name}
                                style={{
                                  height: "28px", // keep height constant
                                  width: "auto", // maintain proper aspect ratio
                                  objectFit: "contain",
                                }}
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
      </div>
    </div>
  );
}
