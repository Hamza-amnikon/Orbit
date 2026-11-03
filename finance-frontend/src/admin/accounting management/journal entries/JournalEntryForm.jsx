import {
    useEffect,
    useMemo,
    useState,
} from "react";

import {
    Alert,
    Box,
    Button,
    Divider,
    MenuItem,
    Stack,
    TextField,
    Typography,
} from "@mui/material";

import AddRoundedIcon from
    "@mui/icons-material/AddRounded";

import DeleteOutlineRoundedIcon from
    "@mui/icons-material/DeleteOutlineRounded";

import {
    Editor,
} from "../../../live/shared";

import {
    today,
    useLoad,
} from "../../../live/data";

import {
    getAccounts,
} from "../chart of accounts/ChartOfAccountsService";

import {
    createJournalEntry,
    updateJournalEntry,
} from "./JournalEntriesService";

const currencies = [
    "AED",
    "INR",
    "USD",
    "EUR",
    "GBP",
    "SAR",
];

function newLine() {
    return {
        key:
            crypto.randomUUID(),
        accountId: "",
        description: "",
        debitAmount: "",
        creditAmount: "",
        costCenter: "",
    };
}

function normalizeLine(line) {
    return {
        key:
            crypto.randomUUID(),

        accountId:
            String(
                line.accountId ?? ""
            ),

        description:
            line.description || "",

        debitAmount:
            line.debitAmount
                ? String(
                    line.debitAmount
                )
                : "",

        creditAmount:
            line.creditAmount
                ? String(
                    line.creditAmount
                )
                : "",

        costCenter:
            line.costCenter || "",
    };
}

