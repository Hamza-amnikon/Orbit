import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function PrivateRoute() {

    const {
        isAuthenticated,
        loading
    } = useAuth();

    const location = useLocation();

    if (loading) {

        return (

            <div
                style={{
                    height: "100vh",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    fontSize: "22px",
                    fontWeight: "600"
                }}
            >

                Loading...

            </div>

        );

    }

    if (!isAuthenticated) {

        return (

            <Navigate
                to="/login"
                replace
                state={{
                    from: location
                }}
            />

        );

    }

    return <Outlet />;

}

export default PrivateRoute;