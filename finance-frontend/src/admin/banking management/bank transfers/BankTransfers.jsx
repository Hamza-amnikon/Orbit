import { useState } from "react";

import {
    Alert,
    Button,
    Chip,
    MenuItem,
    Stack,
    TextField,
} from "@mui/material";

import AddRoundedIcon from "@mui/icons-material/AddRounded";

import { useAuth } from "../../../context/AuthContext";
import { useLoad } from "../../../live/data";
import { Feedback, Page, Records } from "../../../live/shared";

import {
    getBankAccounts,
    getBankingCompanies,
} from "../bank accounts/BankAccountService";

import {
    getBankTransfers,
} from "./BankTransferService";

import BankTransferForm from "./BankTransferForm";
import BankTransferDetails from "./BankTransferDetails";

import "../../shared/AdminModules.css";

async function loadAccounts(signal) {
    const accounts = new Map();

    let page = 1;

    while (true) {
        const result = await getBankAccounts(
            {
                page,
                pageSize: 100,
            },
            signal
        );

        if (
            !Array.isArray(result?.data) ||
            !Number.isInteger(result.total)
        ) {
            throw new Error("Invalid bank account response.");
        }

        const previousSize = accounts.size;

        for (const account of result.data) {
            accounts.set(account.id, account);
        }

        if (accounts.size >= result.total) {
            break;
        }

        if (
            result.data.length === 0 ||
            accounts.size === previousSize
        ) {
            throw new Error(
                "The account list changed while loading. Refresh and try again."
            );
        }

        page += 1;
    }

    return Array.from(accounts.values());
}

function formatDate(date) {
    return date
        ? date.slice(0, 10).split("-").reverse().join("/")
        : "—";
}

function formatAmount(amount, currency, decimalPlaces) {
    if (amount === null || amount === undefined) {
        return "—";
    }

    return new Intl.NumberFormat(
        undefined,
        {
            style: "currency",
            currency,
            currencyDisplay: "code",
            minimumFractionDigits: decimalPlaces,
            maximumFractionDigits: decimalPlaces,
        }
    ).format(amount);
}

function statusLabel(status) {
    switch (status) {
        case 0:
            return "Draft";
        case 1:
            return "Pending";
        case 2:
            return "Completed";
        case 3:
            return "Cancelled";
        default:
            return "Unknown";
    }
}

function statusColor(status) {
    switch (status) {
        case 0:
            return "warning";
        case 1:
            return "info";
        case 2:
            return "success";
        default:
            return "default";
    }
}

