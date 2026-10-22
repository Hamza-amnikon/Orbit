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
    Typography,
} from "@mui/material";

import { useLoad } from "../../../live/data";
import { Feedback } from "../../../live/shared";

import {
    cancelBankTransaction,
    getBankTransactionById,
    postBankTransaction,
} from "./BankTransactionService";

function formatDate(date) {
    return date
        ? date.slice(0, 10).split("-").reverse().join("/")
        : "—";
}

function formatAmount(transaction) {
    return new Intl.NumberFormat(
        undefined,
        {
            style: "currency",
            currency: transaction.currency,
            currencyDisplay: "code",
            minimumFractionDigits: transaction.currencyDecimalPlaces,
            maximumFractionDigits: transaction.currencyDecimalPlaces,
        }
    ).format(transaction.amount);
}

function DetailField({
    label,
    value,
}) {
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
                sx={{
                    mt: 0.5,
                    whiteSpace: "pre-wrap",
                    overflowWrap: "anywhere",
                }}
            >
                {value || "—"}
            </Typography>
        </Box>
    );
}

function TransactionDetails({
    id,
    canWrite,
    onClose,
    onEdit,
    onChanged,
}) {
    const [confirmation, setConfirmation] = useState("");
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState("");
    const [notice, setNotice] = useState("");
    const [conflict, setConflict] = useState(false);

    const locked = useRef(false);

    const detail = useLoad(
        signal => getBankTransactionById(
            id,
            signal
        ),
        [id]
    );

    const transaction = detail.data;

    const canChange =
        canWrite &&
        !detail.loading &&
        !detail.error &&
        transaction?.status === "Draft" &&
        !conflict;

    function refresh() {
        setError("");
        setConflict(false);
        setConfirmation("");
        detail.refresh();
    }

    async function confirmAction() {
        if (
            locked.current ||
            !canChange ||
            !["post", "cancel"].includes(confirmation)
        ) {
            return;
        }

        locked.current = true;
        setBusy(true);
        setError("");
        setNotice("");

        const posting = confirmation === "post";

        try {
            const result = posting
                ? await postBankTransaction(
                    transaction.id,
                    transaction.rowVersion
                )
                : await cancelBankTransaction(
                    transaction.id,
                    transaction.rowVersion
                );

            const expectedStatus = posting
                ? "Posted"
                : "Cancelled";

            if (result?.status !== expectedStatus) {
                throw new Error(
                    "The API did not confirm the status change. Refresh to check the transaction."
                );
            }

            setConfirmation("");

            setNotice(
                posting
                    ? "Transaction posted."
                    : "Draft cancelled."
            );

            detail.refresh();
            onChanged(result);
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
            maxWidth="md"
            onClose={busy ? undefined : onClose}
            aria-labelledby="transaction-details-title"
        >
            <DialogTitle id="transaction-details-title">
                Transaction · BT-{id}
            </DialogTitle>

            <DialogContent dividers>
                <Feedback
                    loading={detail.loading}
                    error={detail.error}
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

                        {conflict &&
                            " Click Refresh to load the latest transaction."}
                    </Alert>
                )}

                {!detail.loading &&
                    !detail.error &&
                    transaction && (
                        <>
                            <Typography
                                variant="h5"
                                fontWeight={700}
                                sx={{ mb: 1 }}
                            >
                                {formatAmount(transaction)}
                            </Typography>

                            <Chip
                                size="small"
                                label={transaction.status}
                                color={transaction.status === "Posted"
                                    ? "success"
                                    : transaction.status === "Draft"
                                        ? "warning"
                                        : "default"}
                            />

                            <Box
                                sx={{
                                    display: "grid",
                                    gridTemplateColumns: {
                                        xs: "1fr",
                                        sm: "1fr 1fr",
                                    },
                                    gap: 3,
                                    mt: 3,
                                }}
                            >
                                <DetailField
                                    label="Company"
                                    value={transaction.companyName}
                                />

                                <DetailField
                                    label="Bank account"
                                    value={transaction.bankAccountName}
                                />

                                <DetailField
                                    label="Transaction date"
                                    value={formatDate(
                                        transaction.transactionDate
                                    )}
                                />

                                <DetailField
                                    label="Direction"
                                    value={transaction.direction === 1
                                        ? "Money In"
                                        : "Money Out"}
                                />

                                <DetailField
                                    label="Currency"
                                    value={transaction.currency}
                                />

                                <DetailField
                                    label="Reference"
                                    value={transaction.reference}
                                />

                                <DetailField
                                    label="Description"
                                    value={transaction.description}
                                />

                                <DetailField
                                    label="Notes"
                                    value={transaction.notes}
                                />
                            </Box>

                            {confirmation && canChange && (
                                <Alert
                                    severity="warning"
                                    sx={{ mt: 3 }}
                                >
                                    {confirmation === "post"
                                        ? "Post this transaction? It will affect the account balance and cannot be edited afterward. This records a money movement; it does not send money."
                                        : "Cancel this draft? It will remain in history and will not affect the account balance."}
                                </Alert>
                            )}
                        </>
                    )}
            </DialogContent>

            <DialogActions
                sx={{
                    flexWrap: "wrap",
                    gap: 1,
                }}
            >
                {confirmation && canChange ? (
                    <>
                        <Button
                            disabled={busy}
                            onClick={() => setConfirmation("")}
                        >
                            Go Back
                        </Button>

                        <Button
                            variant="contained"
                            color={confirmation === "cancel"
                                ? "error"
                                : "primary"}
                            disabled={busy}
                            onClick={confirmAction}
                        >
                            {busy
                                ? "Saving…"
                                : confirmation === "post"
                                    ? "Confirm Post"
                                    : "Confirm Cancellation"}
                        </Button>
                    </>
                ) : (
                    <>
                        {canChange && (
                            <>
                                <Button
                                    disabled={busy}
                                    onClick={() => onEdit(transaction)}
                                >
                                    Edit
                                </Button>

                                <Button
                                    color="error"
                                    disabled={busy}
                                    onClick={() => {
                                        setNotice("");
                                        setConfirmation("cancel");
                                    }}
                                >
                                    Cancel Draft
                                </Button>

                                <Button
                                    variant="contained"
                                    disabled={busy}
                                    onClick={() => {
                                        setNotice("");
                                        setConfirmation("post");
                                    }}
                                >
                                    Post Transaction
                                </Button>
                            </>
                        )}
                    </>
                )}

                <Button
                    disabled={busy || detail.loading}
                    onClick={refresh}
                >
                    Refresh
                </Button>

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

export default TransactionDetails;