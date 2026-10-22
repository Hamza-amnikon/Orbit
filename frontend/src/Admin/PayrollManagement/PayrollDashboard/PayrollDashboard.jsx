import { useCallback, useEffect, useMemo, useState } from "react";
import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    CircularProgress,
    Grid,
    IconButton,
    MenuItem,
    Select,
    Typography,
} from "@mui/material";
import AccountBalanceWalletOutlinedIcon from "@mui/icons-material/AccountBalanceWalletOutlined";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import TrendingUpOutlinedIcon from "@mui/icons-material/TrendingUpOutlined";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import RefreshIcon from "@mui/icons-material/Refresh";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import "./PayrollDashboard.css";

const API_BASE_URL = String(import.meta.env.VITE_PAYROLL_API_BASE_URL || "").replace(/\/+$/, "");

const formatCurrency = (value) => `₹${Number(value || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
const getRunKey = (run) => `${run.payrollYear}-${String(run.payrollMonth).padStart(2, "0")}`;
const getRunLabel = (run) => new Date(Number(run.payrollYear), Number(run.payrollMonth) - 1, 1)
    .toLocaleDateString("en-IN", { month: "long", year: "numeric" });

function PayrollDashboard() {
    const { hasPermission } = useAuth();
    const navigate = useNavigate();
    const canView = hasPermission("/payroll/dashboard", "view");
    const canAccessProcess = hasPermission("/payroll/process", "view");
    const [runs, setRuns] = useState([]);
    const [selectedRunKey, setSelectedRunKey] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const loadRuns = useCallback(async (signal, showLoading = true) => {
        if (showLoading) setLoading(true);
        try {
            if (!API_BASE_URL) throw new Error("Payroll service is not configured.");
            const token = localStorage.getItem("token");
            const response = await fetch(`${API_BASE_URL}/api/Payroll/history`, {
                signal,
                headers: {
                    Accept: "application/json",
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
            });
            if (!response.ok) {
                if (response.status === 401 || response.status === 403) {
                    throw new Error("You are not authorized to view payroll history. Sign in again or contact an administrator.");
                }
                throw new Error(`Payroll history could not be loaded (HTTP ${response.status}).`);
            }
            const data = await response.json();
            const normalizedRuns = (Array.isArray(data) ? data : data?.data ?? data?.items ?? [])
                .filter((run) => Number(run.payrollYear) > 0 && Number(run.payrollMonth) >= 1 && Number(run.payrollMonth) <= 12)
                .sort((a, b) => Number(b.payrollYear) - Number(a.payrollYear) || Number(b.payrollMonth) - Number(a.payrollMonth));
            setRuns(normalizedRuns);
            setError("");
            setSelectedRunKey((current) => normalizedRuns.some((run) => getRunKey(run) === current)
                ? current
                : normalizedRuns[0] ? getRunKey(normalizedRuns[0]) : "");
        } catch (loadError) {
            if (loadError.name !== "AbortError") {
                setError(loadError.message || "Payroll history could not be loaded.");
                setRuns([]);
            }
        } finally {
            if (!signal?.aborted) setLoading(false);
        }
    }, []);

    useEffect(() => {
        const controller = new AbortController();
        loadRuns(controller.signal, false);
        return () => controller.abort();
    }, [loadRuns]);

    const selectedRun = runs.find((run) => getRunKey(run) === selectedRunKey) || null;
    const recentRuns = useMemo(() => runs.slice(0, 6).reverse(), [runs]);
    const maxGross = Math.max(1, ...recentRuns.map((run) => Number(run.totalGrossSalary) || 0));
    const summaryCards = selectedRun ? [
        { title: "Gross Payroll", value: formatCurrency(selectedRun.totalGrossSalary), icon: <AccountBalanceWalletOutlinedIcon />, color: "blue" },
        { title: "Employees Processed", value: Number(selectedRun.employeeCount || 0).toLocaleString("en-IN"), icon: <GroupsOutlinedIcon />, color: "green" },
        { title: "Net Salary", value: formatCurrency(selectedRun.totalNetSalary), icon: <TrendingUpOutlinedIcon />, color: "purple" },
        { title: "Deductions", value: formatCurrency(selectedRun.totalDeductions), icon: <ReceiptLongOutlinedIcon />, color: "orange" },
    ] : [];

    if (!canView) {
        return <Box className="pd-payroll-dashboard" sx={{ p: 6, textAlign: "center" }}><Typography variant="h5">Access Denied</Typography><Typography sx={{ mt: 1 }}>You do not have permission to access this page.</Typography></Box>;
    }

    return (
        <Box className="pd-payroll-dashboard">
            <Box className="pd-payroll-dashboard-header">
                <Box className="pd-payroll-dashboard-heading">
                    <IconButton className="pd-dashboard-back-button" aria-label="Back to Payroll Management" onClick={() => navigate("/payroll")}><ArrowBackIcon /></IconButton>
                    <Box><Typography className="pd-payroll-dashboard-title">Payroll Dashboard</Typography><Typography className="pd-payroll-dashboard-subtitle">Payroll totals from completed and in-progress payroll runs.</Typography></Box>
                </Box>
                <Box className="pd-payroll-dashboard-header-actions">
                    <Select value={selectedRunKey} onChange={(event) => setSelectedRunKey(event.target.value)} className="pd-payroll-month-select" size="small" displayEmpty disabled={loading || runs.length === 0} inputProps={{ "aria-label": "Payroll period" }}>
                        {runs.length === 0 && <MenuItem value="">No payroll history</MenuItem>}
                        {runs.map((run) => <MenuItem key={getRunKey(run)} value={getRunKey(run)}>{getRunLabel(run)}</MenuItem>)}
                    </Select>
                    <Button startIcon={<RefreshIcon />} onClick={() => loadRuns() } disabled={loading}>Refresh</Button>
                    {canAccessProcess && <Button className="pd-run-payroll-button" variant="contained" startIcon={<ArrowForwardIcon />} onClick={() => navigate("/payroll/process")}>Open Payroll Process</Button>}
                </Box>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 2 }} action={<Button color="inherit" size="small" onClick={() => loadRuns()}>Retry</Button>}>{error}</Alert>}

            {loading ? (
                <Box sx={{ minHeight: 240, display: "grid", placeItems: "center" }}><CircularProgress aria-label="Loading payroll history" /></Box>
            ) : !error && runs.length === 0 ? (
                <Alert severity="info">There are no payroll runs to summarize yet. Payroll figures will appear here after a run is recorded.</Alert>
            ) : selectedRun && (
                <>
                    <Grid container spacing={2.5} className="pd-payroll-summary-grid">
                        {summaryCards.map((card) => <Grid key={card.title} size={{ xs: 12, sm: 6, lg: 3 }}><Card className="pd-payroll-summary-card"><CardContent><Box className="pd-summary-card-top"><Box><Typography className="pd-summary-card-title">{card.title}</Typography><Typography className="pd-summary-card-value">{card.value}</Typography><Typography className="pd-summary-card-subtitle">{getRunLabel(selectedRun)}</Typography></Box><Box className={`pd-summary-card-icon pd-${card.color}`}>{card.icon}</Box></Box></CardContent></Card></Grid>)}
                    </Grid>

                    <Grid container spacing={2.5} className="pd-payroll-main-grid" sx={{ mt: 0.5 }}>
                        <Grid size={{ xs: 12, lg: 8 }}><Card className="pd-payroll-panel"><CardContent><Typography className="pd-panel-title">Recent Payroll Runs</Typography><Typography className="pd-panel-subtitle">Gross payroll by recorded period</Typography><Box className="pd-payroll-chart"><Box className="pd-payroll-chart-bars">{recentRuns.map((run) => <Box className="pd-payroll-chart-column" key={getRunKey(run)} title={`${getRunLabel(run)} · ${formatCurrency(run.totalGrossSalary)}`}><Box className="pd-payroll-chart-bar" style={{ height: `${Math.max(8, (Number(run.totalGrossSalary) / maxGross) * 180)}px` }} /><Typography className="pd-payroll-chart-label">{getRunLabel(run)}</Typography></Box>)}</Box></Box></CardContent></Card></Grid>
                        <Grid size={{ xs: 12, lg: 4 }}><Card className="pd-payroll-panel pd-payroll-status-panel"><CardContent><Typography className="pd-panel-title">Selected Run</Typography><Typography className="pd-panel-subtitle">Status recorded by Payroll Service</Typography><Box className="pd-payroll-status-item pd-completed"><Box className="pd-status-icon pd-completed-icon"><ReceiptLongOutlinedIcon /></Box><Box className="pd-status-content"><Typography className="pd-status-title">{selectedRun.status || "Status unavailable"}</Typography><Typography className="pd-payroll-status-date">{selectedRun.completedDate ? new Date(selectedRun.completedDate).toLocaleDateString("en-IN") : "Completion date not recorded"}</Typography></Box></Box><Button fullWidth endIcon={<ArrowForwardIcon />} onClick={() => navigate("/payroll/history")}>View payroll history</Button></CardContent></Card></Grid>
                    </Grid>
                </>
            )}
        </Box>
    );
}

export default PayrollDashboard;
