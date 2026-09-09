import React from "react";
import { useAuth } from "../../context/AuthContext";

function PermissionGate({
    route,
    action = "view",
    children,
    fallback = null,
}) {
    const { hasPermission } = useAuth();

    if (!hasPermission(route, action)) {
        return fallback;
    }

    return children;
}

export default PermissionGate;