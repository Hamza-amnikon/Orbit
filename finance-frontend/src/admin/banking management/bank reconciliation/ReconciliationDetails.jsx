import {
    useRef,
    useState,
} from "react";

import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    MenuItem,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Typography,
} from "@mui/material";

import { useLoad } from "../../../live/data";
import { Feedback } from "../../../live/shared";

import {
    getBankTransfers,
} from "../bank transfers/BankTransferService";

import {
    completeReconciliation,
    getReconciliationById,
    matchStatementLine,
} from "./ReconciliationService";

import {
    buildTransferLabels,
    entryDescription,
    formatAmount,
    formatDate,
    sameAmount,
    statementDescription,
} from "./reconciliationFormat";

async function loadAccountTransfers(accountId, signal) {
    if (!accountId) {
        return [];
    }

    async function loadDirection(filter) {
        const transfers = new Map();
        let page = 1;

        while (true) {
            const result = await getBankTransfers(
                {
                    ...filter,
                    page,
                    pageSize: 100,
                },
                signal
            );

            if (!Array.isArray(result?.data) || !Number.isInteger(result.total)) {
                throw new Error("Invalid bank transfer response.");
            }

            const previousSize = transfers.size;

            for (const transfer of result.data) {
                transfers.set(transfer.id, transfer);
            }

            if (transfers.size >= result.total) {
                return Array.from(transfers.values());
            }

            if (previousSize === transfers.size) {
                throw new Error("Refresh to reload the bank transfer descriptions.");
            }

            page += 1;
        }
    }

    const [sent, received] = await Promise.all([
        loadDirection({ sourceBankAccountId: accountId }),
        loadDirection({ destinationBankAccountId: accountId }),
    ]);

    return [...sent, ...received];
}

