const authService = {

    login() {
        const frontendUrl = window.location.origin;

        window.location.href =
            `https://localhost:7278/api/auth/login?frontend=${encodeURIComponent(frontendUrl)}`;
    },

    logout() {
        localStorage.removeItem("token");
        window.location.href = "/login";
    }

};

export default authService;