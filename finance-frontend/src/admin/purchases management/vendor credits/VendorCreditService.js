const endpoint = "/api/vendor-credits";

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
            ...(body !== undefined
                ? { body: JSON.stringify(body) }
                : {}),
        });
    } catch (error) {
        if (error.name === "AbortError") {
            throw error;
        }

        throw new Error(
            "Cannot reach VendorCreditService.API. Check that it is running."
        );
    }

    const data = await response.json().catch(() => null);

    if (!response.ok) {
        const validation = data?.errors
            ? Object.values(data.errors).flat().join(" ")
            : "";

        const error = new Error(
            validation ||
            data?.message ||
            data?.detail ||
            data?.title ||
            "Vendor credit request failed."
        );

        error.status = response.status;

        throw error;
    }

    return data;
}

export async function getVendorCredits(
    {
        page = 1,
        pageSize = 25,
        search = "",
        status = "",
        vendorId = "",
        fromDate = "",
        toDate = "",
    } = {},
    signal
) {
    const query = new URLSearchParams({
        page: String(page),
        pageSize: String(pageSize),
    });

    for (const [name, value] of Object.entries({
        search,
        status,
        vendorId,
        fromDate,
        toDate,
    })) {
        const text = String(value ?? "").trim();

        if (text) {
            query.set(name, text);
        }
    }

    const result = await request("?" + query, { signal });

    if (
        !Array.isArray(result?.data) ||
        !Number.isInteger(result.total) ||
        result.total < 0
    ) {
        throw new Error("Invalid vendor credit list.");
    }

    return result;
}

export function getVendorCredit(id, signal) {
    return request("/" + encodeURIComponent(id), { signal });
}

export function previewVendorCredit(body) {
    return request("/preview", { method: "POST", body });
}

export function createVendorCredit(body) {
    return request("", { method: "POST", body });
}

export function updateVendorCredit(id, body) {
    return request("/" + encodeURIComponent(id), {
        method: "PUT",
        body,
    });
}

export function changeVendorCreditStatus(id, action, rowVersion) {
    return request(
        "/" + encodeURIComponent(id) + "/" + action,
        {
            method: "POST",
            body: { rowVersion },
        }
    );
}

export async function getVendorCreditChoices(signal) {
    const [branches, currencies] = await Promise.all([
        request("/lookups/branches", { signal }),
        request("/lookups/currencies", { signal }),
    ]);

    if (!Array.isArray(branches) || !Array.isArray(currencies)) {
        throw new Error("Invalid vendor credit choices.");
    }

    return { branches, currencies };
}

export async function getVendorCreditVendors(search, signal) {
    const query = new URLSearchParams({
        page: "1",
        pageSize: "50",
        search,
    });

    const result = await request("/lookups/vendors?" + query, {
        signal,
    });

    if (!Array.isArray(result?.data)) {
        throw new Error("Invalid vendor choices.");
    }

    return result;
}

export async function getVendorCreditBills(filters, signal) {
    const query = new URLSearchParams({
        page: "1",
        pageSize: "50",
        ...filters,
    });

    const result = await request("/lookups/bills?" + query, {
        signal,
    });

    if (!Array.isArray(result?.data)) {
        throw new Error("Invalid bill choices.");
    }

    return result;
}

export function getCreditApplicationBills(creditId, search, signal) {
    const query = new URLSearchParams({
        search,
        page: "1",
        pageSize: "50",
    });

    return request(
        "/" + encodeURIComponent(creditId) + "/applications/bills?" + query,
        { signal }
    );
}

export function applyVendorCredit(creditId, body) {
    return request("/" + encodeURIComponent(creditId) + "/applications", {
        method: "POST",
        body,
    });
}

export function voidCreditApplication(creditId, applicationId, body) {
    return request(
        "/" + encodeURIComponent(creditId) + "/applications/" +
            encodeURIComponent(applicationId) + "/void",
        {
            method: "POST",
            body,
        }
    );
}
