import { money, today, useLoad } from "./data";
import { useState } from "react";
import { Alert, Box, Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, Stack, Table, TableBody, TableCell, TableHead, TableContainer, TableRow, TextField, Typography } from "@mui/material";
import { allRecords, financeApi } from "../services/financeApi";
import { useAuth } from "./AuthContext";
import { Editor, Feedback, Fields, Page, Records } from "./shared";
import Attachments from "../admin/shared/Attachments";
import { invoicePayment } from "../admin/shared/invoicePayment";
import { currencies } from "../admin/shared/currencies";

const labels = { Estimate: "Estimate", SalesOrder: "Sales Order", Invoice: "Invoice", CreditNote: "Credit Note", PurchaseOrder: "Purchase Order", Bill: "Bill", VendorCredit: "Vendor Credit" };
const purchaseKinds = ["PurchaseOrder","Bill","VendorCredit"];
const line = () => ({ item: "", quantity: 1, rate: 0, discount: 0, taxPercent: 0, description: "" });
export default function Documents({ kind }) {
  const { canWrite } = useAuth(); const label = labels[kind];
  const api = financeApi.documents(kind);
  const [search,setSearch] = useState(""); const [page,setPage] = useState(1); const [status,setStatus] = useState("");
  const list = useLoad(signal => api.list({ search,page,status },signal), [kind,search,page,status]);
  const [edit,setEdit] = useState(null); const [detail,setDetail] = useState(null); const [notice,setNotice] = useState(""); const [error,setError] = useState(""); const [busy,setBusy] = useState(false);
  async function view(row, editing = false) {
    setBusy(true); setError("");
    try { const result = await api.get(row.id); if (editing) setEdit(result.document); else setDetail(result); }
    catch(e) { setError(e.message); } finally { setBusy(false); }
  }
  async function change(next) {
    setBusy(true); setError("");
    try { await api.changeStatus(detail.document.id,next,detail.document.rowVersion); setDetail(null); setNotice(`${label} ${next.toLowerCase()}.`); list.refresh(); }
    catch(e) { setError(e.message); } finally { setBusy(false); }
  }
  return <Page title={`${label}s`} subtitle={`Create and manage ${label.toLowerCase()}s`} action={canWrite && <Button variant="contained" onClick={() => { setError(""); setEdit({ number: "",partyId: "",date: today(),dueDate: "",reference: "",notes: "",terms: "",billingAddress: "",shippingAddress: "",relatedDocumentId: "",branch: purchaseKinds.includes(kind) ? "Turbhe" : "Dubai", currency: purchaseKinds.includes(kind) ? "INR" : "AED", rateToInr: purchaseKinds.includes(kind) ? 1 : "", billingMonth: kind === "Invoice" ? today().slice(0,7)+"-01" : null,lines: [line()] }); }}>New {label}</Button>}>
    {notice && <Alert severity="success" onClose={() => setNotice("")} sx={{ mb: 2 }}>{notice}</Alert>}
    <Feedback error={!detail ? error : ""} />
    <Records {...list} rows={list.data?.data ?? []} total={list.data?.total ?? 0} page={page} setPage={setPage} search={search} setSearch={setSearch}
      extra={<TextField select size="small" label="Status" value={status} sx={{ width: 160 }} onChange={e => { setStatus(e.target.value); setPage(1); }}>
        <MenuItem value="">All statuses</MenuItem>{["Draft","Issued","Cancelled"].map(value => <MenuItem key={value} value={value}>{value}</MenuItem>)}
      </TextField>} columns={[
        { label, render: row => row.number },{ label: purchaseKinds.includes(kind) ? "Vendor" : "Client",render: row => row.partyName },{ label: "Date",render: row => row.date },
        { label: "Branch / Currency",render: row => `${row.branch} · ${row.currency}` },
        { label: "Total Amount",render: row => money(row.total, row.currency) },{ label: "Document Status",render: row => <Chip size="small" label={row.status} color={row.status === "Issued" ? "success" : "default"} /> },
        ...(["Invoice","Bill"].includes(kind) ? [
          { label: kind === "Invoice" ? "Payment Received" : "Payment Made", render: row => money(row.paid, row.currency) },
          { label: "Credits Applied", render: row => money(row.credited, row.currency) },
          { label: "Remaining Payment",render: row => row.status === "Issued" ? money(invoicePayment(row).remaining, row.currency) : "—" },
          { label: "Payment Status", render: row => { const payment = invoicePayment(row); return <Stack spacing={0.5}><Chip size="small" label={payment.status} color={payment.status === "Fully Paid" ? "success" : payment.status === "Partially Paid" ? "warning" : "default"} />{row.status === "Issued" && payment.remaining > 0 && row.dueDate && row.dueDate < today() && <Chip size="small" color="error" label="Overdue" />}</Stack>; } },
        ] : []),
        { label: "Actions",render: row => <Stack direction="row"><Button disabled={busy} onClick={() => view(row)}>View</Button>{canWrite && row.status === "Draft" && <Button disabled={busy} onClick={() => view(row,true)}>Edit</Button>}</Stack> },
      ]} />
    {edit && <DocumentEditor key={edit.id || "new"} kind={kind} initial={edit} onClose={() => setEdit(null)} onSaved={() => { setEdit(null); setNotice(`${label} saved as draft.`); list.refresh(); }} />}
    {detail && <Dialog open fullWidth maxWidth="md" onClose={busy ? undefined : () => { setDetail(null); setError(""); }}>
      <DialogTitle>{label} {detail.document.number} · {detail.document.status}</DialogTitle><DialogContent dividers>
        <Feedback error={error} /><Typography>Branch: {detail.document.branch} · Currency: {detail.document.currency} · INR rate: {detail.document.rateToInr} · Billing month: {detail.document.billingMonth?.slice(0,7) || "—"}</Typography><Typography>Date: {detail.document.date} · Due: {detail.document.dueDate || "—"}</Typography>
        <Typography sx={{ mb: 2 }}>Reference: {detail.document.reference || "—"}</Typography>
        <TableContainer><Table><TableHead><TableRow>{["Item","Quantity","Rate","Discount","Tax %","Total"].map(x => <TableCell key={x}>{x}</TableCell>)}</TableRow></TableHead>
          <TableBody>{detail.document.lines.map(x => <TableRow key={x.id}><TableCell>{x.item}<Typography variant="caption" display="block">{x.description}</Typography></TableCell><TableCell>{x.quantity}</TableCell><TableCell>{money(x.rate, detail.document.currency)}</TableCell><TableCell>{money(x.discount, detail.document.currency)}</TableCell><TableCell>{x.taxPercent}</TableCell><TableCell>{money(x.total, detail.document.currency)}</TableCell></TableRow>)}</TableBody>
        </Table></TableContainer>
        <Stack spacing={1} sx={{ my: 2 }}><Typography>Subtotal: {money(detail.document.subtotal, detail.document.currency)}</Typography><Typography>Discount: {money(detail.document.discount, detail.document.currency)}</Typography><Typography>Tax: {money(detail.document.tax, detail.document.currency)}</Typography><Typography variant="h6">Total: {money(detail.document.total, detail.document.currency)}</Typography>
          {detail.outstanding != null && <>
            <Typography>{kind === "Invoice" ? "Payment Received" : "Payment Made"}: {money(detail.paid, detail.document.currency)}</Typography>
            <Typography>Credits Applied: {money(detail.credited, detail.document.currency)}</Typography>
            <Typography fontWeight={700}>Remaining Payment: {detail.document.status === "Issued" ? money(detail.outstanding, detail.document.currency) : "—"}</Typography>
            <Typography>Payment Status: {invoicePayment({ ...detail.document, paid: detail.paid, credited: detail.credited }).status}</Typography>
            <Typography variant="h6">Payment History</Typography>
            {detail.payments?.length ? <TableContainer><Table size="small"><TableHead><TableRow>{["Payment", "Date", "Amount", "Method", "Reference"].map(label => <TableCell key={label}>{label}</TableCell>)}</TableRow></TableHead><TableBody>{detail.payments.map(payment => <TableRow key={payment.id}><TableCell>{payment.number}</TableCell><TableCell>{payment.date}</TableCell><TableCell>{money(payment.amount, payment.currency)}</TableCell><TableCell>{payment.method}</TableCell><TableCell>{payment.reference || "—"}</TableCell></TableRow>)}</TableBody></Table></TableContainer> : <Typography color="text.secondary">No payments recorded.</Typography>}
          </>}
          <Typography>Notes: {detail.document.notes || "—"}</Typography><Typography>Terms: {detail.document.terms || "—"}</Typography>
        </Stack>
        <Attachments source="Document" record={detail.document} canUpload={canWrite && detail.document.status === "Draft"} onUpdated={version => { setDetail({ ...detail, document: { ...detail.document, rowVersion: version } }); list.refresh(); }} />
      </DialogContent><DialogActions sx={{ p: 2 }}><Button disabled={busy} onClick={() => { setDetail(null); setError(""); }}>Close</Button>
        {canWrite && detail.document.status !== "Cancelled" && <Button color="error" disabled={busy} onClick={() => { if (window.confirm(`Cancel ${detail.document.number}? This action cannot be undone.`)) change("Cancelled"); }}>Cancel document</Button>}
        {canWrite && detail.document.status === "Draft" && <Button variant="contained" disabled={busy} onClick={() => { if (window.confirm(`Issue ${detail.document.number}? Issued documents cannot be edited.`)) change("Issued"); }}>Issue {label}</Button>}
      </DialogActions>
    </Dialog>}
  </Page>;
}

