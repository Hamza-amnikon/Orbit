import { useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { Box as MuiLayoutBox, Typography as MuiText } from "@mui/material";

function Tickets() {
    const { hasPermission } = useAuth();

    const permissionRoute = "/tickets";
    const canView = hasPermission(permissionRoute, "view");

    useEffect(() => {
        if (canView) {
            window.location.href =
                "https://172.31.3.4//osticket//scp";
        }
    }, [canView]);

    if (!canView) {
        return (
            <MuiLayoutBox className="tickets-access-denied" style={{ padding: "60px", textAlign: "center" }} component="div">
                <MuiText component="h2" variant="h5">Access Denied</MuiText>
                <MuiText component="p" variant="body1">You do not have permission to access this page.</MuiText>
            </MuiLayoutBox>
        );
    }

    return (
        <MuiLayoutBox className="tickets-page" role="status" component="div">
            <MuiText component="h2" variant="h5">Opening Tickets...</MuiText>
        </MuiLayoutBox>
    );
}

export default Tickets;
