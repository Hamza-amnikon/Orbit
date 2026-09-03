import axios from "axios";

const api = axios.create({
  baseURL: "https://localhost:7278/api",
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
    if (error.response?.status === 401) {
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
