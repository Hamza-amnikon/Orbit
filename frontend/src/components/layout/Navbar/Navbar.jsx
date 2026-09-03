import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import NotificationsNoneRoundedIcon from "@mui/icons-material/NotificationsNoneRounded";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import MenuRoundedIcon from "@mui/icons-material/MenuRounded";
import PersonOutlineRoundedIcon from "@mui/icons-material/PersonOutlineRounded";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded";

import { getProfile } from "../../../Admin/Services/ProfileService";

import "./Navbar.css";


function Navbar({ title }) {

    const navigate = useNavigate();
    const location = useLocation();

    const [profile, setProfile] = useState(null);
    const [menuOpen, setMenuOpen] = useState(false);


    // =========================================================
    // PAGE TITLE
    // =========================================================

    const getPageTitle = () => {

        if (title) {
            return title;
        }

        const path = location.pathname.toLowerCase();

        if (path.includes("attendance")) {
            return "Attendance";
        }

        if (path.includes("leave")) {
            return "Leave";
        }

        if (path.includes("payroll")) {
            return "Payroll";
        }

        if (path.includes("employee")) {
            return "Employees";
        }

        if (path.includes("report")) {
            return "Reports";
        }

        if (path.includes("ticket")) {
            return "Tickets";
        }

        if (path.includes("setting")) {
            return "Settings";
        }

        if (path.includes("profile")) {
            return "Profile";
        }

        if (path.includes("team")) {
            return "Team";
        }

        return "Dashboard";
    };


    // =========================================================
    // LOAD PROFILE
    // =========================================================

    useEffect(() => {

        let mounted = true;

        const loadProfile = async () => {

            try {

                const data = await getProfile();

                console.log("Navbar Profile:", data);

                if (mounted) {
                    setProfile(data);
                }

            } catch (error) {

                console.error(
                    "Navbar Profile Error:",
                    error
                );

            }

        };

        loadProfile();

        return () => {
            mounted = false;
        };

    }, []);


    // =========================================================
    // INITIAL
    // =========================================================

    const getInitial = () => {

        const name =
            profile?.displayName ||
            profile?.name ||
            profile?.fullName;

        if (!name) {
            return "?";
        }

        return name
            .trim()
            .charAt(0)
            .toUpperCase();
    };


    // =========================================================
    // DISPLAY NAME
    // =========================================================

    const getDisplayName = () => {

        return (
            profile?.displayName ||
            profile?.name ||
            profile?.fullName ||
            "Employee"
        );

    };


    // =========================================================
    // JOB TITLE / ROLE
    // =========================================================

    const getJobTitle = () => {

        return (
            profile?.jobTitle ||
            profile?.designation ||
            profile?.role ||
            "Employee"
        );

    };


    // =========================================================
    // PROFILE MENU
    // =========================================================

    const handleProfileMenu = () => {

        setMenuOpen((previous) => !previous);

    };


    const closeMenu = () => {

        setMenuOpen(false);

    };


    // =========================================================
    // PROFILE
    // =========================================================

    const handleProfile = () => {

        closeMenu();

        navigate("/employee/profile");

    };


    // =========================================================
    // SETTINGS
    // =========================================================

    const handleSettings = () => {

        closeMenu();

        navigate("/settings");

    };


    // =========================================================
    // LOGOUT
    // =========================================================

    const handleLogout = () => {

        closeMenu();

        localStorage.removeItem("token");
        localStorage.removeItem("accessToken");
        localStorage.removeItem("user");
        localStorage.removeItem("profile");

        sessionStorage.clear();

        navigate("/login", {
            replace: true
        });

    };


    // =========================================================
    // MENU TOGGLE
    // =========================================================

    const handleMenu = () => {

        /*
         * Keep this available for the Sidebar.
         *
         * If your DashboardLayout later provides a
         * sidebar toggle function, replace this with:
         *
         * onMenuClick()
         */

        window.dispatchEvent(
            new CustomEvent("oya:toggle-sidebar")
        );

    };


    // =========================================================
    // SEARCH
    // =========================================================

    const handleSearch = (event) => {

        const value = event.target.value;

        /*
         * Search functionality can be connected later.
         *
         * Keeping the input controlled is intentionally
         * avoided for now so it does not interfere with
         * your existing pages.
         */

        console.log("Search:", value);

    };


    return (

        <header className="navbar">

            {/* =====================================================
                LEFT
            ===================================================== */}

            <div className="navbar-left">

                <button
                    type="button"
                    className="menu-btn"
                    aria-label="Toggle navigation"
                    onClick={handleMenu}
                >
                    <MenuRoundedIcon />
                </button>


                <div className="navbar-page-title">

                    <h2>
                        {getPageTitle()}
                    </h2>

                </div>


                <div className="search-box">

                    <SearchRoundedIcon />

                    <input
                        type="text"
                        placeholder="Search employees, tickets..."
                        onChange={handleSearch}
                        aria-label="Search"
                    />

                </div>

            </div>


            {/* =====================================================
                RIGHT
            ===================================================== */}

            <div className="navbar-right">

                {/* =================================================
                    NOTIFICATIONS
                ================================================= */}

                <button
                    type="button"
                    className="icon-btn notification-btn"
                    aria-label="Notifications"
                >

                    <NotificationsNoneRoundedIcon />

                    <span className="notification-dot" />

                </button>


                {/* =================================================
                    SETTINGS
                ================================================= */}

                <button
                    type="button"
                    className="icon-btn settings-btn"
                    aria-label="Settings"
                    onClick={handleSettings}
                >

                    <SettingsOutlinedIcon />

                </button>


                {/* =================================================
                    USER PROFILE
                ================================================= */}

                <div className="profile-wrapper">

                    <button
                        type="button"
                        className={`user-profile ${
                            menuOpen ? "profile-active" : ""
                        }`}
                        onClick={handleProfileMenu}
                        aria-expanded={menuOpen}
                        aria-haspopup="menu"
                    >

                        {/* Avatar */}

                        <div className="avatar">

                            {profile?.photoUrl ? (

                                <img
                                    src={profile.photoUrl}
                                    alt={getDisplayName()}
                                    className="navbar-avatar-image"
                                />

                            ) : (

                                getInitial()

                            )}

                        </div>


                        {/* Information */}

                        <div className="user-info">

                            <h4>
                                {getDisplayName()}
                            </h4>

                            <p>
                                {getJobTitle()}
                            </p>

                        </div>


                        {/* Arrow */}

                        <KeyboardArrowDownRoundedIcon
                            className="profile-arrow"
                        />

                    </button>


                    {/* =================================================
                        PROFILE DROPDOWN
                    ================================================= */}

                    {menuOpen && (

                        <div
                            className="profile-menu"
                            role="menu"
                        >

                            {/* Profile Header */}

                            <div className="profile-menu-header">

                                <div className="avatar profile-menu-avatar">

                                    {profile?.photoUrl ? (

                                        <img
                                            src={profile.photoUrl}
                                            alt={getDisplayName()}
                                            className="navbar-avatar-image"
                                        />

                                    ) : (

                                        getInitial()

                                    )}

                                </div>


                                <div className="profile-menu-info">

                                    <h4>
                                        {getDisplayName()}
                                    </h4>

                                    <p>
                                        {getJobTitle()}
                                    </p>

                                </div>

                            </div>


                            <div className="profile-menu-divider" />


                            {/* Profile */}

                            <button
                                type="button"
                                className="profile-menu-item"
                                onClick={handleProfile}
                            >

                                <PersonOutlineRoundedIcon />

                                <span>
                                    Profile
                                </span>

                            </button>


                            {/* Settings */}

                            <button
                                type="button"
                                className="profile-menu-item"
                                onClick={handleSettings}
                            >

                                <SettingsOutlinedIcon />

                                <span>
                                    Settings
                                </span>

                            </button>


                            <div className="profile-menu-divider" />


                            {/* Logout */}

                            <button
                                type="button"
                                className="profile-menu-item logout-item"
                                onClick={handleLogout}
                            >

                                <LogoutOutlinedIcon />

                                <span>
                                    Logout
                                </span>

                            </button>

                        </div>

                    )}

                </div>

            </div>

        </header>

    );

}

export default Navbar;