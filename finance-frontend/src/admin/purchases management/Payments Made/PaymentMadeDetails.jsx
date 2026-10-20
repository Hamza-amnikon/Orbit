import { useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
    Alert,
    Box,
    Button,
    Card,
    Chip,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    TextField,
    Typography,
} from "@mui/material";
import { useAuth } from "../../../context/AuthContext";
import { useLoad } from "../../../live/data";
import { Feedback, Page } from "../../../live/shared";
import {
    formatDate,
    getPaymentMade,
    money,
    voidPaymentMade,
} from "./PaymentMadeService";

export default function PaymentMadeDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { canWrite } = useAuth();
    const detail = useLoad(signal => getPaymentMade(id, signal), [id]);
    const payment = detail.data;
    const [voiding, setVoiding] = useState(false);
    const [reason, setReason] = useState("");
    const [error, setError] = useState("");
    const [busy, setBusy] = useState(false);
    const [conflict, setConflict] = useState(false);
    const [notice, setNotice] = useState("");
    const locked = useRef(false);

    function reload() {
        setVoiding(false);
        setConflict(false);
        setError("");
        detail.refresh();
    }

    async function confirmVoid() {
        if (locked.current || !payment || conflict) {
            return;
        }

        if (!reason.trim()) {
            setError("Enter a reason for voiding this payment.");
            return;
        }

        locked.current = true;
        setBusy(true);
        setError("");

        try {
            await voidPaymentMade(payment.id, {
                rowVersion: payment.rowVersion,
                reason: reason.trim(),
            });

            setVoiding(false);
            setNotice("Payment voided. Its amount no longer reduces the bill balance.");
            detail.refresh();
        } catch (voidError) {
            setError(voidError.message);
            setConflict(voidError.status === 409);
        } finally {
            locked.current = false;
            setBusy(false);
        }
    }

    return (
        <Page
            title="Payments Made"
            subtitle={payment?.paymentNumber || ""}
            action={
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                    <Button
                        disabled={busy}
                        onClick={() => navigate("/purchases/payments")}
                    >
                        Back to Payments Made
                    </Button>

                    <Button
                        variant="outlined"
                        disabled={busy || detail.loading}
                        onClick={reload}
                    >
                        Refresh
                    </Button>

                    {payment && (
                        <Button
                            disabled={busy}
                            onClick={() => {
                                navigate("/purchases/bills/" + payment.billId);
                            }}
                        >
                            View Bill
                        </Button>
                    )}

                    {canWrite && payment?.status === 0 && (
                        <Button
                            color="error"
                            variant="outlined"
                            disabled={busy}
                            onClick={() => {
                                setError("");
                                setReason("");
                                setConflict(false);
                                setVoiding(true);
                            }}
                        >
                            Void Payment
                        </Button>
                    )}
                </Box>
            }
        >
            <Feedback
                loading={detail.loading}
                error={detail.error}
                retry={detail.refresh}
            />

            {notice && <Alert severity="success" sx={{ mb: 2 }}>{notice}</Alert>}

            {payment && !detail.loading && !detail.error && (
                <Card sx={{ p: { xs: 2, sm: 3 } }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", gap: 2 }}>
                        <Typography variant="h5" fontWeight={700}>
                            {payment.paymentNumber}
                        </Typography>

                        <Chip label={payment.status === 0 ? "Recorded" : "Voided"} />
                    </Box>

                    <Box
                        sx={{
                            mt: 3,
                            display: "grid",
                            gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                            gap: 2,
                        }}
                    >
                        {[
                            ["Vendor", payment.vendorName],
                            ["Bill", payment.billNumber],
                            ["Vendor Invoice", payment.vendorInvoiceNumber],
                            ["Payment Date", formatDate(payment.paymentDate)],
                            ["Payment Mode", payment.paymentMode],
                            ["Branch", payment.branch],
                            ["Amount Paid", money(
                                payment.amount,
                                payment.currency,
                                payment.currencyDecimalPlaces
                            )],
                            ["Reference", payment.reference],
                            ["Notes", payment.notes],
                            ["Void Reason", payment.voidReason],
                        ].filter(([, value]) => Boolean(value)).map(([label, value]) => (
                            <Box key={label}>
                                <Typography color="text.secondary" variant="body2">
                                    {label}
                                </Typography>
                                <Typography sx={{ whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}>
                                    {value}
                                </Typography>
                            </Box>
                        ))}
                    </Box>

                    {payment.billBalance && (
                        <Alert severity="info" sx={{ mt: 3 }}>
                            Current bill status: {payment.billBalance.paymentStatus}
                            {" · "}Paid: {money(
                                payment.billBalance.paidAmount,
                                payment.currency,
                                payment.currencyDecimalPlaces
                            )}
                            {" · "}Credits applied: {money(
                                payment.billBalance.appliedCreditAmount ?? 0,
                                payment.currency,
                                payment.currencyDecimalPlaces
                            )}
                            {" · "}Outstanding: {money(
                                payment.billBalance.outstandingAmount,
                                payment.currency,
                                payment.currencyDecimalPlaces
                            )}
                        </Alert>
                    )}
                </Card>
            )}

            {voiding && (
                <Dialog
                    open
                    fullWidth
                    maxWidth="xs"
                    onClose={busy ? undefined : () => setVoiding(false)}
                    aria-labelledby="void-payment-title"
                >
                    <DialogTitle id="void-payment-title">Void payment?</DialogTitle>
                    <DialogContent>
                        <DialogContentText>
                            This corrects the payment record and restores its amount
                            to the bill balance. It does not reverse a bank transfer.
                        </DialogContentText>

                        <TextField
                            label="Void reason"
                            required
                            multiline
                            fullWidth
                            minRows={2}
                            value={reason}
                            disabled={busy}
                            sx={{ mt: 2 }}
                            slotProps={{ htmlInput: { maxLength: 500 } }}
                            onChange={event => setReason(event.target.value)}
                        />

                        {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
                        {conflict && <Button onClick={reload}>Reload payment</Button>}
                    </DialogContent>
                    <DialogActions>
                        <Button disabled={busy} onClick={() => setVoiding(false)}>
                            Back
                        </Button>
                        <Button
                            variant="contained"
                            color="error"
                            disabled={busy || conflict}
                            onClick={confirmVoid}
                        >
                            {busy ? "Voiding..." : "Confirm Void"}
                        </Button>
                    </DialogActions>
                </Dialog>
            )}
        </Page>
    );
}
