import React, { useEffect, useRef, useState } from "react";
import { Alert, Box, Button, Card, CardContent, Dialog, DialogActions, DialogContent, DialogTitle, Divider, Typography } from "@mui/material";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import PrintRoundedIcon from "@mui/icons-material/PrintRounded";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import { getCreditNote, issueCreditNote } from "./SalesCreditNoteService";
import { useAuth } from "../../../context/AuthContext";
import "./CreditNoteDetails.css";
import "./CreditNotes.css";

const units = { 0: "Hour", 1: "Day", 2: "Month", 3: "Fixed fee", Hour: "Hour", Day: "Day", Month: "Month", FixedFee: "Fixed fee" };
const date = value => value ? value.slice(0, 10).split("-").reverse().join("/") : "—";
const amount = (value, currency) => new Intl.NumberFormat("en-US", { style: "currency", currency, currencyDisplay: "code" }).format(value);
const statusName = value => value === 0 || value === "Draft" ? "Draft" : value === 1 || value === "Issued" ? "Issued" : "Unknown";

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
