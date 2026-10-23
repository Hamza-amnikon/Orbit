import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Alert, Box, Button, Card, CardContent, Chip, CircularProgress,
    Dialog, DialogActions, DialogContent, DialogTitle, FormControl,
    IconButton, MenuItem, Select, Snackbar, Stack, Table, TableBody,
    TableCell, TableContainer, TableHead, TableRow, TextField, Typography,
} from "@mui/material";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import PaymentsOutlinedIcon from "@mui/icons-material/PaymentsOutlined";
import PendingActionsOutlinedIcon from "@mui/icons-material/PendingActionsOutlined";
import CheckCircleOutlineRoundedIcon from "@mui/icons-material/CheckCircleOutlineRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import { useAuth } from "../../../context/AuthContext";
import AdvanceSalaryService from "./AdvanceSalaryService";
import "./AdvanceSalary.css";

const REQUEST_ID_FIELDS = ["advanceSalaryId", "AdvanceSalaryId", "requestId", "RequestId", "id", "Id"];
const EMPLOYEE_ID_FIELDS = ["employeeId", "EmployeeId", "employeeID", "EmployeeID"];
const valueOf = (record, names, fallback = "") => {
    for (const name of names) {
        if (record?.[name] !== undefined && record?.[name] !== null) return record[name];
    }
    return fallback;
};
const formatAmount = (amount) => {
    const value = Number(amount);
    return Number.isFinite(value)
        ? new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 }).format(value)
        : "—";
};
const formatDate = (value) => {
    if (!value) return "—";
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? "—" : date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
};

