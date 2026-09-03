import "./styles/Login.css";

import LoginLeftPanel from "./components/LoginLeftPanel";
import LoginHeader from "./components/LoginHeader";
import LoginForm from "./components/LoginForm";
import AzureLoginButton from "./components/AzureLoginButton";

function Login() {

    return (

        <div className="login-page">

            <div className="login-container">

                {/* =================================================
                    LEFT PANEL
                ================================================= */}

                <LoginLeftPanel />


                {/* =================================================
                    RIGHT PANEL
                ================================================= */}

                <div className="login-right">

                    <LoginHeader />


                    {/* =================================================
                        EMAIL / PASSWORD FORM

                        This UI is kept for now.
                        The real authentication is Microsoft login.
                    ================================================= */}

                    <LoginForm
                        onLogin={() => {
                            console.log(
                                "Email/password authentication is not enabled yet."
                            );
                        }}
                        loading={false}
                    />


                    {/* =================================================
                        DIVIDER
                    ================================================= */}

                    <div className="divider">

                        <span>
                            OR
                        </span>

                    </div>


                    {/* =================================================
                        MICROSOFT LOGIN
                    ================================================= */}

                    <AzureLoginButton />

                </div>

            </div>

        </div>

    );

}

export default Login;