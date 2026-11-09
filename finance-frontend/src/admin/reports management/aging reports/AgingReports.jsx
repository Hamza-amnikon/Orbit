import { useState } from "react";
import { Link } from "react-router-dom";

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

import {
    Page,
    Records,
    Feedback
} from "../../../live/shared";

import {
    money,
    today,
    useLoad
} from "../../../live/data";

import { getExpenseReportSetup } from "../expenses reports/ExpenseReportService";

import {
    agingBuckets,
    getAgingReport,
    agingSummary,
    agingParties,
    exportAgingReport
} from "./AgingReportService";

import "../../shared/AdminModules.css";

export default function AgingReports()
{
    const [asOf, setAsOf] = useState(today());
    const [kind, setKind] = useState("Receivable");
    const [branch, setBranch] = useState("");
    const [party, setParty] = useState("");
    const [bucket, setBucket] = useState("");
    const [override, setCurrency] = useState("");
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);

    const setup = useLoad(getExpenseReportSetup, []);

    const currency =
        override ||
        setup.data?.branches.find(
            row => row.name === branch
        )?.currency ||
        setup.data?.defaultCurrency ||
        "";

    const report = useLoad(
        signal => currency
            ? getAgingReport(asOf, currency, signal)
            : null,
        [asOf, currency]
    );

    const all = report.data?.rows || [];

    const branchNames = [
        ...new Set([
            ...(setup.data?.branches || []).map(row => row.name),
            ...all.map(row => row.branch)
        ])
    ].sort();

    const scoped = all.filter(row =>
        row.kind === kind &&
        (!branch || row.branch === branch)
    );

    const parties = [
        ...new Map(
            scoped.map(row => [
                row.partyId,
                row.partyName
            ])
        ).entries()
    ].sort((a, b) => a[1].localeCompare(b[1]));

    const rows = scoped.filter(row =>
        (!party || row.partyId === party) &&
        (!bucket || row.bucket === bucket) &&
        `${row.number} ${row.partyName}`
            .toLowerCase()
            .includes(search.toLowerCase())
    );

    const summary = agingSummary(rows);
    const groups = agingParties(rows);

    const total = rows.reduce(
        (sum, row) => sum + row.balance,
        0
    );

    const change = setter => event =>
    {
        setter(event.target.value);
        setPage(1);
    };

    return (
        <Page
            title="Receivables & Payables Aging"
            subtitle={
                currency
                    ? `Outstanding invoice and bill balances as of ${asOf} · ${currency}`
                    : "Loading saved branch and currency settings"
            }
            action={
                <Button
                    variant="outlined"
                    disabled={
                        report.loading ||
                        !!report.error ||
                        !rows.length
                    }
                    onClick={() =>
                        exportAgingReport(
                            rows,
                            report.data.rates,
                            asOf,
                            currency,
                            kind
                        )
                    }
                >
                    Export CSV
                </Button>
            }
        >
            <Tabs
                value={kind}
                onChange={(_, value) =>
                {
                    setKind(value);
                    setParty("");
                    setPage(1);
                }}
                sx={{ mb: 3 }}
            >
                <Tab
                    value="Receivable"
                    label="Receivables · customers"
                />

                <Tab
                    value="Payable"
                    label="Payables · vendors"
                />
            </Tabs>

            <Stack
                direction="row"
                sx={{ gap: 2, mb: 3, flexWrap: "wrap" }}
            >
                <TextField
                    label="As of"
                    type="date"
                    value={asOf}
                    onChange={change(setAsOf)}
                    slotProps={{
                        inputLabel: {
                            shrink: true
                        },
                        htmlInput: {
                            max: today()
                        }
                    }}
                />

                <TextField
                    select
                    label="Branch"
                    value={branch}
                    sx={{ minWidth: 170 }}
                    onChange={event =>
                    {
                        setBranch(event.target.value);
                        setCurrency("");
                        setParty("");
                        setPage(1);
                    }}
                >
                    <MenuItem value="">
                        All branches
                    </MenuItem>

                    {branchNames.map(value => (
                        <MenuItem key={value} value={value}>
                            {value}
                        </MenuItem>
                    ))}
                </TextField>

                <TextField
                    select
                    label={kind === "Receivable" ? "Customer" : "Vendor"}
                    value={party}
                    onChange={change(setParty)}
                    sx={{ minWidth: 220 }}
                >
                    <MenuItem value="">
                        All
                    </MenuItem>

                    {parties.map(([id, name]) => (
                        <MenuItem key={id} value={id}>
                            {name}
                        </MenuItem>
                    ))}
                </TextField>

                <TextField
                    select
                    label="Aging bucket"
                    value={bucket}
                    onChange={change(setBucket)}
                    sx={{ minWidth: 180 }}
                >
                    <MenuItem value="">
                        All buckets
                    </MenuItem>

                    {agingBuckets.map(value => (
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
                    disabled={report.loading}
                    onClick={report.refresh}
                >
                    Refresh
                </Button>
            </Stack>

            <Alert severity="info" sx={{ mb: 2 }}>
                Includes all currently issued invoices or bills dated on or
                before the cutoff, less payments and applied credits through
                that date. Due today is not overdue.
                Bills without a due date appear separately. Unallocated
                customer/vendor credits and employee claims are excluded.
                Historical results use current document/payment statuses,
                so later voids are not reconstructed. Credit transfers use
                UTC dates. All filters and search apply to totals and export.
            </Alert>

            <Feedback
                loading={setup.loading}
                error={setup.error}
                retry={setup.refresh}
            />

            {!report.loading && !report.error && currency && (
                <>
                    {report.data?.rates.some(rate => rate.fallback) && (
                        <Alert severity="warning" sx={{ mb: 2 }}>
                            Previously saved reference rates are used because
                            the requested rates are unavailable.
                        </Alert>
                    )}

                    {report.data?.rates.map(rate => (
                        <Typography
                            key={rate.base}
                            variant="body2"
                            color="text.secondary"
                            sx={{ mb: 1 }}
                        >
                            1 {rate.base} = {rate.rate} {rate.quote}
                            {" · "}Rate date: {rate.date}
                            {" · "}{rate.source}
                        </Typography>
                    ))}

                    <Box className="admin-summary-grid">
                        {[
                            {
                                bucket: "Total outstanding",
                                balance: total
                            },
                            ...summary
                        ].map(row => (
                            <Card key={row.bucket}>
                                <CardContent>
                                    <Typography color="text.secondary">
                                        {row.bucket}
                                    </Typography>

                                    <Typography className="admin-summary-value">
                                        {money(row.balance, currency)}
                                    </Typography>
                                </CardContent>
                            </Card>
                        ))}
                    </Box>

                    <Card sx={{ mb: 3 }}>
                        <CardContent>
                            <Typography variant="h6" sx={{ mb: 2 }}>
                                {kind === "Receivable" ? "Customer" : "Vendor"} summary
                            </Typography>

                            <TableContainer>
                                <Table size="small">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>
                                                Name
                                            </TableCell>

                                            {agingBuckets.map(value => (
                                                <TableCell
                                                    key={value}
                                                    align="right"
                                                >
                                                    {value}
                                                </TableCell>
                                            ))}

                                            <TableCell align="right">
                                                Total
                                            </TableCell>
                                        </TableRow>
                                    </TableHead>

                                    <TableBody>
                                        {groups.map(row => (
                                            <TableRow key={row.key}>
                                                <TableCell>
                                                    {row.name}
                                                </TableCell>

                                                {agingBuckets.map(value => (
                                                    <TableCell
                                                        key={value}
                                                        align="right"
                                                    >
                                                        {money(
                                                            row.buckets[value],
                                                            currency
                                                        )}
                                                    </TableCell>
                                                ))}

                                                <TableCell align="right">
                                                    {money(row.total, currency)}
                                                </TableCell>
                                            </TableRow>
                                        ))}

                                        {!groups.length && (
                                            <TableRow>
                                                <TableCell colSpan={8}>
                                                    No outstanding balances
                                                    match these filters.
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
                rows={rows.slice((page - 1) * 25, page * 25)}
                total={rows.length}
                page={page}
                setPage={setPage}
                search={search}
                setSearch={setSearch}
                columns={[
                    {
                        label: "Document",
                        render: row => (
                            <Button
                                component={Link}
                                to={
                                    row.kind === "Receivable"
                                        ? `/sales/invoices?invoiceId=${row.documentId}`
                                        : `/purchases/bills/${row.documentId}`
                                }
                            >
                                {row.number}
                            </Button>
                        )
                    },
                    {
                        label: kind === "Receivable" ? "Customer" : "Vendor",
                        render: row => row.partyName
                    },
                    {
                        label: "Branch",
                        render: row => row.branch
                    },
                    {
                        label: "Date",
                        render: row => row.date
                    },
                    {
                        label: "Due date",
                        render: row => row.dueDate || "—"
                    },
                    {
                        label: "Days overdue",
                        render: row => row.days ?? "—"
                    },
                    {
                        label: "Bucket",
                        render: row => row.bucket
                    },
                    {
                        label: "Document total",
                        render: row => money(row.total, currency)
                    },
                    {
                        label: "Paid",
                        render: row => money(row.paid, currency)
                    },
                    {
                        label: "Credits",
                        render: row => money(row.credits, currency)
                    },
                    {
                        label: "Outstanding",
                        render: row => money(row.balance, currency)
                    }
                ]}
            />
        </Page>
    );
}