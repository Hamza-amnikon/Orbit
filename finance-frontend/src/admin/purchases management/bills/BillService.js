const endpoint = "/api/bills";

async function request(path = "", { body, ...options } = {}) {
    let response;
    try {
        response = await fetch(endpoint + path, {
            ...options,
            headers: { ...(body !== undefined ? { "Content-Type": "application/json" } : {}), ...options.headers },
            ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
        });
    } catch (error) {
        if (error.name === "AbortError") throw error;
        throw new Error("Cannot reach BillService.API. Check that it is running.");
    }
    const data = await response.json().catch(() => null);
    if (!response.ok) {
        const validation = data?.errors ? Object.values(data.errors).flat().join(" ") : "";
        const error = new Error(validation || data?.message || data?.detail || data?.title || "Bill request failed.");
        error.status = response.status;
        throw error;
    }
    return data;
}
export async function getBills({ page = 1, search = "", status = "" } = {}, signal) {
    const query = new URLSearchParams({ page: String(page), pageSize: "25" });
    if (search.trim()) query.set("search", search.trim());
    if (status !== "") query.set("status", status);
    const result = await request("?" + query, { signal });
    if (!Array.isArray(result?.data) || !Number.isInteger(result.total)) throw new Error("Invalid bill list.");
    return result;
}
export function getBill(id, signal) { return request("/" + encodeURIComponent(id), { signal }); }
export function getBillSummary(signal) { return request("/summary", { signal }); }
export function previewBill(body) { return request("/preview", { method: "POST", body }); }
export function createBill(body) { return request("", { method: "POST", body }); }
export function updateBill(id, body) { return request("/" + encodeURIComponent(id), { method: "PUT", body }); }
export function changeBillStatus(id, action, rowVersion) {
    return request("/" + encodeURIComponent(id) + "/" + action, { method: "POST", body: { rowVersion } });
}
export async function getPurchaseVendors(search, signal) {
    const data = await request("/lookups/vendors?" + new URLSearchParams({ pageSize: "50", search }), { signal });
    if (!Array.isArray(data?.data)) throw new Error("Invalid vendor choices.");
    return data;
}
export async function getPurchaseChoices(signal) {
    const [branches, currencies] = await Promise.all([
        request("/lookups/branches", { signal }), request("/lookups/currencies", { signal }),
    ]);
    if (!Array.isArray(branches) || !Array.isArray(currencies)) throw new Error("Invalid bill choices.");
    return { branches, currencies };
}
