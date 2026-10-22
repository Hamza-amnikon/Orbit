import React, { useEffect, useRef, useState } from "react";
import { Alert, Box, Button, Card, CardContent, Dialog, FormControlLabel, MenuItem, Switch, TextField, Typography } from "@mui/material";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import SaveRoundedIcon from "@mui/icons-material/SaveRounded";
import { getEstimateClients, previewEstimate, saveEstimate } from "./SalesEstimateService";
import { billingAddress, formatAmount, serviceUnits, today } from "./EstimateHelpers";
import "./EstimateForm.css";

function newItem(item) {
    return {
        key: crypto.randomUUID(),
        serviceName: item?.serviceName ?? "",
        description: item?.description ?? "",
        unit: item?.unit ?? 3,
        quantity: String(item?.quantity ?? 1),
        unitPrice: item?.unitPrice == null ? "" : String(item.unitPrice),
        discountEnabled: item?.discountEnabled === true,
        discountAmount: String(item?.discountEnabled ? item.discountAmount : 0),
        taxRate: String(item?.taxRate ?? 0),
    };
}

const EstimateForm = ({ estimate, onClose, onSaved, onReload }) => {
    const [form, setForm] = useState(() => ({
        clientId: estimate?.clientId ?? "",
        estimateDate: estimate?.estimateDate?.slice(0, 10) ?? today(),
        validUntil: estimate?.validUntil?.slice(0, 10) ?? "",
        servicePeriodStart: estimate?.servicePeriodStart?.slice(0, 10) ?? "",
        servicePeriodEnd: estimate?.servicePeriodEnd?.slice(0, 10) ?? "",
        branch: estimate?.branch ?? "",
        currency: estimate?.currency ?? "",
        billingAddress: estimate?.billingAddress ?? "",
        notes: estimate?.notes ?? "",
        additionalTerms: estimate?.additionalTerms ?? "",
    }));
    const [items, setItems] = useState(() => estimate?.items?.length ? estimate.items.map(newItem) : [newItem()]);
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState("");
    const [revision, setRevision] = useState(0);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState("");
    const [conflict, setConflict] = useState(false);
    const [totals, setTotals] = useState(null);
    const pending = useRef(false);

    useEffect(() => {
        const controller = new AbortController();
        setLoading(true);
        setLoadError("");
        getEstimateClients(controller.signal).then(data => {
            if (!controller.signal.aborted) setClients(data);
        }).catch(failure => {
            if (!controller.signal.aborted) setLoadError(failure.message);
        }).finally(() => {
            if (!controller.signal.aborted) setLoading(false);
        });
        return () => controller.abort();
    }, [revision]);

    const client = clients.find(record => record.id === form.clientId);
    const changedClient = client && (client.branch !== form.branch || client.currency !== form.currency);

    function selectClient(id) {
        const selected = clients.find(record => record.id === id);
        setForm(previous => ({
            ...previous,
            clientId: id,
            branch: selected?.branch ?? "",
            currency: selected?.currency ?? "",
            billingAddress: selected ? billingAddress(selected) : "",
        }));
        setTotals(null);
    }

    function change(name, value) {
        setForm(previous => ({ ...previous, [name]: value }));
        setTotals(null);
    }

    function changeItem(key, name, value) {
        setItems(previous => previous.map(item => {
            if (item.key !== key) return item;
            const next = { ...item, [name]: value };
            if (name === "discountEnabled" && !value) next.discountAmount = "0";
            if (name === "unit" && Number(value) === 3) next.quantity = "1";
            return next;
        }));
        setTotals(null);
    }

    async function submit(previewOnly) {
        if (pending.current || loading || loadError || !client || conflict) return;
        pending.current = true;
        setBusy(true);
        setError("");

        try {
            if (!form.branch || !form.currency || changedClient) throw new Error("Use the selected client's current branch and currency before saving.");
            if (Boolean(form.servicePeriodStart) !== Boolean(form.servicePeriodEnd)) throw new Error("Provide both service period dates, or leave both empty.");
            if (form.servicePeriodEnd && form.servicePeriodEnd < form.servicePeriodStart) throw new Error("Service period end cannot be before its start.");

            const body = {
                ...form,
                servicePeriodStart: form.servicePeriodStart || null,
                servicePeriodEnd: form.servicePeriodEnd || null,
                items: items.map(item => ({
                    serviceName: item.serviceName.trim(),
                    description: item.description.trim(),
                    unit: Number(item.unit),
                    quantity: Number(item.quantity),
                    unitPrice: Number(item.unitPrice),
                    discountEnabled: item.discountEnabled,
                    discountAmount: item.discountEnabled ? Number(item.discountAmount) : 0,
                    taxRate: Number(item.taxRate),
                })),
                ...(estimate ? { rowVersion: estimate.rowVersion } : {}),
            };
            const record = previewOnly ? await previewEstimate(body) : await saveEstimate(body, estimate?.id);
            if (!Array.isArray(record.items) || typeof record.grandTotal !== "number" || (!previewOnly && !(record.id > 0))) throw new Error("The save response could not be confirmed. Check the estimate list before submitting again.");
            setTotals(record);
            if (!previewOnly) onSaved(record);
        } catch (failure) {
            setError(failure.message + (!previewOnly && !estimate && (!failure.status || failure.status >= 500) ? " Check the estimate list before submitting again." : ""));
            setConflict(failure.status === 409);
        } finally {
            pending.current = false;
            setBusy(false);
        }
    }

    const disabled = busy || loading || Boolean(loadError) || !client || conflict || changedClient;
    const input = (name, label, maxLength, multiline = false) => (
        <TextField name={name} label={label} value={form[name]} onChange={event => change(name, event.target.value)} disabled={busy} multiline={multiline} minRows={multiline ? 2 : undefined} fullWidth slotProps={{ htmlInput: { maxLength } }} />
    );
    const date = (name, label, required = false, min) => (
        <TextField name={name} label={label} type="date" value={form[name]} onChange={event => change(name, event.target.value)} required={required} disabled={busy} fullWidth slotProps={{ inputLabel: { shrink: true }, htmlInput: { min } }} />
    );

    return (
        <Dialog open fullWidth maxWidth="md" onClose={busy ? undefined : onClose} aria-labelledby="estimate-form-title">
            <Box className="estimate-form-page"><Card className="estimate-form-card">
                <Box className="estimate-form-header">
                    <Box><Typography id="estimate-form-title" className="estimate-form-title">{estimate ? "Edit Estimate" : "New Estimate"}</Typography><Typography className="estimate-form-subtitle">Create an estimate for your client</Typography></Box>
                    <Button aria-label="Close estimate form" className="estimate-close-button" onClick={onClose} disabled={busy}><CloseRoundedIcon /></Button>
                </Box>
                <CardContent><Box component="form" className="estimate-form" onSubmit={event => { event.preventDefault(); submit(false); }}>
                    {error && <Alert severity="error">{error}</Alert>}
                    {conflict && <Alert severity="info" action={<Button onClick={onReload || onClose}>Reload details</Button>}>Reload the saved estimate before editing again. Unsaved changes in this form will be discarded.</Alert>}
                    {loadError && <Alert severity="error" action={<Button onClick={() => setRevision(value => value + 1)}>Retry</Button>}>{loadError}</Alert>}
                    {changedClient && <Alert severity="warning" action={<Button onClick={() => selectClient(form.clientId)}>Use current details</Button>}>The client's branch or currency changed. Review the rates before saving.</Alert>}
                    <Box className="estimate-form-section">
                        <Typography className="estimate-section-title">Estimate Information</Typography>
                        <Box className="estimate-form-row">
                            <TextField select name="clientId" label="Client" required value={form.clientId} disabled={busy || loading} fullWidth onChange={event => selectClient(event.target.value)} helperText={loading ? "Loading clients..." : !clients.length ? "No active clients available." : ""}>
                                <MenuItem value="">Select client</MenuItem>
                                {form.clientId && !client && <MenuItem value={form.clientId} disabled>{estimate?.clientName || "Selected client"} (unavailable)</MenuItem>}
                                {clients.map(record => <MenuItem key={record.id} value={record.id}>{record.name}{record.companyName ? ` Â· ${record.companyName}` : ""}</MenuItem>)}
                            </TextField>
                            <TextField label="Estimate number" value={estimate?.estimateNumber || "Assigned when marked as sent"} fullWidth slotProps={{ input: { readOnly: true } }} />
                        </Box>
                        <Box className="estimate-form-row">{date("estimateDate", "Estimate date", true)}{date("validUntil", "Valid until", true, form.estimateDate)}</Box>
                        <Box className="estimate-form-row">{date("servicePeriodStart", "Service period start")}{date("servicePeriodEnd", "Service period end", false, form.servicePeriodStart || undefined)}</Box>
                        <Box className="estimate-form-row">
                            <TextField label="Managing branch" value={form.branch} fullWidth slotProps={{ input: { readOnly: true } }} helperText="From the selected client" />
                            <TextField label="Currency" value={form.currency} fullWidth slotProps={{ input: { readOnly: true } }} helperText="From the selected client" />
                        </Box>
                        {input("billingAddress", "Billing address", 1000, true)}
                    </Box>
                    <Box className="estimate-form-section">
                        <Typography className="estimate-section-title">Services</Typography>
                        {items.map((item, index) => (
                            <Box key={item.key} className="estimate-service-line">
                                <Typography fontWeight={600}>Service line {index + 1}</Typography>
                                <Box className="estimate-form-row">
                                    <TextField name={`serviceName-${index}`} label="Service" value={item.serviceName} onChange={event => changeItem(item.key, "serviceName", event.target.value)} required disabled={busy} slotProps={{ htmlInput: { maxLength: 200 } }} />
                                    <TextField name={`description-${index}`} label="Description" value={item.description} onChange={event => changeItem(item.key, "description", event.target.value)} disabled={busy} slotProps={{ htmlInput: { maxLength: 1000 } }} />
                                </Box>
                                <Box className="estimate-form-row">
                                    <TextField select label="Service unit" value={item.unit} onChange={event => changeItem(item.key, "unit", Number(event.target.value))} disabled={busy} required>{serviceUnits.map((name, value) => <MenuItem key={name} value={value}>{name}</MenuItem>)}</TextField>
                                    <TextField name={`quantity-${index}`} label="Quantity" type="number" value={item.quantity} onChange={event => changeItem(item.key, "quantity", event.target.value)} required disabled={busy || item.unit === 3} slotProps={{ htmlInput: { min: 0.0001, max: 99999999999999, step: "0.0001" } }} helperText={item.unit === 3 ? "Fixed fee uses quantity 1" : ""} />
                                </Box>
                                <Box className="estimate-form-row">
                                    <TextField name={`unitPrice-${index}`} label="Rate" type="number" value={item.unitPrice} onChange={event => changeItem(item.key, "unitPrice", event.target.value)} required disabled={busy} slotProps={{ htmlInput: { min: 0, max: 99999999999999, step: "0.0001" } }} />
                                    <TextField name={`taxRate-${index}`} label="Tax %" type="number" value={item.taxRate} onChange={event => changeItem(item.key, "taxRate", event.target.value)} disabled={busy} slotProps={{ htmlInput: { min: 0, max: 100, step: "0.0001" } }} />
                                </Box>
                                <Box className="estimate-form-row">
                                    <FormControlLabel control={<Switch checked={item.discountEnabled} onChange={event => changeItem(item.key, "discountEnabled", event.target.checked)} disabled={busy} />} label={`Enable discount for line ${index + 1}`} />
                                    {item.discountEnabled && (
                                        <TextField name={`discountAmount-${index}`} label="Discount amount" type="number" value={item.discountAmount} onChange={event => changeItem(item.key, "discountAmount", event.target.value)} disabled={busy || !item.discountEnabled} slotProps={{ htmlInput: { min: 0, max: 99999999999999, step: "0.0001" } }} />
                                    )}
                                </Box>
                                <Button color="error" disabled={busy || items.length === 1} onClick={() => { setItems(previous => previous.filter(record => record.key !== item.key)); setTotals(null); }}>Remove service {index + 1}</Button>
                            </Box>
                        ))}
                        <Button variant="outlined" disabled={busy} onClick={() => { setItems(previous => [...previous, newItem()]); setTotals(null); }}>Add service</Button>
                    </Box>
                    <Box className="estimate-form-section"><Typography className="estimate-section-title">Additional Information</Typography>{input("notes", "Notes", 2000, true)}{input("additionalTerms", "Terms and conditions", 2000, true)}</Box>
                    <Box className="estimate-total-section" aria-live="polite">
                        {totals ? <>
                            <Box className="estimate-total-row"><Typography>Subtotal</Typography><Typography>{formatAmount(totals.subTotal, totals.currency)}</Typography></Box>
                            {Number(totals.discountTotal) > 0 && <Box className="estimate-total-row"><Typography>Discount</Typography><Typography>{formatAmount(totals.discountTotal, totals.currency)}</Typography></Box>}
                            <Box className="estimate-total-row"><Typography>Tax</Typography><Typography>{formatAmount(totals.taxTotal, totals.currency)}</Typography></Box>
                            <Box className="estimate-grand-total"><Typography className="estimate-grand-total-label">Grand Total</Typography><Typography className="estimate-grand-total-value">{formatAmount(totals.grandTotal, totals.currency)}</Typography></Box>
                        </> : <Typography>Click Preview totals to calculate this estimate. Saving also calculates the final totals.</Typography>}
                    </Box>
                    <Box className="estimate-form-actions">
                        <Button variant="outlined" className="estimate-cancel-button" onClick={onClose} disabled={busy}>Cancel</Button>
                        <Button variant="outlined" disabled={disabled} onClick={event => { if (event.currentTarget.closest("form").reportValidity()) submit(true); }}>Preview totals</Button>
                        <Button type="submit" variant="contained" startIcon={<SaveRoundedIcon />} className="save-estimate-button" disabled={disabled}>{busy ? "Please wait..." : "Save draft"}</Button>
                    </Box>
                </Box></CardContent>
            </Card></Box>
        </Dialog>
    );
};

export default EstimateForm;
