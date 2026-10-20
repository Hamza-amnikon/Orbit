import { useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Alert, Box, Button, Card, Chip, Dialog, DialogActions, DialogContent, DialogContentText,
    DialogTitle, Divider, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from "@mui/material";
import { useAuth } from "../../../context/AuthContext";
import { Feedback, Page } from "../../../live/shared";
import { useLoad } from "../../../live/data";
import { changePurchaseOrderStatus, getPurchaseOrder, convertPurchaseOrderToBill } from "./PurchaseOrderService";
import { formatDate, money, orderStatus, purchaseUnits } from "./PurchaseOrderHelpers";
import PurchaseOrderForm from "./PurchaseOrderForm";
import "./PurchaseOrderWorkspace.css";

export default function PurchaseOrderDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { canWrite } = useAuth();
    const detail = useLoad(signal => getPurchaseOrder(id, signal), [id]);
    const order = detail.data;
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
            if (action === "convert") {
                const bill = await convertPurchaseOrderToBill(order.id, order.rowVersion);
                navigate(`/purchases/bills/${bill.id}`);
                return;
            }
            await changePurchaseOrderStatus(order.id, action, order.rowVersion);
            setAction(null); setNotice(action === "issue" ? "Purchase order issued." : "Purchase order cancelled.");
            detail.refresh();
        } catch (actionError) { setError(actionError.message); setConflict(actionError.status === 409); }
        finally { locked.current = false; setBusy(false); }
    }
    function openAction(next) { setError(""); setConflict(false); setAction(next); }
    return <Page title="Purchase Orders" subtitle={order?.purchaseOrderNumber || (order ? `Draft #${order.id}` : "")}
        action={<>
            <Button onClick={() => navigate("/purchases/orders")}>Back to Purchase Orders</Button>
            <Button variant="outlined" disabled={detail.loading || busy} onClick={detail.refresh}>Refresh</Button>
            {order && !detail.loading && <>
                <Button variant="outlined" onClick={() => window.print()}>Print</Button>
                {canWrite && order.status === 0 && <>
                    <Button variant="outlined" onClick={() => setEditing(true)}>Edit Draft</Button>
                    <Button variant="contained" onClick={() => openAction("issue")}>Issue Purchase Order</Button>
                </>}
                {canWrite && order.status === 1 && <Button variant="contained" onClick={() => openAction("convert")}>Convert to Bill</Button>}
                {canWrite && order.status !== 2 && <Button variant="outlined" color="error" onClick={() => openAction("cancel")}>Cancel Order</Button>}
            </>}
        </>}>
        {notice && <Alert className="po-screen-only" severity="success" sx={{ mb: 2 }} onClose={() => setNotice("")}>{notice}</Alert>}
        <Feedback loading={detail.loading} error={detail.error} retry={detail.refresh} />
        {order && !detail.loading && !detail.error && <Card className="po-document">
            <Box className="po-document-header">
                <Box><Typography component="h2" variant="h5" fontWeight={700}>Purchase Order</Typography>
                    <Typography color="text.secondary" sx={{ mt: 1 }}>Managing branch: {order.branch}</Typography>
                    <Typography color="text.secondary">Currency: {order.currency}</Typography></Box>
                <Box sx={{ textAlign: { xs: "left", sm: "right" } }}>
                    <Typography variant="h5" fontWeight={700}>{order.purchaseOrderNumber || `Draft #${order.id}`}</Typography>
                    <Chip sx={{ mt: 1 }} label={orderStatus(order.status)}
                        color={order.status === 1 ? "success" : order.status === 2 ? "error" : "default"} />
                </Box>
            </Box>
            <Divider sx={{ my: 3 }} />
            <Box className="po-address-grid">
                <Box>
                    <Typography color="text.secondary" variant="overline">Vendor</Typography>
                    <Typography fontWeight={700}>{order.vendorName}</Typography>
                    <Typography>{order.companyName}</Typography>
                    <Typography className="po-text" sx={{ mt: 1 }}>{order.billingAddress || "—"}</Typography>
                </Box>
                <Box>
                    {[["Order Date", formatDate(order.orderDate)], ["Expected Delivery", formatDate(order.expectedDeliveryDate)],
                        ["Reference", order.reference || "—"], ["Payment Terms", order.paymentTerms || "—"]].map(([label, value]) =>
                        <Box key={label} className="po-total-row"><Typography color="text.secondary">{label}</Typography>
                            <Typography className="po-text">{value}</Typography></Box>)}
                </Box>
                {order.shippingAddress && <Box><Typography fontWeight={700}>Delivery Address</Typography>
                    <Typography className="po-text">{order.shippingAddress}</Typography></Box>}
            </Box>
            <Divider sx={{ my: 3 }} />
            <TableContainer tabIndex={0} role="region" aria-label="Purchase order items">
                <Table sx={{ minWidth: 700 }} aria-label="Purchase order items">
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
            <Box className="po-totals">
                {[["Subtotal", "subTotal"], ["Discount", "discountTotal"], ["Tax", "taxTotal"], ["Total Amount", "grandTotal"]].map(([label, name]) =>
                    <Box key={name} className="po-total-row"><Typography fontWeight={name === "grandTotal" ? 700 : 400}>{label}</Typography>
                        <Typography fontWeight={name === "grandTotal" ? 700 : 400}>
                            {money(order[name], order.currency, order.currencyDecimalPlaces)}</Typography></Box>)}
            </Box>
            {(order.notes || order.additionalTerms) && <Divider sx={{ my: 3 }} />}
            <Stack spacing={2}>
                {order.notes && <Box><Typography fontWeight={700}>Notes</Typography><Typography className="po-text">{order.notes}</Typography></Box>}
                {order.additionalTerms && <Box><Typography fontWeight={700}>Additional Terms</Typography>
                    <Typography className="po-text">{order.additionalTerms}</Typography></Box>}
            </Stack>
        </Card>}
        {canWrite && editing && order && <PurchaseOrderForm order={order} onClose={() => setEditing(false)}
            onSaved={() => { setEditing(false); setNotice("Purchase order saved."); detail.refresh(); }} />}
        {canWrite && action && <Dialog open fullWidth maxWidth="xs" aria-labelledby="po-action-title" onClose={busy ? undefined : () => setAction(null)}>
            <DialogTitle id="po-action-title">{action === "convert" ? "Create draft bill?" : action === "issue" ? "Issue purchase order?" : "Cancel purchase order?"}</DialogTitle>
            <DialogContent>
                <DialogContentText>{action === "convert" ? "Copy this order into one linked draft bill. If it was already converted, the existing bill opens. Enter the vendor invoice number and due date before issuing it." : action === "issue"
                    ? "Issuing assigns a PO number and freezes the order details. It does not send an email or create a bill."
                    : "The order will be marked cancelled and its record will be retained."}</DialogContentText>
                {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
                {conflict && <Button onClick={() => { setAction(null); detail.refresh(); }} disabled={busy}>Refresh order</Button>}
            </DialogContent>
            <DialogActions>
                <Button disabled={busy} onClick={() => setAction(null)}>Back</Button>
                <Button variant="contained" color={action === "cancel" ? "error" : "primary"} disabled={busy || conflict} onClick={confirmAction}>
                    {busy ? "Working..." : action === "convert" ? "Create Draft Bill" : action === "issue" ? "Confirm Issue" : "Confirm Cancellation"}
                </Button>
            </DialogActions>
        </Dialog>}
    </Page>;
}