function ReconciliationDetails({ id, canWrite, onClose, onChanged }) {
    const record = useLoad(signal => getReconciliationById(id, signal), [id]);
    const [updated, setUpdated] = useState(null);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState("");
    const [notice, setNotice] = useState("");
    const [confirmComplete, setConfirmComplete] = useState(false);
    const [needsRefresh, setNeedsRefresh] = useState(false);
    const locked = useRef(false);

    const detail = updated || record.data;
    const accountId = detail?.bankAccountId;

    const transfers = useLoad(
        signal => loadAccountTransfers(accountId, signal),
        [accountId]
    );

    const transferLabels = buildTransferLabels(transfers.data || []);
    const ready = !!detail && !record.loading && !record.error;
    const editable = ready && canWrite && detail.status === "Draft";
    const disabled = busy || needsRefresh || !editable;

    const canComplete = editable &&
        detail.unmatchedStatementLineCount === 0 &&
        detail.statementBalanceDifference === 0 &&
        detail.difference === 0;

    function amount(value) {
        return formatAmount(value, detail.currency, detail.currencyDecimalPlaces);
    }

    function matchedEntryDescription(line) {
        const book = detail.books.find(entry =>
            entry.id === line.matchedBankTransactionId
        );

        return book
            ? entryDescription(book, transferLabels)
            : line.direction === 1 ? "Money received" : "Money sent";
    }

    function matchedEntryReference(line) {
        const book = detail.books.find(entry =>
            entry.id === line.matchedBankTransactionId
        );

        const date = book ? book.transactionDate : line.transactionDate;
        const reference = book ? book.reference : line.reference;

        return formatDate(date) + " · Reference: " + (reference || "Not provided");
    }

    function refresh() {
        if (locked.current) {
            return;
        }

        setUpdated(null);
        setError("");
        setNotice("");
        setNeedsRefresh(false);
        setConfirmComplete(false);
        record.refresh();
        transfers.refresh();
    }

    function candidates(line) {
        const usedIds = new Set(
            detail.lines
                .filter(other => other.id !== line.id && other.matchedBankTransactionId)
                .map(other => other.matchedBankTransactionId)
        );

        return detail.books.filter(book =>
            book.status === "Posted" &&
            book.bankAccountId === detail.bankAccountId &&
            book.companyId === detail.companyId &&
            book.currency === detail.currency &&
            book.currencyDecimalPlaces === detail.currencyDecimalPlaces &&
            book.direction === line.direction &&
            sameAmount(book.amount, line.amount, detail.currencyDecimalPlaces) &&
            !usedIds.has(book.id)
        );
    }

    async function saveChange(operation, successMessage) {
        if (locked.current || disabled) {
            return;
        }

        locked.current = true;
        setBusy(true);
        setError("");
        setNotice("");
        let result;

        try {
            result = await operation();

            if (
                result?.id !== id ||
                !result.rowVersion ||
                !Array.isArray(result.lines) ||
                !Array.isArray(result.books)
            ) {
                throw new Error("The response was incomplete. Refresh to check whether the change saved.");
            }

            setUpdated(result);
            setNotice(successMessage);
            setConfirmComplete(false);
        } catch (failure) {
            setError(failure.message);
            setNeedsRefresh(failure.status !== 400);
            return;
        } finally {
            locked.current = false;
            setBusy(false);
        }

        onChanged?.(result);
    }

    function match(line, next) {
        const transactionId = next === "" ? null : Number(next);

        if (transactionId === line.matchedBankTransactionId) {
            return;
        }

        saveChange(
            () => matchStatementLine(id, line.id, {
                bankTransactionId: transactionId,
                reconciliationRowVersion: detail.rowVersion,
                lineRowVersion: line.rowVersion,
            }),
            transactionId ? "Statement entry matched." : "Match removed."
        );
    }

    function finish() {
        if (!canComplete || !confirmComplete) {
            return;
        }

        saveChange(
            () => completeReconciliation(id, detail.rowVersion),
            "Reconciliation completed."
        );
    }

    return (
        <Dialog
            open
            fullWidth
            maxWidth="lg"
            onClose={busy ? undefined : onClose}
            aria-labelledby="reconciliation-details-title"
        >
            <DialogTitle
                id="reconciliation-details-title"
            >
                Reconciliation · {id}
            </DialogTitle>

            <DialogContent
                dividers
            >
                <Feedback
                    loading={record.loading}
                    error={record.error}
                    retry={refresh}
                />

                {error && (
                    <Alert
                        severity="error"
                        sx={{ mb: 2 }}
                    >
                        {error}
                        {needsRefresh && " Click Refresh before making another change."}
                    </Alert>
                )}

                {notice && <Alert severity="success" sx={{ mb: 2 }}>{notice}</Alert>}

                {ready && (
                    <>
                        <Stack
                            direction="row"
                            spacing={2}
                            sx={{ alignItems: "center", mb: 1 }}
                        >
                            <Typography
                                fontWeight={600}
                            >
                                {detail.bankAccountName}
                            </Typography>
                            <Chip
                                size="small"
                                label={detail.status}
                                color={detail.status === "Completed" ? "success" : "warning"}
                            />
                        </Stack>

                        <Typography
                            variant="body2"
                            sx={{ mb: 3 }}
                        >
                            {detail.companyName} · {detail.currency} · {formatDate(detail.periodStart)}
                            {" to "}{formatDate(detail.periodEnd)}
                        </Typography>

                        <Box
                            sx={{
                                display: "grid",
                                gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", md: "repeat(3, 1fr)" },
                                gap: 2,
                                mb: 3,
                            }}
                        >
                            {[
                                ["Statement closing balance", detail.statementClosingBalance],
                                ["Finance balance at statement end", detail.bookBalance],
                                ["Unmatched Finance deposits", detail.outstandingDeposits],
                                ["Unmatched Finance withdrawals", detail.outstandingWithdrawals],
                                ["Adjusted statement balance", detail.adjustedStatementBalance],
                                ["Reconciliation difference", detail.difference],
                            ].map(([label, value]) => (
                                <Card
                                    key={label}
                                    variant="outlined"
                                >
                                    <CardContent>
                                        <Typography
                                            variant="body2"
                                            color="text.secondary"
                                        >
                                            {label}
                                        </Typography>
                                        <Typography
                                            fontWeight={700}
                                            sx={{ mt: 1 }}
                                        >
                                            {amount(value)}
                                        </Typography>
                                    </CardContent>
                                </Card>
                            ))}
                        </Box>

                        <Typography
                            variant="body2"
                            sx={{ mb: 2 }}
                        >
                            Opening balance: {amount(detail.statementOpeningBalance)}
                            {" · "}Statement arithmetic difference: {amount(detail.statementBalanceDifference)}
                            {" · "}{detail.unmatchedStatementLineCount} unmatched statement entries
                        </Typography>

                        {detail.unmatchedStatementLineCount > 0 && (
                            <Alert
                                severity="info"
                                sx={{ mb: 2 }}
                            >
                                The difference is provisional until every statement entry is matched.
                                Match only the same bank movement. Compare the date, reference and description;
                                equal amounts alone do not identify a transaction. Matching does not change balances.
                            </Alert>
                        )}

                        <TableContainer>
                            <Table
                                aria-label="Statement entries and Finance transaction matches"
                            >
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Line</TableCell>
                                        <TableCell>Date</TableCell>
                                        <TableCell>Reference / Description</TableCell>
                                        <TableCell>Direction</TableCell>
                                        <TableCell>Amount</TableCell>
                                        <TableCell>Matched Finance entry</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {detail.lines.map(line => (
                                        <TableRow
                                            key={line.id}
                                        >
                                            <TableCell>{line.lineNumber}</TableCell>
                                            <TableCell>{formatDate(line.transactionDate)}</TableCell>
                                            <TableCell>
                                                <Typography
                                                    variant="body2"
                                                >
                                                    {line.reference || "—"}
                                                </Typography>
                                                <Typography
                                                    variant="caption"
                                                >
                                                    {statementDescription(line, detail.books, transferLabels)}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>{line.direction === 1 ? "Money In" : "Money Out"}</TableCell>
                                            <TableCell>{amount(line.amount)}</TableCell>
                                            <TableCell
                                                sx={{ minWidth: 340 }}
                                            >
                                                {detail.status === "Completed" ? (
                                                    <Stack
                                                        spacing={0.5}
                                                    >
                                                        <Typography
                                                            variant="body2"
                                                        >
                                                            {matchedEntryDescription(line)}
                                                            {" · "}{amount(line.amount)}
                                                        </Typography>
                                                        <Typography
                                                            variant="caption"
                                                            color="text.secondary"
                                                        >
                                                            {matchedEntryReference(line)}
                                                        </Typography>
                                                    </Stack>
                                                ) : (
                                                    <TextField
                                                        select
                                                        fullWidth
                                                        size="small"
                                                        label={"Match statement line " + line.lineNumber}
                                                        value={line.matchedBankTransactionId ?? ""}
                                                        disabled={disabled}
                                                        onChange={event => match(line, event.target.value)}
                                                    >
                                                        <MenuItem
                                                            value=""
                                                        >
                                                            Unmatched
                                                        </MenuItem>
                                                        {candidates(line).map(book => (
                                                            <MenuItem
                                                                key={book.id}
                                                                value={book.id}
                                                            >
                                                                {entryDescription(book, transferLabels)}
                                                                {" · "}{amount(book.amount)}
                                                                {" · "}{formatDate(book.transactionDate)}
                                                                {" · Reference: "}{book.reference || "Not provided"}
                                                            </MenuItem>
                                                        ))}
                                                    </TextField>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>

                        {!detail.lines.length && <Typography sx={{ mt: 2 }}>This statement has no transactions.</Typography>}

                        {detail.notes && <Typography variant="body2" sx={{ mt: 2 }}>Notes: {detail.notes}</Typography>}

                        {detail.status === "Completed" && (
                            <Alert
                                severity="success"
                                sx={{ mt: 2 }}
                            >
                                Completed on {formatDate(detail.completedDate)}. Statement matches are read-only.
                            </Alert>
                        )}

                        {confirmComplete && (
                            <Alert
                                severity="warning"
                                sx={{ mt: 2 }}
                            >
                                Complete this reconciliation? Its statement matches will become read-only.
                            </Alert>
                        )}
                    </>
                )}
            </DialogContent>

            <DialogActions
                sx={{ flexWrap: "wrap", gap: 1 }}
            >
                <Button
                    disabled={busy || record.loading}
                    onClick={refresh}
                >
                    Refresh
                </Button>
                {editable && !confirmComplete && (
                    <Button
                        variant="contained"
                        disabled={busy || needsRefresh || !canComplete}
                        onClick={() => setConfirmComplete(true)}
                    >
                        Complete Reconciliation
                    </Button>
                )}
                {editable && confirmComplete && (
                    <>
                        <Button
                            disabled={busy}
                            onClick={() => setConfirmComplete(false)}
                        >
                            Back
                        </Button>
                        <Button
                            variant="contained"
                            disabled={busy || needsRefresh || !canComplete}
                            onClick={finish}
                        >
                            {busy ? "Saving…" : "Confirm Completion"}
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

export default ReconciliationDetails;
