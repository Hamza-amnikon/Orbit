import { MuiButtonMigration } from "../components/ui/MuiCompat.jsx";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import { Box as MuiLayoutBox, GlobalStyles as MuiGlobalStyles, Typography as MuiText } from "@mui/material";


function AuthCallback() {

    const [searchParams] = useSearchParams();

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

                const loginResult =
                    await completeLogin(token);


                if (cancelled) {
                    return;
                }


                console.log(
                    "AuthCallback: Login completed successfully."
                );


                /*
                =================================================
                LOGIN REDIRECT

                completeLogin() can return an initialRoute
                based on the user's permissions.

                If no initialRoute is returned, keep the
                existing /dashboard behavior.
                =================================================
                */

                window.location.replace(
                    loginResult?.initialRoute ||
                    "/dashboard"
                );

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
        completeLogin
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
                    background: "#f5f7fb",
                    padding: "24px"
                }}
             component="div">

                <MuiLayoutBox
                    style={{
                        width: "100%",
                        maxWidth: "500px",
                        background: "#ffffff",
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
                            color: "#111827"
                        }}
                     component="h2" variant="h5">
                        Authentication Failed
                    </MuiText>


                    <MuiText
                        style={{
                            color: "#6b7280",
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

        <MuiLayoutBox
            style={{
                minHeight: "100vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "#f5f7fb"
            }}
         component="div">

            <MuiLayoutBox
                style={{
                    textAlign: "center"
                }}
             component="div">

                <MuiLayoutBox
                    style={{
                        width: "38px",
                        height: "38px",
                        border: "4px solid #e5e7eb",
                        borderTopColor: "#2563eb",
                        borderRadius: "50%",
                        animation:
                            "auth-callback-spin 0.8s linear infinite",
                        margin: "0 auto 20px"
                    }}
                 component="div"/>

                <MuiText
                    style={{
                        margin: 0,
                        color: "#111827"
                    }}
                 component="h2" variant="h5">
                    Signing you in...
                </MuiText>


                <MuiText
                    style={{
                        marginTop: "8px",
                        color: "#6b7280"
                    }}
                 component="p" variant="body1">
                    Loading your employee profile.
                </MuiText>

            </MuiLayoutBox>


            <MuiGlobalStyles
                styles={{
                    "@keyframes auth-callback-spin": {
                        to: { transform: "rotate(360deg)" },
                    },
                }}
            />

        </MuiLayoutBox>

    );

}


export default AuthCallback;
