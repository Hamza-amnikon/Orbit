import { useEffect, useState } from "react";
import {
    Alert,
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    MenuItem,
    TextField,
} from "@mui/material";

import { currencies } from "../../../admin/shared/currencies";
import { clientFields, clientCountry, fieldsForCountry } from "./ClientFields";
import {
    getCountries,
    getStates,
    getCities,
} from "./CountryMasterService";

import "./ClientForm.css";

// Loads dropdown choices and ignores cancelled or outdated requests.
function useLocationOptions(kind, country, state, enabled) {
    const key = JSON.stringify([kind, country, state]);

    const [result, setResult] = useState({
        key: "",
        options: [],
        error: "",
    });

    useEffect(() => {
        if (!enabled) {
            return;
        }

        const controller = new AbortController();

        async function loadOptions() {
            try {
                let options;

                if (kind === "countries") {
                    options = await getCountries(controller.signal);
                } else if (kind === "states") {
                    options = await getStates(
                        country,
                        controller.signal
                    );
                } else {
                    options = await getCities(
                        country,
                        state,
                        controller.signal
                    );
                }

                if (!controller.signal.aborted) {
                    setResult({ key, options, error: "" });
                }
            } catch (loadError) {
                if (!controller.signal.aborted) {
                    setResult({
                        key,
                        options: [],
                        error: loadError.message,
                    });
                }
            }
        }

        loadOptions();

        return () => controller.abort();
    }, [kind, country, state, enabled, key]);

    const current = enabled && result.key === key;

    return {
        options: current ? result.options : [],
        error: current ? result.error : "",
        loading: enabled && !current,
    };
}

function initialValues(client) {
    const values = Object.fromEntries(
        clientFields.map(([name]) => [name, client?.[name] ?? ""])
    );

    return {
        ...values,
        isVatRegistered: client?.isVatRegistered ?? null,
        country: client?.country ?? "",
        state: client?.state ?? "",
        city: client?.city ?? "",
        postalCode: client?.postalCode ?? "",
        branch: client?.branch ?? "",
        currency: client?.currency ?? "",
        isActive: client?.isActive ?? true,
        rowVersion: client?.rowVersion,
    };
}

