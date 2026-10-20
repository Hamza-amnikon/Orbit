import { useEffect, useState } from "react";
import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    MenuItem,
    Stack,
    TextField,
    Typography,
} from "@mui/material";
import { useAuth } from "../../../live/AuthContext";

const fields = [
    ["companyName", "Company name", 200],
    ["countryCode", "Country code", 2],
    ["address", "Company address", 1000],
    ["companyRegistrationNumber", "Company registration number", 50],
    ["taxRegistrationNumber", "Tax registration number", 50],
    ["bankAccountName", "Bank account holder", 200],
    ["bankName", "Bank name", 200],
    ["bankAccountNumber", "Account number", 100],
    ["bankIban", "IBAN", 34],
    ["bankSwiftCode", "SWIFT / BIC", 11],
    ["phone", "Contact phone", 25],
    ["email", "Contact email", 254],
    ["invoiceNotes", "Default invoice notes", 2000],
];

async function request(url, options = {}) {
    const response = await fetch(url, options);
    const data = await response.json().catch(() => null);

    if (!response.ok || !data) {
        const validation = data?.errors
            ? Object.values(data.errors).flat().join(" ")
            : "";
        throw new Error(
            validation || data?.message || data?.title ||
            `Unable to load or save branch details (${response.status}).`
        );
    }

    return data;
}

export default function BranchInvoiceSettings() {
    const { user, canWrite } = useAuth();
    const canEdit = canWrite && user?.role === "Admin";
    const [branches, setBranches] = useState([]);
    const [selectedId, setSelectedId] = useState("");
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [dirty, setDirty] = useState(false);
    const [lookupError, setLookupError] = useState("");
    const [error, setError] = useState("");
    const [notice, setNotice] = useState("");
    const [reload, setReload] = useState(0);

    useEffect(() => {
        const controller = new AbortController();
        setLookupError("");

        async function loadBranches() {
            try {
                const result = await request("/api/branches", {
                    signal: controller.signal,
                });

                if (!Array.isArray(result)) {
                    throw new Error("Invalid branch list response.");
                }

                if (!controller.signal.aborted) {
                    const active = result.filter((branch) => branch.isActive);
                    setBranches(active);
                    setSelectedId((previous) =>
                        active.some((branch) => String(branch.id) === previous)
                            ? previous
                            : String(active[0]?.id ?? "")
                    );
                }
            } catch (failure) {
                if (!controller.signal.aborted) {
                    setLookupError(failure.message);
                }
            }
        }

        loadBranches();
        return () => controller.abort();
    }, [reload]);

    useEffect(() => {
        if (!selectedId) {
            setProfile(null);
            return;
        }

        const controller = new AbortController();
        setLoading(true);
        setProfile(null);
        setError("");
        setNotice("");
        setDirty(false);

        async function loadProfile() {
            try {
                const result = await request(
                    `/api/branches/${selectedId}/invoice-profile`,
                    { signal: controller.signal }
                );

                if (result.id !== Number(selectedId) || !result.rowVersion) {
                    throw new Error("Invalid branch invoice details response.");
                }

                if (!controller.signal.aborted) {
                    setProfile(result);
                }
            } catch (failure) {
                if (!controller.signal.aborted) {
                    setError(failure.message);
                }
            } finally {
                if (!controller.signal.aborted) {
                    setLoading(false);
                }
            }
        }

        loadProfile();
        return () => controller.abort();
    }, [selectedId, reload]);

    function discardChanges() {
        return !dirty || window.confirm("Discard unsaved branch invoice details?");
    }

    async function saveProfile(event) {
        event.preventDefault();

        if (!profile || loading || saving || !canEdit || lookupError) {
            return;
        }

        setSaving(true);
        setError("");
        setNotice("");

        try {
            const payload = Object.fromEntries(
                fields.map(([name]) => [name, profile[name] ?? ""])
            );
            payload.email = payload.email.trim() || null;
            payload.rowVersion = profile.rowVersion;

            const result = await request(
                `/api/branches/${selectedId}/invoice-profile`,
                {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                }
            );

            setProfile(result);
            setDirty(false);
            setNotice(`Invoice details saved for ${result.branchName}.`);
        } catch (failure) {
            setError(failure.message);
        } finally {
            setSaving(false);
        }
    }

    return (
        <Card sx={{ mx: { xs: 2, md: 3 }, mb: 3 }}>
            <CardContent>
                <Typography variant="h6">Branch invoice details</Typography>
                <Typography color="text.secondary" sx={{ mt: 1, mb: 2 }}>
                    Company and bank details for each branch's issued invoices.
                    You can leave details empty until they are available.
                </Typography>

                <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
                    <TextField
                        select
                        label="Branch"
                        value={selectedId}
                        disabled={saving || branches.length === 0}
                        onChange={(event) => {
                            if (discardChanges()) {
                                setProfile(null);
                                setSelectedId(event.target.value);
                            }
                        }}
                        sx={{ minWidth: 180 }}
                    >
                        {branches.map((branch) => (
                            <MenuItem key={branch.id} value={String(branch.id)}>
                                {branch.name}
                            </MenuItem>
                        ))}
                    </TextField>
                    <Button
                        disabled={saving}
                        onClick={() => {
                            if (discardChanges()) {
                                setProfile(null);
                                setReload((previous) => previous + 1);
                            }
                        }}
                    >
                        Reload
                    </Button>
                </Stack>

                {lookupError && <Alert severity="error" sx={{ mb: 2 }}>{lookupError}</Alert>}
                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                {notice && <Alert severity="success" sx={{ mb: 2 }}>{notice}</Alert>}
                {loading && <Typography>Loading branch invoice details...</Typography>}
                {!loading && !lookupError && branches.length === 0 && (
                    <Typography>No active branches available.</Typography>
                )}

                {profile && (
                    <form onSubmit={saveProfile}>
                        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 2 }}>
                            {fields.map(([name, label, maxLength]) => (
                                <TextField
                                    key={name}
                                    label={label}
                                    value={profile[name] ?? ""}
                                    disabled={saving || !canEdit}
                                    onChange={(event) => {
                                        const value = name === "countryCode"
                                            ? event.target.value.toUpperCase()
                                            : event.target.value;
                                        setProfile((previous) => ({ ...previous, [name]: value }));
                                        setDirty(true);
                                        setNotice("");
                                    }}
                                    type={name === "email" ? "email" : "text"}
                                    multiline={name === "address" || name === "invoiceNotes"}
                                    minRows={name === "address" || name === "invoiceNotes" ? 3 : undefined}
                                    helperText={name === "countryCode" ? "Two-letter country code, for example AE or IN" : undefined}
                                    slotProps={{ htmlInput: { maxLength } }}
                                    fullWidth
                                />
                            ))}
                        </Box>
                        {canEdit && (
                            <Button type="submit" variant="contained" disabled={saving || loading || !dirty || Boolean(lookupError)} sx={{ mt: 2 }}>
                                {saving ? "Saving..." : "Save branch invoice details"}
                            </Button>
                        )}
                    </form>
                )}
            </CardContent>
        </Card>
    );
}
