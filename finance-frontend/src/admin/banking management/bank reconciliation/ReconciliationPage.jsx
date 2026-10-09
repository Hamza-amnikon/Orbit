import { useState } from "react";
import { Alert, Box, Button, Card, CardContent, Chip, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography } from "@mui/material";
import { allRecords, financeApi } from "../../../services/financeApi";
import { today, money, useLoad } from "../../../live/data";
import { useAuth } from "../../../live/AuthContext";
import { Feedback, Page, Records } from "../../../live/shared";
import ModuleForm from "../../shared/ModuleForm";
import { parseStatementCsv } from "./parseStatementCsv";
import "./BankReconciliation.css";

export default function ReconciliationPage() {
  const { canWrite } = useAuth(); const list = useLoad(() => financeApi.reconciliations.list(), []);
  const banks = useLoad(signal => allRecords(financeApi.workspace("accounts"), {}, signal), []);
  const [search, setSearch] = useState(""); const [page, setPage] = useState(1); const [edit, setEdit] = useState(null); const [detail, setDetail] = useState(null);
  const [error, setError] = useState(""); const [busy, setBusy] = useState(false); const [complete, setComplete] = useState(false);
  async function view(id) { setBusy(true); setError(""); try { setDetail(await financeApi.reconciliations.get(id)); } catch (failure) { setError(failure.message); } finally { setBusy(false); } }
  async function create(event) { event.preventDefault(); setBusy(true); setError(""); try { const result = await financeApi.reconciliations.create({ ...edit, statementBalance: Number(edit.statementBalance) }); setEdit(null); list.refresh(); await view(result.id); } catch (failure) { setError(failure.message); } finally { setBusy(false); } }
  async function importFile(event) { const file = event.target.files?.[0]; if (!file) return; try { if (file.size > 1024 * 1024) throw new Error("CSV must be smaller than 1 MB."); const lines = parseStatementCsv(await file.text()); setEdit(current => ({ ...current, lines })); setError(""); } catch (failure) { setError(failure.message); } }
  async function match(line, value) { setBusy(true); setError(""); try { setDetail(await financeApi.reconciliations.match(detail.id, line.id, { journalLineId: value || null, rowVersion: line.rowVersion })); } catch (failure) { setError(failure.message); } finally { setBusy(false); } }
  async function finish() { setBusy(true); setError(""); try { setDetail(await financeApi.reconciliations.complete(detail.id, { rowVersion: detail.rowVersion })); setComplete(false); list.refresh(); } catch (failure) { setError(failure.message); } finally { setBusy(false); } }
  const rows = (list.data || []).filter(row => `${row.account} ${row.statementDate}`.toLowerCase().includes(search.toLowerCase()));
  return <Page title="Bank Reconciliation" subtitle="Import statement lines and match them to posted book entries" action={canWrite && <Button variant="contained" onClick={() => { setError(""); setEdit({ accountId: "", statementDate: today(), statementBalance: "", notes: "", lines: [] }); }}>New Reconciliation</Button>}>
    {error && !edit && !detail && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
    <Records {...list} rows={rows.slice((page - 1) * 25, page * 25)} total={rows.length} page={page} setPage={setPage} search={search} setSearch={setSearch} columns={[
      { label: "Bank account", render: row => row.account }, { label: "Statement date", render: row => row.statementDate }, { label: "Statement balance", render: row => money(row.statementBalance) }, { label: "Status", render: row => <Chip label={row.status} size="small" /> }, { label: "Actions", render: row => <Button disabled={busy} onClick={() => view(row.id)}>View / match</Button> },
    ]} />
    {edit && <Dialog open fullWidth maxWidth="md" onClose={busy ? undefined : () => setEdit(null)}><form onSubmit={create}><DialogTitle>New Reconciliation</DialogTitle><DialogContent dividers>
      <Feedback error={error || banks.error} loading={banks.loading} retry={banks.refresh} />
      <ModuleForm value={edit} onChange={setEdit} fields={[{ name: "accountId", label: "Bank account", required: true, options: (banks.data || []).filter(row => row.isActive).map(row => ({ value: row.id, label: row.name })) }, { name: "statementDate", label: "Statement date", required: true, type: "date" }, { name: "statementBalance", label: "Statement closing balance", required: true, type: "number", min: -1000000000 }, { name: "notes", label: "Notes" }]} />
      <Alert severity="info" sx={{ mb: 2 }}>CSV columns: Date, Reference, Direction, Amount. Dates: YYYY-MM-DD. Direction: MoneyIn or MoneyOut. Amounts must be positive. Maximum 2,000 lines.</Alert>
      <Button component="label" variant="outlined">Import statement CSV<input type="file" accept=".csv,text/csv" hidden onChange={importFile} /></Button><Typography sx={{ mt: 2 }}>{edit.lines.length} statement lines ready to import</Typography>
    </DialogContent><DialogActions><Button disabled={busy} onClick={() => setEdit(null)}>Cancel</Button><Button type="submit" variant="contained" disabled={busy || banks.loading || !!banks.error}>Save Statement</Button></DialogActions></form></Dialog>}
    {detail && <Dialog open fullWidth maxWidth="lg" onClose={busy ? undefined : () => setDetail(null)}><DialogTitle>Reconciliation · {detail.statementDate} · {detail.status}</DialogTitle><DialogContent dividers>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <Box className="admin-summary-grid">{[["Statement", detail.statementBalance], ["Book balance", detail.bookBalance], ["Outstanding deposits", detail.outstandingDeposits], ["Outstanding withdrawals", detail.outstandingWithdrawals], ["Difference", detail.difference]].map(([label, value]) => <Card key={label}><CardContent><Typography color="text.secondary">{label}</Typography><Typography fontWeight={700}>{money(value)}</Typography></CardContent></Card>)}</Box>
      <TableContainer><Table><TableHead><TableRow>{["Date", "Reference", "Direction", "Amount", "Matched book entry"].map(label => <TableCell key={label}>{label}</TableCell>)}</TableRow></TableHead><TableBody>{detail.lines.map(line => <TableRow key={line.id}>
        <TableCell>{line.date}</TableCell><TableCell>{line.reference}</TableCell><TableCell>{line.direction}</TableCell><TableCell>{money(line.amount)}</TableCell><TableCell>
          <TextField select fullWidth size="small" label={`Match ${line.reference}`} value={line.matchedJournalLineId || ""} disabled={busy || !canWrite || detail.status === "Completed"} onChange={event => match(line, event.target.value)}>
            <MenuItem value="">Unmatched</MenuItem>{detail.books.filter(book => Math.round((book.debit - book.credit) * 100) === Math.round((line.direction === "MoneyIn" ? line.amount : -line.amount) * 100)).map(book => <MenuItem key={book.id} value={book.id}>{book.date} · {book.reference} · {money(book.debit - book.credit)}</MenuItem>)}
          </TextField></TableCell></TableRow>)}</TableBody></Table></TableContainer>
      {!detail.lines.length && <Typography>No statement lines were imported.</Typography>}
      {complete && <Alert severity="warning" sx={{ mt: 2 }} action={<Stack direction="row"><Button disabled={busy} onClick={() => setComplete(false)}>Cancel</Button><Button disabled={busy} onClick={finish}>Confirm completion</Button></Stack>}>Complete this reconciliation? Completed statements cannot be edited.</Alert>}
    </DialogContent><DialogActions><Button disabled={busy} onClick={() => setDetail(null)}>Close</Button>{canWrite && detail.status === "Draft" && <Button disabled={busy || detail.difference !== 0 || detail.lines.some(line => !line.matchedJournalLineId)} variant="contained" onClick={() => setComplete(true)}>Complete Reconciliation</Button>}</DialogActions></Dialog>}
  </Page>;
}

