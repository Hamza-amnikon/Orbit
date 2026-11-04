import { Component } from "react";
import { Alert, Box, Button, Typography } from "@mui/material";

export default class RouteErrorBoundary extends Component {
  state = { hasError: false };

  componentDidCatch(error) {
    const message = String(error?.message || error || "");
    if (!/failed to fetch dynamically imported module|importing a module script failed|error loading dynamically imported module/i.test(message)) {
      return;
    }

    // A deployment may remove a chunk referenced by an already open tab.
    // Reload once to get the new index and chunk names, avoiding a reload loop
    // if the server is genuinely unavailable.
    const key = "spark:route-chunk-reload-at";
    try {
      const lastReload = Number(sessionStorage.getItem(key) || 0);
      if (Date.now() - lastReload > 60_000) {
        sessionStorage.setItem(key, String(Date.now()));
        window.location.reload();
      }
    } catch {
      // Keep the manual reload action available when storage is blocked.
    }
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return (
      <Box
        component="main"
        sx={{
          alignItems: "center",
          display: "flex",
          flexDirection: "column",
          gap: 2,
          justifyContent: "center",
          minHeight: "50vh",
          p: 3,
          textAlign: "center",
        }}
      >
        <Alert severity="error" role="alert">
          <Typography component="h2" variant="h6">
            This page couldn’t be loaded
          </Typography>
          <Typography variant="body2">
            Please try again. If the app was just updated, reload to get the latest version.
          </Typography>
        </Alert>
        <Button variant="contained" onClick={() => window.location.reload()}>
          Reload page
        </Button>
      </Box>
    );
  }
}
