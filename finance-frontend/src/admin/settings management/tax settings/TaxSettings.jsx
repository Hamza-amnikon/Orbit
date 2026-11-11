import { useState } from "react";

import {
    Alert,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    MenuItem,
    Stack,
    TextField,
    Typography
} from "@mui/material";

import { Page, Records, Feedback } from "../../../live/shared";
import { today, useLoad } from "../../../live/data";
import { useAuth } from "../../../live/AuthContext";
import { getTaxSetup, getTaxRates, saveTaxRate } from "./TaxSettingService";
import "./TaxSettings.css";

export default function TaxSettings()
{
    const { user, canWrite } = useAuth();
    const setup = useLoad(getTaxSetup, []);
    const companies = setup.data?.companies || [];
    const [companyId, setCompanyId] = useState("");
    const selectedId = companyId || String(companies[0]?.id || "");
    const company = companies.find(row => String(row.id) === selectedId);
    const types = (setup.data?.types || []).filter(row =>
        row.countryCode === company?.country
    );
    const list = useLoad(
        signal => selectedId ? getTaxRates(selectedId, signal) : [],
        [selectedId]
    );
    const [edit, setEdit] = useState(null);
    const [detail, setDetail] = useState(null);
    const [error, setError] = useState("");
    const [notice, setNotice] = useState("");
    const [busy, setBusy] = useState(false);
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const allowed = canWrite && user?.role === "Admin";
    const rows = (list.data || []).filter(row =>
        row.companyId === Number(selectedId) &&
        `${row.code} ${row.name}`.toLowerCase().includes(search.toLowerCase())
    );
    const typeName = id => types.find(row => row.id === id)?.name || "Unavailable tax type";

    function open(row)
    {
        setError("");
        const type = types.find(item => item.isActive);
        setEdit(row
            ? { ...row, effectiveTo: row.effectiveTo || "" }
            : {
                companyId: Number(selectedId),
                taxTypeId: type?.id || "",
                code: "",
                name: "",
                effectiveFrom: today(),
                effectiveTo: "",
                isActive: true,
                components: (type?.components || []).map(name => ({ name, rate: "" }))
            }
        );
    }

    async function save(event)
    {
        event.preventDefault();
        if (busy)
        {
            return;
        }

        setBusy(true);
        setError("");
        try
        {
            await saveTaxRate(edit);
            setEdit(null);
            setNotice("Tax setting saved. Existing invoice and bill tax values are unchanged.");
            list.refresh();
        }
        catch (failure)
        {
            setError(failure.message);
        }
        finally
        {
            setBusy(false);
        }
    }

    return (
        <Page
            title="Tax Settings"
            subtitle="Company tax configurations by country and effective date"
            action={allowed && (
                <Button
                    variant="contained"
                    disabled={!company || setup.loading || !!setup.error || !types.some(row => row.isActive)}
                    onClick={() => open()}
                >
                    New Tax Rate
                </Button>
            )}
        >
            <Feedback
                loading={setup.loading}
                error={setup.error}
                retry={setup.refresh}
            />

            <Stack
                direction="row"
                sx={{ gap: 2, mb: 2, flexWrap: "wrap" }}
            >
                <TextField
                    select
                    label="Company"
                    value={selectedId}
                    disabled={setup.loading || !!setup.error}
                    sx={{ minWidth: 280 }}
                    onChange={event =>
                    {
                        setCompanyId(event.target.value);
                        setPage(1);
                        setSearch("");
                        setNotice("");
                    }}
                >
                    {companies.map(row => (
                        <MenuItem
                            key={row.id}
                            value={String(row.id)}
                        >
                            {row.name}
                        </MenuItem>
                    ))}
                </TextField>
                <Button onClick={() =>
                {
                    list.refresh();
                    setup.refresh();
                }}>
                    Refresh
                </Button>
            </Stack>

            {company && (
                <Alert
                    severity="info"
                    sx={{ mb: 2 }}
                >
                    Tax types follow this company's country ({company.country}), not its transaction currency.
                    Rates are maintained for this company only. Saved settings are available on sales estimates, invoices, purchase orders and bills.
                </Alert>
            )}
            {!setup.loading && !setup.error && !companies.length && (
                <Alert severity="info">Configure an accounting company before creating tax rates.</Alert>
            )}
            {company && !setup.loading && !setup.error && !types.some(row => row.isActive) && (
                <Alert
                    severity="warning"
                    sx={{ mb: 2 }}
                >No active tax types are configured for this company's country.</Alert>
            )}
            {notice && <Alert
                severity="success"
                sx={{ mb: 2 }}
            >{notice}</Alert>}

            <Records
                {...list}
                rows={rows.slice((page - 1) * 25, page * 25)}
                total={rows.length}
                page={page}
                setPage={setPage}
                search={search}
                setSearch={setSearch}
                columns={[
                    { label: "Code", render: row => row.code },
                    { label: "Name", render: row => row.name },
                    { label: "Tax type", render: row => typeName(row.taxTypeId) },
                    { label: "Total rate", render: row => `${row.rate}%` },
                    { label: "Effective from", render: row => row.effectiveFrom },
                    { label: "Effective to", render: row => row.effectiveTo || "No end date" },
                    { label: "Status", render: row => row.isActive ? "Active" : "Inactive" },
                    {
                        label: "Actions",
                        render: row => (
                            <Stack direction="row">
                                <Button onClick={() => setDetail(row)}>View</Button>
                                {allowed && <Button onClick={() => open(row)}>Edit</Button>}
                            </Stack>
                        )
                    }
                ]}
            />

            {edit && (
                <Dialog
                    open
                    fullWidth
                    maxWidth="md"
                    scroll="paper"
                    slotProps={{ paper: { sx: { overflow: "hidden" } } }}
                    onClose={busy ? undefined : () => setEdit(null)}
                >
                    <form onSubmit={save} style={{ display: "flex", flexDirection: "column", minHeight: 0, overflow: "hidden" }}>
                        <DialogTitle>{edit.id ? "Edit" : "New"} Tax Rate · {company?.name}</DialogTitle>
                        <DialogContent dividers sx={{ minHeight: 0, overflowY: "auto" }}>
                            {error && <Alert
                                severity="error"
                                sx={{ mb: 2 }}
                            >{error}</Alert>}
                            <Stack
                                spacing={2}
                                sx={{ pt: 1 }}
                            >
                                <TextField
                                    label="Company country"
                                    value={company?.country || ""}
                                    disabled
                                />
                                <TextField
                                    select
                                    required
                                    label="Tax type"
                                    value={edit.taxTypeId}
                                    disabled={busy}
                                    onChange={event =>
                                    {
                                        const type = types.find(row => row.id === Number(event.target.value));
                                        setEdit({
                                            ...edit,
                                            taxTypeId: type.id,
                                            components: type.components.map(name => ({ name, rate: "" }))
                                        });
                                    }}
                                >
                                    {types.filter(row => row.isActive || row.id === edit.taxTypeId).map(row => (
                                        <MenuItem
                                            key={row.id}
                                            value={row.id}
                                            disabled={!row.isActive}
                                        >
                                            {row.name}{row.isActive ? "" : " (inactive)"}
                                        </MenuItem>
                                    ))}
                                </TextField>
                                <TextField
                                    required
                                    label="Tax code"
                                    value={edit.code}
                                    disabled={busy}
                                    slotProps={{ htmlInput: { maxLength: 30, pattern: "[A-Za-z0-9_-]+" } }}
                                    onChange={event => setEdit({ ...edit, code: event.target.value })}
                                />
                                <TextField
                                    required
                                    label="Tax name"
                                    value={edit.name}
                                    disabled={busy}
                                    slotProps={{ htmlInput: { maxLength: 100 } }}
                                    onChange={event => setEdit({ ...edit, name: event.target.value })}
                                />
                                {edit.components.map((item, index) => (
                                    <TextField
                                        key={item.name}
                                        required
                                        type="number"
                                        label={`${item.name} rate (%)`}
                                        value={item.rate}
                                        disabled={busy}
                                        slotProps={{ htmlInput: { min: 0, max: 100, step: "0.0001" } }}
                                        onChange={event => setEdit({
                                            ...edit,
                                            components: edit.components.map((component, i) =>
                                                i === index ? { ...component, rate: event.target.value } : component
                                            )
                                        })}
                                    />
                                ))}
                                <Typography>Total configured rate: {edit.components.reduce((sum, item) => sum + Number(item.rate || 0), 0)}%</Typography>
                                <TextField
                                    required
                                    type="date"
                                    label="Effective from"
                                    value={edit.effectiveFrom}
                                    disabled={busy}
                                    slotProps={{ inputLabel: { shrink: true } }}
                                    onChange={event => setEdit({ ...edit, effectiveFrom: event.target.value })}
                                />
                                <TextField
                                    type="date"
                                    label="Effective to (optional)"
                                    value={edit.effectiveTo}
                                    disabled={busy}
                                    slotProps={{ inputLabel: { shrink: true }, htmlInput: { min: edit.effectiveFrom } }}
                                    onChange={event => setEdit({ ...edit, effectiveTo: event.target.value })}
                                />
                                <TextField
                                    select
                                    label="Status"
                                    value={String(edit.isActive)}
                                    disabled={busy}
                                    onChange={event => setEdit({ ...edit, isActive: event.target.value === "true" })}
                                >
                                    <MenuItem value="true">Active</MenuItem>
                                    <MenuItem value="false">Inactive</MenuItem>
                                </TextField>
                            </Stack>
                        </DialogContent>
                        <DialogActions sx={{ flexShrink: 0 }}>
                            <Button
                                disabled={busy}
                                onClick={() => setEdit(null)}
                            >Cancel</Button>
                            <Button
                                type="submit"
                                variant="contained"
                                disabled={busy || !edit.components.length}
                            >
                                {busy ? "Saving…" : "Save"}
                            </Button>
                        </DialogActions>
                    </form>
                </Dialog>
            )}

            {detail && (
                <Dialog
                    open
                    fullWidth
                    maxWidth="sm"
                    onClose={() => setDetail(null)}
                >
                    <DialogTitle>{detail.code} · {detail.name}</DialogTitle>
                    <DialogContent dividers>
                        <Stack spacing={1}>
                            <Typography>{company?.name} · {company?.country}</Typography>
                            <Typography>Type: {typeName(detail.taxTypeId)}</Typography>
                            {detail.components.map(item => <Typography key={item.name}>{item.name}: {item.rate}%</Typography>)}
                            <Typography>Total: {detail.rate}%</Typography>
                            <Typography>{detail.effectiveFrom} to {detail.effectiveTo || "no end date"}</Typography>
                            <Typography>{detail.isActive ? "Active" : "Inactive"}</Typography>
                        </Stack>
                    </DialogContent>
                    <DialogActions><Button onClick={() => setDetail(null)}>Close</Button></DialogActions>
                </Dialog>
            )}
        </Page>
    );
}
