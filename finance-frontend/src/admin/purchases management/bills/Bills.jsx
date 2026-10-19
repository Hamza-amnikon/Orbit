import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Alert, Box, Button, Card, CardContent, Chip, MenuItem, TextField, Typography } from "@mui/material";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import { useAuth } from "../../../context/AuthContext";
import { Page, Records } from "../../../live/shared";
import { useLoad } from "../../../live/data";
import { getBills, getBillSummary } from "./BillService";
import { formatDate, money, orderStatus, billStatuses } from "./BillHelpers";
import BillForm from "./BillForm";
import "./BillWorkspace.css";

export default function Bills() {
    const navigate = useNavigate();
    const { canWrite } = useAuth();
    const [search, setSearch] = useState("");
    const [status, setStatus] = useState("");
    const [page, setPage] = useState(1);
    const [adding, setAdding] = useState(false);
    const [debouncedSearch, setDebouncedSearch] = useState("");
    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(search), 250);
        return () => clearTimeout(timer);
    }, [search]);
    const list = useLoad(async signal => {
        const result = await getBills({ page, search: debouncedSearch, status }, signal);
        const lastPage = Math.max(1, Math.ceil(result.total / 25));
        if (!signal.aborted && page > lastPage) setPage(lastPage);
        return result;
    }, [page, debouncedSearch, status]);
    const summary = useLoad(getBillSummary, []);
    const total = list.data?.total ?? 0;


    function refresh() { list.refresh(); summary.refresh(); }
    return <Page title="Bills" subtitle="Record vendor invoices and manage bills"
        action={canWrite && <Button variant="contained" startIcon={<AddRoundedIcon />}
            onClick={() => setAdding(true)}>New Bill</Button>}>
        <Box className="bill-summary-grid">
            {[["Total Bills", "total"], ["Draft", "draft"], ["Issued", "issued"], ["Cancelled", "cancelled"]].map(([label, key]) =>
                <Card key={key}><CardContent><Typography color="text.secondary" variant="body2">{label}</Typography>
                    <Typography variant="h5" fontWeight={700} sx={{ mt: 1 }}>{summary.data?.[key] ?? "—"}</Typography>
                </CardContent></Card>)}
        </Box>
        {summary.error && <Alert severity="warning" sx={{ mb: 2 }}>Bill counts could not be loaded.</Alert>}
        <Records {...list} rows={list.data?.data ?? []} total={total} page={page} setPage={setPage}
            search={search} setSearch={setSearch} refresh={refresh}
            extra={<TextField select label="Status" size="small" value={status} sx={{ minWidth: 160 }}
                onChange={event => { setStatus(event.target.value); setPage(1); }}>
                <MenuItem value="">All statuses</MenuItem>
                {billStatuses.map((label, index) => <MenuItem key={label} value={String(index)}>{label}</MenuItem>)}
            </TextField>}
            columns={[
                { label: "Bill", render: row => row.billNumber || `Draft #${row.id}` },
                { label: "Vendor", render: row => row.vendorName },
                { label: "Bill Date", render: row => formatDate(row.billDate) },
                { label: "Due Date", render: row => formatDate(row.dueDate) },
                { label: "Branch / Currency", render: row => `${row.branch} · ${row.currency}` },
                { label: "Amount", render: row => money(row.grandTotal, row.currency, row.currencyDecimalPlaces) },
                { label: "Status", render: row => <Chip size="small" label={orderStatus(row.status)}
                    color={row.status === 1 ? "success" : row.status === 2 ? "error" : "default"} /> },
                { label: "Action", render: row => <Button onClick={() => navigate(`/purchases/bills/${row.id}`)}>View</Button> },
            ]} />
        {canWrite && adding && <BillForm onClose={() => setAdding(false)}
            onSaved={order => { setAdding(false); navigate(`/purchases/bills/${order.id}`); }} />}
    </Page>;
}
