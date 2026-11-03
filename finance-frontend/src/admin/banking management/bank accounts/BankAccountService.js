const endpoint = (
    import.meta.env.VITE_BANKING_API_URL ||
    "/api/bank-accounts"
).replace(/\/$/, "");

const accountingEndpoint = (
    import.meta.env.VITE_ACCOUNTING_API_URL ||
    "/api/accounts"
).replace(/\/$/, "");

async function request(
    path = "",
    {
        body,
        headers,
        ...options
    } = {}
) {
    const token = sessionStorage.getItem(
        "orbit.finance.accessToken"
    );

    let response;

    try {
        response = await fetch(
            endpoint + path,
            {
                ...options,
                headers: {
                    ...(body !== undefined
                        ? { "Content-Type": "application/json" }
                        : {}),
                    ...(token
                        ? { Authorization: "Bearer " + token }
                        : {}),
                    ...headers,
                },
                ...(body !== undefined
                    ? { body: JSON.stringify(body) }
                    : {}),
            }
        );
    } catch (error) {
        if (error.name === "AbortError") {
            throw error;
        }

        throw new Error(
            "Cannot reach BankingService.API. Check that it is running."
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
            "Bank account request failed."
        );

        error.status = response.status;

        throw error;
    }

    return data;
}

export function getBankAccounts(
    filters = {},
    signal
) {
    const query = new URLSearchParams();

    for (const [key, value] of Object.entries(filters)) {
        if (
            value !== "" &&
            value !== undefined &&
            value !== null
        ) {
            query.set(key, String(value));
        }
    }

    const search = query.toString();

    return request(
        search ? "?" + search : "",
        { signal }
    );
}

export function getBankAccountById(
    id,
    signal
) {
    return request(
        "/" + id,
        { signal }
    );
}

export function getBankAccountBalance(
    id,
    signal
) {
    return request(
        "/" + id + "/balance",
        { signal }
    );
}

export function createBankAccount(
    body
) {
    return request(
        "",
        {
            method: "POST",
            body,
        }
    );
}

export function updateBankAccount(
    id,
    body
) {
    return request(
        "/" + id,
        {
            method: "PUT",
            body,
        }
    );
}

export function configureOpeningBalance(
    id,
    body
) {
    return request(
        "/" + id + "/opening-balance",
        {
            method: "POST",
            body,
        }
    );
}

export function getBankingCompanies(
    signal
) {
    return request(
        "/lookups/companies",
        { signal }
    );
}

export function getBankingCurrencies(
    signal
) {
    return request(
        "/lookups/currencies",
        { signal }
    );
}

export async function getBankAccountingAccounts(
    companyId,
    signal
) {
    const token = sessionStorage.getItem(
        "orbit.finance.accessToken"
    );

    let response;

    try {
        response = await fetch(
            accountingEndpoint +
            "/tree?companyId=" +
            encodeURIComponent(companyId),
            {
                signal,
                headers: token
                    ? { Authorization: "Bearer " + token }
                    : {},
            }
        );
    } catch (error) {
        if (error.name === "AbortError") {
            throw error;
        }

        throw new Error(
            "Cannot reach AccountingService.API. Check that it is running."
        );
    }

    const data = await response.json().catch(() => null);

    if (!response.ok) {
        throw new Error(
            data?.message ||
            data?.detail ||
            data?.title ||
            "Accounting account request failed."
        );
    }

    if (!Array.isArray(data)) {
        throw new Error(
            "The Accounting API returned an invalid account list."
        );
    }

    const bankGroup = data.find(account =>
        account.systemKey === "BANK_ACCOUNTS"
    );

    if (!bankGroup) {
        return [];
    }

    return data.filter(account =>
        account.parentAccountId === bankGroup.id &&
        account.type === "Asset" &&
        account.isPostingAccount &&
        !account.isControlAccount &&
        !account.isSystemAccount &&
        account.isActive
    );
}
