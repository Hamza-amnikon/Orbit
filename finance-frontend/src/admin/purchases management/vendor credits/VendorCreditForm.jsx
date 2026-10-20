import { useRef, useState } from "react";

import {
    Alert,
    Autocomplete,
    Box,
    Button,
    Checkbox,
    FormControlLabel,
    MenuItem,
    TextField,
    Typography,
} from "@mui/material";

import CloseRoundedIcon from "@mui/icons-material/CloseRounded";

import { useLoad } from "../../../live/data";

import {
    createVendorCredit,
    getVendorCredit,
    getVendorCreditBills,
    getVendorCreditChoices,
    getVendorCreditVendors,
    previewVendorCredit,
    updateVendorCredit,
} from "./VendorCreditService";

import "./VendorCreditForm.css";

const units = ["Hour", "Day", "Month", "Fixed fee", "Piece"];

function today() {
    const date = new Date();

    return date.getFullYear() + "-" +
        String(date.getMonth() + 1).padStart(2, "0") + "-" +
        String(date.getDate()).padStart(2, "0");
}

function newLine() {
    return {
        key: crypto.randomUUID(),
        itemName: "",
        description: "",
        unit: 4,
        quantity: "1",
        unitPrice: "0",
        discountEnabled: false,
        discountAmount: "0",
        taxRate: "0",
    };
}

function formatAmount(amount, currency, precision) {
    return new Intl.NumberFormat(undefined, {
        style: "currency",
        currency,
        currencyDisplay: "code",
        minimumFractionDigits: precision,
        maximumFractionDigits: precision,
    }).format(amount);
}

function formValues(credit) {
    return {
        vendorId: credit?.vendorId || "",
        billId: credit?.billId ?? "",
        creditDate: credit?.creditDate || today(),
        vendorCreditNoteNumber: credit?.vendorCreditNoteNumber || "",
        branch: credit?.branch || "",
        currency: credit?.currency || "",
        billingAddress: credit?.billingAddress || "",
        reference: credit?.reference || "",
        reason: credit?.reason || "",
        notes: credit?.notes || "",
        items: credit?.items?.length
            ? credit.items.map(item => ({
                ...item,
                key: crypto.randomUUID(),
                quantity: String(item.quantity),
                unitPrice: String(item.unitPrice),
                discountAmount: String(item.discountAmount),
                taxRate: String(item.taxRate),
            }))
            : [newLine()],
    };
}

function selectedVendor(credit) {
    if (!credit) {
        return null;
    }

    return {
        id: credit.vendorId,
        name: credit.vendorName,
        companyName: credit.companyName,
        branch: credit.branch,
        currency: credit.currency,
    };
}

