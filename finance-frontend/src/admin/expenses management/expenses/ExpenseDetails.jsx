import { useState } from "react";
import { Alert, Box, Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle, TextField, Typography } from "@mui/material";
import { useLoad } from "../../../live/data";
import { Feedback } from "../../../live/shared";
import { downloadReceipt, formatDate, getExpense, money, voidExpense } from "./ExpenseService";

export default function ExpenseDetails({ id, currency, canWrite, onClose, onChanged, onEdit }) {
    const detail = useLoad(signal => getExpense(id, currency, signal), [id, currency]);
    const [reason, setReason] = useState(null);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState("");
    const row = detail.data;

    async function confirm(event) {
        event.preventDefault();
        if (busy) return;
        setBusy(true);
        setError("");
        try {
            await voidExpense(id, { rowVersion: row.rowVersion, reason });
            setReason(null);
            detail.refresh();
            onChanged();
        } catch (failure) {
            setError(failure.message);
            if (failure.status === 409) detail.refresh();
        } finally { setBusy(false); }
    }

    async function receipt() {
        setBusy(true);
        setError("");
        try { await downloadReceipt(id, row.receiptName); }
        catch (failure) { setError(failure.message); }
        finally { setBusy(false); }
    }

    return <Dialog open fullWidth maxWidth="md" onClose={busy ? undefined : onClose} aria-labelledby="expense-details-title">
        <DialogTitle id="expense-details-title">Expense · EXP-{id}</DialogTitle>
        <DialogContent dividers>
            <Feedback loading={detail.loading} error={detail.error} retry={detail.refresh} />
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            {row && <>
                <Typography variant="h4" fontWeight={700}>{money(row.displayAmount, row.displayCurrency, row.displayCurrencyDecimalPlaces)}</Typography>
                <Chip label={row.status} size="small" sx={{ my: 2 }} />
                <Box className="expenses-form">
                    {[
                        ["Company", row.companyName], ["Date", formatDate(row.date)],
                        ["Supplier", row.supplier], ["Category", row.category],
                        ["Paid from", row.bankAccountName || "Unpaid draft"], ["Reference", row.reference || "—"],
                        ["Original amount", money(row.amount, row.currency, row.currencyDecimalPlaces)],
                        ["Saved rate", "1 " + row.rateBaseCurrency + " = " + row.rate + " " + row.rateQuoteCurrency + " · " + formatDate(row.rateDate)],
                        ["Notes", row.notes || "—"],
                    ].map(([label, value]) => <Box key={label}>
                        <Typography variant="caption" color="text.secondary">{label}</Typography>
                        <Typography sx={{ overflowWrap: "anywhere", whiteSpace: "pre-wrap" }}>{value}</Typography>
                    </Box>)}
                </Box>
                {row.displayCurrency !== row.currency && (
                    <Alert severity={row.displayRate == null ? "warning" : "info"} sx={{ mt: 2 }}>
                        {row.displayRate == null
                            ? "Automatic conversion is unavailable. The original amount is unchanged."
                            : "Display rate: 1 " + row.displayRateBaseCurrency + " = " +
                                row.displayRate + " " + row.displayRateQuoteCurrency +
                                " · " + formatDate(row.displayRateDate) +
                                " · " + row.displayRateSource}
                    </Alert>
                )}
                {row.receiptName && <Button disabled={busy} sx={{ mt: 2 }} onClick={receipt}>Download receipt · {row.receiptName}</Button>}
                {row.status === "Voided" && <Alert severity="warning" sx={{ mt: 2 }}>Void reason: {row.voidReason}</Alert>}
                {reason !== null && <Box component="form" onSubmit={confirm} sx={{ mt: 3 }}>
                    <Alert severity="warning" sx={{ mb: 2 }}>This keeps the expense in history and excludes it from recorded totals.</Alert>
                    <TextField fullWidth required label="Void reason" value={reason} disabled={busy}
                        slotProps={{ htmlInput: { maxLength: 500 } }} onChange={event => setReason(event.target.value)} />
                    <Button type="submit" color="error" disabled={busy || !reason.trim()} sx={{ mt: 1 }}>Confirm Void</Button>
                    <Button disabled={busy} onClick={() => setReason(null)}>Cancel</Button>
                </Box>}
            </>}
        </DialogContent>
        <DialogActions>
            {canWrite && row?.status === "Draft" && <Button disabled={busy} onClick={() => onEdit(row)}>Edit</Button>}
            {canWrite && row && row.status !== "Voided" && reason === null && <Button color="error" disabled={busy} onClick={() => setReason("")}>Void</Button>}
            <Button disabled={busy} onClick={onClose}>Close</Button>
        </DialogActions>
    </Dialog>;
}
