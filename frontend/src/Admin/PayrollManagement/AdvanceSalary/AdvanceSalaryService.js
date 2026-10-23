const API_BASE_URL = String(
    import.meta.env.VITE_ADVANCE_SALARY_API_BASE_URL || "",
).replace(/\/+$/, "");
const RESOURCE_URL = API_BASE_URL ? `${API_BASE_URL}/api/AdvanceSalary` : "";

function ensureConfigured() {
    if (!RESOURCE_URL) {
        throw new Error("Advance Salary API URL is not configured. Set VITE_ADVANCE_SALARY_API_BASE_URL.");
    }
}

async function readResponse(response, fallbackMessage) {
    const payload = await response.json().catch(() => null);
    if (!response.ok) {
        throw new Error(payload?.message || payload?.title || fallbackMessage || `Request failed (${response.status}).`);
    }
    return payload;
}

function normalizeList(payload) {
    if (Array.isArray(payload)) return payload;
    return payload?.items ?? payload?.data ?? payload?.requests ?? [];
}

const AdvanceSalaryService = {
    async getAllRequests() {
        ensureConfigured();
        const response = await fetch(RESOURCE_URL, { headers: { Accept: "application/json" } });
        return normalizeList(await readResponse(response, "Could not load advance salary requests."));
    },

    async getEmployeeRequests(employeeId) {
        ensureConfigured();
        if (!employeeId) throw new Error("Employee ID is required.");
        const response = await fetch(`${RESOURCE_URL}/employee/${encodeURIComponent(employeeId)}`, {
            headers: { Accept: "application/json" },
        });
        return normalizeList(await readResponse(response, "Could not load your advance salary requests."));
    },

    async getEmployeeRepayments(employeeId) {
        ensureConfigured();
        if (!employeeId) throw new Error("Employee ID is required.");
        const response = await fetch(`${RESOURCE_URL}/employee/${encodeURIComponent(employeeId)}/repayments`, {
            headers: { Accept: "application/json" },
        });
        return normalizeList(await readResponse(response, "Could not load your recorded repayments."));
    },

    async createRequest(payload) {
        ensureConfigured();
        const response = await fetch(RESOURCE_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json", Accept: "application/json" },
            body: JSON.stringify(payload),
        });
        return readResponse(response, "Could not submit the advance salary request.");
    },

    async updateRequestStatus(requestId, status, payload) {
        ensureConfigured();
        if (!requestId) throw new Error("Advance salary request ID is required.");
        const response = await fetch(`${RESOURCE_URL}/${encodeURIComponent(requestId)}/status`, {
            method: "PUT",
            headers: { "Content-Type": "application/json", Accept: "application/json" },
            body: JSON.stringify({ ...payload, status }),
        });
        return readResponse(response, `Could not ${status.toLowerCase()} the advance salary request.`);
    },
};

export default AdvanceSalaryService;
