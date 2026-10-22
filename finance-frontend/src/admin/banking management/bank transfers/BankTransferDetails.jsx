import { useRef, useState } from "react";

import {
    Alert,
    Box,
    Button,
    Chip,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Stack,
    TextField,
    Typography,
} from "@mui/material";

import { useLoad, today } from "../../../live/data";
import { Feedback } from "../../../live/shared";

import {
    getBankTransferById,
    confirmBankTransferSent,
    confirmBankTransferReceived,
    cancelBankTransfer,
} from "./BankTransferService";

import TransferRateEstimate from "./TransferRateEstimate";

function statusLabel(status) {
    switch (status) {
        case 0:
            return "Draft";
        case 1:
            return "Pending";
        case 2:
            return "Completed";
        case 3:
            return "Cancelled";
        default:
            return "Unknown";
    }
}

function statusColor(status) {
    switch (status) {
        case 0:
            return "warning";
        case 1:
            return "info";
        case 2:
            return "success";
        default:
            return "default";
    }
}

function formatDate(date) {
    return date
        ? date.slice(0, 10).split("-").reverse().join("/")
        : "—";
}

function formatAmount(amount, currency, decimalPlaces) {
    if (amount === null || amount === undefined) {
        return "—";
    }

    return new Intl.NumberFormat(
        undefined,
        {
            style: "currency",
            currency,
            currencyDisplay: "code",
            minimumFractionDigits: decimalPlaces,
            maximumFractionDigits: decimalPlaces,
        }
    ).format(amount);
}

function validateAmount(raw, precision, allowZero = false) {
    const text = String(raw).trim();

    if (!/^\d+(\.\d+)?$/.test(text)) {
        return "Enter a valid amount using digits and a decimal point.";
    }

    const amount = Number(text);

    if (
        !Number.isFinite(amount) ||
        amount < 0 ||
        (!allowZero && amount === 0)
    ) {
        return allowZero
            ? "The amount must be zero or greater."
            : "The amount must be greater than zero.";
    }

    if (
        !Number.isInteger(precision) ||
        precision < 0 ||
        precision > 4
    ) {
        return "The account has invalid currency precision.";
    }

    const fraction = (text.split(".")[1] || "").replace(/0+$/, "");

    if (fraction.length > precision) {
        return "The amount supports at most " + precision + " decimal places.";
    }

    if (
        amount >= 100000000000000 ||
        !Number.isSafeInteger(Math.round(amount * (10 ** precision)))
    ) {
        return "The amount exceeds the supported limit.";
    }

    return "";
}

function Detail({ label, children }) {
    return (
        <Box>
            <Typography
                variant="caption"
                color="text.secondary"
            >
                {label}
            </Typography>

            <Typography
                variant="body2"
                sx={{ overflowWrap: "anywhere" }}
            >
                {children ?? "—"}
            </Typography>
        </Box>
    );
}

