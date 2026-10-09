import { useLoad } from "./data";
import { useState } from "react";
import { Alert, Button, Chip, MenuItem, TextField } from "@mui/material";
import { useParams } from "react-router-dom";
import { financeApi } from "../services/financeApi";
import { useAuth } from "./AuthContext";
import { Editor, Feedback, Fields, Page, Records } from "./shared";
import { currencies, suggestedCurrency } from "../admin/shared/currencies";

const fields = [["name","Name",true,"text",200],["code","Code",true,"text",50],["companyName","Company name",false,"text",200],["contactPerson","Contact person",false,"text",200],
  ["email","Email",false,"email",254],["phone","Phone",false,"tel",25],["address","Address",false,"text",1000],["city","City",false,"text",100],["state","State",false,"text",100],["country","Country",false,"text",100],
  ["postalCode","Postal code",false,"text",20],["gstNumber","GST number",false,"text",15],["pan","PAN",false,"text",10],["bankName","Bank name",false,"text",100],["accountNumber","Account number",false,"text",34],
  ["ifscCode","IFSC",false,"text",11],["paymentTerms","Payment terms",false,"text",200],["notes","Notes",false,"text",2000]];
export default function Parties({ kind }) {
  const { id } = useParams();
  const label = kind === "Customer" ? "Client" : "Vendor";
  const api = kind === "Customer" ? financeApi.customers : financeApi.vendors;
  const { canWrite } = useAuth();
  const [search, setSearch] = useState(""); const [page, setPage] = useState(1);
  const list = useLoad(signal => id ? api.get(id, signal).then(row => ({ data: [row], total: 1 })) : api.list({ search, page }, signal), [kind, id, search, page]);
  const [edit, setEdit] = useState(null); const [busy, setBusy] = useState(false); const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  function open(row = { name: "", code: "", country: kind === "Customer" ? "United Arab Emirates" : "India", branch: kind === "Customer" ? "Dubai" : "Turbhe", currency: kind === "Customer" ? "AED" : "INR", isActive: true }) { setError(""); setEdit(row); }
  async function save(e) {
    e.preventDefault(); setBusy(true); setError("");
    const payload = { ...edit, email: edit.email?.trim() || null };
    try { if (edit.id) await api.update(edit.id, payload); else await api.create(payload); setEdit(null); setNotice(`${label} saved.`); list.refresh(); }
    catch (e) { setError(e.message); } finally { setBusy(false); }
  }
  return <Page title={`${label}s`} subtitle={`Manage your ${label.toLowerCase()} records`} action={canWrite && <Button variant="contained" onClick={() => open()}>New {label}</Button>}>
    {notice && <Alert onClose={() => setNotice("")} severity="success" sx={{ mb: 2 }}>{notice}</Alert>}
    <Records {...list} rows={list.data?.data ?? []} total={list.data?.total ?? 0} page={page} setPage={setPage} search={search} setSearch={setSearch} columns={[
      { label, render: row => <><strong>{row.name}</strong><br />{row.code}</> },{ label: "Contact", render: row => <>{row.contactPerson || row.companyName}<br />{row.email || row.phone || "—"}</> },
      { label: "Location", render: row => [row.city,row.state,row.country].filter(Boolean).join(", ") || "—" },{ label: "Branch / Currency", render: row => `${row.branch} · ${row.currency}` },{ label: "Status", render: row => <Chip size="small" label={row.isActive ? "Active" : "Archived"} color={row.isActive ? "success" : "default"} /> },
      { label: "Actions", render: row => <Button onClick={() => open(row)}>{canWrite ? "View / edit" : "View"}</Button> },
    ]} />
    {edit && (canWrite ? <Editor title={`${edit.id ? "Edit" : "New"} ${label}`} onClose={() => setEdit(null)} onSubmit={save} busy={busy} error={error}>
      <Fields fields={fields} value={edit} setValue={update => setEdit(current => { const next = typeof update === "function" ? update(current) : update; return next.country !== current.country ? { ...next, currency: suggestedCurrency(next.country) || current.currency } : next; })} />
      <TextField select label="Managing branch" fullWidth value={edit.branch || "Turbhe"} onChange={e => setEdit({ ...edit, branch: e.target.value })}>{["Dubai", "Turbhe"].map(branch => <MenuItem key={branch} value={branch}>{branch}</MenuItem>)}</TextField>
      <TextField select label="Agreed billing currency" fullWidth value={edit.currency || "INR"} onChange={e => setEdit({ ...edit, currency: e.target.value })}>{currencies.map(code => <MenuItem key={code} value={code}>{code}</MenuItem>)}</TextField>
      <TextField select label="Status" fullWidth value={edit.isActive ? "active" : "archived"} onChange={e => setEdit({ ...edit, isActive: e.target.value === "active" })}>
        <MenuItem value="active">Active</MenuItem><MenuItem value="archived">Archived</MenuItem>
      </TextField>
    </Editor> : <ReadParty row={edit} onClose={() => setEdit(null)} />)}
  </Page>;
}
function ReadParty({ row, onClose }) {
  return <Page title={row.name} action={<Button onClick={onClose}>Close</Button>}><Feedback />{fields.map(([name,label]) => <p key={name}><strong>{label}:</strong> {row[name] || "—"}</p>)}</Page>;
}
