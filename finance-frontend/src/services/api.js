import { previewMode, previewRequest } from "./preview";

const baseUrl = (
    import.meta.env.VITE_FINANCE_API_URL || (import.meta.env.DEV ? "http://localhost:5080" : "")
).replace(/\/$/, "");


export async function request(path, { body, live = false, useProxy = false, timeoutMs, ...options } = {}) {
    if (previewMode && !live) {
        return previewRequest(path, { ...options, body });
    }

    const isFormData = body instanceof FormData;
    const requestUrl = useProxy
        ? `/api/${path}`
        : `${baseUrl}/api/${path}`;
    const timeout = timeoutMs ? AbortSignal.timeout(timeoutMs) : null;
    const signal = timeout
        ? (options.signal ? AbortSignal.any([options.signal, timeout]) : timeout)
        : options.signal;
    let response;
    try {
      response = await fetch(requestUrl, {
        ...options,
        signal,
        headers: {
            ...(body !== undefined && !isFormData
                ? { "Content-Type": "application/json" }
                : {}),
            ...options.headers,
        },
        ...(body !== undefined
            ? { body: isFormData ? body : JSON.stringify(body) }
            : {}),
      });
    } catch (error) {
        if (timeout?.aborted && !options.signal?.aborted) {
            throw new Error("The server took too long to respond. Please retry.");
        }
        throw error;
    }

    const payload = await response.json().catch(error => {
        if (timeout?.aborted && !options.signal?.aborted) {
            throw new Error("The server took too long to respond. Please retry.");
        }
        if (signal?.aborted) throw error;
        return null;
    });

    if (!response.ok) {
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

