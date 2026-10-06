import React from "react";
import { Box } from "@mui/material";
import { Outlet } from "react-router-dom";

import Sidebar from "../components/Sidebar";
import Header from "../components/Header";

const MainLayout = () => {
    return (
        <Box className="main-layout">

            <Sidebar />

            <Header />

            <Box
                component="main"
                sx={{
                    marginLeft: "250px",
                    paddingTop: "70px",
                    width: "calc(100% - 250px)",
                    minHeight: "100vh",
                    boxSizing: "border-box",
                }}
            >
                <Outlet />
            </Box>

        </Box>
    );
};

export default MainLayout;