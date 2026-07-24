import { useEffect, useState } from "react";
import { useTheme } from "../context/ThemeContext";

type Props = {
  onClose: () => void;
};

export default function RulesModal({ onClose }: Props) {
  const { dark } = useTheme();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(t);
  }, []);

  function handleClose() {
    setVisible(false);
    setTimeout(onClose, 250);
  }

  // Close on Escape
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") handleClose();
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const rule = (emoji: string, title: string, body: string) => (
    <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
      <span style={{ fontSize: 22, flexShrink: 0, lineHeight: 1.3 }}>{emoji}</span>
      <div>
        <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 2 }}>{title}</div>
        <div style={{ fontSize: 13, opacity: 0.7, lineHeight: 1.5 }}>{body}</div>
      </div>
    </div>
  );

  return (
    <div
      onClick={handleClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.6)",
        backdropFilter: "blur(4px)",
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
        opacity: visible ? 1 : 0,
        transition: "opacity 0.25s ease",
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: dark ? "#0f0f1a" : "#ffffff",
          border: dark ? "1px solid rgba(255,255,255,0.12)" : "1px solid rgba(0,0,0,0.10)",
          borderRadius: 20,
          padding: 20,
          maxWidth: 480,
          width: "100%",
          maxHeight: "90dvh",
          overflowY: "auto",
          boxShadow: "0 24px 64px rgba(0,0,0,0.5)",
          display: "grid",
          gap: 16,
          transform: visible ? "translateY(0) scale(1)" : "translateY(24px) scale(0.97)",
          opacity: visible ? 1 : 0,
          transition: "transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.25s ease",
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div style={{ fontSize: 20, fontWeight: 900, marginBottom: 4 }}>How to Play</div>
            <div style={{ fontSize: 13, opacity: 0.55 }}>Premier League Guessing Game</div>
          </div>
          <button
            onClick={handleClose}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: 20,
              opacity: 0.45,
              color: "inherit",
              padding: 0,
              lineHeight: 1,
            }}
          >
            ✕
          </button>
        </div>

        {/* Divider */}
        <div style={{ height: 1, background: dark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)" }} />

        {/* Rules */}
        <div style={{ display: "grid", gap: 16 }}>
          {rule("🏆", "Predict the final table", "Arrange all 20 Premier League teams into the order you think they'll finish at the end of the season.")}
          {rule("🔀", "One change per week", "Before the season kicks off you can reorder as much as you like. Once it starts you get one drag per week to update your prediction — use it wisely.")}
          {rule("📊", "Scoring", "Your score is the total position error — the sum of how far off each team is. Lower is better. A score of 0 would be a perfect prediction.")}
          {rule("⚽", "Tiebreakers", "Before the season starts, pick a top scorer and top assister. Each correct pick reduces your score by 2 points. Picks are locked once the season begins.")}
          {rule("👥", "Groups", "Create or join a group with friends to compare predictions and compete on a shared leaderboard.")}
        </div>

        {/* Divider */}
        <div style={{ height: 1, background: dark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)" }} />

        <button
          onClick={handleClose}
          style={{
            background: "rgba(120,170,255,0.85)",
            color: "#000",
            border: "none",
            borderRadius: 12,
            padding: "12px 20px",
            fontSize: 14,
            fontWeight: 700,
            cursor: "pointer",
            width: "100%",
          }}
        >
          Got it
        </button>
      </div>
    </div>
  );
}
