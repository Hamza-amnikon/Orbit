import React from "react";
import ReactDOM from "react-dom/client";
import axios from "axios";
import { BrowserRouter } from "react-router-dom";

import App from "./App";
import { ColorModeProvider } from "./context/ColorModeContext";
import { AuthProvider } from "./context/AuthContext";
import "./theme/dark-mode.css";

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
    // Only the authenticated profile endpoint validates the login session.
    // A 401 from another module can be endpoint-specific and must not log the
    // employee out of the whole application.
    const requestUrl = String(error.config?.url || "").toLowerCase();
    const isProfileValidation = /\/auth\/profile(?:\?|$)/.test(requestUrl);
    if (error.response?.status === 401 && isProfileValidation && localStorage.getItem("token")) {
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
      <ColorModeProvider>
        <AuthProvider>
          <App />
        </AuthProvider>
      </ColorModeProvider>
    </BrowserRouter>
  </React.StrictMode>
);

// Keep shared route, theme, and authentication providers at the app root.
