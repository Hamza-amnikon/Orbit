const endpoint = "/api/sales-invoices/payments";

async function readJson(url, signal) {
    const response = await fetch(url, { signal });
    const result = await response.json().catch(() => null);

    if (!response.ok) {
        const validation = result?.errors
            ? Object.values(result.errors).flat().join(" ")
            : "";

        const error = new Error(
            validation ||
            result?.message ||
            result?.detail ||
            result?.title ||
            "Unable to load payment information."
        );

        error.status = response.status;
        throw error;
    }

    return result;
}

export async function getReceivedPayments(
    {
        page = 1,
        pageSize = 25,
        search = "",
        fromDate = "",
        toDate = "",
        clientId = "",
        branch = "",
        currency = "",
        paymentMode = "",
    } = {},
    signal
) {
    const query = new URLSearchParams({
        page: String(page),
        pageSize: String(pageSize),
    });

    const filters = {
        search,
        fromDate,
        toDate,
        clientId,
        branch,
        currency,
        paymentMode,
    };

    for (const [key, value] of Object.entries(filters)) {
        const text = String(value ?? "").trim();

        if (text) {
            query.set(key, text);
        }
    }

    const result = await readJson(
        `${endpoint}?${query}`,
        signal
    );

    if (
        !Array.isArray(result?.data) ||
        !Number.isInteger(result.total) ||
        result.total < 0
    ) {
        throw new Error("Invalid payments response.");
    }

    return result;
}

export async function getPaymentFilterOptions(signal) {
    async function loadClients() {
        const clients = [];
        let page = 1;

        while (true) {
            const result = await readJson(
                `/api/clients?page=${page}&pageSize=100`,
                signal
            );

            if (
                !Array.isArray(result?.data) ||
                !Number.isInteger(result.total) ||
                result.total < 0
            ) {
                throw new Error("Invalid client list response.");
            }

            if (
                result.data.length === 0 &&
                clients.length < result.total
            ) {
                throw new Error(
                    "The client list changed. Reload the filters."
                );
            }

            clients.push(...result.data);

            if (clients.length >= result.total) {
                return clients;
            }

            page++;
        }
    }

    const [clients, branches, currencies, paymentModes] =
        await Promise.all([
            loadClients(),
            readJson("/api/branches", signal),
            readJson("/api/currencies", signal),
            readJson("/api/payment-modes", signal),
        ]);

    if (
        !Array.isArray(branches) ||
        !Array.isArray(currencies) ||
        !Array.isArray(paymentModes)
    ) {
        throw new Error("Invalid payment filter options.");
    }

    return {
        clients,
        branches,
        currencies,
        paymentModes,
    };
}