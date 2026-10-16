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
                root: {
                    borderRadius: 10,
                    backgroundColor: colors.paper,
                    '&:has(input[placeholder*="Search"])': {
                        position: "relative",
                        minHeight: 46,
                        paddingLeft: 34,
                        paddingRight: 54,
                        transition: "border-color 160ms ease, box-shadow 160ms ease",
                        "&::before": {
                            content: '""',
                            position: "absolute",
                            zIndex: 1,
                            left: 14,
                            top: "50%",
                            width: 17,
                            height: 17,
                            transform: "translateY(-50%)",
                            backgroundColor: colors.textSecondary,
                            mask: 'url("data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 24 24%27 fill=%27none%27 stroke=%27black%27 stroke-width=%272%27 stroke-linecap=%27round%27 stroke-linejoin=%27round%27%3E%3Ccircle cx=%2711%27 cy=%2711%27 r=%277%27/%3E%3Cpath d=%27m20 20-4-4%27/%3E%3C/svg%3E") center / contain no-repeat',
                            pointerEvents: "none",
                        },
                        "&::after": {
                            content: '"Ctrl K"',
                            position: "absolute",
                            right: 9,
                            top: "50%",
                            transform: "translateY(-50%)",
                            padding: "3px 6px",
                            border: `1px solid ${colors.border}`,
                            borderRadius: 6,
                            color: colors.textSecondary,
                            backgroundColor: "#f8faff",
                            fontSize: 10,
                            fontWeight: 600,
                            lineHeight: 1.3,
                            pointerEvents: "none",
                        },
                        "& .MuiInputBase-input": {
                            padding: "11px 0",
                            outline: "none",
                            boxShadow: "none",
                        },
                        "& .MuiInputAdornment-positionStart": {
                            display: "none",
                        },
                        "&:hover .MuiOutlinedInput-notchedOutline": {
                            borderColor: "#b5c6e0",
                        },
                        "&.Mui-focused": {
                            boxShadow: "0 0 0 3px rgba(47, 102, 233, .12)",
                        },
                        "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                            borderWidth: 1,
                            borderColor: colors.primary,
                        },
                        "& .MuiOutlinedInput-input:focus": {
                            outline: "none",
                            boxShadow: "none",
                        },
                    },
                },
                notchedOutline: { borderColor: colors.border },
            },
        },
        MuiInputBase: {
            styleOverrides: {
                root: {
                    '&:has(input[placeholder*="Search"]):not(.MuiOutlinedInput-root)': {
                        position: "relative",
                        minHeight: 46,
                        paddingLeft: 34,
                        paddingRight: 54,
                        border: `1px solid ${colors.border}`,
                        borderRadius: 10,
                        backgroundColor: colors.paper,
                        transition: "border-color 160ms ease, box-shadow 160ms ease",
                        "&::before": {
                            content: '""',
                            position: "absolute",
                            left: 14,
                            top: "50%",
                            width: 17,
                            height: 17,
                            transform: "translateY(-50%)",
                            backgroundColor: colors.textSecondary,
                            mask: 'url("data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 24 24%27 fill=%27none%27 stroke=%27black%27 stroke-width=%272%27 stroke-linecap=%27round%27 stroke-linejoin=%27round%27%3E%3Ccircle cx=%2711%27 cy=%2711%27 r=%277%27/%3E%3Cpath d=%27m20 20-4-4%27/%3E%3C/svg%3E") center / contain no-repeat',
                            pointerEvents: "none",
                        },
                        "&::after": {
                            content: '"Ctrl K"',
                            position: "absolute",
                            right: 9,
                            top: "50%",
                            transform: "translateY(-50%)",
                            padding: "3px 6px",
                            border: `1px solid ${colors.border}`,
                            borderRadius: 6,
                            color: colors.textSecondary,
                            backgroundColor: "#f8faff",
                            fontSize: 10,
                            fontWeight: 600,
                            lineHeight: 1.3,
                            pointerEvents: "none",
                        },
                        "& .MuiInputBase-input": {
                            padding: "11px 0",
                            outline: "none",
                            boxShadow: "none",
                        },
                        "&:focus-within": {
                            borderColor: colors.primary,
                            boxShadow: "0 0 0 3px rgba(47, 102, 233, .12)",
                        },
                    },
                },
            },
        },
        MuiTextField: {
            defaultProps: { size: "small", variant: "outlined" },
        },
        MuiSelect: {
            defaultProps: { size: "small" },
        },
        MuiIconButton: {
            styleOverrides: {
                root: { borderRadius: 10 },
            },
        },
        MuiChip: {
            styleOverrides: {
                root: { borderRadius: 8, fontWeight: 600 },
            },
        },
        MuiAlert: {
            styleOverrides: {
                root: { borderRadius: 10 },
            },
        },
        MuiTooltip: {
            defaultProps: { arrow: true },
        },
        MuiPaper: {
            styleOverrides: {
                root: { backgroundImage: "none" },
            },
        },
        MuiTableRow: {
            styleOverrides: {
                root: {
                    "&:hover": { backgroundColor: "#f8fbff" },
                },
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
