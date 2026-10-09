import { useState } from "react";
import { Box, Card, CardContent, TextField, Typography } from "@mui/material";
import { financeApi } from "../../services/financeApi";
import { money, today, useLoad } from "../../live/data";
import { Page, Records } from "../../live/shared";
export default function DatabaseLedger({ trial = false }) {
  const [to, setTo] = useState(today()); const [search, setSearch] = useState(""); const [page, setPage] = useState(1);
  const list = useLoad(() => trial ? financeApi.accounting({ to }).then(result => result.trial) : financeApi.ledger({ to }), [trial, to]);
  const all = list.data || []; const rows = all.filter(row => `${row.account} ${row.code} ${row.reference || ""}`.toLowerCase().includes(search.toLowerCase()));
  const debit = all.reduce((sum, row) => sum + Math.round(row.debit * 100), 0) / 100; const credit = all.reduce((sum, row) => sum + Math.round(row.credit * 100), 0) / 100;
  return <Page title={trial ? "Trial Balance" : "General Ledger"} subtitle="Posted accounting entries from SparkFinance · INR">
    <TextField type="date" label="As of" value={to} onChange={event => { setTo(event.target.value); setPage(1); }} slotProps={{ inputLabel: { shrink: true } }} sx={{ mb: 3 }} />
    {!list.loading && !list.error && <Box className="admin-summary-grid">{[["Total debit", debit], ["Total credit", credit], ["Difference", debit - credit]].map(([label, value]) => <Card key={label}><CardContent><Typography color="text.secondary">{label}</Typography><Typography className="admin-summary-value">{money(value)}</Typography></CardContent></Card>)}</Box>}
    <Records {...list} rows={rows.slice((page - 1) * 25, page * 25)} total={rows.length} page={page} setPage={setPage} search={search} setSearch={setSearch} columns={[
      { label: "Account", render: row => `${row.code} · ${row.account}` }, ...(!trial ? [{ label: "Date", render: row => row.date }, { label: "Reference", render: row => row.reference }, { label: "Source", render: row => row.sourceType }] : []),
      { label: "Debit", render: row => money(row.debit) }, { label: "Credit", render: row => money(row.credit) },
    ]} />
  </Page>;
}
