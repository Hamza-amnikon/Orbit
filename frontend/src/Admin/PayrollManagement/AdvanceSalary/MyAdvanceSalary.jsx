import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Alert, Box, Button, Card, CardContent, Chip, CircularProgress,
    Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, Stack, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, TextField, Typography,
} from "@mui/material";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import PaymentsOutlinedIcon from "@mui/icons-material/PaymentsOutlined";
import PendingActionsOutlinedIcon from "@mui/icons-material/PendingActionsOutlined";
import AccountBalanceWalletOutlinedIcon from "@mui/icons-material/AccountBalanceWalletOutlined";
import LinearProgress from "@mui/material/LinearProgress";
import { useAuth } from "../../../context/AuthContext";
import AdvanceSalaryService from "./AdvanceSalaryService";
import "./AdvanceSalary.css";

const valueOf = (item, keys, fallback = null) => {
    for (const key of keys) if (item?.[key] !== undefined && item[key] !== null) return item[key];
    return fallback;
};
const statusOf = (item) => String(valueOf(item, ["status", "Status"], "Pending"));
const amountOf = (item) => Number(valueOf(item, ["amount", "requestedAmount", "Amount"], 0)) || 0;
const monthsOf = (item) => Number(valueOf(item, ["repaymentMonths", "RepaymentMonths"], 0)) || 0;
const loanIdOf = (item) => String(valueOf(item, ["advanceSalaryId", "AdvanceSalaryId", "requestId", "RequestId", "id", "Id"], ""));
const transactionLoanIdOf = (item) => String(valueOf(item, ["advanceSalaryId", "AdvanceSalaryId"], ""));
const formatDate = (value) => {
    const date = new Date(value);
    return value && !Number.isNaN(date.getTime()) ? date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";
};
const formatAmount = (value) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 }).format(Number(value) || 0);
function SummaryCard({ icon, label, value, detail }) {
    return <Card className="advance-salary-stat"><CardContent>{icon}<Typography variant="body2">{label}</Typography><Typography variant="h5">{value}</Typography>{detail && <Typography className="advance-salary-stat-detail" variant="caption">{detail}</Typography>}</CardContent></Card>;
}

