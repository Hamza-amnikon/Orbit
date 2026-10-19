import { money, today, useLoad } from "./data";
import { useState } from "react";
import { Alert, Button, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, Stack, TextField, Typography } from "@mui/material";
import { allRecords, financeApi } from "../services/financeApi";
import { useAuth } from "./AuthContext";
import { Editor, Feedback, Fields, Page, Records } from "./shared";

export default function Payments({ direction }) {
  const { canWrite } = useAuth(); const [search,setSearch] = useState(""); const [page,setPage] = useState(1);
  const list = useLoad(signal => financeApi.payments(direction).list({ search,page },signal),[direction,search,page]);
  const [open,setOpen] = useState(false); const [detail,setDetail] = useState(null); const [notice,setNotice] = useState("");
  const label = direction === "Made" ? "Payments Made" : "Payments Received";
  return <Page title={label} subtitle="Record payments against issued invoices and bills" action={canWrite && <Button variant="contained" onClick={() => setOpen(true)}>Record payment</Button>}>
    {notice && <Alert severity="success" onClose={() => setNotice("")} sx={{ mb: 2 }}>{notice}</Alert>}
    <Records {...list} rows={list.data?.data ?? []} total={list.data?.total ?? 0} page={page} setPage={setPage} search={search} setSearch={setSearch} columns={[
      { label: "Payment",render: x => x.number },{ label: direction === "Made" ? "Vendor" : "Client",render: x => x.partyName },{ label: "Document",render: x => x.documentNumber },
      { label: "Branch / Currency",render: x => `${x.branch} · ${x.currency}` },{ label: "Date",render: x => x.date },{ label: "Amount",render: x => money(x.amount,x.currency) },{ label: "Method",render: x => x.method },{ label: "Actions",render: x => <Button onClick={() => setDetail(x)}>View</Button> },
    ]} />
    {open && <PaymentEditor direction={direction} onClose={() => setOpen(false)} onSaved={() => { setOpen(false); setNotice("Payment recorded."); list.refresh(); }} />}
    {detail && <Dialog open onClose={() => setDetail(null)} fullWidth><DialogTitle>{detail.number}</DialogTitle><DialogContent dividers><Stack spacing={2}>
      <Typography>{detail.partyName} · {detail.documentNumber}</Typography><Typography>Date: {detail.date}</Typography><Typography variant="h6">{money(detail.amount,detail.currency)}</Typography>
      <Typography>Method: {detail.method}</Typography><Typography>Reference: {detail.reference || "—"}</Typography><Typography>Notes: {detail.notes || "—"}</Typography>
      <Typography color="text.secondary">Recorded payments are permanent ledger entries.</Typography>
    </Stack></DialogContent><DialogActions><Button onClick={() => setDetail(null)}>Close</Button></DialogActions></Dialog>}
  </Page>;
}
function PaymentEditor({ direction,onClose,onSaved }) {
  const [value,setValue] = useState({ number: "",documentId: "",date: today(),amount: "",method: "BankTransfer",reference: "",notes: "" });
  const [busy,setBusy] = useState(false); const [error,setError] = useState("");
  const kind = direction === "Made" ? "Bill" : "Invoice";
  const choices = useLoad(signal => allRecords(financeApi.documents(kind),{ status: "Issued" },signal).then(rows => rows.filter(x => x.total-x.paid-x.credited > 0)),[kind]);
  const selected = choices.data?.find(x => x.id === value.documentId);
  const banks = useLoad(signal => allRecords(financeApi.workspace("accounts"), {}, signal), []);
  async function save(e) {
    e.preventDefault(); setBusy(true); setError("");
    try { await financeApi.payments(direction).create({ ...value, bankAccountId: value.bankAccountId || null, amount: Number(value.amount),rateToInr: Number(value.rateToInr) }); onSaved(); }
    catch(e) { setError(e.message); choices.refresh(); } finally { setBusy(false); }
  }
  return <Editor title="Record payment" onClose={onClose} onSubmit={save} busy={busy} disabled={choices.loading || !!choices.error || !selected} error={error}>
    <Feedback {...choices} retry={choices.refresh} /><Stack spacing={2} sx={{ py: 1 }}>
      <TextField select required label={kind} value={choices.data ? value.documentId : ""} onChange={e => setValue({ ...value,documentId: e.target.value,rateToInr: choices.data.find(row => row.id === e.target.value)?.rateToInr,amount: "" })}>
        {(choices.data ?? []).map(x => <MenuItem key={x.id} value={x.id}>{x.number} · {x.partyName} · {money(x.total-x.paid-x.credited,x.currency)} remaining</MenuItem>)}
      </TextField>
      {!choices.loading && choices.data?.length === 0 && <Alert severity="info">Create and issue an {kind.toLowerCase()} with an outstanding balance first.</Alert>}
      {selected && <Alert severity="info">Total Amount: {money(selected.total,selected.currency)} · {direction === "Made" ? "Payment Made" : "Payment Received"}: {money(selected.paid,selected.currency)} · Credits: {money(selected.credited,selected.currency)} · Remaining Payment: {money(selected.total-selected.paid-selected.credited,selected.currency)}</Alert>}
      <Fields fields={[["number","Payment number",true,"text",50],["date","Payment date",true,"date"],["reference","Reference",false,"text",200],["notes","Notes",false,"text",2000]]} value={value} setValue={setValue} />
      <TextField type="number" label={`Payment amount (${selected?.currency || "invoice currency"})`} required value={value.amount} onChange={e => setValue({ ...value,amount: e.target.value })} slotProps={{ htmlInput: { min: 0.01,max: selected ? selected.total-selected.paid-selected.credited : undefined,step: "0.01" } }} />
      {selected && <><TextField type="number" required label={`Settlement rate: INR per 1 ${selected.currency}`} disabled={selected.currency === "INR"} value={value.rateToInr ?? ""} onChange={e => setValue({ ...value,rateToInr: e.target.value })} slotProps={{ htmlInput: { min: 0.00000001,max: 100000,step: "0.00000001" } }} /><Alert severity="info">INR bank/cash amount: {money(Number(value.amount || 0)*Number(value.rateToInr || 0))}. Enter the rate matching the actual settlement. Exchange gains/losses are posted separately. Payments are entered in the invoice currency.</Alert></>}
      <TextField select label="Payment method" required value={value.method} onChange={e => setValue({ ...value,method: e.target.value })}>{["BankTransfer","Cash","Cheque","Card","UPI"].map(x => <MenuItem key={x} value={x}>{x === "BankTransfer" ? "Bank transfer" : x}</MenuItem>)}</TextField>
      <Feedback {...banks} retry={banks.refresh} /><TextField select label="Bank / cash account" value={value.bankAccountId || ""} onChange={event => setValue({ ...value, bankAccountId: event.target.value })}>
        <MenuItem value="">Cash / unallocated payments</MenuItem>{(banks.data || []).filter(bank => bank.isActive).map(bank => <MenuItem key={bank.id} value={bank.id}>{bank.name}</MenuItem>)}
      </TextField>
    </Stack>
  </Editor>;
}
