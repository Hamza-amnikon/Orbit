import { useState } from "react";
import { Box, Button, Card, CardContent, Stack, Tab, Tabs, TextField, Typography } from "@mui/material";
import { financeApi } from "../../services/financeApi";
import { money, today, useLoad } from "../../live/data";
import { Feedback, Page } from "../../live/shared";

export default function FinancialStatements() {
  const [from, setFrom] = useState(`${today().slice(0, 7)}-01`); const [to, setTo] = useState(today()); const [tab, setTab] = useState(0);
  const reports = useLoad(() => financeApi.accounting({ from, to }), [from, to]);
  const result = reports.data; const statements = result ? [
    [["Income", result.profitAndLoss.income], ["Expenses", result.profitAndLoss.expenses], ["Net profit / loss", result.profitAndLoss.profit]],
    [["Assets", result.balanceSheet.assets], ["Liabilities", result.balanceSheet.liabilities], ["Equity", result.balanceSheet.equity], ["Retained earnings", result.balanceSheet.retainedEarnings], ["Balance difference", result.balanceSheet.difference]],
    [["Opening cash", result.cashFlow.opening], ["Money received", result.cashFlow.received], ["Money paid", result.cashFlow.paid], ["Closing cash", result.cashFlow.closing]],
    result.banks.map(bank => [bank.name, bank.balance]),
  ] : [];
  function exportCsv() {
    const rows = [["Metric", "Amount (INR)"], ...statements[tab]];
    const csv = rows.map(row => row.map(value => `"${String(value).replaceAll('"', '""').replace(/^[=+@-]/, "'$&")}"`).join(",")).join("\r\n");
    const url = URL.createObjectURL(new Blob(["\uFEFF", csv], { type: "text/csv;charset=utf-8" })); const link = document.createElement("a"); link.href = url; link.download = `financial-report-${from}-${to}.csv`; link.click(); URL.revokeObjectURL(url);
  }
  return <Page title="Financial Reports" subtitle="Reports calculated from posted double-entry journals · INR" action={<Button disabled={!result || reports.loading} onClick={exportCsv}>Export CSV</Button>}>
    <Stack direction="row" sx={{ gap: 2, mb: 3, flexWrap: "wrap" }}>{[["From", from, setFrom], ["To", to, setTo]].map(([label, value, set]) => <TextField key={label} label={label} type="date" value={value} onChange={event => set(event.target.value)} slotProps={{ inputLabel: { shrink: true } }} />)}</Stack>
    <Tabs value={tab} onChange={(_, value) => setTab(value)} variant="scrollable" scrollButtons="auto" sx={{ mb: 3 }}>{["Profit & Loss", "Balance Sheet", "Cash Movement", "Bank Balances"].map(label => <Tab key={label} label={label} />)}</Tabs>
    <Feedback {...reports} retry={reports.refresh} />
    {result && <><Typography color="text.secondary" sx={{ mb: 3 }}>{tab === 1 || tab === 3 ? `Closing balances as of ${to}` : `Movement from ${from} to ${to}`}. Cash movement excludes transfers between cash/bank accounts.</Typography>
      <Box className="admin-summary-grid">{statements[tab].map(([label, value]) => <Card key={label}><CardContent><Typography color="text.secondary">{label}</Typography><Typography className="admin-summary-value">{money(value)}</Typography></CardContent></Card>)}</Box>
      {!statements[tab].length && <Typography>No bank accounts have been added yet.</Typography>}</>}
  </Page>;
}
