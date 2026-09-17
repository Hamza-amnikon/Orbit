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

            <div className="dashboard-auth-required">

                <div className="dashboard-auth-card">

                    <div className="dashboard-auth-icon">
                        🔐
                    </div>

                    <h2>
                        Authentication Required
                    </h2>

                    <p>
                        Please sign in to access your dashboard.
                    </p>

                </div>

            </div>

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

        <div className="spark-dashboard-page">


            {/* ==================================================
                WELCOME
            ================================================== */}

            <section className="dashboard-welcome">

                <div className="welcome-content">


                    <div className="welcome-main">

                        <h1>
                            {greeting}, {firstName} 👋
                        </h1>

                        <p>
                            Welcome back! Here's what's happening
                            in your organization today.
                        </p>

                    </div>


                    <div className="welcome-date">

                        <strong>
                            {today}
                        </strong>

                        <span>
                            Stay focused. Great things happen here!
                        </span>

                    </div>


                </div>

            </section>


            {/* ==================================================
                STATISTICS
            ================================================== */}

            <section className="dashboard-stats-grid">

                {visibleStats.map((stat) => (

                    <div
                        key={stat.title}
                        className="dashboard-stat-card"
                        role="button"
                        tabIndex={0}
                        onClick={() =>
                            openModule(stat.route)
                        }
                        onKeyDown={(event) => {

                            if (
                                event.key === "Enter" ||
                                event.key === " "
                            ) {

                                event.preventDefault();

                                openModule(stat.route);

                            }

                        }}
                    >

                        <div
                            className="dashboard-stat-icon"
                            style={{
                                background: stat.color
                            }}
                        >
                            {stat.icon}
                        </div>


                        <div className="dashboard-stat-content">

                            <p>
                                {stat.title}
                            </p>

                            <h2>
                                {stat.value}
                            </h2>

                        </div>

                    </div>

                ))}

            </section>


            {/* ==================================================
                MODULE HEADER
            ================================================== */}

            <section className="dashboard-module-heading">

                <div className="dashboard-module-title">

                    <h2>
                        Modules
                    </h2>

                    <span></span>

                </div>


                <p>
                    Quick access to all features
                </p>

            </section>


            {/* ==================================================
                MODULE GRID
            ================================================== */}

            <section className="dashboard-modules-grid">

                {visibleModules.map((module, index) => (

                    <div
                        key={module.title}
                        className="dashboard-module-card"
                        role={module.route ? "button" : undefined}
                        tabIndex={module.route ? 0 : undefined}
                        onClick={() =>
                            openModule(module.route)
                        }
                        onKeyDown={(event) => {

                            if (
                                module.route &&
                                (
                                    event.key === "Enter" ||
                                    event.key === " "
                                )
                            ) {

                                event.preventDefault();

                                openModule(module.route);

                            }

                        }}
                    >


                        {/* ======================================
                            DECORATIVE CIRCLE
                        ====================================== */}

                        <div
                            className="module-decoration"
                            style={{
                                background: module.color
                            }}
                        ></div>


                        {/* ======================================
                            ICON
                        ====================================== */}

                        <div
                            className="dashboard-module-icon"
                            style={{
                                background: module.color
                            }}
                        >

                            {module.icon}

                        </div>


                        {/* ======================================
                            CONTENT
                        ====================================== */}

                        <div className="dashboard-module-content">

                            <h3>
                                {module.title}
                            </h3>

                            <p>
                                {module.description}
                            </p>

                        </div>


                        {/* ======================================
                            RIGHT ARROW
                        ====================================== */}

                        {module.route && (

                            <div
                                className="dashboard-module-arrow"
                                aria-hidden="true"
                            >

                                <ArrowForwardRoundedIcon />

                            </div>

                        )}

                    </div>

                ))}

            </section>


        </div>

    );

}


export default Dashboard;