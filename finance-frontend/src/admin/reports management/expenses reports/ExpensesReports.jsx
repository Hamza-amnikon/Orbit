import { useState } from "react";

import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    MenuItem,
    Stack,
    Tab,
    Tabs,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Typography
} from "@mui/material";

import { Page, Records } from "../../../live/shared";

import {
    money,
    today,
    useLoad
} from "../../../live/data";

import {
    getExpenseReport,
    getExpenseReportSetup,
    summarizeExpenses,
    groupExpenses,
    exportExpenseReport
} from "./ExpenseReportService";

import "./ExpensesReports.css";

export default function ExpensesReports()
{
    const [from, setFrom] = useState(`${today().slice(0, 7)}-01`);
    const [to, setTo] = useState(today());
    const [branch, setBranch] = useState("");
    const [supplier, setSupplier] = useState("");
    const [category, setCategory] = useState("");
    const [currencyOverride, setCurrency] = useState("");
    const [type, setType] = useState("");
    const [status, setStatus] = useState("");
    const [tab, setTab] = useState(0);
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);

    const setup = useLoad(getExpenseReportSetup, []);

    const savedBranches = setup.data?.branches || [];

    const selectedBranch = savedBranches.find(
        row => row.name === branch
    );

    const currency =
        currencyOverride ||
        selectedBranch?.currency ||
        setup.data?.defaultCurrency ||
        "";

    const report = useLoad(
        signal => currency
            ? getExpenseReport(from, to, currency, signal)
            : null,
        [from, to, currency]
    );

    const all = report.data?.rows || [];

    const branches = [
        ...new Set([
            ...savedBranches.map(row => row.name),
            ...all.map(row => row.branch)
        ])
    ].sort();

    const suppliers = [
        ...new Map(
            all.map(row => [
                row.partyKey,
                row.partyName || "Unnamed supplier"
            ])
        ).entries()
    ].sort((a, b) => a[1].localeCompare(b[1]));

    const categories = [
        ...new Set(all.map(row => row.category))
    ].sort();

    const rows = all.filter(row =>
        (!branch || row.branch === branch) &&
        (!supplier || row.partyKey === supplier) &&
        (!category || row.category === category)
    );

    const summary = summarizeExpenses(rows);
    const grouped = groupExpenses(rows, tab);

    const filtered = rows.filter(row =>
        (!type || row.type === type) &&
        (!status || row.status === status) &&
        `${row.number} ${row.partyName} ${row.category}`
            .toLowerCase()
            .includes(search.toLowerCase())
    );

    const change = setter => event =>
    {
        setter(event.target.value);
        setPage(1);
    };

    const metrics = [
        ["Bills before tax", summary.bills],
        ["Expenses and approved claims", summary.expenses],
        ["Vendor credits before tax", summary.credits],
        ["Net costs before tax", summary.net],
        ["Net document tax", summary.tax],
        ["Net costs including tax", summary.total],
        ["Payments in period", summary.paid],
        ["Outstanding on period bills", summary.balance],
        ["Overdue on period bills", summary.overdue],
        ["Unpaid claims approved in period", summary.claimBalance || 0]
    ];

    return (
        <Page
            title="Expense Reports"
            subtitle={`Bills, vendor credits and recorded expenses · amounts in ${currency}`}
            action={
                <Button
                    variant="outlined"
                    disabled={
                        report.loading ||
                        !!report.error ||
                        !rows.length
                    }
                    onClick={() =>
                        exportExpenseReport(
                            filtered,
                            summary,
                            report.data.rates,
                            from,
                            to,
                            currency
                        )
                    }
                >
                    Export CSV
                </Button>
            }
        >
            <Stack
                direction="row"
                sx={{ gap: 2, mb: 3, flexWrap: "wrap" }}
            >
                <TextField
                    label="From"
                    type="date"
                    value={from}
                    onChange={change(setFrom)}
                    slotProps={{
                        inputLabel: {
                            shrink: true
                        }
                    }}
                />

                <TextField
                    label="To"
                    type="date"
                    value={to}
                    onChange={change(setTo)}
                    slotProps={{
                        inputLabel: {
                            shrink: true
                        }
                    }}
                />

                <TextField
                    select
                    label="Branch"
                    value={branch}
                    sx={{ minWidth: 160 }}
                    onChange={event =>
                    {
                        setBranch(event.target.value);
                        setCurrency("");
                        setPage(1);
                    }}
                >
                    <MenuItem value="">
                        All branches
                    </MenuItem>

                    {branches.map(value => (
                        <MenuItem key={value} value={value}>
                            {value}
                        </MenuItem>
                    ))}
                </TextField>

                <TextField
                    select
                    label="Supplier"
                    value={supplier}
                    onChange={change(setSupplier)}
                    sx={{ minWidth: 200 }}
                >
                    <MenuItem value="">
                        All suppliers
                    </MenuItem>

                    {suppliers.map(([id, name]) => (
                        <MenuItem key={id} value={id}>
                            {name}
                        </MenuItem>
                    ))}
                </TextField>

                <TextField
                    select
                    label="Category"
                    value={category}
                    onChange={change(setCategory)}
                    sx={{ minWidth: 200 }}
                >
                    <MenuItem value="">
                        All categories
                    </MenuItem>

                    {categories.map(value => (
                        <MenuItem key={value} value={value}>
                            {value}
                        </MenuItem>
                    ))}
                </TextField>

                <TextField
                    select
                    label="Reporting currency"
                    value={currency}
                    onChange={change(setCurrency)}
                    sx={{ minWidth: 180 }}
                >
                    {(setup.data?.currencies || []).map(value => (
                        <MenuItem key={value} value={value}>
                            {value}
                        </MenuItem>
                    ))}
                </TextField>

                <Button
                    onClick={report.refresh}
                    disabled={report.loading}
                >
                    Refresh
                </Button>
            </Stack>

            <Alert severity="info" sx={{ mb: 2 }}>
                Includes issued bills and vendor credits, plus recorded
                standalone expenses. Bill payments settle bills and are not
                counted again as costs.
                Outstanding and overdue cover bills dated in the period,
                as of {to}. Payments include older bills paid in the period.
                Recorded expenses have no separate tax or payment allocation,
                so their full amount is shown as cost and excluded from
                bill-payment totals.
                Claims enter costs on their approval date; reimbursements
                enter payments on their paid date without adding cost again.
                Bills use an uncategorized group. Search, type and status
                filter details only.
            </Alert>

            {setup.loading && (
                <Typography role="status" sx={{ mb: 2 }}>
                    Loading branch and currency settings…
                </Typography>
            )}

            {setup.error && (
                <Alert
                    severity="error"
                    action={
                        <Button onClick={setup.refresh}>
                            Retry
                        </Button>
                    }
                >
                    {setup.error}
                </Alert>
            )}

            {!report.loading && !report.error && currency && (
                <>
                    {report.data?.rates.some(rate => rate.fallback) && (
                        <Alert severity="warning" sx={{ mb: 2 }}>
                            The requested rate is unavailable. Previously
                            saved reference rates are used with the dates below.
                        </Alert>
                    )}

                    {report.data?.rates.map(rate => (
                        <Typography
                            key={rate.base}
                            color="text.secondary"
                            variant="body2"
                            sx={{ mb: 1 }}
                        >
                            1 {rate.base} = {rate.rate} {rate.quote}
                            {" · "}Rate date: {rate.date}
                            {" · "}{rate.source}
                        </Typography>
                    ))}

                    {rows.some(row => row.branch === "Unassigned") && (
                        <Alert severity="warning" sx={{ mb: 2 }}>
                            Some expense companies could not be matched
                            uniquely to a saved branch. Their costs appear
                            under Unassigned.
                        </Alert>
                    )}

                    <Box className="admin-summary-grid">
                        {metrics.map(([label, value]) => (
                            <Card key={label}>
                                <CardContent>
                                    <Typography color="text.secondary">
                                        {label}
                                    </Typography>

                                    <Typography className="admin-summary-value">
                                        {money(value, currency)}
                                    </Typography>
                                </CardContent>
                            </Card>
                        ))}
                    </Box>

                    <Tabs
                        value={tab}
                        onChange={(_, value) => setTab(value)}
                        variant="scrollable"
                        scrollButtons="auto"
                        sx={{ mb: 2 }}
                    >
                        {[
                            "Monthly costs",
                            "Categories",
                            "Suppliers",
                            "Branches"
                        ].map(label => (
                            <Tab key={label} label={label} />
                        ))}
                    </Tabs>

                    <Card sx={{ mb: 3 }}>
                        <CardContent>
                            <TableContainer>
                                <Table size="small">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>
                                                Group
                                            </TableCell>

                                            <TableCell>
                                                Net costs ({currency})
                                            </TableCell>

                                            {tab === 0 && (
                                                <TableCell>
                                                    Trend
                                                </TableCell>
                                            )}
                                        </TableRow>
                                    </TableHead>

                                    <TableBody>
                                        {grouped.map(row => (
                                            <TableRow key={row.key}>
                                                <TableCell>
                                                    {row.label}
                                                </TableCell>

                                                <TableCell>
                                                    {money(row.net, currency)}
                                                </TableCell>

                                                {tab === 0 && (
                                                    <TableCell
                                                        sx={{ minWidth: 160 }}
                                                    >
                                                        <Box
                                                            role="img"
                                                            aria-label={`${row.label}: ${money(row.net, currency)}`}
                                                            sx={{
                                                                height: 12,
                                                                borderRadius: 1,
                                                                width: `${Math.max(
                                                                    1,
                                                                    Math.abs(row.net) /
                                                                    Math.max(
                                                                        1,
                                                                        ...grouped.map(
                                                                            row => Math.abs(row.net)
                                                                        )
                                                                    ) * 100
                                                                )}%`,
                                                                bgcolor: row.net < 0
                                                                    ? "error.main"
                                                                    : "primary.main"
                                                            }}
                                                        />
                                                    </TableCell>
                                                )}
                                            </TableRow>
                                        ))}

                                        {!grouped.length && (
                                            <TableRow>
                                                <TableCell colSpan={3}>
                                                    No costs match these filters.
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </CardContent>
                    </Card>
                </>
            )}

            <Records
                {...report}
                rows={filtered.slice((page - 1) * 25, page * 25)}
                total={filtered.length}
                page={page}
                setPage={setPage}
                search={search}
                setSearch={setSearch}
                extra={
                    <Stack
                        direction="row"
                        sx={{ gap: 2, flexWrap: "wrap" }}
                    >
                        <TextField
                            select
                            label="Type"
                            size="small"
                            value={type}
                            onChange={change(setType)}
                            sx={{ minWidth: 170 }}
                        >
                            <MenuItem value="">
                                All types
                            </MenuItem>

                            {[
                                "Bill",
                                "VendorCredit",
                                "Expense",
                                "Payment",
                                "Claim",
                                "ClaimPayment"
                            ].map(value => (
                                <MenuItem key={value} value={value}>
                                    {value}
                                </MenuItem>
                            ))}
                        </TextField>

                        <TextField
                            select
                            label="Status"
                            size="small"
                            value={status}
                            onChange={change(setStatus)}
                            sx={{ minWidth: 180 }}
                        >
                            <MenuItem value="">
                                All statuses
                            </MenuItem>

                            {[
                                "Unpaid",
                                "Partially Settled",
                                "Settled",
                                "Recorded",
                                "Issued",
                                "Approved",
                                "Paid"
                            ].map(value => (
                                <MenuItem key={value} value={value}>
                                    {value}
                                </MenuItem>
                            ))}
                        </TextField>
                    </Stack>
                }
                columns={[
                    {
                        label: "Document",
                        render: row => row.number
                    },
                    {
                        label: "Type",
                        render: row => row.type
                    },
                    {
                        label: "Supplier",
                        render: row => row.partyName || "—"
                    },
                    {
                        label: "Branch",
                        render: row => row.branch
                    },
                    {
                        label: "Category",
                        render: row => row.category
                    },
                    {
                        label: "Date",
                        render: row => row.date
                    },
                    {
                        label: "Due",
                        render: row => row.dueDate || "—"
                    },
                    {
                        label: "Net cost",
                        render: row =>
                            ["Payment", "ClaimPayment"].includes(row.type)
                                ? "—"
                                : money(row.net, currency)
                    },
                    {
                        label: "Tax",
                        render: row =>
                            ["Payment", "ClaimPayment"].includes(row.type)
                                ? "—"
                                : money(row.tax, currency)
                    },
                    {
                        label: "Total / payment",
                        render: row => money(row.total, currency)
                    },
                    {
                        label: "Outstanding",
                        render: row =>
                            ["Bill", "Claim"].includes(row.type)
                                ? money(row.balance, currency)
                                : "—"
                    },
                    {
                        label: "Status",
                        render: row => row.status
                    }
                ]}
            />
        </Page>
    );
}