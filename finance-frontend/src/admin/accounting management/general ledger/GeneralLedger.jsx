import {
    useEffect,
    useState,
} from "react";

import {
    Alert,
    Box,
    Button,
    Chip,
    MenuItem,
    Paper,
    Stack,
    TextField,
    Typography,
} from "@mui/material";

import { useLoad } from
    "../../../live/data";

import {
    Feedback,
    Page,
    Records,
} from "../../../live/shared";

import {
    getAccountingCompanies,
    getAccounts,
} from "../chart of accounts/ChartOfAccountsService";

import {
    getGeneralLedger,
} from "./GeneralLedgerService";

import "./GeneralLedger.css";

function getLocalDateValue(date) {
    const year =
        date.getFullYear();

    const month =
        String(
            date.getMonth() + 1
        ).padStart(
            2,
            "0"
        );

    const day =
        String(
            date.getDate()
        ).padStart(
            2,
            "0"
        );

    return (
        year +
        "-" +
        month +
        "-" +
        day
    );
}

function getDefaultDates() {
    const today =
        new Date();

    const firstDay =
        new Date(
            today.getFullYear(),
            today.getMonth(),
            1
        );

    return {
        fromDate:
            getLocalDateValue(
                firstDay
            ),
        toDate:
            getLocalDateValue(
                today
            ),
    };
}

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
            minimumFractionDigits: 2,
        }
    ).format(
        value ?? 0
    );
}

function formatSource(value) {
    if (!value) {
        return "—";
    }

    return String(value)
        .replace(
            /([a-z])([A-Z])/g,
            "$1 $2"
        );
}

function SummaryCard({
    label,
    value,
    side,
    currency,
}) {
    return (
        <Paper
            variant="outlined"
            className="general-ledger-summary-card"
        >
            <Typography
                variant="body2"
                color="text.secondary"
            >
                {label}
            </Typography>

            <Typography
                variant="h6"
                fontWeight={700}
            >
                {formatMoney(
                    value,
                    currency
                )}
            </Typography>

            {side && (
                <Chip
                    size="small"
                    variant="outlined"
                    label={side}
                    color={
                        side === "Debit"
                            ? "primary"
                            : "warning"
                    }
                />
            )}
        </Paper>
    );
}

