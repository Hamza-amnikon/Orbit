import { useAuth } from "../../context/AuthContext";

function Tickets() {
    const { hasPermission } = useAuth();

    const permissionRoute = "/tickets";
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
        <a style={{ width: "100%", height: "100vh" }}>
            <iframe
                src="https://astra.amnikontechnologies.com/osticket/scp/login.php"
                title="Tickets"
                width="100%"
                height="100%"
                style={{ border: "none" }}
            />
        </a>
    );
}

export default Tickets;
