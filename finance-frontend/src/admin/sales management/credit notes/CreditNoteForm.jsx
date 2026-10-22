import React, { useEffect, useRef, useState } from "react";
import { Alert, Box, Button, Card, CardContent, Checkbox, Dialog, Divider, FormControlLabel, IconButton, MenuItem, TextField, Typography } from "@mui/material";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import { useAuth } from "../../../context/AuthContext";
import { createCreditNote, getCreditInvoiceContext, getIssuedCreditInvoices, previewCreditNote } from "./SalesCreditNoteService";
import "./CreditNotes.css";

const pendingKey = "sales-credit-note-pending-create";
const units = { 0: "Hour", 1: "Day", 2: "Month", 3: "Fixed fee", Hour: "Hour", Day: "Day", Month: "Month", FixedFee: "Fixed fee" };
function today() {
    const date = new Date();
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}
function recoverRequest() {
    try {
        const body = JSON.parse(sessionStorage.getItem(pendingKey));
        return body && typeof body.requestId === "string" && body.salesInvoiceId > 0 && Array.isArray(body.items) ? body : null;
    } catch { return null; }
}
const money = (value, currency) => new Intl.NumberFormat("en-US", { style: "currency", currency, currencyDisplay: "code" }).format(value);

const CreditNoteForm = ({ onClose, onSaved }) => {
    const { canWrite } = useAuth();
    const [recovered] = useState(recoverRequest);
    const [creditBasis, setCreditBasis] = useState(() => recovered && recovered.items.every(item => item.creditAmount == null) ? "Quantity" : "Amount");
    const [requestId] = useState(() => recovered?.requestId || crypto.randomUUID());
    const [pendingBody, setPendingBody] = useState(recovered);
    const [invoiceId, setInvoiceId] = useState(() => recovered ? String(recovered.salesInvoiceId) : "");
    const [form, setForm] = useState(() => ({ creditNoteDate: recovered?.creditNoteDate || today(), reason: recovered?.reason || "", notes: recovered?.notes || "" }));
    const [quantities, setQuantities] = useState(() => Object.fromEntries((recovered?.items || []).map(item => [item.salesInvoiceItemId, String(item.creditAmount ?? item.quantity)])));
    const [invoices, setInvoices] = useState([]);
    const [context, setContext] = useState(null);
    const [optionsLoading, setOptionsLoading] = useState(true);
    const [contextLoading, setContextLoading] = useState(false);
    const [optionsError, setOptionsError] = useState("");
    const [contextError, setContextError] = useState("");
    const [error, setError] = useState("");
    const [preview, setPreview] = useState(null);
    const [busy, setBusy] = useState(false);
    const [revision, setRevision] = useState(0);
    const pending = useRef(false);

    useEffect(() => {
        const controller = new AbortController();
        setOptionsLoading(true);
        setOptionsError("");
        getIssuedCreditInvoices(controller.signal).then(records => {
            if (!controller.signal.aborted) setInvoices(records);
        }).catch(failure => {
            if (!controller.signal.aborted) setOptionsError(failure.message);
        }).finally(() => {
            if (!controller.signal.aborted) setOptionsLoading(false);
        });
        return () => controller.abort();
    }, [revision]);

    useEffect(() => {
        const controller = new AbortController();
        setContext(null);
        setContextError("");
        if (!invoiceId) return () => controller.abort();
        setContextLoading(true);
        getCreditInvoiceContext(invoiceId, controller.signal).then(result => {
            if (!controller.signal.aborted) setContext(result);
        }).catch(failure => {
            if (!controller.signal.aborted) setContextError(failure.message);
        }).finally(() => {
            if (!controller.signal.aborted) setContextLoading(false);
        });
        return () => controller.abort();
    }, [invoiceId, revision]);

    const invoice = context?.invoice;
    const locked = busy || Boolean(pendingBody);
    const ready = canWrite && invoice && !optionsLoading && !contextLoading && !optionsError && !contextError;
    const readOnly = { input: { readOnly: true } };
    const hasDiscount = Number(preview?.discountTotal) > 0;
    function change(field, value) {
        setForm(previous => ({ ...previous, [field]: value }));
        setPreview(null);
        setError("");
    }
    function getBody() {
        if (!ready) throw new Error("Select an issued invoice and wait for its services to load.");
        if (!form.creditNoteDate || form.creditNoteDate < invoice.invoiceDate.slice(0, 10)) throw new Error("Credit date must be on or after the invoice date.");
        if (!form.reason.trim()) throw new Error("Enter a reason for the credit.");
        const items = [];
        for (const item of invoice.items) {
            if (!(item.id in quantities)) continue;
            const quantity = Number(quantities[item.id]);
            if (!Number.isFinite(quantity) || quantity <= 0 || Math.abs(quantity - Math.round(quantity * 10000) / 10000) > 0.0000000001) throw new Error("Enter a positive credit amount or quantity with up to four decimal places.");
            if (creditBasis === "Amount") {
                if (quantity > context.remainingAmounts[item.id]) throw new Error(`Credit amount for ${item.serviceName} exceeds the available amount before tax.`);
                items.push({ salesInvoiceItemId: item.id, creditAmount: quantity });
                continue;
            }
            if (quantity > context.remaining[item.id]) throw new Error(`Credit quantity for ${item.serviceName} exceeds the available quantity.`);
            items.push({ salesInvoiceItemId: item.id, quantity });
        }
        if (!items.length) throw new Error("Select at least one service to credit.");
        return { requestId, salesInvoiceId: invoice.id, creditNoteDate: form.creditNoteDate, reason: form.reason.trim(), notes: form.notes.trim(), items };
    }
    async function calculate() {
        if (pending.current || pendingBody || !canWrite) return;
        pending.current = true;
        setBusy(true);
        setError("");
        try {
            const body = getBody();
            const result = await previewCreditNote(body);
            if (result.salesInvoiceId !== body.salesInvoiceId || !Array.isArray(result.items)) throw new Error("Preview could not be confirmed. Please try again.");
            setPreview(result);
        } catch (failure) { setPreview(null); setError(failure.message); }
        finally { pending.current = false; setBusy(false); }
    }
    async function save(event) {
        event.preventDefault();
        if (pending.current || !canWrite) return;
        pending.current = true;
        setBusy(true);
        setError("");
        try {
            if (!pendingBody && !preview) throw new Error("Preview the credit total before saving.");
            const body = pendingBody || getBody();
            sessionStorage.setItem(pendingKey, JSON.stringify(body));
            setPendingBody(body);
            const record = await createCreditNote(body);
            if (!(record.id > 0) || record.requestId !== body.requestId || record.salesInvoiceId !== body.salesInvoiceId || !Array.isArray(record.items)) throw new Error("Save could not be confirmed. Retry to recover the same draft.");
            sessionStorage.removeItem(pendingKey);
            setPendingBody(null);
            onSaved(record);
        } catch (failure) {
            if ([400, 404, 409].includes(failure.status)) {
                sessionStorage.removeItem(pendingKey);
                setPendingBody(null);
                setPreview(null);
            }
            setError(failure.message);
        } finally { pending.current = false; setBusy(false); }
    }

    return <Dialog open fullWidth maxWidth="md" onClose={busy ? undefined : onClose} aria-labelledby="credit-note-form-title">
        <Box component="form" className="credit-note-form" noValidate onSubmit={save}>
            <Box className="credit-note-form-header">
                <Box><Typography id="credit-note-form-title" className="credit-note-form-title">New Credit Note</Typography><Typography className="credit-note-form-subtitle">Create a draft against an issued invoice</Typography></Box>
                <IconButton aria-label="Close credit note form" className="credit-note-close-button" onClick={onClose} disabled={busy}><CloseRoundedIcon /></IconButton>
            </Box>
            <Box sx={{ px: 2.5, pt: 2 }}>
                {pendingBody && <Alert severity="info" sx={{ mb: 2 }}>A previous save has not been confirmed. Retry save to recover the same draft. The original details are kept for this retry.</Alert>}
                {(optionsError || contextError) && <Alert severity="error" action={<Button onClick={() => setRevision(value => value + 1)} disabled={busy}>Reload</Button>}>{optionsError || contextError}</Alert>}
                {optionsLoading && <Typography>Loading issued invoices...</Typography>}
                {!optionsLoading && !optionsError && !invoices.length && <Alert severity="info">Issue an invoice before creating a credit note.</Alert>}
            </Box>
            <Card className="credit-note-form-card"><CardContent>
                <Typography className="credit-note-form-section-title">Credit Note Information</Typography>
                <Box className="credit-note-form-grid">
                    <TextField select label="Issued invoice" required value={invoiceId} disabled={locked || optionsLoading || Boolean(optionsError)} onChange={event => { setInvoiceId(String(event.target.value)); setQuantities({}); setPreview(null); setError(""); }}>
                        <MenuItem value="">Select an invoice</MenuItem>
                        {invoices.map(record => <MenuItem key={record.id} value={String(record.id)}>{record.invoiceNumber} · {record.clientName} ({record.currency})</MenuItem>)}
                        {pendingBody && !invoices.some(record => record.id === pendingBody.salesInvoiceId) && <MenuItem value={String(pendingBody.salesInvoiceId)}>Invoice #{pendingBody.salesInvoiceId}</MenuItem>}
                    </TextField>
                    <TextField select label="Credit basis" value={creditBasis} disabled={locked} onChange={event => { setCreditBasis(event.target.value); setQuantities({}); setPreview(null); setError(""); }}>
                        <MenuItem value="Amount">Amount</MenuItem><MenuItem value="Quantity">Quantity</MenuItem>
                    </TextField>
                    <TextField label="Credit note number" value="Assigned when issued" slotProps={readOnly} />
                    <TextField label="Credit date" type="date" required value={form.creditNoteDate} disabled={locked} onChange={event => change("creditNoteDate", event.target.value)} slotProps={{ inputLabel: { shrink: true }, htmlInput: { min: invoice?.invoiceDate?.slice(0, 10) } }} />
                    <TextField label="Client" value={invoice?.clientName || ""} slotProps={readOnly} />
                    <TextField label="Managing branch" value={invoice?.branch || ""} slotProps={readOnly} />
                    <TextField label="Currency" value={invoice?.currency || ""} slotProps={readOnly} />
                    <TextField label="Reason" required multiline minRows={2} value={form.reason} disabled={locked} onChange={event => change("reason", event.target.value)} slotProps={{ htmlInput: { maxLength: 2000 } }} />
                    <TextField label="Notes" multiline minRows={2} value={form.notes} disabled={locked} onChange={event => change("notes", event.target.value)} slotProps={{ htmlInput: { maxLength: 2000 } }} />
                </Box>
            </CardContent></Card>
            {contextLoading && <Typography sx={{ px: 2.5, pt: 2 }}>Loading invoice services and previous credits...</Typography>}
            {invoice && <Card className="credit-note-form-card"><CardContent>
                <Typography className="credit-note-form-section-title">Services to Credit</Typography>
                <Typography variant="body2" sx={{ mb: 2 }}>{creditBasis === "Amount" ? "Enter the credit amount before tax, after the original discount. Related tax is calculated automatically; service quantity stays unchanged." : "Choose services and enter the quantity to credit. Rates, discounts and tax follow the original invoice."}</Typography>
                {invoice.items.map(item => {
                    const selected = item.id in quantities;
                    const available = creditBasis === "Amount" ? context.remainingAmounts[item.id] : context.remaining[item.id];
                    return <Box key={item.id} className="credit-note-service-choice">
                        <FormControlLabel control={<Checkbox checked={selected} disabled={locked || available <= 0} onChange={event => { const checked = event.target.checked; setQuantities(previous => { const next = { ...previous }; if (checked) next[item.id] = String(available); else delete next[item.id]; return next; }); setPreview(null); setError(""); }} />} label={item.serviceName} />
                        <Typography variant="body2" sx={{ mb: 1 }}>{item.description}</Typography>
                        <Typography variant="body2" sx={{ mb: 2 }}>Original quantity: {item.quantity} · {creditBasis === "Amount" ? `Available credit before tax: ${money(available, invoice.currency)}` : `Available to credit: ${available}`} · Unit: {units[item.unit] || item.unit}</Typography>
                        <Box className="credit-note-form-grid">
                            <TextField label={`${creditBasis === "Amount" ? "Credit amount before tax" : "Credit quantity"} — ${item.serviceName}`} type="number" required={selected} value={quantities[item.id] ?? ""} disabled={locked || !selected} onChange={event => { const value = event.target.value; setQuantities(previous => ({ ...previous, [item.id]: value })); setPreview(null); setError(""); }} slotProps={{ htmlInput: { min: 0.0001, max: available, step: 0.0001 } }} />
                            <TextField label="Original rate" value={money(item.unitPrice, invoice.currency)} slotProps={readOnly} />
                            <TextField label="Original tax rate" value={`${item.taxRate}%`} slotProps={readOnly} />
                            {Number(item.discountAmount) > 0 && <TextField label="Original line discount" value={money(item.discountAmount, invoice.currency)} slotProps={readOnly} />}
                        </Box>
                    </Box>;
                })}
            </CardContent></Card>}
            {preview && <Card className="credit-note-summary-card"><CardContent>
                <Typography className="credit-note-form-section-title">Credit Note Preview</Typography>
                <Box className="credit-note-summary-row"><Typography>Subtotal</Typography><Typography>{money(preview.subTotal, preview.currency)}</Typography></Box>
                {hasDiscount && <Box className="credit-note-summary-row"><Typography>Discount</Typography><Typography>{money(preview.discountTotal, preview.currency)}</Typography></Box>}
                <Box className="credit-note-summary-row"><Typography>Tax</Typography><Typography>{money(preview.taxTotal, preview.currency)}</Typography></Box><Divider />
                <Box className="credit-note-grand-total-row"><Typography>Total Credit Amount</Typography><Typography>{money(preview.grandTotal, preview.currency)}</Typography></Box>
                <Typography variant="body2" sx={{ mt: 2 }}>Saving a draft does not reduce the invoice balance. The credit applies when issued.</Typography>
            </CardContent></Card>}
            {error && <Alert severity="error" role="alert" sx={{ mx: 2.5, mt: 2 }}>{error}</Alert>}
            <Box className="credit-note-form-actions" sx={{ flexWrap: "wrap" }}>
                <Button variant="outlined" className="credit-note-cancel-button" onClick={onClose} disabled={busy}>Cancel</Button>
                <Button variant="outlined" onClick={calculate} disabled={!ready || locked}>Preview Credit</Button>
                <Button type="submit" variant="contained" className="credit-note-save-button" disabled={!canWrite || busy || (!pendingBody && (!ready || !preview))}>{busy ? "Please wait..." : pendingBody ? "Retry Save" : "Save Draft"}</Button>
            </Box>
        </Box>
    </Dialog>;
};
export default CreditNoteForm;
