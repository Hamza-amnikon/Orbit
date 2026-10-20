import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
    Alert,
    Box,
    Button,
    Card,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Typography,
} from "@mui/material";

import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";

import { useLoad } from "../../../live/data";
import { useAuth } from "../../../context/AuthContext";

import {
    changeVendorCreditStatus,
    getVendorCredit,
} from "./VendorCreditService";

import VendorCreditForm from "./VendorCreditForm";
import CreditApplicationDialog from "./CreditApplicationDialog";

import "./VendorCreditDetails.css";

const creditStatuses = [
    "Draft",
    "Issued",
    "Cancelled",
];

const creditUnits = [
    "Hour",
    "Day",
    "Month",
    "Fixed fee",
    "Piece",
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

export default function VendorCreditDetails({
    creditId,
    onBack,
}) {
    const { canWrite } = useAuth();
    const navigate = useNavigate();
    const [applying, setApplying] = useState(false);
    const [reversing, setReversing] = useState(null);

    const [editing, setEditing] = useState(false);
    const [action, setAction] = useState(null);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState("");
    const [conflict, setConflict] = useState(false);
    const [notice, setNotice] = useState("");

    const locked = useRef(false);

    const detail = useLoad(
        signal => {
            return getVendorCredit(
                creditId,
                signal
            );
        },
        [creditId]
    );

    const credit = detail.data;

    const items = credit?.items ?? [];

    const statusLabel =
        creditStatuses[credit?.status] || "Unknown";

    const hasDiscount = items.some(
        item => Number(item.discountAmount) > 0
    );

    const hasTax = items.some(
        item => Number(item.taxAmount) > 0
    );

    function applicationSaved() {
        setNotice(reversing ? "Credit application voided." : "Credit applied to bill.");
        setApplying(false);
        setReversing(null);
        detail.refresh();
    }

    function reloadApplications() {
        setApplying(false);
        setReversing(null);
        refresh();
    }

    function refresh() {
        if (locked.current) {
            return;
        }

        setAction(null);
        setError("");
        setConflict(false);
        detail.refresh();
    }

    function openAction(name) {
        setError("");
        setConflict(false);
        setNotice("");

        setAction({
            name,
            rowVersion: credit.rowVersion,
        });
    }

    function closeAction() {
        if (locked.current) {
            return;
        }

        setAction(null);
        setError("");
        setConflict(false);
    }

    function draftSaved() {
        setEditing(false);
        setNotice("Vendor credit draft saved.");
        detail.refresh();
    }

    async function confirmAction() {
        if (locked.current || !credit || !action || conflict) {
            return;
        }

        if (
            action.name === "issue" &&
            !credit.vendorCreditNoteNumber?.trim()
        ) {
            setError(
                "Enter the vendor credit note number using Edit Draft before issuing."
            );
            return;
        }

        locked.current = true;
        setBusy(true);
        setError("");

        try {
            await changeVendorCreditStatus(
                credit.id,
                action.name,
                action.rowVersion
            );

            setNotice(
                action.name === "issue"
                    ? "Vendor credit issued."
                    : "Vendor credit cancelled."
            );

            setAction(null);
            detail.refresh();
        } catch (actionError) {
            setError(actionError.message);
            setConflict(actionError.status === 409);
        } finally {
            locked.current = false;
            setBusy(false);
        }
    }

    if (canWrite && editing && credit) {
        return (
            <VendorCreditForm
                key={credit.id}
                credit={credit}
                onCancel={() => {
                    setEditing(false);
                }}
                onSaved={draftSaved}
            />
        );
    }

    return (
        <Box className="vendor-credit-details-page">
            <Box className="vendor-credit-details-header">
                <Box>
                    <Button
                        startIcon={<ArrowBackRoundedIcon />}
                        className="vendor-credit-details-back-button"
                        disabled={busy}
                        onClick={onBack}
                    >
                        Back to Vendor Credits
                    </Button>

                    <Typography className="vendor-credit-details-title">
                        Vendor Credit Details
                    </Typography>

                    <Typography className="vendor-credit-details-subtitle">
                        {credit?.vendorCreditNumber ||
                            `Draft #${creditId}`}
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
                        disabled={detail.loading || busy}
                        onClick={refresh}
                    >
                        Refresh
                    </Button>

                    {canWrite && credit && !detail.loading && !detail.error && (
                        <>
                            {credit.status === 1 && credit.availableAmount > 0 && (
                                <Button
                                    variant="contained"
                                    disabled={busy}
                                    onClick={() => setApplying(true)}
                                >
                                    Apply to Bill
                                </Button>
                            )}

                            {credit.status === 0 && (
                                <>
                                    <Button
                                        variant="outlined"
                                        disabled={busy}
                                        onClick={() => {
                                            setEditing(true);
                                        }}
                                    >
                                        Edit Draft
                                    </Button>

                                    <Button
                                        variant="contained"
                                        disabled={busy}
                                        onClick={() => {
                                            openAction("issue");
                                        }}
                                    >
                                        Issue Credit
                                    </Button>
                                </>
                            )}

                            {(credit.status === 0 || credit.status === 1) && (
                                <Button
                                    variant="outlined"
                                    color="error"
                                    disabled={busy}
                                    onClick={() => {
                                        openAction("cancel");
                                    }}
                                >
                                    Cancel Credit
                                </Button>
                            )}
                        </>
                    )}
                </Box>
            </Box>

            {notice && (
                <Alert severity="success" sx={{ mb: 2 }}>
                    {notice}
                </Alert>
            )}

            {detail.loading && (
                <Typography sx={{ p: 2 }}>
                    Loading vendor credit...
                </Typography>
            )}

            {detail.error && (
                <Alert
                    severity="error"
                    sx={{ mb: 2 }}
                    action={
                        <Button
                            color="inherit"
                            onClick={detail.refresh}
                        >
                            Retry
                        </Button>
                    }
                >
                    {detail.error}
                </Alert>
            )}

            {credit?.status === 1 && (
                <Alert severity="info" sx={{ mb: 2 }}>
                    Applied: {formatAmount(credit.appliedAmount ?? 0, credit.currency, credit.currencyDecimalPlaces)}
                    {" · "}Available: {formatAmount(credit.availableAmount ?? 0, credit.currency, credit.currencyDecimalPlaces)}
                    {credit.appliedAmount > 0 && " · Void active applications before cancelling the credit."}
                </Alert>
            )}

            {!detail.loading && !detail.error && credit && (
                <Card className="vendor-credit-details-card">
                    <Box className="vendor-credit-company-section">
                        <Box>
                            <Typography className="vendor-credit-company-name">
                                Vendor Credit
                            </Typography>

                            <Typography className="vendor-credit-company-address">
                                Managing branch: {credit.branch}
                            </Typography>

                            <Typography className="vendor-credit-company-address">
                                Currency: {credit.currency}
                            </Typography>
                        </Box>

                        <Box className="vendor-credit-document-info">
                            <Typography className="vendor-credit-document-label">
                                VENDOR CREDIT
                            </Typography>

                            <Typography className="vendor-credit-document-number">
                                {credit.vendorCreditNumber ||
                                    `Draft #${credit.id}`}
                            </Typography>

                            <span
                                className={
                                    "vendor-credit-detail-status " +
                                    statusLabel.toLowerCase()
                                }
                            >
                                {statusLabel}
                            </span>
                        </Box>
                    </Box>

                    <Box className="vendor-credit-detail-section">
                        <Typography className="vendor-credit-detail-section-title">
                            Vendor Information
                        </Typography>

                        <Box className="vendor-credit-info-grid">
                            <Box>
                                <Typography className="vendor-credit-info-label">
                                    Vendor
                                </Typography>

                                <Typography className="vendor-credit-info-value">
                                    {credit.vendorName}
                                </Typography>
                            </Box>

                            {credit.companyName && (
                                <Box>
                                    <Typography className="vendor-credit-info-label">
                                        Company
                                    </Typography>

                                    <Typography className="vendor-credit-info-value">
                                        {credit.companyName}
                                    </Typography>
                                </Box>
                            )}
                        </Box>
                    </Box>

                    <Box className="vendor-credit-detail-section">
                        <Typography className="vendor-credit-detail-section-title">
                            Credit Information
                        </Typography>

                        <Box className="vendor-credit-info-grid">
                            {[
                                [
                                    "Credit Number",
                                    credit.vendorCreditNumber ||
                                        `Draft #${credit.id}`,
                                ],
                                [
                                    "Credit Date",
                                    formatDate(credit.creditDate),
                                ],
                                [
                                    "Vendor Credit Note Number",
                                    credit.vendorCreditNoteNumber,
                                ],
                                [
                                    "Source Bill ID",
                                    credit.billId == null
                                        ? ""
                                        : `#${credit.billId}`,
                                ],
                                [
                                    "Reference",
                                    credit.reference,
                                ],
                                [
                                    "Reason",
                                    credit.reason,
                                ],
                            ]
                                .filter(([, value]) => {
                                    return value !== "" &&
                                        value != null;
                                })
                                .map(([label, value]) => (
                                    <Box key={label}>
                                        <Typography className="vendor-credit-info-label">
                                            {label}
                                        </Typography>

                                        <Typography className="vendor-credit-info-value">
                                            {value}
                                        </Typography>
                                    </Box>
                                ))}
                        </Box>
                    </Box>

                    <Box className="vendor-credit-detail-section">
                        <Typography className="vendor-credit-detail-section-title">
                            Credit Items
                        </Typography>

                        <Box className="vendor-credit-items-table-wrapper">
                            <table className="vendor-credit-items-table">
                                <thead>
                                    <tr>
                                        <th>Item / Service</th>
                                        <th>Description</th>
                                        <th>Unit</th>
                                        <th>Qty</th>
                                        <th>Rate</th>

                                        {hasDiscount && (
                                            <th>Discount</th>
                                        )}

                                        {hasTax && (
                                            <th>Tax</th>
                                        )}

                                        <th>Amount</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {items.map(item => (
                                        <tr
                                            key={
                                                item.id ||
                                                item.lineNumber
                                            }
                                        >
                                            <td>
                                                {item.itemName}
                                            </td>

                                            <td>
                                                {item.description || "—"}
                                            </td>

                                            <td>
                                                {creditUnits[item.unit] ||
                                                    "—"}
                                            </td>

                                            <td>
                                                {item.quantity}
                                            </td>

                                            <td>
                                                {formatAmount(
                                                    item.unitPrice,
                                                    credit.currency,
                                                    credit.currencyDecimalPlaces
                                                )}
                                            </td>

                                            {hasDiscount && (
                                                <td>
                                                    {Number(
                                                        item.discountAmount
                                                    ) > 0
                                                        ? formatAmount(
                                                            item.discountAmount,
                                                            credit.currency,
                                                            credit.currencyDecimalPlaces
                                                        )
                                                        : "—"}
                                                </td>
                                            )}

                                            {hasTax && (
                                                <td>
                                                    {Number(
                                                        item.taxAmount
                                                    ) > 0 ? (
                                                        <Box>
                                                            <Typography variant="body2">
                                                                {item.taxRate}%
                                                            </Typography>

                                                            <Typography variant="caption">
                                                                {formatAmount(
                                                                    item.taxAmount,
                                                                    credit.currency,
                                                                    credit.currencyDecimalPlaces
                                                                )}
                                                            </Typography>
                                                        </Box>
                                                    ) : (
                                                        "—"
                                                    )}
                                                </td>
                                            )}

                                            <td>
                                                {formatAmount(
                                                    item.lineTotal,
                                                    credit.currency,
                                                    credit.currencyDecimalPlaces
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </Box>
                    </Box>

                    <Box className="vendor-credit-total-section">
                        <Box className="vendor-credit-total-row">
                            <Typography>
                                Subtotal
                            </Typography>

                            <Typography>
                                {formatAmount(
                                    credit.subTotal,
                                    credit.currency,
                                    credit.currencyDecimalPlaces
                                )}
                            </Typography>
                        </Box>

                        {Number(credit.discountTotal) > 0 && (
                            <Box className="vendor-credit-total-row">
                                <Typography>
                                    Discount
                                </Typography>

                                <Typography>
                                    {formatAmount(
                                        credit.discountTotal,
                                        credit.currency,
                                        credit.currencyDecimalPlaces
                                    )}
                                </Typography>
                            </Box>
                        )}

                        {Number(credit.taxTotal) > 0 && (
                            <Box className="vendor-credit-total-row">
                                <Typography>
                                    Tax
                                </Typography>

                                <Typography>
                                    {formatAmount(
                                        credit.taxTotal,
                                        credit.currency,
                                        credit.currencyDecimalPlaces
                                    )}
                                </Typography>
                            </Box>
                        )}

                        <Box className="vendor-credit-total-final">
                            <Typography>
                                Total Credit
                            </Typography>

                            <Typography>
                                {formatAmount(
                                    credit.grandTotal,
                                    credit.currency,
                                    credit.currencyDecimalPlaces
                                )}
                            </Typography>
                        </Box>
                    </Box>

                    {credit.billingAddress && (
                        <Box className="vendor-credit-address-section">
                            <Box>
                                <Typography className="vendor-credit-detail-section-title">
                                    Billing Address
                                </Typography>

                                <Typography
                                    className="vendor-credit-address-text"
                                    sx={{
                                        whiteSpace: "pre-wrap",
                                        overflowWrap: "anywhere",
                                    }}
                                >
                                    {credit.billingAddress}
                                </Typography>
                            </Box>
                        </Box>
                    )}

                    {credit.notes && (
                        <Box className="vendor-credit-notes-section">
                            <Typography className="vendor-credit-detail-section-title">
                                Notes
                            </Typography>

                            <Typography
                                className="vendor-credit-notes-text"
                                sx={{
                                    whiteSpace: "pre-wrap",
                                    overflowWrap: "anywhere",
                                }}
                            >
                                {credit.notes}
                            </Typography>
                        </Box>
                    )}
                </Card>
            )}
            {credit?.applications?.length > 0 && (
                <Card sx={{ p: 2, mt: 2 }}>
                    <Typography variant="h6">Credit Applications</Typography>

                    <Box sx={{ overflowX: "auto" }}>
                        <table className="vendor-credit-items-table">
                            <thead>
                                <tr>
                                    <th>Bill</th>
                                    <th>Date</th>
                                    <th>Amount</th>
                                    <th>Status</th>
                                    <th>Notes / Void reason</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {credit.applications.map(application => (
                                    <tr key={application.id}>
                                        <td>{application.billNumber}</td>
                                        <td>{formatDate(application.applicationDate)}</td>
                                        <td>{formatAmount(application.amount, credit.currency, credit.currencyDecimalPlaces)}</td>
                                        <td>{application.status === 0 ? "Applied" : "Voided"}</td>
                                        <td>{application.voidReason || application.notes || "—"}</td>
                                        <td>
                                            <Button onClick={() => navigate("/purchases/bills/" + application.billId)}>
                                                View Bill
                                            </Button>
                                            {canWrite && application.status === 0 && (
                                                <Button
                                                    color="error"
                                                    onClick={() => setReversing(application)}
                                                >
                                                    Void Application
                                                </Button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </Box>
                </Card>
            )}

            {canWrite && credit && (applying || reversing) && (
                <CreditApplicationDialog
                    credit={credit}
                    application={reversing}
                    onClose={() => {
                        setApplying(false);
                        setReversing(null);
                    }}
                    onSaved={applicationSaved}
                    onReload={reloadApplications}
                />
            )}

            {action && (
                <Dialog
                    open
                    fullWidth
                    maxWidth="xs"
                    aria-labelledby="vendor-credit-action-title"
                    onClose={busy ? undefined : closeAction}
                >
                    <DialogTitle id="vendor-credit-action-title">
                        {action.name === "issue"
                            ? "Issue vendor credit?"
                            : "Cancel vendor credit?"}
                    </DialogTitle>

                    <DialogContent>
                        <DialogContentText>
                            {action.name === "issue"
                                ? "Issuing assigns a credit number and freezes the credit details. It does not apply the credit to a bill or record a refund."
                                : "Cancelling prevents further use of this credit and retains its history and any assigned credit number."}
                        </DialogContentText>

                        {error && (
                            <Alert severity="error" sx={{ mt: 2 }}>
                                {error}
                            </Alert>
                        )}

                        {conflict && (
                            <Button
                                sx={{ mt: 1 }}
                                disabled={busy}
                                onClick={refresh}
                            >
                                Reload latest credit
                            </Button>
                        )}
                    </DialogContent>

                    <DialogActions>
                        <Button
                            disabled={busy}
                            onClick={closeAction}
                        >
                            Back
                        </Button>

                        <Button
                            variant="contained"
                            color={action.name === "cancel" ? "error" : "primary"}
                            disabled={busy || conflict}
                            onClick={confirmAction}
                        >
                            {busy
                                ? "Saving..."
                                : action.name === "issue"
                                    ? "Confirm Issue"
                                    : "Confirm Cancel"}
                        </Button>
                    </DialogActions>
                </Dialog>
            )}
        </Box>
    );
}
