import { useEffect } from "react";
import { useAuth } from "../../context/AuthContext";

function Tickets() {
    const { hasPermission } = useAuth();

    const permissionRoute = "/tickets";
    const canView = hasPermission(permissionRoute, "view");

    useEffect(() => {
        if (canView) {
            window.location.href =
                "https://astra.amnikontechnologies.com/osticket/scp/login.php";
        }
    }, [canView]);

    if (!canView) {
        return (
            <div style={{ padding: "60px", textAlign: "center" }}>
                <h2>Access Denied</h2>
                <p>You do not have permission to access this page.</p>
            </div>
        );
    }

    return (
        <div
            style={{
                padding: "60px",
                textAlign: "center",
            }}
        >
            <h2>Opening Tickets...</h2>
        </div>
    );
}

export default Tickets;