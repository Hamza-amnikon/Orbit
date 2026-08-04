import { useState } from "react";

import "./styles/Login.css";

import LoginLeftPanel from "./components/LoginLeftPanel";
import LoginHeader from "./components/LoginHeader";
import LoginForm from "./components/LoginForm";
import AzureLoginButton from "./components/AzureLoginButton";
import LoginLoader from "./components/LoginLoader";

function Login() {

    const [loading, setLoading] = useState(false);

    const handleLogin = async (credentials) => {

        setLoading(true);

        try {

            // Temporary API simulation
            console.log("Login Request:", credentials);

            await new Promise((resolve) => setTimeout(resolve, 2000));

            console.log("Login Successful");

            // Later:
            // const response = await authService.login(credentials);
            // navigate("/dashboard");

        }
        catch (error) {

            console.error(error);

        }
        finally {

            setLoading(false);

        }

    };

    return (

        <div className="login-page">

            <div className="login-container">

                {/* Left Panel */}

                <LoginLeftPanel />

                {/* Right Panel */}

                <div className="login-right">

                    <LoginHeader />

                    <LoginForm
                        onLogin={handleLogin}
                        loading={loading}
                    />

                    <div className="divider">
                        <span>OR</span>
                    </div>

                    <AzureLoginButton />

                </div>

            </div>

            {/* Loading Overlay */}

            <LoginLoader open={loading} />

        </div>

    );

}

export default Login;