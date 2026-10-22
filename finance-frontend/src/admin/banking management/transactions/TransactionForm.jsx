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
    createBankTransaction,
    updateBankTransaction,
} from "./BankTransactionService";

function TransactionForm({
    transaction,
    accounts = [],
    onClose,
    onSaved,
}) {
    const editing = !!transaction?.id;

    const availableAccounts = accounts.filter(
        account =>
            account.isActive &&
            account.openingBalanceDate
    );

    const [value, setValue] = useState(() => ({
        bankAccountId:
            transaction?.bankAccountId ||
            availableAccounts[0]?.id ||
            "",
        transactionDate: transaction?.transactionDate || today(),
        direction: transaction?.direction || 1,
        amount: transaction?.amount ?? "",
        reference: transaction?.reference || "",
        description: transaction?.description || "",
        notes: transaction?.notes || "",
    }));

    const [busy, setBusy] = useState(false);
    const [error, setError] = useState("");
    const [conflict, setConflict] = useState(false);

    const locked = useRef(false);

    const requestId = useRef(
        transaction?.requestId || crypto.randomUUID()
    );

    const account = accounts.find(
        row => row.id === Number(value.bankAccountId)
    );

    const currency = account?.currency || transaction?.currency || "";

    const companyName =
        account?.companyName ||
        transaction?.companyName ||
        "";

    const readOnly =
        editing &&
        transaction.status !== "Draft";

    function change(name, next) {
        setValue(current => ({
            ...current,
            [name]: next,
        }));
    }

    async function save(event) {
        event.preventDefault();

        if (locked.current || conflict || readOnly) {
            return;
        }

        setError("");

        if (!editing && !availableAccounts.some(
            row => row.id === Number(value.bankAccountId)
        )) {
            setError(
                "Select an active account with a configured opening balance."
            );
            return;
        }

        if (!value.transactionDate) {
            setError("Select the transaction date.");
            return;
        }

        if (
            account?.openingBalanceDate &&
            value.transactionDate < account.openingBalanceDate
        ) {
            setError(
                "Transaction date cannot be earlier than the account opening date."
            );
            return;
        }

        if (
            value.amount === "" ||
            !Number.isFinite(Number(value.amount)) ||
            Number(value.amount) <= 0
        ) {
            setError("Enter an amount greater than zero.");
            return;
        }

        if (![1, 2].includes(Number(value.direction))) {
            setError("Select Money In or Money Out.");
            return;
        }

        locked.current = true;
        setBusy(true);

        try {
            const body = {
                transactionDate: value.transactionDate,
                direction: Number(value.direction),
                amount: Number(value.amount),
                reference: value.reference.trim(),
                description: value.description.trim(),
                notes: value.notes.trim(),
            };

            let result;

            if (editing) {
                result = await updateBankTransaction(
                    transaction.id,
                    {
                        ...body,
                        rowVersion: transaction.rowVersion,
                    }
                );
            } else {
                result = await createBankTransaction({
                    ...body,
                    requestId: requestId.current,
                    bankAccountId: Number(value.bankAccountId),
                });
            }

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
            aria-labelledby="transaction-form-title"
        >
            <Box
                component="form"
                noValidate
                onSubmit={save}
            >
                <DialogTitle id="transaction-form-title">
                    {editing
                        ? "Edit Transaction Draft"
                        : "New Transaction Draft"}
                </DialogTitle>

                <DialogContent dividers>
                    {error && (
                        <Alert
                            severity="error"
                            sx={{ mb: 2 }}
                        >
                            {error}

                            {conflict &&
                                " Close this form and refresh the transactions before trying again."}
                        </Alert>
                    )}

                    <Alert
                        severity="info"
                        sx={{ mb: 2 }}
                    >
                        Saving creates or updates a draft.
                        Only posted transactions affect the account balance.
                        This form does not send money.
                    </Alert>

                    {readOnly && (
                        <Alert
                            severity="warning"
                            sx={{ mb: 2 }}
                        >
                            Only draft transactions can be edited.
                        </Alert>
                    )}

                    {!editing && !availableAccounts.length && (
                        <Alert
                            severity="warning"
                            sx={{ mb: 2 }}
                        >
                            Add an active bank account and configure its
                            opening balance before creating a transaction.
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
                                label="Bank account"
                                value={
                                    transaction.bankAccountName ||
                                    account?.name ||
                                    ""
                                }
                                slotProps={{
                                    input: {
                                        readOnly: true,
                                    },
                                }}
                            />
                        ) : (
                            <TextField
                                select
                                required
                                label="Bank account"
                                value={value.bankAccountId}
                                disabled={busy}
                                onChange={event =>
                                    change(
                                        "bankAccountId",
                                        event.target.value
                                    )
                                }
                            >
                                {availableAccounts.map(row => (
                                    <MenuItem
                                        key={row.id}
                                        value={row.id}
                                    >
                                        {row.name} · {row.companyName} · {row.currency}
                                    </MenuItem>
                                ))}
                            </TextField>
                        )}

                        <TextField
                            label="Company"
                            value={companyName}
                            slotProps={{
                                input: {
                                    readOnly: true,
                                },
                            }}
                        />

                        <TextField
                            label="Account currency"
                            value={currency}
                            slotProps={{
                                input: {
                                    readOnly: true,
                                },
                            }}
                        />

                        <TextField
                            required
                            type="date"
                            label="Transaction date"
                            value={value.transactionDate}
                            disabled={busy || readOnly}
                            slotProps={{
                                inputLabel: {
                                    shrink: true,
                                },
                            }}
                            onChange={event =>
                                change(
                                    "transactionDate",
                                    event.target.value
                                )
                            }
                        />

                        <TextField
                            select
                            required
                            label="Direction"
                            value={value.direction}
                            disabled={busy || readOnly}
                            onChange={event =>
                                change(
                                    "direction",
                                    Number(event.target.value)
                                )
                            }
                        >
                            <MenuItem value={1}>
                                Money In
                            </MenuItem>

                            <MenuItem value={2}>
                                Money Out
                            </MenuItem>
                        </TextField>

                        <TextField
                            required
                            type="number"
                            label={"Amount (" + currency + ")"}
                            value={value.amount}
                            disabled={busy || readOnly}
                            helperText="Enter a positive amount in the account currency."
                            slotProps={{
                                htmlInput: {
                                    step: "any",
                                },
                            }}
                            onChange={event =>
                                change("amount", event.target.value)
                            }
                        />

                        <TextField
                            label="Reference"
                            value={value.reference}
                            disabled={busy || readOnly}
                            slotProps={{
                                htmlInput: {
                                    maxLength: 200,
                                },
                            }}
                            onChange={event =>
                                change("reference", event.target.value)
                            }
                        />

                        <TextField
                            label="Description"
                            value={value.description}
                            disabled={busy || readOnly}
                            multiline
                            minRows={2}
                            slotProps={{
                                htmlInput: {
                                    maxLength: 1000,
                                },
                            }}
                            onChange={event =>
                                change("description", event.target.value)
                            }
                        />

                        <TextField
                            label="Notes"
                            value={value.notes}
                            disabled={busy || readOnly}
                            multiline
                            minRows={2}
                            slotProps={{
                                htmlInput: {
                                    maxLength: 2000,
                                },
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
                            busy ||
                            conflict ||
                            readOnly ||
                            (!editing && !availableAccounts.length)
                        }
                    >
                        {busy ? "Saving…" : "Save Draft"}
                    </Button>
                </DialogActions>
            </Box>
        </Dialog>
    );
}

export default TransactionForm;