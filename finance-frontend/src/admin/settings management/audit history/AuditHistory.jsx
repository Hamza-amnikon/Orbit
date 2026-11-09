import { useState } from "react";
import {
    Alert,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    MenuItem,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Typography
} from "@mui/material";
import { useAuth } from "../../../live/AuthContext";
import { today, useLoad } from "../../../live/data";
import {
    Page,
    Records,
    Feedback
} from "../../../live/shared";
import {
    getAuditHistory,
    getAuditChoices,
    auditChanges,
    auditActivityLabel,
    exportAuditHistory
} from "./AuditHistoryService";
export default function AuditHistory()
{
    const {
        user
    } = useAuth();
    const role = user?.role || "";
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [from, setFrom] = useState(`${today().slice(0, 7)}-01`);
    const [to, setTo] = useState(today());
    const [service, setService] = useState("");
    const [entityType, setEntityType] = useState("");
    const [branch, setBranch] = useState("");
    const [action, setAction] = useState("");
    const [activity, setActivity] = useState("Business");
    const [detail, setDetail] = useState(null);
    const [error, setError] = useState("");
    const [exporting, setExporting] = useState(false);
    const filters = {
        from,
        to,
        search,
        service,
        entityType,
        branch,
        action,
        activity
    };
    const list = useLoad(signal => role === "Admin" ? getAuditHistory({
        ...filters,
        page
    }, role, signal) : {
        data: [],
        total: 0
    }, [from, to, search, service, entityType, branch, action, activity, page, role]);
    const choices = useLoad(signal => role === "Admin" ? getAuditChoices(role, signal, activity) : {}, [role, activity]);
    const change = setter => event =>
    {
        setter(event.target.value);
        setPage(1);
    };
    async function exportCsv()
    {
        setExporting(true);
        setError("");
        try
        {
            await exportAuditHistory(filters, role);
        } catch (failure)
        {
            setError(failure.message);
        } finally
        {
            setExporting(false);
        }
    }
    const value = item => item == null ? "—" : typeof item === "object" ? JSON.stringify(item) : String(item);
    return <Page
        title="Audit History"
        subtitle="Review business changes and inspect background activity when needed"
        action={role === "Admin" && <Button
        variant="outlined"
        disabled={exporting || list.loading || !!list.error || !list.data?.total}
        onClick={exportCsv}
    >{exporting ? "Exporting…" : "Export CSV"}</Button>}
    >
    {role !== "Admin" ? <Alert severity="info">Administrator access is required.</Alert> : <>
      <Alert severity="info" sx={{
                mb: 2
            }}>Business changes are shown by default. Choose Technical updates for background retry timing, Snapshots for existing-record baselines, or All activity for the full history. No records are removed. Before and after values are shown only for captured fields. User identity is shown when available; local operators are unverified. Dates use your browser's local time. Export includes the selected activity and filters, up to 10,000 events.</Alert>
      {error && <Alert severity="error" sx={{
                mb: 2
            }}>{error}</Alert>}
      <Stack direction="row" sx={{
                gap: 2,
                mb: 3,
                flexWrap: "wrap"
            }}>
        <TextField
            select
            label="Activity"
            value={activity}
            onChange={event =>
            {
                setActivity(event.target.value);
                setService("");
                setEntityType("");
                setBranch("");
                setAction("");
                setPage(1);
            }}
            sx={{ minWidth: 190 }}
        >
            <MenuItem value="Business">Business changes</MenuItem>
            <MenuItem value="Technical">Technical updates</MenuItem>
            <MenuItem value="Snapshots">Existing record snapshots</MenuItem>
            <MenuItem value="All">All activity</MenuItem>
        </TextField>
        <TextField
                    label="From"
                    type="date"
                    value={from}
                    onChange={change(setFrom)}
                    slotProps={{
                    inputLabel: {
                        shrink: true
                    }
                }}
                />
        <TextField
                    label="To"
                    type="date"
                    value={to}
                    onChange={change(setTo)}
                    slotProps={{
                    inputLabel: {
                        shrink: true
                    }
                }}
                />
        {[["Service", service, setService, choices.data?.services], ["Record type", entityType, setEntityType, choices.data?.entityTypes], ["Branch", branch, setBranch, choices.data?.branches], ["Action", action, setAction, choices.data?.actions]].map(([label, selected, setter, options]) => <TextField
                    key={label}
                    select
                    label={label}
                    value={selected}
                    onChange={change(setter)}
                    sx={{
                    minWidth: 170
                }}
                ><MenuItem value="">All</MenuItem>
            {(options || []).map(option => <MenuItem key={option} value={option}>{option}</MenuItem>)}</TextField>)}
        <Button disabled={list.loading} onClick={() =>
                {
                    list.refresh();
                    choices.refresh();
                }}>Refresh</Button>
      </Stack>
      <Feedback
                loading={choices.loading}
                error={choices.error}
                retry={choices.refresh}
            />
      <Records
                {...list}
                rows={list.data?.data || []}
                total={list.data?.total || 0}
                search={search}
                setSearch={setSearch}
                page={page}
                setPage={setPage}
                columns={[{
                label: "Time",
                render: row => new Date(row.atUtc).toLocaleString()
            }, {
                label: "Activity",
                render: row => auditActivityLabel(row)
            }, {
                label: "Service",
                render: row => row.service
            }, {
                label: "Record",
                render: row => row.entityType
            }, {
                label: "Record ID",
                render: row => row.entityId
            }, {
                label: "Branch",
                render: row => row.branch || "—"
            }, {
                label: "Action",
                render: row => row.action
            }, {
                label: "Actor",
                render: row => row.actor
            }, {
                label: "Identity",
                render: row => row.actorKind
            }, {
                label: "Changes",
                render: row => <Button onClick={() => setDetail(row)}>View</Button>
            }]}
            />
      {detail && <Dialog
                open
                fullWidth
                maxWidth="md"
                onClose={() => setDetail(null)}
            ><DialogTitle>{detail.entityType} · {detail.entityId} · {detail.action}</DialogTitle>
        <DialogContent dividers><Typography variant="body2" sx={{
                        mb: 2
                    }}>{new Date(detail.atUtc).toLocaleString()} · {detail.actor} · {detail.actorKind}</Typography>
          {detail.action === "Snapshot" && <Alert severity="info" sx={{
                        mb: 2
                    }}>Baseline snapshot only. Earlier changes and previous values are unavailable.</Alert>}
          <TableContainer><Table size="small"><TableHead><TableRow><TableCell>Field</TableCell><TableCell>Before</TableCell><TableCell>After</TableCell></TableRow></TableHead>
            <TableBody>{auditChanges(detail).map(row => <TableRow key={row.field}><TableCell>{row.field}</TableCell><TableCell sx={{
                                        overflowWrap: "anywhere"
                                    }}>{value(row.before)}</TableCell><TableCell sx={{
                                        overflowWrap: "anywhere"
                                    }}>{value(row.after)}</TableCell></TableRow>)}</TableBody>
          </Table></TableContainer>
          {detail.correlationId && <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{
                        mt: 2,
                        display: "block"
                    }}
                    >Request reference: {detail.correlationId}</Typography>}
        </DialogContent><DialogActions><Button onClick={() => setDetail(null)}>Close</Button></DialogActions>
      </Dialog>}
    </>}
  </Page>;
}
