const endpoint = "/api/vendors/locations";

async function getOptions(path, filters, signal) {
    const query = new URLSearchParams(filters);
    let response;
    try {
        response = await fetch(`${endpoint}/${path}?${query}`, { signal });
    } catch (error) {
        if (error.name === "AbortError") throw error;
        throw new Error("Cannot reach VendorService.API to load location choices.");
    }
    const data = await response.json().catch(() => null);
    if (!response.ok) {
        const validation = data?.errors ? Object.values(data.errors).flat().join(" ") : "";
        throw new Error(validation || data?.message || data?.detail || data?.title ||
            "Unable to load location choices.");
    }
    if (!Array.isArray(data) || data.some((value) => typeof value !== "string")) {
        throw new Error("The Vendor API returned invalid location choices.");
    }
    return data;
}

export function getCountries(signal) {
    return getOptions("countries", {}, signal);
}

export function getStates(country, signal) {
    return getOptions("states", { country }, signal);
}

export function getCities(country, state, signal) {
    return getOptions("cities", { country, ...(state ? { state } : {}) }, signal);
}

export function getCountryCurrencies(country, signal) {
    return getOptions("currencies", { country }, signal);
}
