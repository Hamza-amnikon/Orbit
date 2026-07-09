import { Navigate, Outlet } from "react-router-dom";

function PrivateRoute() {
  const isAuthenticated = true;

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
}

export default PrivateRoute;