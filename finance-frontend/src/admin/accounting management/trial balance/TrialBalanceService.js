const endpoint = (
    import.meta.env.VITE_TRIAL_BALANCE_API_URL ||
    "/api/trial-balance"
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
                        body:
                            JSON.stringify(body),
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
        const validation =
            data?.errors
                ? Object.values(data.errors)
                    .flat()
                    .join(" ")
                : "";

        const error = new Error(
            validation ||
            data?.message ||
            data?.detail ||
            data?.title ||
            "Trial Balance request failed."
        );

        error.status =
            response.status;

        error.details =
            data;

        throw error;
    }

    return data;
}

function createQuery(filters = {}) {
    const query =
        new URLSearchParams();

    for (
        const [key, value]
        of Object.entries(filters)
    ) {
        if (
            value !== "" &&
            value !== undefined &&
            value !== null
        ) {
            query.set(
                key,
                String(value)
            );
        }
    }

    return query.toString();
}

export async function getTrialBalance(
    filters,
    signal
) {
    const query =
        createQuery(filters);

    const result =
        await request(
            query
                ? "?" + query
                : "",
            { signal }
        );

    if (
        !result ||
        !Array.isArray(result.data) ||
        !Number.isInteger(result.total) ||
        result.total < 0
    ) {
        throw new Error(
            "The Accounting API returned an invalid Trial Balance result."
        );
    }

    return result;
}