export function auditQuery(filters)
{
    const {
        from,
        to,
        ...rest
    } = filters;
    const query = new URLSearchParams();
    if (from && to && from > to) throw new Error("Choose a valid date range; From must be on or before To.");
    if (from) query.set("from", new Date(from + "T00:00:00").toISOString());
    if (to)
    {
        const before = new Date(to + "T00:00:00");
        before.setDate(before.getDate() + 1);
        query.set("before", before.toISOString());
    }
    for (const [key, value] of Object.entries(rest)) if (value !== "" && value != null) query.set(key, String(value));
    return query.toString();
}
async function request(path, role, signal, download = false)
{
    const token = sessionStorage.getItem("orbit.finance.accessToken");
    const response = await fetch(`/api/audit-history${path}`, {
        signal,
        headers: {
            ...(token ? {
                Authorization: `Bearer ${token}`
            } : {}),
            ...(import.meta.env?.DEV ? {
                "X-Audit-Role": role
            } : {})
        }
    });
    if (download && response.ok) return response.blob();
    const data = await response.json().catch(() => null);
    if (!response.ok || !data) throw new Error(data?.message || data?.title || "Audit history could not be loaded. Check the accounting service.");
    return data;
}
export const getAuditHistory = (filters, role, signal) => request(`?${auditQuery(filters)}`, role, signal);
export const getAuditChoices = (role, signal, activity = "Business") => request(`/lookups?${auditQuery({ activity })}`, role, signal);
export function auditChanges(row)
{
    const before = row.beforeJson ? JSON.parse(row.beforeJson) : {};
    const after = row.afterJson ? JSON.parse(row.afterJson) : {};
    return [...new Set([...Object.keys(before), ...Object.keys(after)])].sort().filter(key => JSON.stringify(before[key]) !== JSON.stringify(after[key])).map(key => ({
        field: key,
        before: before[key],
        after: after[key]
    }));
}
export async function exportAuditHistory(filters, role)
{
    const blob = await request(`/export?${auditQuery(filters)}`, role, undefined, true);
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `audit-history-${filters.from || "all"}-${filters.to || "all"}.csv`;
    link.click();
    URL.revokeObjectURL(url);
}

export function auditActivityLabel(row)
{
    if (row.action === "Snapshot")
    {
        return "Existing record snapshot";
    }

    const names = {
        SalesInvoice: "Invoice",
        SalesInvoicePayment: "Customer payment",
        PaymentMade: "Supplier payment",
        ExpenseClaim: "Expense claim",
        JournalEntry: "Journal entry",
        PaymentBankingLink: "Payment synchronization",
        SalesCreditNote: "Credit note",
        Bill: "Bill",
        VendorCredit: "Vendor credit"
    };
    const name = names[row.entityType] || row.entityType.replace(/([a-z])([A-Z])/g, "$1 $2");
    const after = row.afterJson ? JSON.parse(row.afterJson) : {};

    if (row.action === "Status changed" && typeof after.Status === "string")
    {
        return `${name} ${after.Status.toLowerCase()}`;
    }

    if (row.action === "Created" && ["SalesInvoicePayment", "PaymentMade"].includes(row.entityType))
    {
        return `${name} recorded`;
    }

    return `${name} ${row.action.toLowerCase()}`;
}
