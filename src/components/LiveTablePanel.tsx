import type { TeamInfo } from "../api/premierLeague";
import PanelHeader from "./PanelHeader";
import { getStyles } from "../styles/appStyles";
import { useTheme } from "../context/ThemeContext";

export default function LiveTablePanel({
  liveTable,
  liveError,
  weekLabel,
}: {
  liveTable: TeamInfo[] | null;
  liveError: string | null;
  weekLabel: string;
}) {
  const { dark } = useTheme();
  const styles = getStyles(dark);

  return (
    <section style={styles.panel}>
      <PanelHeader
        title="Live Table"
        subtitle={weekLabel}
        right={
          <span style={{ ...styles.pill, background: "#06402F", color: "lime" }}>
            ● Live
          </span>
        }
      />

      {liveError && (
        <div
          style={{
            padding: 12,
            borderRadius: 14,
            border: "1px solid rgba(255,120,120,0.25)",
            background: "rgba(255,120,120,0.08)",
            color: "rgba(255,80,80,0.95)",
            fontSize: 13,
            fontWeight: 700,
          }}
        >
          Error loading live table: {liveError}
        </div>
      )}

      {!liveTable && !liveError && (
        <div
          style={{
            color: dark ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.6)",
            fontSize: 13,
          }}
        >
          Loading…
        </div>
      )}

      {liveTable && (
        <div style={styles.listWrap}>
          {liveTable.map((row, idx) => {
            const pos = idx + 1;
            const highlight =
              pos <= 4
                ? "rgba(80,140,255,0.08)"
                : pos === 5
                  ? "rgba(255,140,30,0.08)"
                  : pos === 6
                    ? "rgba(50,200,100,0.08)"
                    : pos >= 18
                      ? "rgba(255,60,60,0.08)"
                      : "transparent";
            const accentColor =
              pos <= 4
                ? "rgba(80,140,255,0.7)"
                : pos === 5
                  ? "rgba(255,140,30,0.7)"
                  : pos === 6
                    ? "rgba(50,200,100,0.7)"
                    : pos >= 18
                      ? "rgba(255,60,60,0.7)"
                      : "transparent";

            return (
              <div
                key={row.name}
                style={{
                  ...styles.row,
                  background: highlight,
                  borderLeft: `3px solid ${accentColor}`,
                }}
              >
                <div style={styles.pos}>{pos}</div>
                <img
                  src={row.logo}
                  alt={row.name}
                  style={{ width: 26, height: 26, objectFit: "contain" }}
                />
                <div style={styles.clubName}>{row.name}</div>
              </div>
            );
          })}
        </div>
      )}

      <div style={styles.footer}>
        <span style={{ opacity: 0.9 }}>Auto-updates weekly</span>
        <span style={{ ...styles.pill, background: "#06402F", color: "lime" }}>
          Updated: just now
        </span>
      </div>
    </section>
  );
}
