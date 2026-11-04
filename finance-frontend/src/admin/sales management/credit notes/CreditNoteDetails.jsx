import React, { useEffect, useRef, useState } from "react";
import { Alert, Box, Button, Card, CardContent, Dialog, DialogActions, DialogContent, DialogTitle, Divider, MenuItem, TextField, Typography } from "@mui/material";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import PrintRoundedIcon from "@mui/icons-material/PrintRounded";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import { applyCustomerCredit, getCreditNote, getCustomerCredit, issueCreditNote } from "./SalesCreditNoteService";
import { useAuth } from "../../../context/AuthContext";
import "./CreditNoteDetails.css";
import "./CreditNotes.css";

const units = { 0: "Hour", 1: "Day", 2: "Month", 3: "Fixed fee", Hour: "Hour", Day: "Day", Month: "Month", FixedFee: "Fixed fee" };
const date = value => value ? value.slice(0, 10).split("-").reverse().join("/") : "—";
const amount = (value, currency) => new Intl.NumberFormat("en-US", { style: "currency", currency, currencyDisplay: "code" }).format(value);
const statusName = value => value === 0 || value === "Draft" ? "Draft" : value === 1 || value === "Issued" ? "Issued" : "Unknown";

const CustomerCreditBalance = ({ creditNote, canWrite }) => {
    const [customerCredit, setCustomerCredit] = useState(null);
    const [error, setError] = useState("");
    const [revision, setRevision] = useState(0);
    const [targetInvoiceId, setTargetInvoiceId] = useState("");
    const [applyAmount, setApplyAmount] = useState("");
    const [applying, setApplying] = useState(false);
    const [applyError, setApplyError] = useState("");
    const [notice, setNotice] = useState("");
    const requestId = useRef(null);
    const pending = useRef(false);

    useEffect(() => {
        const controller = new AbortController();

        getCustomerCredit(
            creditNote.clientId,
            creditNote.branch,
            creditNote.currency,
            controller.signal
        ).then(result => {
            if (!controller.signal.aborted) {
                setCustomerCredit(result);
            }
        }).catch(failure => {
            if (!controller.signal.aborted) {
                setError(failure.message);
            }
        });

        return () => controller.abort();
    }, [creditNote, revision]);

    const refresh = () => {
        setCustomerCredit(null);
        setError("");
        setRevision(previous => previous + 1);
    };

    const money = value => amount(value, creditNote.currency);
    const invoiceCredit = customerCredit?.sources.find(
        source => source.salesInvoiceId === creditNote.salesInvoiceId
    )?.availableAmount || 0;
    const targets = (customerCredit?.targets || []).filter(
        target => target.salesInvoiceId !== creditNote.salesInvoiceId
    );
    const target = targets.find(
        invoice => invoice.salesInvoiceId === Number(targetInvoiceId)
    );
    const value = Number(applyAmount);
    const validAmount = /^\d+(\.\d{1,4})?$/.test(applyAmount) &&
        Number.isFinite(value) &&
        value > 0 &&
        value <= invoiceCredit &&
        value <= (target?.balanceDue || 0);

    async function applyCredit() {
        if (!canWrite || pending.current || !validAmount) return;
        pending.current = true;
        setApplying(true);
        setApplyError("");
        setNotice("");
        requestId.current ||= crypto.randomUUID();

        try {
            const result = await applyCustomerCredit({
                requestId: requestId.current,
                sourceInvoiceId: creditNote.salesInvoiceId,
                targetInvoiceId: Number(targetInvoiceId),
                amount: value,
            });

            if (result.sourceInvoiceId !== creditNote.salesInvoiceId ||
                result.targetInvoiceId !== Number(targetInvoiceId) ||
                Number(result.amount) !== value) {
                throw new Error("Credit application could not be confirmed. Retry the same request.");
            }

            requestId.current = null;
            setTargetInvoiceId("");
            setApplyAmount("");
            setNotice(`Applied ${money(value)} to invoice ${result.targetInvoiceNumber}.`);
            refresh();
        } catch (failure) {
            setApplyError(failure.message);
            if (failure.status === 400 || failure.status === 409) {
                requestId.current = null;
                refresh();
            }
        } finally {
            pending.current = false;
            setApplying(false);
        }
    }

    return <Card sx={{ mt: 2 }} className="credit-note-no-print">
        <CardContent>
            <Typography variant="h6">Customer credit balance</Typography>
            {error && <Alert severity="error" sx={{ mt: 1 }} action={<Button color="inherit" onClick={refresh}>Retry</Button>}>{error}</Alert>}
            {!customerCredit && !error && <Typography sx={{ mt: 1 }}>Loading credit balance...</Typography>}
            {customerCredit && <>
                <Typography sx={{ mt: 1 }}>Unused credit for {creditNote.clientName} in {creditNote.branch}, {creditNote.currency}: <strong>{money(customerCredit.totalAvailable)}</strong></Typography>
                <Typography sx={{ mt: 1 }}>From this invoice: <strong>{money(invoiceCredit)}</strong></Typography>
                <Typography variant="body2" sx={{ mt: 1 }}>Credit can be applied only to another issued invoice for the same client, branch and currency. No bank transaction is created.</Typography>
                {notice && <Alert severity="success" sx={{ mt: 2 }} onClose={() => setNotice("")}>{notice}</Alert>}
                {applyError && <Alert severity="error" sx={{ mt: 2 }}>{applyError}</Alert>}
                {canWrite && invoiceCredit > 0 && <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5, alignItems: "center", mt: 2 }}>
                    <TextField
                        select
                        size="small"
                        label="Apply to invoice"
                        value={targetInvoiceId}
                        onChange={event => { setTargetInvoiceId(event.target.value); requestId.current = null; }}
                        sx={{ minWidth: 250 }}
                        disabled={applying || targets.length === 0}
                    >
                        {targets.map(invoice => <MenuItem key={invoice.salesInvoiceId} value={invoice.salesInvoiceId}>
                            {invoice.invoiceNumber} · Due {money(invoice.balanceDue)}
                        </MenuItem>)}
                    </TextField>
                    <TextField
                        size="small"
                        label="Amount"
                        type="number"
                        slotProps={{ htmlInput: { min: 0.0001, max: Math.min(invoiceCredit, target?.balanceDue || 0), step: 0.0001 } }}
                        value={applyAmount}
                        onChange={event => { setApplyAmount(event.target.value); requestId.current = null; }}
                        disabled={applying || !target}
                    />
                    <Button variant="contained" disabled={applying || !validAmount} onClick={applyCredit}>
                        {applying ? "Applying..." : "Apply Credit"}
                    </Button>
                    {targets.length === 0 && <Typography variant="body2">There is no eligible unpaid invoice.</Typography>}
                </Box>}
                {customerCredit.applications?.some(application => application.sourceInvoiceId === creditNote.salesInvoiceId) && <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle2">Recorded credit applications</Typography>
                    {customerCredit.applications
                        .filter(application => application.sourceInvoiceId === creditNote.salesInvoiceId)
                        .map(application => <Typography key={application.id} variant="body2">
                            {money(application.amount)} to invoice {application.targetInvoiceNumber}
                        </Typography>)}
                </Box>}
            </>}
        </CardContent>
    </Card>;
};

