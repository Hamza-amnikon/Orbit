import { useState } from "react";
import { Box, useMediaQuery, useTheme } from "@mui/material";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";

export default function MainLayout() {
  const [menuPath, setMenuPath] = useState(null);
  const desktop = useMediaQuery(useTheme().breakpoints.up("lg"));
  const { pathname } = useLocation();

  return (
    <Box className="main-layout">
      <Sidebar desktop={desktop} open={menuPath === pathname} onClose={() => setMenuPath(null)} />
      <Header desktop={desktop} onMenuClick={() => setMenuPath(pathname)} />
      <Box component="main" className="finance-main"><Outlet /></Box>
    </Box>
  );
}
