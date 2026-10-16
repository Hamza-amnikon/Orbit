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
import { Box as MuiLayoutBox, Typography as MuiText, ButtonBase as MuiActionButton } from "@mui/material";

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
        <MuiLayoutBox className="attendance-home" component="div">

            {/* =====================================================
                BREADCRUMB
            ===================================================== */}

            <MuiLayoutBox className="attendance-breadcrumb" component="div">

                <HomeRoundedIcon />

                <MuiText component="span" variant="inherit">/</MuiText>

                <MuiText component="span" variant="inherit">Attendance</MuiText>

            </MuiLayoutBox>


            {/* =====================================================
                PAGE HEADER
            ===================================================== */}

            <MuiLayoutBox className="attendance-page-header" component="div">

                <MuiLayoutBox className="attendance-header-content" component="div">

                    <MuiText component="h1" variant="h4">
                        Attendance Management
                    </MuiText>

                    <MuiText component="p" variant="body1">
                        Manage attendance logs, shifts, regularization
                        requests, holidays and reports.
                    </MuiText>

                </MuiLayoutBox>


                {/* =================================================
                    RIGHT SIDE DECORATION
                ================================================= */}

                <MuiLayoutBox className="attendance-header-decoration" component="div">

                    <MuiText className="header-decoration-circle circle-one" component="span" variant="inherit"></MuiText>

                    <MuiText className="header-decoration-circle circle-two" component="span" variant="inherit"></MuiText>

                </MuiLayoutBox>

            </MuiLayoutBox>


            {/* =====================================================
                MODULE GRID
            ===================================================== */}

            <MuiLayoutBox className="attendance-grid" component="div">

                {allowedItems.map((item) => (

                    <MuiActionButton
                        key={item.title}
                        className="attendance-menu-card"
                        style={{
                            "--item-color": item.color,
                        }}
                        onClick={() => navigate(item.path)}
                        role="button"
                        tabIndex={0}
                     component="div">

                        {/* =================================================
                            ICON
                        ================================================= */}

                        <MuiLayoutBox
                            className="attendance-icon"
                            style={{
                                backgroundColor: item.color,
                            }}
                         component="div">
                            {item.icon}
                        </MuiLayoutBox>


                        {/* =================================================
                            CARD CONTENT
                        ================================================= */}

                        <MuiLayoutBox className="attendance-card-content" component="div">

                            <MuiText component="h3" variant="h6">
                                {item.title}
                            </MuiText>

                            <MuiText component="p" variant="body1">
                                {item.description}
                            </MuiText>

                        </MuiLayoutBox>


                        {/* =================================================
                            OPEN MODULE
                        ================================================= */}

                        <MuiText className="attendance-open-module" component="span" variant="inherit">
                            Open Module
                        </MuiText>


                        {/* =================================================
                            ARROW
                        ================================================= */}

                        <MuiLayoutBox className="attendance-arrow" component="div">

                            <ArrowForwardRoundedIcon />

                        </MuiLayoutBox>


                        {/* =================================================
                            DECORATIONS
                        ================================================= */}

                        {item.decoration === "bars" && (

                            <MuiLayoutBox className="attendance-decoration decoration-bars" component="div">

                                <MuiText component="span" variant="inherit"></MuiText>
                                <MuiText component="span" variant="inherit"></MuiText>
                                <MuiText component="span" variant="inherit"></MuiText>

                            </MuiLayoutBox>

                        )}


                        {item.decoration === "document" && (

                            <MuiLayoutBox className="attendance-decoration decoration-document" component="div">

                                <MuiText component="span" variant="inherit"></MuiText>
                                <MuiText component="span" variant="inherit"></MuiText>
                                <MuiText component="span" variant="inherit"></MuiText>

                            </MuiLayoutBox>

                        )}


                        {item.decoration === "people" && (

                            <MuiLayoutBox className="attendance-decoration decoration-people" component="div">

                                <MuiText component="span" variant="inherit"></MuiText>
                                <MuiText component="span" variant="inherit"></MuiText>
                                <MuiText component="span" variant="inherit"></MuiText>

                            </MuiLayoutBox>

                        )}


                        {item.decoration === "holiday" && (

                            <MuiLayoutBox className="attendance-decoration decoration-holiday" component="div">
                                ☀
                            </MuiLayoutBox>

                        )}


                        {item.decoration === "person" && (

                            <MuiLayoutBox className="attendance-decoration decoration-person" component="div">

                                <MuiText className="person-head" component="span" variant="inherit"></MuiText>

                                <MuiText className="person-body" component="span" variant="inherit"></MuiText>

                            </MuiLayoutBox>

                        )}

                    </MuiActionButton>

                ))}

            </MuiLayoutBox>

        </MuiLayoutBox>
    );
}