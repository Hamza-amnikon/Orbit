import React, { useEffect, useState } from "react";
import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    Divider,
    FormControlLabel,
    IconButton,
    MenuItem,
    Switch,
    TextField,
    Typography,
} from "@mui/material";

import CloseRoundedIcon from "@mui/icons-material/CloseRounded";

import "./InvoiceForm.css";

function today() {
    const date = new Date();

    return [
        date.getFullYear(),
        String(date.getMonth() + 1).padStart(2, "0"),
        String(date.getDate()).padStart(2, "0"),
    ].join("-");
}

function newItem() {
    return {
        key: crypto.randomUUID(),
        serviceName: "",
        description: "",
        unit: "",
        quantity: "",
        unitPrice: "",
        discountEnabled: false,
        discountAmount: "",
        taxRate: "",
    };
}

async function apiRequest(url, options = {}) {
    const response = await fetch(url, options);
    const text = await response.text();

    let data = null;

    if (text) {
        try {
            data = JSON.parse(text);
        } catch {
            throw new Error(
                "The API returned an unexpected response. Check the Vite proxy."
            );
        }
    }

    if (!response.ok) {
        const validationErrors = data?.errors
            ? Object.values(data.errors).flat().join(" ")
            : "";

        throw new Error(
            data?.message ||
            validationErrors ||
            data?.title ||
            `Request failed (${response.status}).`
        );
    }

    return data;
}

async function loadClients(signal) {
    const clients = [];
    let page = 1;
    let total = 0;

    do {
        const result = await apiRequest(
            `/api/clients?page=${page}&pageSize=100`,
            { signal }
        );

        if (!Array.isArray(result?.data)) {
            throw new Error("Invalid client response.");
        }

        clients.push(...result.data);
        total = result.total;

        if (result.data.length === 0) {
            break;
        }

        page += 1;
    } while (clients.length < total);

    return clients.filter((client) => client.isActive);
}

function clientAddress(client) {
    return [
        client.address,
        client.city,
        client.state,
        client.country,
        client.postalCode,
    ]
        .filter((value) => value?.trim())
        .map((value) => value.trim())
        .join(", ");
}

