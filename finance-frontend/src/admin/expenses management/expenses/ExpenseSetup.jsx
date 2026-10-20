import { useRef, useState } from "react";
import {
    Alert,
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    MenuItem,
    Tab,
    Tabs,
    TextField,
    Typography,
} from "@mui/material";
import { addAccount, addCompany } from "./ExpenseService";

export default function ExpenseSetup({
    companies,
    accounts,
    countries,
    currencies,
    companyId,
    onClose,
    onSaved,
}) {
    const [tab, setTab] = useState("company");
    const [name, setName] = useState("");
    const [country, setCountry] = useState("");
    const [accountCompany, setAccountCompany] = useState(
        companies.some(row => String(row.id) === String(companyId))
            ? String(companyId)
            : String(companies[0]?.id || "")
    );
    const company = companies.find(row => String(row.id) === accountCompany);
    const [currency, setCurrency] = useState(company?.currency || "");
    const [lastFour, setLastFour] = useState("");
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState("");
    const locked = useRef(false);
    const selectedCountry = countries.find(row => row.locationCode === country);

    async function save(event) {
        event.preventDefault();

        if (locked.current) {
            return;
        }

        setError("");

        if (!name.trim()) {
            setError("Enter a name.");
            return;
        }

        if (tab === "company" && !selectedCountry) {
            setError("Select a country from Country Master.");
            return;
        }

        if (
            tab === "account" &&
            (
                !company ||
                !currencies.some(row => row.currencyCode === currency) ||
                (lastFour !== "" && !/^[0-9]{4}$/.test(lastFour))
            )
        ) {
            setError("Select a company and currency. Enter exactly four digits or leave the last digits blank.");
            return;
        }

        locked.current = true;
        setBusy(true);

        try {
            const row = tab === "company"
                ? await addCompany({
                    name: name.trim(),
                    country,
                })
                : await addAccount({
                    companyId: Number(accountCompany),
                    name: name.trim(),
                    currency,
                    lastFour,
                });

            onSaved(row);
        } catch (failure) {
            setError(failure.message);
        } finally {
            locked.current = false;
            setBusy(false);
        }
    }

    function chooseCompany(id) {
        setAccountCompany(id);
        setCurrency(
            companies.find(row => String(row.id) === id)?.currency || ""
        );
    }

    return (
        <Dialog
            open
            fullWidth
            maxWidth="sm"
            onClose={busy ? undefined : onClose}
            aria-labelledby="expense-setup-title"
        >
            <Box component="form" noValidate onSubmit={save}>
                <DialogTitle id="expense-setup-title">Expense Setup</DialogTitle>

                <DialogContent dividers>
                    <Tabs
                        value={tab}
                        onChange={(_, value) => {
                            setTab(value);
                            setName("");
                            setError("");
                        }}
                    >
                        <Tab value="company" label="Company" disabled={busy} />
                        <Tab
                            value="account"
                            label="Bank Account"
                            disabled={busy || !companies.length}
                        />
                    </Tabs>

                    {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}

                    {!companies.length && (
                        <Alert severity="info" sx={{ mt: 2 }}>
                            Add a company first to enable the Bank Account tab.
                        </Alert>
                    )}

                    <Box className="expenses-form" sx={{ mt: 2 }}>
                        {tab === "company" ? (
                            <>
                                <TextField
                                    label="Company name"
                                    value={name}
                                    required
                                    disabled={busy}
                                    slotProps={{ htmlInput: { maxLength: 160 } }}
                                    onChange={event => setName(event.target.value)}
                                />

                                <TextField
                                    select
                                    required
                                    label="Country"
                                    value={country}
                                    disabled={busy}
                                    helperText={countries.length
                                        ? "Countries and currencies come from your master data."
                                        : "Configure a country with an active currency in Country Master."}
                                    onChange={event => setCountry(event.target.value)}
                                >
                                    {countries.map(row => (
                                        <MenuItem key={row.locationCode} value={row.locationCode}>
                                            {row.countryName} · {row.currencyCode}
                                        </MenuItem>
                                    ))}
                                </TextField>
                            </>
                        ) : (
                            <>
                                <TextField
                                    select
                                    label="Company"
                                    required
                                    value={accountCompany}
                                    disabled={busy}
                                    onChange={event => chooseCompany(event.target.value)}
                                >
                                    {companies.map(row => (
                                        <MenuItem key={row.id} value={String(row.id)}>
                                            {row.name}
                                        </MenuItem>
                                    ))}
                                </TextField>

                                <TextField
                                    label="Account name"
                                    value={name}
                                    required
                                    disabled={busy}
                                    slotProps={{ htmlInput: { maxLength: 160 } }}
                                    onChange={event => setName(event.target.value)}
                                />

                                <TextField
                                    select
                                    required
                                    label="Account currency"
                                    value={currency}
                                    disabled={busy}
                                    onChange={event => setCurrency(event.target.value)}
                                >
                                    {currencies.map(row => (
                                        <MenuItem key={row.currencyCode} value={row.currencyCode}>
                                            {row.currencyCode} · {row.currencyName}
                                        </MenuItem>
                                    ))}
                                </TextField>

                                <TextField
                                    label="Last four digits (optional)"
                                    value={lastFour}
                                    disabled={busy}
                                    slotProps={{
                                        htmlInput: {
                                            maxLength: 4,
                                            inputMode: "numeric",
                                        },
                                    }}
                                    onChange={event => setLastFour(event.target.value)}
                                />
                            </>
                        )}
                    </Box>

                    <Typography variant="subtitle2" sx={{ mt: 3 }}>
                        Existing {tab === "company" ? "companies" : "accounts"}
                    </Typography>

                    {(tab === "company"
                        ? companies
                        : accounts.filter(row => String(row.companyId) === accountCompany)
                    ).map(row => (
                        <Typography key={row.id} variant="body2" sx={{ mt: 1 }}>
                            {row.name} · {row.currency}
                            {row.lastFour ? " · •••• " + row.lastFour : ""}
                        </Typography>
                    ))}
                </DialogContent>

                <DialogActions>
                    <Button disabled={busy} onClick={onClose}>Cancel</Button>
                    <Button
                        type="submit"
                        variant="contained"
                        disabled={busy || (tab === "company" ? !countries.length : !currencies.length)}
                    >
                        {busy ? "Saving…" : "Add " + (tab === "company" ? "Company" : "Account")}
                    </Button>
                </DialogActions>
            </Box>
        </Dialog>
    );
}
