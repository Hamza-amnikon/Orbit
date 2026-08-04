import { useEffect } from "react";

function AuthCallback() {

    useEffect(() => {

        const params = new URLSearchParams(window.location.search);

        const token = params.get("token");

        if (!token) {
            window.location.replace("/login");
            return;
        }

        // Save JWT
        localStorage.setItem("token", token);

        console.log("JWT Stored:", token);

        // Force reload so AuthProvider picks up the token
        window.location.replace("/employee/dashboard");

    }, []);

    return (
        <div
            style={{
                height: "100vh",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                fontSize: "22px",
                fontWeight: 600
            }}
        >
            Signing you in...
        </div>
    );
}

export default AuthCallback;