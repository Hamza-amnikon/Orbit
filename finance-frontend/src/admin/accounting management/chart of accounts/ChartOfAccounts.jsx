import {
    useEffect,
    useState,
} from "react";

import {
    Alert,
    Button,
    Chip,
    MenuItem,
    Paper,
    Stack,
    TextField,
    ToggleButton,
    ToggleButtonGroup,
    Typography,
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

import AccountForm from "./AccountForm";
import AccountDetails from "./AccountDetails";
import AccountTree from "./AccountTree";

import {
    getAccountTree,
    getAccountingCompanies,
    getAccounts,
} from "./ChartOfAccountsService";

import "./ChartOfAccounts.css";

const accountTypes = [
    "Asset",
    "Liability",
    "Equity",
    "Income",
    "Expense",
];

function ChartOfAccounts() {
    const { canWrite } = useAuth();

    const [companyId, setCompanyId] =
        useState("");

    const [search, setSearch] =
        useState("");

    const [type, setType] =
        useState("");

    const [active, setActive] =
        useState("");

    const [usage, setUsage] =
        useState("");

    const [page, setPage] =
        useState(1);

    const [view, setView] =
        useState("tree");

    const [edit, setEdit] =
        useState(null);

    const [details, setDetails] =
        useState(null);

    const [notice, setNotice] =
        useState("");

    const choices = useLoad(
        signal =>
            getAccountingCompanies(signal),
        []
    );

    const companies = choices.data || [];

    useEffect(() => {
        if (
            !companyId &&
            companies.length
        ) {
            setCompanyId(
                String(companies[0].id)
            );
        }
    }, [companyId, companies]);

    const list = useLoad(
        signal => {
            if (!companyId) {
                return {
                    data: [],
                    total: 0,
                    page,
                    pageSize: 25,
                };
            }

            return getAccounts(
                {
                    companyId,
                    page,
                    pageSize: 25,
                    search,
                    type,
                    isActive: active,
                    isPostingAccount: usage,
                },
                signal
            );
        },
        [
            companyId,
            page,
            search,
            type,
            active,
            usage,
        ],
        {
            keepPreviousData: true,
        }
    );

    const tree = useLoad(
        signal => {
            if (!companyId) {
                return [];
            }

            return getAccountTree(
                companyId,
                signal
            );
        },
        [companyId]
    );

    const ready =
        !choices.loading &&
        !choices.error &&
        !tree.loading &&
        !tree.error;

    function refresh() {
        choices.refresh();
        list.refresh();
        tree.refresh();
    }

    function clearFilters() {
        setSearch("");
        setType("");
        setActive("");
        setUsage("");
        setPage(1);
    }

    function saved(account) {
        setEdit(null);

        setNotice(
            account.code +
            " · " +
            account.name +
            " saved."
        );

        list.refresh();
        tree.refresh();
    }

    return (
        <Page
            title="Chart of Accounts"
            subtitle={
                "Manage account groups and posting " +
                "accounts separately for each company"
            }
            action={
                canWrite && (
                    <Button
                        variant="contained"
                        startIcon={
                            <AddRoundedIcon />
                        }
                        disabled={
                            !ready ||
                            !companyId
                        }
                        onClick={() => {
                            setNotice("");

                            setEdit({
                                companyId:
                                    Number(
                                        companyId
                                    ),
                                type: "Asset",
                                normalBalance:
                                    "Debit",
                                isPostingAccount:
                                    true,
                                isActive: true,
                            });
                        }}
                    >
                        New Account
                    </Button>
                )
            }
        >
            {notice && (
                <Alert
                    severity="success"
                    sx={{ mb: 2 }}
                    onClose={() =>
                        setNotice("")
                    }
                >
                    {notice}
                </Alert>
            )}

            <Alert
                severity="info"
                sx={{ mb: 2 }}
            >
                Group accounts organize the
                financial statements. Only posting
                accounts can receive journal entries.
            </Alert>

            <Feedback
                loading={choices.loading}
                error={choices.error}
                retry={refresh}
            />

            <Feedback
                loading={
                    Boolean(companyId) &&
                    tree.loading
                }
                error={tree.error}
                retry={refresh}
            />

            {!choices.loading &&
             !choices.error &&
             !companies.length && (
                <Alert
                    severity="warning"
                    sx={{ mb: 2 }}
                >
                    No companies are available.
                    Add a company before creating
                    the Chart of Accounts.
                </Alert>
            )}

            {view === "tree" ? (
                <Paper
                    variant="outlined"
                    className="chart-tree-card"
                >
                    <Stack
                        direction="row"
                        useFlexGap
                        spacing={2}
                        alignItems="center"
                        sx={{
                            flexWrap: "wrap",
                            mb: 2,
                        }}
                    >
                        <TextField
                            select
                            size="small"
                            label="Company"
                            value={companyId}
                            disabled={choices.loading}
                            sx={{ minWidth: 240 }}
                            onChange={event => {
                                setCompanyId(
                                    event.target.value
                                );
                                setPage(1);
                            }}
                        >
                            {companies.map(company => (
                                <MenuItem
                                    key={company.id}
                                    value={String(
                                        company.id
                                    )}
                                >
                                    {company.name}
                                    {" · "}
                                    {company.currency}
                                </MenuItem>
                            ))}
                        </TextField>

                        <ToggleButtonGroup
                            size="small"
                            exclusive
                            value={view}
                            onChange={(
                                event,
                                nextView
                            ) => {
                                if (nextView) {
                                    setView(nextView);
                                }
                            }}
                            aria-label="Account view"
                        >
                            <ToggleButton value="tree">
                                Tree view
                            </ToggleButton>

                            <ToggleButton value="table">
                                Table view
                            </ToggleButton>
                        </ToggleButtonGroup>

                        <Button
                            sx={{ ml: "auto" }}
                            onClick={refresh}
                        >
                            Refresh
                        </Button>
                    </Stack>

                    {!tree.loading &&
                     !tree.error && (
                        <AccountTree
                            accounts={tree.data || []}
                            canWrite={canWrite}
                            disabled={!ready}
                            onView={account =>
                                setDetails(account)
                            }
                            onEdit={account => {
                                setNotice("");
                                setEdit(account);
                            }}
                        />
                    )}
                </Paper>
            ) : (
            <Records
                rows={
                    list.data?.data || []
                }
                total={
                    list.data?.total || 0
                }
                page={
                    list.data?.page || page
                }
                setPage={setPage}
                search={search}
                setSearch={setSearch}
                loading={list.loading}
                error={list.error}
                refresh={refresh}
                extra={
                    <Stack
                        direction="row"
                        useFlexGap
                        spacing={2}
                        sx={{
                            flexWrap: "wrap",
                        }}
                    >
                        <TextField
                            select
                            size="small"
                            label="Company"
                            value={companyId}
                            disabled={
                                choices.loading
                            }
                            sx={{
                                minWidth: 240,
                            }}
                            onChange={event => {
                                setCompanyId(
                                    event.target.value
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
                                        {company.name}
                                        {" · "}
                                        {company.currency}
                                    </MenuItem>
                                )
                            )}
                        </TextField>

                        <TextField
                            select
                            size="small"
                            label="Account type"
                            value={type}
                            sx={{
                                minWidth: 170,
                            }}
                            onChange={event => {
                                setType(
                                    event.target.value
                                );
                                setPage(1);
                            }}
                        >
                            <MenuItem value="">
                                All types
                            </MenuItem>

                            {accountTypes.map(
                                accountType => (
                                    <MenuItem
                                        key={
                                            accountType
                                        }
                                        value={
                                            accountType
                                        }
                                    >
                                        {accountType}
                                    </MenuItem>
                                )
                            )}
                        </TextField>

                        <TextField
                            select
                            size="small"
                            label="Usage"
                            value={usage}
                            sx={{
                                minWidth: 170,
                            }}
                            onChange={event => {
                                setUsage(
                                    event.target.value
                                );
                                setPage(1);
                            }}
                        >
                            <MenuItem value="">
                                All accounts
                            </MenuItem>

                            <MenuItem value="false">
                                Group accounts
                            </MenuItem>

                            <MenuItem value="true">
                                Posting accounts
                            </MenuItem>
                        </TextField>

                        <TextField
                            select
                            size="small"
                            label="Status"
                            value={active}
                            sx={{
                                minWidth: 150,
                            }}
                            onChange={event => {
                                setActive(
                                    event.target.value
                                );
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

                        <Button
                            onClick={clearFilters}
                        >
                            Clear filters
                        </Button>

                        <ToggleButtonGroup
                            size="small"
                            exclusive
                            value={view}
                            onChange={(
                                event,
                                nextView
                            ) => {
                                if (nextView) {
                                    setView(nextView);
                                }
                            }}
                            aria-label="Account view"
                        >
                            <ToggleButton value="tree">
                                Tree view
                            </ToggleButton>

                            <ToggleButton value="table">
                                Table view
                            </ToggleButton>
                        </ToggleButtonGroup>
                    </Stack>
                }
                columns={[
                    {
                        label: "Code",
                        render: account => (
                            <Typography
                                component="span"
                                fontFamily="monospace"
                                fontWeight={700}
                            >
                                {account.code}
                            </Typography>
                        ),
                    },
                    {
                        label: "Account name",
                        render: account =>
                            account.name,
                    },
                    {
                        label: "Type",
                        render: account => (
                            <Chip
                                size="small"
                                variant="outlined"
                                label={
                                    account.type
                                }
                            />
                        ),
                    },
                    {
                        label: "Parent",
                        render: account =>
                            account.parentAccountCode
                                ? account.parentAccountCode +
                                  " · " +
                                  account.parentAccountName
                                : "Top level",
                    },
                    {
                        label: "Normal balance",
                        render: account =>
                            account.normalBalance,
                    },
                    {
                        label: "Usage",
                        render: account => (
                            <Chip
                                size="small"
                                label={
                                    account.isPostingAccount
                                        ? "Posting"
                                        : "Group"
                                }
                                color={
                                    account.isPostingAccount
                                        ? "primary"
                                        : "default"
                                }
                            />
                        ),
                    },
                    {
                        label: "Status",
                        render: account => (
                            <Chip
                                size="small"
                                label={
                                    account.isActive
                                        ? "Active"
                                        : "Inactive"
                                }
                                color={
                                    account.isActive
                                        ? "success"
                                        : "default"
                                }
                            />
                        ),
                    },
                    {
                        label: "Actions",
                        render: account => (
                            <Stack
                                direction="row"
                                spacing={0.5}
                            >
                                <Button
                                    disabled={!ready}
                                    onClick={() =>
                                        setDetails(account)
                                    }
                                >
                                    View
                                </Button>

                                {canWrite &&
                                 !account.isSystemAccount &&
                                 !account.isControlAccount && (
                                    <Button
                                        disabled={!ready}
                                        onClick={() => {
                                            setNotice("");
                                            setEdit(account);
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
            )}

            {edit && (
                <AccountForm
                    account={edit}
                    companies={companies}
                    parentAccounts={
                        (tree.data || []).filter(
                            account =>
                                account.isActive &&
                                !account.isPostingAccount
                        )
                    }
                    onClose={() =>
                        setEdit(null)
                    }
                    onSaved={saved}
                />
            )}

            {details && (
                <AccountDetails
                    account={details}
                    onClose={() =>
                        setDetails(null)
                    }
                    onEdit={
                        canWrite &&
                        !details.isSystemAccount &&
                        !details.isControlAccount
                            ? () => {
                                setDetails(null);
                                setNotice("");
                                setEdit(details);
                            }
                            : undefined
                    }
                />
            )}
        </Page>
    );
}

export default ChartOfAccounts;
