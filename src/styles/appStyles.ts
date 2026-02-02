export const styles = {
  page: {
    minHeight: "100vh",
    background:
      "radial-gradient(1200px 600px at 50% -10%, rgba(120,170,255,0.16), transparent 60%), #0b0d10",
    color: "#fff",
    fontFamily:
      'Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Arial',
    padding: "28px 18px",
  } as React.CSSProperties,

  board: {
    maxWidth: 1280,
    margin: "0 auto",
    borderRadius: 28,
    padding: 18,
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.08)",
    boxShadow: "0 30px 80px rgba(0,0,0,0.55)",
  } as React.CSSProperties,

  topbar: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16,
    padding: "10px 8px 18px",
  } as React.CSSProperties,

  title: {
    fontSize: 24,
    fontWeight: 900,
    letterSpacing: 0.2,
  } as React.CSSProperties,

  linkish: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    cursor: "pointer",
    color: "rgba(255,255,255,0.75)",
    fontSize: 13,
    fontWeight: 700,
    userSelect: "none",
  } as React.CSSProperties,

  button: {
    display: "inline-flex",
    alignItems: "center",
    gap: 10,
    background: "rgba(120,170,255,0.95)",
    color: "#0b0d10",
    border: "none",
    borderRadius: 14,
    padding: "10px 14px",
    fontWeight: 900,
    cursor: "pointer",
    boxShadow: "0 12px 30px rgba(120,170,255,0.20)",
  } as React.CSSProperties,

  grid: {
    display: "grid",
    gridTemplateColumns: "5fr 2.4fr 5fr",
    gap: 16,
    alignItems: "start",
  } as React.CSSProperties,

  panel: {
    borderRadius: 22,
    padding: 16,
    background: "rgba(10,12,16,0.60)",
    border: "1px solid rgba(255,255,255,0.08)",
    boxShadow: "0 18px 55px rgba(0,0,0,0.45)",
    backdropFilter: "blur(10px)",
  } as React.CSSProperties,

  listWrap: {
    maxHeight: 560,
    overflow: "auto",
    borderRadius: 18,
    border: "1px solid rgba(255,255,255,0.08)",
    background: "rgba(255,255,255,0.02)",
  } as React.CSSProperties,

  row: {
    display: "grid",
    gridTemplateColumns: "44px 30px 1fr",
    alignItems: "center",
    gap: 10,
    padding: "10px 12px",
    borderBottom: "1px solid rgba(255,255,255,0.06)",
    fontSize: 14,
  } as React.CSSProperties,

  dragRow: {
    display: "grid",
    gridTemplateColumns: "44px 24px 30px 1fr",
    alignItems: "center",
    gap: 10,
    padding: "10px 12px",
    borderBottom: "1px solid rgba(255,255,255,0.06)",
    fontSize: 14,
  } as React.CSSProperties,

  pos: {
    height: 26,
    width: 26,
    borderRadius: 10,
    display: "grid",
    placeItems: "center",
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.08)",
    fontWeight: 900,
    fontSize: 12,
  } as React.CSSProperties,

  clubName: {
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    fontWeight: 750,
  } as React.CSSProperties,

  pill: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    padding: "8px 10px",
    borderRadius: 999,
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.08)",
    fontVariantNumeric: "tabular-nums",
    fontSize: 12,
    fontWeight: 800,
    color: "rgba(255,255,255,0.78)",
  } as React.CSSProperties,

  footer: {
    marginTop: 12,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    paddingTop: 12,
    borderTop: "1px solid rgba(255,255,255,0.08)",
    color: "rgba(255,255,255,0.72)",
    fontSize: 12,
    fontWeight: 700,
  } as React.CSSProperties,
};
