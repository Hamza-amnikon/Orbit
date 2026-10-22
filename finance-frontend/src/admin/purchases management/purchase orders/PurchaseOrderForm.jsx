import { useEffect, useRef, useState } from "react";

import {
    Alert,
    Autocomplete,
    Box,
    Button,
    Checkbox,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    FormControlLabel,
    IconButton,
    MenuItem,
    Stack,
    TextField,
    Typography,
} from "@mui/material";

import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";

import { useLoad } from "../../../live/data";

import {
    createPurchaseOrder,
    getPurchaseChoices,
    getPurchaseOrder,
    getPurchaseVendors,
    previewPurchaseOrder,
    updatePurchaseOrder,
} from "./PurchaseOrderService";

import {
    money,
    newOrderLine,
    orderPayload,
    orderValues,
    purchaseUnits,
    vendorAddress,
} from "./PurchaseOrderHelpers";

import "./PurchaseOrderWorkspace.css";

function selectedVendor(order) {
    if (!order) {
        return null;
    }

    return {
        id: order.vendorId,
        name: order.vendorName,
        companyName: order.companyName,
    };
}

export default function PurchaseOrderForm({
    order = null,
    onClose,
    onSaved,
}) {
    const [current, setCurrent] = useState(order);

    const [value, setValue] = useState(() => ({
        ...orderValues(order),
        paymentModeId: order?.paymentModeId ?? "",
    }));

    const [vendor, setVendor] = useState(() =>
        selectedVendor(order)
    );

    const [vendorSearch, setVendorSearch] = useState("");

    const [vendorResult, setVendorResult] = useState({
        key: "",
        data: [],
        total: 0,
        error: "",
    });

    const [vendorRevision, setVendorRevision] = useState(0);

    const choices = useLoad(getPurchaseChoices, []);

    const [preview, setPreview] = useState(null);
    const [error, setError] = useState("");
    const [conflict, setConflict] = useState(false);
    const [busy, setBusy] = useState(false);

    const locked = useRef(false);
    const request = useRef(null);

    const vendorKey = JSON.stringify([
        vendorSearch,
        vendorRevision,
    ]);

    const vendorLoading = vendorResult.key !== vendorKey;

    const vendorChoices = vendorLoading
        ? []
        : vendorResult.data;

    const vendorError = vendorLoading
        ? ""
        : vendorResult.error;

    const currencies = choices.data?.currencies ?? [];
    const branches = choices.data?.branches ?? [];
    const paymentModes = choices.data?.paymentModes ?? [];

    useEffect(() => {
        const controller = new AbortController();

        const timer = setTimeout(async () => {
            try {
                const result = await getPurchaseVendors(
                    vendorSearch,
                    controller.signal
                );

                if (!controller.signal.aborted) {
                    setVendorResult({
                        key: vendorKey,
                        ...result,
                        error: "",
                    });
                }
            } catch (loadError) {
                if (!controller.signal.aborted) {
                    setVendorResult({
                        key: vendorKey,
                        data: [],
                        total: 0,
                        error: loadError.message,
                    });
                }
            }
        }, vendorSearch ? 250 : 0);

        return () => {
            clearTimeout(timer);
            controller.abort();
        };
    }, [vendorSearch, vendorRevision, vendorKey]);

    function change(name, next) {
        setValue(previous => ({
            ...previous,
            [name]: next,
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

    function chooseVendor(next) {
        setVendor(next);

        setValue(previous => ({
            ...previous,
            vendorId: next?.id || "",
            branch: next?.branch || "",
            currency: next?.currency || "",
            paymentTerms: next?.paymentTerms || "",
            billingAddress: next
                ? vendorAddress(next)
                : "",
        }));

        setPreview(null);
    }

    function validate() {
        if (!value.vendorId) {
            return "Select a vendor.";
        }

        if (!value.orderDate) {
            return "Order date is required.";
        }

        if (
            value.expectedDeliveryDate &&
            value.expectedDeliveryDate < value.orderDate
        ) {
            return "Expected delivery cannot precede the order date.";
        }

        if (
            !choices.data?.branches.some(
                branch => branch.name === value.branch
            )
        ) {
            return "Select an active managing branch.";
        }

        if (
            !choices.data?.currencies.some(
                currency =>
                    currency.currencyCode === value.currency
            )
        ) {
            return "Select an active currency.";
        }

        if (
            !value.items.length ||
            value.items.length > 100
        ) {
            return "Provide between 1 and 100 items.";
        }

        for (const [index, item] of value.items.entries()) {
            if (!item.itemName.trim()) {
                return `Enter an item or service name on line ${index + 1}.`;
            }

            const numericFields = [
                "quantity",
                "unitPrice",
                "taxRate",
                ...(item.discountEnabled
                    ? ["discountAmount"]
                    : []),
            ];

            for (const name of numericFields) {
                if (
                    item[name] === "" ||
                    !Number.isFinite(Number(item[name])) ||
                    Number(item[name]) < 0
                ) {
                    return `Enter a valid ${name} on line ${index + 1}.`;
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

    async function submit(event, previewOnly = false) {
        event?.preventDefault();

        if (locked.current) {
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
            const body = orderPayload(value);

            if (previewOnly) {
                setPreview(
                    await previewPurchaseOrder(body)
                );
            } else if (current) {
                onSaved(
                    await updatePurchaseOrder(
                        current.id,
                        {
                            ...body,
                            rowVersion: current.rowVersion,
                        }
                    )
                );
            } else {
                const fingerprint = JSON.stringify(body);

                if (
                    request.current?.fingerprint !== fingerprint
                ) {
                    request.current = {
                        fingerprint,
                        id: crypto.randomUUID(),
                    };
                }

                onSaved(
                    await createPurchaseOrder({
                        ...body,
                        requestId: request.current.id,
                    })
                );
            }
        } catch (saveError) {
            setError(saveError.message);
            setConflict(saveError.status === 409);
        } finally {
            locked.current = false;
            setBusy(false);
        }
    }

    async function reload() {
        if (locked.current || !current) {
            return;
        }

        locked.current = true;
        setBusy(true);

        try {
            const saved = await getPurchaseOrder(current.id);

            if (saved.status !== 0) {
                throw new Error(
                    "This order is no longer a draft. Close the form and refresh its details."
                );
            }

            setCurrent(saved);

            setValue({
                ...orderValues(saved),
                paymentModeId: saved.paymentModeId ?? "",
            });

            setVendor(selectedVendor(saved));
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

    return (
        <Dialog
            open
            fullWidth
            maxWidth="md"
            aria-labelledby="po-form-title"
            onClose={busy ? undefined : onClose}
        >
            <Box
                component="form"
                noValidate
                className="po-form"
                onSubmit={submit}
            >
                <DialogTitle id="po-form-title">
                    {current
                        ? "Edit Purchase Order"
                        : "New Purchase Order"}
                </DialogTitle>

                <DialogContent dividers>
                    {(choices.error || vendorError) && (
                        <Alert
                            severity="error"
                            sx={{ mb: 2 }}
                            action={
                                <Button
                                    color="inherit"
                                    disabled={busy}
                                    onClick={() => {
                                        choices.refresh();

                                        setVendorRevision(
                                            previous => previous + 1
                                        );
                                    }}
                                >
                                    Retry choices
                                </Button>
                            }
                        >
                            {choices.error || vendorError}
                        </Alert>
                    )}

                    <Typography
                        component="h3"
                        variant="subtitle1"
                        fontWeight={700}
                        sx={{ mb: 2 }}
                    >
                        Basic Information
                    </Typography>

                    <Box className="po-form-grid">
                        <Autocomplete
                            options={vendorChoices}
                            value={vendor}
                            loading={vendorLoading}
                            disabled={busy}
                            filterOptions={options => options}
                            isOptionEqualToValue={(a, b) =>
                                a.id === b.id
                            }
                            getOptionLabel={option =>
                                option.name +
                                (option.companyName
                                    ? " Â· " + option.companyName
                                    : "")
                            }
                            onInputChange={(_, text, reason) => {
                                if (
                                    reason === "input" ||
                                    reason === "clear"
                                ) {
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
                                    helperText={
                                        vendorResult.total > 50
                                            ? "Type to search more vendors."
                                            : "Select an active vendor."
                                    }
                                />
                            )}
                        />

                        <TextField
                            label="Purchase Order Number"
                            value={
                                current?.purchaseOrderNumber ||
                                "Assigned when issued"
                            }
                            disabled
                        />

                        {[
                            ["orderDate", "Order date", true],
                            [
                                "expectedDeliveryDate",
                                "Expected delivery date",
                                false,
                            ],
                        ].map(([name, label, required]) => (
                            <TextField
                                key={name}
                                label={label}
                                required={required}
                                type="date"
                                value={value[name]}
                                disabled={busy}
                                slotProps={{
                                    inputLabel: {
                                        shrink: true,
                                    },
                                }}
                                onChange={event => {
                                    change(name, event.target.value);
                                }}
                            />
                        ))}

                        <TextField
                            select
                            label="Managing branch"
                            required
                            value={value.branch}
                            disabled={busy || choices.loading}
                            onChange={event => {
                                change("branch", event.target.value);
                            }}
                        >
                            {value.branch &&
                                !branches.some(
                                    branch =>
                                        branch.name === value.branch
                                ) && (
                                    <MenuItem
                                        value={value.branch}
                                        disabled
                                    >
                                        {value.branch} (unavailable)
                                    </MenuItem>
                                )}

                            {branches.map(branch => (
                                <MenuItem
                                    key={branch.id}
                                    value={branch.name}
                                >
                                    {branch.name}
                                </MenuItem>
                            ))}
                        </TextField>

                        <TextField
                            select
                            label="Currency"
                            required
                            value={value.currency}
                            disabled={busy || choices.loading}
                            onChange={event => {
                                change("currency", event.target.value);
                            }}
                        >
                            {value.currency &&
                                !currencies.some(
                                    currency =>
                                        currency.currencyCode ===
                                        value.currency
                                ) && (
                                    <MenuItem
                                        value={value.currency}
                                        disabled
                                    >
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
                            label="Payment terms"
                            value={value.paymentTerms}
                            disabled={busy}
                            slotProps={{
                                htmlInput: {
                                    maxLength: 200,
                                },
                            }}
                            onChange={event => {
                                change(
                                    "paymentTerms",
                                    event.target.value
                                );
                            }}
                        />

                        <TextField
                            select
                            label="Payment mode"
                            value={value.paymentModeId ?? ""}
                            disabled={busy || choices.loading}
                            onChange={event => {
                                const next = event.target.value;

                                change(
                                    "paymentModeId",
                                    next === "" ? "" : Number(next)
                                );
                            }}
                        >
                            <MenuItem value="">
                                <em>Not specified</em>
                            </MenuItem>

                            {value.paymentModeId !== "" &&
                                value.paymentModeId != null &&
                                !paymentModes.some(
                                    mode =>
                                        mode.id ===
                                        Number(value.paymentModeId)
                                ) && (
                                    <MenuItem
                                        value={value.paymentModeId}
                                        disabled
                                    >
                                        Selected mode (unavailable)
                                    </MenuItem>
                                )}

                            {paymentModes.map(mode => (
                                <MenuItem
                                    key={mode.id}
                                    value={mode.id}
                                >
                                    {mode.name}
                                </MenuItem>
                            ))}
                        </TextField>

                        <TextField
                            label="Reference"
                            value={value.reference}
                            disabled={busy}
                            slotProps={{
                                htmlInput: {
                                    maxLength: 200,
                                },
                            }}
                            onChange={event => {
                                change("reference", event.target.value);
                            }}
                        />

                        <TextField
                            label="Vendor billing address"
                            value={value.billingAddress}
                            multiline
                            disabled={busy}
                            slotProps={{
                                htmlInput: {
                                    maxLength: 1000,
                                },
                            }}
                            onChange={event => {
                                change(
                                    "billingAddress",
                                    event.target.value
                                );
                            }}
                        />

                        <TextField
                            label="Delivery address"
                            value={value.shippingAddress}
                            multiline
                            disabled={busy}
                            slotProps={{
                                htmlInput: {
                                    maxLength: 1000,
                                },
                            }}
                            onChange={event => {
                                change(
                                    "shippingAddress",
                                    event.target.value
                                );
                            }}
                        />
                    </Box>

                    <Divider sx={{ my: 3 }} />

                    <Typography
                        component="h3"
                        variant="subtitle1"
                        fontWeight={700}
                        sx={{ mb: 2 }}
                    >
                        Items / Services
                    </Typography>

                    <Stack spacing={2}>
                        {value.items.map((item, index) => (
                            <Box
                                key={item.key}
                                sx={{
                                    border: "1px solid",
                                    borderColor: "divider",
                                    p: 2,
                                    borderRadius: 2,
                                }}
                            >
                                <Stack
                                    direction="row"
                                    justifyContent="space-between"
                                    alignItems="center"
                                    sx={{ mb: 2 }}
                                >
                                    <Typography fontWeight={600}>
                                        Line {index + 1}
                                    </Typography>

                                    <IconButton
                                        aria-label={`Remove line ${index + 1}`}
                                        color="error"
                                        disabled={
                                            busy ||
                                            value.items.length === 1
                                        }
                                        onClick={() => {
                                            change(
                                                "items",
                                                value.items.filter(
                                                    line =>
                                                        line.key !== item.key
                                                )
                                            );
                                        }}
                                    >
                                        <DeleteOutlineRoundedIcon />
                                    </IconButton>
                                </Stack>

                                <Box className="po-line-grid">
                                    <TextField
                                        label="Item / service"
                                        required
                                        value={item.itemName}
                                        disabled={busy}
                                        slotProps={{
                                            htmlInput: {
                                                maxLength: 200,
                                            },
                                        }}
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
                                        {purchaseUnits.map(
                                            (label, unit) => (
                                                <MenuItem
                                                    key={label}
                                                    value={unit}
                                                >
                                                    {label}
                                                </MenuItem>
                                            )
                                        )}
                                    </TextField>

                                    {[
                                        [
                                            "quantity",
                                            "Quantity",
                                            "0.0001",
                                            undefined,
                                        ],
                                        [
                                            "unitPrice",
                                            "Unit price",
                                            "0",
                                            undefined,
                                        ],
                                        [
                                            "taxRate",
                                            "Tax %",
                                            "0",
                                            "100",
                                        ],
                                    ].map(([name, label, min, max]) => (
                                        <TextField
                                            key={name}
                                            label={label}
                                            required
                                            type="number"
                                            value={item[name]}
                                            disabled={
                                                busy ||
                                                (
                                                    name === "quantity" &&
                                                    item.unit === 3
                                                )
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
                                        disabled={busy}
                                        slotProps={{
                                            htmlInput: {
                                                maxLength: 1000,
                                            },
                                        }}
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
                                                checked={
                                                    item.discountEnabled
                                                }
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
                                            disabled={
                                                busy ||
                                                !item.discountEnabled
                                            }
                                            slotProps={{
                                                htmlInput: {
                                                    min: 0,
                                                    step: "0.0001",
                                                },
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
                            disabled={
                                busy ||
                                value.items.length >= 100
                            }
                            onClick={() => {
                                change("items", [
                                    ...value.items,
                                    newOrderLine(),
                                ]);
                            }}
                        >
                            Add item
                        </Button>
                    </Stack>

                    <Divider sx={{ my: 3 }} />

                    <Box className="po-form-grid">
                        {[
                            ["notes", "Notes"],
                            ["additionalTerms", "Additional terms"],
                        ].map(([name, label]) => (
                            <TextField
                                key={name}
                                label={label}
                                multiline
                                minRows={2}
                                value={value[name]}
                                disabled={busy}
                                slotProps={{
                                    htmlInput: {
                                        maxLength: 2000,
                                    },
                                }}
                                onChange={event => {
                                    change(name, event.target.value);
                                }}
                            />
                        ))}
                    </Box>

                    {preview && (
                        <Box
                            sx={{
                                mt: 3,
                                p: 2,
                                border: "1px solid",
                                borderColor: "divider",
                                borderRadius: 2,
                            }}
                        >
                            <Typography fontWeight={700}>
                                Purchase Order Preview
                            </Typography>

                            <Box className="po-total-row">
                                <Typography>Subtotal</Typography>

                                <Typography>
                                    {money(
                                        preview.subTotal,
                                        preview.currency,
                                        preview.currencyDecimalPlaces
                                    )}
                                </Typography>
                            </Box>

                            {Number(preview.discountTotal) > 0 && (
                                <Box className="po-total-row">
                                    <Typography>Discount</Typography>

                                    <Typography>
                                        {money(
                                            preview.discountTotal,
                                            preview.currency,
                                            preview.currencyDecimalPlaces
                                        )}
                                    </Typography>
                                </Box>
                            )}

                            {Number(preview.taxTotal) > 0 && (
                                <Box className="po-total-row">
                                    <Typography>Tax</Typography>

                                    <Typography>
                                        {money(
                                            preview.taxTotal,
                                            preview.currency,
                                            preview.currencyDecimalPlaces
                                        )}
                                    </Typography>
                                </Box>
                            )}

                            <Box className="po-total-row">
                                <Typography fontWeight={700}>
                                    Total Amount
                                </Typography>

                                <Typography fontWeight={700}>
                                    {money(
                                        preview.grandTotal,
                                        preview.currency,
                                        preview.currencyDecimalPlaces
                                    )}
                                </Typography>
                            </Box>
                        </Box>
                    )}

                    <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mt: 2 }}
                    >
                        Totals are calculated by the server. Saving a
                        draft does not create a bill or record a payment.
                    </Typography>
                </DialogContent>

                <Box
                    className="po-form-feedback"
                    aria-live="polite"
                >
                    {error && (
                        <Alert severity="error">
                            {error}
                        </Alert>
                    )}

                    {conflict && current && (
                        <Button
                            onClick={reload}
                            disabled={busy}
                        >
                            Reload saved order (replaces unsaved edits)
                        </Button>
                    )}
                </Box>

                <DialogActions
                    sx={{
                        p: 2,
                        flexWrap: "wrap",
                        gap: 1,
                    }}
                >
                    <Button
                        disabled={busy}
                        onClick={onClose}
                    >
                        Cancel
                    </Button>

                    <Button
                        variant="outlined"
                        disabled={busy || choices.loading}
                        onClick={() => {
                            submit(null, true);
                        }}
                    >
                        Preview Totals
                    </Button>

                    <Button
                        type="submit"
                        variant="contained"
                        disabled={
                            busy ||
                            choices.loading ||
                            conflict
                        }
                    >
                        {busy ? "Saving..." : "Save Draft"}
                    </Button>
                </DialogActions>
            </Box>
        </Dialog>
    );
}