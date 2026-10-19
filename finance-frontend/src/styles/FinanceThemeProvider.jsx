import { useEffect, useMemo, useState } from "react";
import { CssBaseline } from "@mui/material";
import { ThemeProvider } from "@mui/material/styles";
import createFinanceTheme from "./theme";
import { ColorModeContext } from "./ColorModeContext";

const preferenceKey = "sparkfinance.colorMode";
function initialMode() {
  try { const saved = localStorage.getItem(preferenceKey); if (saved === "light" || saved === "dark") return saved; }
  catch { /* The toggle still works when browser storage is unavailable. */ }
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export default function FinanceThemeProvider({ children }) {
  const [mode, setMode] = useState(initialMode);
  const theme = useMemo(() => createFinanceTheme(mode), [mode]);
  useEffect(() => {
    document.documentElement.dataset.theme = mode;
    try { localStorage.setItem(preferenceKey, mode); } catch { /* Keep the in-memory preference. */ }
  }, [mode]);
  useEffect(() => {
    function sync(event) { if (event.key === preferenceKey && ["light", "dark"].includes(event.newValue)) setMode(event.newValue); }
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, []);
  const context = useMemo(() => ({ mode, toggleMode: () => setMode(value => value === "light" ? "dark" : "light") }), [mode]);
  return <ColorModeContext.Provider value={context}><ThemeProvider theme={theme}><CssBaseline />{children}</ThemeProvider></ColorModeContext.Provider>;
}
