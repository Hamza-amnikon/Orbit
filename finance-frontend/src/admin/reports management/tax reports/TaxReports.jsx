import { useCallback, useEffect, useState } from "react";
import { Alert, Button, Card, CardContent, MenuItem, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography } from "@mui/material";
import { getAccountingCompanies } from "../../accounting management/chart of accounts/ChartOfAccountsService";
import { today } from "../../../live/data";
import { Page } from "../../../live/shared";
import "./TaxReports.css";

function formatAmount(value, currency) {
    return new Intl.NumberFormat("en", {
        style: "currency",
        currency: currency || "AED",
    }).format(Math.abs(Number(value || 0)));
}

function formatBalance(value, currency) {
    const amount = Number(value || 0);
    return `${formatAmount(amount, currency)} ${amount === 0 ? "" : amount > 0 ? "Debit" : "Credit"}`.trim();
}

export default function TaxReports() {
    const [companies, setCompanies] = useState([]);
    const [companyId, setCompanyId] = useState("");
    const [fromDate, setFromDate] = useState(`${today().slice(0, 4)}-01-01`);
    const [toDate, setToDate] = useState(today());
    const [report, setReport] = useState(null);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        let active = true;
        getAccountingCompanies()
            .then((rows) => {
                if (!active) return;
                setCompanies(rows);
                setCompanyId((current) => current || String(rows[0]?.id || ""));
            })
            .catch((exception) => {
                if (active) setError(exception.message || "Could not load companies.");
            });
        return () => { active = false; };
    }, []);

    const loadReport = useCallback(async () => {
        if (!companyId) return;
        if (fromDate > toDate) {
            setError("From date must be on or before To date.");
            return;
        }
        setLoading(true);
        setError("");
        try {
            const query = new URLSearchParams({ companyId, fromDate, toDate });
            const response = await fetch(`/api/tax-reports?${query}`);
            if (!response.ok) throw new Error(`Tax report request failed (${response.status}).`);
            setReport(await response.json());
        } catch (exception) {
            setReport(null);
            setError(exception.message || "Tax report is unavailable.");
        } finally {
            setLoading(false);
        }
    }, [companyId, fromDate, toDate]);

    useEffect(() => { loadReport(); }, [loadReport]);

    function exportCsv() {
        if (!report) return;
        const escape = (value) => {
            const text = String(value ?? "");
            const safe = /^[=+@-]/.test(text) ? `'${text}` : text;
            return `"${safe.replaceAll('"', '""')}"`;
        };
        const rows = [
            ["Code", "Account", "System key", "Opening debit-positive", "Period debit", "Period credit", "Closing debit-positive", "Currency"],
            ...report.accounts.map((account) => [account.code, account.name, account.systemKey, account.openingBalance, account.periodDebit, account.periodCredit, account.closingBalance, report.currency]),
        ];
        const csv = rows.map((row) => row.map(escape).join(",")).join("\r\n");
        const link = document.createElement("a");
        link.href = URL.createObjectURL(new Blob(["\uFEFF", csv], { type: "text/csv;charset=utf-8" }));
        link.download = `tax-ledgers-${report.companyId}-${fromDate}-${toDate}.csv`;
        link.click();
        URL.revokeObjectURL(link.href);
    }

    return <Page title="Tax Reports" subtitle="Tax account movements from posted journals in the company currency" action={<Button onClick={exportCsv} disabled={!report}>Export CSV</Button>}>
        <Stack direction={{ xs: "column", md: "row" }} spacing={2} sx={{ mb: 2 }}>
            <TextField select label="Company" value={companyId} onChange={(event) => setCompanyId(event.target.value)} sx={{ minWidth: 260 }}>
                {companies.map((company) => <MenuItem key={company.id} value={String(company.id)}>{company.name} · {company.currency}</MenuItem>)}
            </TextField>
            <TextField label="From" type="date" value={fromDate} onChange={(event) => setFromDate(event.target.value)} slotProps={{ inputLabel: { shrink: true } }} />
            <TextField label="To" type="date" value={toDate} onChange={(event) => setToDate(event.target.value)} slotProps={{ inputLabel: { shrink: true } }} />
            <Button onClick={loadReport} disabled={loading || !companyId}>Refresh</Button>
        </Stack>
        <Alert severity="info" sx={{ mb: 2 }}>This report shows tax ledger balances for review. Confirm tax treatment and filing figures with your accountant.</Alert>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {loading && <Typography sx={{ mb: 2 }}>Loading tax accounts...</Typography>}
        {report && <Card>
            <CardContent>
                <Typography variant="h6" sx={{ mb: 1 }}>{report.companyName} · {report.currency}</Typography>
                <Typography variant="body2" sx={{ mb: 2 }}>{report.fromDate} to {report.toDate} · Opening and closing balances are debit positive.</Typography>
                <TableContainer>
                    <Table size="small">
                        <TableHead><TableRow>
                            <TableCell>Code</TableCell><TableCell>Tax account</TableCell><TableCell align="right">Opening</TableCell><TableCell align="right">Debit</TableCell><TableCell align="right">Credit</TableCell><TableCell align="right">Closing</TableCell>
                        </TableRow></TableHead>
                        <TableBody>
                            {report.accounts.map((account) => <TableRow key={account.code}>
                                <TableCell>{account.code}</TableCell><TableCell>{account.name}</TableCell>
                                <TableCell align="right">{formatBalance(account.openingBalance, report.currency)}</TableCell>
                                <TableCell align="right">{formatAmount(account.periodDebit, report.currency)}</TableCell>
                                <TableCell align="right">{formatAmount(account.periodCredit, report.currency)}</TableCell>
                                <TableCell align="right">{formatBalance(account.closingBalance, report.currency)}</TableCell>
                            </TableRow>)}
                            {!report.accounts.length && <TableRow><TableCell colSpan={6}>No configured tax accounts were found for this company.</TableCell></TableRow>}
                        </TableBody>
                    </Table>
                </TableContainer>
            </CardContent>
        </Card>}
    </Page>;
}