export default function GeneralLedger() {
    const defaultDates =
        getDefaultDates();

    const [companyId, setCompanyId] =
        useState("");

    const [accountId, setAccountId] =
        useState("");

    const [fromDate, setFromDate] =
        useState(
            defaultDates.fromDate
        );

    const [toDate, setToDate] =
        useState(
            defaultDates.toDate
        );

    const [branch, setBranch] =
        useState("");

    const [costCenter, setCostCenter] =
        useState("");

    const [search, setSearch] =
        useState("");

    const [
        debouncedSearch,
        setDebouncedSearch,
    ] = useState("");

    const [page, setPage] =
        useState(1);

    useEffect(() => {
        const timer =
            setTimeout(
                () => {
                    setDebouncedSearch(
                        search
                    );

                    setPage(1);
                },
                250
            );

        return () =>
            clearTimeout(timer);
    }, [search]);

    const companyLoad =
        useLoad(
            signal =>
                getAccountingCompanies(
                    signal
                ),
            []
        );

    const companies =
        companyLoad.data || [];

    useEffect(() => {
        if (
            !companyId &&
            companies.length
        ) {
            setCompanyId(
                String(
                    companies[0].id
                )
            );
        }
    }, [
        companyId,
        companies,
    ]);

    const accountLoad =
        useLoad(
            async signal => {
                if (!companyId) {
                    return {
                        data: [],
                        total: 0,
                        page: 1,
                        pageSize: 100,
                    };
                }

                return getAccounts(
                    {
                        companyId,
                        isPostingAccount:
                            true,
                        isActive:
                            true,
                        page:
                            1,
                        pageSize:
                            100,
                    },
                    signal
                );
            },
            [companyId]
        );

    const accounts =
        accountLoad.data?.data || [];

    useEffect(() => {
        if (
            accountId &&
            !accounts.some(
                account =>
                    String(account.id) ===
                    String(accountId)
            )
        ) {
            setAccountId("");
        }
    }, [
        accountId,
        accounts,
    ]);

    const ledger =
        useLoad(
            async signal => {
                if (
                    !companyId ||
                    !accountId
                ) {
                    return {
                        data: [],
                        total: 0,
                        page,
                        pageSize: 25,
                    };
                }

                const result =
                    await getGeneralLedger(
                        {
                            companyId,
                            accountId,
                            fromDate,
                            toDate,
                            branch,
                            costCenter,
                            search:
                                debouncedSearch,
                            page,
                            pageSize:
                                25,
                        },
                        signal
                    );

                const lastPage =
                    Math.max(
                        1,
                        Math.ceil(
                            result.total /
                            25
                        )
                    );

                if (
                    !signal.aborted &&
                    page > lastPage
                ) {
                    setPage(
                        lastPage
                    );
                }

                return result;
            },
            [
                companyId,
                accountId,
                fromDate,
                toDate,
                branch,
                costCenter,
                debouncedSearch,
                page,
            ],
            {
                keepPreviousData:
                    true,
            }
        );

    const result =
        ledger.data;

    const rows =
        result?.data || [];

    const total =
        result?.total || 0;

    const currency =
        result?.baseCurrency ||
        companies.find(
            company =>
                String(company.id) ===
                String(companyId)
        )?.currency ||
        "AED";

    function changeCompany(event) {
        setCompanyId(
            event.target.value
        );

        setAccountId("");
        setPage(1);
    }

    function changeAccount(event) {
        setAccountId(
            event.target.value
        );

        setPage(1);
    }

    function clearFilters() {
        const dates =
            getDefaultDates();

        setFromDate(
            dates.fromDate
        );

        setToDate(
            dates.toDate
        );

        setBranch("");
        setCostCenter("");
        setSearch("");
        setPage(1);
    }

    function refresh() {
        companyLoad.refresh();
        accountLoad.refresh();
        ledger.refresh();
    }

    return (
        <Page
            className="general-ledger-page"
            title="General Ledger"
            subtitle={
                "Review the complete accounting " +
                "movement and running balance " +
                "of one posting account"
            }
        >
            <Alert
                severity="info"
                sx={{ mb: 2 }}
            >
                The General Ledger is calculated
                from posted journal entries. Draft
                journals are not included.
            </Alert>

            <Feedback
                loading={
                    companyLoad.loading
                }
                error={
                    companyLoad.error
                }
                retry={
                    companyLoad.refresh
                }
            />

            <Feedback
                loading={
                    Boolean(companyId) &&
                    accountLoad.loading
                }
                error={
                    accountLoad.error
                }
                retry={
                    accountLoad.refresh
                }
            />

            {!companyLoad.loading &&
             !companyLoad.error &&
             !companies.length && (
                <Alert
                    severity="warning"
                    sx={{ mb: 2 }}
                >
                    No companies are available.
                </Alert>
            )}

            <Paper
                variant="outlined"
                className="general-ledger-filter-card"
            >
                <Box
                    className={
                        "general-ledger-filter-grid"
                    }
                >
                    <TextField
                        select
                        size="small"
                        label="Company"
                        value={companyId}
                        disabled={
                            companyLoad.loading
                        }
                        sx={{
                            minWidth: 240,
                        }}
                        onChange={
                            changeCompany
                        }
                    >
                        {companies.map(
                            company => (
                                <MenuItem
                                    key={
                                        company.id
                                    }
                                    value={String(
                                        company.id
                                    )}
                                >
                                    {
                                        company.name
                                    }
                                    {" · "}
                                    {
                                        company.currency
                                    }
                                </MenuItem>
                            )
                        )}
                    </TextField>

                    <TextField
                        select
                        size="small"
                        label="Posting account"
                        value={accountId}
                        disabled={
                            !companyId ||
                            accountLoad.loading
                        }
                        sx={{
                            minWidth: 270,
                        }}
                        onChange={
                            changeAccount
                        }
                    >
                        <MenuItem value="">
                            Select an account
                        </MenuItem>

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
                        type="date"
                        label="From"
                        value={fromDate}
                        slotProps={{
                            inputLabel: {
                                shrink: true,
                            },
                        }}
                        onChange={event => {
                            setFromDate(
                                event
                                    .target
                                    .value
                            );

                            setPage(1);
                        }}
                    />

                    <TextField
                        size="small"
                        type="date"
                        label="To"
                        value={toDate}
                        slotProps={{
                            inputLabel: {
                                shrink: true,
                            },
                        }}
                        onChange={event => {
                            setToDate(
                                event
                                    .target
                                    .value
                            );

                            setPage(1);
                        }}
                    />

                    <TextField
                        size="small"
                        label="Branch"
                        value={branch}
                        onChange={event => {
                            setBranch(
                                event
                                    .target
                                    .value
                            );

                            setPage(1);
                        }}
                    />

                    <TextField
                        size="small"
                        label="Cost center"
                        value={costCenter}
                        onChange={event => {
                            setCostCenter(
                                event
                                    .target
                                    .value
                            );

                            setPage(1);
                        }}
                    />

                    <Stack
                        className={
                            "general-ledger-filter-actions"
                        }
                        direction="row"
                        spacing={1}
                    >
                        <Button
                            variant="outlined"
                            onClick={
                                clearFilters
                            }
                        >
                            Clear
                        </Button>

                        <Button
                            variant="contained"
                            onClick={
                                refresh
                            }
                        >
                            Apply
                        </Button>
                    </Stack>
                </Box>
            </Paper>

            {companyId &&
             !accountId &&
             !accountLoad.loading && (
                <Alert
                    severity="warning"
                    sx={{ mt: 2 }}
                >
                    Select a posting account to
                    view its General Ledger.
                </Alert>
            )}

            {accountId && result && (
                <>
                    <Box
                        className={
                            "general-ledger-account-heading"
                        }
                    >
                        <Typography
                            variant="h6"
                            fontWeight={700}
                        >
                            {result.accountCode}
                            {" · "}
                            {result.accountName}
                        </Typography>

                        <Typography
                            variant="body2"
                            color="text.secondary"
                        >
                            {result.companyName}
                            {" · "}
                            {result.accountType}
                            {" · Normal balance: "}
                            {result.normalBalance}
                        </Typography>
                    </Box>

                    <Box
                        className={
                            "general-ledger-summary-grid"
                        }
                    >
                        <SummaryCard
                            label={
                                "Opening balance"
                            }
                            value={
                                result.openingBalance
                            }
                            side={
                                result.openingBalanceSide
                            }
                            currency={
                                currency
                            }
                        />

                        <SummaryCard
                            label={
                                "Period debit"
                            }
                            value={
                                result.periodDebit
                            }
                            currency={
                                currency
                            }
                        />

                        <SummaryCard
                            label={
                                "Period credit"
                            }
                            value={
                                result.periodCredit
                            }
                            currency={
                                currency
                            }
                        />

                        <SummaryCard
                            label={
                                "Closing balance"
                            }
                            value={
                                result.closingBalance
                            }
                            side={
                                result.closingBalanceSide
                            }
                            currency={
                                currency
                            }
                        />
                    </Box>
                </>
            )}

            {accountId && (
                <Records
                    {...ledger}
                    rows={rows}
                    total={total}
                    page={page}
                    setPage={setPage}
                    search={search}
                    setSearch={setSearch}
                    refresh={
                        ledger.refresh
                    }
                    columns={[
                        {
                            label: "Date",
                            render: row =>
                                formatDate(
                                    row.entryDate
                                ),
                        },
                        {
                            label:
                                "Journal number",
                            render: row =>
                                row.entryNumber,
                        },
                        {
                            label:
                                "Description",
                            render: row =>
                                row.description ||
                                row.narration ||
                                "—",
                        },
                        {
                            label:
                                "Source",
                            render: row => (
                                <Chip
                                    size="small"
                                    variant="outlined"
                                    label={
                                        formatSource(
                                            row.source
                                        )
                                    }
                                />
                            ),
                        },
                        {
                            label:
                                "Reference",
                            render: row =>
                                row.reference ||
                                row.sourceDocumentNumber ||
                                "—",
                        },
                        {
                            label:
                                "Debit",
                            render: row =>
                                row.baseDebit
                                    ? formatMoney(
                                        row.baseDebit,
                                        currency
                                    )
                                    : "—",
                        },
                        {
                            label:
                                "Credit",
                            render: row =>
                                row.baseCredit
                                    ? formatMoney(
                                        row.baseCredit,
                                        currency
                                    )
                                    : "—",
                        },
                        {
                            label:
                                "Running balance",
                            render: row => (
                                <Stack
                                    direction="row"
                                    spacing={1}
                                    alignItems="center"
                                >
                                    <Typography
                                        component="span"
                                        fontWeight={700}
                                    >
                                        {formatMoney(
                                            row.runningBalance,
                                            currency
                                        )}
                                    </Typography>

                                    <Chip
                                        size="small"
                                        label={
                                            row.balanceSide
                                        }
                                        color={
                                            row.balanceSide ===
                                            "Debit"
                                                ? "primary"
                                                : "warning"
                                        }
                                    />
                                </Stack>
                            ),
                        },
                        {
                            label:
                                "Branch",
                            render: row =>
                                row.branch ||
                                "—",
                        },
                        {
                            label:
                                "Cost center",
                            render: row =>
                                row.costCenter ||
                                "—",
                        },
                    ]}
                />
            )}
        </Page>
    );
}
