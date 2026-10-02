const authService = {
  login() {
    const frontendUrl = window.location.origin;

    window.location.href =
  `${import.meta.env.VITE_AUTH_API_BASE_URL}/api/auth/login?frontend=${encodeURIComponent(
    frontendUrl,
  )}`;
  },

  logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("role");

    window.location.href = "/login";
  },
};

export default authService;
