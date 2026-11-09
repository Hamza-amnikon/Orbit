export function convertSalesReport(data, currency, rates)
{
    const factor = source =>
    {
        if (source === currency)
        {
            return 1;
        }
        const rate = rates.find(row => row.base === source && row.quote === currency)?.rate;
        if (!Number.isFinite(rate) || rate <= 0)
        {
            throw new Error(`Exchange rate unavailable for ${source} → ${currency}. Check Exchange Rates and retry.`);
        }
        return rate;
    };
    return {
        ...data,
        currency,
        rates,
        documents: data.documents.map(row =>
        {
            const rate = factor(row.currency);
            return {
                ...row,
                originalCurrency: row.currency,
                originalTotal: row.total,
                currency,
                ...Object.fromEntries(["net", "tax", "total", "paid", "balance", "overdue"].map(field => [field, row[field] * rate])),
                services: row.services.map(item => ({
                    ...item,
                    net: item.net * rate
                }))
            };
        }),
        receipts: data.receipts.map(row => ({
            ...row,
            originalCurrency: row.currency,
            currency,
            amount: row.amount * factor(row.currency)
        }))
    };
}
export async function getSalesBranches(signal)
{
    const response = await fetch("/api/branches", {
        signal
    });
    const data = await response.json().catch(() => null);
    if (!response.ok || !Array.isArray(data))
    {
        throw new Error("Branches could not be loaded. Check the invoice service and retry.");
    }
    return data;
}
export function savedSalesRateDate(data, source, currency, toDate)
{
    const find = code => code === "INR" ? {
        rateToInr: 1,
        rateDate: null
    } : data.rates.find(row => row.currency === code);
    const from = find(source);
    const to = find(currency);
    const valid = row => row && Number.isFinite(row.rateToInr) && row.rateToInr > 0 && (!row.rateDate || row.rateDate <= toDate);
    if (!valid(from) || !valid(to) || from.rateDate && to.rateDate && from.rateDate !== to.rateDate)
    {
        throw new Error(`A saved rate on or before ${toDate} is unavailable for ${source} → ${currency}. Check Exchange Rates and retry.`);
    }
    return from.rateDate || to.rateDate;
}
async function requestSalesRate(source, currency, date, signal)
{
    const response = await fetch(`/api/exchange-rates/rate/${encodeURIComponent(source)}/${encodeURIComponent(currency)}?${new URLSearchParams({
        date
    })}`, {
        signal
    });
    const rate = await response.json().catch(() => null);
    if (!response.ok || !rate)
    {
        return null;
    }
    if (rate.base !== source || rate.quote !== currency || !Number.isFinite(rate.rate) || rate.rate <= 0 || !rate.date || rate.date > date)
    {
        throw new Error(`Invalid exchange-rate response for ${source} → ${currency}. Check Exchange Rates and retry.`);
    }
    return rate;
}
export async function getSalesReport(fromDate, toDate, signal, currency = "AED")
{
    if (!fromDate || !toDate || fromDate > toDate)
    {
        throw new Error("Choose a valid date range; From must be on or before To.");
    }
    const response = await fetch(`/api/sales-reports?${new URLSearchParams({
        fromDate,
        toDate
    })}`, {
        signal
    });
    const data = await response.json().catch(() => null);
    if (!response.ok || !data)
    {
        throw new Error(data?.message || data?.title || "Sales report could not be loaded. Check that the invoice service is running.");
    }
    const sources = [...new Set([...data.documents, ...data.receipts].map(row => row.currency))].filter(source => source !== currency);
    const rates = await getReportRates(sources, currency, toDate, signal);
    return convertSalesReport(data, currency, rates);
}

