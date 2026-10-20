const endpoint = "/api/vendors";

async function request(url, { body, ...options } = {}) {
    let response;
    try {
        response = await fetch(url, {
            ...options,
            headers: {
                ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
                ...options.headers,
            },
            ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
        });
    } catch (error) {
        if (error.name === "AbortError") throw error;
        throw new Error("Cannot reach the Vendor API. Check that VendorService.API is running.");
    }
    const data = response.status === 204 ? null : await response.json().catch(() => null);
    if (!response.ok) {
        const validation = data?.errors ? Object.values(data.errors).flat().join(" ") : "";
        const error = new Error(validation || data?.message || data?.detail || data?.title ||
            `Vendor request failed (${response.status}).`);
        error.status = response.status;
        throw error;
    }
    return data;
}

export async function getVendors({ page = 1, pageSize = 25, search = "", isActive = "" } = {}, signal) {
    const query = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
    if (search.trim()) query.set("search", search.trim());
    if (isActive !== "" && isActive != null) query.set("isActive", String(isActive));
    const result = await request(`${endpoint}?${query}`, { signal });
    if (!Array.isArray(result?.data) || !Number.isInteger(result.total) || result.total < 0) {
        throw new Error("The Vendor API returned an invalid list.");
    }
    return result;
}

export function getVendorById(id, signal) {
    return request(`${endpoint}/${encodeURIComponent(id)}`, { signal });
}

export function createVendor(data) {
    return request(endpoint, { method: "POST", body: data });
}

export function updateVendor(id, data) {
    return request(`${endpoint}/${encodeURIComponent(id)}`, { method: "PUT", body: data });
}

export function archiveVendor(id, rowVersion) {
    return request(`${endpoint}/${encodeURIComponent(id)}/archive`, {
        method: "POST", body: { rowVersion },
    });
}
