import { useTheme } from "../context/ThemeContext";

export default function PanelHeader({
  title,
  subtitle,
  right,
  onToggle,
  collapsed,
}: {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
  onToggle?: () => void;
  collapsed?: boolean;
}) {
  const { dark } = useTheme();

  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
        gap: 12,
        paddingBottom: collapsed ? 0 : 12,
        borderBottom: collapsed ? "none" : dark
          ? "1px solid rgba(255,255,255,0.08)"
          : "1px solid rgba(0,0,0,0.08)",
        marginBottom: collapsed ? 0 : 12,
        cursor: onToggle ? "pointer" : undefined,
        userSelect: onToggle ? "none" : undefined,
      }}
      onClick={onToggle}
    >
      <div>
        <div style={{ fontSize: 18, fontWeight: 800 }}>{title}</div>
        {subtitle && !collapsed && (
          <div style={{ marginTop: 4, fontSize: 12, color: dark ? "rgba(255,255,255,0.65)" : "rgba(0,0,0,0.55)" }}>
            {subtitle}
          </div>
        )}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }} onClick={e => e.stopPropagation()}>
        {right}
        {onToggle && (
          <span style={{
            fontSize: 32,
            opacity: 0.5,
            lineHeight: 1,
            display: "inline-block",
            transform: collapsed ? "rotate(-90deg)" : "rotate(0deg)",
            transition: "transform 0.2s ease",
          }}>
            ▾
          </span>
        )}
      </div>
    </div>
  );
}
