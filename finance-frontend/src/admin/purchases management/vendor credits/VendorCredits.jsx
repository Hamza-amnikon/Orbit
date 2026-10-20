import { useState } from "react";

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

import { useLoad } from "../../../live/data";
import { getVendorCredits } from "./VendorCreditService";

import VendorCreditDetails from "./VendorCreditDetails";
import VendorCreditForm from "./VendorCreditForm";

import "./VendorCredits.css";

const creditStatuses = [
    "Draft",
    "Issued",
    "Cancelled",
];

function formatDate(value) {
    if (!value) {
        return "—";
    }

    return value
        .slice(0, 10)
        .split("-")
        .reverse()
        .join("/");
}

function formatAmount(value, currency, precision) {
    if (value == null || !currency) {
        return "—";
    }

    try {
        return new Intl.NumberFormat(undefined, {
            style: "currency",
            currency,
            currencyDisplay: "code",
            ...(precision == null
                ? {}
                : {
                    minimumFractionDigits: precision,
                    maximumFractionDigits: precision,
                }),
        }).format(value);
    } catch {
        return currency + " " + value;
    }
}

function getStatusLabel(value) {
    return creditStatuses[value] || "Unknown";
}

async function getCreditSummary(signal) {
    const [all, draft, issued, cancelled] = await Promise.all([
        getVendorCredits(
            {
                page: 1,
                pageSize: 1,
            },
            signal
        ),
        getVendorCredits(
            {
                page: 1,
                pageSize: 1,
                status: 0,
            },
            signal
        ),
        getVendorCredits(
            {
                page: 1,
                pageSize: 1,
                status: 1,
            },
            signal
        ),
        getVendorCredits(
            {
                page: 1,
                pageSize: 1,
                status: 2,
            },
            signal
        ),
    ]);

    return {
        total: all.total,
        draft: draft.total,
        issued: issued.total,
        cancelled: cancelled.total,
    };
}

