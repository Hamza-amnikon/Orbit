import { useAuth } from "../../context/AuthContext";
import AssessmentRounded from "@mui/icons-material/AssessmentRounded";

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

    return (
        <section className="reports-page">
            <header className="reports-header">
                <h1>Reports</h1>
                <p>View organization reporting tools and summaries.</p>
            </header>
            <div className="reports-empty">
                <AssessmentRounded aria-hidden="true" />
                <h2>Organization reports</h2>
                <p>No reports are configured on this page yet.</p>
            </div>
        </section>
    );
}

export default Reports;
