async function request(path, options = {})
{
    const token = sessionStorage.getItem("orbit.finance.accessToken");
    const response = await fetch(`/api/tax-settings${path}`, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
    });
    const data = await response.json().catch(() => null);

    if (!response.ok || data == null)
    {
        const validation = data?.errors ? Object.values(data.errors).flat().join(" ") : "";
        throw new Error(validation || data?.message || data?.title || "Tax Settings could not be loaded or saved.");
    }

    return data;
}

export function getTaxSetup(signal)
{
    return request("/lookups", { signal });
}

export function getTaxRates(companyId, signal)
{
    return request(`?${new URLSearchParams({ companyId })}`, { signal });
}

export function saveTaxRate(value)
{
    return request(value.id ? `/${value.id}` : "", {
        method: value.id ? "PUT" : "POST",
        body: JSON.stringify({
            ...value,
            companyId: Number(value.companyId),
            taxTypeId: Number(value.taxTypeId),
            effectiveTo: value.effectiveTo || null,
            components: value.components.map(item => ({
                name: item.name,
                rate: Number(item.rate)
            }))
        })
    });
}
