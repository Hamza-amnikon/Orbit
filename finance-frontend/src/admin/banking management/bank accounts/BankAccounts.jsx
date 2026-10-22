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
    getBankingCurrencies,
} from "./BankAccountService";

import BankAccountForm from "./BankAccountForm";
import OpeningBalanceForm from "./OpeningBalanceForm";
import BankAccountBalance from "./BankAccountBalance";

import "./BankAccounts.css";

function formatOpeningBalance(account) {
    if (!account.openingBalanceDate) {
        return "Not configured";
    }

    return new Intl.NumberFormat(
        undefined,
        {
            style: "currency",
            currency: account.currency,
            currencyDisplay: "code",
            minimumFractionDigits: account.currencyDecimalPlaces,
            maximumFractionDigits: account.currencyDecimalPlaces,
        }
    ).format(account.openingBalance);
}

function BankAccounts() {
    const { canWrite } = useAuth();

    const [search, setSearch] = useState("");
    const [companyId, setCompanyId] = useState("");
    const [currency, setCurrency] = useState("");
    const [active, setActive] = useState("");
    const [page, setPage] = useState(1);
    const [edit, setEdit] = useState(null);
    const [openingAccount, setOpeningAccount] = useState(null);
    const [balanceId, setBalanceId] = useState(null);
    const [notice, setNotice] = useState("");

    const choices = useLoad(
        async signal => {
            const [companies, currencies] = await Promise.all([
                getBankingCompanies(signal),
                getBankingCurrencies(signal),
            ]);

            return {
                companies,
                currencies,
            };
        },
        []
    );

    const companies = choices.data?.companies || [];
    const currencies = choices.data?.currencies || [];

    const list = useLoad(
        signal => getBankAccounts(
            {
                page,
                pageSize: 25,
                search,
                companyId,
                currency,
                isActive: active,
            },
            signal
        ),
        [page, search, companyId, currency, active]
    );

    const ready =
        !choices.loading &&
        !choices.error;

    function refresh() {
        choices.refresh();
        list.refresh();
    }

    function clearFilters() {
        setSearch("");
        setCompanyId("");
        setCurrency("");
        setActive("");
        setPage(1);
    }

    function saved(account) {
        setEdit(null);
        setNotice(account.name + " saved.");
        list.refresh();
    }

    function openingBalanceSaved(account) {
        setOpeningAccount(null);
        setNotice(account.name + " opening balance configured.");
        list.refresh();
    }

    return (
        <Page
            title="Bank Accounts"
            subtitle="Manage company accounts in their own currencies"
            action={canWrite && (
                <Button
                    variant="contained"
                    startIcon={<AddRoundedIcon />}
                    disabled={
                        !ready ||
                        !companies.length ||
                        !currencies.length
                    }
                    onClick={() => {
                        setNotice("");

                        setEdit({
                            companyId: companyId
                                ? Number(companyId)
                                : companies[0]?.id,
                        });
                    }}
                >
                    New Bank Account
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

            {ready && !companies.length && (
                <Alert
                    severity="info"
                    sx={{ mb: 2 }}
                >
                    Add a company through the existing company setup
                    before creating a bank account.
                </Alert>
            )}

            {ready && !currencies.length && (
                <Alert
                    severity="warning"
                    sx={{ mb: 2 }}
                >
                    Add an active currency in Currency Master
                    before creating a bank account.
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
                            label="Account currency"
                            value={currency}
                            disabled={!ready}
                            sx={{ minWidth: 200 }}
                            onChange={event => {
                                setCurrency(event.target.value);
                                setPage(1);
                            }}
                        >
                            <MenuItem value="">
                                All currencies
                            </MenuItem>

                            {currencies.map(item => (
                                <MenuItem
                                    key={item.currencyCode}
                                    value={item.currencyCode}
                                >
                                    {item.currencyCode} · {item.currencyName}
                                </MenuItem>
                            ))}
                        </TextField>

                        <TextField
                            select
                            size="small"
                            label="Status"
                            value={active}
                            sx={{ minWidth: 150 }}
                            onChange={event => {
                                setActive(event.target.value);
                                setPage(1);
                            }}
                        >
                            <MenuItem value="">
                                All statuses
                            </MenuItem>

                            <MenuItem value="true">
                                Active
                            </MenuItem>

                            <MenuItem value="false">
                                Inactive
                            </MenuItem>
                        </TextField>

                        <Button onClick={clearFilters}>
                            Clear filters
                        </Button>
                    </Stack>
                )}
                columns={[
                    {
                        label: "Account",
                        render: account => account.name,
                    },
                    {
                        label: "Company",
                        render: account => account.companyName,
                    },
                    {
                        label: "Bank",
                        render: account => account.bankName || "Not provided",
                    },
                    {
                        label: "Account ending",
                        render: account => account.lastFour
                            ? "•••• " + account.lastFour
                            : "Not provided",
                    },
                    {
                        label: "Currency",
                        render: account => account.currency,
                    },
                    {
                        label: "Opening balance",
                        render: account => formatOpeningBalance(account),
                    },
                    {
                        label: "Opening date",
                        render: account => account.openingBalanceDate
                            ? account.openingBalanceDate
                                .slice(0, 10)
                                .split("-")
                                .reverse()
                                .join("/")
                            : "Not configured",
                    },
                    {
                        label: "Status",
                        render: account => (
                            <Chip
                                size="small"
                                label={account.isActive
                                    ? "Active"
                                    : "Inactive"}
                                color={account.isActive
                                    ? "success"
                                    : "default"}
                            />
                        ),
                    },
                    {
                        label: "Actions",
                        render: account => (
                            <Stack
                                direction="row"
                                spacing={1}
                            >
                                <Button
                                    onClick={() => setBalanceId(account.id)}
                                >
                                    View Balance
                                </Button>

                                {canWrite && (
                                    <>
                                        <Button
                                            disabled={!ready}
                                            onClick={() => {
                                                setNotice("");
                                                setEdit(account);
                                            }}
                                        >
                                            Edit
                                        </Button>

                                        {!account.openingBalanceDate && (
                                            <Button
                                                disabled={!ready}
                                                onClick={() => {
                                                    setNotice("");
                                                    setOpeningAccount(account);
                                                }}
                                            >
                                                Configure Opening Balance
                                            </Button>
                                        )}
                                    </>
                                )}
                            </Stack>
                        ),
                    },
                ]}
            />

            {edit && (
                <BankAccountForm
                    account={edit}
                    companies={companies}
                    currencies={currencies}
                    onClose={() => setEdit(null)}
                    onSaved={saved}
                />
            )}

            {openingAccount && (
                <OpeningBalanceForm
                    account={openingAccount}
                    onClose={() => setOpeningAccount(null)}
                    onSaved={openingBalanceSaved}
                />
            )}

            {balanceId !== null && (
                <BankAccountBalance
                    key={balanceId}
                    id={balanceId}
                    onClose={() => setBalanceId(null)}
                />
            )}
        </Page>
    );
}

export default BankAccounts;