import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Alert, Box, Button, Card, CardContent, CircularProgress, MenuItem, Pagination, TextField, Typography } from "@mui/material";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import { useAuth } from "../../../context/AuthContext";
import { getEstimates } from "./SalesEstimateService";
import { estimateStatuses, estimateStatus, formatAmount, formatDate } from "./EstimateHelpers";
import EstimateDetails from "./EstimateDetails";
import EstimateForm from "./EstimateForm";
import "./Estimates.css";

const pageSize = 20;

const Estimates = () => {
    const { canWrite } = useAuth();
    const navigate = useNavigate();
    const [parameters, setParameters] = useSearchParams();
    const selected = Number(parameters.get("estimateId"));
    const selectedId = Number.isSafeInteger(selected) && selected > 0 ? selected : null;
    const [showForm, setShowForm] = useState(false);
    const [estimates, setEstimates] = useState([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");
    const [status, setStatus] = useState("");
    const [revision, setRevision] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        if (selectedId) return;
        const controller = new AbortController();
        setLoading(true);
        setError("");
        setEstimates([]);

        const timer = setTimeout(async () => {
            try {
                const result = await getEstimates({ page, pageSize, search, status }, controller.signal);
                if (controller.signal.aborted) return;
                const lastPage = Math.max(1, Math.ceil(result.total / pageSize));
                if (page > lastPage) setPage(lastPage);
                else {
                    setEstimates(result.data);
                    setTotal(result.total);
                }
            } catch (failure) {
                if (!controller.signal.aborted) setError(failure.message);
            } finally {
                if (!controller.signal.aborted) setLoading(false);
            }
        }, 200);

        return () => { clearTimeout(timer); controller.abort(); };
    }, [page, search, status, revision, selectedId]);

    function openEstimate(id) {
        setParameters(previous => {
            const next = new URLSearchParams(previous);
            if (id) next.set("estimateId", String(id));
            else next.delete("estimateId");
            return next;
        });
    }

    if (selectedId) {
        return <EstimateDetails key={selectedId} id={selectedId} onBack={() => openEstimate(null)} onViewInvoice={id => navigate(`/sales/invoices?invoiceId=${id}`)} />;
    }

    const summaries = [
        [search || status !== "" ? "Matching estimates" : "Total Estimates", total],
        ...["Draft", "Sent", "Accepted"].map(name => [name + " on this page", estimates.filter(record => estimateStatus(record.status) === name).length]),
    ];

    return (
        <Box className="estimates-page">
            <Box className="estimates-header">
                <Box>
                    <Typography className="estimates-title">Estimates</Typography>
                    <Typography className="estimates-subtitle">Create and manage customer estimates</Typography>
                </Box>
                {canWrite && <Button variant="contained" startIcon={<AddRoundedIcon />} className="new-estimate-button" onClick={() => setShowForm(true)}>New Estimate</Button>}
            </Box>
            <Box className="estimate-summary">
                {summaries.map(([label, value]) => (
                    <Card className="estimate-summary-card" key={label}><CardContent>
                        <Typography className="estimate-summary-label">{label}</Typography>
                        <Typography className="estimate-summary-value">{loading || error ? "—" : value}</Typography>
                    </CardContent></Card>
                ))}
            </Box>
            <Card className="estimates-table-card"><CardContent>
                <Box className="estimates-table-header">
                    <Typography className="estimates-table-title">Estimate List</Typography>
                    <Box className="estimate-actions">
                        <Box className="estimate-search">
                            <SearchRoundedIcon />
                            <input aria-label="Search estimates" placeholder="Search estimates..." value={search} maxLength={200} onChange={event => { setSearch(event.target.value); setPage(1); }} />
                        </Box>
                        <TextField select label="Status" size="small" value={status} sx={{ minWidth: 140 }} onChange={event => { setStatus(event.target.value); setPage(1); }}>
                            <MenuItem value="">All statuses</MenuItem>
                            {estimateStatuses.map((name, value) => <MenuItem key={name} value={String(value)}>{name}</MenuItem>)}
                        </TextField>
                        <Button variant="outlined" startIcon={<RefreshRoundedIcon />} disabled={loading} onClick={() => setRevision(value => value + 1)}>Refresh</Button>
                    </Box>
                </Box>
                {error && <Alert severity="error">{error}</Alert>}
                {loading && <Box sx={{ p: 3 }}><CircularProgress size={24} aria-label="Loading estimates" /></Box>}
                {!loading && !error && <>
                    <Box className="estimate-row estimate-header-row">{["Estimate", "Client", "Date", "Amount", "Status", "Actions"].map(name => <Typography key={name}>{name}</Typography>)}</Box>
                    {estimates.map(record => (
                        <Box className="estimate-row" key={record.id}>
                            <Box><Typography className="estimate-number">{record.estimateNumber || `Draft #${record.id}`}</Typography><Typography className="estimate-secondary">Valid until {formatDate(record.validUntil)}</Typography></Box>
                            <Typography>{record.clientName}</Typography>
                            <Typography>{formatDate(record.estimateDate)}</Typography>
                            <Typography className="estimate-amount">{formatAmount(record.grandTotal, record.currency)}</Typography>
                            <Typography className={`estimate-status status-${estimateStatus(record.status).toLowerCase()}`}>{estimateStatus(record.status)}</Typography>
                            <Button className="estimate-view-button" onClick={() => openEstimate(record.id)}>View</Button>
                        </Box>
                    ))}
                    {estimates.length === 0 && <Typography sx={{ p: 3 }}>No estimates found.</Typography>}
                    <Box className="estimate-list-footer"><Typography>{total} matching estimates</Typography><Pagination count={Math.max(1, Math.ceil(total / pageSize))} page={page} onChange={(_, value) => setPage(value)} /></Box>
                </>}
            </CardContent></Card>
            {canWrite && showForm && <EstimateForm onClose={() => setShowForm(false)} onSaved={record => { setShowForm(false); openEstimate(record.id); }} />}
        </Box>
    );
};

export default Estimates;