export default function MyAdvanceSalary() {
    const navigate = useNavigate();
    const { profile, profileLoading, hasPermission } = useAuth();
    const canCreateRequest = hasPermission("/payroll/my-advance-salary", "create");
    const employeeId = valueOf(profile, ["employeeId", "EmployeeId", "employeeID", "EmployeeID"]) ??
        valueOf(profile?.employee, ["employeeId", "EmployeeId", "employeeID", "EmployeeID"]);
    const [requests, setRequests] = useState([]);
    const [repayments, setRepayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [repaymentError, setRepaymentError] = useState("");
    const [submitError, setSubmitError] = useState("");
    const [success, setSuccess] = useState("");
    const [saving, setSaving] = useState(false);
    const [requestOpen, setRequestOpen] = useState(false);
    const [form, setForm] = useState({ amount: "", repaymentMonths: "1", reason: "" });

    const load = useCallback(async () => {
        if (profileLoading) return;
        if (!employeeId) { setError("Your employee profile could not be identified."); setLoading(false); return; }
        setLoading(true);
        try {
            const [requestResult, repaymentResult] = await Promise.allSettled([
                AdvanceSalaryService.getEmployeeRequests(employeeId),
                AdvanceSalaryService.getEmployeeRepayments(employeeId),
            ]);
            if (requestResult.status === "fulfilled") {
                setRequests(requestResult.value);
                setError("");
            } else {
                setError(requestResult.reason?.message || "Your advance salary requests could not be loaded.");
            }
            if (repaymentResult.status === "fulfilled") {
                setRepayments(repaymentResult.value);
                setRepaymentError("");
            } else {
                setRepaymentError(repaymentResult.reason?.message || "Payroll repayment history is not available yet.");
            }
        } finally {
            setLoading(false);
        }
    }, [employeeId, profileLoading]);
    useEffect(() => { load(); }, [load]);

    const approved = useMemo(() => requests.filter((item) => statusOf(item).toLowerCase() === "approved"), [requests]);
    const pending = useMemo(() => requests.filter((item) => statusOf(item).toLowerCase() === "pending"), [requests]);
    const repaymentByLoan = useMemo(() => {
        const byLoan = new Map();
        repayments.filter((item) => String(valueOf(item, ["transactionType", "TransactionType"], "")).toLowerCase() === "repayment").forEach((item) => {
            const key = transactionLoanIdOf(item);
            if (!key) return;
            const list = byLoan.get(key) || [];
            list.push(item);
            byLoan.set(key, list);
        });
        return byLoan;
    }, [repayments]);
    const loanSummaries = useMemo(() => approved.map((loan) => {
        const payments = repaymentByLoan.get(loanIdOf(loan)) || [];
        const repaid = payments.reduce((sum, item) => sum + (Number(valueOf(item, ["amount", "Amount"], 0)) || 0), 0);
        const balance = Math.max(0, amountOf(loan) - repaid);
        const term = monthsOf(loan);
        return { loan, payments, repaid, balance, paidMonths: payments.length, remainingMonths: Math.max(0, term - payments.length), monthlyAmount: term ? amountOf(loan) / term : 0 };
    }), [approved, repaymentByLoan]);
    const activeLoans = loanSummaries.filter((item) => item.balance > 0.005);
    const visibleLoans = repaymentError ? loanSummaries : activeLoans;
    const estimatedMonthlyRepayment = activeLoans.reduce((sum, item) => sum + item.monthlyAmount, 0);
    const totalRepaid = loanSummaries.reduce((sum, item) => sum + item.repaid, 0);

    const submit = async (event) => {
        event.preventDefault();
        const amount = Number(form.amount);
        const repaymentMonths = Number(form.repaymentMonths);
        if (!Number.isFinite(amount) || amount <= 0 || !Number.isInteger(repaymentMonths) || repaymentMonths < 1 || repaymentMonths > 12 || form.reason.trim().length < 10) {
            setSubmitError("Enter a valid amount and a reason of at least 10 characters.");
            return;
        }
        setSaving(true);
        setSubmitError("");
        setSuccess("");
        try {
            await AdvanceSalaryService.createRequest({ amount, repaymentMonths, reason: form.reason.trim() });
            setForm({ amount: "", repaymentMonths: "1", reason: "" });
            setSuccess("Your advance salary request was submitted for review.");
            setRequestOpen(false);
            await load();
        } catch (e) {
            setSubmitError(e?.message || "The request could not be submitted.");
        } finally {
            setSaving(false);
        }
    };

    return <Box className="advance-salary-page my-advance-salary-page">
        <Box className="advance-salary-header">
            <Button className="advance-salary-back" aria-label="Back to Payroll" onClick={() => navigate("/payroll")}><ArrowBackRoundedIcon /></Button>
            <Box className="advance-salary-heading"><Typography component="h1" variant="h4">My Advance Salary</Typography><Typography component="p">Request an advance, review approved loans, and follow your repayment plan.</Typography></Box>
            <Stack direction="row" spacing={1}>
                <Button variant="outlined" onClick={load} disabled={loading}>Refresh</Button>
                {canCreateRequest && <Button variant="contained" onClick={() => { setSubmitError(""); setRequestOpen(true); }}>Request Salary Advance</Button>}
            </Stack>
        </Box>

        {error && <Alert severity="error">{error}</Alert>}

        <Box className="advance-salary-stats">
            <SummaryCard icon={<AccountBalanceWalletOutlinedIcon />} label="Active loans" value={loading ? "—" : repaymentError ? approved.length : activeLoans.length} detail={repaymentError ? "Repayment status unavailable" : "Approved advances not fully repaid"} />
            <SummaryCard icon={<PendingActionsOutlinedIcon />} label="Pending requests" value={loading ? "—" : pending.length} detail="Waiting for Payroll review" />
            <SummaryCard icon={<PaymentsOutlinedIcon />} label="Repaid so far" value={loading || repaymentError ? "—" : formatAmount(totalRepaid)} detail={repaymentError ? "Payroll repayment history unavailable" : "From confirmed payroll deductions"} />
            <SummaryCard icon={<PaymentsOutlinedIcon />} label="Monthly repayment" value={loading || repaymentError ? "—" : formatAmount(estimatedMonthlyRepayment)} detail="Scheduled across active loans" />
        </Box>

        <Card className="advance-salary-panel">
            <Box className="advance-salary-panel-header"><Box><Typography component="h2" variant="h6">My Loans & Repayments</Typography><Typography variant="body2">Repayment progress is based on deductions confirmed through payroll.</Typography></Box></Box>
            {repaymentError && <Alert severity="warning" sx={{ m: 2 }}>Repayment history could not be loaded. Loan balances and paid months are hidden until payroll records are available. {repaymentError}</Alert>}
            {loading ? <Box className="advance-salary-loading"><CircularProgress size={26} /><Typography>Loading loan details…</Typography></Box> : visibleLoans.length ? (
                <Box className="advance-loan-grid">
                    {visibleLoans.map(({ loan, payments, repaid, balance, paidMonths, remainingMonths, monthlyAmount }, index) => {
                        const months = monthsOf(loan);
                        const id = loanIdOf(loan) || index;
                        const paidPercent = amountOf(loan) > 0 ? Math.min(100, (repaid / amountOf(loan)) * 100) : 0;
                        return <Card variant="outlined" className="advance-loan-card" key={id}>
                            <CardContent>
                                <Box className="advance-loan-card-top"><Box><Typography variant="overline">ADVANCE AMOUNT</Typography><Typography component="h3" variant="h5">{formatAmount(amountOf(loan))}</Typography></Box><Chip size="small" label={repaymentError ? "Approved" : balance > 0.005 ? "Active" : "Paid off"} className={`advance-salary-status ${repaymentError || balance > 0.005 ? "approved" : "paid-off"}`} /></Box>
                                <Box className="advance-loan-details">
                                    <Box><Typography variant="caption">MONTHLY INSTALLMENT</Typography><Typography>{months ? formatAmount(monthlyAmount) : "—"}</Typography></Box>
                                    <Box><Typography variant="caption">REPAYMENT TERM</Typography><Typography>{months ? `${months} ${months === 1 ? "month" : "months"}` : "—"}</Typography></Box>
                                    <Box><Typography variant="caption">APPROVED ON</Typography><Typography>{formatDate(valueOf(loan, ["reviewedDate", "ReviewedDate", "requestedDate", "RequestedDate"]))}</Typography></Box>
                                    <Box><Typography variant="caption">INSTALLMENTS PAID</Typography><Typography>{repaymentError ? "—" : `${paidMonths} of ${months || "—"}`}</Typography></Box>
                                    <Box><Typography variant="caption">INSTALLMENTS LEFT</Typography><Typography>{repaymentError ? "—" : remainingMonths}</Typography></Box>
                                    <Box><Typography variant="caption">TOTAL REPAID</Typography><Typography>{repaymentError ? "—" : formatAmount(repaid)}</Typography></Box>
                                    <Box><Typography variant="caption">OUTSTANDING BALANCE</Typography><Typography>{repaymentError ? "—" : formatAmount(balance)}</Typography></Box>
                                </Box>
                                {!repaymentError && <Box className="advance-loan-progress"><LinearProgress variant="determinate" value={paidPercent} /><Typography variant="caption">{Math.round(paidPercent)}% repaid</Typography></Box>}
                                {!repaymentError && payments.length > 0 && <Box className="advance-loan-payment-list"><Typography variant="caption">RECORDED PAYMENTS</Typography>{payments.sort((a, b) => Number(valueOf(a, ["payrollYear", "PayrollYear"], 0)) - Number(valueOf(b, ["payrollYear", "PayrollYear"], 0)) || Number(valueOf(a, ["payrollMonth", "PayrollMonth"], 0)) - Number(valueOf(b, ["payrollMonth", "PayrollMonth"], 0))).map((payment, paymentIndex) => {
                                    const year = valueOf(payment, ["payrollYear", "PayrollYear"], "");
                                    const month = Number(valueOf(payment, ["payrollMonth", "PayrollMonth"], 0));
                                    const label = month ? new Date(Number(year), month - 1, 1).toLocaleDateString("en-IN", { month: "short", year: "numeric" }) : "Payroll payment";
                                    return <Box className="advance-loan-payment-row" key={`${year}-${month}-${paymentIndex}`}><Typography variant="body2">{label}</Typography><Typography variant="body2">{formatAmount(valueOf(payment, ["amount", "Amount"], 0))}</Typography></Box>;
                                })}</Box>}
                                <Typography className="advance-loan-reason" variant="body2">{valueOf(loan, ["reason", "Reason"], "No reason provided")}</Typography>
                            </CardContent>
                        </Card>;
                    })}
                </Box>
            ) : <Box className="advance-salary-empty"><AccountBalanceWalletOutlinedIcon /><Typography variant="h6">No active advances</Typography><Typography variant="body2">Approved salary advances will appear here with their repayment plan.</Typography></Box>}
        </Card>

        <Card className="advance-salary-panel">
            <Box className="advance-salary-panel-header"><Box><Typography component="h2" variant="h6">Request History</Typography><Typography variant="body2">Check the status and repayment terms of all your requests.</Typography></Box></Box>
            {loading ? <Box className="advance-salary-loading"><CircularProgress size={26} /><Typography>Loading requests…</Typography></Box> :
                <TableContainer className="advance-salary-table-wrap"><Table aria-label="My advance salary requests">
                    <TableHead><TableRow><TableCell>Requested</TableCell><TableCell>Amount</TableCell><TableCell>Repayment term</TableCell><TableCell>Monthly installment</TableCell><TableCell>Reason</TableCell><TableCell>Status</TableCell></TableRow></TableHead>
                    <TableBody>{requests.map((request, index) => {
                        const status = statusOf(request);
                        const loanSummary = loanSummaries.find((item) => loanIdOf(item.loan) === loanIdOf(request));
                        const displayStatus = !repaymentError && status.toLowerCase() === "approved" && loanSummary?.balance <= 0.005 ? "Paid off" : status;
                        const months = monthsOf(request);
                        return <TableRow key={valueOf(request, ["advanceSalaryId", "AdvanceSalaryId", "requestId", "RequestId", "id", "Id"], index)}>
                            <TableCell>{formatDate(valueOf(request, ["requestedDate", "RequestedDate", "createdDate", "CreatedDate"]))}</TableCell>
                            <TableCell className="advance-salary-amount">{formatAmount(amountOf(request))}</TableCell>
                            <TableCell>{months ? `${months} ${months === 1 ? "month" : "months"}` : "—"}</TableCell>
                            <TableCell>{months && status.toLowerCase() === "approved" ? formatAmount(amountOf(request) / months) : "—"}</TableCell>
                            <TableCell className="advance-salary-reason" title={valueOf(request, ["reason", "Reason"], "—")}>{valueOf(request, ["reason", "Reason"], "—")}</TableCell>
                            <TableCell><Chip size="small" label={displayStatus} className={`advance-salary-status ${displayStatus.toLowerCase().replace(/\s+/g, "-")}`} /></TableCell>
                        </TableRow>;
                    })}
                    {!requests.length && <TableRow><TableCell colSpan={6}><Stack className="advance-salary-empty"><Typography variant="h6">No requests yet</Typography><Typography variant="body2">Your submitted requests will appear here.</Typography></Stack></TableCell></TableRow>}
                    </TableBody></Table></TableContainer>}
        </Card>

        <Dialog open={requestOpen} onClose={() => !saving && setRequestOpen(false)} fullWidth maxWidth="sm" className="advance-salary-dialog">
            <Box component="form" onSubmit={submit}>
                <DialogTitle>Request a Salary Advance</DialogTitle>
                <DialogContent className="advance-salary-dialog-content">
                    <Typography variant="body2">Choose an amount and repayment period. Payroll will review your request.</Typography>
                    {submitError && <Alert severity="error">{submitError}</Alert>}
                    <Box className="advance-request-fields">
                        <TextField autoFocus required fullWidth type="number" label="Amount (INR)" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} inputProps={{ min: 1, step: "0.01" }} />
                        <TextField select required fullWidth label="Repayment period" value={form.repaymentMonths} onChange={(e) => setForm({ ...form, repaymentMonths: e.target.value })}>
                            {Array.from({ length: 12 }, (_, i) => i + 1).map((n) => <MenuItem key={n} value={String(n)}>{n} {n === 1 ? "month" : "months"}</MenuItem>)}
                        </TextField>
                    </Box>
                    <Typography className="advance-request-estimate" variant="body2">Estimated installment: {form.amount && Number(form.amount) > 0 ? formatAmount(Number(form.amount) / Number(form.repaymentMonths)) : "—"} per month, subject to approval.</Typography>
                    <TextField required fullWidth multiline minRows={3} label="Reason for request" value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} inputProps={{ maxLength: 500, minLength: 10 }} helperText={`${form.reason.length}/500 · at least 10 characters`} />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setRequestOpen(false)} disabled={saving}>Cancel</Button>
                    <Button type="submit" variant="contained" disabled={saving || profileLoading || !employeeId}>{saving ? "Submitting…" : "Submit request"}</Button>
                </DialogActions>
            </Box>
        </Dialog>
    </Box>;
}
