import { useRef, useState } from "react";

import {
    Alert,
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    TextField,
} from "@mui/material";

import {
    configureOpeningBalance,
} from "./BankAccountService";

function OpeningBalanceForm({
    account,
    onClose,
    onSaved,
}) {
    const [amount, setAmount] = useState("");
    const [date, setDate] = useState("");
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState("");
    const [conflict, setConflict] = useState(false);

    const locked = useRef(false);
    const configured = !!account.openingBalanceDate;

    async function save(event) {
        event.preventDefault();

        if (locked.current || conflict || configured) {
            return;
        }

        setError("");

        if (
            amount.trim() === "" ||
            !Number.isFinite(Number(amount))
        ) {
            setError(
                "Enter the opening balance. Enter 0 if it is zero."
            );
            return;
        }

        if (!date) {
            setError("Select the opening balance date.");
            return;
        }

        locked.current = true;
        setBusy(true);

        try {
            const result = await configureOpeningBalance(
                account.id,
                {
                    openingBalance: Number(amount),
                    openingBalanceDate: date,
                    rowVersion: account.rowVersion,
                }
            );

            onSaved(result);
        } catch (failure) {
            setError(failure.message);
            setConflict(failure.status === 409);
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
            aria-labelledby="opening-balance-form-title"
        >
            <Box
                component="form"
                noValidate
                onSubmit={save}
            >
                <DialogTitle id="opening-balance-form-title">
                    Configure Opening Balance
                </DialogTitle>

                <DialogContent dividers>
                    {error && (
                        <Alert
                            severity="error"
                            sx={{ mb: 2 }}
                        >
                            {error}

                            {conflict &&
                                " Close this form, refresh the accounts, and reopen it."}
                        </Alert>
                    )}

                    <Alert
                        severity={configured ? "warning" : "info"}
                        sx={{ mb: 2 }}
                    >
                        {configured
                            ? "Opening balance is already configured for this account."
                            : "Enter the bank balance at the start of the selected date. This can be configured only once."}
                    </Alert>

                    <Box
                        sx={{
                            display: "grid",
                            gap: 2,
                            pt: 1,
                        }}
                    >
                        <TextField
                            label="Company"
                            value={account.companyName || ""}
                            slotProps={{
                                input: {
                                    readOnly: true,
                                },
                            }}
                        />

                        <TextField
                            label="Account"
                            value={account.name}
                            slotProps={{
                                input: {
                                    readOnly: true,
                                },
                            }}
                        />

                        <TextField
                            label="Account currency"
                            value={account.currency}
                            slotProps={{
                                input: {
                                    readOnly: true,
                                },
                            }}
                        />

                        <TextField
                            required
                            type="number"
                            label={
                                "Opening balance (" +
                                account.currency +
                                ")"
                            }
                            value={amount}
                            disabled={busy || configured}
                            helperText={
                                "Supports up to " +
                                account.currencyDecimalPlaces +
                                " decimal places. A negative balance represents an overdraft."
                            }
                            slotProps={{
                                htmlInput: {
                                    step: "any",
                                },
                            }}
                            onChange={event =>
                                setAmount(event.target.value)
                            }
                        />

                        <TextField
                            required
                            type="date"
                            label="Opening balance date"
                            value={date}
                            disabled={busy || configured}
                            slotProps={{
                                inputLabel: {
                                    shrink: true,
                                },
                            }}
                            onChange={event =>
                                setDate(event.target.value)
                            }
                        />
                    </Box>
                </DialogContent>

                <DialogActions>
                    <Button
                        disabled={busy}
                        onClick={onClose}
                    >
                        Cancel
                    </Button>

                    <Button
                        type="submit"
                        variant="contained"
                        disabled={busy || conflict || configured}
                    >
                        {busy
                            ? "Saving…"
                            : "Save Opening Balance"}
                    </Button>
                </DialogActions>
            </Box>
        </Dialog>
    );
}

export default OpeningBalanceForm;