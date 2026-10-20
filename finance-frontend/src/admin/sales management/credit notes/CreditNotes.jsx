import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    MenuItem,
    Pagination,
    TextField,
    Typography,
} from "@mui/material";

import AddRoundedIcon from "@mui/icons-material/AddRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";

import { getCreditNotes } from "./SalesCreditNoteService";
import CreditNoteDetails from "./CreditNoteDetails";
import CreditNoteForm from "./CreditNoteForm";
import { useAuth } from "../../../context/AuthContext";
import "./CreditNotes.css";

function statusName(value) {
    if (value === 0 || value === "Draft") return "Draft";
    if (value === 1 || value === "Issued") return "Issued";
    return "Unknown";
}

function formatDate(value) {
    if (!value) return "—";

    return value
        .slice(0, 10)
        .split("-")
        .reverse()
        .join("/");
}

function formatAmount(amount, currency) {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency,
        currencyDisplay: "code",
    }).format(amount);
}

const CreditNotes = () => {
    const { canWrite } = useAuth();
    const [showForm, setShowForm] = useState(false);
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const requestedId = Number(searchParams.get("creditNoteId"));
    const selectedId = Number.isSafeInteger(requestedId) && requestedId > 0 ? requestedId : null;

    function selectCreditNote(id) {
        setSearchParams(previous => {
            const next = new URLSearchParams(previous);
            if (id) next.set("creditNoteId", String(id));
            else next.delete("creditNoteId");
            return next;
        });
    }

    const [records, setRecords] = useState([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");
    const [status, setStatus] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [revision, setRevision] = useState(0);

    const pageSize = 25;

    useEffect(() => {
        if (selectedId) return;
        const controller = new AbortController();

        setLoading(true);
        setError("");

        const timer = setTimeout(async () => {
            try {
                const result = await getCreditNotes(
                    {
                        page,
                        pageSize,
                        search,
                        status,
                    },
                    controller.signal
                );

                if (controller.signal.aborted) return;

                const lastPage = Math.max(
                    1,
                    Math.ceil(result.total / pageSize)
                );

                if (page > lastPage) {
                    setPage(lastPage);
                    return;
                }

                setRecords(result.data);
                setTotal(result.total);
            } catch (failure) {
                if (!controller.signal.aborted) {
                    setError(failure.message);
                }
            } finally {
                if (!controller.signal.aborted) {
                    setLoading(false);
                }
            }
        }, 250);

        return () => {
            clearTimeout(timer);
            controller.abort();
        };
    }, [page, search, status, revision, selectedId]);

    const ready = !loading && !error;

    const draftCount = records.filter(
        record => statusName(record.status) === "Draft"
    ).length;

    const issuedCount = records.filter(
        record => statusName(record.status) === "Issued"
    ).length;

    const summaryCards = [
        ["Matching Credit Notes", total],
        ["Draft on this page", draftCount],
        ["Issued on this page", issuedCount],
    ];

    function refresh() {
        setRevision(previous => previous + 1);
    }

    if (selectedId) {
        return (
            <CreditNoteDetails
                key={selectedId}
                id={selectedId}
                onBack={() => selectCreditNote(null)}
                onViewInvoice={id => navigate(`/sales/invoices?invoiceId=${id}`)}
            />
        );
    }

    return (
        <Box className="credit-notes-page">
            {showForm && <CreditNoteForm
                onClose={() => setShowForm(false)}
                onSaved={record => { setShowForm(false); selectCreditNote(record.id); refresh(); }}
            />}
            <Box className="credit-notes-header">
                <Box>
                    <Typography className="credit-notes-title">
                        Credit Notes
                    </Typography>

                    <Typography className="credit-notes-subtitle">
                        Create and manage customer credit notes
                    </Typography>
                </Box>

                <Button
                    variant="contained"
                    startIcon={<AddRoundedIcon />}
                    className="add-credit-note-button"
                    disabled={!canWrite}
                    onClick={() => setShowForm(true)}
                >
                    New Credit Note
                </Button>
            </Box>

            <Box
                className="credit-note-summary-grid"
                sx={{
                    gridTemplateColumns:
                        "repeat(auto-fit, minmax(180px, 1fr))",
                }}
            >
                {summaryCards.map(([label, value]) => (
                    <Card
                        key={label}
                        className="credit-note-summary-card"
                    >
                        <CardContent>
                            <Typography className="credit-note-summary-label">
                                {label}
                            </Typography>

                            <Typography className="credit-note-summary-value">
                                {ready ? value : "—"}
                            </Typography>
                        </CardContent>
                    </Card>
                ))}
            </Box>

            <Card className="credit-note-list-card">
                <CardContent className="credit-note-list-content">
                    <Box className="credit-note-list-header">
                        <Box>
                            <Typography className="credit-note-list-title">
                                Credit Note List
                            </Typography>

                            <Typography className="credit-note-list-subtitle">
                                Search by credit note, invoice, client, or reason
                            </Typography>
                        </Box>

                        <Box
                            className="credit-note-list-actions"
                            sx={{ flexWrap: "wrap" }}
                        >
                            <Box className="credit-note-search-box">
                                <SearchRoundedIcon />

                                <input
                                    type="search"
                                    aria-label="Search credit notes"
                                    placeholder="Search credit notes..."
                                    value={search}
                                    maxLength={200}
                                    onChange={event => {
                                        setSearch(event.target.value);
                                        setPage(1);
                                    }}
                                />
                            </Box>

                            <TextField
                                select
                                size="small"
                                label="Status"
                                value={status}
                                sx={{ minWidth: 130 }}
                                onChange={event => {
                                    setStatus(event.target.value);
                                    setPage(1);
                                }}
                            >
                                <MenuItem value="">All</MenuItem>
                                <MenuItem value="0">Draft</MenuItem>
                                <MenuItem value="1">Issued</MenuItem>
                            </TextField>

                            <Button
                                variant="outlined"
                                startIcon={<RefreshRoundedIcon />}
                                disabled={loading}
                                onClick={refresh}
                            >
                                Refresh
                            </Button>
                        </Box>
                    </Box>

                    {error && (
                        <Alert
                            severity="error"
                            sx={{ mb: 2 }}
                            action={
                                <Button color="inherit" onClick={refresh}>
                                    Retry
                                </Button>
                            }
                        >
                            {error}
                        </Alert>
                    )}

                    {loading && (
                        <Typography sx={{ py: 3 }}>
                            Loading credit notes...
                        </Typography>
                    )}

                    {ready && (
                        <>
                            <Box className="credit-note-table-header">
                                <Typography>Credit Note</Typography>
                                <Typography>Customer</Typography>
                                <Typography>Invoice</Typography>
                                <Typography>Credit Date</Typography>
                                <Typography>Amount</Typography>
                                <Typography>Status</Typography>
                                <Typography>Action</Typography>
                            </Box>

                            {records.length === 0 && (
                                <Typography sx={{ py: 4 }}>
                                    No credit notes match your search.
                                </Typography>
                            )}

                            {records.map(record => {
                                const name = statusName(record.status);

                                return (
                                    <Box
                                        key={record.id}
                                        className="credit-note-table-row"
                                    >
                                        <Typography className="credit-note-number">
                                            {record.creditNoteNumber ||
                                                `Draft #${record.id}`}
                                        </Typography>

                                        <Typography>
                                            {record.clientName}
                                        </Typography>

                                        <Typography>
                                            {record.invoiceNumber}
                                        </Typography>

                                        <Typography>
                                            {formatDate(record.creditNoteDate)}
                                        </Typography>

                                        <Typography className="credit-note-amount">
                                            {formatAmount(
                                                record.grandTotal,
                                                record.currency
                                            )}
                                        </Typography>

                                        <Box
                                            className={
                                                `credit-note-status ${name.toLowerCase()}`
                                            }
                                        >
                                            {name}
                                        </Box>

                                        <Button
                                            className="credit-note-view-button"
                                            onClick={() => selectCreditNote(record.id)}
                                        >
                                            View
                                        </Button>
                                    </Box>
                                );
                            })}

                            <Box
                                sx={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    flexWrap: "wrap",
                                    gap: 2,
                                    mt: 3,
                                }}
                            >
                                <Typography variant="body2">
                                    {total} matching credit notes
                                </Typography>

                                <Pagination
                                    page={page}
                                    count={Math.max(
                                        1,
                                        Math.ceil(total / pageSize)
                                    )}
                                    color="primary"
                                    onChange={(_, value) => setPage(value)}
                                />
                            </Box>
                        </>
                    )}
                </CardContent>
            </Card>
        </Box>
    );
};

export default CreditNotes;