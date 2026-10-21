import { Component } from "react";
import { Alert, Box, Button, Typography } from "@mui/material";

export default class RouteErrorBoundary extends Component {
  state = { hasError: false };

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
