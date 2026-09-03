import React from "react";
import ReactDOM from "react-dom/client";
import axios from "axios";
import { BrowserRouter } from "react-router-dom";

import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";

import App from "./App";
import theme from "./theme/theme";

import { AuthProvider } from "./context/AuthContext";

// ============================================================================
// GLOBAL AUTHENTICATION LAYER
// ============================================================================
// The HRMS currently grants all authenticated users full module access.
// Every API request must nevertheless carry the JWT belonging to the logged-in
// employee. Centralising this here prevents individual pages from accidentally
// forgetting the Authorization header.
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers = config.headers || {};
      if (!config.headers.Authorization) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error),
);

axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && localStorage.getItem("token")) {
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      if (window.location.pathname !== "/login" && window.location.pathname !== "/auth/callback") {
        window.location.replace("/login");
      }
    }
    return Promise.reject(error);
  },
);

// Native fetch is used by several legacy HRMS modules. Attach the same JWT
// automatically while preserving any explicit Authorization header.
const originalFetch = window.fetch.bind(window);
window.fetch = (input, init = {}) => {
  const token = localStorage.getItem("token");
  if (!token) return originalFetch(input, init);

  const headers = new Headers(init.headers || (input instanceof Request ? input.headers : undefined));
  if (!headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  return originalFetch(input, { ...init, headers });
};

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider theme={theme}>
        <CssBaseline />

        <AuthProvider>
          <App />
        </AuthProvider>

      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>
);