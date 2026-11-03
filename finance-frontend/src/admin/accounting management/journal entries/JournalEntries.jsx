import {
    useEffect,
    useState,
} from "react";

import {
    Box,
    Button,
    Chip,
    MenuItem,
    Stack,
    TextField,
} from "@mui/material";

import AddRoundedIcon from
    "@mui/icons-material/AddRounded";

import { useAuth } from
    "../../../context/AuthContext";

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
    getJournalEntries,
} from "./JournalEntriesService";

import JournalEntryForm from
    "./JournalEntryForm";

import JournalEntryDetails from
    "./JournalEntryDetails";

import "./JournalEntries.css";

const journalStatuses = [
    "Draft",
    "Posted",
    "Reversed",
];

const journalSources = [
    "Manual",
    "OpeningBalance",
    "SalesInvoice",
    "PaymentReceived",
    "PurchaseBill",
    "PaymentMade",
    "Expense",
    "BankTransaction",
    "Reversal",
];

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

export default function JournalEntries() {
    const { canWrite } =
        useAuth();

    const [companyId, setCompanyId] =
        useState("");

    const [search, setSearch] =
        useState("");

    const [
        debouncedSearch,
        setDebouncedSearch,
    ] = useState("");

    const [status, setStatus] =
        useState("");

    const [source, setSource] =
        useState("");

    const [fromDate, setFromDate] =
        useState("");

    const [toDate, setToDate] =
        useState("");

    const [page, setPage] =
        useState(1);

    const [adding, setAdding] =
        useState(false);

    const [selectedId, setSelectedId] =
        useState(null);

    useEffect(() => {
        const timer =
            setTimeout(
                () =>
                    setDebouncedSearch(
                        search
                    ),
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

    const list =
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
                    await getJournalEntries(
                        {
                            companyId,
                            fromDate,
                            toDate,
                            status,
                            source,
                            search:
                                debouncedSearch,
                            page,
                            pageSize: 25,
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
                    setPage(lastPage);
                }

                return result;
            },
            [
                companyId,
                fromDate,
                toDate,
                status,
                source,
                debouncedSearch,
                page,
            ],
            {
                keepPreviousData:
                    true,
            }
        );

    function changeCompany(event) {
        setCompanyId(
            event.target.value
        );

        setPage(1);
        setSelectedId(null);
    }

    function clearFilters() {
        setSearch("");
        setStatus("");
        setSource("");
        setFromDate("");
        setToDate("");
        setPage(1);
    }

    function refresh() {
        list.refresh();
    }

    const rows =
        list.data?.data || [];

    const total =
        list.data?.total || 0;

    return (
        <Page
            className="journal-entries-page"
            title="Journal Entries"
            subtitle={
                "Prepare, post and reverse " +
                "balanced accounting entries"
            }
            action={
                canWrite && (
                    <Button
                        variant="contained"
                        startIcon={
                            <AddRoundedIcon />
                        }
                        disabled={
                            !companyId
                        }
                        onClick={() =>
                            setAdding(true)
                        }
                    >
                        New Journal
                    </Button>
                )
            }
        >
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

            <Records
                {...list}
                rows={rows}
                total={total}
                page={page}
                setPage={setPage}
                search={search}
                setSearch={setSearch}
                refresh={refresh}
                extra={
                    <Stack
                        direction={{
                            xs: "column",
                            md: "row",
                        }}
                        spacing={1.5}
                        alignItems={{
                            xs: "stretch",
                            md: "center",
                        }}
                    >
                        <TextField
                            select
                            size="small"
                            label="Company"
                            value={
                                companyId
                            }
                            sx={{
                                minWidth: 220,
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
                            label="Status"
                            value={status}
                            sx={{
                                minWidth: 140,
                            }}
                            onChange={
                                event => {
                                    setStatus(
                                        event
                                            .target
                                            .value
                                    );

                                    setPage(1);
                                }
                            }
                        >
                            <MenuItem value="">
                                All statuses
                            </MenuItem>

                            {journalStatuses.map(
                                value => (
                                    <MenuItem
                                        key={
                                            value
                                        }
                                        value={
                                            value
                                        }
                                    >
                                        {value}
                                    </MenuItem>
                                )
                            )}
                        </TextField>

                        <TextField
                            select
                            size="small"
                            label="Source"
                            value={source}
                            sx={{
                                minWidth: 170,
                            }}
                            onChange={
                                event => {
                                    setSource(
                                        event
                                            .target
                                            .value
                                    );

                                    setPage(1);
                                }
                            }
                        >
                            <MenuItem value="">
                                All sources
                            </MenuItem>

                            {journalSources.map(
                                value => (
                                    <MenuItem
                                        key={
                                            value
                                        }
                                        value={
                                            value
                                        }
                                    >
                                        {
                                            formatSource(
                                                value
                                            )
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
                            onChange={
                                event => {
                                    setFromDate(
                                        event
                                            .target
                                            .value
                                    );

                                    setPage(1);
                                }
                            }
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
                            onChange={
                                event => {
                                    setToDate(
                                        event
                                            .target
                                            .value
                                    );

                                    setPage(1);
                                }
                            }
                        />

                        <Button
                            onClick={
                                clearFilters
                            }
                        >
                            Clear filters
                        </Button>
                    </Stack>
                }
                columns={[
                    {
                        label:
                            "Journal number",
                        render: row =>
                            row.entryNumber,
                    },
                    {
                        label: "Date",
                        render: row =>
                            formatDate(
                                row.entryDate
                            ),
                    },
                    {
                        label:
                            "Narration",
                        render: row =>
                            row.narration,
                    },
                    {
                        label:
                            "Branch",
                        render: row =>
                            row.branch,
                    },
                    {
                        label:
                            "Source",
                        render: row =>
                            formatSource(
                                row.source
                            ),
                    },
                    {
                        label:
                            "Debit",
                        render: row =>
                            formatMoney(
                                row.totalDebit,
                                row.currency
                            ),
                    },
                    {
                        label:
                            "Credit",
                        render: row =>
                            formatMoney(
                                row.totalCredit,
                                row.currency
                            ),
                    },
                    {
                        label:
                            "Status",
                        render: row => (
                            <Chip
                                size="small"
                                label={
                                    row.status
                                }
                                color={
                                    statusColor(
                                        row.status
                                    )
                                }
                            />
                        ),
                    },
                    {
                        label:
                            "Action",
                        render: row => (
                            <Button
                                onClick={() =>
                                    setSelectedId(
                                        row.id
                                    )
                                }
                            >
                                View
                            </Button>
                        ),
                    },
                ]}
            />

            {canWrite && adding && (
                <JournalEntryForm
                    companyId={
                        Number(companyId)
                    }
                    companies={
                        companies
                    }
                    onClose={() =>
                        setAdding(false)
                    }
                    onSaved={journal => {
                        setAdding(false);
                        refresh();

                        setSelectedId(
                            journal.id
                        );
                    }}
                />
            )}

            {selectedId && (
                <JournalEntryDetails
                    id={selectedId}
                    companyId={
                        Number(companyId)
                    }
                    canWrite={
                        canWrite
                    }
                    onClose={() =>
                        setSelectedId(
                            null
                        )
                    }
                    onChanged={() => {
                        refresh();
                    }}
                />
            )}
        </Page>
    );
}
