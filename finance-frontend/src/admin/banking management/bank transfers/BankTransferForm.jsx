import { useRef, useState } from "react";

import {
    Alert,
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    MenuItem,
    TextField,
} from "@mui/material";

import { today } from "../../../live/data";

import {
    createBankTransfer,
    updateBankTransfer,
} from "./BankTransferService";

import TransferRateEstimate from "./TransferRateEstimate";

function BankTransferForm({
    transfer,
    accounts = [],
    onClose,
    onSaved,
}) {
    const editing = !!transfer?.id;

    const availableAccounts = accounts.filter(
        account =>
            account.isActive &&
            account.openingBalanceDate
    );

    const [value, setValue] = useState(() => ({
        sourceBankAccountId: transfer?.sourceBankAccountId ?? "",
        destinationBankAccountId:
            transfer?.destinationBankAccountId ?? "",
        sourceAmount: transfer?.sourceAmount ?? "",
        sourceFeeAmount: transfer?.sourceFeeAmount ?? "0",
        transferDate: transfer?.transferDate || today(),
        reference: transfer?.reference || "",
        notes: transfer?.notes || "",
    }));

    const [busy, setBusy] = useState(false);
    const [error, setError] = useState("");
    const [conflict, setConflict] = useState(false);

    const locked = useRef(false);
    const requestId = useRef(null);

    const source = accounts.find(
        account => account.id === Number(value.sourceBankAccountId)
    );

    const destination = accounts.find(
        account => account.id === Number(value.destinationBankAccountId)
    );

    const sourceCurrency =
        transfer?.sourceCurrency ||
        source?.currency ||
        "";

    const destinationCurrency =
        transfer?.destinationCurrency ||
        destination?.currency ||
        "";

    const sourcePrecision =
        transfer?.sourceCurrencyDecimalPlaces ??
        source?.currencyDecimalPlaces;

    const readOnly = editing && transfer.status !== 0;

    const disabled = busy || conflict || readOnly;

    function change(name, next) {
        setValue(current => ({
            ...current,
            [name]: next,
            ...(name === "sourceBankAccountId" &&
            Number(next) === Number(current.destinationBankAccountId)
                ? { destinationBankAccountId: "" }
                : {}),
        }));
    }

    function validateAmount(rawValue, label, allowZero) {
        const text = String(rawValue).trim();

        if (!/^\d+(\.\d+)?$/.test(text)) {
            return label + " must be a valid positive number.";
        }

        const amount = Number(text);

        if (
            !Number.isFinite(amount) ||
            amount < 0 ||
            (!allowZero && amount === 0)
        ) {
            return allowZero
                ? label + " must be zero or greater."
                : label + " must be greater than zero.";
        }

        if (
            !Number.isInteger(sourcePrecision) ||
            sourcePrecision < 0 ||
            sourcePrecision > 4
        ) {
            return "The source account has invalid currency precision.";
        }

        const fraction = (text.split(".")[1] || "").replace(/0+$/, "");

        if (fraction.length > sourcePrecision) {
            return (
                label +
                " supports at most " +
                sourcePrecision +
                " decimal places."
            );
        }

        if (
            amount >= 100000000000000 ||
            !Number.isSafeInteger(
                Math.round(amount * (10 ** sourcePrecision))
            )
        ) {
            return label + " exceeds the supported amount.";
        }

        return "";
    }

    async function save(event) {
        event.preventDefault();

        if (locked.current || conflict || readOnly) {
            return;
        }

        setError("");

        if (
            !source ||
            !destination ||
            !source.isActive ||
            !destination.isActive ||
            !source.openingBalanceDate ||
            !destination.openingBalanceDate
        ) {
            setError(
                "Select two active accounts with configured opening balances."
            );
            return;
        }

        if (source.id === destination.id) {
            setError("Source and destination accounts must be different.");
            return;
        }

        if (!value.transferDate) {
            setError("Select the transfer date.");
            return;
        }

        if (value.transferDate < source.openingBalanceDate) {
            setError(
                "Transfer date cannot be before the source account opening date."
            );
            return;
        }

        const amountError = validateAmount(
            value.sourceAmount,
            "Source amount",
            false
        );

        const feeError = validateAmount(
            value.sourceFeeAmount,
            "Source fee",
            true
        );

        if (amountError || feeError) {
            setError(amountError || feeError);
            return;
        }

        if (
            value.reference.trim().length > 200 ||
            value.notes.trim().length > 2000
        ) {
            setError("Reference or notes exceeds the allowed length.");
            return;
        }

        locked.current = true;
        setBusy(true);

        let result;

        try {
            const body = {
                sourceAmount: Number(value.sourceAmount),
                sourceFeeAmount: Number(value.sourceFeeAmount),
                transferDate: value.transferDate,
                reference: value.reference.trim(),
                notes: value.notes.trim(),
            };

            if (editing) {
                result = await updateBankTransfer(
                    transfer.id,
                    {
                        ...body,
                        rowVersion: transfer.rowVersion,
                    }
                );
            } else {
                if (!requestId.current) {
                    requestId.current = crypto.randomUUID();
                }

                result = await createBankTransfer({
                    ...body,
                    requestId: requestId.current,
                    sourceBankAccountId: source.id,
                    destinationBankAccountId: destination.id,
                });
            }

            if (!result?.id) {
                throw new Error(
                    "The save response was incomplete. Refresh the transfer list to check whether it saved."
                );
            }
        } catch (failure) {
            setError(failure.message);
            setConflict(failure.status === 409);
            return;
        } finally {
            locked.current = false;
            setBusy(false);
        }

        onSaved(result);
    }

    return (
        <Dialog
            open
            fullWidth
            maxWidth="sm"
            onClose={busy ? undefined : onClose}
            aria-labelledby="bank-transfer-form-title"
        >
            <Box
                component="form"
                noValidate
                onSubmit={save}
            >
                <DialogTitle id="bank-transfer-form-title">
                    {editing
                        ? "Edit Transfer Draft"
                        : "New Transfer Draft"}
                </DialogTitle>

                <DialogContent dividers>
                    {error && (
                        <Alert
                            severity="error"
                            sx={{ mb: 2 }}
                        >
                            {error}

                            {conflict &&
                                " Close this form and refresh the transfer list before continuing."}
                        </Alert>
                    )}

                    <Alert
                        severity="info"
                        sx={{ mb: 2 }}
                    >
                        Save a draft first. Confirm sending and receiving
                        separately after the bank movements occur.
                        Saving a draft does not change balances.
                    </Alert>

                    {readOnly && (
                        <Alert
                            severity="warning"
                            sx={{ mb: 2 }}
                        >
                            Only draft transfers can be edited.
                        </Alert>
                    )}

                    {!editing && availableAccounts.length < 2 && (
                        <Alert
                            severity="warning"
                            sx={{ mb: 2 }}
                        >
                            You need two active bank accounts with
                            configured opening balances.
                        </Alert>
                    )}

                    <Box
                        sx={{
                            display: "grid",
                            gap: 2,
                            pt: 1,
                        }}
                    >
                        {editing ? (
                            <TextField
                                label="From account"
                                value={
                                    transfer.sourceBankAccountName ||
                                    source?.name ||
                                    ""
                                }
                                slotProps={{
                                    input: { readOnly: true },
                                }}
                            />
                        ) : (
                            <TextField
                                select
                                required
                                label="From account"
                                value={value.sourceBankAccountId}
                                disabled={disabled}
                                onChange={event =>
                                    change(
                                        "sourceBankAccountId",
                                        event.target.value
                                    )
                                }
                            >
                                <MenuItem value="">
                                    Select source account
                                </MenuItem>

                                {availableAccounts.map(account => (
                                    <MenuItem
                                        key={account.id}
                                        value={account.id}
                                    >
                                        {account.name} · {account.companyName}
                                        {" · "}{account.currency}
                                    </MenuItem>
                                ))}
                            </TextField>
                        )}

                        {editing ? (
                            <TextField
                                label="To account"
                                value={
                                    transfer.destinationBankAccountName ||
                                    destination?.name ||
                                    ""
                                }
                                slotProps={{
                                    input: { readOnly: true },
                                }}
                            />
                        ) : (
                            <TextField
                                select
                                required
                                label="To account"
                                value={value.destinationBankAccountId}
                                disabled={disabled}
                                onChange={event =>
                                    change(
                                        "destinationBankAccountId",
                                        event.target.value
                                    )
                                }
                            >
                                <MenuItem value="">
                                    Select destination account
                                </MenuItem>

                                {availableAccounts
                                    .filter(account =>
                                        account.id !==
                                        Number(value.sourceBankAccountId)
                                    )
                                    .map(account => (
                                        <MenuItem
                                            key={account.id}
                                            value={account.id}
                                        >
                                            {account.name} · {account.companyName}
                                            {" · "}{account.currency}
                                        </MenuItem>
                                    ))}
                            </TextField>
                        )}

                        <TextField
                            label="Source currency"
                            value={sourceCurrency}
                            slotProps={{
                                input: { readOnly: true },
                            }}
                        />

                        <TextField
                            label="Destination currency"
                            value={destinationCurrency}
                            slotProps={{
                                input: { readOnly: true },
                            }}
                        />

                        <TextField
                            required
                            type="date"
                            label="Transfer date"
                            value={value.transferDate}
                            disabled={disabled}
                            slotProps={{
                                inputLabel: { shrink: true },
                            }}
                            onChange={event =>
                                change("transferDate", event.target.value)
                            }
                        />

                        <TextField
                            required
                            label={
                                sourceCurrency
                                    ? "Amount to send (" + sourceCurrency + ")"
                                    : "Amount to send"
                            }
                            value={value.sourceAmount}
                            disabled={disabled}
                            slotProps={{
                                htmlInput: { inputMode: "decimal" },
                            }}
                            onChange={event =>
                                change("sourceAmount", event.target.value)
                            }
                        />

                        <TextField
                            required
                            label={
                                sourceCurrency
                                    ? "Additional bank fee (" + sourceCurrency + ")"
                                    : "Additional bank fee"
                            }
                            value={value.sourceFeeAmount}
                            disabled={disabled}
                            helperText="Fee charged separately to the source account. Enter 0 if none."
                            slotProps={{
                                htmlInput: { inputMode: "decimal" },
                            }}
                            onChange={event =>
                                change("sourceFeeAmount", event.target.value)
                            }
                        />

                        <TransferRateEstimate
                            baseCurrency={sourceCurrency}
                            quoteCurrency={destinationCurrency}
                            amount={value.sourceAmount}
                            decimalPlaces={
                                transfer?.destinationCurrencyDecimalPlaces ??
                                destination?.currencyDecimalPlaces
                            }
                            date={value.transferDate}
                            disabled={disabled}
                        />

                        <TextField
                            label="Reference"
                            value={value.reference}
                            disabled={disabled}
                            slotProps={{
                                htmlInput: { maxLength: 200 },
                            }}
                            onChange={event =>
                                change("reference", event.target.value)
                            }
                        />

                        <TextField
                            label="Notes"
                            multiline
                            minRows={2}
                            value={value.notes}
                            disabled={disabled}
                            slotProps={{
                                htmlInput: { maxLength: 2000 },
                            }}
                            onChange={event =>
                                change("notes", event.target.value)
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
                        disabled={
                            disabled ||
                            (!editing && availableAccounts.length < 2)
                        }
                    >
                        {busy ? "Saving…" : "Save Draft"}
                    </Button>
                </DialogActions>
            </Box>
        </Dialog>
    );
}

export default BankTransferForm;
