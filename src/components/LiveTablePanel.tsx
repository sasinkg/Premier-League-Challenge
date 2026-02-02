import type { TeamInfo } from "../api/premierLeague";
import PanelHeader from "./PanelHeader";
import { styles } from "../styles/appStyles";

export default function LiveTablePanel({
  liveTable,
  liveError,
  weekLabel,
}: {
  liveTable: TeamInfo[] | null;
  liveError: string | null;
  weekLabel: string;
}) {
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
                style={{ width: 26, height: 26, objectFit: "contain" }}
              />
              <div style={styles.clubName}>{row.name}</div>
            </div>
          ))}
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
