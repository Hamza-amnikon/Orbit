import axios from "axios";

const api = axios.create({
  baseURL: `${import.meta.env.VITE_AUTH_API_BASE_URL}/api`,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const requestUrl = String(error.config?.url || "").toLowerCase();
    if (error.response?.status === 401 && /\/auth\/profile(?:\?|$)/.test(requestUrl)) {
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      if (window.location.pathname !== "/login" && window.location.pathname !== "/auth/callback") {
        window.location.replace("/login");
      }
    }
    return Promise.reject(error);
  },
);

export default api;
