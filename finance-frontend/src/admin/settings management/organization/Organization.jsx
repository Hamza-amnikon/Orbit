import DraftModule from "../../shared/DatabaseModule";
import { moduleConfigs } from "../../shared/moduleConfigs";
import { Feedback } from "../../../live/shared";
import { useLoad } from "../../../live/data";
import OrganizationForm from "./OrganizationForm";
import OrganizationDetails from "./OrganizationDetails";
import BranchInvoiceSettings from "./BranchInvoiceSettings";
import "./Organization.css";

async function getOrganizationCurrencies(signal)
{
    const response = await fetch("/api/currencies", { signal });
    const data = await response.json().catch(() => null);

    if (!response.ok || !Array.isArray(data))
    {
        throw new Error(
            "Organization currencies could not be loaded. Check the currency service and retry."
        );
    }

    const currencies = [...new Set(
        data
            .filter(row => row.isActive !== false && typeof row.currencyCode === "string")
            .map(row => row.currencyCode.trim().toUpperCase())
            .filter(code => /^[A-Z]{3}$/.test(code))
    )].sort();

    if (!currencies.length)
    {
        throw new Error("No active currencies are available. Configure the currency master first.");
    }

    return currencies;
}

export default function Organization()
{
    const currencies = useLoad(getOrganizationCurrencies, []);
    const options = currencies.data || [];

    const config = {
        ...moduleConfigs.organization,
        fields: moduleConfigs.organization.fields.map(field =>
            field.name === "currency"
                ? {
                    ...field,
                    options,
                    default: options.includes("INR") ? "INR" : options[0] || ""
                }
                : field
        )
    };

    return (
        <>
            <Feedback
                loading={currencies.loading}
                error={currencies.error}
                retry={currencies.refresh}
            />

            {!currencies.loading && !currencies.error && currencies.data && (
                <DraftModule
                    config={config}
                    Form={OrganizationForm}
                    Details={OrganizationDetails}
                />
            )}

            <BranchInvoiceSettings />
        </>
    );
}
