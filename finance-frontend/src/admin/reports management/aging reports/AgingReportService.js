import { getReportRates } from "../sales reports/SalesReportService.js";

export const agingBuckets = [
    "Not yet due",
    "1–30 days",
    "31–60 days",
    "61–90 days",
    "Over 90 days",
    "No due date"
];

export function ageBalance(dueDate, asOf)
{
    if (!dueDate)
    {
        return {
            days: null,
            bucket: "No due date"
        };
    }

    const days = Math.round(
        (
            Date.parse(asOf + "T00:00:00Z") -
            Date.parse(dueDate + "T00:00:00Z")
        ) / 86400000
    );

    return {
        days: Math.max(0, days),
        bucket: days <= 0
            ? agingBuckets[0]
            : days <= 30
                ? agingBuckets[1]
                : days <= 60
                    ? agingBuckets[2]
                    : days <= 90
                        ? agingBuckets[3]
                        : agingBuckets[4]
    };
}

export function convertAgingRows(rows, currency, rates, asOf)
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
            documentId: row.id,
            id: `${row.kind}-${row.id}`,
            originalCurrency: row.currency,
            originalBalance: row.balance,
            currency,
            ...Object.fromEntries(
                [
                    "total",
                    "paid",
                    "credits",
                    "balance"
                ].map(field => [
                    field,
                    row[field] * rate
                ])
            ),
            ...ageBalance(row.dueDate, asOf)
        };
    });
}

export async function getAgingReport(asOf, currency, signal)
{
    if (!asOf)
    {
        throw new Error("Choose an As of date.");
    }

    const query = new URLSearchParams({
        asOf
    });

    const response = await fetch(
        `/api/aging-reports?${query}`,
        { signal }
    );

    const data = await response.json().catch(() => null);

    if (!response.ok || !Array.isArray(data?.rows))
    {
        throw new Error(
            data?.message ||
            data?.title ||
            "Aging report could not be loaded. Check the accounting service."
        );
    }

    const sources = [
        ...new Set(data.rows.map(row => row.currency))
    ].filter(source => source !== currency);

    const rates = await getReportRates(
        sources,
        currency,
        asOf,
        signal
    );

    return {
        ...data,
        rates,
        rows: convertAgingRows(data.rows, currency, rates, asOf)
    };
}

export function agingSummary(rows)
{
    return agingBuckets.map(bucket => ({
        bucket,
        balance: rows
            .filter(row => row.bucket === bucket)
            .reduce((sum, row) => sum + row.balance, 0)
    }));
}

export function agingParties(rows)
{
    const groups = new Map();

    for (const row of rows)
    {
        const key = JSON.stringify([row.kind, row.partyId]);

        const group = groups.get(key) || {
            key,
            name: row.partyName,
            total: 0,
            buckets: Object.fromEntries(
                agingBuckets.map(bucket => [bucket, 0])
            )
        };

        group.total += row.balance;
        group.buckets[row.bucket] += row.balance;

        groups.set(key, group);
    }

    return [...groups.values()].sort(
        (a, b) => b.total - a.total
    );
}

export function exportAgingReport(rows, rates, asOf, currency, kind)
{
    const table = [
        [
            "Aging report",
            kind,
            "As of",
            asOf,
            "Reporting currency",
            currency
        ],
        [
            "Scope",
            "Current issued documents with dated settlements through the cutoff. Unallocated credits are excluded."
        ],
        ["Aging bucket", "Balance"],
        ...agingSummary(rows).map(row => [
            row.bucket,
            row.balance
        ]),
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
            "Customer / vendor",
            "Branch",
            "Document date",
            "Due date",
            "Days overdue",
            "Bucket",
            "Reporting currency",
            "Total",
            "Payments",
            "Credits",
            "Outstanding",
            "Original currency",
            "Original outstanding"
        ],
        ...rows.map(row => [
            row.number,
            row.kind,
            row.partyName,
            row.branch,
            row.date,
            row.dueDate,
            row.days,
            row.bucket,
            row.currency,
            row.total,
            row.paid,
            row.credits,
            row.balance,
            row.originalCurrency,
            row.originalBalance
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
    link.download = `aging-${kind}-${asOf}-${currency}.csv`;

    link.click();

    URL.revokeObjectURL(url);
}