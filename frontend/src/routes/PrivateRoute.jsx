import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import SparkLoadingScreen from "../components/ui/SparkLoadingScreen";

function PrivateRoute() {
    const { isAuthenticated, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return <SparkLoadingScreen title="Signing you in" description="Securely checking your Spark session." />;
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace state={{ from: location.pathname }} />;
    }

    return <Outlet />;
}

export default PrivateRoute;
