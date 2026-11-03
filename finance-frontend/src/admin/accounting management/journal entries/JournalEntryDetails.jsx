import {
    useState,
} from "react";

import {
    Alert,
    Box,
    Button,
    Chip,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    Paper,
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

import EditRoundedIcon from
    "@mui/icons-material/EditRounded";

import CheckCircleOutlineRoundedIcon from
    "@mui/icons-material/CheckCircleOutlineRounded";

import UndoRoundedIcon from
    "@mui/icons-material/UndoRounded";

import {
    Feedback,
} from "../../../live/shared";

import {
    useLoad,
} from "../../../live/data";

import {
    getJournalEntryById,
    postJournalEntry,
    reverseJournalEntry,
} from "./JournalEntriesService";

import JournalEntryForm from
    "./JournalEntryForm";

function formatDate(value) {
    if (!value) {
        return "—";
    }

    return new Date(
        value + "T00:00:00"
    ).toLocaleDateString(
        "en-GB"
    );
}

function formatDateTime(value) {
    if (!value) {
        return "—";
    }

    return new Date(value)
        .toLocaleString(
            "en-GB"
        );
}

function formatMoney(
    value,
    currency
) {
    return new Intl.NumberFormat(
        "en-AE",
        {
            style: "currency",
            currency:
                currency || "AED",
        }
    ).format(value ?? 0);
}

function formatSource(value) {
    return String(value || "")
        .replace(
            /([a-z])([A-Z])/g,
            "$1 $2"
        );
}

function statusColor(status) {
    if (status === "Posted") {
        return "success";
    }

    if (status === "Reversed") {
        return "warning";
    }

    return "default";
}

function DetailItem({
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
                fontWeight={600}
                sx={{
                    mt: 0.5,
                    wordBreak:
                        "break-word",
                }}
            >
                {value || "—"}
            </Typography>
        </Box>
    );
}

export default function JournalEntryDetails({
    id,
    companyId,
    canWrite,
    onClose,
    onChanged,
}) {
    const [editing, setEditing] =
        useState(false);

    const [
        reverseOpen,
        setReverseOpen,
    ] = useState(false);

    const [reason, setReason] =
        useState("");

    const [busy, setBusy] =
        useState(false);

    const [actionError, setActionError] =
        useState("");

    const [notice, setNotice] =
        useState("");

    const load =
        useLoad(
            signal =>
                getJournalEntryById(
                    id,
                    companyId,
                    signal
                ),
            [
                id,
                companyId,
            ]
        );

    const journal =
        load.data;

    async function postEntry() {
        if (
            !window.confirm(
                "Post this journal entry? " +
                "A posted journal cannot be edited."
            )
        ) {
            return;
        }

        setBusy(true);
        setActionError("");
        setNotice("");

        try {
            await postJournalEntry(
                journal.id,
                journal.companyId,
                journal.rowVersion,
                "Reviewed and posted"
            );

            setNotice(
                "Journal entry posted successfully."
            );

            load.refresh();
            onChanged?.();
        } catch (error) {
            setActionError(
                error.message
            );
        } finally {
            setBusy(false);
        }
    }

    async function reverseEntry() {
        if (!reason.trim()) {
            setActionError(
                "Enter a reason for the reversal."
            );

            return;
        }

        setBusy(true);
        setActionError("");
        setNotice("");

        try {
            await reverseJournalEntry(
                journal.id,
                journal.companyId,
                journal.rowVersion,
                reason.trim()
            );

            setReverseOpen(false);
            setReason("");

            setNotice(
                "Journal entry reversed successfully."
            );

            load.refresh();
            onChanged?.();
        } catch (error) {
            setActionError(
                error.message
            );
        } finally {
            setBusy(false);
        }
    }

    const companyOption =
        journal
            ? [
                {
                    id:
                        journal.companyId,
                    name:
                        journal.companyName,
                    currency:
                        journal.currency,
                },
            ]
            : [];

    return (
        <>
            <Dialog
                open
                fullWidth
                maxWidth="lg"
                onClose={
                    busy
                        ? undefined
                        : onClose
                }
            >
                <DialogTitle
                    component="div"
                >
                    <Stack
                        direction={{
                            xs: "column",
                            sm: "row",
                        }}
                        justifyContent="space-between"
                        alignItems={{
                            xs: "flex-start",
                            sm: "center",
                        }}
                        spacing={2}
                    >
                        <Box>
                            <Typography
                                component="h2"
                                variant="h6"
                                fontWeight={700}
                            >
                                Journal Entry
                            </Typography>

                            <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{ mt: 0.5 }}
                            >
                                {journal
                                    ?.entryNumber ||
                                    "Loading journal"}
                            </Typography>
                        </Box>

                        {journal && (
                            <Chip
                                label={
                                    journal.status
                                }
                                color={
                                    statusColor(
                                        journal.status
                                    )
                                }
                            />
                        )}
                    </Stack>
                </DialogTitle>

                <DialogContent dividers>
                    <Feedback
                        loading={
                            load.loading
                        }
                        error={
                            load.error
                        }
                        retry={
                            load.refresh
                        }
                    />

                    {actionError && (
                        <Alert
                            severity="error"
                            sx={{ mb: 2 }}
                        >
                            {actionError}
                        </Alert>
                    )}

                    {notice && (
                        <Alert
                            severity="success"
                            sx={{ mb: 2 }}
                        >
                            {notice}
                        </Alert>
                    )}

                    {journal && (
                        <>
                            <Box
                                className={
                                    "journal-details-grid"
                                }
                            >
                                <DetailItem
                                    label="Company"
                                    value={
                                        journal
                                            .companyName
                                    }
                                />

                                <DetailItem
                                    label="Entry number"
                                    value={
                                        journal
                                            .entryNumber
                                    }
                                />

                                <DetailItem
                                    label="Entry date"
                                    value={
                                        formatDate(
                                            journal
                                                .entryDate
                                        )
                                    }
                                />

                                <DetailItem
                                    label="Branch"
                                    value={
                                        journal
                                            .branch
                                    }
                                />

                                <DetailItem
                                    label="Currency"
                                    value={
                                        journal
                                            .currency
                                    }
                                />

                                <DetailItem
                                    label="Exchange rate"
                                    value={
                                        journal
                                            .exchangeRate
                                    }
                                />

                                <DetailItem
                                    label="Source"
                                    value={
                                        formatSource(
                                            journal
                                                .source
                                        )
                                    }
                                />

                                <DetailItem
                                    label="Reference"
                                    value={
                                        journal
                                            .reference
                                    }
                                />

                                <DetailItem
                                    label="Created"
                                    value={
                                        formatDateTime(
                                            journal
                                                .createdDate
                                        )
                                    }
                                />

                                <DetailItem
                                    label="Posted"
                                    value={
                                        formatDateTime(
                                            journal
                                                .postedDate
                                        )
                                    }
                                />

                                <DetailItem
                                    label="Reversed"
                                    value={
                                        formatDateTime(
                                            journal
                                                .reversedDate
                                        )
                                    }
                                />

                                <DetailItem
                                    label="Reversal of"
                                    value={
                                        journal
                                            .reversalOfJournalEntryId
                                            ? "Journal #" +
                                            journal
                                                .reversalOfJournalEntryId
                                            : "—"
                                    }
                                />

                                <DetailItem
                                    label="Reversed by"
                                    value={
                                        journal
                                            .reversedByJournalEntryId
                                            ? "Journal #" +
                                            journal
                                                .reversedByJournalEntryId
                                            : "—"
                                    }
                                />
                            </Box>

                            <Divider
                                sx={{ my: 3 }}
                            />

                            <Typography
                                variant="subtitle2"
                                color="text.secondary"
                            >
                                Narration
                            </Typography>

                            <Typography
                                sx={{ mt: 1 }}
                            >
                                {
                                    journal.narration
                                }
                            </Typography>

                            <Divider
                                sx={{ my: 3 }}
                            />

                            <Typography
                                variant="h6"
                                fontWeight={700}
                                sx={{ mb: 2 }}
                            >
                                Journal Lines
                            </Typography>

                            <TableContainer
                                component={Paper}
                                variant="outlined"
                            >
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>
                                                Line
                                            </TableCell>

                                            <TableCell>
                                                Account
                                            </TableCell>

                                            <TableCell>
                                                Description
                                            </TableCell>

                                            <TableCell>
                                                Cost center
                                            </TableCell>

                                            <TableCell
                                                align="right"
                                            >
                                                Debit
                                            </TableCell>

                                            <TableCell
                                                align="right"
                                            >
                                                Credit
                                            </TableCell>
                                        </TableRow>
                                    </TableHead>

                                    <TableBody>
                                        {journal.lines.map(
                                            line => (
                                                <TableRow
                                                    key={
                                                        line.id
                                                    }
                                                >
                                                    <TableCell>
                                                        {
                                                            line.lineNumber
                                                        }
                                                    </TableCell>

                                                    <TableCell>
                                                        <Typography
                                                            fontWeight={600}
                                                        >
                                                            {
                                                                line.accountCode
                                                            }
                                                            {" · "}
                                                            {
                                                                line.accountName
                                                            }
                                                        </Typography>
                                                    </TableCell>

                                                    <TableCell>
                                                        {
                                                            line.description ||
                                                            "—"
                                                        }
                                                    </TableCell>

                                                    <TableCell>
                                                        {
                                                            line.costCenter ||
                                                            "—"
                                                        }
                                                    </TableCell>

                                                    <TableCell
                                                        align="right"
                                                    >
                                                        {
                                                            line.debitAmount
                                                                ? formatMoney(
                                                                    line.debitAmount,
                                                                    journal.currency
                                                                )
                                                                : "—"
                                                        }
                                                    </TableCell>

                                                    <TableCell
                                                        align="right"
                                                    >
                                                        {
                                                            line.creditAmount
                                                                ? formatMoney(
                                                                    line.creditAmount,
                                                                    journal.currency
                                                                )
                                                                : "—"
                                                        }
                                                    </TableCell>
                                                </TableRow>
                                            )
                                        )}
                                    </TableBody>
                                </Table>
                            </TableContainer>

                            <Stack
                                direction={{
                                    xs: "column",
                                    sm: "row",
                                }}
                                justifyContent="flex-end"
                                spacing={3}
                                sx={{ mt: 2 }}
                            >
                                <Typography
                                    fontWeight={700}
                                >
                                    Total debit:{" "}
                                    {formatMoney(
                                        journal
                                            .totalDebit,
                                        journal
                                            .currency
                                    )}
                                </Typography>

                                <Typography
                                    fontWeight={700}
                                >
                                    Total credit:{" "}
                                    {formatMoney(
                                        journal
                                            .totalCredit,
                                        journal
                                            .currency
                                    )}
                                </Typography>
                            </Stack>
                        </>
                    )}
                </DialogContent>

                <DialogActions
                    sx={{
                        p: 2,
                        flexWrap: "wrap",
                    }}
                >
                    <Button
                        onClick={onClose}
                        disabled={busy}
                    >
                        Close
                    </Button>

                    {canWrite &&
                        journal?.status ===
                        "Draft" && (
                            <>
                                <Button
                                    startIcon={
                                        <EditRoundedIcon />
                                    }
                                    disabled={busy}
                                    onClick={() =>
                                        setEditing(
                                            true
                                        )
                                    }
                                >
                                    Edit
                                </Button>

                                <Button
                                    variant="contained"
                                    color="success"
                                    startIcon={
                                        <CheckCircleOutlineRoundedIcon />
                                    }
                                    disabled={busy}
                                    onClick={
                                        postEntry
                                    }
                                >
                                    {busy
                                        ? "Posting..."
                                        : "Post"}
                                </Button>
                            </>
                        )}

                    {canWrite &&
                        journal?.status ===
                        "Posted" &&
                        !journal
                            .reversalOfJournalEntryId && (
                            <Button
                                variant="contained"
                                color="warning"
                                startIcon={
                                    <UndoRoundedIcon />
                                }
                                disabled={busy}
                                onClick={() => {
                                    setActionError(
                                        ""
                                    );

                                    setReverseOpen(
                                        true
                                    );
                                }}
                            >
                                Reverse
                            </Button>
                        )}
                </DialogActions>
            </Dialog>

            {editing && journal && (
                <JournalEntryForm
                    companyId={
                        journal.companyId
                    }
                    companies={
                        companyOption
                    }
                    journal={journal}
                    onClose={() =>
                        setEditing(false)
                    }
                    onSaved={() => {
                        setEditing(false);

                        setNotice(
                            "Journal entry updated successfully."
                        );

                        load.refresh();
                        onChanged?.();
                    }}
                />
            )}

            <Dialog
                open={reverseOpen}
                fullWidth
                maxWidth="sm"
                onClose={
                    busy
                        ? undefined
                        : () =>
                            setReverseOpen(
                                false
                            )
                }
            >
                <DialogTitle>
                    Reverse Journal Entry
                </DialogTitle>

                <DialogContent dividers>
                    <Alert
                        severity="warning"
                        sx={{ mb: 2 }}
                    >
                        Reversal creates a new
                        posted journal with the
                        debit and credit amounts
                        swapped. The original
                        entry remains in the audit
                        history.
                    </Alert>

                    <TextField
                        autoFocus
                        required
                        fullWidth
                        multiline
                        minRows={3}
                        label="Reversal reason"
                        value={reason}
                        inputProps={{
                            maxLength: 500,
                        }}
                        onChange={event =>
                            setReason(
                                event.target.value
                            )
                        }
                    />
                </DialogContent>

                <DialogActions sx={{ p: 2 }}>
                    <Button
                        disabled={busy}
                        onClick={() =>
                            setReverseOpen(
                                false
                            )
                        }
                    >
                        Cancel
                    </Button>

                    <Button
                        variant="contained"
                        color="warning"
                        disabled={
                            busy ||
                            !reason.trim()
                        }
                        onClick={
                            reverseEntry
                        }
                    >
                        {busy
                            ? "Reversing..."
                            : "Reverse journal"}
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}