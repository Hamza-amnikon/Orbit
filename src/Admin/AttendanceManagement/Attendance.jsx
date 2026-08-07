import "./Attendance.css";

import { useNavigate } from "react-router-dom";

import DashboardIcon from "@mui/icons-material/Dashboard";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import AssignmentTurnedInIcon from "@mui/icons-material/AssignmentTurnedIn";
import ScheduleIcon from "@mui/icons-material/Schedule";
import EventIcon from "@mui/icons-material/Event";
import AssessmentIcon from "@mui/icons-material/Assessment";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";

const menuItems = [
  {
    title: "Dashboard",
    description: "Attendance overview and analytics",
    icon: <DashboardIcon />,
    color: "#2563EB",
    path: "/attendance/dashboard",
  },
  {
    title: "Attendance Logs",
    description: "View daily attendance records",
    icon: <AccessTimeIcon />,
    color: "#10B981",
    path: "/attendance/logs",
  },

  {
    title: "Shift Management",
    description: "Manage employee shifts",
    icon: <ScheduleIcon />,
    color: "#8B5CF6",
    path: "/attendance/shifts",
  },
  {
    title: "Holidays",
    description: "Manage company holidays",
    icon: <EventIcon />,
    color: "#EF4444",
    path: "/attendance/holidays",
  },
  {
    title: "Reports",
    description: "Attendance reports & exports",
    icon: <AssessmentIcon />,
    color: "#06B6D4",
    path: "/attendance/reports",
  },
];

export default function Attendance() {
  const navigate = useNavigate();

  return (
    <div className="attendance-home">

      <div className="attendance-header">
        <h2>Attendance Management</h2>

        <p className="attendance-subtitle">
          Manage attendance logs, shifts, regularization requests, holidays and reports.
        </p>
      </div>

      <div className="attendance-grid">

        {menuItems.map((item) => (

          <div
            key={item.title}
            className="attendance-menu-card"
            onClick={() => navigate(item.path)}
          >

            <div
              className="attendance-icon"
              style={{ backgroundColor: item.color }}
            >
              {item.icon}
            </div>

            <div className="attendance-card-content">
              <h4>{item.title}</h4>
              <p>{item.description}</p>
            </div>

            <div className="attendance-arrow">
              <ArrowForwardRoundedIcon />
            </div>

          </div>

        ))}

      </div>

    </div>
  );
}