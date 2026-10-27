import { useEffect, useState } from "react";

import {
    Alert,
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    MenuItem,
    Stack,
    TextField,
    Typography,
} from "@mui/material";

import { money, today } from "../../../live/data";

import {
    getInvoicePaymentSummary,
    getPaymentModes,
    recordInvoicePayment,
} from "./SalesInvoicePaymentService";

const InvoicePaymentForm = ({
    invoice,
    onClose,
    onSaved,
}) => {
    const [requestId] = useState(() => crypto.randomUUID());

    const [summary, setSummary] = useState(null);
    const [paymentModes, setPaymentModes] = useState([]);

    const [loading, setLoading] = useState(true);
    const [busy, setBusy] = useState(false);
    const [loadError, setLoadError] = useState("");
    const [error, setError] = useState("");
    const [reload, setReload] = useState(0);

    const [form, setForm] = useState(() => ({
        paymentDate: today(),
        amount: "",
        percentage: "",
        paymentMode: "",
        reference: "",
        notes: "",
    }));

    useEffect(() => {
        const controller = new AbortController();

        async function loadOptions() {
            setLoading(true);
            setLoadError("");

            try {
                const [paymentSummary, modes] = await Promise.all([
                    getInvoicePaymentSummary(
                        invoice.id,
                        controller.signal
                    ),
                    getPaymentModes(controller.signal),
                ]);

                if (!controller.signal.aborted) {
                    setSummary(paymentSummary);
                    setPaymentModes(modes);
                }
            } catch (failure) {
                if (!controller.signal.aborted) {
                    setLoadError(failure.message);
                }
            } finally {
                if (!controller.signal.aborted) {
                    setLoading(false);
                }
            }
        }

        loadOptions();

        return () => controller.abort();
    }, [invoice.id, reload]);

    const currency = summary?.currency || invoice.currency;
    const balanceDue = summary?.balanceDue ?? 0;
    const enteredAmount = Number(form.amount || 0);
    const enteredPercentage = form.percentage === ""
        ? null
        : Number(form.percentage);
    const percentageError = enteredPercentage !== null &&
        (!Number.isFinite(enteredPercentage) ||
            enteredPercentage < 0 ||
            enteredPercentage > 100);

    const issued =
        invoice.status === 1 ||
        invoice.status === "Issued";

    const ready =
        !loading &&
        !loadError &&
        summary != null &&
        issued &&
        balanceDue > 0 &&
        paymentModes.length > 0;

    function changeField(event) {
        const { name, value } = event.target;

        setError("");

        if (name === "percentage") {
            if (!/^\d{0,3}$/.test(value)) {
                return;
            }

            const percentage = Number(value);
            const decimalPlaces = summary?.currencyDecimalPlaces ?? 2;
            const isValidPercentage =
                value === "" ||
                (Number.isFinite(percentage) &&
                    percentage >= 0 &&
                    percentage <= 100);

            const amount = value === "" || !isValidPercentage
                ? ""
                : (balanceDue * percentage / 100).toFixed(decimalPlaces);

            setForm((previous) => ({
                ...previous,
                percentage: value,
                amount,
            }));

            return;
        }

        setForm((previous) => ({
            ...previous,
            [name]: value,
            ...(name === "amount" ? { percentage: "" } : {}),
        }));
    }

    async function handleSubmit(event) {
        event.preventDefault();

        if (busy || !ready) {
            return;
        }

        if (!Number.isFinite(enteredAmount) || enteredAmount <= 0) {
            setError("Enter a payment amount greater than zero.");
            return;
        }

        if (percentageError) {
            setError("Enter a percentage from 0 to 100.");
            return;
        }

        if (enteredAmount > balanceDue) {
            setError("Payment cannot exceed the remaining balance.");
            return;
        }

        if (!paymentModes.some(
            (mode) => mode.name === form.paymentMode
        )) {
            setError("Select an active payment mode.");
            return;
        }

        if (!form.reference.trim()) {
            setError("Enter a payment reference.");
            return;
        }

        const payload = {
            requestId,
            paymentDate: form.paymentDate,
            amount: enteredAmount,
            paymentMode: form.paymentMode,
            reference: form.reference.trim(),
            notes: form.notes.trim(),
        };

        setBusy(true);
        setError("");

        try {
            const payment = await recordInvoicePayment(
                invoice.id,
                payload
            );

            onSaved?.(payment);
        } catch (failure) {
            // The server may have saved the payment even if its
            // response did not reach the browser.
            try {
                const latest = await getInvoicePaymentSummary(
                    invoice.id
                );

                setSummary(latest);

                const existing = latest.payments.find(
                    (payment) => payment.requestId === requestId
                );

                if (existing) {
                    const samePayment =
                        existing.amount === payload.amount &&
                        existing.paymentDate === payload.paymentDate &&
                        existing.paymentMode.toLowerCase() ===
                            payload.paymentMode.toLowerCase() &&
                        existing.reference === payload.reference &&
                        existing.notes === payload.notes;

                    if (samePayment) {
                        onSaved?.(existing);
                        return;
                    }

                    setError(
                        "This payment request was already recorded with different details. Close this form and check payment history."
                    );
                    return;
                }
            } catch {
                // Keep the same request ID for a safe retry.
            }

            setError(failure.message);
        } finally {
            setBusy(false);
        }
    }

    const readOnlyProps = {
        input: { readOnly: true },
    };

    return (
        <Dialog
            open
            onClose={() => {
                if (!busy) {
                    onClose();
                }
            }}
            fullWidth
            maxWidth="sm"
        >
            <Box component="form" onSubmit={handleSubmit}>
                <DialogTitle>Record Payment</DialogTitle>

                <DialogContent dividers>
                    <Stack spacing={2}>
                        <TextField
                            label="Client"
                            value={invoice.clientName || ""}
                            slotProps={readOnlyProps}
                            fullWidth
                        />

                        <TextField
                            label="Invoice"
                            value={invoice.invoiceNumber || ""}
                            slotProps={readOnlyProps}
                            fullWidth
                        />

                        <TextField
                            label="Currency"
                            value={currency || ""}
                            slotProps={readOnlyProps}
                            fullWidth
                        />

                        {loading && (
                            <Typography>
                                Loading payment details...
                            </Typography>
                        )}

                        {loadError && (
                            <Alert
                                severity="error"
                                action={
                                    <Button
                                        color="inherit"
                                        disabled={loading}
                                        onClick={() =>
                                            setReload((previous) =>
                                                previous + 1
                                            )
                                        }
                                    >
                                        Retry
                                    </Button>
                                }
                            >
                                {loadError}
                            </Alert>
                        )}

                        {error && (
                            <Alert severity="error">
                                {error}
                            </Alert>
                        )}

                        {!issued && (
                            <Alert severity="info">
                                Only issued invoices can receive payments.
                            </Alert>
                        )}

                        {summary && !loading && !loadError && (
                            <Alert severity="info">
                                Invoice total:{" "}
                                {money(summary.invoiceTotal, currency)}
                                <br />
                                Paid amount:{" "}
                                {money(summary.paidAmount, currency)}
                                <br />
                                Balance due:{" "}
                                {money(balanceDue, currency)}
                            </Alert>
                        )}

                        {summary && balanceDue <= 0 && !loading && (
                            <Alert severity="success">
                                This invoice has no remaining balance.
                            </Alert>
                        )}

                        {!loading &&
                            !loadError &&
                            paymentModes.length === 0 && (
                                <Alert severity="info">
                                    Add an active payment mode before
                                    recording a payment.
                                </Alert>
                            )}

                        <TextField
                            name="paymentDate"
                            label="Payment date"
                            type="date"
                            value={form.paymentDate}
                            onChange={changeField}
                            disabled={!ready || busy}
                            slotProps={{
                                inputLabel: { shrink: true },
                            }}
                            required
                            fullWidth
                        />

                        <TextField
                            name="percentage"
                            label="Percentage of remaining balance (%)"
                            type="text"
                            value={form.percentage}
                            onChange={changeField}
                            disabled={!ready || busy}
                            error={percentageError}
                            slotProps={{
                                htmlInput: {
                                    inputMode: "numeric",
                                    maxLength: 3,
                                },
                            }}
                            helperText={
                                percentageError
                                    ? "Enter a value between 0 and 100."
                                    : "Based on remaining balance: " +
                                        money(balanceDue, currency)
                            }
                            slotProps={{
                                htmlInput: {
                                    min: 0,
                                    max: 100,
                                    step: "any",
                                },
                            }}
                            fullWidth
                        />

                        <TextField
                            name="amount"
                            label={`Amount received (${currency || ""})`}
                            type="number"
                            value={form.amount}
                            onChange={changeField}
                            disabled={!ready || busy}
                            slotProps={{
                                htmlInput: {
                                    min: 0,
                                    max: balanceDue,
                                    step: "any",
                                },
                            }}
                            required
                            fullWidth
                        />

                        <Button
                            type="button"
                            variant="outlined"
                            disabled={!ready || busy}
                            onClick={() => {
                                setError("");

                                setForm((previous) => ({
                                    ...previous,
                                    amount: String(balanceDue),
                                    percentage: "100",
                                }));
                            }}
                        >
                            Pay full balance
                        </Button>

                        <TextField
                            name="paymentMode"
                            label="Payment mode"
                            select
                            value={form.paymentMode}
                            onChange={changeField}
                            disabled={!ready || busy}
                            required
                            fullWidth
                        >
                            {paymentModes.map((mode) => (
                                <MenuItem
                                    key={mode.id}
                                    value={mode.name}
                                >
                                    {mode.name}
                                </MenuItem>
                            ))}
                        </TextField>

                        <TextField
                            name="reference"
                            label="Reference"
                            value={form.reference}
                            onChange={changeField}
                            disabled={!ready || busy}
                            slotProps={{
                                htmlInput: { maxLength: 200 },
                            }}
                            required
                            fullWidth
                        />

                        <TextField
                            name="notes"
                            label="Notes"
                            value={form.notes}
                            onChange={changeField}
                            disabled={!ready || busy}
                            multiline
                            minRows={2}
                            slotProps={{
                                htmlInput: { maxLength: 2000 },
                            }}
                            fullWidth
                        />

                        {ready &&
                            enteredAmount > 0 &&
                            enteredAmount <= balanceDue && (
                                <Alert severity="info">
                                    After this payment:
                                    <br />
                                    Total paid:{" "}
                                    {money(
                                        summary.paidAmount + enteredAmount,
                                        currency
                                    )}
                                    <br />
                                    Remaining balance:{" "}
                                    {money(
                                        balanceDue - enteredAmount,
                                        currency
                                    )}
                                </Alert>
                            )}
                    </Stack>
                </DialogContent>

                <DialogActions>
                    <Button
                        type="button"
                        onClick={onClose}
                        disabled={busy}
                    >
                        Cancel
                    </Button>

                    <Button
                        type="submit"
                        variant="contained"
                        disabled={!ready || busy}
                    >
                        {busy ? "Saving..." : "Save Payment"}
                    </Button>
                </DialogActions>
            </Box>
        </Dialog>
    );
};

export default InvoicePaymentForm;
