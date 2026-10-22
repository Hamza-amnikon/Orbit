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
import {
    Feedback,
    Page,
    Records,
} from "../../../live/shared";
import { getBankAccounts } from "../bank accounts/BankAccountService";
import { getReconciliations } from "./ReconciliationService";
import {
    formatAmount,
    formatDate,
} from "./reconciliationFormat";
import ReconciliationForm from "./ReconciliationForm";
import ReconciliationDetails from "./ReconciliationDetails";

import "./BankReconciliation.css";

async function loadAccounts(signal) {
    const accounts = new Map();
    let page = 1;

    while (true) {
        const result = await getBankAccounts({ page, pageSize: 100 }, signal);

        if (!Array.isArray(result?.data) || !Number.isInteger(result.total)) {
            throw new Error("Invalid bank account response.");
        }

        const previousSize = accounts.size;

        for (const account of result.data) {
            accounts.set(account.id, account);
        }

        if (accounts.size >= result.total) {
            return Array.from(accounts.values());
        }

        if (!result.data.length || previousSize === accounts.size) {
            throw new Error("The account list changed while loading. Refresh and try again.");
        }

        page += 1;
    }
}

function ReconciliationPage() {
    const { canWrite } = useAuth();
    const [search, setSearch] = useState("");
    const [bankAccountId, setBankAccountId] = useState("");
    const [status, setStatus] = useState("");
    const [page, setPage] = useState(1);
    const [creating, setCreating] = useState(false);
    const [detailId, setDetailId] = useState(null);
    const [notice, setNotice] = useState("");

    const choices = useLoad(loadAccounts, []);
    const accounts = choices.data || [];
    const ready = !choices.loading && !choices.error;

    const list = useLoad(
        signal => getReconciliations({
            page,
            pageSize: 25,
            search,
            bankAccountId,
            status,
        }, signal),
        [page, search, bankAccountId, status]
    );

    function refresh() {
        list.refresh();
        choices.refresh();
    }

    function saved(reconciliation) {
        setCreating(false);
        setNotice("Statement imported. Match its entries to the Finance transactions.");
        setDetailId(reconciliation.id);
        list.refresh();
    }

    return (
        <Page
            title="Bank Reconciliation"
            subtitle="Compare bank statements with posted Finance transactions"
            action={canWrite && (
                <Button
                    variant="contained"
                    startIcon={<AddRoundedIcon />}
                    disabled={!ready || !accounts.some(account => account.openingBalanceDate)}
                    onClick={() => {
                        setNotice("");
                        setCreating(true);
                    }}
                >
                    New Reconciliation
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
                            label="Bank account"
                            value={bankAccountId}
                            disabled={!ready}
                            sx={{ minWidth: 260 }}
                            onChange={event => {
                                setBankAccountId(event.target.value);
                                setPage(1);
                            }}
                        >
                            <MenuItem
                                value=""
                            >
                                All accounts
                            </MenuItem>
                            {accounts.map(account => (
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
                            label="Status"
                            value={status}
                            sx={{ minWidth: 180 }}
                            onChange={event => {
                                setStatus(event.target.value);
                                setPage(1);
                            }}
                        >
                            <MenuItem
                                value=""
                            >
                                All statuses
                            </MenuItem>
                            <MenuItem
                                value="Draft"
                            >
                                Draft
                            </MenuItem>
                            <MenuItem
                                value="Completed"
                            >
                                Completed
                            </MenuItem>
                        </TextField>

                        <Button onClick={() => {
                            setSearch("");
                            setBankAccountId("");
                            setStatus("");
                            setPage(1);
                        }}>
                            Clear filters
                        </Button>
                    </Stack>
                )}
                columns={[
                    {
                        label: "Reconciliation",
                        render: row => "Reconciliation " + row.id,
                    },
                    {
                        label: "Account",
                        render: row => row.bankAccountName,
                    },
                    {
                        label: "Company",
                        render: row => row.companyName,
                    },
                    {
                        label: "From",
                        render: row => formatDate(row.periodStart),
                    },
                    {
                        label: "To",
                        render: row => formatDate(row.periodEnd),
                    },
                    {
                        label: "Statement closing balance",
                        render: row => formatAmount(row.statementClosingBalance, row.currency, row.currencyDecimalPlaces),
                    },
                    {
                        label: "Status",
                        render: row => (
                            <Chip
                                size="small"
                                label={row.status}
                                color={row.status === "Completed" ? "success" : "warning"}
                            />
                        ),
                    },
                    {
                        label: "Actions",
                        render: row => (
                            <Button
                                onClick={() => setDetailId(row.id)}
                            >
                                View / Match
                            </Button>
                        ),
                    },
                ]}
            />

            {creating && (
                <ReconciliationForm
                    accounts={accounts}
                    onClose={() => setCreating(false)}
                    onSaved={saved}
                />
            )}

            {detailId !== null && (
                <ReconciliationDetails
                    key={detailId}
                    id={detailId}
                    canWrite={canWrite}
                    onClose={() => setDetailId(null)}
                    onChanged={() => list.refresh()}
                />
            )}
        </Page>
    );
}

export default ReconciliationPage;
