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
    getBankTransactions,
} from "./BankTransactionService";

import TransactionForm from "./TransactionForm";
import TransactionDetails from "./TransactionDetails";

import "./Transactions.css";

async function loadAccounts(signal) {
    const accounts = [];

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

        accounts.push(...result.data);

        if (
            accounts.length >= result.total ||
            result.data.length === 0
        ) {
            break;
        }

        page += 1;
    }

    return accounts;
}

function formatDate(date) {
    return date
        ? date.slice(0, 10).split("-").reverse().join("/")
        : "—";
}

function formatAmount(transaction) {
    return new Intl.NumberFormat(
        undefined,
        {
            style: "currency",
            currency: transaction.currency,
            currencyDisplay: "code",
            minimumFractionDigits: transaction.currencyDecimalPlaces,
            maximumFractionDigits: transaction.currencyDecimalPlaces,
        }
    ).format(transaction.amount);
}

function Transactions() {
    const { canWrite } = useAuth();

    const [search, setSearch] = useState("");
    const [companyId, setCompanyId] = useState("");
    const [bankAccountId, setBankAccountId] = useState("");
    const [status, setStatus] = useState("");
    const [direction, setDirection] = useState("");
    const [page, setPage] = useState(1);
    const [edit, setEdit] = useState(null);
    const [notice, setNotice] = useState("");
    const [detailId, setDetailId] = useState(null);

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

    const filteredAccounts = accounts.filter(
        account =>
            !companyId ||
            account.companyId === Number(companyId)
    );

    const ready =
        !choices.loading &&
        !choices.error;

    const canCreate =
        ready &&
        accounts.some(
            account =>
                account.isActive &&
                account.openingBalanceDate
        );

    const list = useLoad(
        signal => getBankTransactions(
            {
                page,
                pageSize: 25,
                search,
                companyId,
                bankAccountId,
                status,
                direction,
            },
            signal
        ),
        [
            page,
            search,
            companyId,
            bankAccountId,
            status,
            direction,
        ]
    );

    function refresh() {
        choices.refresh();
        list.refresh();
    }

    function clearFilters() {
        setSearch("");
        setCompanyId("");
        setBankAccountId("");
        setStatus("");
        setDirection("");
        setPage(1);
    }

    function saved(transaction) {
        setEdit(null);

        setNotice(
            "Transaction " +
            transaction.id +
            " saved (" +
            transaction.status +
            ")."
        );

        list.refresh();
    }

    return (
        <Page
            title="Transactions"
            subtitle="Track money in and money out for each bank account"
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
                    New Transaction
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

            {ready && !canCreate && (
                <Alert
                    severity="info"
                    sx={{ mb: 2 }}
                >
                    Add an active bank account and configure its
                    opening balance before creating transactions.
                </Alert>
            )}

            <Records
                rows={list.data?.data || []}
                total={list.data?.total || 0}
                page={list.data?.page || page}
                setPage={setPage}
                search={search}
                setSearch={setSearch}
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
                            sx={{ minWidth: 200 }}
                            onChange={event => {
                                setCompanyId(event.target.value);
                                setBankAccountId("");
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
                            label="Bank account"
                            value={bankAccountId}
                            disabled={!ready}
                            sx={{ minWidth: 240 }}
                            onChange={event => {
                                setBankAccountId(event.target.value);
                                setPage(1);
                            }}
                        >
                            <MenuItem value="">
                                All accounts
                            </MenuItem>

                            {filteredAccounts.map(account => (
                                <MenuItem
                                    key={account.id}
                                    value={String(account.id)}
                                >
                                    {account.name} · {account.currency}
                                </MenuItem>
                            ))}
                        </TextField>

                        <TextField
                            select
                            size="small"
                            label="Direction"
                            value={direction}
                            sx={{ minWidth: 150 }}
                            onChange={event => {
                                setDirection(event.target.value);
                                setPage(1);
                            }}
                        >
                            <MenuItem value="">
                                All directions
                            </MenuItem>

                            <MenuItem value="1">
                                Money In
                            </MenuItem>

                            <MenuItem value="2">
                                Money Out
                            </MenuItem>
                        </TextField>

                        <TextField
                            select
                            size="small"
                            label="Status"
                            value={status}
                            sx={{ minWidth: 150 }}
                            onChange={event => {
                                setStatus(event.target.value);
                                setPage(1);
                            }}
                        >
                            <MenuItem value="">
                                All statuses
                            </MenuItem>

                            <MenuItem value="Draft">
                                Draft
                            </MenuItem>

                            <MenuItem value="Posted">
                                Posted
                            </MenuItem>

                            <MenuItem value="Cancelled">
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
                        label: "Transaction",
                        render: transaction => "BT-" + transaction.id,
                    },
                    {
                        label: "Date",
                        render: transaction =>
                            formatDate(transaction.transactionDate),
                    },
                    {
                        label: "Company",
                        render: transaction => transaction.companyName,
                    },
                    {
                        label: "Account",
                        render: transaction => transaction.bankAccountName,
                    },
                    {
                        label: "Direction",
                        render: transaction =>
                            transaction.direction === 1
                                ? "Money In"
                                : "Money Out",
                    },
                    {
                        label: "Amount",
                        render: transaction => formatAmount(transaction),
                    },
                    {
                        label: "Reference",
                        render: transaction => transaction.reference || "—",
                    },
                    {
                        label: "Status",
                        render: transaction => (
                            <Chip
                                size="small"
                                label={transaction.status}
                                color={transaction.status === "Posted"
                                    ? "success"
                                    : transaction.status === "Draft"
                                        ? "warning"
                                        : "default"}
                            />
                        ),
                    },
                    {
                        label: "Actions",
                        render: transaction => (
                            <Stack
                                direction="row"
                                spacing={1}
                            >
                                <Button
                                    onClick={() =>
                                        setDetailId(transaction.id)
                                    }
                                >
                                    View
                                </Button>

                                {canWrite &&
                                    transaction.status === "Draft" && (
                                        <Button
                                            disabled={!ready}
                                            onClick={() => {
                                                setNotice("");
                                                setEdit(transaction);
                                            }}
                                        >
                                            Edit
                                        </Button>
                                    )}
                            </Stack>
                        ),
                    },
                ]}
            />

            {edit && (
                <TransactionForm
                    transaction={edit}
                    accounts={accounts}
                    onClose={() => setEdit(null)}
                    onSaved={saved}
                />
            )}

            {detailId !== null && (
                <TransactionDetails
                    key={detailId}
                    id={detailId}
                    canWrite={canWrite}
                    onClose={() => setDetailId(null)}
                    onChanged={() => list.refresh()}
                    onEdit={transaction => {
                        setDetailId(null);
                        setNotice("");
                        setEdit(transaction);
                    }}
                />
            )}
        </Page>
    );
}

export default Transactions;