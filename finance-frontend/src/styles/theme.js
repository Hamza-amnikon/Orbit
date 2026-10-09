import { createTheme } from "@mui/material/styles";
import colors from "./colors";
import typography from "./typography";

export default function createFinanceTheme(mode = "light") {
  const dark = mode === "dark";
  const border = dark ? "#334155" : "#e5eaf1";
  const secondaryText = dark ? "#a6b4c8" : colors.textSecondary;
  return createTheme({
  palette: {
    mode,
    primary: { main: dark ? "#82b1ff" : colors.primary }, secondary: { main: dark ? "#b5c7ff" : colors.secondary },
    background: { default: dark ? "#0f172a" : colors.background, paper: dark ? "#1e293b" : colors.paper },
    text: { primary: dark ? "#e8eef7" : colors.textPrimary, secondary: secondaryText },
    success: { main: colors.success }, warning: { main: colors.warning },
    error: { main: dark ? "#f87171" : colors.error }, divider: border,
  },
  typography: { ...typography, fontFamily: "'Inter', 'Segoe UI', Arial, sans-serif" },
  shape: { borderRadius: 12 },
  components: {
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: { root: { textTransform: "none", borderRadius: 10, fontWeight: 600, minHeight: 40 } },
    },
    MuiCard: { styleOverrides: { root: {
      borderRadius: 16, border: `1px solid ${border}`, boxShadow: "0 4px 17px rgba(15,23,42,.035)", backgroundImage: "none",
    } } },
    MuiDialog: { styleOverrides: { paper: { borderRadius: 18 } } },
    MuiOutlinedInput: { styleOverrides: { root: { borderRadius: 10 } } },
    MuiTableCell: { styleOverrides: {
      head: { background: dark ? "#263449" : "#f8fafc", color: secondaryText, fontSize: 12, fontWeight: 700 },
      root: { borderBottom: `1px solid ${border}`, padding: "16px" },
    } },
  },
  });
}
