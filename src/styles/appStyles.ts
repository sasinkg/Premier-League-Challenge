import type React from "react";

export function getStyles(dark: boolean) {
  const border = dark
    ? "1px solid rgba(255,255,255,0.08)"
    : "1px solid rgba(0,0,0,0.08)";
  const rowBorder = dark
    ? "1px solid rgba(255,255,255,0.06)"
    : "1px solid rgba(0,0,0,0.06)";

  return {
    page: {
      minHeight: "100vh",
      background: dark
        ? "radial-gradient(1200px 600px at 50% -10%, rgba(120,170,255,0.16), transparent 60%), #0b0d10"
        : "radial-gradient(1200px 600px at 50% -10%, rgba(120,170,255,0.10), transparent 60%), #e8ecf4",
      color: dark ? "#fff" : "#0b0d10",
      fontFamily:
        'Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Arial',
      padding: "28px 18px",
    } as React.CSSProperties,

    board: {
      maxWidth: 1280,
      margin: "0 auto",
      borderRadius: 28,
      padding: 18,
      background: dark ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.85)",
      border,
      boxShadow: dark
        ? "0 30px 80px rgba(0,0,0,0.55)"
        : "0 8px 40px rgba(0,0,0,0.10)",
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
      color: dark ? "rgba(255,255,255,0.75)" : "rgba(0,0,0,0.60)",
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

    themeToggle: {
      display: "inline-flex",
      alignItems: "center",
      gap: 6,
      background: dark ? "rgba(255,255,255,0.10)" : "rgba(0,0,0,0.08)",
      color: dark ? "rgba(255,255,255,0.80)" : "rgba(0,0,0,0.70)",
      border: dark
        ? "1px solid rgba(255,255,255,0.12)"
        : "1px solid rgba(0,0,0,0.12)",
      borderRadius: 14,
      padding: "10px 14px",
      fontWeight: 700,
      fontSize: 13,
      cursor: "pointer",
      boxShadow: "none",
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
      background: dark ? "rgba(10,12,16,0.60)" : "rgba(255,255,255,0.92)",
      border,
      boxShadow: dark
        ? "0 18px 55px rgba(0,0,0,0.45)"
        : "0 4px 24px rgba(0,0,0,0.08)",
      backdropFilter: "blur(10px)",
    } as React.CSSProperties,

    listWrap: {
      maxHeight: 560,
      overflow: "auto",
      borderRadius: 18,
      border,
      background: dark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.01)",
    } as React.CSSProperties,

    row: {
      display: "grid",
      gridTemplateColumns: "44px 30px 1fr",
      alignItems: "center",
      gap: 10,
      padding: "10px 12px",
      borderBottom: rowBorder,
      fontSize: 14,
    } as React.CSSProperties,

    dragRow: {
      display: "grid",
      gridTemplateColumns: "44px 24px 30px 1fr",
      alignItems: "center",
      gap: 10,
      padding: "10px 12px",
      borderBottom: rowBorder,
      fontSize: 14,
    } as React.CSSProperties,

    pos: {
      height: 26,
      width: 26,
      borderRadius: 10,
      display: "grid",
      placeItems: "center",
      background: dark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)",
      border: dark
        ? "1px solid rgba(255,255,255,0.08)"
        : "1px solid rgba(0,0,0,0.10)",
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
      background: dark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.06)",
      border: dark
        ? "1px solid rgba(255,255,255,0.08)"
        : "1px solid rgba(0,0,0,0.10)",
      fontVariantNumeric: "tabular-nums",
      fontSize: 12,
      fontWeight: 800,
      color: dark ? "rgba(255,255,255,0.78)" : "rgba(0,0,0,0.70)",
    } as React.CSSProperties,

    footer: {
      marginTop: 12,
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 12,
      paddingTop: 12,
      borderTop: dark
        ? "1px solid rgba(255,255,255,0.08)"
        : "1px solid rgba(0,0,0,0.08)",
      color: dark ? "rgba(255,255,255,0.72)" : "rgba(0,0,0,0.60)",
      fontSize: 12,
      fontWeight: 700,
    } as React.CSSProperties,
  };
}