// Both reports use the same rate endpoint and saved-date fallback.
export async function getReportRates(sources, currency, toDate, signal)
{
    let savedRates;
    const rates = await Promise.all(sources.map(async source =>
    {
        const rate = await requestSalesRate(source, currency, toDate, signal);
        if (!rate)
        {
            savedRates ??= fetch("/api/exchange-rates/latest", {
                signal
            }).then(async response =>
            {
                const data = await response.json().catch(() => null);
                if (!response.ok || !Array.isArray(data?.rates))
                {
                    throw new Error("Saved exchange rates are unavailable. Check Exchange Rates and retry.");
                }
                return data;
            });
            const savedDate = savedSalesRateDate(await savedRates, source, currency, toDate);

            // The shared API calculates the cross rate, exactly as it does for Dashboard.
            const savedRate = await requestSalesRate(source, currency, savedDate, signal);
            if (!savedRate)
            {
                throw new Error(`Exchange rate unavailable for ${source} → ${currency}. Check Exchange Rates and retry.`);
            }
            return {
                ...savedRate,
                fallback: true
            };
        }
        return rate;
    }));
    return rates;
}
export function summarizeSales(documents, receipts)
{
    return [...new Set([...documents, ...receipts].map(row => row.currency))].sort().map(currency =>
    {
        const rows = documents.filter(row => row.currency === currency);
        const sum = field => rows.reduce((total, row) => total + row[field], 0);
        return {
            currency,
            sales: rows.filter(row => row.type === "Invoice").reduce((total, row) => total + row.net, 0),
            credits: -rows.filter(row => row.type === "CreditNote").reduce((total, row) => total + row.net, 0),
            net: sum("net"),
            tax: sum("tax"),
            total: sum("total"),
            balance: sum("balance"),
            overdue: sum("overdue"),
            receipts: receipts.filter(row => row.currency === currency).reduce((total, row) => total + row.amount, 0)
        };
    });
}
export function groupSales(documents, tab)
{
    const groups = new Map();
    for (const row of documents)
    {
        const entries = tab === 3 ? row.services.map(item => [item.serviceName, item.serviceName, item.net]) : [[tab === 0 ? row.date.slice(0, 7) : tab === 1 ? row.clientId : row.branch, tab === 0 ? row.date.slice(0, 7) : tab === 1 ? row.clientName : row.branch, row.net]];
        for (const [id, label, net] of entries)
        {
            const key = JSON.stringify([id, row.currency]);
            const group = groups.get(key) || {
                key,
                label,
                currency: row.currency,
                net: 0
            };
            group.net += net;
            groups.set(key, group);
        }
    }
    return [...groups.values()].sort((a, b) => a.label.localeCompare(b.label) || a.currency.localeCompare(b.currency));
}
export function exportSalesReport(documents, summaries, from, to, rates = [])
{
    const rows = [["Sales report", from, to], ["Summary scope", "Date, branch and customer filters, converted to reporting currency. Search and status apply to document rows only."], ["Conversion basis", "Reference rates requested as of report To date; actual provider dates shown below."], ["From currency", "Reporting currency", "Rate", "Rate date", "Source"], ...rates.map(row => [row.base, row.quote, row.rate, row.date, row.source]), [], ["Currency", "Sales before tax", "Credits before tax", "Net sales", "Net tax", "Net invoiced", "Receipts in period", "Outstanding on period invoices", "Overdue on period invoices"], ...summaries.map(row => [row.currency, row.sales, row.credits, row.net, row.tax, row.total, row.receipts, row.balance, row.overdue]), [], ["Document", "Type", "Customer", "Branch", "Date", "Due date", "Reporting currency", "Net sales", "Tax", "Total", "Outstanding", "Status", "Original currency", "Original total"], ...documents.map(row => [row.number, row.type, row.clientName, row.branch, row.date, row.dueDate, row.currency, row.net, row.tax, row.total, row.balance, row.status, row.originalCurrency || row.currency, row.originalTotal ?? row.total])];
    const csv = rows.map(row => row.map(value =>
    {
        const text = typeof value === "number" ? String(value) : String(value ?? "").replace(/^\s*[=+@-]/, "'$&");
        return `"${text.replaceAll('"', '""')}"`;
    }).join(",")).join("\r\n");
    const url = URL.createObjectURL(new Blob(["\uFEFF", csv], {
        type: "text/csv;charset=utf-8"
    }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `sales-report-${from}-${to}.csv`;
    link.click();
    URL.revokeObjectURL(url);
}
