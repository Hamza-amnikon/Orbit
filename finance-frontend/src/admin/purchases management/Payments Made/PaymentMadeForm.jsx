import { useEffect, useRef, useState } from "react";
import {
    Alert,
    Autocomplete,
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    MenuItem,
    TextField,
    Typography,
} from "@mui/material";
import { useLoad } from "../../../live/data";
import {
    createPaymentMade,
    getBillPaymentBalance,
    getPaymentMadeBills,
    getPaymentMadeModes,
    getPaymentMadeVendors,
    money,
} from "./PaymentMadeService";

function today() {
    const date = new Date();

    return date.getFullYear() + "-" +
        String(date.getMonth() + 1).padStart(2, "0") + "-" +
        String(date.getDate()).padStart(2, "0");
}

export default function PaymentMadeForm({
    billId = null,
    onClose,
    onSaved,
}) {
    const [vendor, setVendor] = useState(null);
    const [bill, setBill] = useState(null);
    const [vendorSearch, setVendorSearch] = useState("");
    const [billSearch, setBillSearch] = useState("");
    const [date, setDate] = useState(today);
    const [amount, setAmount] = useState("");
    const [modeId, setModeId] = useState("");
    const [reference, setReference] = useState("");
    const [notes, setNotes] = useState("");
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState("");
    const [conflict, setConflict] = useState(false);
    const locked = useRef(false);
    const submission = useRef(null);
    const initialised = useRef(false);

    const modes = useLoad(getPaymentMadeModes, []);

    const vendors = useLoad(
        signal => getPaymentMadeVendors(vendorSearch, signal),
        [vendorSearch]
    );

    const bills = useLoad(
        signal => {
            if (!vendor) {
                return Promise.resolve({ data: [], total: 0 });
            }

            return getPaymentMadeBills(vendor.id, billSearch, signal);
        },
        [vendor?.id, billSearch]
    );

    const source = useLoad(
        signal => {
            return billId
                ? getBillPaymentBalance(billId, signal)
                : Promise.resolve(null);
        },
        [billId]
    );

    useEffect(() => {
        if (!source.data || initialised.current) {
            return;
        }

        initialised.current = true;

        setVendor({
            id: source.data.vendorId,
            name: source.data.vendorName,
        });

        setBill(source.data);
        setAmount(String(source.data.outstandingAmount));
    }, [source.data]);

    function chooseVendor(next) {
        setVendor(next);
        setBill(null);
        setAmount("");
        setBillSearch("");
        setConflict(false);
    }

    function chooseBill(next) {
        setBill(next);
        setAmount(next ? String(next.outstandingAmount) : "");
        setConflict(false);
    }

    async function refreshBalance() {
        if (locked.current || !bill) {
            return;
        }

        locked.current = true;
        setBusy(true);

        try {
            setBill(await getBillPaymentBalance(bill.id));
            setConflict(false);
            setError("");
            bills.refresh();
        } catch (loadError) {
            setError(loadError.message);
        } finally {
            locked.current = false;
            setBusy(false);
        }
    }

    async function submit(event) {
        event.preventDefault();

        if (locked.current || conflict) {
            return;
        }

        setError("");

        if (!vendor || !bill || bill.status !== "Issued") {
            setError("Select a vendor and an issued bill.");
            return;
        }

        if (!date || !modeId) {
            setError("Select a payment date and payment mode.");
            return;
        }

        const paymentAmount = Number(amount);

        if (
            amount === "" ||
            !Number.isFinite(paymentAmount) ||
            paymentAmount <= 0 ||
            paymentAmount > bill.outstandingAmount
        ) {
            setError("Enter a positive amount within the outstanding balance.");
            return;
        }

        const factor = 10 ** bill.currencyDecimalPlaces;

        if (Math.abs(Math.round(paymentAmount * factor) / factor - paymentAmount) > 1e-9) {
            setError("Use the bill currency's decimal precision.");
            return;
        }

        locked.current = true;
        setBusy(true);

        try {
            const body = {
                vendorId: vendor.id,
                billId: bill.id,
                billRowVersion: bill.rowVersion,
                paymentDate: date,
                amount: paymentAmount,
                paymentModeId: Number(modeId),
                reference: reference.trim(),
                notes: notes.trim(),
            };

            const fingerprint = JSON.stringify(body);

            if (submission.current?.fingerprint !== fingerprint) {
                submission.current = {
                    fingerprint,
                    id: crypto.randomUUID(),
                };
            }

            const saved = await createPaymentMade({
                ...body,
                requestId: submission.current.id,
            });

            onSaved(saved);
        } catch (saveError) {
            setError(saveError.message);
            setConflict(saveError.status === 409);
        } finally {
            locked.current = false;
            setBusy(false);
        }
    }

    function retryChoices() {
        modes.refresh();
        vendors.refresh();
        bills.refresh();
        source.refresh();
    }

    return (
        <Dialog
            open
            fullWidth
            maxWidth="md"
            onClose={busy ? undefined : onClose}
            aria-labelledby="payment-made-form-title"
        >
            <Box component="form" noValidate onSubmit={submit}>
                <DialogTitle id="payment-made-form-title">
                    Record Payment Made
                </DialogTitle>

                <DialogContent dividers>
                    {(modes.error || vendors.error || bills.error || source.error) && (
                        <Alert
                            severity="error"
                            sx={{ mb: 2 }}
                            action={
                                <Button onClick={retryChoices} disabled={busy}>
                                    Retry choices
                                </Button>
                            }
                        >
                            {modes.error || vendors.error || bills.error || source.error}
                        </Alert>
                    )}

                    <Box
                        sx={{
                            display: "grid",
                            gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                            gap: 2,
                        }}
                    >
                        <Autocomplete
                            value={vendor}
                            options={vendors.data?.data ?? []}
                            loading={vendors.loading}
                            disabled={busy}
                            filterOptions={options => options}
                            isOptionEqualToValue={(a, b) => a.id === b.id}
                            getOptionLabel={option => option.name}
                            onInputChange={(_, text, reason) => {
                                if (reason === "input" || reason === "clear") {
                                    setVendorSearch(text);
                                }
                            }}
                            onChange={(_, next) => chooseVendor(next)}
                            renderInput={params => (
                                <TextField {...params} label="Vendor" required />
                            )}
                        />

                        <Autocomplete
                            value={bill}
                            options={bills.data?.data ?? []}
                            loading={bills.loading}
                            disabled={busy || !vendor}
                            filterOptions={options => options}
                            isOptionEqualToValue={(a, b) => a.id === b.id}
                            getOptionLabel={option => {
                                return option.billNumber +
                                    (option.vendorInvoiceNumber
                                        ? " · " + option.vendorInvoiceNumber
                                        : "");
                            }}
                            onInputChange={(_, text, reason) => {
                                if (reason === "input" || reason === "clear") {
                                    setBillSearch(text);
                                }
                            }}
                            onChange={(_, next) => chooseBill(next)}
                            renderInput={params => (
                                <TextField
                                    {...params}
                                    label="Bill"
                                    required
                                    helperText="Search issued bills with an outstanding balance."
                                />
                            )}
                        />

                        <TextField
                            label="Payment date"
                            type="date"
                            required
                            value={date}
                            disabled={busy}
                            slotProps={{ inputLabel: { shrink: true } }}
                            onChange={event => setDate(event.target.value)}
                        />

                        <TextField
                            select
                            label="Payment mode"
                            required
                            value={modeId}
                            disabled={busy || modes.loading}
                            onChange={event => setModeId(event.target.value)}
                        >
                            {(modes.data ?? []).map(mode => (
                                <MenuItem key={mode.id} value={mode.id}>
                                    {mode.name}
                                </MenuItem>
                            ))}
                        </TextField>

                        <TextField
                            label="Currency"
                            value={bill?.currency || ""}
                            slotProps={{ input: { readOnly: true } }}
                            helperText="Taken from the selected bill."
                        />

                        <TextField
                            label="Managing branch"
                            value={bill?.branch || ""}
                            slotProps={{ input: { readOnly: true } }}
                        />

                        <TextField
                            label="Amount paid"
                            type="number"
                            required
                            value={amount}
                            disabled={busy || !bill}
                            slotProps={{
                                htmlInput: {
                                    min: 0,
                                    max: bill?.outstandingAmount,
                                    step: 1 / (10 ** (bill?.currencyDecimalPlaces ?? 2)),
                                },
                            }}
                            onChange={event => setAmount(event.target.value)}
                        />

                        <TextField
                            label="Reference"
                            value={reference}
                            disabled={busy}
                            slotProps={{ htmlInput: { maxLength: 200 } }}
                            onChange={event => setReference(event.target.value)}
                        />
                    </Box>

                    {bill && (
                        <Alert severity="info" sx={{ mt: 2 }}>
                            Bill total: {money(bill.grandTotal, bill.currency, bill.currencyDecimalPlaces)}
                            {" · "}Already paid: {money(bill.paidAmount, bill.currency, bill.currencyDecimalPlaces)}
                            {" · "}Credits applied: {money(bill.appliedCreditAmount ?? 0, bill.currency, bill.currencyDecimalPlaces)}
                            {" · "}Outstanding: {money(bill.outstandingAmount, bill.currency, bill.currencyDecimalPlaces)}
                        </Alert>
                    )}

                    <TextField
                        label="Notes"
                        multiline
                        minRows={2}
                        fullWidth
                        value={notes}
                        disabled={busy}
                        sx={{ mt: 2 }}
                        slotProps={{ htmlInput: { maxLength: 2000 } }}
                        onChange={event => setNotes(event.target.value)}
                    />

                    <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                        Record a payment you have already made. This does not
                        initiate a bank transfer.
                    </Typography>

                    {error && (
                        <Alert severity="error" sx={{ mt: 2 }}>
                            {error}
                        </Alert>
                    )}

                    {conflict && (
                        <Button disabled={busy} onClick={refreshBalance}>
                            Refresh bill balance
                        </Button>
                    )}
                </DialogContent>

                <DialogActions>
                    <Button disabled={busy} onClick={onClose}>
                        Cancel
                    </Button>

                    <Button
                        type="submit"
                        variant="contained"
                        disabled={busy || conflict || modes.loading || !bill}
                    >
                        {busy ? "Recording..." : "Record Payment"}
                    </Button>
                </DialogActions>
            </Box>
        </Dialog>
    );
}
