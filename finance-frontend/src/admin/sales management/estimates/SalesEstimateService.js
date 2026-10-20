const endpoint = "/api/sales-estimates";

async function request(url, { body, ...options } = {}) {
    let response;

    try {
        response = await fetch(url, {
            ...options,
            headers: body === undefined ? undefined : { "Content-Type": "application/json" },
            ...(body === undefined ? {} : { body: JSON.stringify(body) }),
        });
    } catch (failure) {
        if (failure.name === "AbortError") throw failure;
        throw new Error("Unable to reach the estimate service. Please try again.");
    }

    const data = await response.json().catch(() => null);

    if (!response.ok || data == null) {
        const validation = data?.errors ? Object.values(data.errors).flat().join(" ") : "";
        const error = new Error(validation || data?.message || data?.title || "The estimate service is unavailable. Please try again.");
        error.status = response.status;
        throw error;
    }

    return data;
}

export async function getEstimates({ page, pageSize, search, status }, signal) {
    const query = new URLSearchParams({ page, pageSize });
    if (search.trim()) query.set("search", search.trim());
    if (status !== "") query.set("status", status);
    const result = await request(`${endpoint}?${query}`, { signal });

    if (!Array.isArray(result.data) || !Number.isInteger(result.total) || result.total < 0) {
        throw new Error("Unable to read the estimate list.");
    }

    return result;
}

export async function getEstimate(id, signal) {
    const result = await request(`${endpoint}/${id}`, { signal });
    if (result.id !== id || !Array.isArray(result.items)) throw new Error("Unable to read estimate details.");
    return result;
}

export function previewEstimate(body) {
    return request(`${endpoint}/preview`, { method: "POST", body });
}

export function saveEstimate(body, id) {
    return request(id ? `${endpoint}/${id}` : endpoint, { method: id ? "PUT" : "POST", body });
}

export function changeEstimateStatus(id, action, rowVersion) {
    if (!["send", "accept", "decline"].includes(action)) throw new Error("Unknown estimate action.");
    return request(`${endpoint}/${id}/${action}`, { method: "POST", body: { rowVersion } });
}

export function convertEstimate(id, body) {
    return request(`${endpoint}/${id}/convert-to-invoice`, { method: "POST", body });
}

export async function getEstimateClients(signal) {
    const clients = [];
    let total;
    let page = 1;

    do {
        const result = await request(`/api/clients?page=${page}&pageSize=100`, { signal });
        if (!Array.isArray(result.data) || !Number.isInteger(result.total) || result.total < 0) {
            throw new Error("Unable to read client options.");
        }
        clients.push(...result.data);
        total = result.total;
        if (result.data.length === 0) break;
        page += 1;
    } while (clients.length < total);

    return clients.filter(client => client.isActive);
}

export async function getConversionPaymentModes(signal) {
    const modes = await request("/api/payment-modes", { signal });
    if (!Array.isArray(modes)) throw new Error("Payment modes could not be loaded.");
    return modes.filter(mode => mode.isActive !== false);
}
