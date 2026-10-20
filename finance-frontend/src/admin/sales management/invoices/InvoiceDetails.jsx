import React, { useState } from "react";
import InvoicePaymentsPanel from "./InvoicePaymentsPanel";

import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    Divider,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Typography,
} from "@mui/material";

import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import PrintRoundedIcon from "@mui/icons-material/PrintRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";

import IssuedInvoice from "./IssuedInvoice";
import "./InvoiceDetails.css";

// Labels match the backend enums.
const statusNames = {
    0: "Draft",
    1: "Issued",
    2: "Void",
};

const unitNames = {
    0: "Hour",
    1: "Day",
    2: "Month",
    3: "Fixed fee",
};

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

const InvoiceDetails = ({
    invoice,
    loading,
    error,
    onBack,
    onEdit,
    onIssue,
    onReload,
    issuing = false,
    issueError = "",
}) => {
    const [confirmIssue, setConfirmIssue] = useState(false);

    const status = invoice
        ? statusNames[invoice.status] || invoice.status || "Unknown"
        : "";

    const showIssuedTemplate =
        status !== "Draft" &&
        invoice?.issuer &&
        invoice?.invoiceTemplateVersion === "amnikon-v1";

    const items = [...(invoice?.items || [])].sort(
        (first, second) => first.lineNumber - second.lineNumber
    );

    const metadata = invoice
        ? [
            ["Invoice Date", formatDate(invoice.invoiceDate)],
            ["Due Date", formatDate(invoice.dueDate)],
            ["Managing Branch", invoice.branch],
            ["Currency", invoice.currency],
            [
                "Preferred Payment Mode",
                invoice.preferredPaymentMode || "—",
            ],
            [
                "Service Period",
                invoice.servicePeriodStart && invoice.servicePeriodEnd
                    ? `${formatDate(invoice.servicePeriodStart)} to ${formatDate(
                        invoice.servicePeriodEnd
                    )}`
                    : "—",
            ],
        ]
        : [];

    return (
        <Box className="invoice-details-page">
            <Box className="invoice-details-topbar">
                <Button
                    variant="outlined"
                    startIcon={<ArrowBackRoundedIcon />}
                    className="invoice-back-button"
                    onClick={onBack}
                    disabled={issuing}
                >
                    Back to Invoices
                </Button>

                {invoice && !loading && !error && (
                    <Box className="invoice-details-actions">
                        <Button
                            variant="outlined"
                            startIcon={<PrintRoundedIcon />}
                            className="invoice-action-button"
                            onClick={() => window.print()}
                            disabled={issuing}
                        >
                            Print
                        </Button>

                        {status === "Draft" &&
                            typeof onIssue === "function" && (
                                <Button
                                    variant="contained"
                                    disabled={issuing || !invoice.rowVersion}
                                    onClick={() => setConfirmIssue(true)}
                                >
                                    {issuing ? "Issuing..." : "Issue Invoice"}
                                </Button>
                            )}

                        {status === "Draft" &&
                            typeof onEdit === "function" && (
                                <Button
                                    variant="outlined"
                                    startIcon={<EditRoundedIcon />}
                                    className="invoice-action-button"
                                    onClick={() => onEdit(invoice)}
                                >
                                    Edit
                                </Button>
                            )}
                    </Box>
                )}
            </Box>

            {issueError && (
                <Alert
                    severity="error"
                    sx={{ mb: 2 }}
                    action={typeof onReload === "function" && (
                        <Button
                            color="inherit"
                            disabled={issuing}
                            onClick={onReload}
                        >
                            Reload invoice
                        </Button>
                    )}
                >
                    {issueError}
                </Alert>
            )}

            <Dialog
                open={confirmIssue}
                onClose={() => !issuing && setConfirmIssue(false)}
                fullWidth
                maxWidth="sm"
            >
                <DialogTitle>Issue this invoice?</DialogTitle>

                <DialogContent>
                    <Typography sx={{ mb: 1 }}>
                        {invoice?.clientName} · {invoice?.branch} ·{" "}
                        {formatAmount(
                            invoice?.grandTotal,
                            invoice?.currency
                        )}
                    </Typography>

                    <Typography>
                        This assigns an invoice number and saves the branch
                        company details with this invoice. Issued invoices
                        cannot be edited.
                    </Typography>
                </DialogContent>

                <DialogActions>
                    <Button
                        disabled={issuing}
                        onClick={() => setConfirmIssue(false)}
                    >
                        Cancel
                    </Button>

                    <Button
                        variant="contained"
                        disabled={issuing}
                        onClick={() => {
                            setConfirmIssue(false);
                            onIssue?.();
                        }}
                    >
                        Confirm Issue
                    </Button>
                </DialogActions>
            </Dialog>

            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}

            {(loading || (!invoice && !error)) && (
                <Typography sx={{ p: 3 }}>
                    Loading invoice...
                </Typography>
            )}

            {/* Payment summary and history for issued invoices */}
            {invoice && !loading && !error && status === "Issued" && (
                <InvoicePaymentsPanel
                    key={invoice.id}
                    invoice={invoice}
                />
            )}

            {/* Company invoice template */}
            {invoice && !loading && !error && showIssuedTemplate && (
                <IssuedInvoice
                    invoice={invoice}
                    formatDate={formatDate}
                    formatAmount={formatAmount}
                    unitNames={unitNames}
                />
            )}

            {/* Existing draft / fallback invoice display */}
            {invoice && !loading && !error && !showIssuedTemplate && (
                <Card className="invoice-details-card">
                    <Box className="invoice-details-header">
                        <Box>
                            <Typography className="invoice-company-name">
                                Sales Invoice
                            </Typography>

                            <Typography className="invoice-company-details">
                                Managing branch: {invoice.branch}
                            </Typography>
                        </Box>

                        <Box className="invoice-title-section">
                            <Typography className="invoice-main-title">
                                {status === "Draft"
                                    ? "DRAFT INVOICE"
                                    : "INVOICE"}
                            </Typography>

                            <Typography className="invoice-detail-number">
                                {invoice.invoiceNumber ||
                                    `Draft record #${invoice.id}`}
                            </Typography>

                            <Box className="invoice-detail-status">
                                {status}
                            </Box>
                        </Box>
                    </Box>

                    <Divider />

                    <CardContent className="invoice-details-content">
                        <Box className="invoice-info-grid">
                            <Box>
                                <Typography className="invoice-info-label">
                                    BILL TO
                                </Typography>

                                <Typography className="invoice-customer-name">
                                    {invoice.clientName}
                                </Typography>

                                {invoice.companyName && (
                                    <Typography className="invoice-info-text">
                                        {invoice.companyName}
                                    </Typography>
                                )}

                                <Typography
                                    className="invoice-info-text"
                                    sx={{ whiteSpace: "pre-wrap" }}
                                >
                                    {invoice.billingAddress || "—"}
                                </Typography>
                            </Box>

                            <Box className="invoice-meta-section">
                                {metadata.map(([label, value]) => (
                                    <Box
                                        key={label}
                                        className="invoice-meta-row"
                                    >
                                        <Typography>{label}</Typography>
                                        <Typography>{value}</Typography>
                                    </Box>
                                ))}
                            </Box>
                        </Box>

                        <Box className="invoice-items-section">
                            <Typography className="invoice-section-title">
                                Services
                            </Typography>

                            <Box sx={{ overflowX: "auto" }}>
                                <Box sx={{ minWidth: 700 }}>
                                    <Box className="invoice-items-header">
                                        <Typography>Service</Typography>
                                        <Typography>Description</Typography>
                                        <Typography>Qty / Unit</Typography>
                                        <Typography>Rate</Typography>
                                        <Typography>Tax</Typography>
                                        <Typography>Amount</Typography>
                                    </Box>

                                    {items.map((item) => (
                                        <Box
                                            key={item.id}
                                            className="invoice-item-row"
                                        >
                                            <Typography className="invoice-item-name">
                                                {item.lineNumber}.{" "}
                                                {item.serviceName}
                                            </Typography>

                                            <Typography>
                                                {item.description || "—"}
                                            </Typography>

                                            <Typography>
                                                {item.quantity}{" "}
                                                {unitNames[item.unit] ||
                                                    item.unit}
                                            </Typography>

                                            <Box>
                                                <Typography>
                                                    {formatAmount(
                                                        item.unitPrice,
                                                        invoice.currency
                                                    )}
                                                </Typography>

                                                {item.discountEnabled !== false &&
                                                    item.discountAmount > 0 && (
                                                        <Typography
                                                            variant="caption"
                                                            color="text.secondary"
                                                        >
                                                            Discount:{" "}
                                                            {formatAmount(
                                                                item.discountAmount,
                                                                invoice.currency
                                                            )}
                                                        </Typography>
                                                    )}
                                            </Box>

                                            <Box>
                                                <Typography>
                                                    {item.taxRate}%
                                                </Typography>

                                                <Typography variant="caption">
                                                    {formatAmount(
                                                        item.taxAmount,
                                                        invoice.currency
                                                    )}
                                                </Typography>
                                            </Box>

                                            <Typography className="invoice-item-amount">
                                                {formatAmount(
                                                    item.lineTotal,
                                                    invoice.currency
                                                )}
                                            </Typography>
                                        </Box>
                                    ))}
                                </Box>
                            </Box>
                        </Box>

                        <Box className="invoice-total-section">
                            {[
                                ["Subtotal", invoice.subTotal],
                                ...(invoice.discountTotal > 0
                                    ? [["Discount", invoice.discountTotal]]
                                    : []),
                                ["Tax", invoice.taxTotal],
                            ].map(([label, value]) => (
                                <Box
                                    key={label}
                                    className="invoice-total-row"
                                >
                                    <Typography>{label}</Typography>

                                    <Typography>
                                        {formatAmount(
                                            value,
                                            invoice.currency
                                        )}
                                    </Typography>
                                </Box>
                            ))}

                            <Divider />

                            <Box className="invoice-grand-total-row">
                                <Typography>Grand Total</Typography>

                                <Typography>
                                    {formatAmount(
                                        invoice.grandTotal,
                                        invoice.currency
                                    )}
                                </Typography>
                            </Box>
                        </Box>

                        {invoice.notes && (
                            <Box className="invoice-notes-section">
                                <Typography className="invoice-section-title">
                                    Notes
                                </Typography>

                                <Typography
                                    className="invoice-notes-text"
                                    sx={{ whiteSpace: "pre-wrap" }}
                                >
                                    {invoice.notes}
                                </Typography>
                            </Box>
                        )}

                        {invoice.additionalTerms && (
                            <Box className="invoice-terms-section">
                                <Typography className="invoice-section-title">
                                    Terms & Conditions
                                </Typography>

                                <Typography
                                    className="invoice-notes-text"
                                    sx={{ whiteSpace: "pre-wrap" }}
                                >
                                    {invoice.additionalTerms}
                                </Typography>
                            </Box>
                        )}

                        {status === "Void" && invoice.voidReason && (
                            <Alert severity="info" sx={{ mt: 2 }}>
                                Void reason: {invoice.voidReason}
                            </Alert>
                        )}
                    </CardContent>
                </Card>
            )}
        </Box>
    );
};

export default InvoiceDetails;