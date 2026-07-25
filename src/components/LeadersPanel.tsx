import { useState, useRef, useEffect } from "react";
import { useWindowWidth } from "../hooks/useWindowWidth";
import PanelHeader from "./PanelHeader";
import { getStyles } from "../styles/appStyles";
import { useTheme } from "../context/ThemeContext";
import type { PlayerStat } from "../api/leaders";
import type { Tiebreakers } from "../groups/predictionsApi";

type Props = {
  players: PlayerStat[];
  tiebreakers: Tiebreakers;
  locked: boolean;
  /** Date picks become editable again, shown in the locked tooltip. */
  unlockLabel: string;
  onTiebreakerChange: (key: keyof Tiebreakers, value: string) => void;
};

function PlayerPicker({
  players,
  value,
  onChange,
  getStat,
  statSuffix,
  dark,
}: {
  players: PlayerStat[];
  value: string;
  onChange: (name: string) => void;
  getStat: (p: PlayerStat) => number;
  statSuffix: string;
  dark: boolean;
}) {
  const [query, setQuery] = useState(value);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => { setQuery(value); }, [value]);

  useEffect(() => {
    function handle(e: MouseEvent) {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  const filtered = query.trim().length >= 1
    ? players.filter(p => p.name.toLowerCase().includes(query.toLowerCase())).slice(0, 8)
    : [];

  const selected = players.find(p => p.name === value) ?? null;

  function select(p: PlayerStat) {
    onChange(p.name);
    setQuery(p.name);
    setOpen(false);
  }

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: 6,
        background: dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)",
        border: dark ? "1px solid rgba(255,255,255,0.12)" : "1px solid rgba(0,0,0,0.12)",
        borderRadius: 10,
        padding: "7px 10px",
      }}>
        {selected && (
          <img src={selected.teamCrest} alt={selected.teamName}
            style={{ width: 18, height: 18, objectFit: "contain", flexShrink: 0 }} />
        )}
        <input
          value={query}
          onChange={e => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          placeholder="Search player…"
          style={{
            background: "transparent",
            border: "none",
            outline: "none",
            color: "inherit",
            fontSize: 13,
            flex: 1,
            minWidth: 0,
          }}
        />
        {value && (
          <button
            onClick={() => { onChange(""); setQuery(""); }}
            style={{
              background: "none", border: "none", cursor: "pointer",
              color: "inherit", opacity: 0.45, fontSize: 12, padding: 0, lineHeight: 1,
            }}
          >
            ✕
          </button>
        )}
      </div>

      {open && filtered.length > 0 && (
        <div style={{
          position: "absolute",
          top: "100%",
          left: 0,
          right: 0,
          marginTop: 4,
          background: dark ? "#1a1a2e" : "#fff",
          border: dark ? "1px solid rgba(255,255,255,0.15)" : "1px solid rgba(0,0,0,0.15)",
          borderRadius: 10,
          overflow: "hidden",
          zIndex: 100,
          boxShadow: "0 8px 24px rgba(0,0,0,0.35)",
        }}>
          {filtered.map((p, i) => (
            <div
              key={p.id}
              onClick={() => select(p)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "8px 10px",
                cursor: "pointer",
                fontSize: 13,
                borderBottom: i < filtered.length - 1
                  ? dark ? "1px solid rgba(255,255,255,0.06)" : "1px solid rgba(0,0,0,0.06)"
                  : "none",
                background: p.name === value
                  ? dark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.05)"
                  : "transparent",
                transition: "background 0.1s",
              }}
              onMouseEnter={e => { e.currentTarget.style.background = dark ? "rgba(255,255,255,0.10)" : "rgba(0,0,0,0.06)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = p.name === value ? (dark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.05)") : "transparent"; }}
            >
              <img src={p.teamCrest} alt={p.teamName} style={{ width: 18, height: 18, objectFit: "contain", flexShrink: 0 }} />
              <span style={{ flex: 1 }}>{p.name}</span>
              <span style={{ opacity: 0.5, fontSize: 12, flexShrink: 0 }}>{getStat(p)} {statSuffix}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function LockedOverlay({
  children,
  unlockLabel,
}: {
  children: React.ReactNode;
  unlockLabel: string;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      style={{ position: "relative", cursor: "not-allowed" }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div style={{ pointerEvents: "none", opacity: 0.5 }}>{children}</div>
      {hovered && (
        <div style={{
          position: "absolute",
          bottom: "calc(100% + 8px)",
          left: "50%",
          transform: "translateX(-50%)",
          background: "rgba(220,38,38,0.95)",
          color: "#fff",
          fontSize: 12,
          fontWeight: 600,
          padding: "6px 12px",
          borderRadius: 8,
          whiteSpace: "nowrap",
          pointerEvents: "none",
          boxShadow: "0 4px 16px rgba(220,38,38,0.4)",
          zIndex: 200,
        }}>
          🔒 Picks locked until {unlockLabel}
          <div style={{
            position: "absolute",
            top: "100%",
            left: "50%",
            transform: "translateX(-50%)",
            borderLeft: "6px solid transparent",
            borderRight: "6px solid transparent",
            borderTop: "6px solid rgba(220,38,38,0.95)",
          }} />
        </div>
      )}
    </div>
  );
}

function LiveLeader({ player, stat, suffix }: { player: PlayerStat | null; stat: number; suffix: string }) {
  if (!player) {
    return <div style={{ opacity: 0.35, fontSize: 13 }}>No data yet</div>;
  }
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <img src={player.teamCrest} alt={player.teamName}
          style={{ width: 26, height: 26, objectFit: "contain" }} />
        <span style={{ fontWeight: 700, fontSize: 14 }}>{player.name}</span>
      </div>
      <span style={{ opacity: 0.65, fontSize: 13, fontWeight: 600, flexShrink: 0 }}>
        {stat} {suffix}
      </span>
    </div>
  );
}

export default function LeadersPanel({ players, tiebreakers, locked, unlockLabel, onTiebreakerChange }: Props) {
  const { dark } = useTheme();
  const isMobile = useWindowWidth() < 768;
  const styles = getStyles(dark, isMobile);
  const [collapsed, setCollapsed] = useState(false);
  const isCollapsed = isMobile && collapsed;

  // Squad players are seeded with zero stats (see fetchLeaders) so search
  // always has real names, but that means a top-of-sort pick isn't a real
  // "leader" until someone has actually scored/assisted.
  const topScorerPick = [...players].sort((a, b) => b.goals - a.goals)[0];
  const topScorer = topScorerPick && topScorerPick.goals > 0 ? topScorerPick : null;
  const topAssisterPick = [...players].sort((a, b) => b.assists - a.assists)[0];
  const topAssister = topAssisterPick && topAssisterPick.assists > 0 ? topAssisterPick : null;

  const cardStyle: React.CSSProperties = {
    background: dark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)",
    border: dark ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(0,0,0,0.08)",
    borderRadius: 16,
    padding: 14,
    display: "grid",
    gap: 10,
  };

  return (
    <aside style={styles.panel}>
      <PanelHeader
        title="Leaders"
        subtitle="−2 pts each if correct"
        onToggle={isMobile ? () => setCollapsed(c => !c) : undefined}
        collapsed={isCollapsed}
      />
      {!isCollapsed && <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>

        <div style={cardStyle}>
          <div style={{ fontSize: 11, opacity: 0.55, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase" }}>
            Top Scorer
          </div>
          <LiveLeader player={topScorer} stat={topScorer?.goals ?? 0} suffix="⚽" />
          <div style={{ fontSize: 11, opacity: 0.45 }}>Your pick</div>
          {locked ? (
            <LockedOverlay unlockLabel={unlockLabel}>
              <PlayerPicker
                players={players}
                value={tiebreakers.topScorer ?? ""}
                onChange={() => {}}
                getStat={p => p.goals}
                statSuffix="⚽"
                dark={dark}
              />
            </LockedOverlay>
          ) : (
            <PlayerPicker
              players={players}
              value={tiebreakers.topScorer ?? ""}
              onChange={v => onTiebreakerChange("topScorer", v)}
              getStat={p => p.goals}
              statSuffix="⚽"
              dark={dark}
            />
          )}
        </div>

        <div style={cardStyle}>
          <div style={{ fontSize: 11, opacity: 0.55, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase" }}>
            Top Assister
          </div>
          <LiveLeader player={topAssister} stat={topAssister?.assists ?? 0} suffix="🅰️" />
          <div style={{ fontSize: 11, opacity: 0.45 }}>Your pick</div>
          {locked ? (
            <LockedOverlay unlockLabel={unlockLabel}>
              <PlayerPicker
                players={players}
                value={tiebreakers.topAssister ?? ""}
                onChange={() => {}}
                getStat={p => p.assists}
                statSuffix="🅰️"
                dark={dark}
              />
            </LockedOverlay>
          ) : (
            <PlayerPicker
              players={players}
              value={tiebreakers.topAssister ?? ""}
              onChange={v => onTiebreakerChange("topAssister", v)}
              getStat={p => p.assists}
              statSuffix="🅰️"
              dark={dark}
            />
          )}
        </div>

      </div>}
    </aside>
  );
}
