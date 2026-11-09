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
    getSalesReport,
    getSalesBranches,
    summarizeSales,
    groupSales,
    exportSalesReport
} from "./SalesReportService";
import "./SalesReports.css";
export default function SalesReports()
{
    const [from, setFrom] = useState(`${today().slice(0, 7)}-01`);
    const [to, setTo] = useState(today());
    const [branch, setBranch] = useState("");
    const [client, setClient] = useState("");
    const [currency, setCurrency] = useState("AED");
    const [status, setStatus] = useState("");
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [tab, setTab] = useState(0);
    const report = useLoad(signal => getSalesReport(from, to, signal, currency), [from, to, currency]);
    const branchList = useLoad(getSalesBranches, []);
    const documents = report.data?.documents || [];
    const receipts = report.data?.receipts || [];
    const options = [...documents, ...receipts];
    const branches = [...new Set([...(branchList.data || []).map(row => row.name), ...options.map(row => row.branch)])].sort();
    const clients = [...new Map(options.map(row => [row.clientId, row.clientName])).entries()].sort((a, b) => a[1].localeCompare(b[1]));
    const matches = row => (!branch || row.branch === branch) && (!client || row.clientId === client);
    const rows = documents.filter(matches).map(row => ({
        ...row,
        id: `${row.type}-${row.id}`
    })).sort((a, b) => b.date.localeCompare(a.date));
    const summaries = summarizeSales(rows, receipts.filter(matches));
    const filtered = rows.filter(row => (!status || row.status === status) && `${row.number} ${row.clientName} ${row.type}`.toLowerCase().includes(search.toLowerCase()));
    const grouped = groupSales(rows, tab);
    const change = setter => event =>
    {
        setter(event.target.value);
        setPage(1);
    };
    return <Page
        title="Sales Reports"
        subtitle={`Issued sales documents and recorded receipts · amounts in ${currency}`}
        action={<Button
        variant="outlined"
        disabled={report.loading || !!report.error || !summaries.length}
        onClick={() => exportSalesReport(filtered, summaries, from, to, report.data?.rates)}
    >Export CSV</Button>}
    >
        <Stack direction="row" sx={{
            gap: 2,
            mb: 3,
            flexWrap: "wrap"
        }}>
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
                            onChange={event =>
                        {
                setBranch(event.target.value);
                const selectedBranch = branchList.data?.find(row => row.name === event.target.value);
                const defaultCurrency = {
                    AE: "AED",
                    IN: "INR"
                }[selectedBranch?.countryCode];
                if (defaultCurrency) setCurrency(defaultCurrency);
                setPage(1);
            }}
                            sx={{
                minWidth: 160
            }}
                        >
                <MenuItem value="">All branches</MenuItem>{branches.map(value => <MenuItem key={value} value={value}>{value}</MenuItem>)}
            </TextField>
            <TextField
                            select
                            label="Customer"
                            value={client}
                            onChange={change(setClient)}
                            sx={{
                minWidth: 220
            }}
                        >
                <MenuItem value="">All customers</MenuItem>{clients.map(([id, name]) => <MenuItem key={id} value={id}>{name}</MenuItem>)}
            </TextField>
            <TextField
                            select
                            label="Reporting currency"
                            value={currency}
                            onChange={change(setCurrency)}
                            sx={{
                minWidth: 180
            }}
                        >
                {["AED", "INR"].map(value => <MenuItem key={value} value={value}>{value}</MenuItem>)}
            </TextField>
            <Button onClick={report.refresh} disabled={report.loading}>Refresh</Button>
        </Stack>
        <Alert severity="info" sx={{
            mb: 3
        }}>
            Sales exclude tax and subtract credit notes dated in the period. Receipts include payments dated in the period, including payments for older invoices.
            Outstanding and overdue cover invoices dated in the period, as of {to}. Credit transfers use their recorded UTC date.
            All amounts are converted to {currency} using reference rates requested as of {to}. Search and payment status filter the document table only.
        </Alert>
        {branchList.error && <Alert
                    severity="warning"
                    action={<Button onClick={branchList.refresh}>Retry</Button>}
                    sx={{
            mb: 2
        }}
                >{branchList.error}</Alert>}
        {!report.loading && !report.error && report.data?.rates.some(rate => rate.fallback) && <Alert severity="warning" sx={{
            mb: 2
        }}>
            The requested rate is unavailable. This report uses previously saved reference rates with the dates shown below.
        </Alert>}
        {!report.loading && !report.error && report.data?.rates.map(rate => <Typography
                    key={rate.base}
                    variant="body2"
                    color="text.secondary"
                    sx={{
            mb: 1
        }}
                >
            1 {rate.base} = {rate.rate} {rate.quote} · Rate date: {rate.date} · {rate.source}
        </Typography>)}
        {!report.loading && !report.error && <>
            {summaries.map(summary => <Box key={summary.currency} sx={{
                mb: 3
            }}>
                <Typography variant="h6" sx={{
                    mb: 1
                }}>{summary.currency}</Typography>
                <Box className="admin-summary-grid">
                    {[["Sales before tax", summary.sales], ["Credit notes before tax", summary.credits], ["Net sales", summary.net], ["Net tax", summary.tax], ["Net invoiced", summary.total], ["Receipts in period", summary.receipts], ["Outstanding on period invoices", summary.balance], ["Overdue on period invoices", summary.overdue]].map(([label, value]) => <Card key={label}><CardContent><Typography color="text.secondary">{label}</Typography>
                            <Typography className="admin-summary-value">{money(value, summary.currency)}</Typography>
                        </CardContent></Card>)}
                </Box>
            </Box>)}
            {!summaries.length && <Alert severity="info" sx={{
                mb: 2
            }}>No sales or receipts match these filters.</Alert>}
            <Tabs
                            value={tab}
                            onChange={(_, value) => setTab(value)}
                            variant="scrollable"
                            scrollButtons="auto"
                            sx={{
                mb: 2
            }}
                        >
                {["Monthly sales", "Customers", "Branches", "Services"].map(label => <Tab key={label} label={label} />)}
            </Tabs>
            <Card sx={{
                mb: 3
            }}><CardContent><TableContainer><Table size="small">
                <TableHead><TableRow>{["Group", "Currency", "Net sales before tax", ...(tab === 0 ? ["Trend"] : [])].map(label => <TableCell key={label}>{label}</TableCell>)}</TableRow></TableHead>
                <TableBody>{grouped.map(row => <TableRow key={row.key}>
                    <TableCell>{row.label}</TableCell><TableCell>{row.currency}</TableCell><TableCell>{money(row.net, row.currency)}</TableCell>
                    {tab === 0 && <TableCell sx={{
                                        minWidth: 160
                                    }}><Box
                                        role="img"
                                        aria-label={`${row.label}: ${money(row.net, row.currency)}`}
                                        sx={{
                                            height: 12,
                                            borderRadius: 1,
                                            width: `${Math.max(1, Math.abs(row.net) / Math.max(1, ...grouped.filter(item => item.currency === row.currency).map(item => Math.abs(item.net))) * 100)}%`,
                                            bgcolor: row.net < 0 ? "error.main" : "primary.main"
                                        }}
                                    /></TableCell>}
                </TableRow>)}
                    {!grouped.length && <TableRow><TableCell colSpan={tab === 0 ? 4 : 3}>No sales documents found.</TableCell></TableRow>}
                </TableBody>
            </Table></TableContainer></CardContent></Card>
        </>}
        <Records
                    {...report}
                    rows={filtered.slice((page - 1) * 25, page * 25)}
                    total={filtered.length}
                    page={page}
                    setPage={setPage}
                    search={search}
                    setSearch={setSearch}
                    extra={<TextField
                    select
                    size="small"
                    label="Payment status"
                    value={status}
                    onChange={change(setStatus)}
                    sx={{
            minWidth: 180
        }}
                >
                <MenuItem value="">All statuses</MenuItem>{["Unpaid", "Partially Paid", "Paid", "Credited", "Credit Balance", "Issued"].map(value => <MenuItem key={value} value={value}>{value}</MenuItem>)}
            </TextField>}
                    columns={[{
            label: "Document",
            render: row => row.number
        }, {
            label: "Type",
            render: row => row.type
        }, {
            label: "Customer",
            render: row => row.clientName
        }, {
            label: "Branch",
            render: row => row.branch
        }, {
            label: "Date",
            render: row => row.date
        }, {
            label: "Due",
            render: row => row.dueDate || "—"
        }, {
            label: "Net sales",
            render: row => money(row.net, row.currency)
        }, {
            label: "Tax",
            render: row => money(row.tax, row.currency)
        }, {
            label: "Total",
            render: row => money(row.total, row.currency)
        }, {
            label: "Outstanding",
            render: row => row.type === "Invoice" ? money(row.balance, row.currency) : "—"
        }, {
            label: "Status",
            render: row => row.status
        }]}
                />
    </Page>;
}
