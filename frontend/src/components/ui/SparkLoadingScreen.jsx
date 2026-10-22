import { Box, CircularProgress, Typography } from "@mui/material";

/** Branded, accessible loading state for auth and route checks. */
export default function SparkLoadingScreen({
    title = "Preparing your workspace",
    description = "We’re getting everything ready for you.",
}) {
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
                    aria-hidden="true"
                    sx={{
                        width: 56,
                        height: 56,
                        mb: 2.5,
                        display: "grid",
                        placeItems: "center",
                        borderRadius: 2.5,
                        color: "#fff",
                        fontSize: 24,
                        fontWeight: 800,
                        letterSpacing: "-.08em",
                        background: "linear-gradient(145deg, #2563eb, #7138d7)",
                        boxShadow: "0 8px 22px rgba(37, 99, 235, .28)",
                    }}
                >
                    S
                </Box>
                <Typography
                    component="div"
                    sx={{
                        mb: 2.5,
                        color: "#2563eb",
                        fontSize: 12,
                        fontWeight: 800,
                        letterSpacing: ".2em",
                    }}
                >
                    SPARK
                </Typography>
                <CircularProgress
                    size={32}
                    thickness={4.5}
                    aria-label={title}
                    sx={{ mb: 2.25, color: "#2563eb" }}
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
