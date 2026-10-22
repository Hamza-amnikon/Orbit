const endpoint = (
    import.meta.env.VITE_BANK_TRANSFER_API_URL ||
    "/api/bank-transfers"
).replace(/\/+$/, "");

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
            "Cannot reach BankingService.API. For a save or confirmation, refresh the transfer to check its status before retrying."
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
            "Bank transfer request failed."
        );

        error.status = response.status;

        throw error;
    }

    return data;
}

export function getBankTransfers(
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

export function getBankTransferById(
    id,
    signal
) {
    return request(
        "/" + id,
        { signal }
    );
}

export function getBankingExchangeRate(
    from,
    to,
    date,
    signal
) {
    const query = new URLSearchParams({ from, to });

    if (date) {
        query.set("date", date);
    }

    return request(
        "/exchange-rate?" + query.toString(),
        { signal }
    );
}

export function createBankTransfer(
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

export function updateBankTransfer(
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

export function confirmBankTransferSent(
    id,
    body
) {
    return request(
        "/" + id + "/confirm-sent",
        {
            method: "POST",
            body,
        }
    );
}

export function confirmBankTransferReceived(
    id,
    body
) {
    return request(
        "/" + id + "/confirm-received",
        {
            method: "POST",
            body,
        }
    );
}

export function cancelBankTransfer(
    id,
    rowVersion
) {
    return request(
        "/" + id + "/cancel",
        {
            method: "POST",
            body: {
                rowVersion,
            },
        }
    );
}
