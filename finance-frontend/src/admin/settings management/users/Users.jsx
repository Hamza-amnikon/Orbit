import { useState } from "react";
import { Alert, Button, Card, CardContent, Typography } from "@mui/material";
import { Page, Editor, Records } from "../../../live/shared";
import { useLoad } from "../../../live/data";
import { useAuth } from "../../../live/AuthContext";
import { financeApi } from "../../../services/financeApi";
import UserForm from "./UserForm";
import "./Users.css";

export default function Users() {
  const { user } = useAuth(); const [edit, setEdit] = useState(null); const [busy, setBusy] = useState(false);
  const [error, setError] = useState(""); const [notice, setNotice] = useState("");
  const [search, setSearch] = useState(""); const [page, setPage] = useState(1);
  const list = useLoad(signal => user.role === "Admin" ? financeApi.users.list({ search, page }, signal) : Promise.resolve({ data: [], total: 0 }), [search, page, user.role]);
  async function save(event) {
    event.preventDefault(); setBusy(true); setError("");
    try { const payload = { ...edit, email: edit.email.trim(), name: edit.name.trim() }; const result = edit.id ? await financeApi.users.update(edit.id, payload) : await financeApi.createUser(payload); setNotice(`User ${result.email} saved with the ${result.role} role.`); setEdit(null); list.refresh(); }
    catch (failure) { setError(failure.message); } finally { setBusy(false); }
  }
  return <Page title="Users" subtitle="Manage access to SparkFinance" action={user.role === "Admin" && <Button variant="contained" onClick={() => { setError(""); setEdit({ name: "", email: "", password: "", role: "Finance" }); }}>New User</Button>}>
    <Alert severity="info" sx={{ mb: 2 }}>Administrators can create users, change roles, and disable accounts. Your own account cannot be disabled, and at least one active administrator must remain.</Alert>
    {notice && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setNotice("")}>{notice}</Alert>}
    <Card><CardContent><Typography variant="h6">Your account</Typography><Typography sx={{ mt: 2 }}>{user.name}</Typography><Typography color="text.secondary">{user.email}</Typography><Typography sx={{ mt: 1 }}>Role: {user.role}</Typography></CardContent></Card>
    {user.role === "Admin" && <Records {...list} rows={list.data?.data || []} total={list.data?.total || 0} search={search} setSearch={setSearch} page={page} setPage={setPage} columns={[
      { label: "Name", render: row => row.name }, { label: "Email", render: row => row.email }, { label: "Role", render: row => row.role }, { label: "Status", render: row => row.isActive ? "Active" : "Disabled" }, { label: "Actions", render: row => <Button onClick={() => { setError(""); setEdit({ ...row }); }}>Edit</Button> },
    ]} />}
    {edit && <Editor title={edit.id ? "Edit User" : "Create User"} onClose={() => setEdit(null)} onSubmit={save} busy={busy} error={error}><UserForm value={edit} onChange={setEdit} /></Editor>}
  </Page>;
}
