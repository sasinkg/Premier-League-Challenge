import PanelHeader from "./PanelHeader";
import { styles } from "../styles/appStyles";

export default function LeadersPanel() {
  return (
    <aside style={styles.panel}>
      <PanelHeader title="Leaders" subtitle="(stub for now)" />
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {["Top Scorer", "Top Assists", "Clean Sheets"].map((label) => (
          <div
            key={label}
            style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 16,
              padding: 14,
            }}
          >
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.7)" }}>
              {label}
            </div>
            <div
              style={{
                marginTop: 8,
                height: 92,
                borderRadius: 14,
                background: "rgba(255,255,255,0.04)",
              }}
            />
          </div>
        ))}
      </div>
    </aside>
  );
}
