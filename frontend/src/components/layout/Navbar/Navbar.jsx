import { MuiButtonMigration } from "../../ui/MuiCompat.jsx";
import { useEffect, useState } from "react";
import {
    useLocation,
    useNavigate,
} from "react-router-dom";

import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import NotificationsNoneRoundedIcon from "@mui/icons-material/NotificationsNoneRounded";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import MenuRoundedIcon from "@mui/icons-material/MenuRounded";
import PersonOutlineRoundedIcon from "@mui/icons-material/PersonOutlineRounded";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded";

import { getProfile } from "../../../Admin/Services/ProfileService";
import LeaveService from "../../../Admin/Services/LeaveService";
import PolicyService from "../../../Admin/Services/PolicyService";

import "./Navbar.css";
import { Box as MuiLayoutBox, Typography as MuiText } from "@mui/material";


/* ============================================================
   NAVBAR
   ============================================================ */

function Navbar({ title }) {

    const navigate = useNavigate();

    const location = useLocation();


    /* ========================================================
       STATE
       ======================================================== */

    const [profile, setProfile] = useState(null);

    const [menuOpen, setMenuOpen] = useState(false);

    const [notificationsOpen, setNotificationsOpen] = useState(false);

    const [notifications, setNotifications] = useState([]);

    const [readNotificationTimes, setReadNotificationTimes] = useState({});

    // Tracks whether the profile image failed to load.
    // If it fails, the avatar falls back to the employee's first initial.
    const [profileImageError, setProfileImageError] = useState(false);


    /* ========================================================
       PAGE TITLE
       ======================================================== */

    const getPageTitle = () => {

        if (title) {
            return title;
        }


        const path =
            location.pathname.toLowerCase();


        if (
            path === "/" ||
            path === "/dashboard"
        ) {
            return "Dashboard";
        }


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
            return "Profile";
        }


        if (path.includes("permission")) {
            return "Permission";
        }


        if (path.includes("reimbursement")) {
            return "Reimbursements";
        }


        if (path.includes("profile")) {
            return "Profile";
        }


        if (path.includes("team")) {
            return "Team";
        }


        return "Dashboard";
    };


    /* ========================================================
       LOAD PROFILE
       ======================================================== */

    useEffect(() => {

        let mounted = true;


        const loadProfile = async () => {

            try {

                const data =
                    await getProfile();


                console.log(
                    "Navbar Profile:",
                    data
                );


                if (mounted) {

                    setProfile(data);

                }

            }
            catch (error) {

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

    // Notifications are loaded from the signed-in employee's leave records.
    // No placeholder notifications are shown when the employee has no records.
    useEffect(() => {
        let mounted = true;

        const loadNotifications = async () => {
            try {
                const [leaveResult, policyResult] = await Promise.allSettled([
                    LeaveService.getLeaves(),
                    PolicyService.getPolicies(),
                ]);
                const leaves = leaveResult.status === "fulfilled" ? leaveResult.value : [];
                const policies = policyResult.status === "fulfilled"
                    ? (Array.isArray(policyResult.value) ? policyResult.value : policyResult.value?.data ?? [])
                    : [];
                const employeeId = profile?.employeeId ?? profile?.employeeID ?? profile?.employee?.employeeId ?? profile?.employee?.employeeID;
                const employeeAzureId = profile?.azureEmployeeId ?? profile?.azureEmployeeID ?? profile?.employee?.azureEmployeeId ?? profile?.employee?.azureEmployeeID;
                const sameEmployee = (item) => {
                    const itemEmployee = item?.employee ?? item?.Employee ?? {};
                    const itemId = item?.employeeId ?? item?.employeeID ?? itemEmployee.employeeId ?? itemEmployee.employeeID;
                    const itemAzureId = item?.azureEmployeeId ?? item?.azureEmployeeID ?? itemEmployee.azureEmployeeId ?? itemEmployee.azureEmployeeID;
                    if (employeeId != null && itemId != null) return String(employeeId) === String(itemId);
                    if (employeeAzureId && itemAzureId) return String(employeeAzureId).toLowerCase() === String(itemAzureId).toLowerCase();
                    return false;
                };
                const employeeLeaves = leaves.filter(sameEmployee).slice(0, 10);
                const mappedLeaves = employeeLeaves.map((leave, index) => {
                    const status = String(leave.status ?? leave.leaveStatus ?? leave.approvalStatus ?? "Submitted");
                    const type = leave.leaveTypeName ?? leave.leaveType ?? "Leave request";
                    const normalized = status.toLowerCase();
                    const action = normalized.includes("approv") ? "approved" : normalized.includes("reject") ? "rejected" : "submitted";
                    return { id: leave.id ?? leave.leaveId ?? index, route: "/leave", title: action === "submitted" ? "Leave update" : "Approval update", message: `${type} was ${action}.`, status, date: leave.updatedAt ?? leave.createdAt ?? leave.requestDate };
                });
                const mappedPolicies = policies.slice(0, 5).map((policy, index) => ({
                    id: `policy-${policy.id ?? policy.policyId ?? index}`,
                    route: "/company-policies",
                    title: "Policy update",
                    message: `${policy.title ?? policy.policyTitle ?? policy.name ?? "A company policy"} was updated.`,
                    date: policy.updatedAt ?? policy.modifiedDate ?? policy.createdAt,
                }));
                if (mounted) setNotifications([...mappedLeaves, ...mappedPolicies]);
            } catch (error) {
                if (mounted) setNotifications([]);
                console.warn("Navbar notifications unavailable:", error);
            }
        };

        if (profile) loadNotifications();
        return () => { mounted = false; };
    }, [profile]);

    useEffect(() => {
        if (!profile) return;
        const employeeKey = profile?.employeeId ?? profile?.employeeID ?? profile?.azureEmployeeId ?? profile?.azureEmployeeID ?? profile?.userName ?? "employee";
        try {
            const saved = JSON.parse(localStorage.getItem(`oya:read-notifications:${employeeKey}`) || "{}");
            const readTimes = Array.isArray(saved)
                ? Object.fromEntries(saved.map((id) => [String(id), Date.now()]))
                : saved;
            setReadNotificationTimes(readTimes && typeof readTimes === "object" ? readTimes : {});
        } catch {
            setReadNotificationTimes({});
        }
    }, [profile]);

    const visibleNotifications = notifications.filter((notification) => {
        const readAt = Number(readNotificationTimes[String(notification.id)] || 0);
        return !readAt;
    });

    const unreadNotifications = visibleNotifications.filter((notification) => !readNotificationTimes[String(notification.id)]);

    const markNotificationRead = (notificationId) => {
        const id = String(notificationId);
        const next = { ...readNotificationTimes, [id]: Date.now() };
        setReadNotificationTimes(next);
        const employeeKey = profile?.employeeId ?? profile?.employeeID ?? profile?.azureEmployeeId ?? profile?.azureEmployeeID ?? profile?.userName ?? "employee";
        localStorage.setItem(`oya:read-notifications:${employeeKey}`, JSON.stringify(next));
    };


    /* ========================================================
       RESET PROFILE IMAGE ERROR
       ======================================================== */

    useEffect(() => {

        setProfileImageError(false);

    }, [profile?.photoUrl]);


    /* ========================================================
       GET PROFILE NAME
       ======================================================== */

    const getProfileName = () => {

        const name =
            profile?.displayName ||
            profile?.name ||
            profile?.fullName ||
            profile?.employeeName ||
            profile?.userName ||
            "";

        return String(name).trim();

    };


    /* ========================================================
       INITIAL
       
       If there is no profile image,
       show the first letter of the employee name.
       ======================================================== */

    const getInitial = () => {

        const name = getProfileName();


        if (!name) {
            return "?";
        }


        return name
            .charAt(0)
            .toUpperCase();

    };


    /* ========================================================
       DISPLAY NAME
       ======================================================== */

    const getDisplayName = () => {

        return (
            profile?.displayName ||
            profile?.name ||
            profile?.fullName ||
            profile?.employeeName ||
            profile?.userName ||
            "Employee"
        );

    };


    /* ========================================================
       JOB TITLE
       ======================================================== */

    const getJobTitle = () => {

        return (
            profile?.jobTitle ||
            profile?.designation ||
            profile?.role ||
            "Employee"
        );

    };


    /* ========================================================
       CHECK PROFILE IMAGE
       ======================================================== */

    const hasProfileImage =
        Boolean(
            profile?.photoUrl &&
            String(profile.photoUrl).trim()
        ) && !profileImageError;


    /* ========================================================
       PROFILE MENU
       ======================================================== */

    const handleProfileMenu = () => {

        setMenuOpen(
            (previous) =>
                !previous
        );

    };


    const closeMenu = () => {

        setMenuOpen(false);

    };


    /* ========================================================
       PROFILE
       ======================================================== */

    const handleProfile = () => {

        closeMenu();

        navigate(
            "/employee/profile"
        );

    };


    /* ========================================================
       SETTINGS
       ======================================================== */

    const handleSettings = () => {

        closeMenu();

        navigate("/settings");

    };


    /* ========================================================
       LOGOUT
       ======================================================== */

    const handleLogout = () => {

        closeMenu();


        localStorage.removeItem(
            "token"
        );

        localStorage.removeItem(
            "accessToken"
        );

        localStorage.removeItem(
            "user"
        );

        localStorage.removeItem(
            "profile"
        );


        sessionStorage.clear();


        navigate(
            "/login",
            {
                replace: true,
            }
        );

    };


    /* ========================================================
       MENU TOGGLE
       ======================================================== */

    const handleMenu = () => {

        window.dispatchEvent(
            new CustomEvent(
                "oya:toggle-sidebar"
            )
        );

    };


    /* ========================================================
       SEARCH
       ======================================================== */

    const handleSearch = (
        event
    ) => {

        const value =
            event.target.value;


        console.log(
            "Search:",
            value
        );

    };


    /* ========================================================
       RENDER
       ======================================================== */

    return (

        <MuiLayoutBox className="navbar" component="header">


            {/* ==================================================
                LEFT SIDE
            ================================================== */}

            <MuiLayoutBox className="navbar-left" component="div">


                {/* MENU BUTTON */}

                <MuiButtonMigration
                    type="button"
                    className="menu-btn"
                    aria-label="Toggle navigation"
                    onClick={handleMenu}
                >

                    <MenuRoundedIcon />

                </MuiButtonMigration>


                {/* SEPARATOR */}

                <MuiLayoutBox className="navbar-separator"  component="div"/>


                {/* PAGE TITLE */}

                <MuiLayoutBox className="navbar-page-title" component="div">

                    <MuiText component="h2" variant="h5">
                        {getPageTitle()}
                    </MuiText>

                </MuiLayoutBox>


            </MuiLayoutBox>


            {/* ==================================================
                RIGHT SIDE
            ================================================== */}

            <MuiLayoutBox className="navbar-right" component="div">


                {/* =================================================
                    NOTIFICATIONS
                ================================================= */}

                <MuiButtonMigration
                    type="button"
                    className="icon-btn notification-btn"
                    aria-label="Notifications"
                    onClick={() => setNotificationsOpen((open) => !open)}
                    aria-expanded={notificationsOpen}
                >

                    <NotificationsNoneRoundedIcon />

                    {unreadNotifications.length > 0 && <MuiText className="notification-count" component="span" variant="inherit">{unreadNotifications.length > 99 ? "99+" : unreadNotifications.length}</MuiText>}

                </MuiButtonMigration>

                {notificationsOpen && (
                    <MuiLayoutBox className="notifications-menu" role="menu" component="div">
                        <MuiLayoutBox className="notifications-header" component="div"><MuiText component="strong" variant="inherit">Notifications</MuiText><MuiText component="span" variant="inherit">{unreadNotifications.length} unread</MuiText></MuiLayoutBox>
                        {visibleNotifications.length === 0 ? (
                            <MuiLayoutBox className="notifications-empty" component="div">You’re all caught up</MuiLayoutBox>
                        ) : visibleNotifications.map((notification) => {
                            const isRead = Boolean(readNotificationTimes[String(notification.id)]);
                            return <MuiButtonMigration key={notification.id} type="button" className={`notification-item ${isRead ? "notification-read" : ""}`} onClick={() => { markNotificationRead(notification.id); setNotifications((current) => current.filter((item) => String(item.id) !== String(notification.id))); setNotificationsOpen(false); navigate(notification.route || "/leave"); }}>
                                <MuiText className="notification-item-title" component="span" variant="inherit">{notification.title}</MuiText>
                                <MuiText className="notification-item-message" component="span" variant="inherit">{notification.message}</MuiText>
                                {notification.date && <MuiText className="notification-item-date" component="span" variant="inherit">{new Date(notification.date).toLocaleString()}</MuiText>}
                            </MuiButtonMigration>;
                        })}
                    </MuiLayoutBox>
                )}


                {/* =================================================
                    SETTINGS
                ================================================= */}

                <MuiButtonMigration
                    type="button"
                    className="icon-btn settings-btn"
                    aria-label="Settings"
                    onClick={handleSettings}
                >

                    <SettingsOutlinedIcon />

                </MuiButtonMigration>


                {/* =================================================
                    VERTICAL SEPARATOR
                ================================================= */}

                <MuiLayoutBox className="navbar-right-separator"  component="div"/>


                {/* =================================================
                    PROFILE
                ================================================= */}

                <MuiLayoutBox className="profile-wrapper" component="div">


                    <MuiButtonMigration
                        type="button"
                        className={`user-profile ${
                            menuOpen
                                ? "profile-active"
                                : ""
                        }`}
                        onClick={
                            handleProfileMenu
                        }
                        aria-expanded={
                            menuOpen
                        }
                        aria-haspopup="menu"
                        aria-label={`Open profile menu for ${getDisplayName()}`}
                    >


                        {/* =================================================
                            AVATAR
                        ================================================= */}

                        <MuiLayoutBox className="avatar" component="div">

                            {hasProfileImage ? (

                                <MuiLayoutBox
                                    src={profile.photoUrl}
                                    alt=""
                                    className="navbar-avatar-image"
                                    onError={() => {
                                        setProfileImageError(true);
                                    }}
                                 component="img"/>

                            ) : (

                                <MuiText className="navbar-avatar-initial" component="span" variant="inherit">
                                    {getInitial()}
                                </MuiText>

                            )}

                        </MuiLayoutBox>


                        {/* =================================================
                            USER INFORMATION
                        ================================================= */}

                        <MuiLayoutBox className="user-info" component="div">

                            <MuiText component="h4" variant="subtitle1">
                                {getDisplayName()}
                            </MuiText>

                            <MuiText component="p" variant="body1">
                                {getJobTitle()}
                            </MuiText>

                        </MuiLayoutBox>


                        {/* =================================================
                            ARROW
                        ================================================= */}

                        <KeyboardArrowDownRoundedIcon
                            className="profile-arrow"
                        />

                    </MuiButtonMigration>


                    {/* =================================================
                        PROFILE DROPDOWN
                    ================================================= */}

                    {menuOpen && (

                        <MuiLayoutBox
                            className="profile-menu"
                            role="menu"
                         component="div">


                            {/* PROFILE HEADER */}

                            <MuiLayoutBox className="profile-menu-header" component="div">

                                <MuiLayoutBox className="avatar profile-menu-avatar" component="div">

                                    {hasProfileImage ? (

                                        <MuiLayoutBox
                                            src={profile.photoUrl}
                                            alt=""
                                            className="navbar-avatar-image"
                                            onError={() => {
                                                setProfileImageError(true);
                                            }}
                                         component="img"/>

                                    ) : (

                                        <MuiText className="navbar-avatar-initial" component="span" variant="inherit">
                                            {getInitial()}
                                        </MuiText>

                                    )}

                                </MuiLayoutBox>


                                <MuiLayoutBox className="profile-menu-info" component="div">

                                    <MuiText component="h4" variant="subtitle1">
                                        {getDisplayName()}
                                    </MuiText>

                                    <MuiText component="p" variant="body1">
                                        {getJobTitle()}
                                    </MuiText>

                                </MuiLayoutBox>

                            </MuiLayoutBox>


                            <MuiLayoutBox className="profile-menu-divider"  component="div"/>


                            {/* PROFILE */}

                          


                            {/* SETTINGS */}

                            <MuiButtonMigration
                                type="button"
                                className="profile-menu-item"
                                onClick={
                                    handleSettings
                                }
                            >

                                <SettingsOutlinedIcon />

                                <MuiText component="span" variant="inherit">
                                    Settings
                                </MuiText>

                            </MuiButtonMigration>


                            <MuiLayoutBox className="profile-menu-divider"  component="div"/>


                            {/* LOGOUT */}

                            <MuiButtonMigration
                                type="button"
                                className="profile-menu-item logout-item"
                                onClick={
                                    handleLogout
                                }
                            >

                                <LogoutOutlinedIcon />

                                <MuiText component="span" variant="inherit">
                                    Logout
                                </MuiText>

                            </MuiButtonMigration>


                        </MuiLayoutBox>

                    )}


                </MuiLayoutBox>


            </MuiLayoutBox>

        </MuiLayoutBox>

    );

}


export default Navbar;
