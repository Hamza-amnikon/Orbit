const endpoint = (
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
                        ? {
                            "Content-Type":
                                "application/json",
                        }
                        : {}),
                    ...(token
                        ? {
                            Authorization:
                                "Bearer " + token,
                        }
                        : {}),
                    ...headers,
                },
                ...(body !== undefined
                    ? {
                        body: JSON.stringify(body),
                    }
                    : {}),
            }
        );
    } catch (error) {
        if (error.name === "AbortError") {
            throw error;
        }

        throw new Error(
            "Cannot reach AccountingService.API. " +
            "Check that it is running."
        );
    }

    const data = await response
        .json()
        .catch(() => null);

    if (!response.ok) {
        const validation = data?.errors
            ? Object.values(data.errors)
                .flat()
                .join(" ")
            : "";

        const error = new Error(
            validation ||
            data?.message ||
            data?.detail ||
            data?.title ||
            "Chart of Accounts request failed."
        );

        error.status = response.status;
        error.details = data;

        throw error;
    }

    return data;
}

function createQuery(filters = {}) {
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

    return query.toString();
}

export async function getAccounts(
    filters = {},
    signal
) {
    const query = createQuery(filters);

    const result = await request(
        query ? "?" + query : "",
        { signal }
    );

    if (
        !Array.isArray(result?.data) ||
        !Number.isInteger(result.total) ||
        result.total < 0
    ) {
        throw new Error(
            "The Accounting API returned an invalid account list."
        );
    }

    return result;
}

export async function getAccountTree(
    companyId,
    signal
) {
    const query = createQuery({ companyId });

    const result = await request(
        "/tree?" + query,
        { signal }
    );

    if (!Array.isArray(result)) {
        throw new Error(
            "The Accounting API returned an invalid account tree."
        );
    }

    return result;
}

export function getAccountById(
    id,
    companyId,
    signal
) {
    const query = createQuery({ companyId });

    return request(
        "/" + encodeURIComponent(id) +
        "?" + query,
        { signal }
    );
}

export function createAccount(
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

export function updateAccount(
    id,
    companyId,
    body
) {
    const query = createQuery({ companyId });

    return request(
        "/" + encodeURIComponent(id) +
        "?" + query,
        {
            method: "PUT",
            body,
        }
    );
}

export function getAccountingCompanies(
    signal
) {
    return request(
        "/lookups/companies",
        { signal }
    );
}
