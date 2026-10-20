import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
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

import { useAuth } from "../../../live/AuthContext";
import InvoiceForm from "./InvoiceForm";
import InvoiceDetails from "./InvoiceDetails";

import "./Invoices.css";

// Labels match the backend SalesInvoiceStatus enum.
const statusNames = {
    0: "Draft",
    1: "Issued",
    2: "Void",
};

const pageSize = 20;

function statusName(status) {
    return statusNames[status] || status || "Unknown";
}

function formatDate(value) {
    if (!value) {
        return "—";
    }

    const [year, month, day] = value.slice(0, 10).split("-");

    return `${day}/${month}/${year}`;
}

function formatAmount(value, currency) {
    if (value == null) {
        return "—";
    }

    try {
        return new Intl.NumberFormat(undefined, {
            style: "currency",
            currency,
            currencyDisplay: "code",
        }).format(value);
    } catch {
        return `${currency || ""} ${value}`;
    }
}

async function readResponse(response) {
    let data;

    try {
        data = await response.json();
    } catch {
        throw new Error(
            "Unexpected API response. Check the invoice API and Vite proxy."
        );
    }

    if (!response.ok) {
        throw new Error(
            data?.message ||
            data?.title ||
            `Request failed (${response.status}).`
        );
    }

    return data;
}

