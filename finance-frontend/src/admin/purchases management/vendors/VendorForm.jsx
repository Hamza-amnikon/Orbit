import { useEffect, useRef, useState } from "react";
import {
    Alert, Box, Button, Dialog, Divider, IconButton, MenuItem, TextField, Typography,
} from "@mui/material";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import StoreRoundedIcon from "@mui/icons-material/StoreRounded";
import { createVendor, getVendorById, updateVendor } from "./VendorService";
import { vendorCountry, vendorPayload, vendorSectionsForCountry, vendorValues } from "./VendorFields";
import { currencies } from "../../shared/currencies";
import useVendorLocationOptions from "./useVendorLocationOptions";
import { getCountryCurrencies } from "./VendorLocationService";
import "./VendorForm.css";
import "./VendorIntegration.css";

export default function VendorForm({ vendor = null, onClose, onSaved }) {
    const [current, setCurrent] = useState(vendor);
    const [values, setValues] = useState(() => vendorValues(vendor));
    const [errors, setErrors] = useState({});
    const [error, setError] = useState("");
    const [conflict, setConflict] = useState(false);
    const [busy, setBusy] = useState(false);
    const locked = useRef(false);
    const currencyRequest = useRef(null);
    const [currencyLoading, setCurrencyLoading] = useState(false);
    const [currencyError, setCurrencyError] = useState("");

    useEffect(() => () => currencyRequest.current?.abort(), []);

    async function loadCountryCurrency(country) {
        currencyRequest.current?.abort();
        const controller = new AbortController();
        currencyRequest.current = controller;
        setCurrencyError("");
        setCurrencyLoading(Boolean(country));
        if (!country) return;

        try {
            const codes = await getCountryCurrencies(country, controller.signal);
            if (controller.signal.aborted) return;
            if (codes.length !== 1 || !/^[A-Za-z]{3}$/.test(codes[0])) {
                setCurrencyError(codes.length === 0
                    ? "No currency is configured for this country. Select a currency manually."
                    : "The country master does not have one valid currency for this country. Select a currency manually.");
                return;
            }
            setValues((previous) => previous.country === country
                ? { ...previous, currency: codes[0].toUpperCase() }
                : previous);
        } catch (loadError) {
            if (!controller.signal.aborted) {
                setCurrencyError(loadError.message + " Select a currency manually or retry.");
            }
        } finally {
            if (!controller.signal.aborted) setCurrencyLoading(false);
        }
    }
    const [locationRevision, setLocationRevision] = useState(0);
    const countries = useVendorLocationOptions("countries", "", "", true, locationRevision);
    const states = useVendorLocationOptions("states", values.country, "", Boolean(values.country), locationRevision);
    // Match Clients: countries with no stored states can load cities directly.
    const canLoadCities = Boolean(values.country) && (
        Boolean(values.state) || (!states.loading && !states.error && states.options.length === 0)
    );
    const cities = useVendorLocationOptions("cities", values.country, values.state, canLoadCities, locationRevision);
    const locationFields = {
        country: { ...countries, disabled: countries.loading, placeholder: "Select country" },
        state: { ...states, disabled: !values.country || states.loading || Boolean(states.error), placeholder: "Select state / emirate" },
        city: { ...cities, disabled: !canLoadCities || cities.loading || Boolean(cities.error), placeholder: "Select city" },
    };
    const locationError = countries.error || states.error || cities.error;

    function change(name, value) {
        if (name === "country" && value !== values.country) {
            loadCountryCurrency(value);
        }
        if (name === "currency") setCurrencyError("");
        const cleared = name === "country" ? ["state", "city", "postalCode", "currency"]
            : name === "state" ? ["city", "postalCode"]
                : name === "city" ? ["postalCode"] : [];
        setValues((previous) => {
            if (previous[name] === value) return previous;
            return {
                ...previous,
                [name]: value,
                ...Object.fromEntries(cleared.map((field) => [field, ""])),
            };
        });
        setErrors((previous) => ({
            ...previous,
            [name]: "",
            ...((name === "country" || name === "isVatRegistered") ? { vatTrn: "" } : {}),
            ...Object.fromEntries(cleared.map((field) => [field, ""])),
        }));
    }

    function validate() {
        const next = {};
        for (const [, fields] of vendorSectionsForCountry(values.country)) {
            for (const [name, label, maximum, required] of fields) {
                const value = values[name].trim();
                if (required && !value) next[name] = `${label} is required.`;
                else if (value.length > maximum) next[name] = `Use at most ${maximum} characters.`;
            }
        }
        if (values.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) {
            next.email = "Enter a valid email address.";
        }
        if (values.currency.trim() && !/^[A-Za-z]{3}$/.test(values.currency.trim())) {
            next.currency = "Enter a three-letter currency code.";
        }
        if (vendorCountry(values.country) === "AE" &&
            values.isVatRegistered === true && !values.vatTrn.trim()) {
            next.vatTrn = "VAT TRN is required for a VAT-registered vendor.";
        }
        if (current && !current.rowVersion) next.rowVersion = "Reload the vendor before saving.";
        setErrors(next);
        return Object.keys(next).length === 0;
    }

    async function submit(event) {
        event.preventDefault();
        if (locked.current || currencyLoading) return;
        setError("");
        if (!validate()) {
            setError("Check the highlighted fields before saving.");
            return;
        }
        locked.current = true;
        setBusy(true);
        try {
            const payload = vendorPayload(values, current);
            const saved = current ? await updateVendor(current.id, payload) : await createVendor(payload);
            onSaved(saved);
        } catch (saveError) {
            setError(saveError.message);
            setConflict(saveError.status === 409);
        } finally {
            locked.current = false;
            setBusy(false);
        }
    }

    async function reload() {
        if (locked.current) return;
        currencyRequest.current?.abort();
        setCurrencyLoading(false);
        setCurrencyError("");
        locked.current = true;
        setBusy(true);
        try {
            const saved = await getVendorById(current.id);
            setCurrent(saved);
            setValues(vendorValues(saved));
            setErrors({});
            setError("");
            setConflict(false);
        } catch (loadError) {
            setError(loadError.message);
        } finally {
            locked.current = false;
            setBusy(false);
        }
    }

    return (
        <Dialog open fullWidth maxWidth="md" aria-labelledby="vendor-form-title"
            onClose={() => { if (!busy) onClose(); }}
            slotProps={{ paper: { className: "vendor-form-dialog" } }}>
            <Box component="form" noValidate className="vendor-form" onSubmit={submit}>
                <Box className="vendor-form-header">
                    <Box className="vendor-form-header-left">
                        <Box className="vendor-form-header-icon"><StoreRoundedIcon /></Box>
                        <Box>
                            <Typography id="vendor-form-title" component="h2" className="vendor-form-title">
                                {current ? "Edit Vendor" : "New Vendor"}
                            </Typography>
                            <Typography className="vendor-form-subtitle">Contact, address and purchase information</Typography>
                        </Box>
                    </Box>
                    <IconButton aria-label="Close vendor form" onClick={onClose} disabled={busy}
                        className="vendor-form-close-button"><CloseRoundedIcon /></IconButton>
                </Box>
                <Box className="vendor-form-body">
                    {vendorSectionsForCountry(values.country).map(([title, fields], index) => (
                        <Box key={title}>
                            {index > 0 && <Divider className="vendor-form-divider" />}
                            <Typography component="h3" className="vendor-form-section-title">{title}</Typography>
                            <Box className="vendor-form-grid">
                                {fields.map(([name, label, maximum, required, type]) => {
                                    const location = locationFields[name];
                                    if (location) {
                                        const currentValue = values[name] || "";
                                        // Preserve saved locations that are no longer in the master list.
                                        const options = [...new Set([
                                            ...(currentValue ? [currentValue] : []),
                                            ...location.options,
                                        ])];
                                        return <TextField key={name} select fullWidth name={name} label={label}
                                            value={currentValue} required={Boolean(required)}
                                            disabled={busy || location.disabled}
                                            error={Boolean(errors[name] || location.error)}
                                            helperText={errors[name] || (location.loading ? "Loading..." : location.error) ||
                                                (name === "state" && values.country && !states.loading && states.options.length === 0
                                                    ? "No states available for this country."
                                                    : name === "city" && canLoadCities && !cities.loading && cities.options.length === 0
                                                        ? "No cities available for this location." : "")}
                                            onChange={(event) => change(name, event.target.value)}>
                                            <MenuItem value="">{location.placeholder}</MenuItem>
                                            {options.map((option) => <MenuItem key={option} value={option}>{option}</MenuItem>)}
                                        </TextField>;
                                    }
                                    return (
                                    <TextField key={name} name={name} label={label}
                                        required={Boolean(required) || (name === "vatTrn" &&
                                            vendorCountry(values.country) === "AE" && values.isVatRegistered === true)}
                                        fullWidth value={values[name]}
                                        disabled={busy || (name === "currency" && currencyLoading)}
                                        type={type || "text"} select={name === "currency"}
                                        multiline={name === "address" || name === "notes"}
                                        minRows={name === "address" || name === "notes" ? 2 : undefined}
                                        error={Boolean(errors[name])}
                                        helperText={errors[name] || (name === "currency"
                                            ? currencyLoading ? "Loading currency from country master..." : currencyError
                                            : "")}
                                        slotProps={{ htmlInput: { maxLength: maximum } }}
                                        onChange={(event) => change(name, event.target.value)}>
                                        {name === "currency" && [...new Set([...currencies, values.currency].filter(Boolean))].map(
                                            (code) => <MenuItem key={code} value={code}>{code}</MenuItem>
                                        )}
                                    </TextField>
                                    );
                                })}
                                {title === "Tax & Banking" && vendorCountry(values.country) === "AE" && (
                                    <TextField select fullWidth label="VAT registered (UAE)" disabled={busy}
                                        value={values.isVatRegistered === null ? "" : String(values.isVatRegistered)}
                                        onChange={(event) => change("isVatRegistered",
                                            event.target.value === "" ? null : event.target.value === "true")}>
                                        <MenuItem value="">Not specified / not applicable</MenuItem>
                                        <MenuItem value="true">Yes</MenuItem>
                                        <MenuItem value="false">No</MenuItem>
                                    </TextField>
                                )}
                            </Box>
                        </Box>
                    ))}
                </Box>
                <Box className="vendor-form-feedback" aria-live="polite">
                    {error && <Alert severity="error">{error}</Alert>}
                    {currencyError && values.country && <Button onClick={() => loadCountryCurrency(values.country)}
                        disabled={busy || currencyLoading}>Retry currency lookup</Button>}
                    {locationError && <Alert severity="warning" sx={{ mt: 1 }}
                        action={<Button color="inherit" disabled={busy}
                            onClick={() => setLocationRevision((previous) => previous + 1)}>Retry locations</Button>}>
                        Unable to load location choices. Check that VendorService.API is running.
                    </Alert>}
                    {conflict && <Alert severity="warning" sx={{ mt: 1 }}
                        action={<Button color="inherit" onClick={reload} disabled={busy}>Reload saved vendor</Button>}>
                        Reloading replaces your unsaved edits with the latest saved details.
                    </Alert>}
                </Box>
                <Box className="vendor-form-footer">
                    <Button variant="outlined" onClick={onClose} disabled={busy}>Cancel</Button>
                    <Button variant="contained" type="submit" disabled={busy || conflict || currencyLoading}>
                        {busy ? "Saving..." : current ? "Save Changes" : "Save Vendor"}
                    </Button>
                </Box>
            </Box>
        </Dialog>
    );
}
