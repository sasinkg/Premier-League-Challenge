import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";

type ThemeCtx = { dark: boolean; toggleTheme: () => void };

const ThemeContext = createContext<ThemeCtx>({ dark: true, toggleTheme: () => {} });

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [dark, setDark] = useState(() => {
    const saved = localStorage.getItem("plc_theme");
    return saved !== null ? saved === "dark" : true;
  });

  function toggleTheme() {
    setDark((d) => {
      const next = !d;
      localStorage.setItem("plc_theme", next ? "dark" : "light");
      return next;
    });
  }

  return (
    <ThemeContext.Provider value={{ dark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