function BankTransfers() {
    const { canWrite } = useAuth();

    const [search, setSearch] = useState("");
    const [companyId, setCompanyId] = useState("");
    const [status, setStatus] = useState("");
    const [page, setPage] = useState(1);
    const [edit, setEdit] = useState(null);
    const [detailId, setDetailId] = useState(null);
    const [notice, setNotice] = useState("");

    const choices = useLoad(
        async signal => {
            const [companies, accounts] = await Promise.all([
                getBankingCompanies(signal),
                loadAccounts(signal),
            ]);

            return {
                companies,
                accounts,
            };
        },
        []
    );

    const companies = choices.data?.companies || [];
    const accounts = choices.data?.accounts || [];

    const ready =
        !choices.loading &&
        !choices.error;

    const eligibleAccounts = accounts.filter(
        account =>
            account.isActive &&
            account.openingBalanceDate
    );

    const canCreate =
        ready &&
        eligibleAccounts.length >= 2;

    const list = useLoad(
        signal => getBankTransfers(
            {
                page,
                pageSize: 25,
                search,
                companyId,
                status,
            },
            signal
        ),
        [
            page,
            search,
            companyId,
            status,
        ]
    );

    function refresh() {
        choices.refresh();
        list.refresh();
    }

    function clearFilters() {
        setSearch("");
        setCompanyId("");
        setStatus("");
        setPage(1);
    }

    function saved(transfer) {
        setEdit(null);

        setNotice(
            "Transfer " +
            transfer.id +
            " saved (" +
            statusLabel(transfer.status) +
            ")."
        );

        list.refresh();
    }

    return (
        <Page
            title="Bank Transfers"
            subtitle="Track transfers between bank accounts in their own currencies"
            action={canWrite && (
                <Button
                    variant="contained"
                    startIcon={<AddRoundedIcon />}
                    disabled={!canCreate}
                    onClick={() => {
                        setNotice("");
                        setEdit({});
                    }}
                >
                    New Transfer
                </Button>
            )}
        >
            {notice && (
                <Alert
                    severity="success"
                    sx={{ mb: 2 }}
                    onClose={() => setNotice("")}
                >
                    {notice}
                </Alert>
            )}

            <Feedback
                loading={choices.loading}
                error={choices.error}
                retry={refresh}
            />

            {ready && !canCreate && canWrite && (
                <Alert
                    severity="info"
                    sx={{ mb: 2 }}
                >
                    Configure opening balances for at least two active
                    bank accounts before creating a transfer.
                </Alert>
            )}

            <Records
                rows={list.data?.data || []}
                total={list.data?.total || 0}
                page={list.data?.page || page}
                setPage={setPage}
                search={search}
                setSearch={next => {
                    setSearch(next);
                    setPage(1);
                }}
                loading={list.loading}
                error={list.error}
                refresh={refresh}
                extra={(
                    <Stack
                        direction="row"
                        useFlexGap
                        sx={{ flexWrap: "wrap" }}
                        spacing={2}
                    >
                        <TextField
                            select
                            size="small"
                            label="Company"
                            value={companyId}
                            disabled={!ready}
                            sx={{ minWidth: 220 }}
                            onChange={event => {
                                setCompanyId(event.target.value);
                                setPage(1);
                            }}
                        >
                            <MenuItem value="">
                                All companies
                            </MenuItem>

                            {companies.map(company => (
                                <MenuItem
                                    key={company.id}
                                    value={String(company.id)}
                                >
                                    {company.name}
                                </MenuItem>
                            ))}
                        </TextField>

                        <TextField
                            select
                            size="small"
                            label="Status"
                            value={status}
                            sx={{ minWidth: 180 }}
                            onChange={event => {
                                setStatus(event.target.value);
                                setPage(1);
                            }}
                        >
                            <MenuItem value="">
                                All statuses
                            </MenuItem>

                            <MenuItem value="0">
                                Draft
                            </MenuItem>

                            <MenuItem value="1">
                                Pending
                            </MenuItem>

                            <MenuItem value="2">
                                Completed
                            </MenuItem>

                            <MenuItem value="3">
                                Cancelled
                            </MenuItem>
                        </TextField>

                        <Button onClick={clearFilters}>
                            Clear filters
                        </Button>
                    </Stack>
                )}
                columns={[
                    {
                        label: "Transfer",
                        render: transfer => "Transfer " + transfer.id,
                    },
                    {
                        label: "Date",
                        render: transfer =>
                            formatDate(transfer.transferDate),
                    },
                    {
                        label: "From account",
                        render: transfer => (
                            <Stack spacing={0.5}>
                                <span>
                                    {transfer.sourceBankAccountName}
                                </span>
                                <small>
                                    {transfer.sourceCompanyName}
                                </small>
                            </Stack>
                        ),
                    },
                    {
                        label: "To account",
                        render: transfer => (
                            <Stack spacing={0.5}>
                                <span>
                                    {transfer.destinationBankAccountName}
                                </span>
                                <small>
                                    {transfer.destinationCompanyName}
                                </small>
                            </Stack>
                        ),
                    },
                    {
                        label: "Source amount",
                        render: transfer => formatAmount(
                            transfer.sourceAmount,
                            transfer.sourceCurrency,
                            transfer.sourceCurrencyDecimalPlaces
                        ),
                    },
                    {
                        label: "Source fee",
                        render: transfer => formatAmount(
                            transfer.sourceFeeAmount,
                            transfer.sourceCurrency,
                            transfer.sourceCurrencyDecimalPlaces
                        ),
                    },
                    {
                        label: "Received amount",
                        render: transfer => formatAmount(
                            transfer.destinationAmount,
                            transfer.destinationCurrency,
                            transfer.destinationCurrencyDecimalPlaces
                        ),
                    },
                    {
                        label: "Reference",
                        render: transfer => transfer.reference || "—",
                    },
                    {
                        label: "Status",
                        render: transfer => (
                            <Chip
                                size="small"
                                label={statusLabel(transfer.status)}
                                color={statusColor(transfer.status)}
                            />
                        ),
                    },
                    {
                        label: "Actions",
                        render: transfer => (
                            <Button
                                onClick={() => setDetailId(transfer.id)}
                            >
                                View
                            </Button>
                        ),
                    },
                ]}
            />

            {edit !== null && (
                <BankTransferForm
                    key={edit.id || "new"}
                    transfer={edit}
                    accounts={accounts}
                    onClose={() => setEdit(null)}
                    onSaved={saved}
                />
            )}
            {detailId !== null && (
                <BankTransferDetails
                    key={detailId}
                    id={detailId}
                    canWrite={canWrite}
                    onClose={() => setDetailId(null)}
                    onChanged={() => list.refresh()}
                    onEdit={ready ? transfer => {
                        setDetailId(null);
                        setNotice("");
                        setEdit(transfer);
                    } : undefined}
                />
            )}
        </Page>
    );
}

export default BankTransfers;