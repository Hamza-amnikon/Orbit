<<<<<<< HEAD
import ModuleForm from "../../shared/ModuleForm";
export default function ExpenseForm(props) { return <ModuleForm {...props} />; }
=======
import { useEffect, useRef, useState } from "react";

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
    Typography,
} from "@mui/material";

import { today } from "../../../live/data";

import {
    convertExpenseAmount,
    getAutomaticExpenseRate,
    money,
    saveExpense,
    uploadReceipt,
} from "./ExpenseService";

function formatRateDate(date) {
    return date
        ? date.slice(0, 10).split("-").reverse().join("/")
        : "";
}

export default function ExpenseForm({
    expense,
    companies,
    accounts,
    currencies,
    displayCurrency,
    onClose,
    onSaved,
}) {
    const [value, setValue] = useState(() => ({
        companyId: expense.companyId || companies[0]?.id || "",
        bankAccountId: expense.bankAccountId || "",
        date: expense.date || today(),
        supplier: expense.supplier || "",
        category: expense.category || "",
        notes: expense.notes || "",
        amount: expense.amount ?? "",
        currency:
            expense.currency ||
            companies.find(row => row.id === expense.companyId)?.currency ||
            currencies[0]?.currencyCode ||
            "",
        reference: expense.reference || "",
    }));

    const [saved, setSaved] = useState(
        expense.id ? expense : null
    );

    const [file, setFile] = useState(null);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState("");
    const [conflict, setConflict] = useState(false);

    const locked = useRef(false);
    const errorRef = useRef(null);

    useEffect(() => {
        if (error) {
            errorRef.current?.scrollIntoView({ block: "nearest" });
            errorRef.current?.focus();
        }
    }, [error]);

    const requestId = useRef(
        expense.requestId || crypto.randomUUID()
    );

    const [rateState, setRateState] = useState(null);
    const [rateRevision, setRateRevision] = useState(0);

    const targetCurrency = displayCurrency || value.currency;

    const rateKey = JSON.stringify([
        value.currency,
        targetCurrency,
        value.date,
        rateRevision,
    ]);

    const savedRateMatches =
        !!saved &&
        saved.currency === value.currency &&
        saved.date === value.date &&
        convertExpenseAmount(
            1,
            value.currency,
            targetCurrency,
            saved.rate,
            saved.rateBaseCurrency,
            saved.rateQuoteCurrency
        ) != null;

    const automaticRate = savedRateMatches
        ? {
            rate: saved.rate,
            rateDate: saved.rateDate,
            rateBaseCurrency: saved.rateBaseCurrency,
            rateQuoteCurrency: saved.rateQuoteCurrency,
            source: "Saved rate",
        }
        : value.currency === targetCurrency
            ? {
                rate: 1,
                rateDate: value.date,
                rateBaseCurrency: value.currency,
                rateQuoteCurrency: value.currency,
                source: "Same currency",
            }
            : rateState?.key === rateKey
                ? rateState.data
                : null;

    const rateError = rateState?.key === rateKey
        ? rateState.error
        : "";

    useEffect(() => {
        if (
            !value.currency ||
            !targetCurrency ||
            !value.date ||
            savedRateMatches ||
            value.currency === targetCurrency
        ) {
            return;
        }

        const controller = new AbortController();

        getAutomaticExpenseRate(
            value.currency,
            targetCurrency,
            value.date,
            controller.signal
        )
            .then(data => {
                if (!controller.signal.aborted) {
                    setRateState({
                        key: rateKey,
                        data,
                        error: "",
                    });
                }
            })
            .catch(failure => {
                if (!controller.signal.aborted) {
                    setRateState({
                        key: rateKey,
                        data: null,
                        error: failure.message,
                    });
                }
            });

        return () => controller.abort();
    }, [
        value.currency,
        targetCurrency,
        value.date,
        rateKey,
        savedRateMatches,
        rateRevision,
    ]);

    const companyAccounts = accounts.filter(
        row => row.companyId === Number(value.companyId)
    );

    function change(name, next) {
        setValue(current => {
            const changed = {
                ...current,
                [name]: next,
            };

            return changed;
        });
    }

    function changeSource(currency, extra = {}) {
        setValue(current => ({
            ...current,
            ...extra,
            currency,
        }));
    }

    async function save(event) {
        event.preventDefault();

        if (locked.current) {
            return;
        }

        const requestedStatus =
            event.nativeEvent.submitter?.value === "Recorded"
                ? "Recorded"
                : "Draft";

        if (!companies.some(row => row.id === Number(value.companyId))) {
            setError("Select a company.");
            return;
        }

        if (!value.date || value.date > today()) {
            setError("Select an expense date today or earlier.");
            return;
        }

        if (!value.supplier.trim() || !value.category.trim()) {
            setError("Supplier and category are required.");
            return;
        }

        if (
            requestedStatus === "Recorded" &&
            !value.bankAccountId
        ) {
            setError("Select the account used to pay this expense.");
            return;
        }

        if (
            !currencies.some(
                row => row.currencyCode === value.currency
            )
        ) {
            setError("Select a currency from Currency Master.");
            return;
        }

        const currency = currencies.find(
            row => row.currencyCode === value.currency
        );

        const enteredAmount = Number(value.amount);
        const scaledAmount = enteredAmount * (10 ** currency.decimalPlaces);

        if (
            !Number.isFinite(enteredAmount) ||
            enteredAmount <= 0 ||
            enteredAmount > 999999999999.9999 ||
            Math.abs(scaledAmount - Math.round(scaledAmount)) >
                Math.max(0.00000001, Math.abs(scaledAmount) * Number.EPSILON)
        ) {
            setError(
                "Enter a positive amount with up to " +
                currency.decimalPlaces + " decimal places."
            );
            return;
        }

        const rateToSave = automaticRate || (
            requestedStatus === "Draft"
                ? saved &&
                    saved.currency === value.currency &&
                    saved.date === value.date
                    ? {
                        rate: saved.rate,
                        rateDate: saved.rateDate,
                        rateBaseCurrency: saved.rateBaseCurrency,
                        rateQuoteCurrency: saved.rateQuoteCurrency,
                    }
                    : {
                        rate: 1,
                        rateDate: value.date,
                        rateBaseCurrency: value.currency,
                        rateQuoteCurrency: value.currency,
                    }
                : null
        );

        if (!rateToSave) {
            setError(
                "Wait for the automatic exchange rate, or retry the lookup."
            );
            return;
        }

        locked.current = true;
        setBusy(true);
        setError("");

        let row = saved;
        const hasReceipt = !!file;

        try {
            const body = {
                ...value,
                requestId: requestId.current,
                companyId: Number(value.companyId),
                bankAccountId: value.bankAccountId
                    ? Number(value.bankAccountId)
                    : null,
                amount: Number(value.amount),
                rate: rateToSave.rate,
                rateDate: rateToSave.rateDate,
                rateBaseCurrency: rateToSave.rateBaseCurrency,
                rateQuoteCurrency: rateToSave.rateQuoteCurrency,
                status: file ? "Draft" : requestedStatus,
                rowVersion: row?.rowVersion,
            };

            row = await saveExpense(
                row?.id,
                body
            );

            setSaved(row);

            if (file) {
                row = await uploadReceipt(
                    row.id,
                    file,
                    row.rowVersion
                );

                setSaved(row);
                setFile(null);
            }

            if (requestedStatus === "Recorded" && hasReceipt) {
                row = await saveExpense(
                    row.id,
                    {
                        ...body,
                        status: "Recorded",
                        rowVersion: row.rowVersion,
                    }
                );

                setSaved(row);
            }

            if (row.status !== requestedStatus) {
                throw new Error(
                    requestedStatus === "Recorded"
                        ? "The API returned Draft. This expense has not been recorded. Reload the expense and try again."
                        : "The API did not confirm the expense as Draft. Reload before trying again."
                );
            }

            onSaved(row);
        } catch (failure) {
            setError(
                (
                    row?.status === "Draft"
                        ? "A draft has been saved. "
                        : ""
                ) + failure.message
            );

            setConflict(failure.status === 409);
        } finally {
            locked.current = false;
            setBusy(false);
        }
    }

    const amount = Number(value.amount);
    const rate = automaticRate?.rate;

    const converted = convertExpenseAmount(
        amount,
        value.currency,
        displayCurrency,
        rate,
        automaticRate?.rateBaseCurrency,
        automaticRate?.rateQuoteCurrency
    );

    const precision = currencies.find(
        row => row.currencyCode === value.currency
    )?.decimalPlaces;

    const displayPrecision = currencies.find(
        row => row.currencyCode === displayCurrency
    )?.decimalPlaces;

    const inputProps = (props) => ({
        htmlInput: props,
    });

    return (
        <Dialog
            open
            fullWidth
            maxWidth="md"
            onClose={busy ? undefined : onClose}
            aria-labelledby="expense-form-title"
        >
            <Box
                component="form"
                noValidate
                onSubmit={save}
            >
                <DialogTitle id="expense-form-title">
                    {saved
                        ? "Edit Expense · EXP-" + saved.id
                        : "New Expense"}
                </DialogTitle>

                <DialogContent dividers>
                    {error && (
                        <Alert
                            severity="error"
                            ref={errorRef}
                            tabIndex={-1}
                            sx={{ mb: 2 }}
                        >
                            {error}
                            {conflict &&
                                " Close this form and reopen the expense to load the latest version."}
                        </Alert>
                    )}

                    <Box className="expenses-form">
                        <TextField
                            select
                            label="Company"
                            required
                            value={value.companyId}
                            disabled={busy || !!saved}
                            onChange={event => {
                                const id = Number(event.target.value);

                                changeSource(
                                    companies.find(
                                        row => row.id === id
                                    )?.currency || "",
                                    {
                                        companyId: id,
                                        bankAccountId: "",
                                    }
                                );
                            }}
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

                        <TextField
                            label="Expense date"
                            type="date"
                            required
                            value={value.date}
                            disabled={busy}
                            slotProps={{
                                inputLabel: {
                                    shrink: true,
                                },
                            }}
                            onChange={event =>
                                change("date", event.target.value)
                            }
                        />

                        <TextField
                            label="Supplier"
                            required
                            value={value.supplier}
                            disabled={busy}
                            slotProps={inputProps({
                                maxLength: 160,
                            })}
                            onChange={event =>
                                change("supplier", event.target.value)
                            }
                        />

                        <TextField
                            label="Category"
                            required
                            value={value.category}
                            disabled={busy}
                            placeholder="Travel, Rent, Office, Utilities…"
                            slotProps={inputProps({
                                maxLength: 80,
                            })}
                            onChange={event =>
                                change("category", event.target.value)
                            }
                        />

                        <TextField
                            select
                            label="Paid from"
                            value={value.bankAccountId}
                            disabled={busy}
                            helperText={companyAccounts.length
                                ? "Accounts belonging to this company"
                                : "Add an account in Setup to record payment"}
                            onChange={event => {
                                const id = event.target.value;

                                const account = companyAccounts.find(
                                    row => row.id === Number(id)
                                );

                                changeSource(
                                    account?.currency || value.currency,
                                    {
                                        bankAccountId: id,
                                    }
                                );
                            }}
                        >
                            <MenuItem value="">
                                Unpaid draft
                            </MenuItem>

                            {companyAccounts.map(row => (
                                <MenuItem
                                    key={row.id}
                                    value={row.id}
                                >
                                    {row.name} · {row.currency}
                                    {row.lastFour ? " · " + row.lastFour : ""}
                                </MenuItem>
                            ))}
                        </TextField>

                        <TextField
                            select
                            label="Original currency"
                            value={value.currency}
                            disabled={busy || !!value.bankAccountId}
                            onChange={event =>
                                changeSource(event.target.value)
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

                        <TextField
                            type="number"
                            label={"Amount (" + value.currency + ")"}
                            required
                            value={value.amount}
                            disabled={busy}
                            slotProps={inputProps({
                                min: 1 / (10 ** precision),
                                max: "999999999999.9999",
                                step: 1 / (10 ** precision),
                            })}
                            onChange={event =>
                                change("amount", event.target.value)
                            }
                        />

                        <TextField
                            label="Reference"
                            value={value.reference}
                            disabled={busy}
                            slotProps={inputProps({
                                maxLength: 160,
                            })}
                            onChange={event =>
                                change("reference", event.target.value)
                            }
                        />

                        <Box>
                            <Button
                                component="label"
                                variant="outlined"
                                disabled={busy}
                            >
                                {file
                                    ? "Change receipt"
                                    : "Attach receipt"}

                                <input
                                    hidden
                                    type="file"
                                    accept="application/pdf,image/png,image/jpeg,image/webp"
                                    onChange={event => {
                                        const next = event.target.files?.[0];

                                        if (
                                            next &&
                                            (
                                                next.size === 0 ||
                                                next.size > 5 * 1024 * 1024
                                            )
                                        ) {
                                            setError(
                                                "Choose a receipt up to 5 MB."
                                            );

                                            event.target.value = "";
                                            return;
                                        }

                                        setFile(next || null);
                                    }}
                                />
                            </Button>

                            <Typography
                                variant="caption"
                                display="block"
                                sx={{ mt: 1 }}
                            >
                                {file?.name ||
                                    saved?.receiptName ||
                                    "PDF, PNG, JPEG, WebP · up to 5 MB"}
                            </Typography>

                            {file && (
                                <Button
                                    size="small"
                                    disabled={busy}
                                    onClick={() => setFile(null)}
                                >
                                    Remove selection
                                </Button>
                            )}
                        </Box>

                        <TextField
                            label="Notes"
                            value={value.notes}
                            multiline
                            minRows={2}
                            disabled={busy}
                            sx={{
                                gridColumn: "1 / -1",
                            }}
                            slotProps={inputProps({
                                maxLength: 1000,
                            })}
                            onChange={event =>
                                change("notes", event.target.value)
                            }
                        />
                    </Box>

                    {value.currency !== targetCurrency && (
                        <Alert
                            severity={rateError ? "error" : "info"}
                            sx={{ mt: 2 }}
                            action={rateError && (
                                <Button
                                    disabled={busy}
                                    onClick={() =>
                                        setRateRevision(
                                            current => current + 1
                                        )
                                    }
                                >
                                    Retry rate
                                </Button>
                            )}
                        >
                            {rateError || (automaticRate
                                ? "1 " + automaticRate.rateBaseCurrency + " = " +
                                    automaticRate.rate + " " + automaticRate.rateQuoteCurrency +
                                    " · " + formatRateDate(automaticRate.rateDate) +
                                    " · " + automaticRate.source
                                : "Loading exchange rate automatically…")}
                        </Alert>
                    )}

                    {amount > 0 &&
                        rate > 0 &&
                        converted != null &&
                        Number.isFinite(converted) && (
                            <Alert
                                severity="info"
                                sx={{ mt: 2 }}
                            >
                                Display in {displayCurrency}: {money(converted, displayCurrency, displayPrecision)}. Original amount: {money(amount, value.currency, precision)}.
                            </Alert>
                        )}
                </DialogContent>

                <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                        px: 3,
                        pt: 2,
                    }}
                >
                    Save Draft to review later. Record Expense only when the amount has already been paid.
                </Typography>

                <DialogActions>
                    <Button
                        onClick={onClose}
                        disabled={busy}
                    >
                        Cancel
                    </Button>

                    <Button
                        type="submit"
                        value="Draft"
                        variant="outlined"
                        disabled={busy || conflict}
                    >
                        Save Draft
                    </Button>

                    <Button
                        type="submit"
                        value="Recorded"
                        variant="contained"
                        disabled={busy || conflict || !automaticRate}
                    >
                        {busy ? "Saving…" : "Record Expense"}
                    </Button>
                </DialogActions>
            </Box>
        </Dialog>
    );
}
>>>>>>> aa1e4a9f74574849eb8f784b0674a71d22345bdc
