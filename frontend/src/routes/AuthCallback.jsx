import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

import { useAuth } from "../context/AuthContext";


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

                await completeLogin(token);


                if (cancelled) {
                    return;
                }


                console.log(
                    "AuthCallback: Login completed successfully."
                );


                /*
                =================================================
                IMPORTANT

                Authentication is completely finished.

                Use a full browser redirect instead of React
                navigation so AuthContext starts again with the
                saved JWT.

                Admin / Manager / TL / Employee currently all
                enter the same dashboard.
                =================================================
                */

                window.location.replace("/dashboard");

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

            <div
                style={{
                    minHeight: "100vh",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "#f5f7fb",
                    padding: "24px"
                }}
            >

                <div
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
                >

                    <h2
                        style={{
                            marginBottom: "12px",
                            color: "#111827"
                        }}
                    >
                        Authentication Failed
                    </h2>


                    <p
                        style={{
                            color: "#6b7280",
                            marginBottom: "24px"
                        }}
                    >
                        {error}
                    </p>


                    <button
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
                    </button>

                </div>

            </div>

        );

    }


    /*
    =========================================================
    LOADING
    =========================================================
    */

    return (

        <div
            style={{
                minHeight: "100vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "#f5f7fb"
            }}
        >

            <div
                style={{
                    textAlign: "center"
                }}
            >

                <div
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
                />

                <h2
                    style={{
                        margin: 0,
                        color: "#111827"
                    }}
                >
                    Signing you in...
                </h2>


                <p
                    style={{
                        marginTop: "8px",
                        color: "#6b7280"
                    }}
                >
                    Loading your employee profile.
                </p>

            </div>


            <style>
                {`
                    @keyframes auth-callback-spin {
                        to {
                            transform: rotate(360deg);
                        }
                    }
                `}
            </style>

        </div>

    );

}


export default AuthCallback;