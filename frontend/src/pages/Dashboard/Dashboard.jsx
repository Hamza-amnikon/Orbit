import { useMemo } from "react";
import { useNavigate } from "react-router-dom";

import GroupsRoundedIcon from "@mui/icons-material/GroupsRounded";
import EventBusyRoundedIcon from "@mui/icons-material/EventBusyRounded";
import PersonOutlineRoundedIcon from "@mui/icons-material/PersonOutlineRounded";
import ConfirmationNumberRoundedIcon from "@mui/icons-material/ConfirmationNumberRounded";
import AdminPanelSettingsRoundedIcon from "@mui/icons-material/AdminPanelSettingsRounded";
import PaidRoundedIcon from "@mui/icons-material/PaidRounded";
import PercentRoundedIcon from "@mui/icons-material/PercentRounded";
import AssessmentRoundedIcon from "@mui/icons-material/AssessmentRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";

import { useAuth } from "../../context/AuthContext";

import "./Dashboard.css";
import { Box as MuiLayoutBox, Typography as MuiText, ButtonBase as MuiActionButton } from "@mui/material";


/* ============================================================
   DASHBOARD
   ============================================================ */

function Dashboard() {

    const navigate = useNavigate();

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
        hasPermission
    } = useAuth();


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
            value: "256",
            color: "#2563eb",
            icon: <GroupsRoundedIcon />,
            route: "/employees"
        },

        {
            title: "On Leave",
            value: "18",
            color: "#16a34a",
            icon: <EventBusyRoundedIcon />,
            route: "/leave"
        },

        {
            title: "Open Tickets",
            value: "32",
            color: "#ea580c",
            icon: <ConfirmationNumberRoundedIcon />,
            route: "/tickets"
        },

        {
            title: "Pending Salaries",
            value: "5",
            color: "#9333ea",
            icon: <PaidRoundedIcon />,
            route: "/payroll"
        }

    ];


    /* ========================================================
       MODULES
       ======================================================== */

    const modules = [

        {
            title: "HRMS",
            description:
                "Manage employees, attendance and organization.",
            icon: <GroupsRoundedIcon />,
            color: "#2563eb"
        },

        {
            title: "Leave Management",
            description:
                "Approve and manage employee leave requests.",
            icon: <EventBusyRoundedIcon />,
            color: "#16a34a",
            route: "/leave"
        },

        {
            title: "Employee Management",
            description:
                "Manage employee profiles and departments.",
            icon: <PersonOutlineRoundedIcon />,
            color: "#9333ea",
            route: "/employees"
        },

        {
            title: "Ticketing",
            description:
                "Raise and track support tickets.",
            icon: <ConfirmationNumberRoundedIcon />,
            color: "#ea580c",
            route: "/tickets"
        },

        {
            title: "Administration",
            description:
                "Manage company settings and permissions.",
            icon: <AdminPanelSettingsRoundedIcon />,
            color: "#0f766e"
        },

        {
            title: "Salary Management",
            description:
                "Process employee salaries and payroll.",
            icon: <PaidRoundedIcon />,
            color: "#dc2626",
            route: "/payroll"
        },

        {
            title: "Deductions",
            description:
                "PF, ESI, Tax and other deductions.",
            icon: <PercentRoundedIcon />,
            color: "#ca8a04"
        },

        {
            title: "Reports",
            description:
                "Generate HR and payroll reports.",
            icon: <AssessmentRoundedIcon />,
            color: "#2563eb",
            route: "/reports"
        },

        {
            title: "My Dashboard",
            description:
                "View your personal dashboard and analytics.",
            icon: <AssessmentRoundedIcon />,
            color: "#2563eb",
            route: "/MyDashboard"
        }

    ];


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

        return hasPermission(
            item.route,
            "view"
        );

    });


    const visibleModules = modules.filter((item) => {

        if (!item.route) {
            return true;
        }

        return hasPermission(
            item.route,
            "view"
        );

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
                                {stat.value}
                            </MuiText>

                        </MuiLayoutBox>

                    </MuiActionButton>

                ))}

            </MuiLayoutBox>


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
                        key={module.title}
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