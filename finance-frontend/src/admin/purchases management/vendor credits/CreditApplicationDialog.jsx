import { useRef, useState } from "react";
import {
    Alert,
    Autocomplete,
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    TextField,
    Typography,
} from "@mui/material";
import { useLoad } from "../../../live/data";
import {
    applyVendorCredit,
    getCreditApplicationBills,
    voidCreditApplication,
} from "./VendorCreditService";

function money(value, credit) {
    return new Intl.NumberFormat(undefined, {
        style: "currency",
        currency: credit.currency,
        currencyDisplay: "code",
        minimumFractionDigits: credit.currencyDecimalPlaces,
        maximumFractionDigits: credit.currencyDecimalPlaces,
    }).format(value);
}

function today() {
    const date = new Date();

    return date.getFullYear() + "-" +
        String(date.getMonth() + 1).padStart(2, "0") + "-" +
        String(date.getDate()).padStart(2, "0");
}

export default function CreditApplicationDialog({
    credit,
    application = null,
    onClose,
    onSaved,
    onReload,
}) {
    const [search, setSearch] = useState("");
    const [bill, setBill] = useState(null);
    const [amount, setAmount] = useState("");
    const [date, setDate] = useState(today);
    const [notes, setNotes] = useState("");
    const [reason, setReason] = useState("");
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState("");
    const [conflict, setConflict] = useState(false);
    const locked = useRef(false);
    const submission = useRef(null);

    const choices = useLoad(
        signal => {
            return application
                ? Promise.resolve({ data: [] })
                : getCreditApplicationBills(credit.id, search, signal);
        },
        [credit.id, search, application?.id]
    );

    function chooseBill(next) {
        setBill(next);
        setAmount(
            next
                ? String(Math.min(credit.availableAmount, next.outstandingAmount))
                : ""
        );
    }

    async function submit(event) {
        event.preventDefault();

        if (locked.current || conflict) {
            return;
        }

        setError("");

        if (application && !reason.trim()) {
            setError("Enter a reason for voiding this application.");
            return;
        }

        const number = Number(amount);

        if (
            !application &&
            (
                !bill ||
                !date ||
                amount === "" ||
                !Number.isFinite(number) ||
                number <= 0 ||
                number > credit.availableAmount ||
                number > bill.outstandingAmount
            )
        ) {
            setError("Select a bill, date and amount within both available balances.");
            return;
        }

        locked.current = true;
        setBusy(true);

        try {
            if (application) {
                await voidCreditApplication(credit.id, application.id, {
                    rowVersion: application.rowVersion,
                    reason: reason.trim(),
                });
            } else {
                const body = {
                    billId: bill.id,
                    amount: number,
                    applicationDate: date,
                    notes: notes.trim(),
                    creditRowVersion: credit.rowVersion,
                    billRowVersion: bill.rowVersion,
                };

                const fingerprint = JSON.stringify(body);

                if (submission.current?.fingerprint !== fingerprint) {
                    submission.current = {
                        fingerprint,
                        id: crypto.randomUUID(),
                    };
                }

                await applyVendorCredit(credit.id, {
                    ...body,
                    requestId: submission.current.id,
                });
            }

            onSaved();
        } catch (saveError) {
            setError(saveError.message);
            setConflict(saveError.status === 409);
        } finally {
            locked.current = false;
            setBusy(false);
        }
    }

    return (
        <Dialog
            open
            fullWidth
            maxWidth="sm"
            onClose={busy ? undefined : onClose}
            aria-labelledby="credit-application-title"
        >
            <Box component="form" noValidate onSubmit={submit}>
                <DialogTitle id="credit-application-title">
                    {application ? "Void credit application?" : "Apply Credit to Bill"}
                </DialogTitle>

                <DialogContent dividers>
                    {application ? (
                        <>
                            <DialogContentText>
                                Voiding restores this amount to the available credit
                                and increases the bill outstanding balance. The original
                                application stays in its history.
                            </DialogContentText>

                            <Typography sx={{ mt: 2 }}>
                                {application.billNumber}
                                {" · "}{money(application.amount, credit)}
                            </Typography>

                            <TextField
                                label="Void reason"
                                required
                                multiline
                                minRows={2}
                                fullWidth
                                value={reason}
                                disabled={busy}
                                sx={{ mt: 2 }}
                                slotProps={{ htmlInput: { maxLength: 500 } }}
                                onChange={event => setReason(event.target.value)}
                            />
                        </>
                    ) : (
                        <>
                            <Alert severity="info" sx={{ mb: 2 }}>
                                Available credit: {money(credit.availableAmount, credit)}
                            </Alert>

                            {choices.error && (
                                <Alert
                                    severity="error"
                                    sx={{ mb: 2 }}
                                    action={<Button onClick={choices.refresh}>Retry</Button>}
                                >
                                    {choices.error}
                                </Alert>
                            )}

                            <Autocomplete
                                options={choices.data?.data ?? []}
                                value={bill}
                                loading={choices.loading}
                                disabled={busy}
                                filterOptions={options => options}
                                isOptionEqualToValue={(a, b) => a.id === b.id}
                                getOptionLabel={option => {
                                    return option.billNumber +
                                        (option.vendorInvoiceNumber
                                            ? " · " + option.vendorInvoiceNumber
                                            : "");
                                }}
                                onInputChange={(_, text, why) => {
                                    if (why === "input" || why === "clear") {
                                        setSearch(text);
                                    }
                                }}
                                onChange={(_, next) => chooseBill(next)}
                                renderInput={params => (
                                    <TextField
                                        {...params}
                                        label="Bill"
                                        required
                                        helperText="Issued bills matching this vendor, branch and currency."
                                    />
                                )}
                            />

                            <TextField
                                label="Application date"
                                type="date"
                                required
                                fullWidth
                                sx={{ mt: 2 }}
                                value={date}
                                disabled={busy}
                                slotProps={{ inputLabel: { shrink: true } }}
                                onChange={event => setDate(event.target.value)}
                            />

                            <TextField
                                label="Amount to apply"
                                type="number"
                                required
                                fullWidth
                                sx={{ mt: 2 }}
                                value={amount}
                                disabled={busy || !bill}
                                slotProps={{
                                    htmlInput: {
                                        min: 0,
                                        max: bill
                                            ? Math.min(credit.availableAmount, bill.outstandingAmount)
                                            : 0,
                                        step: 1 / (10 ** credit.currencyDecimalPlaces),
                                    },
                                }}
                                onChange={event => setAmount(event.target.value)}
                            />

                            {bill && (
                                <Typography sx={{ mt: 2 }}>
                                    Bill outstanding: {money(bill.outstandingAmount, credit)}
                                </Typography>
                            )}

                            <TextField
                                label="Notes"
                                multiline
                                fullWidth
                                minRows={2}
                                sx={{ mt: 2 }}
                                value={notes}
                                disabled={busy}
                                slotProps={{ htmlInput: { maxLength: 1000 } }}
                                onChange={event => setNotes(event.target.value)}
                            />

                            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                                This reduces the bill balance using existing credit.
                                It does not record a cash payment or vendor refund.
                            </Typography>
                        </>
                    )}

                    {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}

                    {conflict && (
                        <Button onClick={onReload} disabled={busy}>
                            Reload latest balances
                        </Button>
                    )}
                </DialogContent>

                <DialogActions>
                    <Button disabled={busy} onClick={onClose}>Back</Button>
                    <Button
                        type="submit"
                        variant="contained"
                        color={application ? "error" : "primary"}
                        disabled={busy || conflict || (!application && !bill)}
                    >
                        {busy ? "Saving..." : application ? "Confirm Void" : "Apply Credit"}
                    </Button>
                </DialogActions>
            </Box>
        </Dialog>
    );
}
