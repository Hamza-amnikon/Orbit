import "./AttendanceReports.css";

import { useAuth } from "../../../context/AuthContext";

export default function AttendanceReports() {
    const { hasPermission } = useAuth();

    const permissionRoute = "/attendance/reports";

    const canView = hasPermission(permissionRoute, "view");

    if (!canView) {
        return null;
    }

    return (
        <div>
            Attendance Reports
        </div>
    );
}