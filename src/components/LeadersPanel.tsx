import PanelHeader from "./PanelHeader";
import { getStyles } from "../styles/appStyles";
import { useTheme } from "../context/ThemeContext";

export default function LeadersPanel() {
  const { dark } = useTheme();
  const styles = getStyles(dark);

  return (
    <aside style={styles.panel}>
      <PanelHeader title="Leaders" subtitle="(stub for now)" />
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {["Top Scorer", "Top Assists", "Clean Sheets"].map((label) => (
          <div
            key={label}
            style={{
              background: dark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)",
              border: dark
                ? "1px solid rgba(255,255,255,0.08)"
                : "1px solid rgba(0,0,0,0.08)",
              borderRadius: 16,
              padding: 14,
            }}
          >
            <div
              style={{
                fontSize: 12,
                color: dark ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.6)",
              }}
            >
              {label}
            </div>
            <div
              style={{
                marginTop: 8,
                height: 92,
                borderRadius: 14,
                background: dark
                  ? "rgba(255,255,255,0.04)"
                  : "rgba(0,0,0,0.04)",
              }}
            />
          </div>
        ))}
      </div>
    </aside>
  );
}
