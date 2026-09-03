import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../../../context/AuthContext";

function useLogin() {
  const navigate = useNavigate();

  const { login, loading: authLoading, isAuthenticated } = useAuth();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  /*
    =========================================================
    NORMAL LOGIN
    =========================================================
    */

  const handleLogin = async ({ email, password, rememberMe }) => {
    setLoading(true);
    setError("");

    try {
      /*
       * At the moment AuthContext.login()
       * starts the configured authentication flow.
       */

      await login({
        email,
        password,
        rememberMe,
      });

      /*
       * Do not manually create a token here.
       *
       * AuthenticationContext is responsible for
       * maintaining authentication state.
       */

      console.log("Login authentication completed.");

      navigate("/");
    } catch (err) {
      console.error("Login Error:", err);

      if (err?.response) {
        setError(
          err.response?.data?.message ||
            err.response?.data?.Message ||
            "Login failed.",
        );
      } else if (err?.message) {
        setError(err.message);
      } else {
        setError("Unable to connect to the server.");
      }
    } finally {
      setLoading(false);
    }
  };

  /*
    =========================================================
    MICROSOFT LOGIN
    =========================================================
    */

  const handleMicrosoftLogin = () => {
    setError("");

    /*
     * AuthContext.login() is currently the central
     * authentication entry point.
     */

    login();
  };

  return {
    loading: loading || authLoading,

    error,

    isAuthenticated,

    handleLogin,

    handleMicrosoftLogin,
  };
}

export default useLogin;
