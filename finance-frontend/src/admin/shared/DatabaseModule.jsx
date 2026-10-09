import { useState } from "react";
import { Alert, Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle, Stack, TextField } from "@mui/material";
import { useAuth } from "../../live/AuthContext";
import { today, money, useLoad } from "../../live/data";
import { allRecords, financeApi } from "../../services/financeApi";
import { Feedback, Page, Records } from "../../live/shared";
import ModuleForm from "./ModuleForm";
import ModuleDetails from "./ModuleDetails";
import Attachments from "./Attachments";
import "./AdminModules.css";

export default function DatabaseModule({ config, Form = ModuleForm, Details = ModuleDetails }) {
  const { user, canWrite } = useAuth();
  const isExpense = ["expenses", "claims"].includes(config.key);
  const api = isExpense ? financeApi.expenses(config.key === "claims" ? "Claim" : "Expense") : financeApi.workspace(config.key);
  const list = useLoad(signal => allRecords(api, {}, signal), [config.key]);
  const choices = useLoad(async signal => {
    const result = {};
    await Promise.all([...new Set([...config.fields.map(field => field.choices).filter(Boolean), ...(isExpense ? ["banks"] : [])])].map(async key => {
      result[key] = (await allRecords(financeApi.workspace(key === "banks" ? "accounts" : "chart"), {}, signal)).filter(row => row.isActive).map(row => ({ label: key === "banks" ? row.name : `${row.code} · ${row.name}`, value: key === "banks" ? row.id : row.code }));
    })); return result;
  }, [config.key]);
  const fields = config.fields.map(field => field.choices ? { ...field, options: choices.data?.[field.choices] || [] } : field);
  const [search, setSearch] = useState(""); const [page, setPage] = useState(1);
  const [edit, setEdit] = useState(null); const [detail, setDetail] = useState(null); const [change, setChange] = useState(null);
  const [error, setError] = useState(""); const [notice, setNotice] = useState(""); const [busy, setBusy] = useState(false);
  const allowed = canWrite && (!config.adminOnly || user.role === "Admin");
  const canEdit = row => allowed && !row.isSystem && (isExpense ? row.status === "Draft" && (row.createdBy === user.id || user.role === "Admin") : !row.status || row.status === "Draft");
  function open(row) { setError(""); setEdit(row ? { ...row } : Object.fromEntries(fields.filter(field => field.name !== "status").map(field => [field.name, field.default ?? (field.type === "date" ? today() : field.options?.[0]?.value ?? field.options?.[0] ?? "")]))); }
  async function save(event) {
    event.preventDefault(); setError("");
    const invalid = fields.find(field => field.name !== "status" && field.required && !String(edit[field.name] ?? "").trim());
    if (invalid) { setError(`${invalid.label} is required.`); return; }
    const message = config.validate?.(edit, list.data || []); if (message) { setError(message); return; }
    const payload = { ...edit }; for (const field of fields) if (field.type === "number") payload[field.name] = Number(edit[field.name] || 0);
    setBusy(true);
    try { if (edit.id) await api.update(edit.id, payload); else await api.create(payload); setEdit(null); setNotice(`${config.singular} saved to SparkFinance.`); list.refresh(); }
    catch (failure) { setError(failure.message); } finally { setBusy(false); }
  }
  function transitions(row) {
    if (!allowed) return [];
    if (!isExpense) return row.status === "Draft" ? ["Posted"] : [];
    const owner = row.createdBy === user.id;
    if (row.status === "Draft" && (owner || user.role === "Admin")) return ["Submitted", "Cancelled"];
    if (row.status === "Rejected" && (owner || user.role === "Admin")) return ["Draft"];
    if (row.status === "Submitted" && user.role === "Admin") return [...(!owner ? ["Approved"] : []), "Rejected"];
    if (row.status === "Approved") return ["Paid"];
    return [];
  }
  async function confirm(event) {
    event.preventDefault(); setBusy(true); setError("");
    try { await api.changeStatus(detail.id, { ...change, bankAccountId: change.bankAccountId || null, rowVersion: detail.rowVersion }); setChange(null); setDetail(null); setNotice(`Status changed to ${change.status}.`); list.refresh(); }
    catch (failure) { setError(failure.message); } finally { setBusy(false); }
  }
  const rows = (list.data || []).filter(row => fields.some(field => String(row[field.name] ?? "").toLowerCase().includes(search.toLowerCase())));
  const columns = fields.filter(field => field.column !== false && field.name !== "status").slice(0, 6).map(field => ({ label: field.label, render: row => field.currency ? money(Number(row[field.name]),row.currency || "INR") : field.options?.find(option => option.value === row[field.name])?.label ?? String(row[field.name] ?? "—") }));
  if (fields.some(field => field.name === "status")) columns.push({ label: "Status", render: row => <Chip size="small" label={row.status || "—"} /> });
  if (isExpense) columns.push({ label: "Amount", render: row => money(row.amount, row.currency) });
  columns.push({ label: "Actions", render: row => <Stack direction="row"><Button onClick={() => { setError(""); setDetail(row); }}>View</Button>{canEdit(row) && <Button onClick={() => open(row)}>Edit</Button>}</Stack> });
  return <Page title={config.title} subtitle={config.subtitle} action={allowed && <Button variant="contained" onClick={() => open()}>New {config.singular}</Button>}>
    {notice && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setNotice("")}>{notice}</Alert>}
    {error && !edit && !change && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
    {isExpense && <Alert severity="info" sx={{ mb: 2 }}>Submit a draft for approval by a different administrator. Marking it paid records a reimbursement; it does not send money through a bank.</Alert>}
    {config.key === "accounts" && <Alert severity="info" sx={{ mb: 2 }}>Opening balances create ledger entries and cannot be edited afterward. Correct balances with a journal adjustment.</Alert>}
    <Records {...list} rows={rows.slice((page - 1) * 25, page * 25)} total={rows.length} page={page} setPage={setPage} search={search} setSearch={setSearch} columns={columns} />
    {edit && <Dialog open fullWidth maxWidth="md" onClose={busy ? undefined : () => setEdit(null)}><form onSubmit={save}><DialogTitle>{edit.id ? "Edit" : "New"} {config.singular}</DialogTitle>
      <DialogContent dividers><Feedback loading={choices.loading} error={choices.error || error} retry={choices.refresh} />
        <Form fields={fields.filter(field => field.name !== "status").map(field => ({ ...field, disabled: !!edit.id && config.key === "accounts" && ["openingBalance", "openingDate"].includes(field.name) }))} value={edit} onChange={setEdit} />
      </DialogContent><DialogActions><Button disabled={busy} onClick={() => setEdit(null)}>Cancel</Button><Button type="submit" variant="contained" disabled={busy || choices.loading || !!choices.error}>{busy ? "Saving…" : "Save"}</Button></DialogActions></form></Dialog>}
    {detail && !change && <Details title={config.singular} fields={[...fields, ...(isExpense ? [{ name: "decisionReason", label: "Decision reason" }, { name: "paidDate", label: "Paid date" }, { name: "paymentReference", label: "Payment reference" }] : [])]} record={detail} onClose={() => setDetail(null)} actions={transitions(detail).map(status => <Button key={status} onClick={() => { setError(""); setChange({ status, reason: "", paidDate: today(), paymentReference: "" }); }}>{status === "Posted" ? "Post to ledger" : status}</Button>)}>
      {isExpense && <Attachments source="Expense" record={detail} canUpload={canEdit(detail)} onUpdated={version => { setDetail({ ...detail, rowVersion: version }); list.refresh(); }} />}
    </Details>}
    {change && <Dialog open fullWidth maxWidth="sm" onClose={busy ? undefined : () => setChange(null)}><form onSubmit={confirm}><DialogTitle>Change status to {change.status}?</DialogTitle><DialogContent dividers>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}<Alert severity="info" sx={{ mb: 2 }}>Approved expenses and posted transactions create accounting entries. Posted records cannot be edited.</Alert>
      {change.status === "Rejected" && <TextField fullWidth required label="Rejection reason" value={change.reason} onChange={event => setChange({ ...change, reason: event.target.value })} />}
      {change.status === "Paid" && <ModuleForm value={change} onChange={setChange} fields={[{ name: "paidDate", label: "Paid date", type: "date", required: true }, { name: "paymentReference", label: "Payment reference", required: true }, { name: "bankAccountId", label: "Bank / cash account", options: [{ label: "Cash / unallocated payments", value: "" }, ...(choices.data?.banks || [])] }]} />}
    </DialogContent><DialogActions><Button disabled={busy} onClick={() => setChange(null)}>Cancel</Button><Button type="submit" variant="contained" disabled={busy}>{busy ? "Saving…" : "Confirm"}</Button></DialogActions></form></Dialog>}
  </Page>;
}
