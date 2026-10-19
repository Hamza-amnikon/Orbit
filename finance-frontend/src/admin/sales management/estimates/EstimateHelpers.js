export const estimateStatuses = ["Draft", "Sent", "Accepted", "Declined", "Cancelled", "Converted"];
export const serviceUnits = ["Hour", "Day", "Month", "Fixed fee"];

export function estimateStatus(value) {
    return estimateStatuses[value] || value || "Unknown";
}

export function today() {
    const date = new Date();
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export function formatDate(value) {
    if (!value) return "—";
    const [year, month, day] = value.slice(0, 10).split("-");
    return `${day}/${month}/${year}`;
}

export function formatAmount(value, currency) {
    if (value == null || !currency) return "—";
    try {
        return new Intl.NumberFormat(undefined, { style: "currency", currency, currencyDisplay: "code" }).format(value);
    } catch {
        return `${currency} ${value}`;
    }
}

export function billingAddress(client) {
    return [client.address, client.city, client.state, client.country, client.postalCode]
        .filter(value => value?.trim()).map(value => value.trim()).join(", ");
}
