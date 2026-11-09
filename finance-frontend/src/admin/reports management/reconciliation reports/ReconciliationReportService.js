export async function getReconciliationReport(companyId, asOf, signal)
{
    if (!companyId || !asOf)
    {
        throw new Error("Select a company and an As of date.");
    }
    const params = new URLSearchParams({
        companyId,
        asOf
    });
    const response = await fetch(`/api/reconciliation-reports?${params}`, {
        signal
    });
    const data = await response.json().catch(() => null);
    if (!response.ok || !Array.isArray(data?.checks))
    {
        throw new Error(data?.message || data?.title || "Reconciliation report could not be loaded. Check the accounting service.");
    }
    return data;
}
export function filterChecks(checks, group, status, search)
{
    const text = search.trim().toLowerCase();
    return checks.filter(row => (!group || row.group === group) && (!status || row.status === status) && `${row.title} ${row.reference} ${row.explanation} ${row.status}`.toLowerCase().includes(text));
}
export function checkSummary(checks)
{
    const statuses = ["Matched", "Issue", "Review", "Not comparable"];
    return Object.fromEntries(statuses.map(status => [status, checks.filter(row => row.status === status).length]));
}
export function exportReconciliation(report, checks)
{
    const rows = [["Accounting reconciliation", report.companyName], ["As of", report.asOf], ["Company currency", report.currency], ["Generated (UTC)", report.generatedAtUtc], ["Basis", "Read-only diagnostics using recorded booking rates. Each check identifies its currency. Review and Not comparable require investigation."], [], ["Group", "Check", "Reference", "Status", "Currency", "Expected / source", "Actual / ledger", "Difference", "Explanation"], ...checks.map(row => [row.group, row.title, row.reference, row.status, row.currency, row.expected, row.actual, row.difference, row.explanation])];
    const csv = rows.map(row => row.map(value =>
    {
        const text = typeof value === "number" ? String(value) : String(value ?? "").replace(/^\s*[=+@-]/, "'$&");
        return `"${text.replaceAll('"', '""')}"`;
    }).join(",")).join("\r\n");
    const blob = new Blob(["\uFEFF", csv], {
        type: "text/csv;charset=utf-8"
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `accounting-reconciliation-${report.companyId}-${report.asOf}.csv`;
    link.click();
    URL.revokeObjectURL(url);
}
