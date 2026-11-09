import { useState } from "react";
import { Link } from "react-router-dom";
import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    MenuItem,
    Stack,
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
import { getAccountingCompanies } from "../../accounting management/chart of accounts/ChartOfAccountsService";
import {
    getReconciliationReport,
    filterChecks,
    checkSummary,
    exportReconciliation
} from "./ReconciliationReportService";
import "../../shared/AdminModules.css";
const colors = {
    Matched: "success",
    Issue: "error",
    Review: "warning",
    "Not comparable": "default"
};
function amount(value, currency)
{
    return value == null || !currency ? "—" : money(value, currency);
}
export default function ReconciliationReports()
{
    const [selectedCompany, setCompany] = useState("");
    const [asOf, setAsOf] = useState(today());
    const [group, setGroup] = useState("");
    const [status, setStatus] = useState("");
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [detail, setDetail] = useState(null);
    const companies = useLoad(getAccountingCompanies, []);
    const companyId = selectedCompany || String(companies.data?.[0]?.id || "");
    const report = useLoad(signal => companyId ? getReconciliationReport(companyId, asOf, signal) : null, [companyId, asOf]);
    const checks = report.data?.checks || [];
    const rows = filterChecks(checks, group, status, search);
    const summary = checkSummary(rows);
    const groups = [...new Set(checks.map(row => row.group))].sort();
    const change = setter => event =>
    {
        setter(event.target.value);
        setPage(1);
    };
    return <Page
        title="Accounting Reconciliation"
        subtitle="Read-only posting completeness, ledger controls and banking diagnostics"
        action={<Button
        variant="outlined"
        disabled={report.loading || !!report.error || !rows.length}
        onClick={() => exportReconciliation(report.data, rows)}
    >Export CSV</Button>}
    >
        <Stack direction="row" sx={{
            gap: 2,
            mb: 3,
            flexWrap: "wrap"
        }}>
            <TextField
                            select
                            label="Company"
                            value={companyId}
                            sx={{
                minWidth: 260
            }}
                            onChange={event =>
            {
                setCompany(event.target.value);
                setGroup("");
                setStatus("");
                setPage(1);
            }}
                        >
                {(companies.data || []).map(row => <MenuItem key={row.id} value={String(row.id)}>{row.name} · {row.currency}</MenuItem>)}
            </TextField>
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
                            label="Check group"
                            value={group}
                            onChange={change(setGroup)}
                            sx={{
                minWidth: 210
            }}
                        ><MenuItem value="">All groups</MenuItem>
                {groups.map(value => <MenuItem key={value} value={value}>{value}</MenuItem>)}
            </TextField>
            <TextField
                            select
                            label="Result"
                            value={status}
                            onChange={change(setStatus)}
                            sx={{
                minWidth: 180
            }}
                        ><MenuItem value="">All results</MenuItem>
                {Object.keys(colors).map(value => <MenuItem key={value} value={value}>{value}</MenuItem>)}
            </TextField>
            <Button onClick={report.refresh} disabled={!companyId || report.loading}>Refresh</Button>
        </Stack>
        <Feedback
                    loading={companies.loading}
                    error={companies.error}
                    retry={companies.refresh}
                />
        {!companies.loading && !companies.error && !companies.data?.length && <Alert severity="info" sx={{
            mb: 2
        }}>Configure an accounting company to run these checks.</Alert>}
        <Alert severity="info" sx={{
            mb: 2
        }}>This report flags differences; it does not post, reverse, pay, or repair records. Source documents are checked in their own currency, and ledger controls use the selected company's currency at recorded booking rates.
            Matched means that specific check agrees. Review requires an explanation; Not comparable avoids mixing currencies. Filters and search apply to counts, details and export.</Alert>
        <Alert severity="info" sx={{
            mb: 3
        }}>Cutoff calculations use currently stored document/payment statuses and dated settlements. Later voids are not reconstructed; customer-credit transfers use UTC dates. Unallocated credits, manual journals, exchange differences and pending background postings may explain control differences.</Alert>
        {!report.loading && !report.error && report.data && <>
            <Typography
                            color="text.secondary"
                            variant="body2"
                            sx={{
                mb: 2
            }}
                        >{report.data.companyName} · Company currency: {report.data.currency} · Generated: {new Date(report.data.generatedAtUtc).toLocaleString()}</Typography>
            <Box className="admin-summary-grid">{[["Checks", rows.length], ...Object.entries(summary)].map(([label, value]) => <Card key={label}><CardContent>
                <Typography color="text.secondary">{label}</Typography><Typography className="admin-summary-value">{value}</Typography>
            </CardContent></Card>)}</Box>
        </>}
        <Records
                    {...report}
                    rows={rows.slice((page - 1) * 25, page * 25)}
                    total={rows.length}
                    page={page}
                    setPage={setPage}
                    search={search}
                    setSearch={setSearch}
                    columns={[{
            label: "Group",
            render: row => row.group
        }, {
            label: "Check",
            render: row => row.title
        }, {
            label: "Reference",
            render: row => row.reference || "—"
        }, {
            label: "Result",
            render: row => <Chip
                size="small"
                color={colors[row.status] || "default"}
                label={row.status}
            />
        }, {
            label: "Currency",
            render: row => row.currency || "—"
        }, {
            label: "Expected / source",
            render: row => amount(row.expected, row.currency)
        }, {
            label: "Actual / ledger",
            render: row => amount(row.actual, row.currency)
        }, {
            label: "Difference",
            render: row => amount(row.difference, row.currency)
        }, {
            label: "Evidence",
            render: row => <Button onClick={() => setDetail(row)}>View</Button>
        }]}
                />
        {detail && <Dialog
                    open
                    fullWidth
                    maxWidth="md"
                    onClose={() => setDetail(null)}
                ><DialogTitle>{detail.title} {detail.reference && `· ${detail.reference}`}</DialogTitle>
            <DialogContent dividers><Chip
                            color={colors[detail.status] || "default"}
                            label={detail.status}
                            sx={{
                    mb: 2
                }}
                        />
                <Typography sx={{
                    mb: 2
                }}>{detail.explanation}</Typography>
                <Typography variant="body2">Expected / source: {amount(detail.expected, detail.currency)}</Typography>
                <Typography variant="body2">Actual / ledger: {amount(detail.actual, detail.currency)}</Typography>
                <Typography variant="body2">Difference: {amount(detail.difference, detail.currency)}</Typography>
            </DialogContent><DialogActions>{detail.link && <Button component={Link} to={detail.link}>Open source module</Button>}<Button onClick={() => setDetail(null)}>Close</Button></DialogActions>
        </Dialog>}
    </Page>;
}
