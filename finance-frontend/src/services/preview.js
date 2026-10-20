// Local development only. Set VITE_FINANCE_PREVIEW=false to connect your API.
export const previewMode = import.meta.env.DEV && import.meta.env.VITE_FINANCE_PREVIEW !== "false";
export const previewUser = { id: "frontend-preview", name: "Mahinoor", role: "Admin" };

export function previewRequest(path, options = {}) {
  if ((options.method || "GET").toUpperCase() !== "GET") {
    throw new Error("This is a frontend preview. Connect your API to save changes.");
  }

  const url = new URL(path, "http://preview.local/");
  const endpoint = url.pathname;
  if (endpoint === "/auth/me") return previewUser;
  if (endpoint === "/dashboard/activity" || endpoint === "/accounting/ledger" || endpoint === "/reconciliations" || endpoint.startsWith("/attachments/")) return [];
  if (endpoint === "/dashboard") {
    const currency = url.searchParams.get("currency") || "INR";
    return {
      revenue: 0, expenses: 0, received: 0, paid: 0,
      accountsReceivable: 0, accountsPayable: 0, customers: 0, vendors: 0,
      branch: url.searchParams.get("branch") || "All", currency,
      rateToInr: currency === "INR" ? 1 : null, rateDate: null, rateSource: "Frontend preview",
    };
  }
  if (endpoint === "/currencies") return { rates: [], live: { available: false } };
  if (endpoint === "/accounting/reports") return {
    trial: [], banks: [],
    profitAndLoss: { income: 0, expenses: 0, profit: 0 },
    balanceSheet: { assets: 0, liabilities: 0, equity: 0, retainedEarnings: 0, difference: 0 },
    cashFlow: { opening: 0, received: 0, paid: 0, closing: 0 },
  };
  return { data: [], total: 0 };
}
