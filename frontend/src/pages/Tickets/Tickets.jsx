import { useAuth } from "../../context/AuthContext";
import { Alert, Box as MuiLayoutBox, Button, Typography as MuiText } from "@mui/material";

const getTicketPortalUrl = () => {
    const configuredUrl = String(
        import.meta.env.VITE_TICKETING_PORTAL_URL ||
        "https://ticketing-lab.amnikon.net/"
    ).trim();
    if (!configuredUrl) return null;

    try {
        const url = new URL(configuredUrl);
        const hostname = url.hostname.replace(/^\[|\]$/g, "");
        const isIpAddress = /^\d{1,3}(?:\.\d{1,3}){3}$/.test(hostname) || hostname.includes(":");
        if (url.protocol !== "https:" || isIpAddress || hostname === "localhost" || url.username || url.password) return null;
        return url.href;
    } catch {
        return null;
    }
};

function Tickets() {
    const { hasPermission } = useAuth();

    const permissionRoute = "/tickets";
    const canView = hasPermission(permissionRoute, "view");

    if (!canView) {
        return (
            <MuiLayoutBox className="tickets-access-denied" style={{ padding: "60px", textAlign: "center" }} component="div">
                <MuiText component="h2" variant="h5">Access Denied</MuiText>
                <MuiText component="p" variant="body1">You do not have permission to access this page.</MuiText>
            </MuiLayoutBox>
        );
    }

    const ticketPortalUrl = getTicketPortalUrl();

    return (
        <MuiLayoutBox className="tickets-page" component="section">
            <MuiText component="h1" variant="h5">Tickets</MuiText>
            {ticketPortalUrl ? (
                <>
                    <MuiText component="p" variant="body1">Open the secure ticket portal in a new tab.</MuiText>
                    <Button component="a" href={ticketPortalUrl} target="_blank" rel="noopener noreferrer" variant="contained">
                        Open ticket portal
                    </Button>
                </>
            ) : (
                <Alert severity="warning" role="status">
                    The ticket portal is unavailable because a secure HTTPS hostname has not been configured. Ask your administrator to set VITE_TICKETING_PORTAL_URL to the approved ticket portal URL.
                </Alert>
            )}
        </MuiLayoutBox>
    );
}

export default Tickets;
