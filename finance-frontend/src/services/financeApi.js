import { request } from "./api";

const baseUrl = (import.meta.env.VITE_FINANCE_API_URL || "http://localhost:5080").replace(/\/$/, "");
const tokenKey = "orbit.finance.accessToken";
function query(filters = {}) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(filters)) {
    if (value !== undefined && value !== null && value !== "") params.set(key, String(value));
  }
  return params.size ? `?${params}` : "";
}

function resource(path) {
  return {
    list: (filters, signal) => request(`${path}${query(filters)}`, { signal }),
    get: (id, signal) => request(`${path}/${encodeURIComponent(id)}`, { signal }),
    create: (body) => request(path, { method: "POST", body }),
    update: (id, body) => request(`${path}/${encodeURIComponent(id)}`, { method: "PUT", body }),
  };
}

export const financeApi = {
  currencies: () => request("currencies"),
  saveRate: body => request("currencies", { method: "POST", body }),
  hasSession: () => !!sessionStorage.getItem(tokenKey),
  async login(email, password) {
    const result = await request("auth/login", { method: "POST", body: { email, password } });
    sessionStorage.setItem(tokenKey, result.accessToken);
    return result;
  },
  logout: () => sessionStorage.removeItem(tokenKey),
  me: () => request("auth/me"),
  createUser: (body) => request("auth/users", { method: "POST", body }),
  users: { ...resource("auth/users"), },
  workspace: (kind) => ({ ...resource(`workspace/${kind}`), changeStatus: (id, body) => request(`workspace/${kind}/${id}/status`, { method: "PATCH", body }) }),
  expenses: (kind) => ({ ...resource(`expenses/${kind}`), changeStatus: (id, body) => request(`expenses/${kind}/${id}/status`, { method: "PATCH", body }) }),
  ledger: (filters) => request(`accounting/ledger${query(filters)}`),
  accounting: (filters) => request(`accounting/reports${query(filters)}`),
  audit: (filters) => request(`accounting/audit${query(filters)}`),
  attachments: (source, id) => ({
    list: () => request(`attachments/${source}/${id}`),
    upload: (body) => request(`attachments/${source}/${id}`, { method: "POST", body }),
    async download(attachment) {
      const response = await fetch(`${baseUrl}/api/attachments/${source}/${id}/${attachment.id}`, { headers: { Authorization: `Bearer ${sessionStorage.getItem(tokenKey)}` } });
      if (!response.ok) throw new Error(`Download failed (${response.status}). Sign in again if your session expired.`);
      const url = URL.createObjectURL(await response.blob()); const link = document.createElement("a"); link.href = url; link.download = attachment.fileName; link.click(); URL.revokeObjectURL(url);
    },
  }),
  reconciliations: {
    ...resource("reconciliations"),
    match: (id, lineId, body) => request(`reconciliations/${id}/lines/${lineId}`, { method: "PATCH", body }),
    complete: (id, body) => request(`reconciliations/${id}/complete`, { method: "PATCH", body }),
  },
  clients: resource("clients"),
  customers: resource("clients"),
  vendors: resource("parties/Vendor"),
  documents: (kind) => ({
    ...resource(`documents/${encodeURIComponent(kind)}`),
    changeStatus: (id, status, rowVersion) => request(`documents/${encodeURIComponent(kind)}/${encodeURIComponent(id)}/status`, {
      method: "PATCH", body: { status, rowVersion },
    }),
  }),
  payments: (direction) => {
    const { list, get, create } = resource(`payments/${encodeURIComponent(direction)}`);
    return { list, get, create };
  },
  dashboard: (filters) => request(`dashboard${query(filters)}`, { live: true, useProxy: true }),
  activity: () => request("dashboard/activity", { live: true, useProxy: true }),
};

export async function allRecords(api, filters = {}, signal) {
  const records = [];
  for (let page = 1; ; page++) {
    const result = await api.list({ ...filters, page, pageSize: 100 }, signal);
    records.push(...result.data);
    if (records.length >= result.total || result.data.length === 0) return records;
  }
}
