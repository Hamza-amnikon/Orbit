import LineDiscountFields from "../../../live/LineDiscountFields";
import { validateLineDiscount } from "../../../live/lineDiscount";
import {
    useEffect,
    useRef,
    useState
} from "react";
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
    Typography
} from "@mui/material";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import { useLoad } from "../../../live/data";
import {
    createBill,
    getPurchaseChoices,
    getBill,
    getPurchaseVendors,
    getBillAccounts,
    getBillTaxSettings,
    previewBill,
    updateBill
} from "./BillService";
import {
    money,
    newOrderLine,
    orderPayload,
    orderValues,
    purchaseUnits,
    vendorAddress
} from "./BillHelpers";
import "./BillWorkspace.css";
const selectedVendor = order => order ? {
    id: order.vendorId,
    name: order.vendorName,
    companyName: order.companyName
} : null;
export default function BillForm({
    order = null,
    onClose,
    onSaved
})
{
    const [current, setCurrent] = useState(order);
    const [value, setValue] = useState(() => orderValues(order));
    const [vendor, setVendor] = useState(() => selectedVendor(order));
    const [vendorSearch, setVendorSearch] = useState("");
    const [vendorResult, setVendorResult] = useState({
        key: "",
        data: [],
        total: 0,
        error: ""
    });
    const [vendorRevision, setVendorRevision] = useState(0);
    const choices = useLoad(getPurchaseChoices, []);
    const branches = choices.data?.branches ?? [];
    const currencies = choices.data?.currencies ?? [];
    const selectedBranch = branches.find(branch => branch.name === value.branch);
    const taxKey = JSON.stringify([value.branch, value.billDate]);
    const taxOptions = useLoad(async signal =>
    {
        const rows = value.branch && value.billDate
            ? await getBillTaxSettings(value.branch, value.billDate, signal)
            : [];
        return { key: taxKey, rows };
    }, [value.branch, value.billDate]);
    const taxChoices = taxOptions.data?.key === taxKey ? taxOptions.data.rows : [];
    const [accounts, setAccounts] = useState([]);
    const [accountError, setAccountError] = useState("");
    const [preview, setPreview] = useState(null);
    const [error, setError] = useState("");
    const [conflict, setConflict] = useState(false);
    const [busy, setBusy] = useState(false);
    const locked = useRef(false);
    const request = useRef(null);
    const vendorKey = JSON.stringify([vendorSearch, vendorRevision]);
    const vendorLoading = vendorResult.key !== vendorKey;
    const vendorChoices = vendorLoading ? [] : vendorResult.data;
    const vendorError = vendorLoading ? "" : vendorResult.error;
    useEffect(() =>
    {
        const controller = new AbortController();
        const timer = setTimeout(async () =>
        {
            try
            {
                const result = await getPurchaseVendors(vendorSearch, controller.signal);
                if (!controller.signal.aborted) setVendorResult({
                    key: vendorKey,
                    ...result,
                    error: ""
                });
            } catch (loadError)
            {
                if (!controller.signal.aborted) setVendorResult({
                    key: vendorKey,
                    data: [],
                    total: 0,
                    error: loadError.message
                });
            }
        }, vendorSearch ? 250 : 0);
        return () =>
        {
            clearTimeout(timer);
            controller.abort();
        };
    }, [vendorSearch, vendorRevision, vendorKey]);
    useEffect(() =>
    {
        const controller = new AbortController();
        setAccounts([]);
        setAccountError("");
        if (selectedBranch?.accountingCompanyId)
        {
            getBillAccounts(selectedBranch.accountingCompanyId, controller.signal).then(result =>
            {
                if (!controller.signal.aborted) setAccounts(result);
            }).catch(loadError =>
            {
                if (!controller.signal.aborted) setAccountError(loadError.message);
            });
        }
        return () => controller.abort();
    }, [selectedBranch?.accountingCompanyId]);
    function change(name, next)
    {
        setValue(previous => ({
            ...previous,
            [name]: next,
            ...(["branch", "billDate"].includes(name) ? {
                items: previous.items.map(item => ({
                    ...item,
                    taxSettingId: "",
                    taxSettingRowVersion: ""
                }))
            } : {})
        }));
        setPreview(null);
    }
    function changeLine(key, name, next)
    {
        setValue(previous => ({
            ...previous,
            items: previous.items.map(item => item.key === key ? {
                ...item,
                [name]: next,
                ...(name === "unit" && next === 3 ? {
                    quantity: "1"
                } : {})
            } : item)
        }));
        setPreview(null);
    }
    function selectTax(key, selectedId)
    {
        const selected = taxChoices.find(row => String(row.id) === String(selectedId));
        setValue(previous => ({
            ...previous,
            items: previous.items.map(item => item.key === key ? {
                ...item,
                taxSettingId: selected?.id || "",
                taxSettingRowVersion: selected?.rowVersion || ""
            } : item)
        }));
        setPreview(null);
    }
    function chooseVendor(next)
    {
        setVendor(next);
        setValue(previous => ({
            ...previous,
            vendorId: next?.id || "",
            branch: next?.branch || "",
            taxTreatment: "",
            items: previous.items.map(item => ({
                ...item,
                accountCode: "",
                taxSettingId: "",
                taxSettingRowVersion: ""
            })),
            currency: next?.currency || "",
            paymentTerms: next?.paymentTerms || "",
            billingAddress: next ? vendorAddress(next) : ""
        }));
        setPreview(null);
    }
    function validate()
    {
        if (!value.vendorId) return "Select a vendor.";
        if (!value.billDate) return "Bill date is required.";
        if (value.dueDate && value.dueDate < value.billDate) return "Due date cannot precede the bill date.";
        if (!choices.data?.branches.some(branch => branch.name === value.branch)) return "Select an active Billing Branch.";
        if (!selectedBranch?.accountingCompanyId) return "Link the Billing Branch to an accounting company.";
        if (!choices.data?.currencies.some(currency => currency.currencyCode === value.currency)) return "Select an active currency.";
        if (!value.items.length || value.items.length > 100) return "Provide between 1 and 100 items.";
        for (const [index, item] of value.items.entries())
        {
            if (!item.itemName.trim()) return `Enter an item or service name on line ${index + 1}.`;
            if (!item.accountCode.trim()) return `Select an expense or asset account on line ${index + 1}.`;
            for (const name of ["quantity", "unitPrice", ...(item.discountEnabled ? ["discountValue"] : [])])
            {
                if (item[name] === "" || !Number.isFinite(Number(item[name])) || Number(item[name]) < 0) return `Enter a valid ${name} on line ${index + 1}.`;
            }
            if (Number(item.quantity) <= 0) return "Quantity must be greater than zero.";
            if (item.taxSettingId)
            {
                const selected = taxChoices.find(row => row.id === Number(item.taxSettingId));
                if (!selected || selected.rowVersion !== item.taxSettingRowVersion)
                {
                    return `Select a currently valid saved tax setting or No tax on line ${index + 1}.`;
                }
            }
        }
        try
        {
            value.items.forEach(validateLineDiscount);
        }
        catch (discountError)
        {
            return discountError.message;
        }
        if (taxOptions.loading || taxOptions.error || taxOptions.data?.key !== taxKey)
        {
            return taxOptions.error || "Wait for the company tax settings to load.";
        }
        const treatments = new Set(value.items.filter(item => item.taxSettingId)
            .map(item => taxChoices.find(row => row.id === Number(item.taxSettingId))?.treatment));
        if (treatments.size > 1)
        {
            return "Use the same tax treatment on all taxed lines of the bill.";
        }
        return "";
    }
    async function submit(event, previewOnly = false)
    {
        event?.preventDefault();
        if (locked.current) return;
        const validation = validate();
        setError(validation);
        if (validation) return;
        locked.current = true;
        setBusy(true);
        try
        {
            const body = orderPayload(value);
            if (previewOnly) setPreview(await previewBill(body));else if (current) onSaved(await updateBill(current.id, {
                ...body,
                rowVersion: current.rowVersion
            }));else
            {
                const fingerprint = JSON.stringify(body);
                if (request.current?.fingerprint !== fingerprint) request.current = {
                    fingerprint,
                    id: crypto.randomUUID()
                };
                onSaved(await createBill({
                    ...body,
                    requestId: request.current.id
                }));
            }
        } catch (saveError)
        {
            setError(saveError.message);
            setConflict(saveError.status === 409);
        } finally
        {
            locked.current = false;
            setBusy(false);
        }
    }
    async function reload()
    {
        if (locked.current || !current) return;
        locked.current = true;
        setBusy(true);
        try
        {
            const saved = await getBill(current.id);
            if (saved.status !== 0) throw new Error("This bill is no longer a draft. Close the form and refresh its details.");
            setCurrent(saved);
            setValue(orderValues(saved));
            setVendor(selectedVendor(saved));
            setPreview(null);
            setError("");
            setConflict(false);
        } catch (loadError)
        {
            setError(loadError.message);
        } finally
        {
            locked.current = false;
            setBusy(false);
        }
    }
    return <Dialog
        open
        fullWidth
        maxWidth="md"
        aria-labelledby="bill-form-title"
        onClose={busy ? undefined : onClose}
    >
        <Box
                    component="form"
                    noValidate
                    className="bill-form"
                    onSubmit={submit}
                >
            <DialogTitle id="bill-form-title">{current ? "Edit Bill" : "New Bill"}</DialogTitle>
            <DialogContent dividers>
                {(choices.error || vendorError || accountError) && <Alert
                                    severity="error"
                                    sx={{
                    mb: 2
                }}
                                    action={<Button
                    color="inherit"
                    disabled={busy}
                    onClick={() =>
                {
                    choices.refresh();
                    setVendorRevision(previous => previous + 1);
                }}
                >Retry choices</Button>}
                                >{choices.error || vendorError || accountError}</Alert>}
                {taxOptions.error && (
                    <Alert severity="error" action={<Button onClick={taxOptions.refresh}>Retry tax settings</Button>}>
                        {taxOptions.error}
                    </Alert>
                )}
                {value.items.some(item => item.taxSettingId === "legacy") && (
                    <Alert severity="info">
                        This draft has recorded tax from before the settings connection.
                        Select a saved setting or No tax for each affected line before saving.
                    </Alert>
                )}
                <Typography
                                    component="h3"
                                    variant="subtitle1"
                                    fontWeight={700}
                                    sx={{
                    mb: 2
                }}
                                >Basic Information</Typography>
                <Box className="bill-form-grid">
                    <Autocomplete
                                            options={vendorChoices}
                                            value={vendor}
                                            loading={vendorLoading}
                                            disabled={busy || !!current?.sourcePurchaseOrderId}
                                            filterOptions={options => options}
                                            isOptionEqualToValue={(a, b) => a.id === b.id}
                                            getOptionLabel={option => option.name + (option.companyName ? " Â· " + option.companyName : "")}
                                            onInputChange={(_, text, reason) =>
                                        {
                        if (reason === "input" || reason === "clear") setVendorSearch(text);
                    }}
                                            onChange={(_, next) => chooseVendor(next)}
                                            renderInput={params => <TextField
                        {...params}
                        label="Vendor"
                        required
                        helperText={vendorResult.total > 50 ? "Type to search more vendors." : "Select an active vendor."}
                    />}
                                        />
                    <TextField
                                            label="Bill Number"
                                            value={current?.billNumber || "Assigned when issued"}
                                            disabled
                                        />
                    {[["billDate", "Bill date", true], ["dueDate", "Due date", false]].map(([name, label, required]) => <TextField
                                            key={name}
                                            label={label}
                                            required={required}
                                            type="date"
                                            value={value[name]}
                                            disabled={busy}
                                            slotProps={{
                        inputLabel: {
                            shrink: true
                        }
                    }}
                                            onChange={event => change(name, event.target.value)}
                                        />)}
                    <TextField
                                            select
                                            label="Billing Branch"
                                            required
                                            value={value.branch}
                                            disabled={busy || choices.loading || !!current?.sourcePurchaseOrderId}
                                            onChange={event =>
                                            {
                                                change("branch", event.target.value);
                                                setValue(previous => ({
                                                    ...previous,
                                                    items: previous.items.map(item => ({ ...item, accountCode: "" }))
                                                }));
                                            }}
                                        >
                        {value.branch && !branches.some(branch => branch.name === value.branch) && <MenuItem value={value.branch} disabled>{value.branch} (unavailable)</MenuItem>}
                        {branches.map(branch => <MenuItem key={branch.id} value={branch.name}>{branch.name}</MenuItem>)}
                    </TextField>
                    <TextField
                                            select
                                            label="Currency"
                                            required
                                            value={value.currency}
                                            disabled={busy || choices.loading || !!current?.sourcePurchaseOrderId}
                                            onChange={event => change("currency", event.target.value)}
                                        >
                        {value.currency && !currencies.some(currency => currency.currencyCode === value.currency) && <MenuItem value={value.currency} disabled>{value.currency} (unavailable)</MenuItem>}
                        {currencies.map(currency => <MenuItem key={currency.currencyCode} value={currency.currencyCode}>{currency.currencyCode}</MenuItem>)}
                    </TextField>
                    <TextField
                        label="Tax treatment"
                        value="Derived from saved tax settings selected on bill lines"
                        slotProps={{ input: { readOnly: true } }}
                    />
                    {[["vendorInvoiceNumber", "Vendor invoice number", 200], ["reference", "Reference", 200], ["paymentTerms", "Payment terms", 200], ["billingAddress", "Vendor billing address", 1000], ["shippingAddress", "Delivery address", 1000]].map(([name, label, maxLength]) => <TextField
                                            key={name}
                                            label={label}
                                            value={value[name]}
                                            disabled={busy}
                                            multiline={name.endsWith("Address")}
                                            slotProps={{
                        htmlInput: {
                            maxLength
                        }
                    }}
                                            onChange={event => change(name, event.target.value)}
                                        />)}
                </Box>
                <Divider sx={{
                    my: 3
                }} />
                <Typography
                                    component="h3"
                                    variant="subtitle1"
                                    fontWeight={700}
                                    sx={{
                    mb: 2
                }}
                                >Items / Services</Typography>
                <Stack spacing={2}>
                    {value.items.map((item, index) => <Box key={item.key} sx={{
                        border: "1px solid",
                        borderColor: "divider",
                        p: 2,
                        borderRadius: 2
                    }}>
                        <Stack
                                                    direction="row"
                                                    justifyContent="space-between"
                                                    alignItems="center"
                                                    sx={{
                            mb: 2
                        }}
                                                >
                            <Typography fontWeight={600}>Line {index + 1}</Typography>
                            <IconButton
                                                            aria-label={`Remove line ${index + 1}`}
                                                            color="error"
                                                            disabled={busy || value.items.length === 1}
                                                            onClick={() =>
                                                        {
                                change("items", value.items.filter(line => line.key !== item.key));
                            }}
                                                        >
                                <DeleteOutlineRoundedIcon />
                            </IconButton>
                        </Stack>
                        <Box className="bill-line-grid">
                            <TextField
                                                            label="Item / service"
                                                            required
                                                            value={item.itemName}
                                                            disabled={busy}
                                                            slotProps={{
                                htmlInput: {
                                    maxLength: 200
                                }
                            }}
                                                            onChange={event => changeLine(item.key, "itemName", event.target.value)}
                                                        />
                            <TextField
                                                            select
                                                            label="Expense / asset account"
                                                            required
                                                            value={item.accountCode}
                                                            disabled={busy || !selectedBranch?.accountingCompanyId}
                                                            onChange={event => changeLine(item.key, "accountCode", event.target.value)}
                                                        >
                                {accounts.map(account => <MenuItem key={account.id} value={account.code}>
                                    {account.code} · {account.name}
                                </MenuItem>)}
                            </TextField>
                            <TextField
                                                            select
                                                            label="Unit"
                                                            value={item.unit}
                                                            disabled={busy}
                                                            onChange={event => changeLine(item.key, "unit", Number(event.target.value))}
                                                        >
                                {purchaseUnits.map((label, unit) => <MenuItem key={label} value={unit}>{label}</MenuItem>)}
                            </TextField>
                            {[["quantity", "Quantity", "0.0001", undefined], ["unitPrice", "Unit price", "0", undefined]].map(([name, label, min, max]) => <TextField
                                                            key={name}
                                                            label={label}
                                                            required
                                                            type="number"
                                                            value={item[name]}
                                                            disabled={busy || name === "quantity" && item.unit === 3}
                                                            slotProps={{
                                htmlInput: {
                                    min,
                                    max,
                                    step: "0.0001"
                                }
                            }}
                                                            onChange={event => changeLine(item.key, name, event.target.value)}
                                                        />)}
                            <TextField
                                label="Saved tax setting"
                                select
                                value={item.taxSettingId}
                                disabled={busy || taxOptions.loading || !!taxOptions.error}
                                helperText="Active settings for this branch company and bill date"
                                onChange={event => selectTax(item.key, event.target.value)}
                            >
                                <MenuItem value="">No tax</MenuItem>
                                {item.taxSettingId && !taxChoices.some(row => row.id === Number(item.taxSettingId)) && (
                                    <MenuItem value={item.taxSettingId} disabled>
                                        Recorded tax unavailable - select a saved setting or No tax
                                    </MenuItem>
                                )}
                                {taxChoices.map(rate => (
                                    <MenuItem key={rate.id} value={rate.id} onClick={() => selectTax(item.key, rate.id)}>
                                        {rate.code} - {rate.name} ({rate.rate}%)
                                    </MenuItem>
                                ))}
                            </TextField>
                            <TextField
                                                            label="Description"
                                                            value={item.description}
                                                            disabled={busy}
                                                            slotProps={{
                                htmlInput: {
                                    maxLength: 1000
                                }
                            }}
                                                            onChange={event => changeLine(item.key, "description", event.target.value)}
                                                        />
                            <FormControlLabel label="Apply discount" control={<Checkbox
                                                            checked={item.discountEnabled}
                                                            disabled={busy}
                                                            onChange={event => changeLine(item.key, "discountEnabled", event.target.checked)}
                                                        />} />
                            {item.discountEnabled && <LineDiscountFields
                                type={item.discountType}
                                value={item.discountValue}
                                enabled={item.discountEnabled}
                                disabled={busy}
                                currency={value.currency}
                                onTypeChange={next => changeLine(item.key, "discountType", next)}
                                onValueChange={next => changeLine(item.key, "discountValue", next)}
                            />}
                        </Box>
                    </Box>)}
                    <Button
                                            variant="outlined"
                                            disabled={busy || value.items.length >= 100}
                                            onClick={() => change("items", [...value.items, newOrderLine()])}
                                        >Add item</Button>
                </Stack>
                <Divider sx={{
                    my: 3
                }} />
                <Box className="bill-form-grid">
                    {[["notes", "Notes"], ["additionalTerms", "Additional terms"]].map(([name, label]) => <TextField
                                            key={name}
                                            label={label}
                                            multiline
                                            minRows={2}
                                            value={value[name]}
                                            disabled={busy}
                                            slotProps={{
                        htmlInput: {
                            maxLength: 2000
                        }
                    }}
                                            onChange={event => change(name, event.target.value)}
                                        />)}
                </Box>
                {preview && <Box sx={{
                    mt: 3,
                    p: 2,
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: 2
                }}>
                    <Typography fontWeight={700}>Bill Preview</Typography>
                    {[["Subtotal", "subTotal"], ["Discount", "discountTotal"], ["Tax", "taxTotal"], ["Total Amount", "grandTotal"]].filter(([, name]) => !["discountTotal", "taxTotal"].includes(name) || Number(preview[name]) > 0).map(([label, name]) => <Box key={name} className="bill-total-row"><Typography fontWeight={name === "grandTotal" ? 700 : 400}>{label}</Typography>
                            <Typography fontWeight={name === "grandTotal" ? 700 : 400}>
                                {money(preview[name], preview.currency, preview.currencyDecimalPlaces)}</Typography></Box>)}
                </Box>}
                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                    sx={{
                    mt: 2
                }}
                                >
                    Saving creates a draft bill. Issue it after reviewing the details. Payments are recorded separately.
                </Typography>
            </DialogContent>
            <Box className="bill-form-feedback" aria-live="polite">
                {error && <Alert severity="error">{error}</Alert>}
                {conflict && current && <Button onClick={reload} disabled={busy}>Reload saved order (replaces unsaved edits)</Button>}
            </Box>
            <DialogActions sx={{
                p: 2,
                flexWrap: "wrap",
                gap: 1
            }}>
                <Button disabled={busy} onClick={onClose}>Cancel</Button>
                <Button
                                    variant="outlined"
                                    disabled={busy || choices.loading}
                                    onClick={() => submit(null, true)}
                                >Preview Totals</Button>
                <Button
                                    type="submit"
                                    variant="contained"
                                    disabled={busy || choices.loading || conflict}
                                >{busy ? "Saving..." : "Save Draft"}</Button>
            </DialogActions>
        </Box>
    </Dialog>;
}