export default function VendorCreditForm({
    credit = null,
    onCancel,
    onSaved,
}) {
    const [current, setCurrent] = useState(credit);

    const [vendor, setVendor] = useState(() =>
        selectedVendor(credit)
    );
    const [vendorSearch, setVendorSearch] = useState("");
    const [billSearch, setBillSearch] = useState("");

    const [value, setValue] = useState(() =>
        formValues(credit)
    );

    const [preview, setPreview] = useState(null);
    const [error, setError] = useState("");
    const [busy, setBusy] = useState(false);
    const [conflict, setConflict] = useState(false);

    const locked = useRef(false);
    const request = useRef(null);

    const choices = useLoad(getVendorCreditChoices, []);

    const vendors = useLoad(
        signal => {
            return getVendorCreditVendors(vendorSearch, signal);
        },
        [vendorSearch]
    );

    const bills = useLoad(
        signal => {
            if (!value.vendorId || !value.branch || !value.currency) {
                return Promise.resolve({ data: [], total: 0 });
            }

            return getVendorCreditBills(
                {
                    vendorId: value.vendorId,
                    branch: value.branch,
                    currency: value.currency,
                    search: billSearch,
                },
                signal
            );
        },
        [value.vendorId, value.branch, value.currency, billSearch]
    );

    const branches = choices.data?.branches ?? [];
    const currencies = choices.data?.currencies ?? [];
    const billOptions = bills.data?.data ?? [];

    function change(name, next) {
        setValue(previous => ({
            ...previous,
            [name]: next,
            ...(name === "branch" || name === "currency"
                ? { billId: "" }
                : {}),
        }));

        if (name === "branch" || name === "currency") {
            setBillSearch("");
        }

        setPreview(null);
    }

    function chooseVendor(next) {
        setVendor(next);
        setBillSearch("");

        setValue(previous => ({
            ...previous,
            vendorId: next?.id || "",
            branch: next?.branch || "",
            currency: next?.currency || "",
            billId: "",
            billingAddress: next
                ? [
                    next.address,
                    next.city,
                    next.state,
                    next.country,
                    next.postalCode,
                ].filter(Boolean).join(", ")
                : "",
        }));

        setPreview(null);
    }

    function changeLine(key, name, next) {
        setValue(previous => ({
            ...previous,
            items: previous.items.map(item => {
                if (item.key !== key) {
                    return item;
                }

                return {
                    ...item,
                    [name]: next,
                    ...(name === "unit" && next === 3
                        ? { quantity: "1" }
                        : {}),
                };
            }),
        }));

        setPreview(null);
    }

    function validate() {
        if (!value.vendorId) {
            return "Select an active vendor.";
        }

        if (!value.creditDate) {
            return "Credit date is required.";
        }

        if (!branches.some(row => row.name === value.branch)) {
            return "Select an active managing branch.";
        }

        if (!currencies.some(row => row.currencyCode === value.currency)) {
            return "Select an active currency.";
        }

        if (!value.items.length || value.items.length > 100) {
            return "Provide between 1 and 100 credit items.";
        }

        for (const [index, item] of value.items.entries()) {
            if (!item.itemName.trim()) {
                return "Enter an item name on line " + (index + 1) + ".";
            }

            const fields = [
                "quantity",
                "unitPrice",
                "taxRate",
                ...(item.discountEnabled ? ["discountAmount"] : []),
            ];

            for (const name of fields) {
                if (
                    item[name] === "" ||
                    !Number.isFinite(Number(item[name])) ||
                    Number(item[name]) < 0
                ) {
                    return "Enter a valid " + name + " on line " +
                        (index + 1) + ".";
                }
            }

            if (Number(item.quantity) <= 0) {
                return "Quantity must be greater than zero.";
            }

            if (Number(item.taxRate) > 100) {
                return "Tax cannot exceed 100%.";
            }
        }

        return "";
    }

    function payload() {
        return {
            vendorId: value.vendorId,
            billId: value.billId === "" ? null : Number(value.billId),
            creditDate: value.creditDate,
            vendorCreditNoteNumber: value.vendorCreditNoteNumber.trim(),
            branch: value.branch,
            currency: value.currency,
            billingAddress: value.billingAddress.trim(),
            reference: value.reference.trim(),
            reason: value.reason.trim(),
            notes: value.notes.trim(),
            items: value.items.map(item => ({
                itemName: item.itemName.trim(),
                description: item.description.trim(),
                unit: Number(item.unit),
                quantity: Number(item.quantity),
                unitPrice: Number(item.unitPrice),
                discountEnabled: item.discountEnabled,
                discountAmount: item.discountEnabled
                    ? Number(item.discountAmount)
                    : 0,
                taxRate: Number(item.taxRate),
            })),
        };
    }

    async function submit(event, previewOnly = false) {
        event?.preventDefault();

        if (locked.current || conflict) {
            return;
        }

        const validation = validate();

        setError(validation);

        if (validation) {
            return;
        }

        locked.current = true;
        setBusy(true);

        try {
            const body = payload();

            if (previewOnly) {
                setPreview(await previewVendorCredit(body));
                return;
            }

            if (current) {
                const saved = await updateVendorCredit(current.id, {
                    ...body,
                    rowVersion: current.rowVersion,
                });

                onSaved(saved);
                return;
            }

            const fingerprint = JSON.stringify(body);

            if (request.current?.fingerprint !== fingerprint) {
                request.current = {
                    fingerprint,
                    id: crypto.randomUUID(),
                };
            }

            const saved = await createVendorCredit({
                ...body,
                requestId: request.current.id,
            });

            onSaved(saved);
        } catch (saveError) {
            setError(saveError.message);
            setConflict(Boolean(current) && saveError.status === 409);
        } finally {
            locked.current = false;
            setBusy(false);
        }
    }

    async function reloadDraft() {
        if (locked.current || !current) {
            return;
        }

        locked.current = true;
        setBusy(true);

        try {
            const saved = await getVendorCredit(current.id);

            if (saved.status !== 0) {
                throw new Error(
                    "This credit is no longer a draft. Close the form and refresh its details."
                );
            }

            setCurrent(saved);
            setValue(formValues(saved));
            setVendor(selectedVendor(saved));
            setBillSearch("");
            setPreview(null);
            setError("");
            setConflict(false);
        } catch (loadError) {
            setError(loadError.message);
        } finally {
            locked.current = false;
            setBusy(false);
        }
    }

    function retryChoices() {
        choices.refresh();
        vendors.refresh();
        bills.refresh();
    }

    return (
        <Box className="vendor-credit-form-page">
            <Box className="vendor-credit-form-header">
                <Box>
                    <Typography className="vendor-credit-form-title">
                        {current ? "Edit Vendor Credit" : "New Vendor Credit"}
                    </Typography>

                    <Typography className="vendor-credit-form-subtitle">
                        Record a vendor credit and save it as a draft
                    </Typography>
                </Box>

                <Button
                    className="vendor-credit-form-close"
                    aria-label="Close vendor credit form"
                    disabled={busy}
                    onClick={onCancel}
                >
                    <CloseRoundedIcon />
                </Button>
            </Box>

            {(choices.error || vendors.error || bills.error) && (
                <Alert
                    severity="error"
                    sx={{ mb: 2 }}
                    action={
                        <Button
                            color="inherit"
                            disabled={busy}
                            onClick={retryChoices}
                        >
                            Retry choices
                        </Button>
                    }
                >
                    {choices.error || vendors.error || bills.error}
                </Alert>
            )}

            <Box component="form" noValidate onSubmit={submit}>
                <fieldset
                    disabled={busy}
                    style={{ border: 0, padding: 0, margin: 0, minWidth: 0 }}
                >
                    <Box className="vendor-credit-form-section">
                        <Typography className="vendor-credit-section-title">
                            Basic Information
                        </Typography>

                        <Box className="vendor-credit-form-grid">
                            <Autocomplete
                                options={vendors.data?.data ?? []}
                                value={vendor}
                                loading={vendors.loading}
                                disabled={busy}
                                filterOptions={options => options}
                                isOptionEqualToValue={(a, b) => a.id === b.id}
                                getOptionLabel={option => {
                                    return option.name +
                                        (option.companyName
                                            ? " · " + option.companyName
                                            : "");
                                }}
                                onInputChange={(_, text, reason) => {
                                    if (reason === "input" || reason === "clear") {
                                        setVendorSearch(text);
                                    }
                                }}
                                onChange={(_, next) => {
                                    chooseVendor(next);
                                }}
                                renderInput={params => (
                                    <TextField
                                        {...params}
                                        label="Vendor"
                                        required
                                        helperText="Type to search active vendors."
                                    />
                                )}
                            />

                            <TextField
                                label="Vendor Credit Number"
                                value={current?.vendorCreditNumber || "Assigned when issued"}
                                disabled
                            />

                            <TextField
                                label="Credit Date"
                                type="date"
                                required
                                value={value.creditDate}
                                slotProps={{ inputLabel: { shrink: true } }}
                                onChange={event => {
                                    change("creditDate", event.target.value);
                                }}
                            />

                            <TextField
                                label="Vendor Credit Note Number"
                                value={value.vendorCreditNoteNumber}
                                helperText="Supplier's credit note number; required when issuing."
                                slotProps={{ htmlInput: { maxLength: 200 } }}
                                onChange={event => {
                                    change(
                                        "vendorCreditNoteNumber",
                                        event.target.value
                                    );
                                }}
                            />

                            <TextField
                                select
                                required
                                label="Managing branch"
                                value={value.branch}
                                disabled={busy || choices.loading || conflict}
                                onChange={event => {
                                    change("branch", event.target.value);
                                }}
                            >
                                {value.branch &&
                                    !branches.some(row => row.name === value.branch) && (
                                        <MenuItem value={value.branch} disabled>
                                            {value.branch} (unavailable)
                                        </MenuItem>
                                    )}

                                {branches.map(branch => (
                                    <MenuItem key={branch.id} value={branch.name}>
                                        {branch.name}
                                    </MenuItem>
                                ))}
                            </TextField>

                            <TextField
                                select
                                required
                                label="Currency"
                                value={value.currency}
                                disabled={busy || choices.loading || conflict}
                                onChange={event => {
                                    change("currency", event.target.value);
                                }}
                            >
                                {value.currency &&
                                    !currencies.some(row =>
                                        row.currencyCode === value.currency
                                    ) && (
                                        <MenuItem value={value.currency} disabled>
                                            {value.currency} (unavailable)
                                        </MenuItem>
                                    )}

                                {currencies.map(currency => (
                                    <MenuItem
                                        key={currency.currencyCode}
                                        value={currency.currencyCode}
                                    >
                                        {currency.currencyCode}
                                    </MenuItem>
                                ))}
                            </TextField>

                            <TextField
                                select
                                label="Source Bill (optional)"
                                value={value.billId}
                                disabled={
                                    busy ||
                                    bills.loading ||
                                    !value.vendorId ||
                                    !value.branch ||
                                    !value.currency
                                }
                                helperText="Issued bills matching the vendor, branch and currency."
                                onChange={event => {
                                    change("billId", event.target.value);
                                }}
                            >
                                <MenuItem value="">
                                    Not linked to a bill
                                </MenuItem>

                                {value.billId !== "" &&
                                    !billOptions.some(row =>
                                        row.id === Number(value.billId)
                                    ) && (
                                        <MenuItem value={value.billId}>
                                            Selected bill #{value.billId}
                                        </MenuItem>
                                    )}

                                {billOptions.map(bill => (
                                    <MenuItem key={bill.id} value={bill.id}>
                                        {bill.billNumber || "#" + bill.id}
                                        {bill.vendorInvoiceNumber
                                            ? " · " + bill.vendorInvoiceNumber
                                            : ""}
                                    </MenuItem>
                                ))}
                            </TextField>

                            <TextField
                                label="Search source bills"
                                value={billSearch}
                                disabled={busy || !value.vendorId}
                                onChange={event => {
                                    setBillSearch(event.target.value);
                                }}
                            />

                            {[
                                ["reference", "Reference", 200],
                                ["reason", "Reason", 1000],
                            ].map(([name, label, maxLength]) => (
                                <TextField
                                    key={name}
                                    label={label}
                                    value={value[name]}
                                    slotProps={{ htmlInput: { maxLength } }}
                                    onChange={event => {
                                        change(name, event.target.value);
                                    }}
                                />
                            ))}
                        </Box>
                    </Box>

                    {value.items.map((item, index) => (
                        <Box
                            key={item.key}
                            className="vendor-credit-form-section"
                        >
                            <Box
                                sx={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    gap: 2,
                                }}
                            >
                                <Typography className="vendor-credit-section-title">
                                    Item / Service — Line {index + 1}
                                </Typography>

                                <Button
                                    color="error"
                                    disabled={busy || value.items.length === 1}
                                    onClick={() => {
                                        change(
                                            "items",
                                            value.items.filter(row =>
                                                row.key !== item.key
                                            )
                                        );
                                    }}
                                >
                                    Remove line
                                </Button>
                            </Box>

                            <Box className="vendor-credit-form-grid">
                                <TextField
                                    label="Item / Service"
                                    required
                                    value={item.itemName}
                                    slotProps={{ htmlInput: { maxLength: 200 } }}
                                    onChange={event => {
                                        changeLine(
                                            item.key,
                                            "itemName",
                                            event.target.value
                                        );
                                    }}
                                />

                                <TextField
                                    select
                                    label="Unit"
                                    value={item.unit}
                                    disabled={busy}
                                    onChange={event => {
                                        changeLine(
                                            item.key,
                                            "unit",
                                            Number(event.target.value)
                                        );
                                    }}
                                >
                                    {units.map((label, unit) => (
                                        <MenuItem key={label} value={unit}>
                                            {label}
                                        </MenuItem>
                                    ))}
                                </TextField>

                                {[
                                    ["quantity", "Quantity", "0.0001", undefined],
                                    ["unitPrice", "Unit price", "0", undefined],
                                    ["taxRate", "Tax %", "0", "100"],
                                ].map(([name, label, min, max]) => (
                                    <TextField
                                        key={name}
                                        label={label}
                                        required
                                        type="number"
                                        value={item[name]}
                                        disabled={
                                            busy ||
                                            (name === "quantity" && item.unit === 3)
                                        }
                                        slotProps={{
                                            htmlInput: {
                                                min,
                                                max,
                                                step: "0.0001",
                                            },
                                        }}
                                        onChange={event => {
                                            changeLine(
                                                item.key,
                                                name,
                                                event.target.value
                                            );
                                        }}
                                    />
                                ))}

                                <TextField
                                    label="Description"
                                    value={item.description}
                                    slotProps={{ htmlInput: { maxLength: 1000 } }}
                                    onChange={event => {
                                        changeLine(
                                            item.key,
                                            "description",
                                            event.target.value
                                        );
                                    }}
                                />

                                <FormControlLabel
                                    label="Apply discount"
                                    control={
                                        <Checkbox
                                            checked={item.discountEnabled}
                                            disabled={busy}
                                            onChange={event => {
                                                changeLine(
                                                    item.key,
                                                    "discountEnabled",
                                                    event.target.checked
                                                );
                                            }}
                                        />
                                    }
                                />

                                {item.discountEnabled && (
                                    <TextField
                                        label="Discount amount"
                                        type="number"
                                        value={item.discountAmount}
                                        slotProps={{
                                            htmlInput: { min: 0, step: "0.0001" },
                                        }}
                                        onChange={event => {
                                            changeLine(
                                                item.key,
                                                "discountAmount",
                                                event.target.value
                                            );
                                        }}
                                    />
                                )}
                            </Box>
                        </Box>
                    ))}

                    <Button
                        variant="outlined"
                        disabled={busy || value.items.length >= 100}
                        sx={{ mb: 3 }}
                        onClick={() => {
                            change("items", [...value.items, newLine()]);
                        }}
                    >
                        Add item
                    </Button>

                    <Box className="vendor-credit-form-section">
                        <Typography className="vendor-credit-section-title">
                            Address and Notes
                        </Typography>

                        <Box className="vendor-credit-form-grid">
                            {[
                                ["billingAddress", "Billing Address", 1000],
                                ["notes", "Notes", 2000],
                            ].map(([name, label, maxLength]) => (
                                <TextField
                                    key={name}
                                    label={label}
                                    multiline
                                    minRows={3}
                                    value={value[name]}
                                    slotProps={{ htmlInput: { maxLength } }}
                                    onChange={event => {
                                        change(name, event.target.value);
                                    }}
                                />
                            ))}
                        </Box>
                    </Box>

                    {preview && (
                        <Box className="vendor-credit-summary-section">
                            <Typography className="vendor-credit-section-title">
                                Vendor Credit Preview
                            </Typography>

                            {[
                                ["Subtotal", "subTotal"],
                                ["Discount", "discountTotal"],
                                ["Tax", "taxTotal"],
                                ["Total Credit", "grandTotal"],
                            ]
                                .filter(([, name]) => {
                                    if (
                                        name === "discountTotal" ||
                                        name === "taxTotal"
                                    ) {
                                        return Number(preview[name]) > 0;
                                    }

                                    return true;
                                })
                                .map(([label, name]) => (
                                    <Box
                                        key={name}
                                        className={
                                            name === "grandTotal"
                                                ? "vendor-credit-summary-total"
                                                : "vendor-credit-summary-row"
                                        }
                                    >
                                        <Typography>{label}</Typography>

                                        <Typography>
                                            {formatAmount(
                                                preview[name],
                                                preview.currency,
                                                preview.currencyDecimalPlaces
                                            )}
                                        </Typography>
                                    </Box>
                                ))}
                        </Box>
                    )}

                    <Typography color="text.secondary" variant="body2">
                        Totals are calculated by the server. Saving creates a
                        draft; it does not apply a credit or record a refund.
                    </Typography>

                    {error && (
                        <Alert severity="error" sx={{ mt: 2 }} aria-live="polite">
                            {error}
                        </Alert>
                    )}

                    {conflict && current && (
                        <Button
                            disabled={busy}
                            onClick={reloadDraft}
                        >
                            Reload saved draft (replaces unsaved edits)
                        </Button>
                    )}

                    <Box className="vendor-credit-form-footer">
                        <Button
                            variant="outlined"
                            className="vendor-credit-cancel-button"
                            disabled={busy}
                            onClick={onCancel}
                        >
                            Cancel
                        </Button>

                        <Button
                            variant="outlined"
                            disabled={busy || choices.loading || conflict}
                            onClick={() => {
                                submit(null, true);
                            }}
                        >
                            Preview Totals
                        </Button>

                        <Button
                            type="submit"
                            variant="contained"
                            className="vendor-credit-save-button"
                            disabled={busy || choices.loading || conflict}
                        >
                            {busy ? "Saving..." : "Save Draft"}
                        </Button>
                    </Box>
                </fieldset>
            </Box>
        </Box>
    );
}
