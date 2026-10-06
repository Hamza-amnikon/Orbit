import { createTheme } from "@mui/material/styles";
import colors from "./colors";
import typography from "./typography";

export default createTheme({
  palette: {
    primary: { main: colors.primary }, secondary: { main: colors.secondary },
    background: { default: colors.background, paper: colors.paper },
    text: { primary: colors.textPrimary, secondary: colors.textSecondary },
    success: { main: colors.success }, warning: { main: colors.warning },
    error: { main: colors.error }, divider: colors.border,
  },
  typography: { ...typography, fontFamily: "'Inter', 'Segoe UI', Arial, sans-serif" },
  shape: { borderRadius: 12 },
  components: {
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: { root: { textTransform: "none", borderRadius: 10, fontWeight: 600, minHeight: 40 } },
    },
    MuiCard: { styleOverrides: { root: {
      borderRadius: 16, border: "1px solid #e5eaf1", boxShadow: "0 4px 17px rgba(15,23,42,.035)",
    } } },
    MuiDialog: { styleOverrides: { paper: { borderRadius: 18 } } },
    MuiOutlinedInput: { styleOverrides: { root: { borderRadius: 10 } } },
    MuiTableCell: { styleOverrides: {
      head: { background: "#f8fafc", color: colors.textSecondary, fontSize: 12, fontWeight: 700 },
      root: { borderBottom: "1px solid #edf0f4", padding: "16px" },
    } },
  },
});
