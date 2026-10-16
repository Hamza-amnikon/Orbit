import "./styles/Login.css";

import LoginLeftPanel from "./components/LoginLeftPanel";
import LoginHeader from "./components/LoginHeader";
import LoginForm from "./components/LoginForm";
import AzureLoginButton from "./components/AzureLoginButton";
import { Box as MuiLayoutBox, Typography as MuiText } from "@mui/material";

function Login() {

    return (

        <MuiLayoutBox className="login-page" component="div">

            <MuiLayoutBox className="login-container" component="div">

                {/* =================================================
                    LEFT PANEL
                ================================================= */}

                <LoginLeftPanel />


                {/* =================================================
                    RIGHT PANEL
                ================================================= */}

                <MuiLayoutBox className="login-right" component="div">

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

                    <MuiLayoutBox className="divider" component="div">

                        <MuiText component="span" variant="inherit">
                            OR
                        </MuiText>

                    </MuiLayoutBox>


                    {/* =================================================
                        MICROSOFT LOGIN
                    ================================================= */}

                    <AzureLoginButton />

                </MuiLayoutBox>

            </MuiLayoutBox>

        </MuiLayoutBox>

    );

}

export default Login;