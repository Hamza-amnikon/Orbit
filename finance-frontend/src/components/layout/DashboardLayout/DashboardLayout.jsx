import { useState } from "react";
import {
    Box,
    useMediaQuery,
    useTheme
} from "@mui/material";
import {
    Navigate,
    Outlet,
    useLocation
} from "react-router-dom";
import { useAuth } from "../../../live/AuthContext";
import Sidebar from "../../Sidebar";
import Header from "../../Header";
export default function DashboardLayout()
{
    const [menuPath, setMenuPath] = useState(null);
    const desktop = useMediaQuery(useTheme().breakpoints.up("lg"));
    const { user, loading } = useAuth();
    const {
        pathname
    } = useLocation();

    if (loading)
    {
        return <Box role="status">Checking sign-in…</Box>;
    }

    if (!user)
    {
        return <Navigate to="/login" replace />;
    }

    return <Box className="main-layout">
      <Sidebar
                desktop={desktop}
                open={menuPath === pathname}
                onClose={() => setMenuPath(null)}
            />
      <Header desktop={desktop} onMenuClick={() => setMenuPath(pathname)} />
      <Box component="main" className="finance-main"><Outlet /></Box>
    </Box>;
}
