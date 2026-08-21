import type React from "react";

export function getStyles(dark: boolean, isMobile = false) {
  const border = dark
    ? "1px solid rgba(4,245,255,0.18)"
    : "1px solid rgba(56,0,60,0.12)";
  const rowBorder = dark
    ? "1px solid rgba(255,255,255,0.06)"
    : "1px solid rgba(0,0,0,0.06)";

  return {
    page: {
      minHeight: "100vh",
      background: dark
        ? "radial-gradient(1000px 620px at 50% -10%, rgba(233,0,82,0.34), transparent 62%), radial-gradient(760px 460px at 8% 18%, rgba(4,245,255,0.12), transparent 66%), #38003c"
        : "radial-gradient(1000px 620px at 50% -10%, rgba(233,0,82,0.15), transparent 62%), radial-gradient(700px 440px at 8% 18%, rgba(4,245,255,0.22), transparent 66%), #ffffff",
      color: dark ? "#fff" : "#38003c",
      fontFamily:
        'Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Arial',
      padding: isMobile ? "16px 12px" : "28px 18px",
    } as React.CSSProperties,

    board: {
      maxWidth: 1280,
      margin: "0 auto",
    } as React.CSSProperties,

    topbar: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 16,
      padding: "0 4px 20px",
    } as React.CSSProperties,

    title: {
      fontSize: 24,
      fontWeight: 900,
      letterSpacing: 0.2,
      color: dark ? "#04f5ff" : "#38003c",
    } as React.CSSProperties,

    linkish: {
      display: "inline-flex",
      alignItems: "center",
      gap: 8,
      cursor: "pointer",
      color: dark ? "#04f5ff" : "#e90052",
      fontSize: 13,
      fontWeight: 700,
      userSelect: "none",
    } as React.CSSProperties,

    button: {
      display: "inline-flex",
      alignItems: "center",
      gap: 10,
      background: "#e90052",
      color: "#ffffff",
      border: "none",
      borderRadius: 14,
      padding: "10px 14px",
      fontWeight: 900,
      cursor: "pointer",
      boxShadow: "0 12px 30px rgba(233,0,82,0.32)",
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
      gridTemplateColumns: isMobile ? "1fr" : "5fr 2.4fr 5fr",
      gap: isMobile ? 12 : 16,
      alignItems: "start",
    } as React.CSSProperties,

    panel: {
      borderRadius: isMobile ? 16 : 22,
      padding: isMobile ? 12 : 16,
      background: dark ? "rgba(56,0,60,0.78)" : "rgba(255,255,255,0.94)",
      border,
      boxShadow: dark
        ? "0 18px 55px rgba(0,0,0,0.45)"
        : "0 4px 24px rgba(0,0,0,0.08)",
      backdropFilter: "blur(10px)",
    } as React.CSSProperties,

    listWrap: {
      maxHeight: isMobile ? "55vh" : 560,
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
