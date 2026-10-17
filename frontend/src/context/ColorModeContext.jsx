import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { CssBaseline, ThemeProvider } from "@mui/material";
import createAppTheme from "../theme/theme";

const ColorModeContext = createContext(null);
const STORAGE_KEY = "spark-color-mode";

function readSavedMode() {
    try {
        return localStorage.getItem(STORAGE_KEY) === "dark" ? "dark" : "light";
    } catch {
        return "light";
    }
}

export function ColorModeProvider({ children }) {
    const [mode, setMode] = useState(readSavedMode);

    useEffect(() => {
        document.documentElement.dataset.colorMode = mode;
        try {
            localStorage.setItem(STORAGE_KEY, mode);
        } catch {
            // The selected mode still applies for this session if storage is unavailable.
        }
    }, [mode]);

    const toggleColorMode = useCallback(() => {
        setMode((current) => current === "dark" ? "light" : "dark");
    }, []);

    const theme = useMemo(() => createAppTheme(mode), [mode]);
    const contextValue = useMemo(() => ({ mode, toggleColorMode }), [mode, toggleColorMode]);

    return (
        <ColorModeContext.Provider value={contextValue}>
            <ThemeProvider theme={theme}>
                <CssBaseline />
                {children}
            </ThemeProvider>
        </ColorModeContext.Provider>
    );
}

export function useColorMode() {
    const context = useContext(ColorModeContext);
    if (!context) {
        throw new Error("useColorMode must be used within ColorModeProvider");
    }
    return context;
}
