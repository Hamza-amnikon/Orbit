const endpoint = "http://localhost:5080/api/clients";

async function request(url, { body, ...options } = {}) {
    const response = await fetch(url, {
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
            `Request failed (${response.status})`
        );

        error.status = response.status;
        throw error;
    }

    return data;
}

export async function getClients({ page = 1, pageSize = 25, search = "" } = {}, signal) {
    const parameters = new URLSearchParams({
        page: String(page),
        pageSize: String(pageSize),
    });

    if (search.trim()) {
        parameters.set("search", search.trim());
    }

    return request(`${endpoint}?${parameters}`, { signal });
}

export async function getClientById(id, signal) {
    return request(`${endpoint}/${encodeURIComponent(id)}`, { signal });
}

export async function createClient(data) {
    return request(endpoint, {
        method: "POST",
        body: data,
    });
}

export async function updateClient(id, data) {
    return request(`${endpoint}/${encodeURIComponent(id)}`, {
        method: "PUT",
        body: data,
    });
}

export async function archiveClient(id, rowVersion) {
    return request(`${endpoint}/${encodeURIComponent(id)}`, {
        method: "DELETE",
        body: { rowVersion },
    });
}
