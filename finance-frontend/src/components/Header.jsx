import { AppBar, Toolbar, Box, Typography, IconButton, Avatar, Autocomplete, TextField, Button } from "@mui/material";
import { useAuth } from "../live/AuthContext";
import MenuRoundedIcon from "@mui/icons-material/MenuRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import { useLocation, useNavigate } from "react-router-dom";
import { adminModuleRoutes } from "../admin/moduleRoutes";
import ThemeToggle from "./ThemeToggle";
import { previewMode } from "../services/preview";

const pages = [
  ["Dashboard", "/"], ["Clients", "/sales/clients"], ["Estimates", "/sales/estimates"],
  ["Sales Orders", "/sales/orders"], ["Invoices", "/sales/invoices"],
  ["Credit Notes", "/sales/credit-notes"], ["Payments Received", "/sales/payments"],
  ["Vendors", "/purchases/vendors"], ["Purchase Orders", "/purchases/orders"],
  ["Bills", "/purchases/bills"], ["Vendor Credits", "/purchases/vendor-credits"],
  ["Payments Made", "/purchases/payments"],
  ...adminModuleRoutes.map(([label, path]) => [label, path]),
].map(([label, path]) => ({ label, path }));

export default function Header({ desktop, onMenuClick }) {
  const { user, logout } = useAuth();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const vendorPage = pathname === "/purchases/vendors" || pathname.startsWith("/purchases/vendors/");
  const billPage = pathname === "/purchases/bills" || pathname.startsWith("/purchases/bills/");
  const purchaseOrderPage = pathname === "/purchases/orders" || pathname.startsWith("/purchases/orders/");
  const current = pages.find((page) => page.path === pathname) ||
    (vendorPage ? pages.find((page) => page.path === "/purchases/vendors") :
      purchaseOrderPage ? pages.find((page) => page.path === "/purchases/orders") :
      billPage ? pages.find((page) => page.path === "/purchases/bills") : undefined);
  return (
    <AppBar position="fixed" elevation={0} className="finance-header" sx={{
      bgcolor: "background.paper", color: "text.primary", borderBottom: "1px solid", borderColor: "divider",
      ml: desktop ? "228px" : 0, width: desktop ? "calc(100% - 228px)" : "100%",
    }}>
      <Toolbar sx={{ minHeight: "70px !important", px: { xs: 2, md: 3 }, gap: 2 }}>
        {!desktop && <IconButton aria-label="Open navigation" onClick={onMenuClick}><MenuRoundedIcon /></IconButton>}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography sx={{ fontSize: 16, fontWeight: 700 }} noWrap>{current?.label || "Finance"}</Typography>
          <Typography sx={{ fontSize: 11, color: "text.secondary" }}>{vendorPage ? "Vendor management" : purchaseOrderPage ? "Purchase order management" : billPage ? "Manage vendor bills" : previewMode ? "Frontend preview · API not connected" : "Finance workspace"}</Typography>
        </Box>
        <Autocomplete options={pages} value={null} blurOnSelect
          onChange={(_, page) => { if (page) navigate(page.path); }}
          sx={{ width: 260, display: { xs: "none", sm: "block" } }}
          renderInput={(params) => <TextField {...params} size="small" placeholder="Find a finance page…"
            slotProps={{ ...params.slotProps, input: { ...params.slotProps.input, startAdornment: <SearchRoundedIcon sx={{ mr: 1, color: "#94a3b8", fontSize: 20 }} /> }, htmlInput: { ...params.slotProps.htmlInput, "aria-label": "Find a finance page" } }} />}
        />
        <ThemeToggle />
        <Avatar sx={{ width: 38, height: 38, bgcolor: "action.selected", color: "primary.main", fontSize: 13, fontWeight: 700 }}>{user.name?.slice(0, 2).toUpperCase()}</Avatar>
        <Box sx={{ display: { xs: "none", md: "block" } }}>
          <Typography sx={{ fontSize: 13, fontWeight: 600 }}>{user.name}</Typography>
          <Typography sx={{ fontSize: 11, color: "text.secondary" }}>{user.role}</Typography>
        </Box>
        {!previewMode && <Button size="small" onClick={logout}>Sign out</Button>}
      </Toolbar>
    </AppBar>
  );
}
