import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert, Box, Button, Card, CardContent, MenuItem, Stack, Tab, Table,
  TableBody, TableCell, TableContainer, TableHead, TableRow, Tabs,
  TextField, Typography,
} from "@mui/material";
import { getAccountingCompanies } from "../accounting management/chart of accounts/ChartOfAccountsService";
import { today } from "../../live/data";
import { Page } from "../../live/shared";

function amount(value, currency) {
  return new Intl.NumberFormat("en", { style: "currency", currency }).format(Number(value || 0));
}

export default function FinancialStatements() {
  const [companies, setCompanies] = useState([]);
  const [companyId, setCompanyId] = useState("");
  const [from, setFrom] = useState(`${today().slice(0, 7)}-01`);
  const [to, setTo] = useState(today());
  const [tab, setTab] = useState(0);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    getAccountingCompanies(controller.signal)
      .then(data => {
        const rows = Array.isArray(data) ? data : data.data || [];
        setCompanies(rows);
        if (rows.length) setCompanyId(String(rows[0].id));
      })
      .catch(exception => {
        if (!controller.signal.aborted) setError(exception.message || "Companies could not be loaded.");
      });
    return () => controller.abort();
  }, []);

  const loadReport = useCallback(async signal => {
    if (!companyId || !from || !to) return;
    if (from > to) {
      setError("From date must be on or before To date.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const query = new URLSearchParams({ companyId, fromDate: from, toDate: to });
      const response = await fetch(`/api/financial-reports?${query}`, { signal });
      if (!response.ok) {
        const problem = await response.json().catch(() => ({}));
        throw new Error(problem.title || problem.message || "Financial report request failed.");
      }
      setReport(await response.json());
    } catch (exception) {
      if (exception.name !== "AbortError") {
        setReport(null);
        setError(exception.message);
      }
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, [companyId, from, to]);

  useEffect(() => {
    const controller = new AbortController();
    loadReport(controller.signal);
    return () => controller.abort();
  }, [loadReport]);

  const currency = report?.currency || companies.find(row => String(row.id) === companyId)?.currency || "AED";
  const sections = useMemo(() => report ? [
    {
      metrics: [["Income", report.income], ["Expenses", report.expenses], ["Net profit / loss", report.profit]],
      tables: [["Income accounts", report.incomeAccounts], ["Expense accounts", report.expenseAccounts]],
    },
    {
      metrics: [["Assets", report.assets], ["Liabilities", report.liabilities], ["Equity", report.equity],
        ["Unclosed earnings", report.unclosedEarnings], ["Balance difference", report.balanceDifference]],
      tables: [["Assets", report.assetAccounts], ["Liabilities", report.liabilityAccounts],
        ["Equity", report.equityAccounts]],
    },
    {
      metrics: [["Opening cash and banks", report.cashOpening], ["Debits", report.cashDebits],
        ["Credits", report.cashCredits], ["Closing cash and banks", report.cashClosing]],
      tables: [["Cash and bank accounts", report.cashAccounts]],
    },
    {
      metrics: [["Total bank ledger balance", report.bankAccounts.reduce((sum, row) => sum + row.amount, 0)]],
      tables: [["Bank ledger accounts", report.bankAccounts]],
    },
  ] : [], [report]);
  const section = sections[tab];

  function exportCsv() {
    if (!section) return;
    const rows = [["Company", report.companyName], ["Currency", currency], ["From", from], ["To", to], [],
      ["Metric", "Amount"], ...section.metrics, ...section.tables.flatMap(([title, accounts]) =>
        [[], [title, "Amount"], ...accounts.map(row => [`${row.code} · ${row.name}`, row.amount])])];
    const csv = rows.map(row => row.map(value => {
      const text = typeof value === "number"
        ? String(value)
        : String(value ?? "").replace(/^[=+@-]/, "'$&");
      return `"${text.replaceAll('"', '""')}"`;
    }).join(",")).join("\r\n");
    const url = URL.createObjectURL(new Blob(["\uFEFF", csv], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `financial-report-${companyId}-${from}-${to}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  return <Page title="Financial Reports"
    subtitle="Reports from posted accounting entries in the company reporting currency"
    action={<Button disabled={!report || loading} onClick={exportCsv}>Export CSV</Button>}>
    <Stack direction="row" sx={{ gap: 2, mb: 3, flexWrap: "wrap" }}>
      <TextField select label="Company" value={companyId}
        onChange={event => setCompanyId(event.target.value)} sx={{ minWidth: 260 }}>
        {companies.map(company => <MenuItem key={company.id} value={String(company.id)}>
          {company.name} · {company.currency}
        </MenuItem>)}
      </TextField>
      <TextField label="From" type="date" value={from} onChange={event => setFrom(event.target.value)}
        slotProps={{ inputLabel: { shrink: true } }} />
      <TextField label="To" type="date" value={to} onChange={event => setTo(event.target.value)}
        slotProps={{ inputLabel: { shrink: true } }} />
      <Button onClick={() => loadReport()} disabled={loading || !companyId}>Refresh</Button>
    </Stack>
    <Tabs value={tab} onChange={(_, value) => setTab(value)}
      variant="scrollable" scrollButtons="auto" sx={{ mb: 3 }}>
      {["Profit & Loss", "Balance Sheet", "Cash Movement", "Bank Balances"].map(label =>
        <Tab key={label} label={label} />)}
    </Tabs>
    {loading && <Typography sx={{ mb: 2 }}>Loading report…</Typography>}
    {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
    {report && section && <>
      <Typography color="text.secondary" sx={{ mb: 2 }}>
        {tab === 1 || tab === 3 ? `Balances as of ${to}` : `Movement from ${from} to ${to}`}
        {" · "}Amounts in {currency}
      </Typography>
      {tab === 2 && <Alert severity="info" sx={{ mb: 2 }}>
        This shows movements posted to cash and bank ledgers, including transfers between them.
      </Alert>}
      {tab === 3 && <Alert severity="info" sx={{ mb: 2 }}>
        Bank ledger balances are in {currency}, the company reporting currency. Check Banking for native bank balances.
      </Alert>}
      <Box className="admin-summary-grid">
        {section.metrics.map(([label, value]) => <Card key={label}><CardContent>
          <Typography color="text.secondary">{label}</Typography>
          <Typography className="admin-summary-value">{amount(value, currency)}</Typography>
        </CardContent></Card>)}
      </Box>
      {section.tables.map(([title, rows]) => <Card key={title} sx={{ mb: 2 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 1 }}>{title}</Typography>
          <TableContainer><Table size="small">
            <TableHead><TableRow><TableCell>Account</TableCell>
              <TableCell align="right">Amount ({currency})</TableCell></TableRow></TableHead>
            <TableBody>
              {(rows || []).map(row => <TableRow key={row.code}>
                <TableCell>{row.code} · {row.name}</TableCell>
                <TableCell align="right">{amount(row.amount, currency)}</TableCell>
              </TableRow>)}
              {!rows?.length && <TableRow><TableCell colSpan={2}>No posting accounts found.</TableCell></TableRow>}
            </TableBody>
          </Table></TableContainer>
        </CardContent>
      </Card>)}
    </>}
  </Page>;
}
