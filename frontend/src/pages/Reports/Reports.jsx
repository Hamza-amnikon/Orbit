import { useAuth } from "../../context/AuthContext";

function Reports() {
    const { hasPermission } = useAuth();

    const permissionRoute = "/reports";
    const canView = hasPermission(permissionRoute, "view");

    if (!canView) {
        return (
            <div style={{ padding: "60px", textAlign: "center" }}>
                <h2>Access Denied</h2>
                <p>You do not have permission to access this page.</p>
            </div>
        );
    }

    return <h1>Reports</h1>;
}

export default Reports;