export default function VendorCredits() {
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");
    const [status, setStatus] = useState("");

    const [selectedCreditId, setSelectedCreditId] = useState(null);
    const [adding, setAdding] = useState(false);

    const pageSize = 25;

    const list = useLoad(
        signal => {
            return getVendorCredits(
                {
                    page,
                    pageSize,
                    search,
                    status,
                },
                signal
            );
        },
        [page, search, status]
    );

    const summary = useLoad(
        getCreditSummary,
        []
    );

    const vendorCredits = list.data?.data ?? [];
    const total = list.data?.total ?? 0;

    const pageCount = Math.max(
        1,
        Math.ceil(total / pageSize)
    );

    function refresh() {
        list.refresh();
        summary.refresh();
    }

    function changeSearch(next) {
        setSearch(next);
        setPage(1);
    }

    function changeStatus(next) {
        setStatus(next);
        setPage(1);
    }

    function openDetails(id) {
        setSelectedCreditId(id);
    }

    function closeDetails() {
        setSelectedCreditId(null);
        refresh();
    }

    function creditSaved(credit) {
        setAdding(false);
        setSelectedCreditId(credit.id);
        refresh();
    }

    if (adding) {
        return (
            <VendorCreditForm
                onCancel={() => {
                    setAdding(false);
                }}
                onSaved={creditSaved}
            />
        );
    }

    if (selectedCreditId !== null) {
        return (
            <VendorCreditDetails
                key={selectedCreditId}
                creditId={selectedCreditId}
                onBack={closeDetails}
            />
        );
    }

    return (
        <Box className="vendor-credits-page">
            <Box className="vendor-credits-header">
                <Box>
                    <Typography className="vendor-credits-title">
                        Vendor Credits
                    </Typography>

                    <Typography className="vendor-credits-subtitle">
                        Manage vendor credits and adjustments
                    </Typography>
                </Box>

                <Box
                    sx={{
                        display: "flex",
                        gap: 1,
                        flexWrap: "wrap",
                    }}
                >
                    <Button
                        variant="outlined"
                        startIcon={<RefreshRoundedIcon />}
                        disabled={list.loading || summary.loading}
                        onClick={refresh}
                    >
                        Refresh
                    </Button>

                    <Button
                        variant="contained"
                        startIcon={<AddRoundedIcon />}
                        className="vendor-credit-add-button"
                        onClick={() => {
                            setAdding(true);
                        }}
                    >
                        New Vendor Credit
                    </Button>
                </Box>
            </Box>

            <Box className="vendor-credit-summary-grid">
                {[
                    ["Total Vendor Credits", "total"],
                    ["Draft", "draft"],
                    ["Issued", "issued"],
                    ["Cancelled", "cancelled"],
                ].map(([label, name]) => (
                    <Card
                        key={name}
                        className="vendor-credit-summary-card"
                    >
                        <CardContent>
                            <Typography className="vendor-credit-card-label">
                                {label}
                            </Typography>

                            <Typography className="vendor-credit-card-value">
                                {summary.loading || summary.error
                                    ? "—"
                                    : summary.data?.[name] ?? "—"}
                            </Typography>
                        </CardContent>
                    </Card>
                ))}
            </Box>

            {summary.error && (
                <Alert
                    severity="warning"
                    sx={{ mb: 2 }}
                    action={
                        <Button
                            color="inherit"
                            onClick={summary.refresh}
                        >
                            Retry
                        </Button>
                    }
                >
                    Unable to load vendor credit counts.
                    {" "}
                    {summary.error}
                </Alert>
            )}

            <Card className="vendor-credits-list-card">
                <Box className="vendor-credits-list-header">
                    <Box>
                        <Typography className="vendor-credits-list-title">
                            Vendor Credits
                        </Typography>

                        <Typography className="vendor-credits-list-subtitle">
                            {list.loading
                                ? "Loading vendor credits..."
                                : list.error
                                    ? "Unable to load vendor credits."
                                    : `${total} matching records`}
                        </Typography>
                    </Box>

                    <Box className="vendor-credits-actions">
                        <Box className="vendor-credit-search">
                            <SearchRoundedIcon />

                            <input
                                type="text"
                                aria-label="Search vendor credits"
                                placeholder="Search vendor credits..."
                                value={search}
                                onChange={event => {
                                    changeSearch(event.target.value);
                                }}
                            />
                        </Box>

                        <TextField
                            select
                            label="Status"
                            size="small"
                            value={status}
                            sx={{ minWidth: 140 }}
                            onChange={event => {
                                changeStatus(event.target.value);
                            }}
                        >
                            <MenuItem value="">
                                All statuses
                            </MenuItem>

                            {creditStatuses.map((label, index) => (
                                <MenuItem
                                    key={label}
                                    value={index}
                                >
                                    {label}
                                </MenuItem>
                            ))}
                        </TextField>
                    </Box>
                </Box>

                {list.error && (
                    <Alert
                        severity="error"
                        sx={{ m: 2 }}
                        action={
                            <Button
                                color="inherit"
                                onClick={list.refresh}
                            >
                                Retry
                            </Button>
                        }
                    >
                        {list.error}
                    </Alert>
                )}

                <Box
                    className="vendor-credits-table-wrapper"
                    aria-busy={list.loading}
                >
                    <table className="vendor-credits-table">
                        <thead>
                            <tr>
                                <th>Credit Number</th>
                                <th>Vendor</th>
                                <th>Credit Date</th>
                                <th>Source Bill ID</th>
                                <th>Amount</th>
                                <th>Status</th>
                                <th>Action</th>
                            </tr>
                        </thead>

                        <tbody>
                            {list.loading ? (
                                <tr>
                                    <td colSpan={7}>
                                        Loading vendor credits...
                                    </td>
                                </tr>
                            ) : list.error ? (
                                <tr>
                                    <td colSpan={7}>
                                        Retry loading vendor credits.
                                    </td>
                                </tr>
                            ) : vendorCredits.length === 0 ? (
                                <tr>
                                    <td colSpan={7}>
                                        No vendor credits found.
                                    </td>
                                </tr>
                            ) : (
                                vendorCredits.map(credit => {
                                    const statusLabel = getStatusLabel(
                                        credit.status
                                    );

                                    return (
                                        <tr key={credit.id}>
                                            <td>
                                                {credit.vendorCreditNumber ||
                                                    `Draft #${credit.id}`}
                                            </td>

                                            <td>
                                                {credit.vendorName}
                                            </td>

                                            <td>
                                                {formatDate(
                                                    credit.creditDate
                                                )}
                                            </td>

                                            <td>
                                                {credit.billId == null
                                                    ? "—"
                                                    : `#${credit.billId}`}
                                            </td>

                                            <td>
                                                {formatAmount(
                                                    credit.grandTotal,
                                                    credit.currency,
                                                    credit.currencyDecimalPlaces
                                                )}
                                            </td>

                                            <td>
                                                <span
                                                    className={
                                                        "vendor-credit-status " +
                                                        "vendor-credit-status-" +
                                                        statusLabel.toLowerCase()
                                                    }
                                                >
                                                    {statusLabel}
                                                </span>
                                            </td>

                                            <td>
                                                <Button
                                                    className="vendor-credit-view-button"
                                                    onClick={() => {
                                                        openDetails(credit.id);
                                                    }}
                                                >
                                                    View
                                                </Button>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </Box>

                <Box
                    sx={{
                        p: 2,
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        flexWrap: "wrap",
                        gap: 2,
                    }}
                >
                    <Typography
                        variant="body2"
                        color="text.secondary"
                    >
                        {list.loading || list.error
                            ? "—"
                            : `${total} records`}
                    </Typography>

                    <Pagination
                        count={pageCount}
                        page={page}
                        color="primary"
                        disabled={
                            list.loading ||
                            Boolean(list.error)
                        }
                        onChange={(_, nextPage) => {
                            setPage(nextPage);
                        }}
                    />
                </Box>
            </Card>
        </Box>
    );
}
