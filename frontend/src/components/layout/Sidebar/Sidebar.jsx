import "./Sidebar.css";

import { NavLink, useNavigate } from "react-router-dom";
import logo from "../../../assets/logo/test.png";

import DashboardRoundedIcon from "@mui/icons-material/DashboardRounded";
import PeopleRoundedIcon from "@mui/icons-material/PeopleRounded";
import AccessTimeRoundedIcon from "@mui/icons-material/AccessTimeRounded";
import EventBusyRoundedIcon from "@mui/icons-material/EventBusyRounded";
import PaymentsRoundedIcon from "@mui/icons-material/PaymentsRounded";
import AssessmentRoundedIcon from "@mui/icons-material/AssessmentRounded";
import ConfirmationNumberRoundedIcon from "@mui/icons-material/ConfirmationNumberRounded";
import DescriptionRoundedIcon from "@mui/icons-material/DescriptionRounded";
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
    title: "Documents",
    icon: <DescriptionRoundedIcon />,
    path: "/documents",
  },
  {
    title: "Settings",
    icon: <SettingsRoundedIcon />,
    path: "/settings",
  },
  
  {title: "Permission ",
    icon: <SettingsRoundedIcon />,
    path: "/permission-management",
  },
];


function Sidebar() {

  const navigate = useNavigate();


  // =========================================================
  // LOGOUT
  // =========================================================

  const handleLogout = () => {

    // Remove authentication data

    localStorage.removeItem("token");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
    localStorage.removeItem("profile");

    // Clear session data

    sessionStorage.clear();

    // Redirect to login

    navigate("/login", {
      replace: true,
    });

  };


  return (

    <aside className="sidebar">

      {/* =====================================================
          LOGO
      ===================================================== */}

      <div className="logo">

        <img
          src={logo}
          alt="AMNIKON Logo"
          className="logo-image"
        />

        <div className="logo-text"></div>

      </div>


      {/* =====================================================
          MENU
      ===================================================== */}

      <nav className="sidebar-menu">

        {menu.map((item) => (

          <NavLink
            key={item.title}
            to={item.path}
            className={({ isActive }) =>
              isActive
                ? "menu-item active"
                : "menu-item"
            }
          >

            {item.icon}

            <span>
              {item.title}
            </span>

          </NavLink>

        ))}

      </nav>


      {/* =====================================================
          FOOTER
      ===================================================== */}

      <div className="sidebar-footer">

        <button
          type="button"
          className="logout-btn"
          onClick={handleLogout}
        >

          <LogoutRoundedIcon />

          <span>
            Logout
          </span>

        </button>

      </div>

    </aside>

  );
}

export default Sidebar;