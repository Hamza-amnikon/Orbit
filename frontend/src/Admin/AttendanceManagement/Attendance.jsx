import "./Attendance.css";

import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

import DashboardIcon from "@mui/icons-material/Dashboard";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import ScheduleIcon from "@mui/icons-material/Schedule";
import EventIcon from "@mui/icons-material/Event";
import AssessmentIcon from "@mui/icons-material/Assessment";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import HomeRoundedIcon from "@mui/icons-material/HomeRounded";

const menuItems = [
    {
        title: "Dashboard",
        description: "Attendance overview and analytics",
        icon: <DashboardIcon />,
        color: "#2563EB",
        path: "/attendance/dashboard",
        decoration: "bars",
    },

    {
        title: "Attendance Logs",
        description: "View daily attendance records",
        icon: <AccessTimeIcon />,
        color: "#10B981",
        path: "/attendance/logs",
        decoration: "document",
    },

    {
        title: "Shift Management",
        description: "Manage employee shifts",
        icon: <ScheduleIcon />,
        color: "#8B5CF6",
        path: "/attendance/shifts",
        decoration: "people",
    },

    {
        title: "Holidays",
        description: "Manage company holidays",
        icon: <EventIcon />,
        color: "#F97316",
        path: "/attendance/Holiday",
        decoration: "holiday",
    },

    {
        title: "My Attendance",
        description: "View your attendance records",
        icon: <AssessmentIcon />,
        color: "#243B3F",
        path: "/attendance/my-attendance",
        decoration: "person",
    },

    {
        title: "Reports",
        description: "Attendance reports & exports",
        icon: <AssessmentIcon />,
        color: "#06B6D4",
        path: "/attendance/reports",
        decoration: "bars",
    },
];

export default function Attendance() {

    const navigate = useNavigate();

    const { hasPermission } = useAuth();

    const allowedItems = menuItems.filter((item) =>
        hasPermission(item.path, "view")
    );

    return (
        <div className="attendance-home">

            {/* =====================================================
                BREADCRUMB
            ===================================================== */}

            <div className="attendance-breadcrumb">

                <HomeRoundedIcon />

                <span>/</span>

                <span>Attendance</span>

            </div>


            {/* =====================================================
                PAGE HEADER
            ===================================================== */}

            <div className="attendance-page-header">

                <div className="attendance-header-content">

                    <h1>
                        Attendance Management
                    </h1>

                    <p>
                        Manage attendance logs, shifts, regularization
                        requests, holidays and reports.
                    </p>

                </div>


                {/* =================================================
                    RIGHT SIDE DECORATION
                ================================================= */}

                <div className="attendance-header-decoration">

                    <span className="header-decoration-circle circle-one"></span>

                    <span className="header-decoration-circle circle-two"></span>

                </div>

            </div>


            {/* =====================================================
                MODULE GRID
            ===================================================== */}

            <div className="attendance-grid">

                {allowedItems.map((item) => (

                    <div
                        key={item.title}
                        className="attendance-menu-card"
                        style={{
                            "--item-color": item.color,
                        }}
                        onClick={() => navigate(item.path)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {

                            if (
                                e.key === "Enter" ||
                                e.key === " "
                            ) {

                                e.preventDefault();

                                navigate(item.path);

                            }

                        }}
                    >

                        {/* =================================================
                            ICON
                        ================================================= */}

                        <div
                            className="attendance-icon"
                            style={{
                                backgroundColor: item.color,
                            }}
                        >
                            {item.icon}
                        </div>


                        {/* =================================================
                            CARD CONTENT
                        ================================================= */}

                        <div className="attendance-card-content">

                            <h3>
                                {item.title}
                            </h3>

                            <p>
                                {item.description}
                            </p>

                        </div>


                        {/* =================================================
                            OPEN MODULE
                        ================================================= */}

                        <span className="attendance-open-module">
                            Open Module
                        </span>


                        {/* =================================================
                            ARROW
                        ================================================= */}

                        <div className="attendance-arrow">

                            <ArrowForwardRoundedIcon />

                        </div>


                        {/* =================================================
                            DECORATIONS
                        ================================================= */}

                        {item.decoration === "bars" && (

                            <div className="attendance-decoration decoration-bars">

                                <span></span>
                                <span></span>
                                <span></span>

                            </div>

                        )}


                        {item.decoration === "document" && (

                            <div className="attendance-decoration decoration-document">

                                <span></span>
                                <span></span>
                                <span></span>

                            </div>

                        )}


                        {item.decoration === "people" && (

                            <div className="attendance-decoration decoration-people">

                                <span></span>
                                <span></span>
                                <span></span>

                            </div>

                        )}


                        {item.decoration === "holiday" && (

                            <div className="attendance-decoration decoration-holiday">
                                ☀
                            </div>

                        )}


                        {item.decoration === "person" && (

                            <div className="attendance-decoration decoration-person">

                                <span className="person-head"></span>

                                <span className="person-body"></span>

                            </div>

                        )}

                    </div>

                ))}

            </div>

        </div>
    );
}