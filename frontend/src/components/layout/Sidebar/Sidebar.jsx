import "./Sidebar.css";

import { NavLink, useNavigate } from "react-router-dom";
import logo from "../../../assets/logo/test.png";

import DashboardRoundedIcon from "@mui/icons-material/DashboardRounded";
import PeopleRoundedIcon from "@mui/icons-material/PeopleRounded";
import AccessTimeRoundedIcon from "@mui/icons-material/AccessTimeRounded";
import EventBusyRoundedIcon from "@mui/icons-material/EventBusyRounded";
import ApprovalRoundedIcon from "@mui/icons-material/ApprovalRounded";
import PaymentsRoundedIcon from "@mui/icons-material/PaymentsRounded";
import AssessmentRoundedIcon from "@mui/icons-material/AssessmentRounded";
import ConfirmationNumberRoundedIcon from "@mui/icons-material/ConfirmationNumberRounded";
import DescriptionRoundedIcon from "@mui/icons-material/DescriptionRounded";
import SettingsRoundedIcon from "@mui/icons-material/SettingsRounded";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";

import { useAuth } from "../../../context/AuthContext";


export const menu = [
  {
    title: "Dashboard",
    icon: <DashboardRoundedIcon />,
    path: "/",
    permissionPath: "/dashboard",
  },
  {
    title: "Employees",
    icon: <PeopleRoundedIcon />,
    path: "/employees",
    permissionPath: "/employees",
  },
  {
    title: "Attendance",
    icon: <AccessTimeRoundedIcon />,
    path: "/attendance",
    permissionPath: "/attendance",
  },
  {
    title: "Leave",
    icon: <EventBusyRoundedIcon />,
    path: "/leave",
    permissionPath: "/leave",
  },
  {
    title: "Approvals",
    icon: <ApprovalRoundedIcon />,
    path: "/approvals",
    permissionPath: "/approvals",
  },
  {
    title: "Payroll",
    icon: <PaymentsRoundedIcon />,
    path: "/payroll",
    permissionPath: "/payroll",
  },
  {
    title: "Reports",
    icon: <AssessmentRoundedIcon />,
    path: "/reports",
    permissionPath: "/reports",
  },
  {
    title: "Tickets",
    icon: <ConfirmationNumberRoundedIcon />,
    path: "/tickets",
    permissionPath: "/tickets",
  },
  {
    title: "Documents",
    icon: <DescriptionRoundedIcon />,
    path: "/documents",
    permissionPath: "/documents",
  },
  {
    title: "Settings",
    icon: <SettingsRoundedIcon />,
    path: "/settings",
    permissionPath: "/settings",
  },
  {
    title: "Permission",
    icon: <SettingsRoundedIcon />,
    path: "/permission-management",
    permissionPath: "/permission-management",
  },
];


function Sidebar() {

  const navigate = useNavigate();

  // Get permission checker from AuthContext
  const { hasPermission } = useAuth();


  // =========================================================
  // LOGOUT
  // =========================================================

  const handleLogout = () => {

    localStorage.removeItem("token");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
    localStorage.removeItem("profile");

    sessionStorage.clear();

    navigate("/login", {
      replace: true,
    });

  };


  // =========================================================
  // FILTER MENU BASED ON PERMISSIONS
  // =========================================================

  const allowedMenu = menu.filter((item) =>
    hasPermission(item.permissionPath, "view")
  );


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

        {allowedMenu.map((item) => (

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