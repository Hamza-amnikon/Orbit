import { createTheme } from "@mui/material/styles";
import colors from "./colors";
import typography from "./typography";

export default function createFinanceTheme(mode = "light") {
  const dark = mode === "dark";
  const border = dark ? "#334155" : "#e5eaf1";
  const secondaryText = dark ? "#a6b4c8" : colors.textSecondary;
  const surface = dark ? "#1e293b" : colors.paper;
  const control = dark ? "#172235" : colors.paper;
  const focus = dark ? "#82b1ff" : colors.primary;
  const hover = dark ? "#293b55" : "#eff6ff";

  return createTheme({
    palette: {
      mode,
      primary: { main: dark ? "#82b1ff" : colors.primary },
      secondary: { main: dark ? "#b5c7ff" : colors.secondary },
      background: { default: dark ? "#0f172a" : colors.background, paper: surface },
      text: { primary: dark ? "#e8eef7" : colors.textPrimary, secondary: secondaryText },
      success: { main: colors.success },
      warning: { main: colors.warning },
      error: { main: dark ? "#f87171" : colors.error },
      divider: border,
    },
    typography: {
      ...typography,
      fontFamily: "'Inter', 'Segoe UI', Arial, sans-serif",
      h4: { fontSize: "1.75rem", fontWeight: 700, lineHeight: 1.25, letterSpacing: "-0.035em" },
      button: { textTransform: "none", fontWeight: 600 },
    },
    shape: { borderRadius: 12 },
    components: {
      MuiButton: {
        defaultProps: { disableElevation: true },
        styleOverrides: {
          root: {
            textTransform: "none", borderRadius: 10, fontWeight: 600, minHeight: 40,
            paddingInline: 16,
            "&.MuiButton-contained.MuiButton-colorPrimary:not(.Mui-disabled)": {
              backgroundColor: colors.primary, color: "#ffffff",
              "&:hover": { backgroundColor: colors.secondary },
            },
            transition: "background-color 140ms ease, border-color 140ms ease, box-shadow 140ms ease",
          },
        },
      },
      MuiIconButton: {
        styleOverrides: { root: { borderRadius: 10, "&.Mui-focusVisible": { outline: `2px solid ${focus}`, outlineOffset: 2 } } },
      },
      MuiCard: {
        styleOverrides: { root: { borderRadius: 16, border: `1px solid ${border}`, boxShadow: "0 4px 17px rgba(15,23,42,.035)", backgroundImage: "none" } },
      },
      MuiCardContent: {
        styleOverrides: { root: { padding: 24, "&:last-child": { paddingBottom: 24 } } },
      },
      MuiDialog: { styleOverrides: { paper: { borderRadius: 18, backgroundImage: "none" } } },
      MuiDialogTitle: { styleOverrides: { root: { padding: "24px 24px 16px", fontSize: "1.25rem", fontWeight: 700 } } },
      MuiDialogContent: { styleOverrides: { root: { padding: 24 } } },
      MuiDialogActions: { styleOverrides: { root: { padding: "16px 24px", gap: 8, flexWrap: "wrap" } } },
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            borderRadius: 10, backgroundColor: control,
            "&:hover:not(.Mui-disabled):not(.Mui-error) .MuiOutlinedInput-notchedOutline": { borderColor: focus },
            "&.Mui-focused:not(.Mui-error) .MuiOutlinedInput-notchedOutline": { borderColor: focus },
            "&.Mui-disabled": { backgroundColor: dark ? "#202c3e" : "#f3f5f8" },
          },
          notchedOutline: { borderColor: border },
          input: { "&::placeholder": { color: secondaryText, opacity: 1 } },
        },
      },
      MuiInputLabel: { styleOverrides: { root: { color: secondaryText } } },
      MuiSelect: { styleOverrides: { icon: { color: secondaryText } } },
      MuiMenu: { styleOverrides: { paper: { backgroundColor: surface, backgroundImage: "none", border: `1px solid ${border}`, borderRadius: 12 } } },
      MuiMenuItem: { styleOverrides: { root: { minHeight: 40, "&:hover": { backgroundColor: hover } } } },
      MuiAutocomplete: { styleOverrides: { paper: { backgroundColor: surface, backgroundImage: "none", border: `1px solid ${border}`, borderRadius: 12 }, option: { minHeight: 40 } } },
      MuiTableCell: {
        styleOverrides: {
          head: { background: dark ? "#263449" : "#f8fafc", color: secondaryText, fontSize: 12, fontWeight: 700, whiteSpace: "nowrap" },
          root: { borderBottom: `1px solid ${border}`, padding: 16, verticalAlign: "middle" },
        },
      },
      MuiAlert: { styleOverrides: { root: { borderRadius: 12, alignItems: "center" }, message: { overflowWrap: "anywhere" } } },
    },
  });
}