const Invoices = () => {
    const { canWrite } = useAuth();
    const [showInvoiceForm, setShowInvoiceForm] = useState(false);

    const [invoices, setInvoices] = useState([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [reload, setReload] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("");

    const [invoiceParameters, setInvoiceParameters] = useSearchParams();
    const requestedInvoice = Number(invoiceParameters.get("invoiceId"));
    const selectedId = Number.isSafeInteger(requestedInvoice) && requestedInvoice > 0
        ? requestedInvoice
        : null;

    function setSelectedId(id) {
        setInvoiceParameters(previous => {
            const next = new URLSearchParams(previous);
            if (id == null) next.delete("invoiceId");
            else next.set("invoiceId", String(id));
            return next;
        });
    }
    const [selectedInvoice, setSelectedInvoice] = useState(null);
    const [detailsLoading, setDetailsLoading] = useState(false);
    const [detailsError, setDetailsError] = useState("");
    const [detailsRevision, setDetailsRevision] = useState(0);
    const [issuing, setIssuing] = useState(false);
    const [issueError, setIssueError] = useState("");

    useEffect(() => {
        const controller = new AbortController();

        async function loadInvoices() {
            setLoading(true);
            setError("");
            setInvoices([]);

            try {
                const response = await fetch(
                    `/api/sales-invoices?page=${page}&pageSize=${pageSize}`,
                    { signal: controller.signal }
                );

                const result = await readResponse(response);

                if (
                    !Array.isArray(result?.data) ||
                    !Number.isInteger(result.total) ||
                    result.total < 0
                ) {
                    throw new Error("Invalid invoice list response.");
                }

                if (!controller.signal.aborted) {
                    const lastPage = Math.max(
                        1,
                        Math.ceil(result.total / pageSize)
                    );

                    setTotal(result.total);

                    if (page > lastPage) {
                        setPage(lastPage);
                        return;
                    }

                    setInvoices(result.data);
                }
            } catch (loadError) {
                if (!controller.signal.aborted) {
                    setError(loadError.message);
                }
            } finally {
                if (!controller.signal.aborted) {
                    setLoading(false);
                }
            }
        }

        loadInvoices();

        return () => controller.abort();
    }, [page, reload]);

    useEffect(() => {
        if (selectedId == null) {
            return;
        }

        const controller = new AbortController();

        async function loadDetails() {
            setDetailsLoading(true);
            setDetailsError("");
            setSelectedInvoice(null);

            try {
                const response = await fetch(
                    `/api/sales-invoices/${selectedId}`,
                    { signal: controller.signal }
                );

                const result = await readResponse(response);

                if (!result || result.id !== selectedId) {
                    throw new Error("Invalid invoice details response.");
                }

                if (!controller.signal.aborted) {
                    setSelectedInvoice(result);
                }
            } catch (loadError) {
                if (!controller.signal.aborted) {
                    setDetailsError(loadError.message);
                }
            } finally {
                if (!controller.signal.aborted) {
                    setDetailsLoading(false);
                }
            }
        }

        loadDetails();

        return () => controller.abort();
    }, [selectedId, detailsRevision]);

    const searchValue = search.trim().toLowerCase();

    const visibleInvoices = invoices.filter((invoice) => {
        const matchesSearch = [
            invoice.invoiceNumber,
            invoice.id,
            invoice.clientName,
            invoice.companyName,
            invoice.reference,
        ].some((value) =>
            String(value ?? "").toLowerCase().includes(searchValue)
        );

        const matchesStatus =
            !statusFilter ||
            statusName(invoice.status) === statusFilter;

        return matchesSearch && matchesStatus;
    });

    const summaryCards = [
        {
            label: "Total Invoices",
            value: total,
        },
        ...Object.values(statusNames).map((name) => ({
            label: `${name} on this page`,
            value: invoices.filter(
                (invoice) => statusName(invoice.status) === name
            ).length,
        })),
    ];

    function handleSaved() {
        setShowInvoiceForm(false);
        setSearch("");
        setStatusFilter("");
        setPage(1);
        setReload((previous) => previous + 1);
    }

    async function issueInvoice() {
        if (!selectedInvoice || issuing || !canWrite) {
            return;
        }

        setIssuing(true);
        setIssueError("");

        try {
            const response = await fetch(`/api/sales-invoices/${selectedId}/issue`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ rowVersion: selectedInvoice.rowVersion }),
            });
            const result = await readResponse(response);

            if (result.id !== selectedId || !result.invoiceNumber ||
                !(result.status === 1 || result.status === "Issued")) {
                throw new Error("Unexpected issue response. Reload the invoice to check its status.");
            }

            setSelectedInvoice(result);
            setReload((previous) => previous + 1);
        } catch (failure) {
            setIssueError(failure.message);
        } finally {
            setIssuing(false);
        }
    }

    function reloadInvoice() {
        setIssueError("");
        setDetailsRevision((previous) => previous + 1);
    }

    function openInvoice(id) {
        setIssueError("");
        setSelectedInvoice(null);
        setDetailsError("");
        setDetailsLoading(true);
        setSelectedId(id);
    }

    function closeInvoice() {
        if (issuing) {
            return;
        }
        setIssueError("");
        setSelectedId(null);
        setSelectedInvoice(null);
        setDetailsError("");
        setDetailsLoading(false);
    }

    if (selectedId != null) {
        return (
            <InvoiceDetails
                invoice={selectedInvoice}
                loading={detailsLoading}
                error={detailsError}
                onBack={closeInvoice}
                onIssue={canWrite ? issueInvoice : undefined}
                onReload={reloadInvoice}
                issuing={issuing}
                issueError={issueError}
            />
        );
    }

    return (
        <Box className="invoices-page">
            <Box className="invoices-header">
                <Box>
                    <Typography className="invoices-title">
                        Invoices
                    </Typography>

                    <Typography className="invoices-subtitle">
                        Create and manage customer invoices
                    </Typography>
                </Box>

                <Button
                    variant="contained"
                    startIcon={<AddRoundedIcon />}
                    className="add-invoice-button"
                    onClick={() => setShowInvoiceForm(true)}
                >
                    New Invoice
                </Button>
            </Box>

            <Box className="invoice-summary-grid">
                {summaryCards.map((card) => (
                    <Card
                        key={card.label}
                        className="invoice-summary-card"
                    >
                        <CardContent>
                            <Typography className="invoice-summary-label">
                                {card.label}
                            </Typography>

                            <Typography className="invoice-summary-value">
                                {loading || error ? "—" : card.value}
                            </Typography>
                        </CardContent>
                    </Card>
                ))}
            </Box>

            <Card className="invoice-list-card">
                <CardContent className="invoice-list-content">
                    <Box className="invoice-list-header">
                        <Box>
                            <Typography className="invoice-list-title">
                                Invoice List
                            </Typography>

                            <Typography className="invoice-list-subtitle">
                                Search and filter the current page
                            </Typography>
                        </Box>

                        <Box className="invoice-list-actions">
                            <Box className="invoice-search-box">
                                <SearchRoundedIcon />

                                <input
                                    type="search"
                                    placeholder="Search this page..."
                                    aria-label="Search invoices on this page"
                                    value={search}
                                    onChange={(event) =>
                                        setSearch(event.target.value)
                                    }
                                />
                            </Box>

                            <TextField
                                select
                                label="Status"
                                size="small"
                                value={statusFilter}
                                onChange={(event) =>
                                    setStatusFilter(event.target.value)
                                }
                                sx={{ minWidth: 130 }}
                            >
                                <MenuItem value="">All statuses</MenuItem>

                                {Object.values(statusNames).map((name) => (
                                    <MenuItem key={name} value={name}>
                                        {name}
                                    </MenuItem>
                                ))}
                            </TextField>

                            <Button
                                variant="outlined"
                                startIcon={<RefreshRoundedIcon />}
                                disabled={loading}
                                onClick={() =>
                                    setReload((previous) => previous + 1)
                                }
                            >
                                Refresh
                            </Button>
                        </Box>
                    </Box>

                    {error && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {error}
                        </Alert>
                    )}

                    <Box sx={{ overflowX: "auto" }}>
                        <Box sx={{ minWidth: 800 }}>
                            <Box className="invoice-table-header">
                                <Typography>Invoice</Typography>
                                <Typography>Client</Typography>
                                <Typography>Invoice Date</Typography>
                                <Typography>Due Date</Typography>
                                <Typography>Amount</Typography>
                                <Typography>Status</Typography>
                                <Typography>Action</Typography>
                            </Box>

                            {loading && (
                                <Typography sx={{ p: 3 }}>
                                    Loading invoices...
                                </Typography>
                            )}

                            {!loading &&
                                !error &&
                                visibleInvoices.length === 0 && (
                                    <Typography sx={{ p: 3 }}>
                                        {total === 0
                                            ? "No invoices yet."
                                            : "No matching invoices on this page."}
                                    </Typography>
                                )}

                            {!loading &&
                                !error &&
                                visibleInvoices.map((invoice) => {
                                    const status = statusName(invoice.status);

                                    return (
                                        <Box
                                            key={invoice.id}
                                            className="invoice-table-row"
                                        >
                                            <Typography className="invoice-number">
                                                {invoice.invoiceNumber ||
                                                    `Record #${invoice.id}`}
                                            </Typography>

                                            <Typography>
                                                {invoice.clientName}
                                            </Typography>

                                            <Typography>
                                                {formatDate(invoice.invoiceDate)}
                                            </Typography>

                                            <Typography>
                                                {formatDate(invoice.dueDate)}
                                            </Typography>

                                            <Typography className="invoice-amount">
                                                {formatAmount(
                                                    invoice.grandTotal,
                                                    invoice.currency
                                                )}
                                            </Typography>

                                            <Box
                                                className={
                                                    `invoice-status ` +
                                                    status.toLowerCase()
                                                }
                                            >
                                                {status}
                                            </Box>

                                            <Button
                                                className="invoice-view-button"
                                                onClick={() =>
                                                    openInvoice(invoice.id)
                                                }
                                            >
                                                View
                                            </Button>
                                        </Box>
                                    );
                                })}
                        </Box>
                    </Box>

                    <Box
                        sx={{
                            mt: 3,
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            gap: 2,
                            flexWrap: "wrap",
                        }}
                    >
                        <Typography>
                            {error ? "Count unavailable" : `${total} invoices`}
                        </Typography>

                        <Pagination
                            count={Math.max(
                                1,
                                Math.ceil(total / pageSize)
                            )}
                            page={page}
                            disabled={loading || Boolean(error)}
                            onChange={(_, nextPage) => setPage(nextPage)}
                            color="primary"
                        />
                    </Box>
                </CardContent>
            </Card>

            {showInvoiceForm && (
                <Box className="invoice-modal-overlay">
                    <Box className="invoice-modal">
                        <InvoiceForm
                            onClose={() => setShowInvoiceForm(false)}
                            onSaved={handleSaved}
                        />
                    </Box>
                </Box>
            )}
        </Box>
    );
};

export default Invoices;