import "./Sidebar.css";

import { NavLink } from "react-router-dom";
import logo from "../../../assets/logo/amnikon-logo.png";

import DashboardRoundedIcon from "@mui/icons-material/DashboardRounded";
import PeopleRoundedIcon from "@mui/icons-material/PeopleRounded";
import AccessTimeRoundedIcon from "@mui/icons-material/AccessTimeRounded";
import EventBusyRoundedIcon from "@mui/icons-material/EventBusyRounded";
import PaymentsRoundedIcon from "@mui/icons-material/PaymentsRounded";
import AssessmentRoundedIcon from "@mui/icons-material/AssessmentRounded";
import ConfirmationNumberRoundedIcon from "@mui/icons-material/ConfirmationNumberRounded";
import SettingsRoundedIcon from "@mui/icons-material/SettingsRounded";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";

const menu = [
  {
    title: "Dashboard",
    icon: <DashboardRoundedIcon />,
    path: "/",
  },
  {
    title: "Employees",
    icon: <PeopleRoundedIcon />,
    path: "/employees",
  },
  {
    title: "Attendance",
    icon: <AccessTimeRoundedIcon />,
    path: "/attendance",
  },
  {
    title: "Leave",
    icon: <EventBusyRoundedIcon />,
    path: "/leave",
  },
  {
    title: "Payroll",
    icon: <PaymentsRoundedIcon />,
    path: "/payroll",
  },
  {
    title: "Reports",
    icon: <AssessmentRoundedIcon />,
    path: "/reports",
  },
  {
    title: "Tickets",
    icon: <ConfirmationNumberRoundedIcon />,
    path: "/tickets",
  },
  {
    title: "Settings",
    icon: <SettingsRoundedIcon />,
    path: "/settings",
  },
];

function Sidebar() {
  return (
    <aside className="sidebar">
<div className="logo">
  <img src={logo} alt="AMNIKON Logo" className="logo-image" />

  <div className="logo-text">
    <h2>AMNIKON</h2>
    <span>ORBIT</span>
  </div>
</div>

      <nav className="sidebar-menu">
        {menu.map((item) => (
          <NavLink
            key={item.title}
            to={item.path}
            className={({ isActive }) =>
              isActive ? "menu-item active" : "menu-item"
            }
          >
            {item.icon}
            <span>{item.title}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="profile">
          <div className="avatar">H</div>

          <div>
            <h4>Hamza</h4>
            <p>Administrator</p>
          </div>
        </div>

        <button className="logout-btn">
          <LogoutRoundedIcon />
          Logout
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;