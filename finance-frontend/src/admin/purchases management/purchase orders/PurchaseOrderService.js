const endpoint = "/api/purchase-orders";

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
            "Cannot reach PurchaseOrderService.API. Check that it is running."
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
            "Purchase order request failed."
        );

        error.status = response.status;

        throw error;
    }

    return data;
}

export async function getPurchaseOrders(
    {
        page = 1,
        search = "",
        status = "",
    } = {},
    signal
) {
    const query = new URLSearchParams({
        page: String(page),
        pageSize: "25",
    });

    if (search.trim()) {
        query.set("search", search.trim());
    }

    if (status !== "") {
        query.set("status", status);
    }

    const result = await request("?" + query, {
        signal,
    });

    if (
        !Array.isArray(result?.data) ||
        !Number.isInteger(result.total)
    ) {
        throw new Error("Invalid purchase order list.");
    }

    return result;
}

export function getPurchaseOrder(id, signal) {
    return request("/" + encodeURIComponent(id), {
        signal,
    });
}

export function getPurchaseOrderSummary(signal) {
    return request("/summary", {
        signal,
    });
}

export function previewPurchaseOrder(body) {
    return request("/preview", {
        method: "POST",
        body,
    });
}

export function createPurchaseOrder(body) {
    return request("", {
        method: "POST",
        body,
    });
}

export function updatePurchaseOrder(id, body) {
    return request("/" + encodeURIComponent(id), {
        method: "PUT",
        body,
    });
}

export function changePurchaseOrderStatus(
    id,
    action,
    rowVersion
) {
    return request(
        "/" + encodeURIComponent(id) + "/" + action,
        {
            method: "POST",
            body: {
                rowVersion,
            },
        }
    );
}

export async function getPurchaseVendors(search, signal) {
    const query = new URLSearchParams({
        pageSize: "50",
        search,
    });

    const result = await request(
        "/lookups/vendors?" + query,
        {
            signal,
        }
    );

    if (!Array.isArray(result?.data)) {
        throw new Error("Invalid vendor choices.");
    }

    return result;
}

export async function getPurchaseChoices(signal) {
    const [
        branches,
        currencies,
        paymentModes,
    ] = await Promise.all([
        request("/lookups/branches", {
            signal,
        }),
        request("/lookups/currencies", {
            signal,
        }),
        request("/lookups/payment-modes", {
            signal,
        }),
    ]);

    if (
        !Array.isArray(branches) ||
        !Array.isArray(currencies) ||
        !Array.isArray(paymentModes)
    ) {
        throw new Error("Invalid purchase order choices.");
    }

    return {
        branches,
        currencies,
        paymentModes,
    };
}

export async function convertPurchaseOrderToBill(
    id,
    rowVersion
) {
    let response;

    try {
        response = await fetch(
            `/api/bills/from-purchase-order/${encodeURIComponent(id)}`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    rowVersion,
                }),
            }
        );
    } catch {
        throw new Error(
            "Cannot reach BillService.API. Start its HTTPS profile on port 7193, then try again."
        );
    }

    const result = await response.json().catch(() => null);

    if (!response.ok) {
        const validation = result?.errors
            ? Object.values(result.errors).flat().join(" ")
            : "";

        const unavailable =
            response.status === 502 ||
            response.status === 504;

        const fallbackMessage = unavailable
            ? "BillService.API is unavailable. Start its HTTPS profile on port 7193, then try again."
            : "Unable to convert purchase order to bill.";

        const error = new Error(
            validation ||
            result?.message ||
            result?.detail ||
            result?.title ||
            fallbackMessage
        );

        error.status = response.status;

        throw error;
    }

    if (
        !Number.isInteger(result?.id) ||
        result.id < 1
    ) {
        throw new Error(
            "The conversion response was invalid. Refresh and try again to open the existing bill."
        );
    }

    return result;
}