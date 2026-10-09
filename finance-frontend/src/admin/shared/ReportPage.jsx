import { useState } from "react";
import { Alert, Box, Button, Card, CardContent, Stack, TextField, Typography } from "@mui/material";
import { Page, Records } from "../../live/shared";
import { money, today, useLoad } from "../../live/data";
import { allRecords, financeApi } from "../../services/financeApi";
import "./AdminModules.css";

const titles = { financial: "Financial Reports", tax: "Tax Reports", sales: "Sales Reports", expenses: "Expense Reports" };
const reportKinds = { financial: ["Invoice", "CreditNote", "Bill", "VendorCredit"], tax: ["Invoice", "CreditNote", "Bill", "VendorCredit"], sales: ["Invoice", "CreditNote"], expenses: ["Bill", "VendorCredit"] };
export default function ReportPage({ kind }) {
  const [from, setFrom] = useState(`${today().slice(0, 7)}-01`); const [to, setTo] = useState(today());
  const [search, setSearch] = useState(""); const [page, setPage] = useState(1);
  const list = useLoad(async signal => {
    if (!from || !to || from > to) throw new Error("Choose a valid date range; From must be on or before To.");
    const results = await Promise.all(reportKinds[kind].map(async type => (await allRecords(financeApi.documents(type), { from, to, status: "Issued" }, signal)).map(row => ({ ...row, type }))));
    if (kind === "expenses") {
      for (const type of ["Expense", "Claim"]) {
        const records = await allRecords(financeApi.expenses(type), { from, to }, signal);
        results.push(records.filter(row => ["Approved", "Paid"].includes(row.status)).map(row => ({ ...row, number: row.reference, partyName: row.payee || row.employee, type, total: row.amount, tax: 0 })));
      }
    }
    return results.flat().map(row => ({ ...row, originalTotal: row.total, originalCurrency: row.currency, total: Math.round(row.total * (row.rateToInr || 1) * 100) / 100, tax: Math.round(row.tax * (row.rateToInr || 1) * 100) / 100 })).sort((a, b) => b.date.localeCompare(a.date));
  }, [kind, from, to]);
  const rows = list.data || [];
  const filtered = rows.filter(row => `${row.number} ${row.partyName} ${row.type}`.toLowerCase().includes(search.toLowerCase()));
  const sign = row => ["CreditNote", "VendorCredit"].includes(row.type) ? -1 : 1;
  const total = types => rows.filter(row => types.includes(row.type)).reduce((sum, row) => sum + sign(row) * Math.round(row.total * 100), 0) / 100;
  const sales = total(["Invoice", "CreditNote"]); const purchases = total(["Bill", "VendorCredit", "Expense", "Claim"]);
  const metrics = kind === "financial" ? [["Net invoiced sales", sales], ["Net billed purchases", purchases], ["Sales less purchases", sales - purchases]] : kind === "tax" ?
    [["Sales document tax", rows.filter(row => ["Invoice", "CreditNote"].includes(row.type)).reduce((sum, row) => sum + sign(row) * Math.round(row.tax * 100), 0) / 100],
      ["Purchase document tax", rows.filter(row => ["Bill", "VendorCredit"].includes(row.type)).reduce((sum, row) => sum + sign(row) * Math.round(row.tax * 100), 0) / 100]] : [[kind === "sales" ? "Net invoiced sales" : "Net expenses", kind === "sales" ? sales : purchases]];
  function exportCsv() {
    const cell = value => `"${String(value ?? "").replaceAll('"', '""').replace(/^[=+@-]/, "'$&")}"`;
    const csv = [["Document", "Type", "Party", "Date", "Tax (INR)", "Total (INR)"], ...filtered.map(row => [row.number, row.type, row.partyName, row.date, row.tax, row.total])].map(row => row.map(cell).join(",")).join("\r\n");
    const url = URL.createObjectURL(new Blob(["\uFEFF", csv], { type: "text/csv;charset=utf-8" }));
    const anchor = document.createElement("a"); anchor.href = url; anchor.download = `${kind}-${from}-${to}.csv`; anchor.click(); URL.revokeObjectURL(url);
  }
  return <Page title={titles[kind]} subtitle="Original currencies converted at saved booking rates · INR" action={<Button variant="outlined" disabled={list.loading || !!list.error || !filtered.length} onClick={exportCsv}>Export CSV</Button>}>
    <Alert severity="info" sx={{ mb: 2 }}>{kind === "financial" ? "Operational sales and purchase summary." : kind === "tax" ? "Document tax summary for review. This does not generate statutory tax returns." : kind === "expenses" ? "Includes issued bills, vendor credits, and approved expenses and claims. Unapproved drafts are excluded." : "Includes issued invoices and credit notes."}</Alert>
    <Stack direction="row" sx={{ gap: 2, mb: 3, flexWrap: "wrap" }}>
      <TextField label="From" type="date" value={from} onChange={event => { setFrom(event.target.value); setPage(1); }} slotProps={{ inputLabel: { shrink: true } }} />
      <TextField label="To" type="date" value={to} onChange={event => { setTo(event.target.value); setPage(1); }} slotProps={{ inputLabel: { shrink: true } }} />
    </Stack>
    {!list.loading && !list.error && <Box className="admin-summary-grid">{metrics.map(([label, value]) => <Card key={label}><CardContent><Typography color="text.secondary">{label}</Typography><Typography className="admin-summary-value">{money(value)}</Typography></CardContent></Card>)}</Box>}
    <Records {...list} rows={filtered.slice((page - 1) * 25, page * 25)} total={filtered.length} page={page} setPage={setPage} search={search} setSearch={setSearch} columns={[
      { label: "Document", render: row => row.number }, { label: "Type", render: row => row.type }, { label: "Party", render: row => row.partyName }, { label: "Date", render: row => row.date }, { label: "Tax", render: row => money(sign(row) * row.tax) }, { label: "Total", render: row => money(sign(row) * row.total) },
    ]} />
  </Page>;
}
