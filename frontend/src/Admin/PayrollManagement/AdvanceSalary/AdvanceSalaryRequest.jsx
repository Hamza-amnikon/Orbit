import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Alert, Box, Button, Card, CardContent, MenuItem, Stack, TextField, Typography } from "@mui/material";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import { useAuth } from "../../../context/AuthContext";
import AdvanceSalaryService from "./AdvanceSalaryService";
import "./AdvanceSalary.css";

export default function AdvanceSalaryRequest() {
    const navigate = useNavigate();
    const { profile } = useAuth();
    const [form, setForm] = useState({ amount: "", repaymentMonths: "1", reason: "" });
    const [error, setError] = useState("");
    const [saving, setSaving] = useState(false);
    const employeeName = profile?.employeeName || profile?.EmployeeName || profile?.name || profile?.Name || "";

    const submit = async (event) => {
        event.preventDefault();
        const amount = Number(form.amount);
        const repaymentMonths = Number(form.repaymentMonths);
        if (!Number.isFinite(amount) || amount <= 0 || form.reason.trim().length < 10) {
            setError("Enter a valid amount and a reason of at least 10 characters.");
            return;
        }
        setSaving(true);
        setError("");
        try {
            await AdvanceSalaryService.createRequest({ amount, repaymentMonths, reason: form.reason.trim(), employeeName });
            navigate("/payroll/my-advance-salary", { state: { requestSubmitted: true } });
        } catch (submitError) {
            setError(submitError?.message || "The request could not be submitted.");
        } finally {
            setSaving(false);
        }
    };

    return <Box className="advance-salary-page">
        <Box className="advance-salary-header">
            <Button startIcon={<ArrowBackRoundedIcon />} onClick={() => navigate("/payroll/my-advance-salary")}>Back to My Requests</Button>
            <Box className="advance-salary-heading"><Typography component="h1" variant="h4">Request Salary Advance</Typography><Typography component="p">Submit a request for review by Payroll.</Typography></Box>
        </Box>
        <Card className="advance-salary-panel" sx={{ maxWidth: 720 }}>
            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                <Stack component="form" spacing={2.5} onSubmit={submit}>
                    {error && <Alert severity="error">{error}</Alert>}
                    <TextField required fullWidth type="number" label="Amount (INR)" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} inputProps={{ min: 1, step: "0.01" }} />
                    <TextField select required fullWidth label="Repayment period" value={form.repaymentMonths} onChange={(e) => setForm({ ...form, repaymentMonths: e.target.value })}>
                        {Array.from({ length: 12 }, (_, i) => i + 1).map((n) => <MenuItem key={n} value={String(n)}>{n} {n === 1 ? "month" : "months"}</MenuItem>)}
                    </TextField>
                    <TextField required fullWidth multiline minRows={4} label="Reason for request" value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} inputProps={{ maxLength: 500, minLength: 10 }} helperText={form.reason.length + "/500 · at least 10 characters"} />
                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                        <Button onClick={() => navigate("/payroll/my-advance-salary")} disabled={saving}>Cancel</Button>
                        <Button type="submit" variant="contained" disabled={saving}>{saving ? "Submitting…" : "Submit request"}</Button>
                    </Stack>
                </Stack>
            </CardContent>
        </Card>
    </Box>;
}
