import { MuiButtonMigration } from "../../ui/MuiCompat.jsx";
import { useEffect, useState } from "react";
import {
    useLocation,
    useNavigate,
} from "react-router-dom";

import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import NotificationsNoneRoundedIcon from "@mui/icons-material/NotificationsNoneRounded";
import MenuRoundedIcon from "@mui/icons-material/MenuRounded";
import DarkModeRoundedIcon from "@mui/icons-material/DarkModeRounded";
import LightModeRoundedIcon from "@mui/icons-material/LightModeRounded";
import PersonOutlineRoundedIcon from "@mui/icons-material/PersonOutlineRounded";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded";

import { getProfile } from "../../../Admin/Services/ProfileService";
import { useAuthenticatedProfilePhoto } from "../../../Admin/Services/ProfilePhotoService";
import LeaveService from "../../../Admin/Services/LeaveService";
import PolicyService from "../../../Admin/Services/PolicyService";
import { useColorMode } from "../../../context/ColorModeContext";
import axios from "axios";

import "./Navbar.css";
import { Box as MuiLayoutBox, Typography as MuiText } from "@mui/material";


/* ============================================================
   NAVBAR
   ============================================================ */

function Navbar({ title }) {

    const navigate = useNavigate();

    const location = useLocation();
    const { mode, toggleColorMode } = useColorMode();


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
    const profileImageUrl = useAuthenticatedProfilePhoto(profile?.photoUrl);


    /* ========================================================
       PAGE TITLE
       ======================================================== */

    const getPageTitle = () => {

        if (title) {
            return title;
        }


        const path =
            location.pathname.toLowerCase();

        if (path === "/mydashboard") {
            return "My Dashboard";
        }


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


        if (path.includes("approval")) {
            return "Approvals";
        }


        if (path.includes("document")) {
            return "Documents";
        }


        if (path.includes("policy")) {
            return "Company Policies";
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

    // Refresh approval updates and required policy acknowledgements while the
    // employee is signed in so newly published policies surface promptly.
    useEffect(() => {
        let mounted = true;
        let loadingNotifications = false;

        const loadNotifications = async () => {
            if (loadingNotifications) return;
            loadingNotifications = true;
            try {
                const [leaveResult, policyResult] = await Promise.allSettled([
                    LeaveService.getNotifications(),
                    PolicyService.getPolicies({ status: "Published" }),
                ]);
                const leaves = leaveResult.status === "fulfilled" ? leaveResult.value : [];
                const policies = policyResult.status === "fulfilled"
                    ? (Array.isArray(policyResult.value) ? policyResult.value : policyResult.value?.data ?? [])
                    : [];
                const employeeId = profile?.employeeId ?? profile?.employeeID ?? profile?.employee?.employeeId ?? profile?.employee?.employeeID;
                const employeeAzureId = profile?.azureEmployeeId ?? profile?.azureEmployeeID ?? profile?.employee?.azureEmployeeId ?? profile?.employee?.azureEmployeeID;
                const approvalBaseUrl = import.meta.env.VITE_APPROVAL_API_BASE_URL;
                let approvalRequests = [];
                if (approvalBaseUrl) {
                    try {
                        const response = await axios.get(`${approvalBaseUrl}/api/Approval/pending-for-me`);
                        const payload = response.data;
                        approvalRequests = Array.isArray(payload)
                            ? payload
                            : Array.isArray(payload?.data)
                                ? payload.data
                                : [];
                    } catch (error) {
                        console.warn("Approval notifications unavailable:", error);
                    }
                }
                const pendingApprovalsForEmployee = approvalRequests.map((approval) => ({ approval, isCurrentApprover: true }));
                const mappedApprovals = pendingApprovalsForEmployee.map(({ approval, isCurrentApprover }, index) => {
                    const requestId = approval?.approvalRequestId ?? approval?.ApprovalRequestId ?? approval?.id ?? approval?.Id ?? index;
                    const requestType = approval?.requestType ?? approval?.RequestType ?? "Approval request";
                    const requester = approval?.employeeName ?? approval?.EmployeeName ?? approval?.employee?.employeeName ?? approval?.employee?.EmployeeName;
                    const currentApprover = approval?.currentApproverName ?? approval?.CurrentApproverName ?? approval?.currentApprover?.employeeName ?? approval?.CurrentApprover?.EmployeeName;
                    return {
                        id: `approval-${requestId}`,
                        kind: "approval",
                        route: "/approvals?status=Pending",
                        title: isCurrentApprover ? `${requestType} awaiting your approval` : `${requestType} escalated`,
                        message: isCurrentApprover
                            ? (requester ? `Submitted by ${requester}. Review this request.` : "A request is waiting for your review.")
                            : `This request has moved to ${currentApprover || `Employee ${approval?.currentApproverId ?? approval?.CurrentApproverId ?? "the next approver"}`}.`,
                        date: approval?.requestedDate ?? approval?.RequestedDate ?? approval?.createdDate ?? approval?.CreatedDate,
                    };
                });
                const sameEmployee = (item) => {
                    const itemEmployee = item?.employee ?? item?.Employee ?? {};
                    const itemId = item?.employeeId ?? item?.employeeID ?? itemEmployee.employeeId ?? itemEmployee.employeeID;
                    const itemAzureId = item?.azureEmployeeId ?? item?.azureEmployeeID ?? itemEmployee.azureEmployeeId ?? itemEmployee.azureEmployeeID;
                    if (employeeId != null && itemId != null) return String(employeeId) === String(itemId);
                    if (employeeAzureId && itemAzureId) return String(employeeAzureId).toLowerCase() === String(itemAzureId).toLowerCase();
                    return false;
                };
                const employeeLeaves = leaves.filter(sameEmployee);
                const mappedLeaves = employeeLeaves.map((leave, index) => {
                    const status = String(leave.status ?? leave.leaveStatus ?? leave.approvalStatus ?? "Submitted");
                    const type = leave.leaveTypeName ?? leave.leaveType ?? "Leave request";
                    const normalized = status.toLowerCase();
                    const action = normalized.includes("approv") ? "approved" : normalized.includes("reject") ? "rejected" : "submitted";
                    return { id: leave.id ?? leave.leaveId ?? index, kind: "leave", route: "/leave/my-leave", title: action === "submitted" ? "Leave update" : "Approval update", message: `${type} was ${action}.`, status, date: leave.updatedAt ?? leave.createdAt ?? leave.requestDate };
                });
                const requiredPolicies = policies.filter((policy) =>
                    String(policy.status ?? policy.Status ?? "Published").toLowerCase() === "published" &&
                    (policy.acknowledgementRequired === true ||
                        policy.acknowledgementRequired === "true" ||
                        policy.AcknowledgementRequired === true ||
                        policy.AcknowledgementRequired === "true")
                );
                const policyAcknowledgements = await Promise.all(
                    requiredPolicies.map(async (policy, index) => {
                        const policyId = policy.policyId ?? policy.PolicyId ?? policy.id;
                        try {
                            const acknowledgement = await PolicyService.getAcknowledgement(policyId);
                            return { policy, policyId, index, acknowledged: acknowledgement?.acknowledged === true };
                        } catch {
                            return { policy, policyId, index, acknowledged: false };
                        }
                    })
                );
                const mappedPolicies = policyAcknowledgements
                    .filter(({ acknowledged }) => !acknowledged)
                    .map(({ policy, policyId, index }) => {
                        const revision = policy.version ?? policy.Version ?? policy.policyVersion ?? policy.PolicyVersion ?? policy.updatedAt ?? policy.UpdatedAt ?? policy.modifiedDate ?? policy.ModifiedDate ?? policy.createdAt ?? "current";
                        return {
                            id: `policy-${policyId ?? index}-${revision}`,
                            kind: "policy",
                            route: "/company-policies",
                            title: "Policy acknowledgement required",
                            message: `${policy.policyTitle ?? policy.PolicyTitle ?? policy.title ?? policy.name ?? "A company policy"} needs your acknowledgement.`,
                            date: policy.updatedAt ?? policy.UpdatedAt ?? policy.modifiedDate ?? policy.ModifiedDate ?? policy.createdAt ?? policy.CreatedAt,
                        };
                    });
                if (mounted) setNotifications([...mappedApprovals, ...mappedLeaves, ...mappedPolicies]);
            } catch (error) {
                if (mounted) setNotifications([]);
                console.warn("Navbar notifications unavailable:", error);
            } finally {
                loadingNotifications = false;
            }
        };

        if (profile) {
            loadNotifications();
            const interval = setInterval(() => {
                if (document.visibilityState !== "hidden") loadNotifications();
            }, 60000);
            const refreshOnVisible = () => {
                if (document.visibilityState !== "hidden") loadNotifications();
            };
            document.addEventListener("visibilitychange", refreshOnVisible);
            return () => {
                mounted = false;
                clearInterval(interval);
                document.removeEventListener("visibilitychange", refreshOnVisible);
            };
        }

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

    // Keep assigned pending approvals visible until their status changes. Read
    // state only controls the badge for other notification types.
    const pendingNotifications = notifications.filter(
        (notification) => notification.kind === "approval" || !readNotificationTimes[String(notification.id)]
    );

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

    const hasProfileImage = Boolean(profile?.photoUrl && profileImageUrl) && !profileImageError;


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

        navigate("/settings?tab=personal");

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

    const renderNotification = (notification) => {
        const notificationRoute = notification.kind === "leave"
            ? "/leave/my-leave"
            : notification.kind === "approval"
                ? "/approvals?status=Pending"
                : notification.kind === "policy"
                    ? "/company-policies"
                    : notification.route;

        return (
            <MuiButtonMigration
                key={notification.id}
                type="button"
                className="notification-item"
                onClick={() => {
                    markNotificationRead(notification.id);
                    setNotificationsOpen(false);
                    if (notificationRoute) navigate(notificationRoute);
                }}
            >
                <MuiText className="notification-item-title" component="span" variant="inherit">
                    {notification.title}
                </MuiText>
                <MuiText className="notification-item-message" component="span" variant="inherit">
                    {notification.message}
                </MuiText>
                {notification.date && (
                    <MuiText className="notification-item-date" component="span" variant="inherit">
                        {new Date(notification.date).toLocaleString()}
                    </MuiText>
                )}
            </MuiButtonMigration>
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

                <MuiButtonMigration
                    type="button"
                    className="icon-btn color-mode-btn"
                    aria-label={`Switch to ${mode === "dark" ? "light" : "dark"} mode`}
                    aria-pressed={mode === "dark"}
                    title={`Switch to ${mode === "dark" ? "light" : "dark"} mode`}
                    onClick={toggleColorMode}
                >
                    {mode === "dark" ? <LightModeRoundedIcon /> : <DarkModeRoundedIcon />}
                </MuiButtonMigration>


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

                    {pendingNotifications.length > 0 && <MuiText className="notification-count" component="span" variant="inherit">{pendingNotifications.length > 99 ? "99+" : pendingNotifications.length}</MuiText>}

                </MuiButtonMigration>

                {notificationsOpen && (
                    <MuiLayoutBox className="notifications-menu" role="menu" component="div">
                        <MuiLayoutBox className="notifications-header" component="div"><MuiText component="strong" variant="inherit">Notifications</MuiText><MuiText component="span" variant="inherit">{pendingNotifications.length} pending</MuiText></MuiLayoutBox>
                        {pendingNotifications.length === 0 ? (
                            <MuiLayoutBox className="notifications-empty" component="div">
                                <MuiLayoutBox className="notifications-empty-icon" component="span">
                                    <NotificationsNoneRoundedIcon />
                                </MuiLayoutBox>
                                <MuiText component="strong" variant="inherit">You’re all caught up</MuiText>
                                <MuiText component="span" variant="inherit">New updates will appear here.</MuiText>
                            </MuiLayoutBox>
                        ) : (
                            <>
                                <MuiLayoutBox className="notification-group-heading" component="div">
                                    <MuiText component="span" variant="inherit">Pending</MuiText>
                                    <MuiText component="span" variant="inherit">{pendingNotifications.length}</MuiText>
                                </MuiLayoutBox>
                                {pendingNotifications.map(renderNotification)}
                            </>
                        )}
                    </MuiLayoutBox>
                )}


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
                                    src={profileImageUrl}
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
                                            src={profileImageUrl}
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

                          


                            {/* PROFILE */}

                            <MuiButtonMigration
                                type="button"
                                className="profile-menu-item"
                                onClick={
                                    handleProfile
                                }
                            >

                                <PersonOutlineRoundedIcon />

                                <MuiText component="span" variant="inherit">
                                    Profile
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
