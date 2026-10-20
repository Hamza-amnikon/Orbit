const endpoint = (import.meta.env.VITE_EXPENSE_API_URL || "/api/expenses").replace(/\/$/, "");

async function request(path = "", { body, ...options } = {}) {
    const isFile = body instanceof FormData;
    const token = sessionStorage.getItem("orbit.finance.accessToken");
    let response;

    try {
        response = await fetch(endpoint + path, {
            ...options,
            headers: {
                ...(body !== undefined && !isFile ? { "Content-Type": "application/json" } : {}),
                ...(token ? { Authorization: "Bearer " + token } : {}),
                ...options.headers,
            },
            ...(body !== undefined ? { body: isFile ? body : JSON.stringify(body) } : {}),
        });
    } catch (error) {
        if (error.name === "AbortError") throw error;
        throw new Error("Cannot reach ExpenseService.API. Check that it is running.");
    }

    if (options.download && response.ok) return response;
    const data = await response.json().catch(() => null);
    if (!response.ok) {
        const validation = data?.errors ? Object.values(data.errors).flat().join(" ") : "";
        const error = new Error(validation || data?.message || data?.detail || data?.title || "Expense request failed.");
        error.status = response.status;
        throw error;
    }
    return data;
}

export function getExpenses(filters, signal) {
    const query = new URLSearchParams();
    for (const [key, value] of Object.entries(filters)) {
        if (value !== "" && value !== undefined && value !== null) query.set(key, value);
    }
    return request("?" + query, { signal });
}

export function getExpense(id, displayCurrency, signal) {
    return request("/" + id + "?displayCurrency=" + displayCurrency, { signal });
}

export function saveExpense(id, body) {
    return request(id ? "/" + id : "", { method: id ? "PUT" : "POST", body });
}

export function voidExpense(id, body) {
    return request("/" + id + "/void", { method: "POST", body });
}

export function getCompanies(signal) {
    return request("/companies", { signal });
}

export function addCompany(body) {
    return request("/companies", { method: "POST", body });
}

export function getAccounts(signal) {
    return request("/bank-accounts", { signal });
}

export function addAccount(body) {
    return request("/bank-accounts", { method: "POST", body });
}

export function uploadReceipt(id, file, rowVersion) {
    const body = new FormData();
    body.append("file", file);
    body.append("rowVersion", rowVersion);
    return request("/" + id + "/receipt", { method: "POST", body });
}

export async function downloadReceipt(id, name) {
    const response = await request("/" + id + "/receipt", { download: true });
    const url = URL.createObjectURL(await response.blob());
    const link = document.createElement("a");
    link.href = url;
    link.download = name;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function money(amount, currency, precision) {
    if (amount == null || !currency) return "—";
    return new Intl.NumberFormat("en-IN", {
        style: "currency", currency, currencyDisplay: "code",
        ...(precision == null ? {} : {
            minimumFractionDigits: precision,
            maximumFractionDigits: precision,
        }),
    }).format(amount);
}

export function formatDate(date) {
    return date ? date.slice(0, 10).split("-").reverse().join("/") : "—";
}

export function getPreference(name, fallback) {
    try { return localStorage.getItem("orbit.expenses." + name) || fallback; }
    catch { return fallback; }
}

export function setPreference(name, value) {
    try { localStorage.setItem("orbit.expenses." + name, value); }
    catch { /* Currency selection still works when storage is unavailable. */ }
}

export async function getExpenseChoices(signal) {
    const [countries, currencies] = await Promise.all([
        request("/lookups/countries", { signal }),
        request("/lookups/currencies", { signal }),
    ]);

    if (!Array.isArray(countries) || !Array.isArray(currencies)) {
        throw new Error("Invalid expense master data.");
    }

    return { countries, currencies };
}

export function convertExpenseAmount(amount, currency, target, rate, base, quote) {
    if (currency === target) {
        return amount;
    }

    if (!(rate > 0)) {
        return null;
    }

    if (currency === base && target === quote) {
        return amount * rate;
    }

    if (currency === quote && target === base) {
        return amount / rate;
    }

    return null;
}

export function getAutomaticExpenseRate(from, to, date, signal) {
    const query = new URLSearchParams({ from, to, date });

    return request("/exchange-rate?" + query, { signal });
}
