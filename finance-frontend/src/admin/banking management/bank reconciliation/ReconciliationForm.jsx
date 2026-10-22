import {
    useRef,
    useState,
} from "react";

import {
    Alert,
    Box,
    Button,
    Checkbox,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControlLabel,
    MenuItem,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Typography,
} from "@mui/material";

import {
    today,
    useLoad,
} from "../../../live/data";

import {
    createReconciliation,
    getReconciliationOpening,
} from "./ReconciliationService";
import { parseStatementCsv } from "./parseStatementCsv";
import {
    formatAmount,
    isValidDate,
    toMinorUnits,
} from "./reconciliationFormat";

function ReconciliationForm({ accounts = [], onClose, onSaved }) {
    const [value, setValue] = useState({
        bankAccountId: "",
        periodEnd: today(),
        statementClosingBalance: "",
        notes: "",
    });

    const [lines, setLines] = useState([]);
    const [fileName, setFileName] = useState("");
    const [emptyStatement, setEmptyStatement] = useState(false);
    const [busy, setBusy] = useState(false);
    const [importing, setImporting] = useState(false);
    const [error, setError] = useState("");
    const [needsReview, setNeedsReview] = useState(false);
    const locked = useRef(false);
    const requestId = useRef(null);
    const fileRevision = useRef(0);

    const account = accounts.find(row => row.id === Number(value.bankAccountId));
    const accountId = Number(value.bankAccountId) || null;

    const opening = useLoad(
        signal => accountId
            ? getReconciliationOpening(accountId, signal)
            : Promise.resolve(null),
        [accountId]
    );

    const defaults = opening.data?.bankAccountId === accountId
        ? opening.data
        : null;

    const blocked = busy || importing || needsReview;
    const disabled = blocked || !defaults || opening.loading || !!opening.error;

    function change(name, next) {
        setValue(current => ({ ...current, [name]: next }));
    }

    function selectAccount(next) {
        fileRevision.current += 1;
        setLines([]);
        setFileName("");
        setEmptyStatement(false);
        setError("");
        setValue(current => ({
            ...current,
            bankAccountId: next,
            statementClosingBalance: "",
        }));
    }

    async function importFile(event) {
        const file = event.target.files?.[0];
        event.target.value = "";

        if (!file || !account || disabled) {
            return;
        }

        const revision = ++fileRevision.current;
        setImporting(true);
        setError("");
        setLines([]);
        setFileName("");

        try {
            if (file.size > 1024 * 1024) {
                throw new Error("CSV must be no larger than 1 MB.");
            }

            const imported = parseStatementCsv(
                await file.text(),
                account.currencyDecimalPlaces
            );

            if (revision === fileRevision.current) {
                setLines(imported);
                setFileName(file.name);
                setEmptyStatement(imported.length === 0);
            }
        } catch (failure) {
            if (revision === fileRevision.current) {
                setError(failure.message);
            }
        } finally {
            if (revision === fileRevision.current) {
                setImporting(false);
            }
        }
    }

    async function save(event) {
        event.preventDefault();

        if (locked.current || disabled) {
            return;
        }

        setError("");
        let body;

        try {
            if (!account?.openingBalanceDate) {
                throw new Error("Select an account with a configured opening balance.");
            }

            const periodStart = defaults.periodStart;
            const statementOpeningBalance = defaults.statementOpeningBalance;

            if (!isValidDate(periodStart) || !isValidDate(value.periodEnd)) {
                throw new Error("Select valid statement start and end dates.");
            }

            if (
                periodStart > value.periodEnd ||
                periodStart < account.openingBalanceDate
            ) {
                throw new Error("Check the statement period and the account opening date.");
            }

            if (!fileName && !emptyStatement) {
                throw new Error("Import the statement CSV or confirm it has no transactions.");
            }

            const precision = account.currencyDecimalPlaces;
            let calculated = toMinorUnits(statementOpeningBalance, precision);
            const closing = toMinorUnits(value.statementClosingBalance, precision);

            for (const line of lines) {
                if (
                    line.transactionDate < periodStart ||
                    line.transactionDate > value.periodEnd
                ) {
                    throw new Error("Every imported entry must fall within the statement period.");
                }

                const amount = toMinorUnits(line.amount, precision, true);
                calculated += line.direction === 1 ? amount : -amount;
            }

            if (calculated !== closing) {
                throw new Error("Opening balance plus statement money in minus money out must equal the closing balance.");
            }

            if (!requestId.current) {
                requestId.current = crypto.randomUUID();
            }

            body = {
                ...value,
                requestId: requestId.current,
                bankAccountId: account.id,
                periodStart,
                statementOpeningBalance: Number(statementOpeningBalance),
                statementClosingBalance: Number(value.statementClosingBalance),
                notes: value.notes.trim(),
                lines,
            };
        } catch (failure) {
            setError(failure.message);
            return;
        }

        locked.current = true;
        setBusy(true);
        let result;

        try {
            result = await createReconciliation(body);

            if (!Number.isInteger(result?.id)) {
                throw new Error("The save response was incomplete. Refresh the list to check whether the statement saved.");
            }
        } catch (failure) {
            setError(failure.message);
            setNeedsReview(failure.status !== 400);
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
            maxWidth="md"
            onClose={busy || importing ? undefined : onClose}
            aria-labelledby="reconciliation-form-title"
        >
            <Box
                component="form"
                noValidate
                onSubmit={save}
            >
                <DialogTitle
                    id="reconciliation-form-title"
                >
                    New Reconciliation
                </DialogTitle>

                <DialogContent
                    dividers
                >
                    {error && (
                        <Alert
                            severity="error"
                            sx={{ mb: 2 }}
                        >
                            {error}
                            {needsReview && " Close this form and refresh the list before continuing."}
                        </Alert>
                    )}

                    <Alert
                        severity="info"
                        sx={{ mb: 2 }}
                    >
                        Use the bank statement balances and entries. Importing
                        and matching do not change your Finance account balance.
                    </Alert>

                    <Box
                        sx={{ display: "grid", gap: 2, pt: 1 }}
                    >
                        <TextField
                            select
                            required
                            label="Bank account"
                            value={value.bankAccountId}
                            disabled={blocked}
                            onChange={event => selectAccount(event.target.value)}
                        >
                            <MenuItem
                                value=""
                            >
                                Select account
                            </MenuItem>
                            {accounts.filter(row => row.openingBalanceDate).map(row => (
                                <MenuItem
                                    key={row.id}
                                    value={row.id}
                                >
                                    {row.name} · {row.companyName} · {row.currency}
                                </MenuItem>
                            ))}
                        </TextField>

                        <TextField
                            label="Statement currency"
                            value={account?.currency || ""}
                            slotProps={{ input: { readOnly: true } }}
                        />

                        {accountId && opening.loading && (
                            <Alert
                                severity="info"
                            >
                                Loading the opening balance and start date…
                            </Alert>
                        )}

                        {accountId && opening.error && (
                            <Alert
                                severity="error"
                                action={(
                                    <Button
                                        color="inherit"
                                        disabled={blocked}
                                        onClick={opening.refresh}
                                    >
                                        Retry
                                    </Button>
                                )}
                            >
                                {opening.error}
                            </Alert>
                        )}

                        {defaults && !opening.loading && !opening.error && (
                            <Alert
                                severity="info"
                            >
                                Opening values filled automatically. {defaults.source}
                                {" "}Check that they agree with the bank statement.
                                If they differ, review the previous statement or account setup before saving.
                            </Alert>
                        )}

                        <TextField
                            required
                            type="date"
                            label="Statement start date"
                            value={defaults?.periodStart || ""}
                            disabled={disabled}
                            helperText="Filled automatically to continue the statement history."
                            slotProps={{
                                inputLabel: {
                                    shrink: true,
                                },
                                input: {
                                    readOnly: true,
                                },
                            }}
                        />

                        <TextField
                            required
                            type="date"
                            label="Statement end date"
                            value={value.periodEnd}
                            disabled={disabled}
                            slotProps={{ inputLabel: { shrink: true } }}
                            onChange={event => change("periodEnd", event.target.value)}
                        />

                        <TextField
                            required
                            label="Statement opening balance"
                            value={defaults?.statementOpeningBalance || ""}
                            disabled={disabled}
                            helperText="Previous statement closing balance, or account opening balance for the first statement."
                            slotProps={{
                                input: {
                                    readOnly: true,
                                },
                                inputLabel: {
                                    shrink: true,
                                },
                            }}
                        />

                        <TextField
                            required
                            label="Statement closing balance"
                            value={value.statementClosingBalance}
                            disabled={disabled}
                            helperText="Enter the closing balance shown on the actual bank statement."
                            slotProps={{ htmlInput: { inputMode: "decimal" } }}
                            onChange={event => change("statementClosingBalance", event.target.value)}
                        />

                        <TextField
                            label="Notes"
                            multiline
                            minRows={2}
                            value={value.notes}
                            disabled={disabled}
                            slotProps={{ htmlInput: { maxLength: 2000 } }}
                            onChange={event => change("notes", event.target.value)}
                        />

                        <Alert
                            severity="info"
                        >
                            CSV columns: Date, Reference, Direction, Amount.
                            Description is optional. Dates: YYYY-MM-DD.
                            Direction: MoneyIn or MoneyOut. Positive amounts
                            in the account currency. Maximum 2,000 entries, 1 MB.
                        </Alert>

                        <Button
                            component="label"
                            variant="outlined"
                            disabled={disabled || !account}
                        >
                            {importing ? "Reading statement…" : "Import Statement CSV"}
                            <input
                                type="file"
                                accept=".csv,text/csv"
                                hidden
                                onChange={importFile}
                            />
                        </Button>

                        <Typography
                            variant="body2"
                        >
                            {fileName ? fileName + " · " : ""}
                            {lines.length} statement entries ready to import
                        </Typography>

                        <FormControlLabel
                            label="This statement has no transactions"
                            control={(
                                <Checkbox
                                    checked={emptyStatement}
                                    disabled={disabled || lines.length > 0}
                                    onChange={event => setEmptyStatement(event.target.checked)}
                                />
                            )}
                        />

                        {lines.length > 0 && (
                            <TableContainer>
                                <Table
                                    size="small"
                                    aria-label="Statement import preview"
                                >
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Date</TableCell>
                                            <TableCell>Reference</TableCell>
                                            <TableCell>Direction</TableCell>
                                            <TableCell>Amount</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {lines.slice(0, 10).map((line, index) => (
                                            <TableRow
                                                key={index}
                                            >
                                                <TableCell>{line.transactionDate}</TableCell>
                                                <TableCell>{line.reference || "—"}</TableCell>
                                                <TableCell>{line.direction === 1 ? "Money In" : "Money Out"}</TableCell>
                                                <TableCell>
                                                    {formatAmount(line.amount, account.currency, account.currencyDecimalPlaces)}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                                {lines.length > 10 && (
                                    <Typography
                                        variant="caption"
                                    >
                                        Showing the first 10 entries.
                                    </Typography>
                                )}
                            </TableContainer>
                        )}
                    </Box>
                </DialogContent>

                <DialogActions>
                    <Button
                        disabled={busy || importing}
                        onClick={onClose}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        variant="contained"
                        disabled={disabled || !account}
                    >
                        {busy ? "Saving…" : "Save Statement"}
                    </Button>
                </DialogActions>
            </Box>
        </Dialog>
    );
}

export default ReconciliationForm;
