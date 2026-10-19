const API_URL = "http://localhost:5080/api/country-master";

async function getOptions(path, filters = {}, signal) {
    const parameters = new URLSearchParams(filters);
    const query = parameters.toString();

    const response = await fetch(
        `${API_URL}/${path}${query ? `?${query}` : ""}`,
        { signal }
    );

    const data = await response.json().catch(() => null);

    if (!response.ok) {
        const validation = data?.errors
            ? Object.values(data.errors).flat().join(" ")
            : "";

        throw new Error(
            validation ||
            data?.message ||
            data?.detail ||
            `Location request failed (${response.status})`
        );
    }

    if (!Array.isArray(data)) {
        throw new Error("The location API returned an unexpected response.");
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
    return getOptions(
        "cities",
        { country, ...(state ? { state } : {}) },
        signal
    );
}