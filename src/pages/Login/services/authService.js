import axios from "axios";

const API_URL = "https://localhost:5200/api/auth";

const api = axios.create({
    baseURL: API_URL,
    withCredentials: true,
    headers: {
        "Content-Type": "application/json",
    },
});

// ================================
// Login
// ================================

export const login = async (email, password, rememberMe) => {

    const response = await api.post("/login", {
        email,
        password,
        rememberMe,
    });

    return response.data;

};

// ================================
// Microsoft Login
// ================================

export const loginWithMicrosoft = () => {

    window.location.href =
        `${API_URL}/microsoft-login`;

};

// ================================
// Current User
// ================================

export const getCurrentUser = async () => {

    const response = await api.get("/me");

    return response.data;

};

// ================================
// Refresh Token
// ================================

export const refreshToken = async () => {

    const response = await api.post("/refresh");

    return response.data;

};

// ================================
// Logout
// ================================

export const logout = async () => {

    await api.post("/logout");

};

export default api;