const InvoiceForm = ({ onClose, onSaved }) => {
    const [clients, setClients] = useState([]);
    const [currencies, setCurrencies] = useState([]);
    const [paymentModes, setPaymentModes] = useState([]);
    const [branches, setBranches] = useState([]);

    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState("");
    const [reload, setReload] = useState(0);

    const [busy, setBusy] = useState(false);
    const [error, setError] = useState("");
    const [totals, setTotals] = useState(null);
    const [savedInvoice, setSavedInvoice] = useState(null);

    const [form, setForm] = useState(() => ({
        clientId: "",
        invoiceDate: today(),
        dueDate: "",
        servicePeriodStart: "",
        servicePeriodEnd: "",
        currency: "",
        branch: "",
        preferredPaymentMode: "",
        billingAddress: "",
        notes: "",
        additionalTerms: "",
    }));

    const [items, setItems] = useState(() => [newItem()]);

    useEffect(() => {
        const controller = new AbortController();

        async function loadOptions() {
            setLoading(true);
            setLoadError("");

            try {
                const [clientData, currencyData, paymentModeData, branchData] =
                    await Promise.all([
                        loadClients(controller.signal),
                        apiRequest("/api/currencies", {
                            signal: controller.signal,
                        }),
                        apiRequest("/api/payment-modes", {
                            signal: controller.signal,
                        }),
                        apiRequest("/api/branches", {
                            signal: controller.signal,
                        }),
                    ]);

                if (
                    !Array.isArray(currencyData) ||
                    !Array.isArray(paymentModeData) ||
                    !Array.isArray(branchData)
                ) {
                    throw new Error("Invalid lookup response.");
                }

                if (!controller.signal.aborted) {
                    setClients(clientData);

                    setCurrencies(
                        currencyData.filter((currency) => currency.isActive)
                    );

                    setPaymentModes(
                        paymentModeData.filter((mode) => mode.isActive)
                    );

                    setBranches(
                        branchData.filter((branch) => branch.isActive)
                    );
                }
            } catch (loadFailure) {
                if (!controller.signal.aborted) {
                    setLoadError(loadFailure.message);
                }
            } finally {
                if (!controller.signal.aborted) {
                    setLoading(false);
                }
            }
        }

        loadOptions();

        return () => controller.abort();
    }, [reload]);

    const disabled = loading || busy || Boolean(savedInvoice);

    function clearPreview() {
        setTotals(null);
        setError("");
    }

    function changeField(event) {
        const { name, value } = event.target;

        clearPreview();

        setForm((previous) => ({
            ...previous,
            [name]: value,
        }));
    }

    function selectClient(event) {
        const client = clients.find(
            (entry) => entry.id === event.target.value
        );

        clearPreview();

        setForm((previous) => ({
            ...previous,
            clientId: client?.id || "",
            branch: client?.branch || "",
            currency: currencies.some(
                (currency) => currency.currencyCode === client?.currency
            )
                ? client.currency
                : "",
            billingAddress: client ? clientAddress(client) : "",
        }));
    }

    function changeItem(key, name, value) {
        clearPreview();

        setItems((previous) =>
            previous.map((item) =>
                item.key === key
                    ? { ...item, [name]: value }
                    : item
            )
        );
    }

    function toggleDiscount(key, enabled) {
        clearPreview();

        setItems((previous) =>
            previous.map((item) =>
                item.key === key
                    ? {
                        ...item,
                        discountEnabled: enabled,
                        discountAmount: enabled ? item.discountAmount : "",
                    }
                    : item
            )
        );
    }

    function addItem() {
        clearPreview();
        setItems((previous) => [...previous, newItem()]);
    }

    function removeItem(key) {
        clearPreview();

        setItems((previous) =>
            previous.filter((item) => item.key !== key)
        );
    }

    function buildRequest() {
        if (form.dueDate < form.invoiceDate) {
            throw new Error(
                "Due date must be on or after the invoice date."
            );
        }

        if (
            Boolean(form.servicePeriodStart) !==
            Boolean(form.servicePeriodEnd)
        ) {
            throw new Error(
                "Enter both service period dates or leave both empty."
            );
        }

        if (
            form.servicePeriodStart &&
            form.servicePeriodEnd < form.servicePeriodStart
        ) {
            throw new Error(
                "Service period end must be on or after its start."
            );
        }

        const client = clients.find((entry) => entry.id === form.clientId);

        if (!client || form.branch !== client.branch) {
            throw new Error("Select a client to use its managing branch.");
        }

        if (!branches.some((branch) => branch.name === form.branch)) {
            throw new Error(
                "The client's managing branch is unavailable. Update the client before creating an invoice."
            );
        }

        return {
            ...form,
            servicePeriodStart: form.servicePeriodStart || null,
            servicePeriodEnd: form.servicePeriodEnd || null,
            items: items.map((item) => ({
                serviceName: item.serviceName,
                description: item.description,
                unit: Number(item.unit),
                quantity: Number(item.quantity),
                unitPrice: Number(item.unitPrice),
                discountEnabled: item.discountEnabled,
                discountAmount: item.discountEnabled
                    ? Number(item.discountAmount || 0)
                    : 0,
                taxRate: Number(item.taxRate || 0),
            })),
        };
    }

    async function handleSubmit(event) {
        event.preventDefault();

        if (busy || savedInvoice) {
            return;
        }

        const preview =
            event.nativeEvent.submitter?.value === "preview";

        setBusy(true);
        setError("");

        let result;

        try {
            const request = buildRequest();

            result = await apiRequest(
                preview
                    ? "/api/sales-invoices/preview"
                    : "/api/sales-invoices",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(request),
                }
            );

            setTotals(result);

            if (!preview) {
                setSavedInvoice(result);
            }
        } catch (saveFailure) {
            setError(saveFailure.message);
        } finally {
            setBusy(false);
        }

        if (!preview && result) {
            onSaved?.(result);
        }
    }

    function amount(value) {
        if (!totals || value == null) {
            return "—";
        }

        const currency = currencies.find(
            (entry) => entry.currencyCode === totals.currency
        );

        if (!currency) {
            return `${totals.currency} ${value}`;
        }

        return `${totals.currency} ${Number(value).toFixed(
            currency.decimalPlaces
        )}`;
    }

    function textField(name, label, options = {}) {
        const {
            InputLabelProps,
            InputProps,
            inputProps,
            slotProps,
            ...fieldOptions
        } = options;

        return (
            <TextField
                name={name}
                label={label}
                value={form[name]}
                onChange={changeField}
                disabled={disabled}
                fullWidth
                {...fieldOptions}
                slotProps={{
                    ...slotProps,
                    inputLabel: {
                        ...InputLabelProps,
                        ...slotProps?.inputLabel,
                        ...(fieldOptions.type === "date"
                            ? { shrink: true }
                            : {}),
                    },
                    input: {
                        ...InputProps,
                        ...slotProps?.input,
                    },
                    htmlInput: {
                        ...inputProps,
                        ...slotProps?.htmlInput,
                    },
                }}
            />
        );
    }

    return (
        <Box className="invoice-form-page">
            <Box className="invoice-form-header">
                <Box>
                    <Typography className="invoice-form-title">
                        New Invoice
                    </Typography>

                    <Typography className="invoice-form-subtitle">
                        Create a customer service invoice
                    </Typography>
                </Box>

                <IconButton
                    className="invoice-form-close"
                    onClick={onClose}
                    disabled={busy}
                    aria-label="Close invoice form"
                >
                    <CloseRoundedIcon />
                </IconButton>
            </Box>

            {loadError && (
                <Alert
                    severity="error"
                    sx={{ mb: 2 }}
                    action={
                        <Button
                            color="inherit"
                            disabled={loading}
                            onClick={() =>
                                setReload((previous) => previous + 1)
                            }
                        >
                            Retry
                        </Button>
                    }
                >
                    {loadError}
                </Alert>
            )}

            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}

            {savedInvoice && (
                <Alert severity="success" sx={{ mb: 2 }}>
                    Draft invoice saved. Record ID: {savedInvoice.id}.
                </Alert>
            )}

            {!loading && !loadError && clients.length === 0 && (
                <Alert severity="info" sx={{ mb: 2 }}>
                    Create an active client before adding an invoice.
                </Alert>
            )}

            {!loading && !loadError && currencies.length === 0 && (
                <Alert severity="info" sx={{ mb: 2 }}>
                    Add an active currency before creating an invoice.
                </Alert>
            )}

            {!loading && !loadError && branches.length === 0 && (
                <Alert severity="info" sx={{ mb: 2 }}>
                    Add an active branch before creating an invoice.
                </Alert>
            )}

            <form onSubmit={handleSubmit}>
                <Card className="invoice-form-card">
                    <CardContent>
                        <Typography className="invoice-form-section-title">
                            Invoice Information
                        </Typography>

                        <Box className="invoice-form-grid">
                            <TextField
                                label="Client"
                                select
                                value={form.clientId}
                                onChange={selectClient}
                                disabled={disabled}
                                required
                                fullWidth
                            >
                                {clients.map((client) => (
                                    <MenuItem
                                        key={client.id}
                                        value={client.id}
                                    >
                                        {client.name}
                                        {client.companyName
                                            ? ` — ${client.companyName}`
                                            : ""}
                                    </MenuItem>
                                ))}
                            </TextField>

                            <TextField
                                label="Invoice number"
                                value={savedInvoice?.invoiceNumber || ""}
                                placeholder="Assigned when issued"
                                slotProps={{
                                    inputLabel: { shrink: true },
                                    input: { readOnly: true },
                                }}
                                fullWidth
                            />

                            {textField("invoiceDate", "Invoice date", {
                                type: "date",
                                required: true,
                                InputLabelProps: { shrink: true },
                            })}

                            {textField("dueDate", "Due date", {
                                type: "date",
                                required: true,
                                InputLabelProps: { shrink: true },
                                inputProps: {
                                    min: form.invoiceDate,
                                },
                            })}

                            {textField(
                                "servicePeriodStart",
                                "Service period start",
                                {
                                    type: "date",
                                    InputLabelProps: { shrink: true },
                                }
                            )}

                            {textField(
                                "servicePeriodEnd",
                                "Service period end",
                                {
                                    type: "date",
                                    InputLabelProps: { shrink: true },
                                    inputProps: {
                                        min: form.servicePeriodStart,
                                    },
                                }
                            )}

                            <TextField
                                name="branch"
                                label="Managing branch"
                                value={form.branch}
                                disabled={disabled}
                                helperText={
                                    form.clientId
                                        ? "From the selected client"
                                        : "Select a client first"
                                }
                                slotProps={{
                                    inputLabel: { shrink: true },
                                    input: { readOnly: true },
                                }}
                                required
                                fullWidth
                            />

                            <TextField
                                name="currency"
                                label="Invoice currency"
                                select
                                value={form.currency}
                                onChange={changeField}
                                disabled={disabled}
                                required
                                fullWidth
                            >
                                {currencies.map((currency) => (
                                    <MenuItem
                                        key={currency.currencyCode}
                                        value={currency.currencyCode}
                                    >
                                        {currency.currencyCode}
                                        {" — "}
                                        {currency.currencyName}
                                    </MenuItem>
                                ))}
                            </TextField>

                            <TextField
                                name="preferredPaymentMode"
                                label="Preferred payment mode"
                                select
                                value={form.preferredPaymentMode}
                                onChange={changeField}
                                disabled={disabled}
                                fullWidth
                            >
                                <MenuItem value="">
                                    None selected
                                </MenuItem>

                                {paymentModes.map((mode) => (
                                    <MenuItem
                                        key={mode.id}
                                        value={mode.name}
                                    >
                                        {mode.name}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Box>
                    </CardContent>
                </Card>

                <Card className="invoice-form-card">
                    <CardContent>
                        <Typography className="invoice-form-section-title">
                            Services
                        </Typography>

                        {items.map((item, index) => (
                            <Box key={item.key} sx={{ mb: 3 }}>
                                <Typography sx={{ mb: 2 }}>
                                    Service line {index + 1}
                                </Typography>

                                <Box className="invoice-form-grid">
                                    <TextField
                                        label="Service"
                                        value={item.serviceName}
                                        onChange={(event) =>
                                            changeItem(
                                                item.key,
                                                "serviceName",
                                                event.target.value
                                            )
                                        }
                                        required
                                        disabled={disabled}
                                        fullWidth
                                        slotProps={{
                                            htmlInput: {
                                                maxLength: 200,
                                            },
                                        }}
                                    />

                                    <TextField
                                        label="Description"
                                        value={item.description}
                                        onChange={(event) =>
                                            changeItem(
                                                item.key,
                                                "description",
                                                event.target.value
                                            )
                                        }
                                        disabled={disabled}
                                        fullWidth
                                        slotProps={{
                                            htmlInput: {
                                                maxLength: 1000,
                                            },
                                        }}
                                    />

                                    <TextField
                                        label="Service unit"
                                        type="number"
                                        value={item.unit}
                                        onChange={(event) =>
                                            changeItem(
                                                item.key,
                                                "unit",
                                                event.target.value
                                            )
                                        }
                                        helperText="0 = Hour, 1 = Day, 2 = Month, 3 = Fixed fee"
                                        required
                                        disabled={disabled}
                                        fullWidth
                                        slotProps={{
                                            htmlInput: {
                                                min: 0,
                                                max: 3,
                                                step: 1,
                                            },
                                        }}
                                    />

                                    <TextField
                                        label="Quantity"
                                        type="number"
                                        value={item.quantity}
                                        onChange={(event) =>
                                            changeItem(
                                                item.key,
                                                "quantity",
                                                event.target.value
                                            )
                                        }
                                        required
                                        disabled={disabled}
                                        fullWidth
                                        slotProps={{
                                            htmlInput: {
                                                min: 0.0001,
                                                step: 0.0001,
                                            },
                                        }}
                                    />

                                    <TextField
                                        label="Rate"
                                        type="number"
                                        value={item.unitPrice}
                                        onChange={(event) =>
                                            changeItem(
                                                item.key,
                                                "unitPrice",
                                                event.target.value
                                            )
                                        }
                                        required
                                        disabled={disabled}
                                        fullWidth
                                        slotProps={{
                                            htmlInput: {
                                                min: 0,
                                                step: 0.0001,
                                            },
                                        }}
                                    />

                                    <Box>
                                        <FormControlLabel
                                            control={
                                                <Switch
                                                    checked={item.discountEnabled}
                                                    onChange={(event) =>
                                                        toggleDiscount(
                                                            item.key,
                                                            event.target.checked
                                                        )
                                                    }
                                                    disabled={disabled}
                                                />
                                            }
                                            label="Enable discount"
                                        />
                                        <TextField
                                            label="Discount amount"
                                            type="number"
                                            value={item.discountAmount}
                                            onChange={(event) =>
                                                changeItem(
                                                    item.key,
                                                    "discountAmount",
                                                    event.target.value
                                                )
                                            }
                                            disabled={disabled || !item.discountEnabled}
                                            fullWidth
                                            slotProps={{
                                                htmlInput: {
                                                    min: 0,
                                                    step: 0.0001,
                                                },
                                            }}
                                        />
                                    </Box>

                                    <TextField
                                        label="Tax %"
                                        type="number"
                                        value={item.taxRate}
                                        onChange={(event) =>
                                            changeItem(
                                                item.key,
                                                "taxRate",
                                                event.target.value
                                            )
                                        }
                                        disabled={disabled}
                                        fullWidth
                                        slotProps={{
                                            htmlInput: {
                                                min: 0,
                                                max: 100,
                                                step: 0.0001,
                                            },
                                        }}
                                    />
                                </Box>

                                <Button
                                    type="button"
                                    color="error"
                                    disabled={disabled || items.length === 1}
                                    onClick={() => removeItem(item.key)}
                                    sx={{ mt: 1 }}
                                >
                                    Remove service
                                </Button>

                                <Divider sx={{ mt: 2 }} />
                            </Box>
                        ))}

                        <Button
                            type="button"
                            variant="outlined"
                            disabled={disabled}
                            onClick={addItem}
                        >
                            Add service
                        </Button>
                    </CardContent>
                </Card>

                <Card className="invoice-form-card">
                    <CardContent>
                        <Typography className="invoice-form-section-title">
                            Billing Information
                        </Typography>

                        {textField("billingAddress", "Billing address", {
                            multiline: true,
                            minRows: 3,
                            inputProps: { maxLength: 1000 },
                        })}
                    </CardContent>
                </Card>

                <Card className="invoice-form-card">
                    <CardContent>
                        <Typography className="invoice-form-section-title">
                            Additional Information
                        </Typography>

                        <Box className="invoice-form-single-field">
                            {textField("notes", "Notes", {
                                multiline: true,
                                minRows: 3,
                                inputProps: { maxLength: 2000 },
                            })}

                            {textField(
                                "additionalTerms",
                                "Terms & Conditions",
                                {
                                    multiline: true,
                                    minRows: 3,
                                    inputProps: { maxLength: 2000 },
                                }
                            )}
                        </Box>
                    </CardContent>
                </Card>

                <Card className="invoice-summary-form-card">
                    <CardContent>
                        <Typography className="invoice-form-section-title">
                            Invoice Summary
                        </Typography>

                        {!totals && (
                            <Typography sx={{ mb: 2 }}>
                                Click Calculate totals to preview the amount.
                            </Typography>
                        )}

                        <Box className="invoice-form-summary">
                            <Box className="invoice-form-summary-row">
                                <Typography>Subtotal</Typography>

                                <Typography>
                                    {amount(totals?.subTotal)}
                                </Typography>
                            </Box>

                            {items.some((item) => item.discountEnabled) && (
                                <Box className="invoice-form-summary-row">
                                    <Typography>Discount</Typography>

                                    <Typography>
                                        {amount(totals?.discountTotal)}
                                    </Typography>
                                </Box>
                            )}

                            <Box className="invoice-form-summary-row">
                                <Typography>Tax</Typography>

                                <Typography>
                                    {amount(totals?.taxTotal)}
                                </Typography>
                            </Box>

                            <Divider />

                            <Box className="invoice-form-grand-total">
                                <Typography>Grand total</Typography>

                                <Typography>
                                    {amount(totals?.grandTotal)}
                                </Typography>
                            </Box>
                        </Box>
                    </CardContent>
                </Card>

                <Box className="invoice-form-actions">
                    <Button
                        type="button"
                        variant="outlined"
                        onClick={onClose}
                        disabled={busy}
                    >
                        {savedInvoice ? "Close" : "Cancel"}
                    </Button>

                    <Button
                        type="submit"
                        value="preview"
                        variant="outlined"
                        disabled={
                            disabled ||
                            Boolean(loadError) ||
                            clients.length === 0 ||
                            currencies.length === 0 ||
                            branches.length === 0
                        }
                    >
                        Calculate totals
                    </Button>

                    <Button
                        type="submit"
                        value="save"
                        variant="contained"
                        disabled={
                            disabled ||
                            Boolean(loadError) ||
                            clients.length === 0 ||
                            currencies.length === 0 ||
                            branches.length === 0
                        }
                    >
                        {busy ? "Processing..." : "Save Draft"}
                    </Button>
                </Box>
            </form>
        </Box>
    );
};

export default InvoiceForm;