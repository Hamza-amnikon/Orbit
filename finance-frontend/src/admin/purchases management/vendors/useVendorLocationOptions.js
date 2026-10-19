import { useEffect, useState } from "react";
import {
    getCountries, getStates, getCities,
} from "./VendorLocationService";

// Query shared location data through VendorService.API only.
export default function useVendorLocationOptions(kind, country, state, enabled, revision) {
    const key = JSON.stringify([kind, country, state, revision]);
    const [result, setResult] = useState({ key: "", options: [], error: "" });

    useEffect(() => {
        if (!enabled) return;
        const controller = new AbortController();

        async function load() {
            try {
                const options = kind === "countries"
                    ? await getCountries(controller.signal)
                    : kind === "states"
                        ? await getStates(country, controller.signal)
                        : await getCities(country, state, controller.signal);
                if (!controller.signal.aborted) setResult({ key, options, error: "" });
            } catch (error) {
                if (!controller.signal.aborted) {
                    setResult({ key, options: [], error: error.message });
                }
            }
        }

        load();
        return () => controller.abort();
    }, [kind, country, state, enabled, revision, key]);

    const current = enabled && result.key === key;
    return {
        options: current ? result.options : [],
        error: current ? result.error : "",
        loading: enabled && !current,
    };
}
