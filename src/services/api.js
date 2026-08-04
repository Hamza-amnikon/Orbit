import axios from "axios";

const api = axios.create({
    baseURL: "https://localhost:7278/api",
    headers: {
        "Content-Type": "application/json"
    }
});

// ===============================
// Request Interceptor
// ===============================
api.interceptors.request.use((config) => {

    const token = localStorage.getItem("token");

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});

// ===============================
// Response Interceptor
// ===============================
api.interceptors.response.use(

    (response) => response,

    (error) => {

        if (error.response?.status === 401) {

            // Remove expired token
            localStorage.removeItem("token");

            // Redirect to login
            window.location.href = "/login";

            return;
        }

        return Promise.reject(error);
    }

);

export default api;