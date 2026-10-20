import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Alert, Box, Button, Card, CardContent, Chip, CircularProgress, MenuItem, Pagination,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography,
} from "@mui/material";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import { useAuth } from "../../../context/AuthContext";
import { getVendors } from "./VendorService";
import VendorForm from "./VendorForm";
import VendorArchiveDialog from "./VendorArchiveDialog";
import "./Vendors.css";
import "./VendorIntegration.css";

const pageSize = 25;

export default function Vendors() {
    const navigate = useNavigate();
    const { canWrite } = useAuth();
    const [search, setSearch] = useState("");
    const [status, setStatus] = useState("");
    const [page, setPage] = useState(1);
    const [revision, setRevision] = useState(0);
    const [result, setResult] = useState(null);
    const [summary, setSummary] = useState(null);
    const [form, setForm] = useState(null);
    const [archive, setArchive] = useState(null);
    const [notice, setNotice] = useState("");
    const key = JSON.stringify([page, search, status, revision]);
    const loading = result?.key !== key;
    const error = loading ? "" : result.error;
    const vendors = loading || error ? [] : result.data;
    const total = loading || error ? 0 : result.total;

    useEffect(() => {
        const controller = new AbortController();
        const timer = setTimeout(async () => {
            try {
                const data = await getVendors({ page, pageSize, search, isActive: status }, controller.signal);
                if (controller.signal.aborted) return;
                const lastPage = Math.max(1, Math.ceil(data.total / pageSize));
                if (page > lastPage) setPage(lastPage);
                else setResult({ key, ...data, error: "" });
            } catch (loadError) {
                if (!controller.signal.aborted) setResult({ key, data: [], total: 0, error: loadError.message });
            }
        }, search ? 250 : 0);
        return () => { clearTimeout(timer); controller.abort(); };
    }, [key, page, search, status, revision]);

    useEffect(() => {
        const controller = new AbortController();
        Promise.all([
            getVendors({ pageSize: 1 }, controller.signal),
            getVendors({ pageSize: 1, isActive: true }, controller.signal),
        ]).then(([all, active]) => {
            if (!controller.signal.aborted) setSummary({
                revision, total: all.total, active: active.total, inactive: Math.max(0, all.total - active.total),
            });
        }).catch(() => {
            if (!controller.signal.aborted) setSummary({ revision, error: true });
        });
        return () => controller.abort();
    }, [revision]);

    function refresh() { setRevision((previous) => previous + 1); }
    function saved() {
        const editing = Boolean(form?.vendor);
        setForm(null);
        setNotice(editing ? "Vendor updated." : "Vendor created.");
        refresh();
    }

    return <Box className="vendors-page">
        <Box className="vendors-header">
            <Box>
                <Typography component="h1" className="vendors-title">Vendors</Typography>
                <Typography className="vendors-subtitle">Manage your suppliers and vendors</Typography>
            </Box>
            <Box className="vendor-list-actions">
                <Button variant="outlined" startIcon={<RefreshRoundedIcon />} onClick={refresh} disabled={loading}>Refresh</Button>
                {canWrite && <Button variant="contained" startIcon={<AddRoundedIcon />}
                    onClick={() => setForm({ vendor: null })}>New Vendor</Button>}
            </Box>
        </Box>
        {notice && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setNotice("")}>{notice}</Alert>}
        <Box className="vendor-summary-grid vendor-connected-summary">
            {[["Total Vendors", "total"], ["Active Vendors", "active"], ["Inactive Vendors", "inactive"]].map(([label, field]) =>
                <Card key={field} className="vendor-summary-card"><CardContent>
                    <Typography className="vendor-summary-label">{label}</Typography>
                    <Typography className="vendor-summary-value">
                        {summary?.revision === revision && !summary.error ? summary[field] : "—"}
                    </Typography>
                </CardContent></Card>
            )}
        </Box>
        {summary?.revision === revision && summary.error && <Alert severity="warning" sx={{ mb: 2 }}
            action={<Button color="inherit" onClick={refresh}>Retry</Button>}>Vendor counts could not be loaded.</Alert>}
        <Card className="vendor-list-card"><CardContent className="vendor-list-content">
            <Box className="vendor-list-header">
                <Box>
                    <Typography component="h2" className="vendor-list-title">Vendor List</Typography>
                    <Typography className="vendor-list-subtitle">{loading ? "Loading vendors..." : `${total} matching vendors`}</Typography>
                </Box>
                <Box className="vendor-list-actions">
                    <TextField size="small" label="Search vendors" value={search}
                        slotProps={{ htmlInput: { maxLength: 200 } }}
                        onChange={(event) => { setSearch(event.target.value); setPage(1); }} />
                    <TextField select size="small" label="Status" value={status} sx={{ minWidth: 140 }}
                        onChange={(event) => { setStatus(event.target.value); setPage(1); }}>
                        <MenuItem value="">All vendors</MenuItem>
                        <MenuItem value="true">Active</MenuItem>
                        <MenuItem value="false">Inactive</MenuItem>
                    </TextField>
                </Box>
            </Box>
            {loading ? <Box className="vendor-feedback"><CircularProgress aria-label="Loading vendors" /></Box> :
                error ? <Alert severity="error" sx={{ m: 2 }} action={<Button color="inherit" onClick={refresh}>Retry</Button>}>{error}</Alert> :
                <>
                    <TableContainer tabIndex={0} role="region" aria-label="Vendor list">
                        <Table sx={{ minWidth: 800 }} aria-label="Vendors">
                            <TableHead><TableRow>
                                {["Vendor", "Contact Person", "Phone", "Branch", "Currency", "Status", "Actions"].map(
                                    (heading) => <TableCell key={heading}>{heading}</TableCell>
                                )}
                            </TableRow></TableHead>
                            <TableBody>
                                {vendors.length === 0 ? <TableRow><TableCell colSpan={7} align="center" sx={{ py: 5 }}>
                                    {search || status ? "No vendors match your filters." : "No vendors yet. Create your first vendor to get started."}
                                </TableCell></TableRow> : vendors.map((vendor) => <TableRow key={vendor.id} hover>
                                    <TableCell><Typography className="vendor-name">{vendor.name}</Typography>
                                        <Typography className="vendor-email">{vendor.email || vendor.companyName || "—"}</Typography></TableCell>
                                    <TableCell>{vendor.contactPerson || "—"}</TableCell>
                                    <TableCell>{vendor.phone || "—"}</TableCell>
                                    <TableCell>{vendor.branch}</TableCell>
                                    <TableCell>{vendor.currency}</TableCell>
                                    <TableCell><Chip size="small" label={vendor.isActive ? "Active" : "Inactive"}
                                        color={vendor.isActive ? "success" : "default"} /></TableCell>
                                    <TableCell><Box className="vendor-row-actions">
                                        <Button size="small" onClick={() => navigate(`/purchases/vendors/${vendor.id}`)}
                                            aria-label={`View ${vendor.name}`}>View</Button>
                                        {canWrite && <>
                                            <Button size="small" onClick={() => setForm({ vendor })}
                                                aria-label={`Edit ${vendor.name}`}>Edit</Button>
                                            {vendor.isActive && <Button size="small" color="warning"
                                                onClick={() => setArchive(vendor)} aria-label={`Archive ${vendor.name}`}>Archive</Button>}
                                        </>}
                                    </Box></TableCell>
                                </TableRow>)}
                            </TableBody>
                        </Table>
                    </TableContainer>
                    <Box className="vendor-pagination">
                        <Pagination page={page} count={Math.max(1, Math.ceil(total / pageSize))}
                            onChange={(_, nextPage) => setPage(nextPage)} />
                    </Box>
                </>
            }
        </CardContent></Card>
        {canWrite && form && <VendorForm vendor={form.vendor} onClose={() => setForm(null)} onSaved={saved} />}
        {canWrite && archive && <VendorArchiveDialog vendor={archive} onClose={() => setArchive(null)}
            onArchived={() => { setArchive(null); setNotice("Vendor archived."); refresh(); }} />}
    </Box>;
}
