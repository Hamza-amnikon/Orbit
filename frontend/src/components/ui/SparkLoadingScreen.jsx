import { Box, Typography } from "@mui/material";
import darkLogo from "../../assets/logo/spark-logo-sidebar.png";
import lightLogo from "../../assets/logo/spark-logo-sidebar-light.png";
import { useColorMode } from "../../context/ColorModeContext";

/** Branded, accessible loading state for auth and route checks. */
export default function SparkLoadingScreen({
    title = "Preparing your workspace",
    description = "We’re getting everything ready for you.",
}) {
    const { mode } = useColorMode();

    return (
        <Box
            role="status"
            aria-live="polite"
            sx={{
                minHeight: "100vh",
                width: "100%",
                display: "grid",
                placeItems: "center",
                boxSizing: "border-box",
                px: 2.5,
                py: 5,
                color: "var(--spark-text, #111b4b)",
                background:
                    "radial-gradient(ellipse at 50% 38%, rgba(37, 99, 235, .12), transparent 42%), var(--spark-page, #f4f7fc)",
            }}
        >
            <Box
                sx={{
                    width: "min(100%, 390px)",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    textAlign: "center",
                    p: { xs: 3.5, sm: 5 },
                    border: "1px solid var(--spark-border, #e2e9f2)",
                    borderRadius: 4,
                    backgroundColor: "var(--spark-surface-raised, #fff)",
                    boxShadow: "0 22px 60px rgba(20, 45, 90, .12)",
                }}
            >
                <Box
                    component="img"
                    src={mode === "dark" ? darkLogo : lightLogo}
                    alt="SPARK"
                    sx={{
                        width: { xs: 112, sm: 136 },
                        height: 90,
                        objectFit: "contain",
                        mb: 2.25,
                        "@keyframes spark-logo-pulse": {
                            "0%, 100%": { opacity: 1 },
                            "50%": { opacity: 0.62 },
                        },
                        "@media (prefers-reduced-motion: no-preference)": {
                            animation: "spark-logo-pulse 1.8s ease-in-out infinite",
                        },
                    }}
                />
                <Typography
                    component="h1"
                    sx={{ fontSize: 18, lineHeight: 1.35, fontWeight: 700 }}
                >
                    {title}
                </Typography>
                <Typography
                    component="p"
                    sx={{ mt: 0.75, mb: 0, color: "var(--spark-muted, #5b77a1)", fontSize: 14, lineHeight: 1.6 }}
                >
                    {description}
                </Typography>
            </Box>
        </Box>
    );
}
