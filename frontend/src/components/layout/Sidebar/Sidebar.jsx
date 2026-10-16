import { MuiButtonMigration } from "../../ui/MuiCompat.jsx";
import "./Sidebar.css";

import {
    NavLink,
    useNavigate,
} from "react-router-dom";

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
import AccountCircleRoundedIcon from "@mui/icons-material/AccountCircleRounded";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import ReceiptLongRoundedIcon from "@mui/icons-material/ReceiptLongRounded";
import RequestQuoteRoundedIcon from "@mui/icons-material/RequestQuoteRounded";
import PolicyRoundedIcon from "@mui/icons-material/PolicyRounded";


import { useAuth } from "../../../context/AuthContext";
import { Box as MuiLayoutBox, ListItemButton as MuiNavItem, Typography as MuiText } from "@mui/material";

/* ============================================================
   SIDEBAR MENU
   ============================================================ */

export const menu = [
  {
    title: "Dashboard",
    icon: <DashboardRoundedIcon />,
    path: "/",
    permissionPath: "/",
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
    title: "Profile",
    icon: <AccountCircleRoundedIcon />,
    path: "/settings",
    permissionPath: "/settings",
  },
  {
    title: "Permission ",
    icon: <SettingsRoundedIcon />,
    path: "/permission-management",
    permissionPath: "/permission-management",
  },
    {
    title: "Reimbursement",
    icon: <ReceiptLongRoundedIcon />,
    path: "/reimbursements",
    permissionPath: "/reimbursements",
  },
{
    title: "Policy",
    icon: <PolicyRoundedIcon />,
    path: "/policy",
    permissionPath: "/policy",
},
  
];


/* ============================================================
   SIDEBAR
   ============================================================ */

function Sidebar() {

    const navigate = useNavigate();

    const {
        hasPermission,
        getModuleLoginRoute,
    } = useAuth();


    /* ========================================================
       LOGOUT
       ======================================================== */

    const handleLogout = () => {

        localStorage.removeItem("token");
        localStorage.removeItem("accessToken");
        localStorage.removeItem("user");
        localStorage.removeItem("profile");

        sessionStorage.clear();

        navigate(
            "/login",
            {
                replace: true,
            }
        );
    };


    /* ========================================================
       GET MENU ROUTE
       ======================================================== */

    const getMenuRoute = (item) => {

        try {

            const loginRoute =
                getModuleLoginRoute?.(
                    item.permissionPath
                );

            if (loginRoute) {

                return loginRoute;
            }

        }
        catch (error) {

            console.error(
                `Sidebar: Failed to resolve login route for ${item.title}`,
                error
            );
        }

        return item.path;
    };


  // =========================================================
  // FILTER MENU BASED ON PERMISSIONS
  // =========================================================

  const allowedMenu = menu.filter((item) =>
    hasPermission(
      item.permissionPath,
      "view"
    )
  );


    /* ========================================================
       RENDER
       ======================================================== */

    return (

        <MuiLayoutBox className="sidebar" component="aside">

            {/* =================================================
                LOGO
            ================================================= */}

            <MuiLayoutBox className="sidebar-logo" component="div">

                <MuiLayoutBox
                    src={logo}
                    alt="AMNIKON Logo"
                    className="logo-image"
                 component="img"/>

            </MuiLayoutBox>


            {/* =================================================
                SCROLLABLE MENU
            ================================================= */}

            <MuiLayoutBox className="sidebar-menu" component="nav">

                {allowedMenu.map(
                    (item) => {

                        const menuRoute =
                            getMenuRoute(item);

                        return (

                            <MuiNavItem
                                key={item.title}
                                component={NavLink}
                                to={menuRoute}
                                className={({ isActive }) =>
                                    isActive
                                        ? "menu-item active"
                                        : "menu-item"
                                }
                                sx={{
                                    color: "text.secondary",
                                    textDecoration: "none",
                                    borderRadius: 2,
                                    gap: 1.5,
                                    "&.active": {
                                        color: "primary.contrastText",
                                        backgroundColor: "primary.main",
                                    },
                                }}
                            >

                                <MuiText className="menu-icon" component="span" variant="inherit">
                                    {item.icon}
                                </MuiText>

                                <MuiText className="menu-title" component="span" variant="inherit">
                                    {item.title}
                                </MuiText>

                            </MuiNavItem>

                        );
                    }
                )}

            </MuiLayoutBox>


            {/* =================================================
                FOOTER
            ================================================= */}

            <MuiLayoutBox className="sidebar-footer" component="div">

                <MuiButtonMigration
                    type="button"
                    className="logout-btn"
                    onClick={handleLogout}
                >

                    <LogoutRoundedIcon />

                    <MuiText component="span" variant="inherit">
                        Logout
                    </MuiText>

                </MuiButtonMigration>

            </MuiLayoutBox>

        </MuiLayoutBox>

    );
}


export default Sidebar;
