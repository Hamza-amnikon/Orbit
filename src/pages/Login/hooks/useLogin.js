import { useState } from "react";
import { useNavigate } from "react-router-dom";

import {
    login,
    loginWithMicrosoft
} from "../services/authService";

function useLogin() {

    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);

    const [error, setError] = useState("");

    const handleLogin = async ({
        email,
        password,
        rememberMe
    }) => {

        setLoading(true);

        setError("");

        try {

            const response = await login(
                email,
                password,
                rememberMe
            );

            console.log(response);

            // Temporary
            // JWT storage will be added later

            navigate("/dashboard");

        }
        catch (err) {

            console.error(err);

            if (err.response) {

                setError(
                    err.response.data.message ||
                    "Login failed."
                );

            }
            else {

                setError(
                    "Unable to connect to the server."
                );

            }

        }
        finally {

            setLoading(false);

        }

    };

    const handleMicrosoftLogin = () => {

        loginWithMicrosoft();

    };

    return {

        loading,

        error,

        handleLogin,

        handleMicrosoftLogin

    };

}

export default useLogin;