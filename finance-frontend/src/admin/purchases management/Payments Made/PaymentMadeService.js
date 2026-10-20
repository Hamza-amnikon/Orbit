const endpoint = "/api/payments-made";

async function request(path = "", { body, ...options } = {}) {
    let response;

    try {
        response = await fetch(endpoint + path, {
            ...options,
            headers: {
                ...(body !== undefined
                    ? { "Content-Type": "application/json" }
                    : {}),
                ...options.headers,
            },
            ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
        });
    } catch (error) {
        if (error.name === "AbortError") {
            throw error;
        }

        throw new Error(
            "Cannot reach PaymentMadeService.API. Check that it is running."
        );
    }

    const data = await response.json().catch(() => null);

    if (!response.ok) {
        const validation = data?.errors
            ? Object.values(data.errors).flat().join(" ")
            : "";

        const error = new Error(
            validation || data?.message || data?.detail ||
            data?.title || "Payment request failed."
        );

        error.status = response.status;
        throw error;
    }

    return data;
}

function queryString(filters) {
    const query = new URLSearchParams();

    for (const [name, value] of Object.entries(filters)) {
        const text = String(value ?? "").trim();

        if (text) {
            query.set(name, text);
        }
    }

    return query;
}

export async function getPaymentsMade(filters = {}, signal) {
    const query = queryString({ page: 1, pageSize: 25, ...filters });
    const result = await request("?" + query, { signal });

    if (!Array.isArray(result?.data) || !Number.isInteger(result.total)) {
        throw new Error("Invalid payment list.");
    }

    return result;
}

export function getPaymentMade(id, signal) {
    return request("/" + encodeURIComponent(id), { signal });
}

export function getPaymentsMadeSummary(signal) {
    return request("/summary", { signal });
}

export function createPaymentMade(body) {
    return request("", { method: "POST", body });
}

export function voidPaymentMade(id, body) {
    return request("/" + encodeURIComponent(id) + "/void", {
        method: "POST",
        body,
    });
}

export function getBillPaymentBalance(billId, signal) {
    return request("/bills/" + encodeURIComponent(billId) + "/balance", {
        signal,
    });
}

export function getPaymentMadeModes(signal) {
    return request("/lookups/payment-modes", { signal });
}

export function getPaymentMadeVendors(search, signal) {
    return request(
        "/lookups/vendors?" + queryString({ search, pageSize: 50 }),
        { signal }
    );
}

export function getPaymentMadeBills(vendorId, search, signal) {
    return request(
        "/lookups/bills?" + queryString({
            vendorId,
            search,
            pageSize: 50,
        }),
        { signal }
    );
}

export function money(amount, currency, precision = 2) {
    if (amount == null || !currency) {
        return "—";
    }

    return new Intl.NumberFormat(undefined, {
        style: "currency",
        currency,
        currencyDisplay: "code",
        minimumFractionDigits: precision,
        maximumFractionDigits: precision,
    }).format(amount);
}

export function formatDate(value) {
    return value ? value.slice(0, 10).split("-").reverse().join("/") : "—";
}
