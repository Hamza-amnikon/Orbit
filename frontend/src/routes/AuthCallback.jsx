import { MuiButtonMigration } from "../components/ui/MuiCompat.jsx";
import SparkLoadingScreen from "../components/ui/SparkLoadingScreen.jsx";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import { Box as MuiLayoutBox, Typography as MuiText } from "@mui/material";

function AuthCallback() {

    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const { completeLogin } = useAuth();

    const [error, setError] = useState("");

    const token = searchParams.get("token");


    useEffect(() => {

        let cancelled = false;


        const authenticate = async () => {

            try {

                console.log(
                    "AuthCallback: Token received:",
                    !!token
                );


                if (!token) {

                    throw new Error(
                        "Authentication token was not returned by the server."
                    );

                }


                console.log(
                    "AuthCallback: Completing authentication..."
                );


                /*
                =================================================
                SAVE TOKEN + LOAD EMPLOYEE PROFILE
                =================================================
                */

                await completeLogin(token);


                if (cancelled) {
                    return;
                }


                console.log(
                    "AuthCallback: Login completed successfully."
                );


                // Keep the completed auth/profile/access state in the current
                // provider instead of forcing a full reload and repeating the
                // startup access checks.
                navigate("/dashboard", { replace: true });

            }
            catch (error) {

                console.error(
                    "AuthCallback Error:",
                    error
                );


                if (!cancelled) {

                    setError(
                        error?.message ||
                        "Authentication failed."
                    );

                }

            }

        };


        authenticate();


        return () => {

            cancelled = true;

        };

    }, [
        token,
        completeLogin,
        navigate
    ]);


    /*
    =========================================================
    ERROR
    =========================================================
    */

    if (error) {

        return (

            <MuiLayoutBox
                style={{
                    minHeight: "100vh",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "var(--spark-page, #f5f7fb)",
                    padding: "24px"
                }}
             component="div">

                <MuiLayoutBox
                    style={{
                        width: "100%",
                        maxWidth: "500px",
                        background: "var(--spark-surface-raised, #ffffff)",
                        border: "1px solid var(--spark-border, #e2e8f0)",
                        borderRadius: "16px",
                        padding: "40px",
                        textAlign: "center",
                        boxShadow:
                            "0 10px 30px rgba(0,0,0,0.08)"
                    }}
                 component="div">

                    <MuiText
                        style={{
                            marginBottom: "12px",
                            color: "var(--spark-text, #111827)"
                        }}
                     component="h2" variant="h5">
                        Authentication Failed
                    </MuiText>


                    <MuiText
                        style={{
                            color: "var(--spark-muted, #6b7280)",
                            marginBottom: "24px"
                        }}
                     component="p" variant="body1">
                        {error}
                    </MuiText>


                    <MuiButtonMigration
                        type="button"
                        onClick={() => {
                            window.location.href = "/login";
                        }}
                        style={{
                            border: "none",
                            borderRadius: "8px",
                            padding: "12px 24px",
                            background: "#2563eb",
                            color: "#ffffff",
                            fontWeight: 600,
                            cursor: "pointer"
                        }}
                    >
                        Back to Login
                    </MuiButtonMigration>

                </MuiLayoutBox>

            </MuiLayoutBox>

        );

    }


    /*
    =========================================================
    LOADING
    =========================================================
    */

    return (
        <SparkLoadingScreen
            title="Signing you in"
            description="Loading your employee profile."
        />
    );

}


export default AuthCallback;
