import { createTheme } from "@mui/material/styles";

const theme = createTheme({
    palette: {
        primary: {
            main: "#0B2A43",
        },

        secondary: {
            main: "#1976D2",
        },

        background: {
            default: "#F4F7FA",
            paper: "#FFFFFF",
        },

        text: {
            primary: "#102A43",
            secondary: "#627D98",
        },

        divider: "#D9E2EC",
    },

    typography: {
        fontFamily: "Arial, Helvetica, sans-serif",

        h1: {
            fontWeight: 700,
        },

        h2: {
            fontWeight: 700,
        },

        h3: {
            fontWeight: 700,
        },

        h4: {
            fontWeight: 700,
        },

        h5: {
            fontWeight: 700,
        },

        h6: {
            fontWeight: 700,
        },

        button: {
            textTransform: "none",
            fontWeight: 600,
        },
    },

    shape: {
        borderRadius: 8,
    },

    components: {
        MuiCard: {
            styleOverrides: {
                root: {
                    borderRadius: 8,
                    boxShadow: "0 1px 3px rgba(16, 42, 67, 0.08)",
                },
            },
        },

        MuiButton: {
            defaultProps: {
                disableElevation: true,
            },
        },
    },
});

export default theme;