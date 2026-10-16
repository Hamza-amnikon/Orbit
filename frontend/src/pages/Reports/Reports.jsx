import { useAuth } from "../../context/AuthContext";
import AssessmentRounded from "@mui/icons-material/AssessmentRounded";
import { Box as MuiLayoutBox, Typography as MuiText } from "@mui/material";

function Reports() {
    const { hasPermission } = useAuth();

    const permissionRoute = "/reports";
    const canView = hasPermission(permissionRoute, "view");

    if (!canView) {
        return (
            <MuiLayoutBox style={{ padding: "60px", textAlign: "center" }} component="div">
                <MuiText component="h2" variant="h5">Access Denied</MuiText>
                <MuiText component="p" variant="body1">You do not have permission to access this page.</MuiText>
            </MuiLayoutBox>
        );
    }

    return (
        <MuiLayoutBox className="reports-page" component="section">
            <MuiLayoutBox className="reports-header" component="header">
                <MuiText component="h1" variant="h4">Reports</MuiText>
                <MuiText component="p" variant="body1">View organization reporting tools and summaries.</MuiText>
            </MuiLayoutBox>
            <MuiLayoutBox className="reports-empty" component="div">
                <AssessmentRounded aria-hidden="true" />
                <MuiText component="h2" variant="h5">Organization reports</MuiText>
                <MuiText component="p" variant="body1">No reports are configured on this page yet.</MuiText>
            </MuiLayoutBox>
        </MuiLayoutBox>
    );
}

export default Reports;
