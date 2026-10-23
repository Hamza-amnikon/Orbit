import {
    getBankAccountById,
} from "../bank accounts/BankAccountService";

import {
    resolveOpeningDefaults,
} from "./reconciliationFormat";

const endpoint = (
    import.meta.env.VITE_BANK_RECONCILIATION_API_URL ||
    "/api/bank-reconciliations"
).replace(/\/+$/, "");

async function request(path = "", { body, ...options } = {}) {
    const token = sessionStorage.getItem("orbit.finance.accessToken");
    let response;

    try {
        response = await fetch(endpoint + path, {
            ...options,
            headers: {
                ...(body !== undefined
                    ? { "Content-Type": "application/json" }
                    : {}),
                ...(token ? { Authorization: "Bearer " + token } : {}),
            },
            ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
        });
    } catch (failure) {
        if (failure.name === "AbortError") {
            throw failure;
        }

        throw new Error(
            "Cannot reach BankingService.API. Refresh the reconciliation to check whether changes saved before retrying."
        );
    }

    const data = await response.json().catch(() => null);

    if (!response.ok) {
        const validation = data?.errors
            ? Object.values(data.errors).flat().join(" ")
            : "";

        const error = new Error(
            validation || data?.message || data?.detail || data?.title ||
            "Reconciliation request failed."
        );

        error.status = response.status;
        throw error;
    }

    if (!data || typeof data !== "object") {
        throw new Error(
            "The reconciliation response was invalid. Refresh to check its status."
        );
    }

    return data;
}

export function getReconciliations(filters = {}, signal) {
    const query = new URLSearchParams();

    for (const [key, value] of Object.entries(filters)) {
        if (value !== "" && value !== undefined && value !== null) {
            query.set(key, String(value));
        }
    }

    const search = query.toString();

    return request(search ? "?" + search : "", { signal });
}

export function getReconciliationById(id, signal) {
    return request("/" + id, { signal });
}

export async function getReconciliationOpening(accountId, signal) {
    const [account, completed] = await Promise.all([
        getBankAccountById(accountId, signal),
        getReconciliations(
            {
                bankAccountId: accountId,
                status: "Completed",
                page: 1,
                pageSize: 1,
            },
            signal
        ),
    ]);

    if (
        account?.id !== accountId ||
        !Array.isArray(completed?.data) ||
        !Number.isInteger(completed.total) ||
        completed.total < 0 ||
        completed.data.length !== (completed.total > 0 ? 1 : 0)
    ) {
        throw new Error("Cannot determine the statement opening values. Refresh and try again.");
    }

    return resolveOpeningDefaults(account, completed.data[0]);
}

export function createReconciliation(body) {
    return request("", { method: "POST", body });
}

export function matchStatementLine(id, lineId, body) {
    return request("/" + id + "/lines/" + lineId + "/match", {
        method: "POST",
        body,
    });
}

export function autoMatchReconciliation(id, rowVersion) {
    return request("/" + id + "/auto-match", {
        method: "POST",
        body: { rowVersion },
    });
}

export function completeReconciliation(id, rowVersion) {
    return request("/" + id + "/complete", {
        method: "POST",
        body: { rowVersion },
    });
}
