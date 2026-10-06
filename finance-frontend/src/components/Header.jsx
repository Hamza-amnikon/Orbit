import { AppBar, Toolbar, Box, Typography, IconButton, Avatar, Autocomplete, TextField } from "@mui/material";
import MenuRoundedIcon from "@mui/icons-material/MenuRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import { useLocation, useNavigate } from "react-router-dom";

const pages = [
  ["Dashboard", "/"], ["Customers", "/sales/customers"], ["Estimates", "/sales/estimates"],
  ["Sales Orders", "/sales/orders"], ["Invoices", "/sales/invoices"],
  ["Credit Notes", "/sales/credit-notes"], ["Payments Received", "/sales/payments"],
  ["Vendors", "/purchases/vendors"], ["Purchase Orders", "/purchases/orders"],
  ["Bills", "/purchases/bills"], ["Vendor Credits", "/purchases/vendor-credits"],
  ["Payments Made", "/purchases/payments"],
].map(([label, path]) => ({ label, path }));

export default function Header({ desktop, onMenuClick }) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const current = pages.find((page) => page.path === pathname);
  return (
    <AppBar position="fixed" elevation={0} className="finance-header" sx={{
      background: "white", color: "#111827", borderBottom: "1px solid #e5eaf1",
      ml: desktop ? "228px" : 0, width: desktop ? "calc(100% - 228px)" : "100%",
    }}>
      <Toolbar sx={{ minHeight: "70px !important", px: { xs: 2, md: 3 }, gap: 2 }}>
        {!desktop && <IconButton aria-label="Open navigation" onClick={onMenuClick}><MenuRoundedIcon /></IconButton>}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography sx={{ fontSize: 16, fontWeight: 700 }} noWrap>{current?.label || "Finance"}</Typography>
          <Typography sx={{ fontSize: 11, color: "text.secondary" }}>Finance workspace</Typography>
        </Box>
        <Autocomplete options={pages} value={null} blurOnSelect
          onChange={(_, page) => { if (page) navigate(page.path); }}
          sx={{ width: 260, display: { xs: "none", sm: "block" } }}
          renderInput={(params) => <TextField {...params} size="small" placeholder="Find a finance page…"
            slotProps={{ ...params.slotProps, input: { ...params.slotProps.input, startAdornment: <SearchRoundedIcon sx={{ mr: 1, color: "#94a3b8", fontSize: 20 }} /> }, htmlInput: { ...params.slotProps.htmlInput, "aria-label": "Find a finance page" } }} />}
        />
        <Avatar sx={{ width: 38, height: 38, bgcolor: "#eff6ff", color: "#2563eb", fontSize: 13, fontWeight: 700 }}>AD</Avatar>
        <Box sx={{ display: { xs: "none", md: "block" } }}>
          <Typography sx={{ fontSize: 13, fontWeight: 600 }}>Admin</Typography>
          <Typography sx={{ fontSize: 11, color: "text.secondary" }}>Administrator</Typography>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
