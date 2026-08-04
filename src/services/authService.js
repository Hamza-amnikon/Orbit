import api from "./api";

const authService = {

    login() {
        window.location.href = "https://localhost:7278/api/auth/login";
    },

    logout() {
        localStorage.removeItem("token");
        window.location.href = "/login";
    }

};

export default authService;