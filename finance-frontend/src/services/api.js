import { previewMode, previewRequest } from "./preview";

const baseUrl = (
    import.meta.env.VITE_FINANCE_API_URL || "http://localhost:5080"
).replace(/\/$/, "");

const tokenKey = "orbit.finance.accessToken";

export async function request(path, { body, live = false, useProxy = false, ...options } = {}) {
    if (previewMode && !live) {
        return previewRequest(path, { ...options, body });
    }

    const token = sessionStorage.getItem(tokenKey);
    const isFormData = body instanceof FormData;
    const requestUrl = useProxy
        ? `/api/${path}`
        : `${baseUrl}/api/${path}`;
    const response = await fetch(requestUrl, {
        ...options,
        headers: {
            ...(body !== undefined && !isFormData
                ? { "Content-Type": "application/json" }
                : {}),
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...options.headers,
        },
        ...(body !== undefined
            ? { body: isFormData ? body : JSON.stringify(body) }
            : {}),
    });

    const payload = await response.json().catch(() => null);

    if (!response.ok) {
        if (response.status === 401 && path !== "auth/login") {
            sessionStorage.removeItem(tokenKey);
            window.dispatchEvent(new Event("finance:unauthorized"));
        }

        const validation = payload?.errors
            ? Object.values(payload.errors).flat().join(" ")
            : "";

        const error = new Error(
            validation ||
            payload?.message ||
            payload?.detail ||
            payload?.title ||
            `Finance API returned ${response.status}`
        );

        error.status = response.status;
        error.details = payload;
        throw error;
    }

    return payload;
}
