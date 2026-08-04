import "./Sidebar.css";

import { NavLink, useNavigate } from "react-router-dom";
// import logo from "../src/pages/Login/assets/logo.png";
import logo from "../../../../assets/logo/test.png";

import DashboardIcon from "@mui/icons-material/Dashboard";
import PersonIcon from "@mui/icons-material/Person";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import EventNoteIcon from "@mui/icons-material/EventNote";
import DescriptionIcon from "@mui/icons-material/Description";
import GroupsIcon from "@mui/icons-material/Groups";
import NotificationsIcon from "@mui/icons-material/Notifications";
import SettingsIcon from "@mui/icons-material/Settings";
import LogoutIcon from "@mui/icons-material/Logout";

function Sidebar() {

    const navigate = useNavigate();

    const handleLogout = () => {

        // Remove JWT

        localStorage.removeItem("token");

        // Remove any future stored profile

        localStorage.removeItem("profile");

        // Redirect to Login

        navigate("/login", { replace: true });

    };

    return (

        <aside className="employee-sidebar">

<div className="logo">
  <img src={logo} alt="AMNIKON Logo" className="logo-image" />

  <div className="logo-text">
   
  </div>
</div>

            <nav className="sidebar-menu">

                <NavLink to="/employee/dashboard">

                    <DashboardIcon />

                    <span>Dashboard</span>

                </NavLink>

                <NavLink to="/employee/profile">

                    <PersonIcon />

                    <span>Profile</span>

                </NavLink>

                <NavLink to="/employee/attendance">

                    <AccessTimeIcon />

                    <span>Attendance</span>

                </NavLink>

                <NavLink to="/employee/leave">

                    <EventNoteIcon />

                    <span>Leave</span>

                </NavLink>

                <NavLink to="/employee/documents">

                    <DescriptionIcon />

                    <span>Documents</span>

                </NavLink>

                <NavLink to="/employee/team">

                    <GroupsIcon />

                    <span>Team</span>

                </NavLink>

                <NavLink to="/employee/notifications">

                    <NotificationsIcon />

                    <span>Notifications</span>

                </NavLink>

                <NavLink to="/employee/settings">

                    <SettingsIcon />

                    <span>Settings</span>

                </NavLink>

            </nav>

            <div className="sidebar-footer">

                <button
                    className="logout-btn"
                    onClick={handleLogout}
                >

                    <LogoutIcon />

                    Logout

                </button>

            </div>

        </aside>

    );

}

export default Sidebar;