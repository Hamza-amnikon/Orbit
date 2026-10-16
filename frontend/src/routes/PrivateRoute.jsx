import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Box as MuiLayoutBox } from "@mui/material";

function PrivateRoute() {
    const { isAuthenticated, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return (
            <MuiLayoutBox style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }} component="div">
                <MuiLayoutBox component="div">Loading authentication...</MuiLayoutBox>
            </MuiLayoutBox>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace state={{ from: location.pathname }} />;
    }

    return <Outlet />;
}

export default PrivateRoute;
