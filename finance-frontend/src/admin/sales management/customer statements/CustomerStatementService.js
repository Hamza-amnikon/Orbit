const endpoint = "/api/customer-statements";

async function readJson(url, signal) {
    const response = await fetch(url, { signal });
    const result = await response.json().catch(() => null);

    if (!response.ok) {
        throw new Error(
            result?.message ||
            result?.detail ||
            result?.title ||
            "Unable to load customer statement."
        );
    }

    return result;
}

export function getStatementClients(signal) {
    return readJson(`${endpoint}/clients`, signal);
}

export function getCustomerStatement(client, signal) {
    const query = new URLSearchParams({
        clientId: client.clientId,
        branch: client.branch,
        currency: client.currency,
    });

    return readJson(`${endpoint}?${query}`, signal);
}
