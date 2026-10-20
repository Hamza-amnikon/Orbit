async function request(url, options = {}) {
    const response = await fetch(url, options);
    const data = await response.json().catch(() => null);

    if (!response.ok) {
        const validation = data?.errors
            ? Object.values(data.errors).flat().join(" ")
            : "";

        throw new Error(
            validation ||
            data?.message ||
            data?.title ||
            `Request failed (${response.status}).`
        );
    }

    if (data == null) {
        throw new Error(
            "Unexpected payment API response."
        );
    }

    return data;
}

export function getInvoicePaymentSummary(
    salesInvoiceId,
    signal
) {
    return request(
        `/api/sales-invoices/${encodeURIComponent(salesInvoiceId)}/payments`,
        { signal }
    );
}

export function recordInvoicePayment(
    salesInvoiceId,
    payment
) {
    return request(
        `/api/sales-invoices/${encodeURIComponent(salesInvoiceId)}/payments`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payment),
        }
    );
}

export async function getPaymentModes(signal) {
    const result = await request(
        "/api/payment-modes",
        { signal }
    );

    if (!Array.isArray(result)) {
        throw new Error(
            "Invalid payment mode response."
        );
    }

    return result.filter((mode) => mode.isActive);
}