export default function AdvanceSalary() {
    const navigate = useNavigate();
    const { profile, profileLoading, hasPermission } = useAuth();
    const employeeId = valueOf(profile, EMPLOYEE_ID_FIELDS) || valueOf(profile?.employee, EMPLOYEE_ID_FIELDS);
    const employeeName = profile?.employeeName || profile?.EmployeeName || profile?.name || profile?.Name || "";
    const canReview = hasPermission("/approvals", "approve");
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");
    const [requestOpen, setRequestOpen] = useState(false);
    const [requestForm, setRequestForm] = useState({ amount: "", repaymentMonths: "1", reason: "" });
    const [submitting, setSubmitting] = useState(false);
    const [reviewRequest, setReviewRequest] = useState(null);
    const [reviewStatus, setReviewStatus] = useState("");
    const [reviewComment, setReviewComment] = useState("");
    const [notice, setNotice] = useState(null);

    const loadRequests = useCallback(async () => {
        if (profileLoading) return;
        if (!employeeId) {
            setError("Your employee profile could not be identified. Refresh your profile and try again.");
            setRequests([]);
            setLoading(false);
            return;
        }
        setLoading(true);
        setError("");
        try {
            const result = canReview
                ? await AdvanceSalaryService.getAllRequests()
                : await AdvanceSalaryService.getEmployeeRequests(employeeId);
            setRequests(Array.isArray(result) ? result : []);
        } catch (loadError) {
            setError(loadError?.message || "Advance salary requests could not be loaded.");
            setRequests([]);
        } finally {
            setLoading(false);
        }
    }, [canReview, employeeId, profileLoading]);

    useEffect(() => { loadRequests(); }, [loadRequests]);

    const filteredRequests = useMemo(() => requests.filter((request) => {
        if (statusFilter === "All") return true;
        return String(valueOf(request, ["status", "Status"], "Pending")).toLowerCase() === statusFilter.toLowerCase();
    }), [requests, statusFilter]);

    const stats = useMemo(() => ({
        total: requests.length,
        pending: requests.filter((request) => String(valueOf(request, ["status", "Status"], "Pending")).toLowerCase() === "pending").length,
        approved: requests.filter((request) => String(valueOf(request, ["status", "Status"], "")).toLowerCase() === "approved").length,
    }), [requests]);

    const submitRequest = async (event) => {
        event.preventDefault();
        const amount = Number(requestForm.amount);
        const months = Number(requestForm.repaymentMonths);
        if (!Number.isFinite(amount) || amount <= 0) {
            setNotice({ severity: "error", message: "Enter an advance amount greater than zero." });
            return;
        }
        if (!Number.isInteger(months) || months < 1 || months > 12) {
            setNotice({ severity: "error", message: "Choose a repayment period from 1 to 12 months." });
            return;
        }
        if (requestForm.reason.trim().length < 10) {
            setNotice({ severity: "error", message: "Please explain the reason in at least 10 characters." });
            return;
        }
        setSubmitting(true);
        try {
            await AdvanceSalaryService.createRequest({
                employeeId: Number(employeeId),
                employeeName,
                amount,
                repaymentMonths: months,
                reason: requestForm.reason.trim(),
            });
            setRequestOpen(false);
            setRequestForm({ amount: "", repaymentMonths: "1", reason: "" });
            setNotice({ severity: "success", message: "Advance salary request submitted for approval." });
            await loadRequests();
        } catch (submitError) {
            setNotice({ severity: "error", message: submitError?.message || "The request could not be submitted." });
        } finally {
            setSubmitting(false);
        }
    };

    const submitReview = async () => {
        if (!reviewRequest || !employeeId) return;
        setSubmitting(true);
        try {
            const id = valueOf(reviewRequest, REQUEST_ID_FIELDS);
            await AdvanceSalaryService.updateRequestStatus(id, reviewStatus, {
                approverId: Number(employeeId),
                approverName: employeeName,
                comment: reviewComment.trim(),
            });
            setReviewRequest(null);
            setNotice({ severity: "success", message: `Request ${reviewStatus.toLowerCase()} successfully.` });
            await loadRequests();
        } catch (reviewError) {
            setNotice({ severity: "error", message: reviewError?.message || "The request decision could not be saved." });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Box className="advance-salary-page">
            <Box className="advance-salary-header">
                <IconButton className="advance-salary-back" aria-label="Back to Payroll" onClick={() => navigate("/payroll")}>
                    <ArrowBackRoundedIcon />
                </IconButton>
                <Box className="advance-salary-heading">
                    <Typography component="h1" variant="h4">Advance Salary</Typography>
                    <Typography component="p" variant="body1">Apply for a salary advance and review requests awaiting approval.</Typography>
                </Box>
                <Button variant="contained" startIcon={<AddRoundedIcon />} onClick={() => setRequestOpen(true)}>
                    Request Advance
                </Button>
            </Box>

            <Box className="advance-salary-stats">
                <Card className="advance-salary-stat"><CardContent><PaymentsOutlinedIcon /><Typography variant="body2">Total requests</Typography><Typography variant="h5">{stats.total}</Typography></CardContent></Card>
                <Card className="advance-salary-stat"><CardContent><PendingActionsOutlinedIcon /><Typography variant="body2">Pending</Typography><Typography variant="h5">{stats.pending}</Typography></CardContent></Card>
                <Card className="advance-salary-stat"><CardContent><CheckCircleOutlineRoundedIcon /><Typography variant="body2">Approved</Typography><Typography variant="h5">{stats.approved}</Typography></CardContent></Card>
            </Box>

            <Card className="advance-salary-panel">
                <Box className="advance-salary-panel-header">
                    <Box><Typography component="h2" variant="h6">{canReview ? "Employee Requests" : "My Requests"}</Typography><Typography variant="body2">{canReview ? "Review submitted advances. Decisions are attributed to your signed-in account." : "Track the status of your salary advance requests."}</Typography></Box>
                    <FormControl size="small" className="advance-salary-status-filter">
                        <Select aria-label="Filter advance salary requests by status" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
                            <MenuItem value="All">All statuses</MenuItem><MenuItem value="Pending">Pending</MenuItem><MenuItem value="Approved">Approved</MenuItem><MenuItem value="Rejected">Rejected</MenuItem>
                        </Select>
                    </FormControl>
                </Box>
                {error && <Alert severity="error" className="advance-salary-error">{error}</Alert>}
                {loading ? <Box className="advance-salary-loading"><CircularProgress size={28} /><Typography>Loading requests…</Typography></Box> : (
                    <TableContainer className="advance-salary-table-wrap">
                        <Table size="medium" aria-label="Advance salary requests">
                            <TableHead><TableRow>{canReview && <TableCell>Employee</TableCell>}<TableCell>Requested</TableCell><TableCell>Amount</TableCell><TableCell>Repayment</TableCell><TableCell>Reason</TableCell><TableCell>Status</TableCell>{canReview && <TableCell align="right">Actions</TableCell>}</TableRow></TableHead>
                            <TableBody>
                                {filteredRequests.map((request, index) => {
                                    const status = String(valueOf(request, ["status", "Status"], "Pending"));
                                    const id = valueOf(request, REQUEST_ID_FIELDS, `request-${index}`);
                                    const isPending = status.toLowerCase() === "pending";
                                    return <TableRow key={id}>
                                        {canReview && <TableCell><Typography className="advance-salary-employee">{valueOf(request, ["employeeName", "EmployeeName"], `Employee ${valueOf(request, EMPLOYEE_ID_FIELDS, "")}`)}</Typography><Typography className="advance-salary-secondary">ID {valueOf(request, EMPLOYEE_ID_FIELDS, "—")}</Typography></TableCell>}
                                        <TableCell>{formatDate(valueOf(request, ["requestedDate", "createdDate", "CreatedDate"]))}</TableCell>
                                        <TableCell className="advance-salary-amount">{formatAmount(valueOf(request, ["amount", "requestedAmount", "Amount"], 0))}</TableCell>
                                        <TableCell>{valueOf(request, ["repaymentMonths", "RepaymentMonths"], "—")} months</TableCell>
                                        <TableCell className="advance-salary-reason" title={valueOf(request, ["reason", "Reason"], "—")}>{valueOf(request, ["reason", "Reason"], "—")}</TableCell>
                                        <TableCell><Chip size="small" label={status} className={`advance-salary-status ${status.toLowerCase()}`} /></TableCell>
                                        {canReview && <TableCell align="right"><Stack direction="row" spacing={1} justifyContent="flex-end">{isPending ? <><Button size="small" color="success" variant="outlined" onClick={() => { setReviewRequest(request); setReviewStatus("Approved"); setReviewComment(""); }}>Approve</Button><Button size="small" color="error" variant="outlined" onClick={() => { setReviewRequest(request); setReviewStatus("Rejected"); setReviewComment(""); }}>Reject</Button></> : <Typography className="advance-salary-secondary">—</Typography>}</Stack></TableCell>}
                                    </TableRow>;
                                })}
                                {!filteredRequests.length && <TableRow><TableCell colSpan={canReview ? 7 : 5}><Box className="advance-salary-empty"><PaymentsOutlinedIcon /><Typography variant="h6">No requests found</Typography><Typography variant="body2">{statusFilter === "All" ? "Advance salary requests will appear here once submitted." : `There are no ${statusFilter.toLowerCase()} requests.`}</Typography></Box></TableCell></TableRow>}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}
            </Card>

            <Dialog open={requestOpen} onClose={() => !submitting && setRequestOpen(false)} fullWidth maxWidth="sm" className="advance-salary-dialog">
                <Box component="form" onSubmit={submitRequest}>
                    <DialogTitle>Request a salary advance</DialogTitle>
                    <DialogContent className="advance-salary-dialog-content">
                        <Typography variant="body2">Your request will be sent to HR for review. Repayment details are subject to company policy.</Typography>
                        <TextField autoFocus required fullWidth type="number" label="Amount (INR)" value={requestForm.amount} onChange={(event) => setRequestForm((form) => ({ ...form, amount: event.target.value }))} inputProps={{ min: 1, step: "0.01" }} />
                        <TextField select required fullWidth label="Repayment period" value={requestForm.repaymentMonths} onChange={(event) => setRequestForm((form) => ({ ...form, repaymentMonths: event.target.value }))}>
                            {Array.from({ length: 12 }, (_, index) => index + 1).map((months) => <MenuItem key={months} value={String(months)}>{months} {months === 1 ? "month" : "months"}</MenuItem>)}
                        </TextField>
                        <TextField required fullWidth multiline minRows={3} label="Reason for request" value={requestForm.reason} onChange={(event) => setRequestForm((form) => ({ ...form, reason: event.target.value }))} inputProps={{ maxLength: 500 }} helperText={`${requestForm.reason.length}/500`} />
                    </DialogContent>
                    <DialogActions><Button onClick={() => setRequestOpen(false)} disabled={submitting}>Cancel</Button><Button type="submit" variant="contained" disabled={submitting}>{submitting ? "Submitting…" : "Submit request"}</Button></DialogActions>
                </Box>
            </Dialog>

            <Dialog open={Boolean(reviewRequest)} onClose={() => !submitting && setReviewRequest(null)} fullWidth maxWidth="sm" className="advance-salary-dialog">
                <DialogTitle>{reviewStatus} Advance Salary Request</DialogTitle>
                <DialogContent className="advance-salary-dialog-content">
                    <Alert severity={reviewStatus === "Approved" ? "success" : "warning"}>This decision will be recorded under {employeeName || "the signed-in approver"}.</Alert>
                    <Typography variant="body2">{valueOf(reviewRequest, ["employeeName", "EmployeeName"], "Employee request")} · {formatAmount(valueOf(reviewRequest, ["amount", "requestedAmount", "Amount"], 0))}</Typography>
                    <TextField fullWidth multiline minRows={3} label="Comment (optional)" value={reviewComment} onChange={(event) => setReviewComment(event.target.value)} inputProps={{ maxLength: 500 }} />
                </DialogContent>
                <DialogActions><Button onClick={() => setReviewRequest(null)} disabled={submitting}>Cancel</Button><Button variant="contained" color={reviewStatus === "Approved" ? "success" : "error"} onClick={submitReview} disabled={submitting}>{submitting ? "Saving…" : `Confirm ${reviewStatus.toLowerCase()}`}</Button></DialogActions>
            </Dialog>

            <Snackbar open={Boolean(notice)} autoHideDuration={5000} onClose={() => setNotice(null)} anchorOrigin={{ vertical: "bottom", horizontal: "center" }}>
                <Alert onClose={() => setNotice(null)} severity={notice?.severity || "info"} variant="filled">{notice?.message}</Alert>
            </Snackbar>
        </Box>
    );
}
