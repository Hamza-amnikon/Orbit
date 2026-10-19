import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import EmployeeService from "../../Admin/AttendanceManagement/services/EmployeeService";
import LeaveService from "../../Admin/Services/LeaveService";

import GroupsRoundedIcon from "@mui/icons-material/GroupsRounded";
import EventBusyRoundedIcon from "@mui/icons-material/EventBusyRounded";
import ConfirmationNumberRoundedIcon from "@mui/icons-material/ConfirmationNumberRounded";
import PaidRoundedIcon from "@mui/icons-material/PaidRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";

import { useAuth } from "../../context/AuthContext";
import { menu as sidebarMenu } from "../../components/layout/Sidebar/Sidebar";

import "./Dashboard.css";
import { Box as MuiLayoutBox, Typography as MuiText, ButtonBase as MuiActionButton } from "@mui/material";


/* ============================================================
   DASHBOARD
   ============================================================ */

function Dashboard() {

    const navigate = useNavigate();
    const [dashboardCounts, setDashboardCounts] = useState({
        employees: null,
        onLeave: null,
    });
    const [countsLoading, setCountsLoading] = useState(true);
    const [countsUpdatedAt, setCountsUpdatedAt] = useState({});

    const {
        user,
        profile,

        employeeId,
        employeeCode,
        employeeName,

        email,
        department,
        designation,

        status,
        role,

        isAuthenticated,
        hasPermission,
        getModuleLoginRoute
    } = useAuth();

    const refreshDashboardCounts = useCallback(async () => {
        const [employeesResult, leavesResult] = await Promise.allSettled([
            EmployeeService.getAllEmployees(),
            LeaveService.getLeaves(),
        ]);
        let employeesCount;
        let onLeaveCount;

        if (employeesResult.status === "fulfilled") {
            const response = employeesResult.value;
            const employees = Array.isArray(response)
                ? response
                : response?.data ?? response?.items ?? response?.value;
            if (Array.isArray(employees)) employeesCount = employees.length;
        }

        if (leavesResult.status === "fulfilled" && Array.isArray(leavesResult.value)) {
            const now = new Date();
            const today = [now.getFullYear(), String(now.getMonth() + 1).padStart(2, "0"), String(now.getDate()).padStart(2, "0")].join("-");
            onLeaveCount = leavesResult.value.filter((leave) => {
                const status = String(leave.status ?? leave.Status ?? "").trim().toLowerCase();
                const from = String(leave.fromDate ?? leave.FromDate ?? "").slice(0, 10);
                const to = String(leave.toDate ?? leave.ToDate ?? leave.fromDate ?? leave.FromDate ?? "").slice(0, 10);
                return status === "approved" && from && to && from <= today && today <= to;
            }).length;
        }

        setDashboardCounts((current) => ({
            employees: employeesCount ?? current.employees,
            onLeave: onLeaveCount ?? current.onLeave,
        }));
        const updatedAt = new Date();
        setCountsUpdatedAt((current) => ({
            ...current,
            ...(employeesCount !== undefined ? { employees: updatedAt } : {}),
            ...(onLeaveCount !== undefined ? { onLeave: updatedAt } : {}),
        }));
        setCountsLoading(false);
    }, []);

    useEffect(() => {
        refreshDashboardCounts();
        const timer = window.setInterval(() => {
            if (document.visibilityState === "visible") refreshDashboardCounts();
        }, 30_000);
        const refreshOnReturn = () => {
            if (document.visibilityState === "visible") refreshDashboardCounts();
        };
        document.addEventListener("visibilitychange", refreshOnReturn);
        return () => {
            window.clearInterval(timer);
            document.removeEventListener("visibilitychange", refreshOnReturn);
        };
    }, [refreshDashboardCounts]);


    /* ========================================================
       DISPLAY NAME
       ======================================================== */

    const displayName = useMemo(() => {

        return (
            employeeName ||
            profile?.employeeName ||
            profile?.EmployeeName ||
            profile?.displayName ||
            profile?.DisplayName ||
            user?.employeeName ||
            user?.EmployeeName ||
            user?.displayName ||
            user?.DisplayName ||
            user?.name ||
            "Employee"
        );

    }, [
        employeeName,
        profile,
        user
    ]);


    /* ========================================================
       FIRST NAME
       ======================================================== */

    const firstName = useMemo(() => {

        return (
            String(displayName)
                .trim()
                .split(/\s+/)[0] ||
            "Employee"
        );

    }, [displayName]);


    /* ========================================================
       NORMALIZED USER
       ======================================================== */

    const dashboardUser = useMemo(() => {

        return {

            employeeId:
                employeeId ?? null,

            employeeCode:
                employeeCode ?? null,

            employeeName:
                displayName,

            firstName:
                firstName,

            email:
                email ?? null,

            department:
                department ?? null,

            designation:
                designation ?? null,

            status:
                status ?? null,

            role:
                role ?? "Employee"

        };

    }, [
        employeeId,
        employeeCode,
        displayName,
        firstName,
        email,
        department,
        designation,
        status,
        role
    ]);


    /* ========================================================
       CURRENT DATE
       ======================================================== */

    const today = useMemo(() => {

        return new Date().toLocaleDateString(
            "en-US",
            {
                weekday: "long",
                month: "long",
                day: "numeric",
                year: "numeric"
            }
        );

    }, []);


    /* ========================================================
       GREETING
       ======================================================== */

    const greeting = useMemo(() => {

        const hour = new Date().getHours();

        if (hour < 12) {
            return "Good Morning";
        }

        if (hour < 17) {
            return "Good Afternoon";
        }

        return "Good Evening";

    }, []);


    /* ========================================================
       STATISTICS
       ======================================================== */

    const stats = [

        {
            title: "Employees",
            value: dashboardCounts.employees,
            loading: countsLoading,
            detail: countsUpdatedAt.employees
                ? `Updated ${countsUpdatedAt.employees.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}`
                : countsLoading ? "Loading live data" : "Live data unavailable",
            color: "#2563eb",
            icon: <GroupsRoundedIcon />,
            route: "/employees"
        },

        {
            title: "On Leave",
            value: dashboardCounts.onLeave,
            loading: countsLoading,
            detail: countsUpdatedAt.onLeave
                ? `Updated ${countsUpdatedAt.onLeave.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}`
                : countsLoading ? "Loading live data" : "Live data unavailable",
            color: "#16a34a",
            icon: <EventBusyRoundedIcon />,
            route: "/leave"
        },

        {
            title: "Open Tickets",
            value: null,
            detail: "Not connected to live ticket data",
            color: "#ea580c",
            icon: <ConfirmationNumberRoundedIcon />,
            route: "/tickets"
        },

        {
            title: "Pending Salaries",
            value: null,
            detail: "Not connected to live payroll status",
            color: "#9333ea",
            icon: <PaidRoundedIcon />,
            route: "/payroll"
        }

    ];


    /* ========================================================
       MODULES
       ======================================================== */

    const moduleDescriptions = {
        "/dashboard": "Your workspace overview and key updates.",
        "/employees": "Manage employee records and organization.",
        "/attendance": "Review attendance, shifts and time records.",
        "/leave": "Manage leave requests, balances and policies.",
        "/approvals": "Review requests assigned for approval.",
        "/payroll": "Manage salaries, payroll runs and payslips.",
        "/reports": "View and export HR reports.",
        "/tickets": "Open and manage support tickets.",
        "/documents": "Access employee and company documents.",
        "/settings": "Manage your profile and account settings.",
        "/permission-management": "Manage roles and access permissions.",
        "/reimbursements": "Submit and manage expense claims.",
        "/policy": "View and manage company policies.",
    };
    const moduleColors = {
        "/dashboard": "#2563eb",
        "/employees": "#2563eb",
        "/attendance": "#0ea5e9",
        "/leave": "#16a34a",
        "/approvals": "#8b5cf6",
        "/payroll": "#dc2626",
        "/reports": "#2563eb",
        "/tickets": "#ea580c",
        "/documents": "#0891b2",
        "/settings": "#9333ea",
        "/permission-management": "#64748b",
        "/reimbursements": "#14b8a6",
        "/policy": "#ca8a04",
    };
    const modules = sidebarMenu.filter((item) => item.permissionPath !== "/dashboard").map((item) => ({
        title: item.title.trim(),
        description: moduleDescriptions[item.permissionPath] || "Open this SPARK module.",
        icon: item.icon,
        color: moduleColors[item.permissionPath] || "#2563eb",
        route: getModuleLoginRoute?.(item.permissionPath) || item.path,
        permissionPath: item.permissionPath,
    }));


    /* ========================================================
       AUTHENTICATION
       ======================================================== */

    if (!isAuthenticated) {

        return (

            <MuiLayoutBox className="dashboard-auth-required" component="div">

                <MuiLayoutBox className="dashboard-auth-card" component="div">

                    <MuiLayoutBox className="dashboard-auth-icon" component="div">
                        🔐
                    </MuiLayoutBox>

                    <MuiText component="h2" variant="h5">
                        Authentication Required
                    </MuiText>

                    <MuiText component="p" variant="body1">
                        Please sign in to access your dashboard.
                    </MuiText>

                </MuiLayoutBox>

            </MuiLayoutBox>

        );

    }


    /* ========================================================
       OPEN ROUTE
       ======================================================== */

    const openModule = (route) => {

        if (!route) {
            return;
        }

        navigate(route);

    };


    /* ========================================================
       PERMISSION FILTER
       ======================================================== */

    const visibleStats = stats.filter((item) => {

        if (!item.route) {
            return true;
        }

        return hasPermission(item.route, "view");

    });


    const visibleModules = modules.filter((item) => {

        if (!item.route) {
            return true;
        }

        return hasPermission(item.permissionPath, "view");

    });


    /* ========================================================
       RENDER
       ======================================================== */

    return (

        <MuiLayoutBox className="spark-dashboard-page" component="div">


            {/* ==================================================
                WELCOME
            ================================================== */}

            <MuiLayoutBox className="dashboard-welcome" component="section">

                <MuiLayoutBox className="welcome-content" component="div">


                    <MuiLayoutBox className="welcome-main" component="div">

                        <MuiText component="h1" variant="h4">
                            {greeting}, {firstName} 👋
                        </MuiText>

                        <MuiText component="p" variant="body1">
                            Here is what is happening across your workspace today.
                        </MuiText>

                    </MuiLayoutBox>


                    <MuiLayoutBox className="welcome-date" component="div">

                        <MuiText component="strong" variant="inherit">
                            {today}
                        </MuiText>

                        <MuiText component="span" variant="inherit">
                            Stay focused. Great things happen here!
                        </MuiText>

                    </MuiLayoutBox>


                </MuiLayoutBox>

            </MuiLayoutBox>


            {/* ==================================================
                STATISTICS
            ================================================== */}

            <MuiLayoutBox className="dashboard-stats-grid" component="section">

                {visibleStats.map((stat) => (

                    <MuiActionButton
                        key={stat.title}
                        className="dashboard-stat-card"
                        role="button"
                        tabIndex={0}
                        onClick={() =>
                            openModule(stat.route)
                        }
                     component="div">

                        <MuiLayoutBox
                            className="dashboard-stat-icon"
                            style={{
                                background: stat.color
                            }}
                         component="div">
                            {stat.icon}
                        </MuiLayoutBox>


                        <MuiLayoutBox className="dashboard-stat-content" component="div">

                            <MuiText component="p" variant="body1">
                                {stat.title}
                            </MuiText>

                            <MuiText component="h2" variant="h5">
                                {stat.loading ? "…" : stat.value ?? "—"}
                            </MuiText>

                            {stat.detail && (
                                <MuiText className="dashboard-stat-detail" component="span" variant="caption">
                                    {stat.detail}
                                </MuiText>
                            )}

                        </MuiLayoutBox>

                    </MuiActionButton>

                ))}

            </MuiLayoutBox>

            <MuiText className="dashboard-live-update" component="p" variant="caption" aria-live="polite">
                Connected dashboard data refreshes every 30 seconds while this tab is open.
            </MuiText>


            {/* ==================================================
                MODULE HEADER
            ================================================== */}

            <MuiLayoutBox className="dashboard-module-heading" component="section">

                <MuiLayoutBox className="dashboard-module-title" component="div">

                    <MuiText component="h2" variant="h5">
                        Modules
                    </MuiText>

                    <MuiText component="span" variant="inherit"></MuiText>

                </MuiLayoutBox>


                <MuiText component="p" variant="body1">
                    Quick access to all features
                </MuiText>

            </MuiLayoutBox>


            {/* ==================================================
                MODULE GRID
            ================================================== */}

            <MuiLayoutBox className="dashboard-modules-grid" component="section">

                {visibleModules.map((module, index) => (

                    <MuiActionButton
                        key={module.permissionPath}
                        className="dashboard-module-card"
                        role={module.route ? "button" : undefined}
                        tabIndex={module.route ? 0 : undefined}
                        onClick={() =>
                            openModule(module.route)
                        }
                     component="div">


                        {/* ======================================
                            DECORATIVE CIRCLE
                        ====================================== */}

                        <MuiLayoutBox
                            className="module-decoration"
                            style={{
                                background: module.color
                            }}
                         component="div"></MuiLayoutBox>


                        {/* ======================================
                            ICON
                        ====================================== */}

                        <MuiLayoutBox
                            className="dashboard-module-icon"
                            style={{
                                background: module.color
                            }}
                         component="div">

                            {module.icon}

                        </MuiLayoutBox>


                        {/* ======================================
                            CONTENT
                        ====================================== */}

                        <MuiLayoutBox className="dashboard-module-content" component="div">

                            <MuiText component="h3" variant="h6">
                                {module.title}
                            </MuiText>

                            <MuiText component="p" variant="body1">
                                {module.description}
                            </MuiText>

                        </MuiLayoutBox>


                        {/* ======================================
                            RIGHT ARROW
                        ====================================== */}

                        {module.route && (

                            <MuiLayoutBox
                                className="dashboard-module-arrow"
                                aria-hidden="true"
                             component="div">

                                <ArrowForwardRoundedIcon />

                            </MuiLayoutBox>

                        )}

                    </MuiActionButton>

                ))}

            </MuiLayoutBox>


        </MuiLayoutBox>

    );

}


export default Dashboard;