function BankTransferDetails({
    id,
    canWrite,
    onClose,
    onEdit,
    onChanged,
}) {
    const record = useLoad(
        signal => getBankTransferById(id, signal),
        [id]
    );

    const transfer = record.data;

    const [action, setAction] = useState(null);
    const [value, setValue] = useState({});
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState("");
    const [notice, setNotice] = useState("");
    const [needsRefresh, setNeedsRefresh] = useState(false);

    const locked = useRef(false);

    const ready =
        !!transfer &&
        !record.loading &&
        !record.error;

    function refresh() {
        if (locked.current) {
            return;
        }

        setAction(null);
        setError("");
        setNotice("");
        setNeedsRefresh(false);
        record.refresh();
    }

    function change(name, next) {
        setValue(current => ({
            ...current,
            [name]: next,
        }));
    }

    function beginAction(nextAction) {
        if (!ready || busy || !canWrite || needsRefresh) {
            return;
        }

        setError("");
        setNotice("");

        setValue({
            sourceAmount: String(transfer.sourceAmount),
            sourceFeeAmount: String(transfer.sourceFeeAmount),
            transferDate: transfer.transferDate,
            reference: transfer.reference || "",
            destinationAmount: "",
            receivedDate: today(),
        });

        setAction(nextAction);
    }

    async function confirm(event) {
        event.preventDefault();

        if (
            locked.current ||
            !ready ||
            !canWrite ||
            !action ||
            needsRefresh
        ) {
            return;
        }

        setError("");

        const expectedStatus = action === "receive" ? 1 : 0;

        if (transfer.status !== expectedStatus) {
            setError("The transfer status has changed. Refresh before continuing.");
            setNeedsRefresh(true);
            return;
        }

        let body;

        if (action === "send") {
            const amountError = validateAmount(
                value.sourceAmount,
                transfer.sourceCurrencyDecimalPlaces
            );

            const feeError = validateAmount(
                value.sourceFeeAmount,
                transfer.sourceCurrencyDecimalPlaces,
                true
            );

            if (amountError || feeError) {
                setError(amountError || feeError);
                return;
            }

            if (!value.transferDate) {
                setError("Select the actual debit date.");
                return;
            }

            body = {
                sourceAmount: Number(value.sourceAmount),
                sourceFeeAmount: Number(value.sourceFeeAmount),
                transferDate: value.transferDate,
                reference: value.reference.trim(),
                rowVersion: transfer.rowVersion,
            };
        }

        if (action === "receive") {
            const amountError = validateAmount(
                value.destinationAmount,
                transfer.destinationCurrencyDecimalPlaces
            );

            if (amountError) {
                setError(amountError);
                return;
            }

            if (!value.receivedDate) {
                setError("Select the actual receipt date.");
                return;
            }

            body = {
                destinationAmount: Number(value.destinationAmount),
                receivedDate: value.receivedDate,
                rowVersion: transfer.rowVersion,
            };
        }

        locked.current = true;
        setBusy(true);

        let result;

        try {
            if (action === "send") {
                result = await confirmBankTransferSent(id, body);
            } else if (action === "receive") {
                result = await confirmBankTransferReceived(id, body);
            } else if (action === "cancel") {
                result = await cancelBankTransfer(
                    id,
                    transfer.rowVersion
                );
            }

            const expectedResultStatus =
                action === "send" ? 1 :
                    action === "receive" ? 2 : 3;

            if (
                !result ||
                result.id !== id ||
                result.status !== expectedResultStatus
            ) {
                throw new Error(
                    "The response was unexpected. Refresh to check the transfer status."
                );
            }
        } catch (failure) {
            setError(failure.message);

            // Refresh after conflicts or uncertain outcomes before
            // allowing another confirmation.
            setNeedsRefresh(failure.status !== 400);
            return;
        } finally {
            locked.current = false;
            setBusy(false);
        }

        setAction(null);
        setNotice(
            "Transfer updated to " + statusLabel(result.status) + "."
        );

        record.refresh();
        onChanged?.(result);
    }

    return (
        <Dialog
            open
            fullWidth
            maxWidth="sm"
            onClose={busy ? undefined : onClose}
            aria-labelledby="bank-transfer-details-title"
        >
            <DialogTitle id="bank-transfer-details-title">
                Transfer · {id}
            </DialogTitle>

            <DialogContent dividers>
                <Feedback
                    loading={record.loading}
                    error={record.error}
                    retry={refresh}
                />

                {notice && (
                    <Alert
                        severity="success"
                        sx={{ mb: 2 }}
                    >
                        {notice}
                    </Alert>
                )}

                {error && (
                    <Alert
                        severity="error"
                        sx={{ mb: 2 }}
                    >
                        {error}

                        {needsRefresh &&
                            " Click Refresh before continuing."}
                    </Alert>
                )}

                {ready && (
                    <>
                        <Chip
                            size="small"
                            label={statusLabel(transfer.status)}
                            color={statusColor(transfer.status)}
                            sx={{ mb: 3 }}
                        />

                        <Box
                            sx={{
                                display: "grid",
                                gridTemplateColumns: {
                                    xs: "1fr",
                                    sm: "1fr 1fr",
                                },
                                gap: 3,
                            }}
                        >
                            <Detail label="From account">
                                {transfer.sourceBankAccountName}
                                {" · "}
                                {transfer.sourceCompanyName}
                            </Detail>

                            <Detail label="To account">
                                {transfer.destinationBankAccountName}
                                {" · "}
                                {transfer.destinationCompanyName}
                            </Detail>

                            <Detail label="Transfer date">
                                {formatDate(transfer.transferDate)}
                            </Detail>

                            <Detail label="Received date">
                                {formatDate(transfer.receivedDate)}
                            </Detail>

                            <Detail label="Source amount">
                                {formatAmount(
                                    transfer.sourceAmount,
                                    transfer.sourceCurrency,
                                    transfer.sourceCurrencyDecimalPlaces
                                )}
                            </Detail>

                            <Detail label="Additional source fee">
                                {formatAmount(
                                    transfer.sourceFeeAmount,
                                    transfer.sourceCurrency,
                                    transfer.sourceCurrencyDecimalPlaces
                                )}
                            </Detail>

                            <Detail label="Actual received amount">
                                {formatAmount(
                                    transfer.destinationAmount,
                                    transfer.destinationCurrency,
                                    transfer.destinationCurrencyDecimalPlaces
                                )}
                            </Detail>

                            <Detail label="Effective exchange rate">
                                {transfer.effectiveExchangeRate == null
                                    ? "—"
                                    : "1 " + transfer.sourceCurrency +
                                      " = " + transfer.effectiveExchangeRate +
                                      " " + transfer.destinationCurrency}
                            </Detail>

                            <Detail label="Reference">
                                {transfer.reference || "—"}
                            </Detail>

                            <Detail label="Notes">
                                {transfer.notes || "—"}
                            </Detail>
                        </Box>

                        {transfer.status === 1 && !action && (
                            <Alert
                                severity="info"
                                sx={{ mt: 3 }}
                            >
                                The source debit is recorded. Confirm receipt
                                when the destination bank credits the money.
                            </Alert>
                        )}

                        {action && (
                            <Box
                                component="form"
                                id="bank-transfer-confirmation"
                                noValidate
                                onSubmit={confirm}
                                sx={{ mt: 3 }}
                            >
                                <Alert
                                    severity="warning"
                                    sx={{ mb: 2 }}
                                >
                                    {action === "send" &&
                                        "Confirm only after the bank debit occurs. This records the amount and additional fee as money out in Finance."}

                                    {action === "receive" &&
                                        "Enter the actual net amount credited by the destination bank. This increases its balance in Finance."}

                                    {action === "cancel" &&
                                        "Cancel this draft? It will remain in history and will not affect balances."}
                                </Alert>

                                <Stack spacing={2}>
                                    {action === "send" && (
                                        <>
                                            <TextField
                                                required
                                                label={
                                                    "Actual amount sent (" +
                                                    transfer.sourceCurrency +
                                                    ")"
                                                }
                                                value={value.sourceAmount}
                                                disabled={busy || needsRefresh}
                                                slotProps={{
                                                    htmlInput: {
                                                        inputMode: "decimal",
                                                    },
                                                }}
                                                onChange={event =>
                                                    change(
                                                        "sourceAmount",
                                                        event.target.value
                                                    )
                                                }
                                            />

                                            <TextField
                                                required
                                                label={
                                                    "Additional source fee (" +
                                                    transfer.sourceCurrency +
                                                    ")"
                                                }
                                                value={value.sourceFeeAmount}
                                                disabled={busy || needsRefresh}
                                                slotProps={{
                                                    htmlInput: {
                                                        inputMode: "decimal",
                                                    },
                                                }}
                                                onChange={event =>
                                                    change(
                                                        "sourceFeeAmount",
                                                        event.target.value
                                                    )
                                                }
                                            />

                                            <TextField
                                                required
                                                type="date"
                                                label="Actual debit date"
                                                value={value.transferDate}
                                                disabled={busy || needsRefresh}
                                                slotProps={{
                                                    inputLabel: { shrink: true },
                                                }}
                                                onChange={event =>
                                                    change(
                                                        "transferDate",
                                                        event.target.value
                                                    )
                                                }
                                            />

                                            <TextField
                                                label="Reference"
                                                value={value.reference}
                                                disabled={busy || needsRefresh}
                                                slotProps={{
                                                    htmlInput: { maxLength: 200 },
                                                }}
                                                onChange={event =>
                                                    change(
                                                        "reference",
                                                        event.target.value
                                                    )
                                                }
                                            />
                                        </>
                                    )}

                                    {action === "receive" && (
                                        <>
                                            <TransferRateEstimate
                                                baseCurrency={transfer.sourceCurrency}
                                                quoteCurrency={transfer.destinationCurrency}
                                                amount={transfer.sourceAmount}
                                                decimalPlaces={transfer.destinationCurrencyDecimalPlaces}
                                                date={value.receivedDate}
                                                disabled={busy || needsRefresh}
                                            />

                                            <TextField
                                                required
                                                label={
                                                    "Actual received amount (" +
                                                    transfer.destinationCurrency +
                                                    ")"
                                                }
                                                value={value.destinationAmount}
                                                disabled={busy || needsRefresh}
                                                slotProps={{
                                                    htmlInput: {
                                                        inputMode: "decimal",
                                                    },
                                                }}
                                                onChange={event =>
                                                    change(
                                                        "destinationAmount",
                                                        event.target.value
                                                    )
                                                }
                                            />

                                            <TextField
                                                required
                                                type="date"
                                                label="Actual receipt date"
                                                value={value.receivedDate}
                                                disabled={busy || needsRefresh}
                                                slotProps={{
                                                    inputLabel: { shrink: true },
                                                }}
                                                onChange={event =>
                                                    change(
                                                        "receivedDate",
                                                        event.target.value
                                                    )
                                                }
                                            />
                                        </>
                                    )}
                                </Stack>
                            </Box>
                        )}
                    </>
                )}
            </DialogContent>

            <DialogActions sx={{ flexWrap: "wrap", gap: 1 }}>
                <Button
                    disabled={busy || record.loading}
                    onClick={refresh}
                >
                    Refresh
                </Button>

                {ready && !action && canWrite && !needsRefresh && (
                    <>
                        {transfer.status === 0 && (
                            <>
                                {onEdit && (
                                    <Button
                                        onClick={() => onEdit(transfer)}
                                    >
                                        Edit Draft
                                    </Button>
                                )}

                                <Button
                                    color="error"
                                    onClick={() => beginAction("cancel")}
                                >
                                    Cancel Draft
                                </Button>

                                <Button
                                    variant="contained"
                                    onClick={() => beginAction("send")}
                                >
                                    Confirm Sent
                                </Button>
                            </>
                        )}

                        {transfer.status === 1 && (
                            <Button
                                variant="contained"
                                onClick={() => beginAction("receive")}
                            >
                                Confirm Received
                            </Button>
                        )}
                    </>
                )}

                {ready && action && canWrite && (
                    <>
                        <Button
                            disabled={busy}
                            onClick={() => {
                                setAction(null);
                                setError("");
                            }}
                        >
                            Back
                        </Button>

                        <Button
                            type="submit"
                            form="bank-transfer-confirmation"
                            variant="contained"
                            color={action === "cancel" ? "error" : "primary"}
                            disabled={busy || needsRefresh}
                        >
                            {busy
                                ? "Saving…"
                                : action === "send"
                                    ? "Record Money Sent"
                                    : action === "receive"
                                        ? "Record Money Received"
                                        : "Confirm Cancellation"}
                        </Button>
                    </>
                )}

                <Button
                    disabled={busy}
                    onClick={onClose}
                >
                    Close
                </Button>
            </DialogActions>
        </Dialog>
    );
}

export default BankTransferDetails;
