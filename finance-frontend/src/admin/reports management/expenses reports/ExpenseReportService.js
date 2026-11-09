import {
    getReportRates,
    getSalesBranches
} from "../sales reports/SalesReportService.js";

export function expenseReportSetup(branches, companies)
{
    const currencies = [
        ...new Set(
            companies.map(row => row.currency).filter(Boolean)
        )
    ].sort();

    if (!currencies.length)
    {
        throw new Error(
            "Configure a reporting currency in your accounting companies first."
        );
    }

    return {
        branches: branches.map(branch => ({
            ...branch,
            currency: companies.find(
                company => company.id === branch.accountingCompanyId
            )?.currency || ""
        })),
        currencies,
        defaultCurrency: companies.find(row => row.currency)?.currency
    };
}

export async function getExpenseReportSetup(signal)
{
    const [branches, response] = await Promise.all([
        getSalesBranches(signal),
        fetch("/api/accounts/lookups/companies", { signal })
    ]);

    const companies = await response.json().catch(() => null);

    if (!response.ok || !Array.isArray(companies))
    {
        throw new Error(
            "Reporting currencies could not be loaded from accounting companies."
        );
    }

    return expenseReportSetup(branches, companies);
}

export function convertExpenseReport(rows, currency, rates)
{
    return rows.map(row =>
    {
        const rate = row.currency === currency
            ? 1
            : rates.find(
                rate =>
                    rate.base === row.currency &&
                    rate.quote === currency
            )?.rate;

        if (!Number.isFinite(rate) || rate <= 0)
        {
            throw new Error(
                `Exchange rate unavailable for ${row.currency} → ${currency}.`
            );
        }

        return {
            ...row,
            id: `${row.type}-${row.id}`,
            originalCurrency: row.currency,
            originalTotal: row.total,
            currency,
            ...Object.fromEntries(
                [
                    "net",
                    "tax",
                    "total",
                    "balance",
                    "overdue"
                ].map(field => [
                    field,
                    row[field] * rate
                ])
            )
        };
    });
}

export async function getExpenseReport(fromDate, toDate, currency, signal)
{
    if (!fromDate || !toDate || fromDate > toDate)
    {
        throw new Error(
            "Choose a valid date range; From must be on or before To."
        );
    }

    const query = new URLSearchParams({
        fromDate,
        toDate
    });

    const response = await fetch(
        `/api/expense-reports?${query}`,
        { signal }
    );

    const data = await response.json().catch(() => null);

    if (!response.ok || !Array.isArray(data?.rows))
    {
        throw new Error(
            data?.title ||
            data?.message ||
            "Expense report could not be loaded. Check the expense service."
        );
    }

    const sources = [
        ...new Set(data.rows.map(row => row.currency))
    ].filter(source => source !== currency);

    const rates = await getReportRates(
        sources,
        currency,
        toDate,
        signal
    );

    return {
        ...data,
        rates,
        rows: convertExpenseReport(data.rows, currency, rates)
    };
}

export function summarizeExpenses(rows)
{
    const costs = rows.filter(
        row => !["Payment", "ClaimPayment"].includes(row.type)
    );

    const sum = (items, field) => items.reduce(
        (total, row) => total + row[field],
        0
    );

    return {
        bills: sum(
            costs.filter(row => row.type === "Bill"),
            "net"
        ),
        expenses: sum(
            costs.filter(
                row => ["Expense", "Claim"].includes(row.type)
            ),
            "net"
        ),
        credits: -sum(
            costs.filter(row => row.type === "VendorCredit"),
            "net"
        ),
        net: sum(costs, "net"),
        tax: sum(costs, "tax"),
        total: sum(costs, "total"),
        paid: sum(
            rows.filter(
                row => ["Payment", "ClaimPayment"].includes(row.type)
            ),
            "total"
        ),
        balance: sum(
            costs.filter(row => row.type === "Bill"),
            "balance"
        ),
        overdue: sum(costs, "overdue"),
        ...(costs.some(row => row.type === "Claim")
            ? {
                claimBalance: sum(
                    costs.filter(row => row.type === "Claim"),
                    "balance"
                )
            }
            : {})
    };
}

export function groupExpenses(rows, tab)
{
    const groups = new Map();

    for (
        const row of rows.filter(
            row => !["Payment", "ClaimPayment"].includes(row.type)
        )
    )
    {
        const label = [
            row.date.slice(0, 7),
            row.category,
            row.partyName || "Unnamed supplier",
            row.branch
        ][tab];

        const id = tab === 2 ? row.partyKey : label;
        const key = JSON.stringify([id, row.currency]);

        const group = groups.get(key) || {
            key,
            label,
            net: 0
        };

        group.net += row.net;

        groups.set(key, group);
    }

    return [...groups.values()].sort(
        (a, b) => a.label.localeCompare(b.label)
    );
}

export function exportExpenseReport(rows, summary, rates, from, to, currency)
{
    const table = [
        ["Expense report", from, to, currency],
        [
            "Scope",
            "Summary follows branch, supplier, and category. Search, type and status apply to details only."
        ],
        ["Metric", "Amount"],
        ...Object.entries(summary),
        [],
        [
            "From currency",
            "Reporting currency",
            "Rate",
            "Rate date",
            "Source"
        ],
        ...rates.map(row => [
            row.base,
            row.quote,
            row.rate,
            row.date,
            row.source
        ]),
        [],
        [
            "Document",
            "Type",
            "Supplier",
            "Branch",
            "Category",
            "Date",
            "Due",
            "Currency",
            "Net",
            "Tax",
            "Total",
            "Outstanding",
            "Status",
            "Original currency",
            "Original total"
        ],
        ...rows.map(row => [
            row.number,
            row.type,
            row.partyName,
            row.branch,
            row.category,
            row.date,
            row.dueDate,
            row.currency,
            row.net,
            row.tax,
            row.total,
            row.balance,
            row.status,
            row.originalCurrency,
            row.originalTotal
        ])
    ];

    const csv = table.map(row =>
        row.map(value =>
        {
            const text = typeof value === "number"
                ? String(value)
                : String(value ?? "").replace(/^\s*[=+@-]/, "'$&");

            return `"${text.replaceAll('"', '""')}"`;
        }).join(",")
    ).join("\r\n");

    const url = URL.createObjectURL(
        new Blob(
            ["\uFEFF", csv],
            { type: "text/csv;charset=utf-8" }
        )
    );

    const link = document.createElement("a");

    link.href = url;
    link.download = `expense-report-${from}-${to}-${currency}.csv`;

    link.click();

    URL.revokeObjectURL(url);
}