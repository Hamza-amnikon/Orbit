import { useState } from "react";
import { Alert } from "@mui/material";
import { useAuth } from "../../../live/AuthContext";
import { useLoad } from "../../../live/data";
import { Page, Records } from "../../../live/shared";
import { financeApi } from "../../../services/financeApi";
export default function AuditHistory() {
  const { user } = useAuth(); const [search, setSearch] = useState(""); const [page, setPage] = useState(1);
  const list = useLoad(() => user.role === "Admin" ? financeApi.audit({ search, page }) : Promise.resolve({ data: [], total: 0 }), [search, page, user.role]);
  return <Page title="Audit History" subtitle="Who changed financial records and when">{user.role !== "Admin" ? <Alert severity="info">Administrator access is required.</Alert> : <Records {...list} rows={list.data?.data || []} total={list.data?.total || 0} search={search} setSearch={setSearch} page={page} setPage={setPage} columns={[
    { label: "Time", render: row => new Date(row.at).toLocaleString() }, { label: "Record", render: row => row.entityType }, { label: "Action", render: row => row.action }, { label: "User", render: row => row.actor }, { label: "Record ID", render: row => row.entityId },
  ]} />}</Page>;
}
