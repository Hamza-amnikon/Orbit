import { AppBar, Toolbar, Box, Typography, IconButton, Autocomplete, TextField } from "@mui/material";
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
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const vendorPage = pathname === "/purchases/vendors" || pathname.startsWith("/purchases/vendors/");
  const billPage = pathname === "/purchases/bills" || pathname.startsWith("/purchases/bills/");
  const purchaseOrderPage = pathname === "/purchases/orders" || pathname.startsWith("/purchases/orders/");
  const dashboardPage = pathname === "/";
  const exchangeRatePage = pathname === "/settings/exchange-rates";
  const current = pages.find((page) => page.path === pathname) ||
    (vendorPage ? pages.find((page) => page.path === "/purchases/vendors") :
      purchaseOrderPage ? pages.find((page) => page.path === "/purchases/orders") :
      billPage ? pages.find((page) => page.path === "/purchases/bills") :
      pathname.startsWith("/purchases/payments/") ? pages.find((page) => page.path === "/purchases/payments") : undefined);
  const subtitle = exchangeRatePage
    ? "Daily exchange-rate monitoring · Read only"
    : vendorPage
    ? "Vendor management"
    : purchaseOrderPage
      ? "Purchase order management"
      : billPage
        ? "Manage vendor bills"
        : pathname.startsWith("/purchases/payments")
          ? "Manage vendor payments"
          : pathname.startsWith("/purchases/vendor-credits")
            ? "Manage vendor credits"
            : pathname === "/expenses"
              ? "Manage company expenses"
              : dashboardPage && previewMode
                ? "Dashboard uses live totals · Other pages use preview data"
                : previewMode
                  ? "Frontend preview · API not connected"
                  : "Finance workspace";
  return (
    <AppBar position="fixed" elevation={0} className="finance-header" sx={{
      bgcolor: "background.paper", color: "text.primary", borderBottom: "1px solid", borderColor: "divider",
      ml: desktop ? "228px" : 0, width: desktop ? "calc(100% - 228px)" : "100%",
    }}>
      <Toolbar sx={{ minHeight: "70px !important", px: { xs: 2, md: 3 }, gap: 2 }}>
        {!desktop && <IconButton aria-label="Open navigation" onClick={onMenuClick}><MenuRoundedIcon /></IconButton>}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography sx={{ fontSize: 16, fontWeight: 700 }} noWrap>{current?.label || "Finance"}</Typography>
          <Typography sx={{ fontSize: 11, color: "text.secondary" }}>
            {subtitle}
          </Typography>
        </Box>
        <Autocomplete options={pages} value={null} blurOnSelect
          onChange={(_, page) => { if (page) navigate(page.path); }}
          sx={{ width: 260, display: { xs: "none", sm: "block" } }}
          renderInput={(params) => <TextField {...params} size="small" placeholder="Find a finance page…"
            slotProps={{ ...params.slotProps, input: { ...params.slotProps.input, startAdornment: <SearchRoundedIcon sx={{ mr: 1, color: "#94a3b8", fontSize: 20 }} /> }, htmlInput: { ...params.slotProps.htmlInput, "aria-label": "Find a finance page" } }} />}
        />
        <ThemeToggle />
      </Toolbar>
    </AppBar>
  );
}

