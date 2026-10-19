const endpoint = "/api/sales-credit-notes";

async function request(url, { body, ...options } = {}) {
    const response = await fetch(url, {
        ...options,
        ...(body !== undefined
            ? {
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(body),
            }
            : {}),
    });

    const data = await response.json().catch(() => null);

    if (!response.ok || data == null) {
        const validation = data?.errors
            ? Object.values(data.errors).flat().join(" ")
            : "";

        const error = new Error(
            validation ||
            data?.message ||
            data?.title ||
            "Unable to load credit note information."
        );

        error.status = response.status;
        throw error;
    }

    return data;
}

export async function getCreditNotes(
    {
        page = 1,
        pageSize = 25,
        search = "",
        status = "",
    } = {},
    signal
) {
    const query = new URLSearchParams({
        page: String(page),
        pageSize: String(pageSize),
    });

    if (search.trim()) {
        query.set("search", search.trim());
    }

    if (status !== "") {
        query.set("status", String(status));
    }

    const result = await request(
        `${endpoint}?${query}`,
        { signal }
    );

    if (
        !Array.isArray(result.data) ||
        !Number.isInteger(result.total) ||
        result.total < 0
    ) {
        throw new Error("Invalid credit note list response.");
    }

    return result;
}

export function getCreditNote(id, signal) {
    return request(
        `${endpoint}/${encodeURIComponent(id)}`,
        { signal }
    );
}

export function previewCreditNote(body) {
    return request(`${endpoint}/preview`, {
        method: "POST",
        body,
    });
}

export function createCreditNote(body) {
    return request(endpoint, {
        method: "POST",
        body,
    });
}

export function issueCreditNote(id, rowVersion) {
    return request(
        `${endpoint}/${encodeURIComponent(id)}/issue`,
        {
            method: "POST",
            body: { rowVersion },
        }
    );
}
export async function getIssuedCreditInvoices(signal) {
    const invoices = [];
    let page = 1;
    let loaded = 0;
    let total;
    do {
        const result = await request(`/api/sales-invoices?page=${page}&pageSize=100`, { signal });
        if (!Array.isArray(result.data) || !Number.isInteger(result.total) || result.total < 0) throw new Error("Invalid invoice list response.");
        if (!result.data.length && loaded < result.total) throw new Error("Invoice list changed. Please reload it.");
        invoices.push(...result.data.filter(invoice => invoice.status === 1 || invoice.status === "Issued"));
        loaded += result.data.length;
        total = result.total;
        page++;
    } while (loaded < total);
    return invoices;
}

export async function getCreditInvoiceContext(id, signal) {
    const invoice = await request(`/api/sales-invoices/${encodeURIComponent(id)}`, { signal });
    if (invoice.id !== Number(id) || !Array.isArray(invoice.items) || !invoice.invoiceNumber || !(invoice.status === 1 || invoice.status === "Issued")) throw new Error("Select an issued invoice.");
    const issuedCredits = [];
    let page = 1;
    let loaded = 0;
    let total;
    do {
        const result = await getCreditNotes({ page, pageSize: 100, search: invoice.invoiceNumber, status: "1" }, signal);
        if (!result.data.length && loaded < result.total) throw new Error("Credit history changed. Please reload the invoice.");
        for (const credit of result.data) {
            if (credit.salesInvoiceId !== invoice.id) continue;
            if (!Array.isArray(credit.items)) throw new Error("Invalid credit history response.");
            issuedCredits.push(...credit.items);
        }
        loaded += result.data.length;
        total = result.total;
        page++;
    } while (loaded < total);
    const remaining = {};
    const remainingAmounts = {};
    for (const item of invoice.items) {
        const used = issuedCredits.filter(credit => credit.salesInvoiceItemId === item.id).reduce((sum, credit) => sum + Number(credit.quantity), 0);
        const usedNet = issuedCredits.filter(credit => credit.salesInvoiceItemId === item.id).reduce((sum, credit) => sum + Number(credit.lineSubTotal) - Number(credit.discountAmount), 0);
        remainingAmounts[item.id] = Math.max(0, Math.round((Number(item.lineSubTotal) - Number(item.discountAmount) - usedNet) * 10000) / 10000);
        remaining[item.id] = Math.max(0, Math.round((Number(item.quantity) - used) * 10000) / 10000);
    }
    return { invoice, remaining, remainingAmounts };
}