function ClientForm({
    open,
    client,
    handleClose,
    handleSave,
    handleReload,
}) {
    const [formData, setFormData] = useState(() => initialValues(client));
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [conflict, setConflict] = useState(false);
    const [branches, setBranches] = useState([]);
    const [branchesLoading, setBranchesLoading] = useState(true);
    const [branchError, setBranchError] = useState("");
    const [branchReload, setBranchReload] = useState(0);

    useEffect(() => {
        if (!open) {
            return;
        }

        const controller = new AbortController();

        async function loadBranches() {
            setBranchesLoading(true);
            setBranchError("");

            try {
                const response = await fetch("/api/branches", {
                    signal: controller.signal,
                });

                const data = await response.json().catch(() => null);

                if (!response.ok) {
                    throw new Error(
                        data?.message || "Unable to load managing branches."
                    );
                }

                if (
                    !Array.isArray(data) ||
                    data.some((branch) =>
                        !branch ||
                        typeof branch.id !== "number" ||
                        typeof branch.name !== "string"
                    )
                ) {
                    throw new Error("Invalid branch API response.");
                }

                if (!controller.signal.aborted) {
                    setBranches(data.filter((branch) => branch.isActive));
                }
            } catch (loadError) {
                if (!controller.signal.aborted) {
                    setBranches([]);
                    setBranchError(loadError.message);
                }
            } finally {
                if (!controller.signal.aborted) {
                    setBranchesLoading(false);
                }
            }
        }

        loadBranches();

        return () => controller.abort();
    }, [open, branchReload]);

    const validBranch = branches.some(
        (branch) => branch.name === formData.branch
    );

    const countries = useLocationOptions(
        "countries",
        "",
        "",
        open
    );

    const states = useLocationOptions(
        "states",
        formData.country,
        "",
        open && Boolean(formData.country)
    );

    // Countries without stored states can still load cities.
    const canLoadCities = Boolean(formData.country) && (
        Boolean(formData.state) ||
        (!states.loading && !states.error && states.options.length === 0)
    );

    const cities = useLocationOptions(
        "cities",
        formData.country,
        formData.state,
        open && canLoadCities
    );

    const locationFields = {
        country: {
            ...countries,
            disabled: countries.loading,
            placeholder: "Select country",
        },
        state: {
            ...states,
            disabled: !formData.country || states.loading,
            placeholder: "Select state",
        },
        city: {
            ...cities,
            disabled: !canLoadCities || cities.loading,
            placeholder: "Select city",
        },
    };

    function handleChange(event) {
        const { name, value } = event.target;

        setFormData((previous) => {
            if (name === "country") {
                const countryCurrency = {
                    IN: "INR",
                    AE: "AED",
                    US: "USD",
                }[clientCountry(value)];

                return {
                    ...previous,
                    country: value,
                    currency: value ? countryCurrency || previous.currency : "",
                    state: "",
                    city: "",
                    postalCode: "",
                };
            }

            if (name === "state") {
                return {
                    ...previous,
                    state: value,
                    city: "",
                    postalCode: "",
                };
            }

            if (name === "city") {
                return {
                    ...previous,
                    city: value,
                    postalCode: "",
                };
            }

            return {
                ...previous,
                [name]: name === "isVatRegistered"
                    ? value === "" ? null : value === "yes"
                    : value,
            };
        });
    }

    async function saveClient(event) {
        event.preventDefault();

        if (branchesLoading || branchError || !validBranch) {
            setError(branchError || "Select an active managing branch.");
            return;
        }

        setSaving(true);
        setError("");
        setConflict(false);

        const data = Object.fromEntries(
            clientFields.map(([name]) => [
                name,
                name === "isVatRegistered"
                    ? formData[name]
                    : (formData[name] ?? "").trim(),
            ])
        );

        data.country = formData.country.trim();
        data.state = formData.state.trim();
        data.city = formData.city.trim();
        data.postalCode = formData.postalCode.trim();
        data.email = data.email || null;
        data.branch = formData.branch;
        data.currency = formData.currency;
        data.isActive = formData.isActive;

        // Preserve an existing payment term if it is hidden from the form.
        if (
            client &&
            !clientFields.some(([name]) => name === "paymentTerms")
        ) {
            data.paymentTerms = client.paymentTerms ?? "";
        }

        if (client?.id) {
            data.rowVersion = formData.rowVersion;
        }

        try {
            await handleSave(data);
        } catch (saveError) {
            setError(saveError.message);
            setConflict(saveError.status === 409);
        } finally {
            setSaving(false);
        }
    }

    async function reloadClient() {
        setSaving(true);

        try {
            await handleReload();
        } catch (reloadError) {
            setError(reloadError.message);
        } finally {
            setSaving(false);
        }
    }

    const billingCurrencies = currencies.includes(formData.currency)
        ? currencies
        : [formData.currency, ...currencies];

    return (
        <Dialog
            open={open}
            onClose={saving ? undefined : handleClose}
            fullWidth
            maxWidth="md"
        >
            <Box component="form" onSubmit={saveClient}>
                <DialogTitle>
                    {client?.id ? "Edit Client" : "Add Client"}
                </DialogTitle>

                <DialogContent dividers>
                    {error && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {error}
                        </Alert>
                    )}

                    {branchError && (
                        <Alert
                            severity="error"
                            sx={{ mb: 2 }}
                            action={
                                <Button
                                    type="button"
                                    color="inherit"
                                    disabled={saving || branchesLoading}
                                    onClick={() =>
                                        setBranchReload((previous) => previous + 1)
                                    }
                                >
                                    Retry
                                </Button>
                            }
                        >
                            {branchError}
                        </Alert>
                    )}

                    {conflict && handleReload && (
                        <Alert
                            severity="info"
                            sx={{ mb: 2 }}
                            action={
                                <Button
                                    onClick={reloadClient}
                                    disabled={saving}
                                    color="inherit"
                                >
                                    Reload client
                                </Button>
                            }
                        >
                            Reload to get the latest record. This replaces
                            your unsaved edits.
                        </Alert>
                    )}

                    <Box className="client-form">
                        {fieldsForCountry(formData.country).map(
                            ([name, label, maxLength, required, type]) => {
                                const location = locationFields[name];

                                if (type === "boolean") {
                                    return (
                                        <TextField
                                            key={name}
                                            select
                                            name={name}
                                            label={label}
                                            value={formData[name] == null ? "" : formData[name] ? "yes" : "no"}
                                            onChange={handleChange}
                                            disabled={saving}
                                            fullWidth
                                        >
                                            <MenuItem value="">Not provided</MenuItem>
                                            <MenuItem value="yes">Yes</MenuItem>
                                            <MenuItem value="no">No</MenuItem>
                                        </TextField>
                                    );
                                }

                                if (location) {
                                    const currentValue = formData[name] || "";

                                    // Keep saved values when editing older clients.
                                    const options =
                                        currentValue &&
                                        !location.options.includes(currentValue)
                                            ? [currentValue, ...location.options]
                                            : location.options;

                                    return (
                                        <TextField
                                            key={name}
                                            select
                                            name={name}
                                            label={label}
                                            value={currentValue}
                                            onChange={handleChange}
                                            required={Boolean(required)}
                                            disabled={saving || location.disabled}
                                            error={Boolean(location.error)}
                                            helperText={
                                                location.loading
                                                    ? "Loading..."
                                                    : location.error
                                            }
                                            fullWidth
                                        >
                                            <MenuItem value="">
                                                {location.placeholder}
                                            </MenuItem>

                                            {options.map((option) => (
                                                <MenuItem
                                                    key={option}
                                                    value={option}
                                                >
                                                    {option}
                                                </MenuItem>
                                            ))}
                                        </TextField>
                                    );
                                }

                                return (
                                    <TextField
                                        key={name}
                                        name={name}
                                        label={label}
                                        value={formData[name] ?? ""}
                                        onChange={handleChange}
                                        type={type || "text"}
                                        required={Boolean(required) || (
                                            name === "vatTrn" &&
                                            clientCountry(formData.country) === "AE" &&
                                            formData.isVatRegistered === true
                                        )}
                                        disabled={saving}
                                        fullWidth
                                        multiline={
                                            name === "address" ||
                                            name === "notes"
                                        }
                                        minRows={
                                            name === "address" || name === "notes"
                                                ? 2
                                                : undefined
                                        }
                                        slotProps={{
                                            htmlInput: { maxLength },
                                        }}
                                    />
                                );
                            }
                        )}

                        <TextField
                            select
                            name="branch"
                            label="Managing branch"
                            value={formData.branch}
                            onChange={handleChange}
                            disabled={saving || branchesLoading}
                            error={Boolean(branchError)}
                            helperText={
                                branchesLoading
                                    ? "Loading branches..."
                                    : branchError
                                        ? "Use Retry to load branches."
                                        : branches.length === 0
                                            ? "No active branches available."
                                            : formData.branch && !validBranch
                                                ? "Choose an active branch."
                                                : ""
                            }
                            required
                            fullWidth
                        >
                            <MenuItem value="">Select managing branch</MenuItem>

                            {formData.branch && !validBranch && (
                                <MenuItem value={formData.branch} disabled>
                                    {formData.branch} (unavailable)
                                </MenuItem>
                            )}

                            {branches.map((branch) => (
                                <MenuItem key={branch.id} value={branch.name}>
                                    {branch.name}
                                </MenuItem>
                            ))}
                        </TextField>

                        <TextField
                            select
                            name="currency"
                            label="Agreed billing currency"
                            value={formData.currency}
                            onChange={handleChange}
                            disabled={saving}
                            required
                            fullWidth
                        >
                            {billingCurrencies.map((currency) => (
                                <MenuItem key={currency} value={currency}>
                                    {currency}
                                </MenuItem>
                            ))}
                        </TextField>

                        <TextField
                            select
                            label="Status"
                            value={formData.isActive ? "active" : "archived"}
                            disabled={saving}
                            onChange={(event) => {
                                const isActive =
                                    event.target.value === "active";

                                setFormData((previous) => ({
                                    ...previous,
                                    isActive,
                                }));
                            }}
                            fullWidth
                        >
                            <MenuItem value="active">Active</MenuItem>
                            <MenuItem value="archived">Archived</MenuItem>
                        </TextField>
                    </Box>
                </DialogContent>

                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={handleClose} disabled={saving}>
                        Cancel
                    </Button>

                    <Button
                        type="submit"
                        variant="contained"
                        disabled={
                            saving ||
                            branchesLoading ||
                            Boolean(branchError) ||
                            !validBranch
                        }
                    >
                        {saving ? "Saving..." : "Save Client"}
                    </Button>
                </DialogActions>
            </Box>
        </Dialog>
    );
}

export default ClientForm;