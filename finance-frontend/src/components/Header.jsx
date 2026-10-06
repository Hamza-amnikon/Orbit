import React from "react";
import {
    AppBar,
    Toolbar,
    Box,
    Typography,
    IconButton,
    Avatar,
    Badge,
    InputBase,
} from "@mui/material";

import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import NotificationsNoneRoundedIcon from "@mui/icons-material/NotificationsNoneRounded";
import HelpOutlineRoundedIcon from "@mui/icons-material/HelpOutlineRounded";

const Header = () => {
    return (
        <AppBar
            position="fixed"
            elevation={0}
            sx={{
                backgroundColor: "#ffffff",
                color: "#1f2937",
                borderBottom: "1px solid #e5e7eb",
                marginLeft: "250px",
                width: "calc(100% - 250px)",
            }}
        >
            <Toolbar
                sx={{
                    minHeight: "70px !important",
                    px: 3,
                    display: "flex",
                    justifyContent: "space-between",
                }}
            >
                {/* Left */}
                <Typography
                    sx={{
                        fontSize: 18,
                        fontWeight: 600,
                    }}
                >
                    Finance
                </Typography>

                {/* Right */}
                <Box
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                    }}
                >
                    {/* Search */}
                    <Box
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            width: 250,
                            height: 40,
                            px: 1.5,
                            border: "1px solid #e5e7eb",
                            borderRadius: "8px",
                            backgroundColor: "#f9fafb",
                        }}
                    >
                        <SearchRoundedIcon
                            sx={{
                                color: "#6b7280",
                                mr: 1,
                            }}
                        />

                        <InputBase
                            placeholder="Search..."
                            sx={{
                                fontSize: 14,
                                width: "100%",
                            }}
                        />
                    </Box>

                    {/* Notifications */}
                    <IconButton>
                        <Badge
                            badgeContent={3}
                            color="error"
                        >
                            <NotificationsNoneRoundedIcon />
                        </Badge>
                    </IconButton>

                    {/* Help */}
                    <IconButton>
                        <HelpOutlineRoundedIcon />
                    </IconButton>

                    {/* User */}
                    <Box
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                            ml: 1,
                        }}
                    >
                        <Avatar
                            sx={{
                                width: 38,
                                height: 38,
                                backgroundColor: "#1976d2",
                                fontSize: 14,
                                fontWeight: 600,
                            }}
                        >
                            AD
                        </Avatar>

                        <Box>
                            <Typography
                                sx={{
                                    fontSize: 14,
                                    fontWeight: 600,
                                    lineHeight: 1.2,
                                }}
                            >
                                Admin
                            </Typography>

                            <Typography
                                sx={{
                                    fontSize: 12,
                                    color: "#6b7280",
                                }}
                            >
                                Administrator
                            </Typography>
                        </Box>
                    </Box>
                </Box>
            </Toolbar>
        </AppBar>
    );
};

export default Header;