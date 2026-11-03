import {
    useEffect,
    useState,
} from "react";

import {
    Alert,
    Box,
    Button,
    Checkbox,
    Chip,
    FormControlLabel,
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
} from "../chart of accounts/ChartOfAccountsService";

import {
    getTrialBalance,
} from "./TrialBalanceService";

import "./TrialBalance.css";

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

function SummaryCard({
    label,
    value,
    currency,
    children,
}) {
    return (
        <Paper
            variant="outlined"
            className={
                "trial-balance-summary-card"
            }
        >
            <Typography
                variant="body2"
                color="text.secondary"
            >
                {label}
            </Typography>

            {value !== undefined && (
                <Typography
                    variant="h6"
                    fontWeight={700}
                >
                    {formatMoney(
                        value,
                        currency
                    )}
                </Typography>
            )}

            {children}
        </Paper>
    );
}

export default function TrialBalance() {
    const [companyId, setCompanyId] =
        useState("");

    const [asAtDate, setAsAtDate] =
        useState(
            getLocalDateValue(
                new Date()
            )
        );

    const [branch, setBranch] =
        useState("");

    const [costCenter, setCostCenter] =
        useState("");

    const [
        includeZeroBalances,
        setIncludeZeroBalances,
    ] = useState(true);

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

    const report =
        useLoad(
            async signal => {
                if (!companyId) {
                    return {
                        data: [],
                        total: 0,
                        page,
                        pageSize: 25,
                    };
                }

                const result =
                    await getTrialBalance(
                        {
                            companyId,
                            asAtDate,
                            branch,
                            costCenter,
                            includeZeroBalances,
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
                asAtDate,
                branch,
                costCenter,
                includeZeroBalances,
                debouncedSearch,
                page,
            ],
            {
                keepPreviousData:
                    true,
            }
        );

    const result =
        report.data;

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

    function clearFilters() {
        setAsAtDate(
            getLocalDateValue(
                new Date()
            )
        );

        setBranch("");
        setCostCenter("");
        setIncludeZeroBalances(
            true
        );

        setSearch("");
        setPage(1);
    }

    function refresh() {
        companyLoad.refresh();
        report.refresh();
    }

    return (
        <Page
            className="trial-balance-page"
            title="Trial Balance"
            subtitle={
                "Confirm that total debit and " +
                "credit balances agree for a company"
            }
        >
            <Alert
                severity="info"
                sx={{ mb: 2 }}
            >
                The Trial Balance is calculated
                from posted journal entries up to
                the selected reporting date. Draft
                journals are excluded.
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
                className={
                    "trial-balance-filter-card"
                }
            >
                <Box
                    className={
                        "trial-balance-filter-grid"
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
                        onChange={event => {
                            setCompanyId(
                                event
                                    .target
                                    .value
                            );

                            setPage(1);
                        }}
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
                        size="small"
                        type="date"
                        label="As at"
                        value={asAtDate}
                        slotProps={{
                            inputLabel: {
                                shrink: true,
                            },
                        }}
                        onChange={event => {
                            setAsAtDate(
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

                    <FormControlLabel
                        className={
                            "trial-balance-zero-option"
                        }
                        control={
                            <Checkbox
                                checked={
                                    includeZeroBalances
                                }
                                onChange={
                                    event => {
                                        setIncludeZeroBalances(
                                            event
                                                .target
                                                .checked
                                        );

                                        setPage(1);
                                    }
                                }
                            />
                        }
                        label="Show zero balances"
                    />

                    <Stack
                        direction="row"
                        spacing={1}
                        className={
                            "trial-balance-filter-actions"
                        }
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

            {result && companyId && (
                <>
                    <Box
                        className={
                            "trial-balance-report-heading"
                        }
                    >
                        <Box>
                            <Typography
                                variant="h6"
                                fontWeight={700}
                            >
                                {
                                    result.companyName
                                }
                            </Typography>

                            <Typography
                                variant="body2"
                                color="text.secondary"
                            >
                                As at{" "}
                                {result.asAtDate}
                                {" · "}
                                {result.country}
                                {" · "}
                                {
                                    result.baseCurrency
                                }
                            </Typography>
                        </Box>

                        <Chip
                            label={
                                result.isBalanced
                                    ? "Balanced"
                                    : "Out of balance"
                            }
                            color={
                                result.isBalanced
                                    ? "success"
                                    : "error"
                            }
                        />
                    </Box>

                    <Box
                        className={
                            "trial-balance-summary-grid"
                        }
                    >
                        <SummaryCard
                            label={
                                "Total debit balance"
                            }
                            value={
                                result.totalDebitBalance
                            }
                            currency={
                                currency
                            }
                        />

                        <SummaryCard
                            label={
                                "Total credit balance"
                            }
                            value={
                                result.totalCreditBalance
                            }
                            currency={
                                currency
                            }
                        />

                        <SummaryCard
                            label="Difference"
                            value={
                                result.difference
                            }
                            currency={
                                currency
                            }
                        />

                        <SummaryCard
                            label={
                                "Posted movement"
                            }
                        >
                            <Typography
                                variant="body2"
                                fontWeight={700}
                            >
                                Debit:{" "}
                                {formatMoney(
                                    result.totalDebitMovement,
                                    currency
                                )}
                            </Typography>

                            <Typography
                                variant="body2"
                                fontWeight={700}
                            >
                                Credit:{" "}
                                {formatMoney(
                                    result.totalCreditMovement,
                                    currency
                                )}
                            </Typography>
                        </SummaryCard>
                    </Box>
                </>
            )}

            {companyId && (
                <Records
                    {...report}
                    rows={rows}
                    total={total}
                    page={page}
                    setPage={setPage}
                    search={search}
                    setSearch={setSearch}
                    refresh={
                        report.refresh
                    }
                    columns={[
                        {
                            label: "Code",
                            render: row => (
                                <Typography
                                    component="span"
                                    fontFamily="monospace"
                                    fontWeight={700}
                                >
                                    {
                                        row.accountCode
                                    }
                                </Typography>
                            ),
                        },
                        {
                            label: "Account",
                            render: row =>
                                row.accountName,
                        },
                        {
                            label: "Type",
                            render: row => (
                                <Chip
                                    size="small"
                                    variant="outlined"
                                    label={
                                        row.accountType
                                    }
                                />
                            ),
                        },
                        {
                            label:
                                "Normal balance",
                            render: row =>
                                row.normalBalance,
                        },
                        {
                            label:
                                "Debit movement",
                            render: row =>
                                row.debitMovement
                                    ? formatMoney(
                                        row.debitMovement,
                                        currency
                                    )
                                    : "—",
                        },
                        {
                            label:
                                "Credit movement",
                            render: row =>
                                row.creditMovement
                                    ? formatMoney(
                                        row.creditMovement,
                                        currency
                                    )
                                    : "—",
                        },
                        {
                            label:
                                "Debit balance",
                            render: row =>
                                row.debitBalance
                                    ? formatMoney(
                                        row.debitBalance,
                                        currency
                                    )
                                    : "—",
                        },
                        {
                            label:
                                "Credit balance",
                            render: row =>
                                row.creditBalance
                                    ? formatMoney(
                                        row.creditBalance,
                                        currency
                                    )
                                    : "—",
                        },
                        {
                            label: "Account use",
                            render: row => (
                                <Stack
                                    direction="row"
                                    spacing={0.5}
                                >
                                    {row.isControlAccount && (
                                        <Chip
                                            size="small"
                                            color="warning"
                                            label="Control"
                                        />
                                    )}

                                    {row.isSystemAccount && (
                                        <Chip
                                            size="small"
                                            color="primary"
                                            label="System"
                                        />
                                    )}

                                    {!row.isControlAccount &&
                                     !row.isSystemAccount && (
                                        <Chip
                                            size="small"
                                            label="Standard"
                                        />
                                    )}
                                </Stack>
                            ),
                        },
                    ]}
                />
            )}
        </Page>
    );
}