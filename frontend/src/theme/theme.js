import { createTheme } from "@mui/material/styles";
import colors from "./colors";
import typography from "./typography";

const theme = createTheme({

    palette: {

        primary: {
            main: colors.primary,
        },

        secondary: {
            main: colors.secondary,
        },

        background: {
            default: colors.background,
            paper: colors.paper,
        },

        success: {
            main: colors.success,
        },

        warning: {
            main: colors.warning,
        },

        error: {
            main: colors.error,
        },

        text: {
            primary: colors.textPrimary,
            secondary: colors.textSecondary,
        },
    },

    typography,

    shape: {
        borderRadius: 12,
    },

    components: {

        MuiButton: {

            styleOverrides: {

                root: {
                    textTransform: "none",
                    borderRadius: 10,
                    fontWeight: 600,
                },

            },

        },

        MuiCard: {

            styleOverrides: {

                root: {

                    borderRadius: 16,
                    border: `1px solid ${colors.border}`,
                    boxShadow: "0 3px 12px rgba(30,64,175,.035)",

                },

            },

        },

        MuiOutlinedInput: {
            styleOverrides: {
                root: { borderRadius: 10, backgroundColor: colors.paper },
                notchedOutline: { borderColor: colors.border },
            },
        },
        MuiDialog: {
            styleOverrides: {
                paper: { borderRadius: 16, border: `1px solid ${colors.border}` },
            },
        },
        MuiDialogTitle: {
            styleOverrides: {
                root: { fontWeight: 700, color: colors.textPrimary, borderBottom: `1px solid ${colors.border}` },
            },
        },
        MuiDialogActions: {
            styleOverrides: { root: { padding: "16px 24px", gap: 8 } },
        },
        MuiTableCell: {
            styleOverrides: {
                head: { backgroundColor: "#f0f5fc", color: "#4d6f9f", fontWeight: 600, fontSize: 13 },
                root: { borderColor: colors.border },
            },
        },

    },

});

export default theme;
