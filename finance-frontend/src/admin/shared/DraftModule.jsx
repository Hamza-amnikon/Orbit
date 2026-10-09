import { useState } from "react";
import { Alert, Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, Stack, TextField } from "@mui/material";
import { useAuth } from "../../live/AuthContext";
import { today, money } from "../../live/data";
import { Page, Records } from "../../live/shared";
import ModuleForm from "./ModuleForm";
import ModuleDetails from "./ModuleDetails";
import "./AdminModules.css";

function read(key) {
  try { const result = JSON.parse(sessionStorage.getItem(key) || "[]"); return Array.isArray(result) ? result : []; }
  catch { return []; }
}

export default function DraftModule({ config, Form = ModuleForm, Details = ModuleDetails }) {
  const { user, canWrite } = useAuth();
  const key = `sparkfinance.drafts.${user.id}.${config.key}`;
  const [rows, setRows] = useState(() => read(key));
  const [search, setSearch] = useState(""); const [page, setPage] = useState(1);
  const [filter, setFilter] = useState("All"); const [edit, setEdit] = useState(null);
  const [detail, setDetail] = useState(null); const [remove, setRemove] = useState(null);
  const [error, setError] = useState(""); const [notice, setNotice] = useState("");
  const allowed = canWrite && (!config.adminOnly || user.role === "Admin");
  function persist(next) {
    try { sessionStorage.setItem(key, JSON.stringify(next)); setRows(next); setPage(1); return true; }
    catch { setError("Browser storage is unavailable or full. Your changes were not saved."); return false; }
  }
  function open(row) {
    setError("");
    setEdit(row ? { ...row } : Object.fromEntries(config.fields.map(field => [field.name, field.default ?? (field.type === "date" ? today() : field.options?.[0] || "")])));
  }
  function save(event) {
    event.preventDefault(); setError("");
    const invalid = config.fields.find(field => field.required && !String(edit[field.name] ?? "").trim());
    if (invalid) { setError(`${invalid.label} is required.`); return; }
    const invalidNumber = config.fields.find(field => field.type === "number" && edit[field.name] !== "" &&
      (!Number.isFinite(Number(edit[field.name])) || Number(edit[field.name]) < (field.min ?? 0)));
    if (invalidNumber) { setError(`Enter a valid ${invalidNumber.label.toLowerCase()}.`); return; }
    const message = config.validate?.(edit, rows);
    if (message) { setError(message); return; }
    const record = { ...edit, id: edit.id || crypto.randomUUID() };
    if (persist(edit.id ? rows.map(row => row.id === edit.id ? record : row) : [...rows, record])) {
      setEdit(null); setNotice("Draft saved in this browser tab. It has not been posted to the database.");
    }
  }
  const filtered = rows.filter(row => (filter === "All" || row.status === filter) &&
    config.fields.some(field => String(row[field.name] ?? "").toLowerCase().includes(search.toLowerCase())));
  const columns = config.fields.filter(field => field.column !== false).slice(0, 6).map(field => ({
    label: field.label, render: row => field.name === "status" ? <Chip size="small" label={row.status} /> :
      field.currency ? money(Number(row[field.name])) : row[field.name] || "—",
  }));
  columns.push({ label: "Actions", render: row => <Stack direction="row" sx={{ flexWrap: "wrap" }}>
    <Button onClick={() => setDetail(row)}>View</Button>{allowed && <><Button onClick={() => open(row)}>Edit</Button><Button color="error" onClick={() => setRemove(row)}>Delete</Button></>}
  </Stack> });
  const statuses = config.fields.find(field => field.name === "status")?.options;
  return <Page title={config.title} subtitle={config.subtitle} action={allowed && <Button variant="contained" onClick={() => open()}>New {config.singular}</Button>}>
    <Alert severity="info" sx={{ mb: 2 }}>Frontend drafts only. These records stay in this browser tab until it is closed; they are not saved to SparkFinance or posted to the ledger.</Alert>
    {notice && <Alert severity="success" onClose={() => setNotice("")} sx={{ mb: 2 }}>{notice}</Alert>}
    {error && !edit && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
    <Records rows={filtered.slice((page - 1) * 25, page * 25)} total={filtered.length} page={page} setPage={setPage}
      search={search} setSearch={setSearch} refresh={() => { setRows(read(key)); setPage(1); }} columns={columns}
      extra={statuses && <TextField select size="small" label="Status" value={filter} sx={{ minWidth: 160 }} onChange={event => { setFilter(event.target.value); setPage(1); }}>
        {["All", ...statuses].map(status => <MenuItem key={status} value={status}>{status}</MenuItem>)}</TextField>} />
    {edit && <Dialog open fullWidth maxWidth="md" onClose={() => setEdit(null)}><form onSubmit={save}>
      <DialogTitle>{edit.id ? "Edit" : "New"} {config.singular}</DialogTitle><DialogContent dividers>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}<Form fields={config.fields} value={edit} onChange={setEdit} />
      </DialogContent><DialogActions><Button onClick={() => setEdit(null)}>Cancel</Button><Button type="submit" variant="contained">Save draft</Button></DialogActions>
    </form></Dialog>}
    {detail && <Details title={config.singular} fields={config.fields} record={detail} onClose={() => setDetail(null)} />}
    {remove && <Dialog open onClose={() => setRemove(null)}><DialogTitle>Delete this draft?</DialogTitle>
      <DialogContent>This removes the draft from this browser tab.</DialogContent><DialogActions><Button onClick={() => setRemove(null)}>Cancel</Button>
        <Button color="error" onClick={() => { if (persist(rows.filter(row => row.id !== remove.id))) { setRemove(null); setNotice("Draft deleted."); } }}>Delete draft</Button></DialogActions></Dialog>}
  </Page>;
}