function DocumentEditor({ kind, initial, onClose, onSaved }) {
  const [value,setValue] = useState(initial); const [busy,setBusy] = useState(false); const [error,setError] = useState("");
  const isPurchase = purchaseKinds.includes(kind); const isCredit = ["CreditNote","VendorCredit"].includes(kind);
  const linkedKind = kind === "CreditNote" ? "Invoice" : "Bill";
  const choices = useLoad(async signal => {
    const parties = await allRecords(isPurchase ? financeApi.vendors : financeApi.customers,{},signal);
    const documents = isCredit ? await allRecords(financeApi.documents(linkedKind),{ status: "Issued" },signal) : [];
    const rates = await financeApi.currencies();
    return { parties,documents,rates: rates.rates };
  }, [kind]);
  const setLine = (index,key,newValue) => setValue(current => ({ ...current,lines: current.lines.map((x,i) => i === index ? { ...x,[key]: newValue } : x) }));
  async function save(event) {
    event.preventDefault(); setBusy(true); setError("");
    try {
      const payload = { ...value,dueDate: value.dueDate || null,relatedDocumentId: value.relatedDocumentId || null,
        branch: value.branch || "Dubai", currency: value.currency || "AED", rateToInr: Number(value.rateToInr), billingMonth: value.billingMonth || null,
        lines: value.lines.map(x => ({ item: x.item,description: x.description || "",quantity: Number(x.quantity),rate: Number(x.rate),discount: Number(x.discount),taxPercent: Number(x.taxPercent) })) };
      const api = financeApi.documents(kind); if (value.id) await api.update(value.id,payload); else await api.create(payload); onSaved();
    } catch(e) { setError(e.message); } finally { setBusy(false); }
  }
  const estimate = value.lines.reduce((sum,x) => { const net = Number(x.quantity)*Number(x.rate)-Number(x.discount); return sum + net*(1+Number(x.taxPercent)/100); },0);
  return <Editor title={`${initial.id ? "Edit" : "New"} ${labels[kind]}`} onClose={onClose} onSubmit={save} busy={busy} disabled={choices.loading || !!choices.error || !value.partyId || (isCredit && !value.relatedDocumentId)} error={error}>
    <Feedback {...choices} retry={choices.refresh} />
    <Stack spacing={2} sx={{ py: 1 }}>
      <TextField select label={isPurchase ? "Vendor" : "Client"} required value={value.partyId} onChange={e => {
        const party = choices.data.parties.find(p => p.id === e.target.value); const currency = party.currency;
        const rate = choices.data.rates.find(r => r.currency === currency && r.date <= value.date);
        setValue({ ...value, partyId: party.id, branch: party.branch, currency, rateToInr: currency === "INR" ? 1 : rate?.rateToInr || "", relatedDocumentId: "", billingAddress: [party.address,party.city,party.state,party.country,party.postalCode].filter(Boolean).join(", ") });
      }}>
        {(choices.data?.parties ?? []).filter(p => p.isActive || p.id === value.partyId).map(p => <MenuItem key={p.id} value={p.id}>{p.name} · {p.code}</MenuItem>)}
      </TextField>
      {!choices.loading && !choices.error && !choices.data?.parties.some(p => p.isActive) && <Alert severity="info">Create an active {isPurchase ? "vendor" : "client"} before adding a document.</Alert>}
      {isCredit && <TextField select required label={`Related ${linkedKind.toLowerCase()}`} value={value.relatedDocumentId || ""} onChange={e => { const original = choices.data.documents.find(d => d.id === e.target.value); setValue({ ...value,relatedDocumentId: original.id, branch: original.branch, currency: original.currency, rateToInr: original.rateToInr }); }}>
        {(choices.data?.documents ?? []).filter(d => d.partyId === value.partyId).map(d => <MenuItem key={d.id} value={d.id}>{d.number} · {money(d.total-d.paid-d.credited, d.currency)}</MenuItem>)}
      </TextField>}
      <Fields fields={[["number",`${labels[kind]} number`,true,"text",50],["date","Date",true,"date"],["dueDate","Due date",false,"date"],["reference","Reference",false,"text",200]]} value={value} setValue={setValue} />
      <TextField select required label="Managing branch" disabled={isCredit} value={value.branch || (isPurchase ? "Turbhe" : "Dubai")} onChange={e => setValue({ ...value,branch: e.target.value })}>{["Dubai","Turbhe"].map(branch => <MenuItem key={branch} value={branch}>{branch}</MenuItem>)}</TextField>
      <TextField select required label="Invoice currency" disabled={isCredit} value={value.currency || (isPurchase ? "INR" : "AED")} onChange={e => { const currency = e.target.value; const rate = choices.data.rates.find(r => r.currency === currency && r.date <= value.date); setValue({ ...value,currency,rateToInr: currency === "INR" ? 1 : rate?.rateToInr || "" }); }}>{currencies.map(code => <MenuItem key={code} value={code}>{code}</MenuItem>)}</TextField>
      <TextField required type="number" label={`INR per 1 ${value.currency || "AED"}`} value={value.rateToInr ?? ""} disabled={value.currency === "INR" || isCredit} onChange={e => setValue({ ...value,rateToInr: e.target.value })} helperText="Latest available rate is suggested when selecting a client or currency. Confirm your booking rate; issued invoices keep it." slotProps={{ htmlInput: { min: 0.00000001, max: 100000, step: "0.00000001" } }} />
      {kind === "Invoice" && <TextField type="month" required label="Monthly service billing period" value={value.billingMonth?.slice(0,7) || ""} onChange={e => setValue({ ...value,billingMonth: e.target.value ? `${e.target.value}-01` : "" })} slotProps={{ inputLabel: { shrink: true } }} />}
      <Typography fontWeight={700}>{kind === "Invoice" ? "Monthly services · Quantity is number of months" : "Items"}</Typography>
      {value.lines.map((x,index) => <Box key={index} sx={{ p: 2,border: "1px solid",borderColor: "divider",borderRadius: 2 }}>
        <Box sx={{ display: "grid",gridTemplateColumns: { xs: "1fr",sm: "2fr 1fr 1fr" },gap: 2 }}>
          <TextField label="Item" required value={x.item} onChange={e => setLine(index,"item",e.target.value)} slotProps={{ htmlInput: { maxLength: 200 } }} />
          {[["quantity","Quantity",0.0001,1000000],["rate","Rate",0,1000000000],["discount","Discount amount",0,Number(x.quantity)*Number(x.rate)],["taxPercent","Tax %",0,100]].map(([key,label,min,max]) => <TextField key={key} label={label} type="number" required value={x[key]} onChange={e => setLine(index,key,e.target.value)} slotProps={{ htmlInput: { min,max,step: key === "quantity" ? "0.0001" : "0.01" } }} />)}
          <TextField label="Description" value={x.description || ""} onChange={e => setLine(index,"description",e.target.value)} slotProps={{ htmlInput: { maxLength: 1000 } }} />
        </Box><Button color="error" disabled={value.lines.length === 1} onClick={() => setValue({ ...value,lines: value.lines.filter((_,i) => i !== index) })}>Remove item</Button>
      </Box>)}
      <Button variant="outlined" disabled={value.lines.length >= 100} onClick={() => setValue({ ...value,lines: [...value.lines,line()] })}>Add item</Button>
      <Typography>Estimated total: {money(estimate, value.currency || "AED")} · Final totals are calculated when saved.</Typography>
      <Fields fields={[["billingAddress","Billing address",false,"text",1000],["shippingAddress","Shipping address",false,"text",1000],["notes","Notes",false,"text",2000],["terms","Terms",false,"text",2000]]} value={value} setValue={setValue} />
    </Stack>
  </Editor>;
}
