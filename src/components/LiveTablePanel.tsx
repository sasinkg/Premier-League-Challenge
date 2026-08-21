import { useState } from "react";
import type { TeamInfo } from "../api/premierLeague";
import type { FormResult } from "../api/form";
import PanelHeader from "./PanelHeader";
import { getStyles } from "../styles/appStyles";
import { useTheme } from "../context/ThemeContext";
import { useWindowWidth } from "../hooks/useWindowWidth";

const FORM_COLOR: Record<FormResult["result"], string> = {
  W: "#22c55e",
  D: "#9ca3af",
  L: "#ef4444",
};

function FormDots({ form }: { form: FormResult[] }) {
  const slots = Array.from({ length: 5 }, (_, i) => form[i]);
  return (
    <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
      {slots.map((f, i) =>
        f ? (
          <span
            key={i}
            title={`${f.result} ${f.scoreFor}-${f.scoreAgainst} vs ${f.opponent} (${f.home ? "H" : "A"}) · ${new Date(f.date).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}`}
            style={{
              width: 9,
              height: 9,
              borderRadius: "50%",
              background: FORM_COLOR[f.result],
              cursor: "default",
            }}
          />
        ) : (
          <span
            key={i}
            style={{
              width: 9,
              height: 9,
              borderRadius: "50%",
              background: "rgba(128,128,128,0.25)",
            }}
          />
        ),
      )}
    </div>
  );
}

export default function LiveTablePanel({
  liveTable,
  liveError,
  weekLabel,
  formByTeam,
}: {
  liveTable: TeamInfo[] | null;
  liveError: string | null;
  weekLabel: string;
  formByTeam: Map<string, FormResult[]>;
}) {
  const { dark } = useTheme();
  const isMobile = useWindowWidth() < 768;
  const styles = getStyles(dark, isMobile);
  const [collapsed, setCollapsed] = useState(false);

  const isCollapsed = isMobile && collapsed;

  return (
    <section style={styles.panel}>
      <PanelHeader
        title="Live Table"
        subtitle={weekLabel}
        right={<span style={{ ...styles.pill, background: "rgba(0,255,133,0.16)", color: "#00ff85", border: "1px solid rgba(0,255,133,0.34)" }}>● Live</span>}
        onToggle={isMobile ? () => setCollapsed(c => !c) : undefined}
        collapsed={isCollapsed}
      />

      {!isCollapsed && (
        <>
          {liveError && (
            <div style={{
              padding: 12, borderRadius: 14,
              border: "1px solid rgba(255,120,120,0.25)",
              background: "rgba(255,120,120,0.08)",
              color: "rgba(255,80,80,0.95)",
              fontSize: 13, fontWeight: 700,
            }}>
              Error loading live table: {liveError}
            </div>
          )}

          {!liveTable && !liveError && (
            <div style={{ color: dark ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.6)", fontSize: 13 }}>
              Loading…
            </div>
          )}

          {liveTable && (
            <div style={styles.listWrap}>
              {liveTable.map((row, idx) => {
                const pos = idx + 1;
                const highlight =
                  pos <= 4 ? "rgba(80,140,255,0.08)"
                  : pos === 5 ? "rgba(255,140,30,0.08)"
                  : pos === 6 ? "rgba(50,200,100,0.08)"
                  : pos >= 18 ? "rgba(255,60,60,0.08)"
                  : "transparent";
                const accentColor =
                  pos <= 4 ? "rgba(80,140,255,0.7)"
                  : pos === 5 ? "rgba(255,140,30,0.7)"
                  : pos === 6 ? "rgba(50,200,100,0.7)"
                  : pos >= 18 ? "rgba(255,60,60,0.7)"
                  : "transparent";

                return (
                  <div
                    key={row.name}
                    style={{
                      ...styles.row,
                      gridTemplateColumns: "44px 30px 1fr auto",
                      background: highlight,
                      borderLeft: `3px solid ${accentColor}`,
                    }}
                  >
                    <div style={styles.pos}>{pos}</div>
                    <img src={row.logo} alt={row.name} style={{ width: 26, height: 26, objectFit: "contain" }} />
                    <div style={styles.clubName}>{row.name}</div>
                    <FormDots form={formByTeam.get(row.name) ?? []} />
                  </div>
                );
              })}
            </div>
          )}

          <div style={styles.footer}>
            <span style={{ opacity: 0.9 }}>Auto-updates weekly</span>
            <span style={{ ...styles.pill, background: "rgba(0,255,133,0.16)", color: "#00ff85", border: "1px solid rgba(0,255,133,0.34)" }}>Updated: just now</span>
          </div>
        </>
      )}
    </section>
  );
}
