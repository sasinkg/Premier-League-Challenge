import { useTheme } from "../context/ThemeContext";

export default function PanelHeader({
  title,
  subtitle,
  right,
}: {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
}) {
  const { dark } = useTheme();

  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
        gap: 12,
        paddingBottom: 12,
        borderBottom: dark
          ? "1px solid rgba(255,255,255,0.08)"
          : "1px solid rgba(0,0,0,0.08)",
        marginBottom: 12,
      }}
    >
      <div>
        <div style={{ fontSize: 18, fontWeight: 800 }}>{title}</div>
        {subtitle && (
          <div
            style={{
              marginTop: 4,
              fontSize: 12,
              color: dark ? "rgba(255,255,255,0.65)" : "rgba(0,0,0,0.55)",
            }}
          >
            {subtitle}
          </div>
        )}
      </div>
      {right}
    </div>
  );
}
