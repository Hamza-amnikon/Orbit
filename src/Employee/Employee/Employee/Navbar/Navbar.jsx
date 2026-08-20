import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
    AppBar,
    Toolbar,
    Box,
    Typography,
    TextField,
    InputAdornment,
    IconButton,
    Avatar,
    Menu,
    MenuItem,
    Divider,
    ListItemIcon,
} from "@mui/material";

import SearchIcon from "@mui/icons-material/Search";
import NotificationsNoneOutlinedIcon from "@mui/icons-material/NotificationsNoneOutlined";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import PersonIcon from "@mui/icons-material/Person";
import BusinessCenterIcon from "@mui/icons-material/BusinessCenter";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";

import { getProfile } from "../Services/ProfileService";

function Navbar() {

    const navigate = useNavigate();

    const [profile, setProfile] = useState(null);

    const [anchorEl, setAnchorEl] = useState(null);

    const menuOpen = Boolean(anchorEl);


    // =========================================================
    // LOAD PROFILE
    // =========================================================

    useEffect(() => {

        const loadProfile = async () => {

            try {

                const data = await getProfile();

                console.log(
                    "Navbar Profile:",
                    data
                );

                setProfile(data);

            } catch (err) {

                console.error(
                    "Navbar Profile Error:",
                    err
                );

            }

        };

        loadProfile();

    }, []);


    // =========================================================
    // PROFILE MENU
    // =========================================================

    const handleProfileClick = (event) => {

        setAnchorEl(event.currentTarget);

    };


    const handleProfileClose = () => {

        setAnchorEl(null);

    };


    // =========================================================
    // PROFILE REDIRECT
    // =========================================================

    const handleProfile = () => {

        handleProfileClose();

        navigate("/employee/profile");

    };


    // =========================================================
    // SERVICES REDIRECT
    // =========================================================

    const handleServices = () => {

        handleProfileClose();

        navigate("/employee/services");

    };


    // =========================================================
    // SETTINGS REDIRECT
    // =========================================================

    const handleSettings = () => {

        handleProfileClose();

        navigate("/employee/settings");

    };


    // =========================================================
    // GET INITIAL
    // =========================================================

    const getInitial = () => {

        if (!profile?.displayName) {
            return "?";
        }

        return profile.displayName
            .trim()
            .charAt(0)
            .toUpperCase();

    };


    // =========================================================
    // LOGOUT
    // =========================================================

    const handleLogout = () => {

        handleProfileClose();

        /*
         * Remove locally stored authentication data.
         *
         * Keep the keys that your application actually uses.
         */

        localStorage.removeItem("token");
        localStorage.removeItem("accessToken");
        localStorage.removeItem("user");
        localStorage.removeItem("profile");

        /*
         * Clear session storage as well.
         */

        sessionStorage.clear();

        /*
         * Redirect to login.
         */

        navigate("/login", {
            replace: true,
        });

    };


    // =========================================================
    // RENDER
    // =========================================================

    return (

        <AppBar
            position="sticky"
            elevation={0}
            sx={{
                backgroundColor: "#ffffff",
                color: "#111827",
                borderBottom:
                    "1px solid #e5e7eb",
                zIndex: 1100,
            }}
        >

            <Toolbar
                sx={{
                    minHeight:
                        "72px !important",

                    px: {
                        xs: 2,
                        sm: 3,
                        md: 3.5,
                    },

                    display: "flex",

                    justifyContent:
                        "space-between",
                }}
            >

                {/* =================================================
                    LEFT
                ================================================= */}

                <Box
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        flexShrink: 0,
                    }}
                >

                    <Typography
                        variant="h5"
                        sx={{
                            fontSize: {
                                xs: 20,
                                sm: 22,
                                md: 24,
                            },

                            fontWeight: 700,

                            color: "#111827",

                            letterSpacing:
                                "-0.4px",
                        }}
                    >
                        Dashboard
                    </Typography>

                </Box>


                {/* =================================================
                    RIGHT
                ================================================= */}

                <Box
                    sx={{
                        display: "flex",
                        alignItems: "center",

                        gap: {
                            xs: 0.7,
                            sm: 1,
                            md: 1.5,
                        },

                        ml: 2,
                    }}
                >

                    {/* =================================================
                        SEARCH
                    ================================================= */}

                    <TextField
                        placeholder="Search..."
                        size="small"
                        variant="outlined"

                        sx={{
                            width: {
                                xs: 42,
                                sm: 220,
                                md: 300,
                            },

                            "& .MuiOutlinedInput-root": {

                                height: 44,

                                borderRadius:
                                    "12px",

                                backgroundColor:
                                    "#f8fafc",

                                transition:
                                    "all 0.2s ease",

                                "& fieldset": {
                                    borderColor:
                                        "#e5e7eb",
                                },

                                "&:hover fieldset": {
                                    borderColor:
                                        "#cbd5e1",
                                },

                                "&.Mui-focused": {
                                    backgroundColor:
                                        "#ffffff",
                                },

                                "&.Mui-focused fieldset": {
                                    borderColor:
                                        "#2563eb",

                                    borderWidth:
                                        "1px",
                                },
                            },

                            "& input": {
                                fontSize: 14,

                                "&::placeholder": {
                                    color:
                                        "#94a3b8",

                                    opacity: 1,
                                },
                            },

                            "@media (max-width: 600px)": {

                                "& input": {
                                    display: "none",
                                },

                            },
                        }}

                        InputProps={{
                            startAdornment: (

                                <InputAdornment
                                    position="start"
                                >

                                    <SearchIcon
                                        sx={{
                                            fontSize: 21,
                                            color:
                                                "#64748b",
                                        }}
                                    />

                                </InputAdornment>

                            ),
                        }}
                    />


                    {/* =================================================
                        NOTIFICATION
                    ================================================= */}

                    <IconButton
                        aria-label="Notifications"

                        sx={{
                            width: 44,
                            height: 44,

                            borderRadius:
                                "12px",

                            border:
                                "1px solid #e5e7eb",

                            backgroundColor:
                                "#f8fafc",

                            color:
                                "#475569",

                            position:
                                "relative",

                            "&:hover": {

                                backgroundColor:
                                    "#eff6ff",

                                color:
                                    "#2563eb",

                                borderColor:
                                    "#bfdbfe",

                            },
                        }}
                    >

                        <NotificationsNoneOutlinedIcon
                            sx={{
                                fontSize: 22,
                            }}
                        />

                        {/* Notification dot */}

                        <Box
                            sx={{
                                position:
                                    "absolute",

                                top: 7,
                                right: 7,

                                width: 7,
                                height: 7,

                                borderRadius:
                                    "50%",

                                backgroundColor:
                                    "#ef4444",

                                border:
                                    "2px solid #ffffff",
                            }}
                        />

                    </IconButton>


                    {/* =================================================
                        PROFILE
                    ================================================= */}

                    <Box
                        onClick={
                            handleProfileClick
                        }

                        sx={{
                            display: "flex",

                            alignItems:
                                "center",

                            gap: 1,

                            ml: {
                                xs: 0.2,
                                sm: 0.5,
                            },

                            px: {
                                xs: 0.3,
                                sm: 0.8,
                            },

                            py: 0.5,

                            borderRadius:
                                "12px",

                            cursor:
                                "pointer",

                            transition:
                                "background-color 0.2s ease",

                            "&:hover": {
                                backgroundColor:
                                    "#f8fafc",
                            },
                        }}
                    >

                        {/* Avatar */}

                        <Avatar
                            src={
                                profile?.photoUrl ||
                                undefined
                            }

                            alt={
                                profile?.displayName ||
                                "Employee"
                            }

                            sx={{
                                width: 42,
                                height: 42,

                                fontSize: 17,

                                fontWeight: 700,

                                background:
                                    "linear-gradient(135deg, #2563eb, #1d4ed8)",

                                border:
                                    "2px solid #ffffff",

                                boxShadow:
                                    "0 2px 8px rgba(37, 99, 235, 0.22)",
                            }}
                        >

                            {!profile?.photoUrl &&
                                getInitial()}

                        </Avatar>


                        {/* Profile Information */}

                        <Box
                            sx={{
                                display: {
                                    xs: "none",
                                    sm: "block",
                                },

                                minWidth: 0,

                                maxWidth: {
                                    sm: 135,
                                    md: 165,
                                },
                            }}
                        >

                            <Typography
                                sx={{
                                    fontSize: 14,

                                    fontWeight: 600,

                                    color:
                                        "#111827",

                                    whiteSpace:
                                        "nowrap",

                                    overflow:
                                        "hidden",

                                    textOverflow:
                                        "ellipsis",
                                }}
                            >

                                {
                                    profile?.displayName ||
                                    "Employee"
                                }

                            </Typography>


                            <Typography
                                sx={{
                                    fontSize: 12,

                                    color:
                                        "#64748b",

                                    mt: "1px",

                                    whiteSpace:
                                        "nowrap",

                                    overflow:
                                        "hidden",

                                    textOverflow:
                                        "ellipsis",
                                }}
                            >

                                {
                                    profile?.jobTitle ||
                                    "Employee"
                                }

                            </Typography>

                        </Box>


                        {/* Arrow */}

                        <KeyboardArrowDownIcon
                            sx={{
                                color:
                                    "#64748b",

                                fontSize: 21,

                                display: {
                                    xs: "none",
                                    sm: "block",
                                },
                            }}
                        />

                    </Box>

                </Box>

            </Toolbar>


            {/* =====================================================
                PROFILE MENU
            ===================================================== */}

            <Menu
                anchorEl={anchorEl}

                open={menuOpen}

                onClose={
                    handleProfileClose
                }

                anchorOrigin={{
                    vertical: "bottom",
                    horizontal: "right",
                }}

                transformOrigin={{
                    vertical: "top",
                    horizontal: "right",
                }}

                PaperProps={{
                    elevation: 4,

                    sx: {
                        mt: 1,

                        minWidth: 230,

                        borderRadius:
                            "12px",

                        border:
                            "1px solid #e5e7eb",

                        overflow:
                            "hidden",
                    },
                }}
            >

                {/* =================================================
                    PROFILE HEADER
                ================================================= */}

                <Box
                    sx={{
                        px: 2,
                        py: 1.5,

                        display: "flex",

                        alignItems:
                            "center",

                        gap: 1.5,
                    }}
                >

                    <Avatar
                        src={
                            profile?.photoUrl ||
                            undefined
                        }

                        sx={{
                            width: 40,
                            height: 40,

                            background:
                                "linear-gradient(135deg, #2563eb, #1d4ed8)",

                            fontWeight: 700,
                        }}
                    >

                        {!profile?.photoUrl &&
                            getInitial()}

                    </Avatar>


                    <Box
                        sx={{
                            minWidth: 0,
                        }}
                    >

                        <Typography
                            sx={{
                                fontSize: 14,

                                fontWeight: 600,

                                whiteSpace:
                                    "nowrap",

                                overflow:
                                    "hidden",

                                textOverflow:
                                    "ellipsis",
                            }}
                        >

                            {
                                profile?.displayName ||
                                "Employee"
                            }

                        </Typography>


                        <Typography
                            sx={{
                                fontSize: 12,

                                color:
                                    "#64748b",

                                whiteSpace:
                                    "nowrap",

                                overflow:
                                    "hidden",

                                textOverflow:
                                    "ellipsis",
                            }}
                        >

                            {
                                profile?.jobTitle ||
                                "Employee"
                            }

                        </Typography>

                    </Box>

                </Box>


                <Divider />


                {/* =================================================
                    PROFILE
                ================================================= */}

                <MenuItem
                    onClick={
                        handleProfile
                    }
                >

                    <ListItemIcon>

                        <PersonIcon
                            fontSize="small"
                        />

                    </ListItemIcon>

                    Profile

                </MenuItem>


                {/* =================================================
                    SETTINGS
                ================================================= */}

                <MenuItem
                    onClick={
                        handleSettings
                    }
                >

                    <ListItemIcon>

                        <SettingsOutlinedIcon
                            fontSize="small"
                        />

                    </ListItemIcon>

                    Settings

                </MenuItem>


                <Divider />


                {/* =================================================
                    LOGOUT
                ================================================= */}

                <MenuItem
                    onClick={
                        handleLogout
                    }

                    sx={{
                        color:
                            "#dc2626",

                        "& .MuiListItemIcon-root": {
                            color:
                                "#dc2626",
                        },

                        "&:hover": {
                            backgroundColor:
                                "#fef2f2",
                        },
                    }}
                >

                    <ListItemIcon>

                        <LogoutOutlinedIcon
                            fontSize="small"
                        />

                    </ListItemIcon>

                    Logout

                </MenuItem>

            </Menu>

        </AppBar>

    );

}

export default Navbar;