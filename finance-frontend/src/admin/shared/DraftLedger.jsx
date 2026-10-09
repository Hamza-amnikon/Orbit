import { useState } from "react";
import { Alert, Box, Card, CardContent, Typography } from "@mui/material";
import { Page, Records } from "../../live/shared";
import { useAuth } from "../../live/AuthContext";
import { money } from "../../live/data";
import "./AdminModules.css";

export default function DraftLedger({ trial = false }) {
  const { user } = useAuth(); const [revision, setRevision] = useState(0);
  const [search, setSearch] = useState(""); const [page, setPage] = useState(1);
  let journals = []; let error = "";
  try { const value = JSON.parse(sessionStorage.getItem(`sparkfinance.drafts.${user.id}.journals`) || "[]"); journals = Array.isArray(value) ? value : []; }
  catch { error = "Journal drafts could not be read. Open Journal Entries to refresh them."; }
  const entries = journals.flatMap(row => [{ id: `${row.id}-debit`, account: row.debitAccount, date: row.date, reference: row.reference, debit: Math.round(Number(row.debit) * 100), credit: 0 }, { id: `${row.id}-credit`, account: row.creditAccount, date: row.date, reference: row.reference, debit: 0, credit: Math.round(Number(row.credit) * 100) }]);
  const grouped = new Map();
  for (const row of entries) { const key = row.account.trim().toLowerCase(); const current = grouped.get(key) || { id: key, account: row.account, debit: 0, credit: 0 }; current.debit += row.debit; current.credit += row.credit; grouped.set(key, current); }
  const rows = trial ? [...grouped.values()].map(row => ({ ...row, debit: Math.max(0, row.debit - row.credit), credit: Math.max(0, row.credit - row.debit) })) : entries;
  const filtered = rows.filter(row => `${row.account} ${row.reference || ""}`.toLowerCase().includes(search.toLowerCase()));
  const debit = rows.reduce((sum, row) => sum + row.debit, 0); const credit = rows.reduce((sum, row) => sum + row.credit, 0);
  return <Page title={trial ? "Trial Balance" : "General Ledger"} subtitle="Preview of journal drafts in this browser tab">
    <Alert severity="info" sx={{ mb: 2 }}>Draft preview only. No journal has been posted to the database; this is not your official ledger.</Alert>
    <Box className="admin-summary-grid">{[["Total debit", debit], ["Total credit", credit], ["Difference", debit - credit]].map(([label, value]) => <Card key={label}><CardContent><Typography color="text.secondary">{label}</Typography><Typography className="admin-summary-value">{money(value / 100)}</Typography></CardContent></Card>)}</Box>
    <Records key={revision} error={error} rows={filtered.slice((page - 1) * 25, page * 25)} total={filtered.length} page={page} setPage={setPage} search={search} setSearch={setSearch} refresh={() => { setRevision(value => value + 1); setPage(1); }} columns={[
      { label: "Account", render: row => row.account }, ...(!trial ? [{ label: "Date", render: row => row.date }, { label: "Reference", render: row => row.reference }] : []),
      { label: "Debit", render: row => money(row.debit / 100) }, { label: "Credit", render: row => money(row.credit / 100) },
    ]} />
  </Page>;
}
