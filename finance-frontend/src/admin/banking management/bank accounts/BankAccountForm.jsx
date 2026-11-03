import { useEffect, useRef, useState } from "react";

import {
    Alert,
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControlLabel,
    MenuItem,
    Switch,
    TextField,
} from "@mui/material";

import { today } from "../../../live/data";

import {
    createBankAccount,
    getBankAccountingAccounts,
    updateBankAccount,
} from "./BankAccountService";

function BankAccountForm({
    account,
    companies,
    currencies,
    onClose,
    onSaved,
}) {
    const editing = !!account?.id;

    const [value, setValue] = useState(() => {
        const companyId =
            account?.companyId ||
            companies[0]?.id ||
            "";

        const company = companies.find(
            row => row.id === Number(companyId)
        );

        const defaultCurrency = currencies.find(
            row => row.currencyCode === company?.currency
        );

        return {
            companyId,
            accountingAccountId:
                account?.accountingAccountId || "",
            name: account?.name || "",
            bankName: account?.bankName || "",
            accountNumber: "",
            currency:
                account?.currency ||
                defaultCurrency?.currencyCode ||
                currencies[0]?.currencyCode ||
                "",
            openingBalance: "",
            openingBalanceDate: today(),
            isActive: account?.isActive ?? true,
        };
    });

    const [busy, setBusy] = useState(false);
    const [error, setError] = useState("");
    const [conflict, setConflict] = useState(false);
    const [accountingAccounts, setAccountingAccounts] = useState([]);
    const [accountingLoading, setAccountingLoading] = useState(false);
    const [accountingError, setAccountingError] = useState("");

    const locked = useRef(false);

    useEffect(() => {
        const controller = new AbortController();

        setAccountingAccounts([]);
        setAccountingError("");
        setAccountingLoading(false);

        if (!value.companyId) {
            return () => controller.abort();
        }

        setAccountingLoading(true);

        getBankAccountingAccounts(
            Number(value.companyId),
            controller.signal
        )
            .then(result => {
                if (!controller.signal.aborted) {
                    setAccountingAccounts(result);
                }
            })
            .catch(failure => {
                if (!controller.signal.aborted) {
                    setAccountingError(failure.message);
                }
            })
            .finally(() => {
                if (!controller.signal.aborted) {
                    setAccountingLoading(false);
                }
            });

        return () => controller.abort();
    }, [value.companyId]);

    function change(name, next) {
        setValue(current => ({
            ...current,
            [name]: next,
        }));
    }

    function chooseCompany(id) {
        const company = companies.find(
            row => row.id === Number(id)
        );

        const currency = currencies.find(
            row => row.currencyCode === company?.currency
        );

        setValue(current => ({
            ...current,
            companyId: id,
            accountingAccountId: "",
            currency:
                currency?.currencyCode ||
                currencies[0]?.currencyCode ||
                "",
        }));
    }

    async function save(event) {
        event.preventDefault();

        if (locked.current || conflict) {
            return;
        }

        setError("");

        if (!value.name.trim() || !value.bankName.trim()) {
            setError("Account name and bank name are required.");
            return;
        }

        if (!accountingAccounts.some(
            row => row.id === Number(value.accountingAccountId)
        )) {
            setError(
                "Select an accounting posting account under Bank Accounts."
            );
            return;
        }

        if (!editing) {
            const company = companies.find(
                row => row.id === Number(value.companyId)
            );

            if (!company) {
                setError("Select a company.");
                return;
            }

            if (!value.accountNumber.trim()) {
                setError("Enter the account number.");
                return;
            }

            const currency = currencies.find(
                row => row.currencyCode === value.currency
            );

            if (!currency) {
                setError("Select an active account currency.");
                return;
            }

            if (
                value.openingBalance === "" ||
                !Number.isFinite(Number(value.openingBalance))
            ) {
                setError("Enter an opening balance. Enter 0 if it is zero.");
                return;
            }

            if (!value.openingBalanceDate) {
                setError("Select the opening balance date.");
                return;
            }
        }

        locked.current = true;
        setBusy(true);

        try {
            let result;

            if (editing) {
                result = await updateBankAccount(
                    account.id,
                    {
                        accountingAccountId:
                            Number(value.accountingAccountId),
                        name: value.name.trim(),
                        bankName: value.bankName.trim(),
                        isActive: value.isActive,
                        rowVersion: account.rowVersion,
                    }
                );
            } else {
                result = await createBankAccount({
                    companyId: Number(value.companyId),
                    accountingAccountId:
                        Number(value.accountingAccountId),
                    name: value.name.trim(),
                    bankName: value.bankName.trim(),
                    accountNumber: value.accountNumber.trim(),
                    currency: value.currency,
                    openingBalance: Number(value.openingBalance),
                    openingBalanceDate: value.openingBalanceDate,
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
            aria-labelledby="bank-account-form-title"
        >
            <Box
                component="form"
                noValidate
                onSubmit={save}
            >
                <DialogTitle id="bank-account-form-title">
                    {editing
                        ? "Edit Bank Account"
                        : "New Bank Account"}
                </DialogTitle>

                <DialogContent dividers>
                    {error && (
                        <Alert
                            severity="error"
                            sx={{ mb: 2 }}
                        >
                            {error}

                            {conflict &&
                                " Close and reopen the account to load its latest details."}
                        </Alert>
                    )}

                    {accountingError && (
                        <Alert
                            severity="error"
                            sx={{ mb: 2 }}
                        >
                            {accountingError}
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
                                label="Company"
                                value={account.companyName}
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
                                label="Company"
                                value={value.companyId}
                                disabled={busy}
                                onChange={event =>
                                    chooseCompany(event.target.value)
                                }
                            >
                                {companies.map(row => (
                                    <MenuItem
                                        key={row.id}
                                        value={row.id}
                                    >
                                        {row.name}
                                    </MenuItem>
                                ))}
                            </TextField>
                        )}

                        <TextField
                            select
                            required
                            label="Accounting ledger account"
                            value={value.accountingAccountId}
                            disabled={busy || accountingLoading}
                            helperText={
                                accountingLoading
                                    ? "Loading accounting accounts…"
                                    : accountingAccounts.length
                                        ? "This ledger will receive the bank account movements."
                                        : "Create a posting account under Bank Accounts in Chart of Accounts."
                            }
                            onChange={event =>
                                change(
                                    "accountingAccountId",
                                    event.target.value
                                )
                            }
                        >
                            {accountingAccounts.map(row => (
                                <MenuItem
                                    key={row.id}
                                    value={row.id}
                                >
                                    {row.code} · {row.name}
                                </MenuItem>
                            ))}
                        </TextField>

                        <TextField
                            required
                            label="Account name"
                            value={value.name}
                            disabled={busy}
                            slotProps={{
                                htmlInput: {
                                    maxLength: 160,
                                },
                            }}
                            onChange={event =>
                                change("name", event.target.value)
                            }
                        />

                        <TextField
                            required
                            label="Bank name"
                            value={value.bankName}
                            disabled={busy}
                            slotProps={{
                                htmlInput: {
                                    maxLength: 160,
                                },
                            }}
                            onChange={event =>
                                change("bankName", event.target.value)
                            }
                        />

                        {editing ? (
                            <TextField
                                label="Account"
                                value={account.lastFour
                                    ? "•••• " + account.lastFour
                                    : "Not provided"}
                                slotProps={{
                                    input: {
                                        readOnly: true,
                                    },
                                }}
                            />
                        ) : (
                            <TextField
                                required
                                label="Account number"
                                value={value.accountNumber}
                                disabled={busy}
                                slotProps={{
                                    htmlInput: {
                                        maxLength: 50,
                                    },
                                }}
                                onChange={event =>
                                    change(
                                        "accountNumber",
                                        event.target.value
                                    )
                                }
                            />
                        )}

                        {editing ? (
                            <TextField
                                label="Account currency"
                                value={value.currency}
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
                                label="Account currency"
                                value={value.currency}
                                disabled={busy}
                                onChange={event =>
                                    change("currency", event.target.value)
                                }
                            >
                                {currencies.map(row => (
                                    <MenuItem
                                        key={row.currencyCode}
                                        value={row.currencyCode}
                                    >
                                        {row.currencyCode} · {row.currencyName}
                                    </MenuItem>
                                ))}
                            </TextField>
                        )}

                        {!editing && (
                            <>
                                <TextField
                                    required
                                    type="number"
                                    label={"Opening balance (" + value.currency + ")"}
                                    value={value.openingBalance}
                                    disabled={busy}
                                    helperText="Use the bank balance at the start of the selected date."
                                    slotProps={{
                                        htmlInput: {
                                            step: "any",
                                        },
                                    }}
                                    onChange={event =>
                                        change(
                                            "openingBalance",
                                            event.target.value
                                        )
                                    }
                                />

                                <TextField
                                    required
                                    type="date"
                                    label="Opening balance date"
                                    value={value.openingBalanceDate}
                                    disabled={busy}
                                    slotProps={{
                                        inputLabel: {
                                            shrink: true,
                                        },
                                    }}
                                    onChange={event =>
                                        change(
                                            "openingBalanceDate",
                                            event.target.value
                                        )
                                    }
                                />
                            </>
                        )}

                        {editing && (
                            <FormControlLabel
                                label="Active account"
                                control={
                                    <Switch
                                        checked={value.isActive}
                                        disabled={busy}
                                        onChange={event =>
                                            change(
                                                "isActive",
                                                event.target.checked
                                            )
                                        }
                                    />
                                }
                            />
                        )}
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
                            accountingLoading ||
                            !value.accountingAccountId ||
                            (!editing && (
                                !companies.length ||
                                !currencies.length
                            ))
                        }
                    >
                        {busy
                            ? "Saving…"
                            : editing
                                ? "Save Changes"
                                : "Add Account"}
                    </Button>
                </DialogActions>
            </Box>
        </Dialog>
    );
}

export default BankAccountForm;