export default function JournalEntryForm({
    companyId,
    companies = [],
    journal = null,
    onClose,
    onSaved,
}) {
    const editing =
        Boolean(journal);

    const company =
        companies.find(
            item =>
                item.id ===
                Number(companyId)
        );

    const [requestId] =
        useState(() =>
            crypto.randomUUID()
        );

    const [entryDate, setEntryDate] =
        useState(
            journal?.entryDate ||
            today()
        );

    const [branch, setBranch] =
        useState(
            journal?.branch ||
            (
                company?.country === "AE"
                    ? "Dubai"
                    : company?.country === "IN"
                        ? "Turbhe"
                        : ""
            )
        );

    const [currency, setCurrency] =
        useState(
            journal?.currency ||
            company?.currency ||
            "AED"
        );

    const [
        exchangeRate,
        setExchangeRate,
    ] = useState(
        String(
            journal?.exchangeRate ??
            1
        )
    );

    const [
        narration,
        setNarration,
    ] = useState(
        journal?.narration || ""
    );

    const [
        reference,
        setReference,
    ] = useState(
        journal?.reference || ""
    );

    const [lines, setLines] =
        useState(() => {
            if (
                journal?.lines?.length
            ) {
                return journal.lines.map(
                    normalizeLine
                );
            }

            return [
                newLine(),
                newLine(),
            ];
        });

    const [busy, setBusy] =
        useState(false);

    const [error, setError] =
        useState("");

    useEffect(() => {
        if (
            currency ===
            company?.currency
        ) {
            setExchangeRate("1");
        }
    }, [
        currency,
        company?.currency,
    ]);

    const accountLoad =
        useLoad(
            signal =>
                getAccounts(
                    {
                        companyId,
                        page: 1,
                        pageSize: 100,
                        isPostingAccount:
                            true,
                        isActive:
                            true,
                    },
                    signal
                ),
            [companyId]
        );

    const accounts =
        useMemo(
            () =>
                (
                    accountLoad
                        .data?.data ||
                    []
                ).filter(
                    account =>
                        account
                            .isPostingAccount &&
                        account.isActive &&
                        !account
                            .isControlAccount
                ),
            [accountLoad.data]
        );

    const totalDebit =
        useMemo(
            () =>
                lines.reduce(
                    (
                        total,
                        line
                    ) =>
                        total +
                        Number(
                            line
                                .debitAmount ||
                            0
                        ),
                    0
                ),
            [lines]
        );

    const totalCredit =
        useMemo(
            () =>
                lines.reduce(
                    (
                        total,
                        line
                    ) =>
                        total +
                        Number(
                            line
                                .creditAmount ||
                            0
                        ),
                    0
                ),
            [lines]
        );

    const balanced =
        totalDebit > 0 &&
        Math.round(
            totalDebit * 10000
        ) ===
        Math.round(
            totalCredit * 10000
        );

    const linesValid =
        lines.length >= 2 &&
        lines.every(line => {
            const debit =
                Number(
                    line.debitAmount ||
                    0
                );

            const credit =
                Number(
                    line.creditAmount ||
                    0
                );

            return (
                Number(
                    line.accountId
                ) > 0 &&
                (
                    (
                        debit > 0 &&
                        credit === 0
                    ) ||
                    (
                        credit > 0 &&
                        debit === 0
                    )
                )
            );
        });

    const formValid =
        Boolean(
            companyId &&
            entryDate &&
            branch.trim() &&
            currency &&
            Number(exchangeRate) > 0 &&
            narration.trim() &&
            linesValid &&
            balanced
        );

    function updateLine(
        key,
        field,
        value
    ) {
        setLines(current =>
            current.map(line => {
                if (
                    line.key !== key
                ) {
                    return line;
                }

                const updated = {
                    ...line,
                    [field]: value,
                };

                if (
                    field ===
                    "debitAmount" &&
                    Number(value) > 0
                ) {
                    updated.creditAmount =
                        "";
                }

                if (
                    field ===
                    "creditAmount" &&
                    Number(value) > 0
                ) {
                    updated.debitAmount =
                        "";
                }

                return updated;
            })
        );
    }

    function removeLine(key) {
        if (lines.length <= 2) {
            return;
        }

        setLines(current =>
            current.filter(
                line =>
                    line.key !== key
            )
        );
    }

    function buildLines() {
        return lines.map(line => ({
            accountId:
                Number(
                    line.accountId
                ),

            description:
                line.description.trim(),

            debitAmount:
                Number(
                    line.debitAmount ||
                    0
                ),

            creditAmount:
                Number(
                    line.creditAmount ||
                    0
                ),

            costCenter:
                line.costCenter.trim() ||
                null,

            counterpartyType:
                null,

            counterpartyId:
                null,
        }));
    }

    async function submit(event) {
        event.preventDefault();

        if (!formValid) {
            setError(
                "Complete all required fields and make sure total debit equals total credit."
            );

            return;
        }

        setBusy(true);
        setError("");

        try {
            const commonBody = {
                entryDate,
                branch:
                    branch.trim(),
                currency,
                exchangeRate:
                    Number(
                        exchangeRate
                    ),
                narration:
                    narration.trim(),
                reference:
                    reference.trim() ||
                    null,
                lines:
                    buildLines(),
            };

            const result =
                editing
                    ? await updateJournalEntry(
                        journal.id,
                        companyId,
                        {
                            ...commonBody,
                            rowVersion:
                                journal
                                    .rowVersion,
                        }
                    )
                    : await createJournalEntry(
                        {
                            requestId,
                            companyId:
                                Number(
                                    companyId
                                ),
                            ...commonBody,
                        }
                    );

            onSaved(result);
        } catch (requestError) {
            setError(
                requestError.message
            );
        } finally {
            setBusy(false);
        }
    }

    return (
        <Editor
            className="journal-entry-editor"
            title={
                editing
                    ? "Edit Journal Entry"
                    : "New Journal Entry"
            }
            onClose={onClose}
            onSubmit={submit}
            busy={busy}
            disabled={!formValid}
            error={error}
        >
            <Box
                sx={{
                    display: "grid",
                    gridTemplateColumns: {
                        xs: "1fr",
                        md: "1fr 1fr",
                    },
                    gap: 2,
                    py: 1,
                }}
            >
                <TextField
                    label="Company"
                    value={
                        company
                            ? company.name +
                            " · " +
                            company.currency
                            : ""
                    }
                    disabled
                />

                <TextField
                    required
                    type="date"
                    label="Entry date"
                    value={entryDate}
                    slotProps={{
                        inputLabel: {
                            shrink: true,
                        },
                    }}
                    onChange={event =>
                        setEntryDate(
                            event.target.value
                        )
                    }
                />

                <TextField
                    required
                    label="Branch"
                    value={branch}
                    inputProps={{
                        maxLength: 100,
                    }}
                    onChange={event =>
                        setBranch(
                            event.target.value
                        )
                    }
                />

                <TextField
                    select
                    required
                    label="Currency"
                    value={currency}
                    onChange={event =>
                        setCurrency(
                            event.target.value
                        )
                    }
                >
                    {currencies.map(
                        value => (
                            <MenuItem
                                key={value}
                                value={value}
                            >
                                {value}
                            </MenuItem>
                        )
                    )}
                </TextField>

                <TextField
                    required
                    type="number"
                    label={
                        company?.currency
                            ? company.currency +
                            " per " +
                            currency
                            : "Exchange rate"
                    }
                    value={exchangeRate}
                    disabled={
                        currency ===
                        company?.currency
                    }
                    slotProps={{
                        htmlInput: {
                            min:
                                0.00000001,
                            step:
                                0.00000001,
                        },
                    }}
                    onChange={event =>
                        setExchangeRate(
                            event.target.value
                        )
                    }
                />

                <TextField
                    label="Reference"
                    value={reference}
                    inputProps={{
                        maxLength: 100,
                    }}
                    onChange={event =>
                        setReference(
                            event.target.value
                        )
                    }
                />

                <TextField
                    required
                    multiline
                    minRows={2}
                    label="Narration"
                    value={narration}
                    inputProps={{
                        maxLength: 500,
                    }}
                    sx={{
                        gridColumn: {
                            md: "1 / -1",
                        },
                    }}
                    onChange={event =>
                        setNarration(
                            event.target.value
                        )
                    }
                />
            </Box>

            <Divider sx={{ my: 3 }} />

            <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                spacing={2}
                sx={{ mb: 2 }}
            >
                <Box>
                    <Typography
                        variant="h6"
                        fontWeight={700}
                    >
                        Journal Lines
                    </Typography>

                    <Typography
                        variant="body2"
                        color="text.secondary"
                    >
                        Enter either a debit
                        or credit on each line.
                    </Typography>
                </Box>

                <Button
                    startIcon={
                        <AddRoundedIcon />
                    }
                    onClick={() =>
                        setLines(current => [
                            ...current,
                            newLine(),
                        ])
                    }
                >
                    Add line
                </Button>
            </Stack>

            {accountLoad.error && (
                <Alert
                    severity="error"
                    sx={{ mb: 2 }}
                    action={
                        <Button
                            color="inherit"
                            onClick={
                                accountLoad
                                    .refresh
                            }
                        >
                            Retry
                        </Button>
                    }
                >
                    {accountLoad.error}
                </Alert>
            )}

            <Stack spacing={2}>
                {lines.map(
                    (line, index) => (
                        <Box
                            key={line.key}
                            className={
                                "journal-line"
                            }
                        >
                            <Typography
                                variant="subtitle2"
                                sx={{
                                    mb: 1.5,
                                }}
                            >
                                Line {
                                    index + 1
                                }
                            </Typography>

                            <Box
                                sx={{
                                    display:
                                        "grid",
                                    gridTemplateColumns:
                                    {
                                        xs:
                                            "1fr",
                                        md:
                                            "2fr 2fr 1fr 1fr auto",
                                    },
                                    gap: 1.5,
                                    alignItems:
                                        "start",
                                }}
                            >
                                <TextField
                                    select
                                    required
                                    size="small"
                                    label="Account"
                                    value={
                                        line.accountId
                                    }
                                    disabled={
                                        accountLoad
                                            .loading
                                    }
                                    onChange={
                                        event =>
                                            updateLine(
                                                line.key,
                                                "accountId",
                                                event
                                                    .target
                                                    .value
                                            )
                                    }
                                >
                                    {accounts.map(
                                        account => (
                                            <MenuItem
                                                key={
                                                    account.id
                                                }
                                                value={String(
                                                    account.id
                                                )}
                                            >
                                                {
                                                    account.code
                                                }
                                                {" · "}
                                                {
                                                    account.name
                                                }
                                            </MenuItem>
                                        )
                                    )}
                                </TextField>

                                <TextField
                                    size="small"
                                    label="Description"
                                    value={
                                        line.description
                                    }
                                    inputProps={{
                                        maxLength:
                                            500,
                                    }}
                                    onChange={
                                        event =>
                                            updateLine(
                                                line.key,
                                                "description",
                                                event
                                                    .target
                                                    .value
                                            )
                                    }
                                />

                                <TextField
                                    size="small"
                                    type="number"
                                    label="Debit"
                                    value={
                                        line.debitAmount
                                    }
                                    slotProps={{
                                        htmlInput:
                                        {
                                            min: 0,
                                            step:
                                                0.01,
                                        },
                                    }}
                                    onChange={
                                        event =>
                                            updateLine(
                                                line.key,
                                                "debitAmount",
                                                event
                                                    .target
                                                    .value
                                            )
                                    }
                                />

                                <TextField
                                    size="small"
                                    type="number"
                                    label="Credit"
                                    value={
                                        line.creditAmount
                                    }
                                    slotProps={{
                                        htmlInput:
                                        {
                                            min: 0,
                                            step:
                                                0.01,
                                        },
                                    }}
                                    onChange={
                                        event =>
                                            updateLine(
                                                line.key,
                                                "creditAmount",
                                                event
                                                    .target
                                                    .value
                                            )
                                    }
                                />

                                <Button
                                    color="error"
                                    aria-label={
                                        "Remove line " +
                                        (
                                            index +
                                            1
                                        )
                                    }
                                    disabled={
                                        lines.length <=
                                        2
                                    }
                                    onClick={() =>
                                        removeLine(
                                            line.key
                                        )
                                    }
                                >
                                    <DeleteOutlineRoundedIcon />
                                </Button>
                            </Box>

                            <TextField
                                size="small"
                                label="Cost center"
                                value={
                                    line.costCenter
                                }
                                inputProps={{
                                    maxLength:
                                        100,
                                }}
                                sx={{
                                    mt: 1.5,
                                    width: {
                                        xs:
                                            "100%",
                                        md:
                                            260,
                                    },
                                }}
                                onChange={
                                    event =>
                                        updateLine(
                                            line.key,
                                            "costCenter",
                                            event
                                                .target
                                                .value
                                        )
                                }
                            />
                        </Box>
                    )
                )}
            </Stack>

            <Stack
                direction={{
                    xs: "column",
                    sm: "row",
                }}
                justifyContent="flex-end"
                spacing={3}
                sx={{ mt: 3 }}
            >
                <Typography
                    fontWeight={700}
                    color={
                        balanced
                            ? "success.main"
                            : "error.main"
                    }
                >
                    Total debit:{" "}
                    {totalDebit.toFixed(2)}
                </Typography>

                <Typography
                    fontWeight={700}
                    color={
                        balanced
                            ? "success.main"
                            : "error.main"
                    }
                >
                    Total credit:{" "}
                    {totalCredit.toFixed(2)}
                </Typography>
            </Stack>

            {!balanced && (
                <Alert
                    severity="warning"
                    sx={{ mt: 2 }}
                >
                    Total debit must equal
                    total credit before the
                    journal can be saved.
                </Alert>
            )}
        </Editor>
    );
}
