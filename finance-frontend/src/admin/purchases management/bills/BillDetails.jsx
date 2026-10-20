import { useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Alert, Box, Button, Card, Chip, Dialog, DialogActions, DialogContent, DialogContentText,
    DialogTitle, Divider, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from "@mui/material";
import { useAuth } from "../../../context/AuthContext";
import { Feedback, Page } from "../../../live/shared";
import { useLoad } from "../../../live/data";
import { changeBillStatus, getBill } from "./BillService";
import { formatDate, money, orderStatus, purchaseUnits } from "./BillHelpers";
import BillForm from "./BillForm";
<<<<<<< HEAD
=======
import { getBillPaymentBalance } from "../Payments Made/PaymentMadeService";
>>>>>>> aa1e4a9f74574849eb8f784b0674a71d22345bdc
import "./BillWorkspace.css";

export default function BillDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { canWrite } = useAuth();
    const detail = useLoad(signal => getBill(id, signal), [id]);
    const order = detail.data;
<<<<<<< HEAD
=======
    const paymentBalance = useLoad(signal => getBillPaymentBalance(id, signal), [id]);
>>>>>>> aa1e4a9f74574849eb8f784b0674a71d22345bdc
    const [editing, setEditing] = useState(false);
    const [action, setAction] = useState(null);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState("");
    const [conflict, setConflict] = useState(false);
    const [notice, setNotice] = useState("");
    const locked = useRef(false);

    async function confirmAction() {
        if (locked.current || !order) return;
        locked.current = true; setBusy(true); setError("");
        try {
            await changeBillStatus(order.id, action, order.rowVersion);
            setAction(null); setNotice(action === "issue" ? "Bill issued." : "Bill cancelled.");
            detail.refresh();
        } catch (actionError) { setError(actionError.message); setConflict(actionError.status === 409); }
        finally { locked.current = false; setBusy(false); }
    }
    function openAction(next) { setError(""); setConflict(false); setAction(next); }
    return <Page title="Bills" subtitle={order?.billNumber || (order ? `Draft #${order.id}` : "")}
        action={<>
            <Button onClick={() => navigate("/purchases/bills")}>Back to Bills</Button>
            <Button variant="outlined" disabled={detail.loading || busy} onClick={detail.refresh}>Refresh</Button>
            {order && !detail.loading && <>
                <Button variant="outlined" onClick={() => window.print()}>Print</Button>
                {order.sourcePurchaseOrderId && <Button onClick={() => navigate(`/purchases/orders/${order.sourcePurchaseOrderId}`)}>View Purchase Order</Button>}
                {canWrite && order.status === 0 && <>
                    <Button variant="outlined" onClick={() => setEditing(true)}>Edit Draft</Button>
                    <Button variant="contained" onClick={() => openAction("issue")}>Issue Bill</Button>
                </>}
<<<<<<< HEAD
=======
                {canWrite && order.status === 1 && paymentBalance.data?.outstandingAmount > 0 && (
                    <Button
                        variant="contained"
                        onClick={() => navigate("/purchases/payments?billId=" + order.id)}
                    >
                        Record Payment
                    </Button>
                )}
>>>>>>> aa1e4a9f74574849eb8f784b0674a71d22345bdc
                {canWrite && order.status !== 2 && <Button variant="outlined" color="error" onClick={() => openAction("cancel")}>Cancel Bill</Button>}
            </>}
        </>}>
        {notice && <Alert className="bill-screen-only" severity="success" sx={{ mb: 2 }} onClose={() => setNotice("")}>{notice}</Alert>}
        <Feedback loading={detail.loading} error={detail.error} retry={detail.refresh} />
        {order && !detail.loading && !detail.error && <Card className="bill-document">
            <Box className="bill-document-header">
                <Box><Typography component="h2" variant="h5" fontWeight={700}>Bill</Typography>
                    <Typography color="text.secondary" sx={{ mt: 1 }}>Managing branch: {order.branch}</Typography>
                    <Typography color="text.secondary">Currency: {order.currency}</Typography></Box>
                <Box sx={{ textAlign: { xs: "left", sm: "right" } }}>
                    <Typography variant="h5" fontWeight={700}>{order.billNumber || `Draft #${order.id}`}</Typography>
                    <Chip sx={{ mt: 1 }} label={orderStatus(order.status)}
                        color={order.status === 1 ? "success" : order.status === 2 ? "error" : "default"} />
                </Box>
            </Box>
            <Divider sx={{ my: 3 }} />
            <Box className="bill-address-grid">
                <Box>
                    <Typography color="text.secondary" variant="overline">Vendor</Typography>
                    <Typography fontWeight={700}>{order.vendorName}</Typography>
                    <Typography>{order.companyName}</Typography>
                    <Typography className="bill-text" sx={{ mt: 1 }}>{order.billingAddress || "—"}</Typography>
                </Box>
                <Box>
                    {[["Bill Date", formatDate(order.billDate)], ["Due Date", formatDate(order.dueDate)],
                        ["Vendor Invoice", order.vendorInvoiceNumber || "—"], ["Purchase Order", order.sourcePurchaseOrderNumber || "—"], ["Reference", order.reference || "—"], ["Payment Terms", order.paymentTerms || "—"]].map(([label, value]) =>
                        <Box key={label} className="bill-total-row"><Typography color="text.secondary">{label}</Typography>
                            <Typography className="bill-text">{value}</Typography></Box>)}
                </Box>
                {order.shippingAddress && <Box><Typography fontWeight={700}>Delivery Address</Typography>
                    <Typography className="bill-text">{order.shippingAddress}</Typography></Box>}
            </Box>
            <Divider sx={{ my: 3 }} />
            <TableContainer tabIndex={0} role="region" aria-label="Bill items">
                <Table sx={{ minWidth: 700 }} aria-label="Bill items">
                    <TableHead><TableRow>{["Item / Service", "Unit", "Quantity", "Rate", "Discount", "Tax", "Amount"].map(label =>
                        <TableCell key={label}>{label}</TableCell>)}</TableRow></TableHead>
                    <TableBody>{order.items.map(item => <TableRow key={item.id || item.lineNumber}>
                        <TableCell><Typography fontWeight={600}>{item.itemName}</Typography>
                            <Typography variant="body2" color="text.secondary">{item.description}</Typography></TableCell>
                        <TableCell>{purchaseUnits[item.unit] || "—"}</TableCell><TableCell>{item.quantity}</TableCell>
                        <TableCell>{money(item.unitPrice, order.currency, order.currencyDecimalPlaces)}</TableCell>
                        <TableCell>{money(item.discountAmount, order.currency, order.currencyDecimalPlaces)}</TableCell>
                        <TableCell>{item.taxRate}%<Typography variant="caption" display="block">
                            {money(item.taxAmount, order.currency, order.currencyDecimalPlaces)}</Typography></TableCell>
                        <TableCell>{money(item.lineTotal, order.currency, order.currencyDecimalPlaces)}</TableCell>
                    </TableRow>)}</TableBody>
                </Table>
            </TableContainer>
            <Box className="bill-totals">
                {[["Subtotal", "subTotal"], ["Discount", "discountTotal"], ["Tax", "taxTotal"], ["Total Amount", "grandTotal"]].map(([label, name]) =>
                    <Box key={name} className="bill-total-row"><Typography fontWeight={name === "grandTotal" ? 700 : 400}>{label}</Typography>
                        <Typography fontWeight={name === "grandTotal" ? 700 : 400}>
                            {money(order[name], order.currency, order.currencyDecimalPlaces)}</Typography></Box>)}
            </Box>
<<<<<<< HEAD
=======
            {order.status === 1 && paymentBalance.data && (
                <Alert severity="info" sx={{ mt: 2 }}>
                    {paymentBalance.data.paymentStatus}
                    {" · "}Paid: {money(paymentBalance.data.paidAmount, order.currency, order.currencyDecimalPlaces)}
                    {" · "}Credits applied: {money(paymentBalance.data.appliedCreditAmount ?? 0, order.currency, order.currencyDecimalPlaces)}
                    {" · "}Outstanding: {money(paymentBalance.data.outstandingAmount, order.currency, order.currencyDecimalPlaces)}
                </Alert>
            )}
            {paymentBalance.error && (
                <Alert severity="warning" sx={{ mt: 2 }}
                    action={<Button onClick={paymentBalance.refresh}>Retry balance</Button>}>
                    Payment balance could not be loaded.
                </Alert>
            )}
>>>>>>> aa1e4a9f74574849eb8f784b0674a71d22345bdc
            {(order.notes || order.additionalTerms) && <Divider sx={{ my: 3 }} />}
            <Stack spacing={2}>
                {order.notes && <Box><Typography fontWeight={700}>Notes</Typography><Typography className="bill-text">{order.notes}</Typography></Box>}
                {order.additionalTerms && <Box><Typography fontWeight={700}>Additional Terms</Typography>
                    <Typography className="bill-text">{order.additionalTerms}</Typography></Box>}
            </Stack>
        </Card>}
        {canWrite && editing && order && <BillForm order={order} onClose={() => setEditing(false)}
            onSaved={() => { setEditing(false); setNotice("Bill saved."); detail.refresh(); }} />}
        {canWrite && action && <Dialog open fullWidth maxWidth="xs" aria-labelledby="bill-action-title" onClose={busy ? undefined : () => setAction(null)}>
            <DialogTitle id="bill-action-title">{action === "issue" ? "Issue bill?" : "Cancel bill?"}</DialogTitle>
            <DialogContent>
                <DialogContentText>{action === "issue"
                    ? "Issuing assigns a bill number and freezes the bill details. It does not record a payment."
                    : "The bill will be marked cancelled and its record will be retained."}</DialogContentText>
                {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
                {conflict && <Button onClick={() => { setAction(null); detail.refresh(); }} disabled={busy}>Refresh bill</Button>}
            </DialogContent>
            <DialogActions>
                <Button disabled={busy} onClick={() => setAction(null)}>Back</Button>
                <Button variant="contained" color={action === "cancel" ? "error" : "primary"} disabled={busy || conflict} onClick={confirmAction}>
                    {busy ? "Working..." : action === "issue" ? "Confirm Issue" : "Confirm Cancellation"}
                </Button>
            </DialogActions>
        </Dialog>}
    </Page>;
}
