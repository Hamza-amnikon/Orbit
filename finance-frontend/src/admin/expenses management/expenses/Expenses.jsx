import { useState } from "react";

import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    MenuItem,
    Stack,
    TextField,
    Typography,
} from "@mui/material";

import AddRoundedIcon from "@mui/icons-material/AddRounded";
import { useAuth } from "../../../context/AuthContext";
import { Page, Records, Feedback } from "../../../live/shared";
import { useLoad } from "../../../live/data";

import {
    formatDate,
    getAccounts,
    getCompanies,
    getExpenses,
    getExpenseChoices,
    getPreference,
    money,
    setPreference,
} from "./ExpenseService";

import ExpenseForm from "./ExpenseForm";
import ExpenseDetails from "./ExpenseDetails";
import ExpenseSetup from "./ExpenseSetup";

import "./Expenses.css";

function Expenses() {
    const { canWrite } = useAuth();

    const [companyId, setCompanyId] = useState(
        () => getPreference("company", "")
    );

    const [preferredCurrency, setCurrency] = useState(
        () => getPreference("currency", "")
    );

    const [search, setSearch] = useState("");
    const [status, setStatus] = useState("");
    const [from, setFrom] = useState("");
    const [to, setTo] = useState("");
    const [page, setPage] = useState(1);
    const [edit, setEdit] = useState(null);
    const [detail, setDetail] = useState(null);
    const [setup, setSetup] = useState(false);
    const [notice, setNotice] = useState("");

    const choices = useLoad(getExpenseChoices, []);
    const companies = useLoad(getCompanies, []);
    const accounts = useLoad(getAccounts, []);
    const currencies = choices.data?.currencies || [];

    const company = companies.data?.find(
        row => String(row.id) === companyId
    );

    const currency =
        currencies.find(
            row => row.currencyCode === preferredCurrency
        )?.currencyCode ||
        currencies.find(
            row => row.currencyCode === company?.currency
        )?.currencyCode ||
        currencies[0]?.currencyCode ||
        "";

    const precision = currencies.find(
        row => row.currencyCode === currency
    )?.decimalPlaces;

    const list = useLoad(
        signal => getExpenses(
            {
                companyId,
                displayCurrency: currency,
                search,
                status,
                from,
                to,
                page,
            },
            signal
        ),
        [companyId, currency, search, status, from, to, page]
    );

    function refresh() {
        list.refresh();
        companies.refresh();
        choices.refresh();
        accounts.refresh();
    }

    function chooseCompany(id) {
        setCompanyId(String(id));
        setPreference("company", String(id));
        setPage(1);
    }

    function saved(row) {
        setEdit(null);

        setNotice(
            row.status === "Recorded"
                ? "Expense recorded."
                : "Expense draft saved."
        );

        list.refresh();
        setDetail(row.id);
    }

    const ready =
        !choices.loading &&
        !choices.error &&
        currencies.length > 0 &&
        !companies.loading &&
        !companies.error &&
        !accounts.loading &&
        !accounts.error;

    return (
        <Page
            title="Expenses"
            subtitle="Track company expenses"
            action={canWrite && (
                <Stack
                    direction="row"
                    spacing={1}
                >
                    <Button
                        variant="outlined"
                        onClick={() => setSetup(true)}
                    >
                        Setup
                    </Button>

                    <Button
                        variant="contained"
                        startIcon={<AddRoundedIcon />}
                        disabled={!ready || !companies.data?.length}
                        onClick={() => setEdit({
                            companyId: company?.id || companies.data[0].id,
                        })}
                    >
                        New Expense
                    </Button>
                </Stack>
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
                loading={choices.loading || companies.loading || accounts.loading}
                error={choices.error || companies.error || accounts.error}
                retry={refresh}
            />

            {ready && !companies.data.length && (
                <Alert
                    severity="info"
                    sx={{ mb: 2 }}
                    action={canWrite && (
                        <Button
                            color="inherit"
                            onClick={() => setSetup(true)}
                        >
                            Add company
                        </Button>
                    )}
                >
                    Add your companies and their bank accounts to start recording expenses.
                </Alert>
            )}

            <Stack
                direction="row"
                useFlexGap
                flexWrap="wrap"
                spacing={2}
                sx={{ mb: 2 }}
            >
                <TextField
                    select
                    size="small"
                    label="Company"
                    value={company ? companyId : ""}
                    sx={{ minWidth: 230 }}
                    disabled={companies.loading || !!companies.error}
                    onChange={event => chooseCompany(event.target.value)}
                >
                    <MenuItem value="">
                        All companies
                    </MenuItem>

                    {(companies.data || []).map(row => (
                        <MenuItem
                            key={row.id}
                            value={String(row.id)}
                        >
                            {row.name}
                        </MenuItem>
                    ))}
                </TextField>

                <TextField
                    select
                    size="small"
                    label="Display currency"
                    value={currency}
                    disabled={choices.loading || !!choices.error}
                    sx={{ minWidth: 180 }}
                    onChange={event => {
                        setCurrency(event.target.value);
                        setPreference("currency", event.target.value);
                        setPage(1);
                    }}
                >
                    {currencies.map(row => (
                        <MenuItem
                            key={row.currencyCode}
                            value={row.currencyCode}
                        >
                            {row.currencyCode} · {row.currencyName}
                        </MenuItem>
                    ))}
                </TextField>
            </Stack>

            <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mb: 3 }}
            >
                {company?.name || "All companies"} · Showing amounts in {currency}, using saved rates or automatic historical rates.
            </Typography>

            {!choices.loading && !choices.error && !currencies.length && (
                <Alert
                    severity="warning"
                    sx={{ mb: 2 }}
                >
                    Add an active currency in Currency Master before setting up expenses.
                </Alert>
            )}

            {list.data?.missingRateCount > 0 && (
                <Alert
                    severity="warning"
                    sx={{ mb: 2 }}
                >
                    Automatic rates are unavailable for {list.data.missingRateCount} expense(s) in {currency}.
                    Affected totals are unavailable. Click Refresh to retry; original amounts are unchanged.
                </Alert>
            )}

            <Box className="expenses-summary">
                {[
                    ["Recorded", "recorded"],
                    ["Draft", "draft"],
                    ["Voided", "voided"],
                ].map(([label, key]) => (
                    <Card key={key}>
                        <CardContent>
                            <Typography color="text.secondary">
                                {label}
                            </Typography>

                            <Typography
                                variant="h5"
                                fontWeight={700}
                            >
                                {list.loading || list.error
                                    ? "—"
                                    : money(list.data?.[key], currency, precision)}
                            </Typography>
                        </CardContent>
                    </Card>
                ))}
            </Box>

            <Records
                {...list}
                rows={list.data?.data || []}
                total={list.data?.total || 0}
                page={page}
                setPage={setPage}
                search={search}
                setSearch={setSearch}
                refresh={refresh}
                extra={(
                    <Stack
                        direction="row"
                        useFlexGap
                        flexWrap="wrap"
                        spacing={2}
                    >
                        <TextField
                            select
                            size="small"
                            label="Status"
                            value={status}
                            sx={{ minWidth: 160 }}
                            onChange={event => {
                                setStatus(event.target.value);
                                setPage(1);
                            }}
                        >
                            <MenuItem value="">
                                All statuses
                            </MenuItem>

                            {["Draft", "Recorded", "Voided"].map(value => (
                                <MenuItem
                                    key={value}
                                    value={value}
                                >
                                    {value}
                                </MenuItem>
                            ))}
                        </TextField>

                        <TextField
                            size="small"
                            type="date"
                            label="From"
                            value={from}
                            slotProps={{
                                inputLabel: {
                                    shrink: true,
                                },
                            }}
                            onChange={event => {
                                setFrom(event.target.value);
                                setPage(1);
                            }}
                        />

                        <TextField
                            size="small"
                            type="date"
                            label="To"
                            value={to}
                            slotProps={{
                                inputLabel: {
                                    shrink: true,
                                },
                            }}
                            onChange={event => {
                                setTo(event.target.value);
                                setPage(1);
                            }}
                        />

                        <Button
                            onClick={() => {
                                setSearch("");
                                setStatus("");
                                setFrom("");
                                setTo("");
                                setPage(1);
                            }}
                        >
                            Clear filters
                        </Button>
                    </Stack>
                )}
                columns={[
                    {
                        label: "Expense",
                        render: row => "EXP-" + row.id,
                    },
                    {
                        label: "Date",
                        render: row => formatDate(row.date),
                    },
                    {
                        label: "Company",
                        render: row => row.companyName,
                    },
                    {
                        label: "Supplier",
                        render: row => row.supplier,
                    },
                    {
                        label: "Category",
                        render: row => row.category,
                    },
                    {
                        label: "Account",
                        render: row => row.bankAccountName || "Unpaid draft",
                    },
                    {
                        label: "Amount (" + currency + ")",
                        render: row => money(row.displayAmount, currency, precision),
                    },
                    {
                        label: "Status",
                        render: row => (
                            <Chip
                                size="small"
                                label={row.status}
                                color={row.status === "Recorded"
                                    ? "success"
                                    : row.status === "Draft"
                                        ? "warning"
                                        : "default"}
                            />
                        ),
                    },
                    {
                        label: "Actions",
                        render: row => (
                            <Stack direction="row">
                                <Button onClick={() => setDetail(row.id)}>
                                    View
                                </Button>

                                {canWrite && ready && row.status === "Draft" && (
                                    <Button onClick={() => setEdit(row)}>
                                        Edit
                                    </Button>
                                )}
                            </Stack>
                        ),
                    },
                ]}
            />

            {edit && (
                <ExpenseForm
                    expense={edit}
                    companies={companies.data || []}
                    accounts={accounts.data || []}
                    currencies={currencies}
                    displayCurrency={currency}
                    onClose={() => {
                        setEdit(null);
                        list.refresh();
                    }}
                    onSaved={saved}
                />
            )}

            {detail && (
                <ExpenseDetails
                    id={detail}
                    currency={currency}
                    canWrite={canWrite}
                    onClose={() => setDetail(null)}
                    onChanged={() => list.refresh()}
                    onEdit={row => {
                        setDetail(null);
                        setEdit(row);
                    }}
                />
            )}

            {setup && (
                <ExpenseSetup
                    countries={choices.data?.countries || []}
                    currencies={currencies}
                    companies={companies.data || []}
                    accounts={accounts.data || []}
                    companyId={companyId}
                    onClose={() => setSetup(false)}
                    onSaved={row => {
                        refresh();

                        if (row.country) {
                            chooseCompany(row.id);
                        }

                        setNotice(
                            row.country
                                ? "Company added. You can now add its accounts in Setup."
                                : "Bank account added."
                        );

                        setSetup(false);
                    }}
                />
            )}
        </Page>
    );
}

export default Expenses;