const CreditNoteDetails = ({ id, onBack, onViewInvoice }) => {
    const { canWrite } = useAuth();
    const [confirmIssue, setConfirmIssue] = useState(false);
    const [issuing, setIssuing] = useState(false);
    const [issueError, setIssueError] = useState("");
    const [issueToken, setIssueToken] = useState(null);
    const [notice, setNotice] = useState("");
    const issuePending = useRef(false);
    const [creditNote, setCreditNote] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [revision, setRevision] = useState(0);

    useEffect(() => {
        const controller = new AbortController();
        setLoading(true);
        setError("");
        setCreditNote(null);
        getCreditNote(id, controller.signal).then(record => {
            if (record.id !== id || !Array.isArray(record.items) || !record.currency) {
                throw new Error("Invalid credit note response. Please refresh the details.");
            }
            if (!controller.signal.aborted) setCreditNote(record);
        }).catch(failure => {
            if (!controller.signal.aborted) setError(failure.message);
        }).finally(() => {
            if (!controller.signal.aborted) setLoading(false);
        });
        return () => controller.abort();
    }, [id, revision]);

    const ready = !loading && !error && creditNote;
    const status = creditNote ? statusName(creditNote.status) : "";
    const items = [...(creditNote?.items || [])].sort((a, b) => a.lineNumber - b.lineNumber);
    const hasDiscount = Number(creditNote?.discountTotal) > 0;
    const money = value => amount(value, creditNote.currency);
    const refresh = () => setRevision(previous => previous + 1);

    async function confirmIssuance() {
        if (issuePending.current || !canWrite || status !== "Draft") return;
        issuePending.current = true;
        setIssuing(true);
        setIssueError("");
        const token = issueToken || creditNote.rowVersion;
        setIssueToken(token);
        try {
            const record = await issueCreditNote(id, token);
            if (record.id !== id || record.salesInvoiceId !== creditNote.salesInvoiceId || statusName(record.status) !== "Issued" || !Array.isArray(record.items)) throw new Error("Issue could not be confirmed. Retry the same issue request or refresh the credit note.");
            setCreditNote(record);
            setIssueToken(null);
            setConfirmIssue(false);
            setNotice("Credit note issued. Its credit is now included in the linked invoice balance.");
        } catch (failure) {
            setIssueError(failure.message);
            if (failure.status === 400 || failure.status === 409) {
                setIssueToken(null);
                setConfirmIssue(false);
                refresh();
            }
        } finally { issuePending.current = false; setIssuing(false); }
    }

    return (
        <Box className="credit-note-details-page">
            <Box className="credit-note-details-header credit-note-no-print">
                <Box>
                    <Button startIcon={<ArrowBackRoundedIcon />} className="credit-note-back-button" onClick={onBack} disabled={issuing}>Back to Credit Notes</Button>
                    <Typography className="credit-note-details-title">Credit Note Details</Typography>
                    <Typography className="credit-note-details-subtitle">{creditNote?.creditNoteNumber || `Draft #${id}`}</Typography>
                </Box>
                <Box className="credit-note-details-actions" sx={{ flexWrap: "wrap" }}>
                    <Button variant="outlined" className="credit-note-action-button" startIcon={<RefreshRoundedIcon />} disabled={loading || issuing} onClick={refresh}>Refresh</Button>
                    <Button variant="outlined" className="credit-note-action-button" startIcon={<PrintRoundedIcon />} disabled={!ready || issuing} onClick={() => window.print()}>Print</Button>
                    {ready && <Button variant="outlined" className="credit-note-action-button" disabled={issuing} onClick={() => onViewInvoice(creditNote.salesInvoiceId)}>View Invoice</Button>}
                    {ready && canWrite && status === "Draft" && <Button variant="contained" className="credit-note-send-button" disabled={issuing || !creditNote.rowVersion} onClick={() => { setIssueError(""); setConfirmIssue(true); }}>Issue Credit Note</Button>}
                </Box>
            </Box>

            {notice && <Alert severity="success" className="credit-note-no-print" sx={{ mb: 2 }} onClose={() => setNotice("")}>{notice}</Alert>}
            {issueError && !confirmIssue && <Alert severity="error" className="credit-note-no-print" sx={{ mb: 2 }}>{issueError}</Alert>}
            {loading && <Typography sx={{ py: 3 }}>Loading credit note...</Typography>}
            {error && <Alert severity="error" className="credit-note-no-print" action={<Button color="inherit" onClick={refresh}>Retry</Button>}>{error}</Alert>}

            {ready && <Card className="credit-note-details-card"><CardContent>
                <Box className="credit-note-document-header">
                    <Box>
                        <Typography className="credit-note-company-name">Sales Credit Note</Typography>
                        <Typography className="credit-note-company-info">Managing branch: {creditNote.branch}</Typography>
                        <Typography className="credit-note-company-info">Currency: {creditNote.currency}</Typography>
                    </Box>
                    <Box className="credit-note-document-number">
                        <Typography className="credit-note-document-label">CREDIT NOTE</Typography>
                        <Typography className="credit-note-number-large">{creditNote.creditNoteNumber || `Draft #${creditNote.id}`}</Typography>
                        <Box className={`credit-note-details-status ${status.toLowerCase()}`}>{status}</Box>
                    </Box>
                </Box>
                <Divider />
                <Box className="credit-note-info-grid">
                    <Box>
                        <Typography className="credit-note-info-title">CREDIT TO</Typography>
                        <Typography className="credit-note-customer-name">{creditNote.clientName}</Typography>
                        {creditNote.companyName && <Typography className="credit-note-info-text">{creditNote.companyName}</Typography>}
                        {creditNote.billingAddress && <Typography className="credit-note-info-text" sx={{ whiteSpace: "pre-line" }}>{creditNote.billingAddress}</Typography>}
                    </Box>
                    <Box>
                        <Box className="credit-note-info-row"><Typography>Credit Note Date</Typography><Typography>{date(creditNote.creditNoteDate)}</Typography></Box>
                        <Box className="credit-note-info-row"><Typography>Invoice</Typography><Typography className="credit-note-info-value">{creditNote.invoiceNumber}</Typography></Box>
                        <Box className="credit-note-info-row"><Typography>Reason</Typography><Typography>{creditNote.reason}</Typography></Box>
                        {creditNote.issuedDate && <Box className="credit-note-info-row"><Typography>Issued Date</Typography><Typography>{date(creditNote.issuedDate)}</Typography></Box>}
                    </Box>
                </Box>
                <Divider />
                <Box className="credit-note-item-section">
                    <Typography className="credit-note-section-title">Credited Services</Typography>
                    <Box className="credit-note-item-table">
                        <Box className="credit-note-item-header">
                            {["Item / Service", "Description", "Credit Basis", "Original Rate", "Tax", "Amount"].map(label => <Typography key={label}>{label}</Typography>)}
                        </Box>
                        {items.map(item => <Box key={item.id || item.lineNumber} className="credit-note-item-row">
                            <Typography className="credit-note-item-name">{item.serviceName}</Typography>
                            <Box><Typography sx={{ whiteSpace: "pre-line" }}>{item.description || "—"}</Typography>{Number(item.discountAmount) > 0 && <Typography>Discount: {money(item.discountAmount)}</Typography>}</Box>
                            <Box>{item.creditAmount != null ? <><Typography>Amount adjustment</Typography><Typography>{money(item.creditAmount)} before tax</Typography></> : <><Typography>{item.quantity}</Typography><Typography>{units[item.unit] || ""}</Typography></>}</Box>
                            <Typography>{money(item.unitPrice)}</Typography>
                            <Box><Typography>{item.taxRate}%</Typography><Typography>{money(item.taxAmount)}</Typography></Box>
                            <Typography className="credit-note-item-amount">{money(item.lineTotal)}</Typography>
                        </Box>)}
                    </Box>
                </Box>
                <Divider />
                <Box className="credit-note-details-summary"><Box className="credit-note-summary-content">
                    <Box className="credit-note-details-summary-row"><Typography>Subtotal</Typography><Typography>{money(creditNote.subTotal)}</Typography></Box>
                    {hasDiscount && <Box className="credit-note-details-summary-row"><Typography>Discount</Typography><Typography>{money(creditNote.discountTotal)}</Typography></Box>}
                    <Box className="credit-note-details-summary-row"><Typography>Tax</Typography><Typography>{money(creditNote.taxTotal)}</Typography></Box>
                    <Divider />
                    <Box className="credit-note-details-total-row"><Typography>Total Credit Amount</Typography><Typography>{money(creditNote.grandTotal)}</Typography></Box>
                </Box></Box>
                {creditNote.notes && <Box className="credit-note-notes-section">
                    <Typography className="credit-note-section-title">Notes</Typography>
                    <Typography className="credit-note-notes-text" sx={{ whiteSpace: "pre-line" }}>{creditNote.notes}</Typography>
                </Box>}
                <Box className="credit-note-details-footer">
                    <Typography className="credit-note-footer-text">{status === "Issued" ? "This issued credit is included in the linked invoice balance." : "This draft has not reduced the invoice balance."}</Typography>
                    <Typography className="credit-note-footer-text">Linked Invoice: {creditNote.invoiceNumber}</Typography>
                </Box>
            </CardContent></Card>}
            {ready && status === "Issued" && <CustomerCreditBalance key={`${creditNote.id}-${revision}-${creditNote.rowVersion}`} creditNote={creditNote} canWrite={canWrite} />}
            <Dialog open={confirmIssue} onClose={issuing ? undefined : () => setConfirmIssue(false)} fullWidth maxWidth="sm" aria-labelledby="credit-issue-title">
                <DialogTitle id="credit-issue-title">Issue credit note?</DialogTitle>
                <DialogContent>
                    {issueError && <Alert severity="error" sx={{ mb: 2 }}>{issueError}</Alert>}
                    <Typography>This will issue a credit of {creditNote ? money(creditNote.grandTotal) : ""} against invoice {creditNote?.invoiceNumber}. It will reduce the invoice charge and cannot be edited afterward.</Typography>
                    {issueToken && !issuing && <Typography sx={{ mt: 2 }}>Retrying recovers the same issued credit note.</Typography>}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setConfirmIssue(false)} disabled={issuing}>Cancel</Button>
                    <Button variant="contained" disabled={issuing} onClick={confirmIssuance}>{issuing ? "Issuing..." : issueToken ? "Retry Issue" : "Confirm Issue"}</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default CreditNoteDetails;
