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
                    boxShadow: "0 5px 20px rgba(0,0,0,.05)",

                },

            },

        },

    },

});

export default theme;