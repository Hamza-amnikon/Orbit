import { getExpenseReportSetup } from "../../reports management/expenses reports/ExpenseReportService.js";
import { getAccounts } from "../../accounting management/chart of accounts/ChartOfAccountsService.js";
export async function claimRequest(path, operator, role, {
    body,
    signal,
    method = "GET",
    download = false
} = {})
{
    const token = sessionStorage.getItem("orbit.finance.accessToken");
    const file = body instanceof FormData;
    const response = await fetch(`/api/expense-claims${path}`, {
        method,
        signal,
        headers: {
            ...(token ? {
                Authorization: `Bearer ${token}`
            } : {}),
            ...(import.meta.env.DEV ? {
                "X-Claim-Operator": operator,
                "X-Claim-Role": role
            } : {}),
            ...(body && !file ? {
                "Content-Type": "application/json"
            } : {})
        },
        ...(body ? {
            body: file ? body : JSON.stringify(body)
        } : {})
    });
    if (download && response.ok) return response.blob();
    const data = await response.json().catch(() => null);
    if (!response.ok || !data) throw new Error(data?.message || data?.title || Object.values(data?.errors || {}).flat().join(" ") || "Claim request failed. Check the expense service.");
    return data;
}
export async function claimChoices(signal)
{
    const [setup, response] = await Promise.all([getExpenseReportSetup(signal), fetch("/api/currencies", {
        signal
    })]);
    const currencies = await response.json().catch(() => null);
    if (!response.ok || !Array.isArray(currencies)) throw new Error("Claim currencies could not be loaded.");
    return {
        ...setup,
        currencies: currencies.filter(row => row.isActive).map(row => row.currencyCode)
    };
}
export async function claimAccounts(companyId, signal)
{
    if (!companyId) return [];
    const rows = [];
    for (let page = 1;; page++)
    {
        const result = await getAccounts({
            companyId,
            page,
            pageSize: 100
        }, signal);
        rows.push(...result.data.filter(row => row.isActive && row.isPostingAccount));
        if (page * 100 >= result.total || !result.data.length) return rows;
    }
}
export function claimTransitions(row, actor, admin)
{
    const owner = row.createdBy?.trim().toLowerCase() === actor.trim().toLowerCase();
    if (row.status === "Draft" && (owner || admin)) return ["Submitted", "Cancelled"];
    if (row.status === "Rejected" && (owner || admin)) return ["Draft"];
    if (row.status === "Submitted" && admin) return [...(!owner ? ["Approved"] : []), "Rejected"];
    if (row.status === "Approved" && admin) return ["Paid"];
    return [];
}
