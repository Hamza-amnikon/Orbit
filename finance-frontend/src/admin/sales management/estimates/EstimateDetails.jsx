import React, { useEffect, useRef, useState } from "react";
import { Alert, Box, Button, Card, CardContent, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, Divider, MenuItem, TextField, Typography } from "@mui/material";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import PrintRoundedIcon from "@mui/icons-material/PrintRounded";
import SendRoundedIcon from "@mui/icons-material/SendRounded";
import { useAuth } from "../../../context/AuthContext";
import { changeEstimateStatus, convertEstimate, getConversionPaymentModes, getEstimate } from "./SalesEstimateService";
import { estimateStatus, formatAmount, formatDate, serviceUnits, today } from "./EstimateHelpers";
import EstimateForm from "./EstimateForm";
import "./EstimateDetails.css";

const actionLabels = { send: "Mark as sent", accept: "Accept estimate", decline: "Decline estimate", convert: "Convert to draft invoice" };

const EstimateDetails = ({ id, onBack, onViewInvoice }) => {
    const { canWrite } = useAuth();
    const [estimate, setEstimate] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [revision, setRevision] = useState(0);
    const [busy, setBusy] = useState(false);
    const [mutationError, setMutationError] = useState("");
    const [notice, setNotice] = useState("");
    const [editing, setEditing] = useState(false);
    const [action, setAction] = useState(null);
    const [conversionDates, setConversionDates] = useState({ invoiceDate: today(), dueDate: "", preferredPaymentMode: "" });
    const [conversionRequest, setConversionRequest] = useState(null);
    const [paymentModes, setPaymentModes] = useState([]);
    const [modesLoading, setModesLoading] = useState(false);
    const [modesError, setModesError] = useState("");
    const [modesRevision, setModesRevision] = useState(0);
    const pending = useRef(false);

    useEffect(() => {
        if (action !== "convert") return;
        const controller = new AbortController();
        setModesLoading(true);
        setModesError("");
        getConversionPaymentModes(controller.signal).then(modes => {
            if (!controller.signal.aborted) setPaymentModes(modes);
        }).catch(failure => {
            if (!controller.signal.aborted) setModesError(failure.message);
        }).finally(() => {
            if (!controller.signal.aborted) setModesLoading(false);
        });
        return () => controller.abort();
    }, [action, modesRevision]);

    useEffect(() => {
        const controller = new AbortController();
        setLoading(true);
        setError("");
        setEstimate(null);
        getEstimate(id, controller.signal).then(record => {
            if (!controller.signal.aborted) setEstimate(record);
        }).catch(failure => {
            if (!controller.signal.aborted) setError(failure.message);
        }).finally(() => {
            if (!controller.signal.aborted) setLoading(false);
        });
        return () => controller.abort();
    }, [id, revision]);

    const status = estimate ? estimateStatus(estimate.status) : "";
    const items = [...(estimate?.items || [])].sort((first, second) => first.lineNumber - second.lineNumber);
    const hasDiscount = items.some(item => Number(item.discountAmount) > 0);

    function reload() {
        setRevision(value => value + 1);
    }

    function openAction(value) {
        setMutationError("");
        setAction(value);
    }

    async function confirmAction(event) {
        event.preventDefault();
        if (pending.current || !canWrite || !estimate || !action) return;
        pending.current = true;
        setBusy(true);
        setMutationError("");

        try {
            let record;
            if (action === "convert") {
                const body = conversionRequest || { ...conversionDates, rowVersion: estimate.rowVersion };
                setConversionRequest(body);
                const result = await convertEstimate(id, body);
                if (result.estimate?.id !== id || !(result.invoice?.id > 0) || result.estimate.convertedInvoiceId !== result.invoice.id || estimateStatus(result.estimate.status) !== "Converted") throw new Error("Conversion response could not be confirmed. Retry the same conversion to recover it.");
                record = result.estimate;
                setConversionRequest(null);
                setNotice(`Linked invoice #${result.invoice.id} is ready. Use View Invoice to open it.`);
            } else {
                record = await changeEstimateStatus(id, action, estimate.rowVersion);
                if (record.id !== id || !Array.isArray(record.items)) throw new Error("Action response could not be confirmed. Reload the estimate before continuing.");
                setNotice(`Estimate is now ${estimateStatus(record.status).toLowerCase()}.`);
            }
            setEstimate(record);
            setAction(null);
        } catch (failure) {
            setMutationError(failure.message);
            if (failure.status === 400 || failure.status === 409) setConversionRequest(null);
            if (failure.status === 409 && action !== "convert") {
                setAction(null);
                reload();
            }
        } finally {
            pending.current = false;
            setBusy(false);
        }
    }

    return (
        <Box className="estimate-details-page"><Box className="estimate-details-container">
            <Box className="estimate-details-header estimate-no-print">
                <Box className="estimate-details-header-left">
                    <Button aria-label="Back to estimates" className="estimate-details-back-button" onClick={onBack} disabled={busy}><ArrowBackRoundedIcon /></Button>
                    <Box><Typography className="estimate-details-title">Estimate Details</Typography><Typography className="estimate-details-subtitle">{estimate?.estimateNumber || `Draft #${id}`}</Typography></Box>
                </Box>
                <Box className="estimate-details-actions">
                    <Button variant="outlined" onClick={reload} disabled={busy || loading}>Refresh</Button>
                    <Button variant="outlined" startIcon={<PrintRoundedIcon />} className="estimate-print-button" disabled={!estimate || busy || loading} onClick={() => window.print()}>Print</Button>
                    {canWrite && status === "Draft" && <>
                        <Button variant="outlined" startIcon={<EditRoundedIcon />} className="estimate-edit-button" disabled={busy} onClick={() => setEditing(true)}>Edit</Button>
                        <Button variant="contained" startIcon={<SendRoundedIcon />} className="estimate-send-button" disabled={busy} onClick={() => openAction("send")}>Mark as sent</Button>
                    </>}
                    {canWrite && status === "Sent" && <>
                        <Button variant="contained" disabled={busy} onClick={() => openAction("accept")}>Accept estimate</Button>
                        <Button variant="outlined" color="error" disabled={busy} onClick={() => openAction("decline")}>Decline estimate</Button>
                    </>}
                    {canWrite && status === "Accepted" && <Button variant="contained" disabled={busy} onClick={() => openAction("convert")}>Convert to Invoice</Button>}
                    {status === "Converted" && estimate.convertedInvoiceId && <Button variant="contained" disabled={busy} onClick={() => onViewInvoice(estimate.convertedInvoiceId)}>View Invoice</Button>}
                </Box>
            </Box>
            {notice && <Alert severity="success" className="estimate-no-print" sx={{ mb: 2 }} onClose={() => setNotice("")}>{notice}</Alert>}
            {mutationError && !action && <Alert severity="error" className="estimate-no-print" sx={{ mb: 2 }} onClose={() => setMutationError("")}>{mutationError}</Alert>}
            {error && <Alert severity="error" className="estimate-no-print" action={<Button onClick={reload}>Retry</Button>}>{error}</Alert>}
            {loading && <CircularProgress aria-label="Loading estimate details" />}
            {estimate && !loading && !error && <Card className="estimate-preview-card"><CardContent>
                <Box className="estimate-preview-header">
                    <Box><Typography className="estimate-company-name">Sales Estimate</Typography><Typography className="estimate-company-details">Managing branch: {estimate.branch}</Typography><Typography className="estimate-company-details">Currency: {estimate.currency}</Typography></Box>
                    <Box className="estimate-preview-meta"><Typography className="estimate-preview-label">ESTIMATE</Typography><Typography className="estimate-preview-number">{estimate.estimateNumber || `Draft #${estimate.id}`}</Typography><Typography className="estimate-preview-status">{status}</Typography></Box>
                </Box>
                <Divider className="estimate-divider" />
                <Box className="estimate-customer-section">
                    <Box><Typography className="estimate-info-label">PREPARED FOR</Typography><Typography className="estimate-customer-name">{estimate.clientName}</Typography>{estimate.companyName && <Typography className="estimate-info-text">{estimate.companyName}</Typography>}<Typography className="estimate-info-text" sx={{ whiteSpace: "pre-wrap" }}>{estimate.billingAddress}</Typography></Box>
                    <Box className="estimate-date-section"><Box><Typography className="estimate-info-label">ESTIMATE DATE</Typography><Typography className="estimate-info-value">{formatDate(estimate.estimateDate)}</Typography></Box><Box><Typography className="estimate-info-label">VALID UNTIL</Typography><Typography className="estimate-info-value">{formatDate(estimate.validUntil)}</Typography></Box></Box>
                </Box>
                {estimate.servicePeriodStart && estimate.servicePeriodEnd && <Typography className="estimate-info-text" sx={{ mb: 2 }}>Service period: {formatDate(estimate.servicePeriodStart)} to {formatDate(estimate.servicePeriodEnd)}</Typography>}
                <Box className="estimate-items-section">
                    <Typography className="estimate-section-title">Estimate Items</Typography>
                    <Box className="estimate-lines-wrapper"><table className="estimate-lines">
                        <thead><tr><th>Service / Description</th><th>Qty / Unit</th><th>Rate</th>{hasDiscount && <th>Discount</th>}<th>Tax</th><th>Amount</th></tr></thead>
                        <tbody>{items.map(item => <tr key={item.id || item.lineNumber}>
                            <td><strong>{item.serviceName}</strong>{item.description && <div className="estimate-line-description">{item.description}</div>}</td>
                            <td>{item.quantity}<div className="estimate-line-description">{serviceUnits[item.unit] || item.unit}</div></td>
                            <td>{formatAmount(item.unitPrice, estimate.currency)}</td>
                            {hasDiscount && <td>{item.discountEnabled ? formatAmount(item.discountAmount, estimate.currency) : "—"}</td>}
                            <td>{item.taxRate}%<div className="estimate-line-description">{formatAmount(item.taxAmount, estimate.currency)}</div></td>
                            <td><strong>{formatAmount(item.lineTotal, estimate.currency)}</strong></td>
                        </tr>)}</tbody>
                    </table></Box>
                </Box>
                <Box className="estimate-details-total-wrapper"><Box className="estimate-details-totals">
                    <Box className="estimate-details-total-row"><Typography>Subtotal</Typography><Typography>{formatAmount(estimate.subTotal, estimate.currency)}</Typography></Box>
                    {Number(estimate.discountTotal) > 0 && <Box className="estimate-details-total-row"><Typography>Discount</Typography><Typography>{formatAmount(estimate.discountTotal, estimate.currency)}</Typography></Box>}
                    <Box className="estimate-details-total-row"><Typography>Tax</Typography><Typography>{formatAmount(estimate.taxTotal, estimate.currency)}</Typography></Box>
                    <Box className="estimate-details-grand-total"><Typography>Grand Total</Typography><Typography>{formatAmount(estimate.grandTotal, estimate.currency)}</Typography></Box>
                </Box></Box>
                {estimate.notes && <Box className="estimate-notes-section"><Typography className="estimate-section-title">Notes</Typography><Typography className="estimate-notes" sx={{ whiteSpace: "pre-wrap" }}>{estimate.notes}</Typography></Box>}
                {estimate.additionalTerms && <Box className="estimate-terms-section"><Typography className="estimate-section-title">Terms & Conditions</Typography><Typography className="estimate-terms" sx={{ whiteSpace: "pre-wrap" }}>{estimate.additionalTerms}</Typography></Box>}
            </CardContent></Card>}
            {editing && canWrite && status === "Draft" && <EstimateForm key={estimate.rowVersion} estimate={estimate} onClose={() => setEditing(false)} onSaved={record => { setEstimate(record); setEditing(false); setNotice("Draft updated."); }} onReload={() => { setEditing(false); reload(); }} />}
            <Dialog open={Boolean(action)} onClose={busy ? undefined : () => setAction(null)} fullWidth maxWidth="sm" aria-labelledby="estimate-action-title">
                <Box component="form" onSubmit={confirmAction}>
                    <DialogTitle id="estimate-action-title">{actionLabels[action] || "Estimate action"}</DialogTitle>
                    <DialogContent>
                        {mutationError && <Alert severity="error" sx={{ mb: 2 }}>{mutationError}</Alert>}
                        {action === "send" && <Typography>This records the estimate as sent and assigns its number. It does not send an email.</Typography>}
                        {action === "accept" && <Typography>Record the client's acceptance of {estimate?.estimateNumber}.</Typography>}
                        {action === "decline" && <Typography>Record that the client declined {estimate?.estimateNumber}.</Typography>}
                        {action === "convert" && <>
                            <Typography sx={{ mb: 2 }}>Create one draft invoice with the accepted services, tax rates and discount settings. You can review it before issuing.</Typography>
                            {conversionRequest && !busy && <Alert severity="info" sx={{ mb: 2 }}>Retry with the same dates and payment mode to recover the existing conversion. This prevents duplicate invoices.</Alert>}
                            {modesError && <Alert severity="error" action={<Button onClick={() => setModesRevision(value => value + 1)}>Retry</Button>} sx={{ mb: 2 }}>{modesError}</Alert>}
                            <TextField select fullWidth label="Preferred payment mode" value={conversionDates.preferredPaymentMode} disabled={busy || modesLoading || Boolean(modesError) || Boolean(conversionRequest)} onChange={event => setConversionDates(previous => ({ ...previous, preferredPaymentMode: event.target.value }))} helperText={modesLoading ? "Loading payment modes..." : "Optional. The actual payment method is recorded when payment is received."} sx={{ mb: 2 }}>
                                <MenuItem value="">Not specified</MenuItem>
                                {paymentModes.map(mode => <MenuItem key={mode.id} value={mode.name}>{mode.name}</MenuItem>)}
                            </TextField>
                            <Box className="estimate-conversion-dates">
                                <TextField label="Invoice date" type="date" value={conversionDates.invoiceDate} required disabled={busy || Boolean(conversionRequest)} onChange={event => setConversionDates(previous => ({ ...previous, invoiceDate: event.target.value }))} slotProps={{ inputLabel: { shrink: true } }} />
                                <TextField label="Due date" type="date" value={conversionDates.dueDate} required disabled={busy || Boolean(conversionRequest)} onChange={event => setConversionDates(previous => ({ ...previous, dueDate: event.target.value }))} slotProps={{ inputLabel: { shrink: true }, htmlInput: { min: conversionDates.invoiceDate } }} />
                            </Box>
                        </>}
                    </DialogContent>
                    <DialogActions><Button disabled={busy} onClick={() => setAction(null)}>Cancel</Button><Button variant="contained" type="submit" disabled={busy || (action === "convert" && !conversionRequest && (modesLoading || Boolean(modesError)))}>{busy ? "Please wait..." : action === "convert" && conversionRequest ? "Retry conversion" : actionLabels[action] || "Confirm"}</Button></DialogActions>
                </Box>
            </Dialog>
        </Box></Box>
    );
};

export default EstimateDetails;
