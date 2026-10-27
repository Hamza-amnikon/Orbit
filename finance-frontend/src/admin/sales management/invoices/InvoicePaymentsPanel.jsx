import { useEffect, useState } from "react";

import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
} from "@mui/material";

import { useAuth } from "../../../live/AuthContext";
import { money } from "../../../live/data";

import InvoicePaymentForm from "./InvoicePaymentForm";
import IssuedInvoice from "./IssuedInvoice";
import {
    getInvoicePaymentSummary,
} from "./SalesInvoicePaymentService";

function formatDate(value) {
    if (!value) {
        return "—";
    }

    return value.slice(0, 10).split("-").reverse().join("/");
}

const unitNames = {
    0: "Hour",
    1: "Day",
    2: "Month",
    3: "Fixed fee",
};

function formatAmount(value, currency) {
    if (value == null) {
        return "—";
    }

    return new Intl.NumberFormat(undefined, {
        style: "currency",
        currency,
        currencyDisplay: "code",
    }).format(value);
}

const InvoicePaymentsPanel = ({ invoice }) => {
    const { canWrite } = useAuth();

    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [notice, setNotice] = useState("");
    const [open, setOpen] = useState(false);
    const [viewPayment, setViewPayment] = useState(null);
    const [revision, setRevision] = useState(0);

    useEffect(() => {
        const controller = new AbortController();

        async function loadSummary() {
            setLoading(true);
            setError("");

            try {
                const result = await getInvoicePaymentSummary(
                    invoice.id,
                    controller.signal
                );

                if (
                    result.salesInvoiceId !== invoice.id ||
                    !Array.isArray(result.payments)
                ) {
                    throw new Error(
                        "Invalid invoice payment summary."
                    );
                }

                if (!controller.signal.aborted) {
                    setSummary(result);
                }
            } catch (failure) {
                if (!controller.signal.aborted) {
                    setError(failure.message);
                }
            } finally {
                if (!controller.signal.aborted) {
                    setLoading(false);
                }
            }
        }

        loadSummary();

        return () => controller.abort();
    }, [invoice.id, revision]);

    function refresh() {
        setRevision((previous) => previous + 1);
    }

    function closeForm() {
        setOpen(false);
        refresh();
    }

    function handleSaved(payment) {
        setOpen(false);
        setNotice(
            `${payment.paymentNumber}: ${money(
                payment.amount,
                payment.currency
            )} recorded.`
        );
        refresh();
    }

    function downloadInvoicePdf() {
        const invoiceContent = document.querySelector(
            ".invoice-payment-preview-content"
        );

        if (!invoiceContent) {
            return;
        }

        document.getElementById("invoice-payment-print-root")?.remove();
        document.getElementById("invoice-payment-print-style")?.remove();

        const printRoot = document.createElement("div");
        printRoot.id = "invoice-payment-print-root";
        printRoot.appendChild(invoiceContent.cloneNode(true));

        const printStyle = document.createElement("style");
        printStyle.id = "invoice-payment-print-style";
        printStyle.textContent = `
            @media print {
                @page { size: A4; margin: 12mm; }
                body > *:not(#invoice-payment-print-root) {
                    display: none !important;
                }
                #invoice-payment-print-root,
                #invoice-payment-print-root * {
                    visibility: visible !important;
                }
                #invoice-payment-print-root {
                    display: block !important;
                    position: static !important;
                    width: 100% !important;
                    margin: 0 !important;
                    padding: 0 !important;
                    background: #ffffff !important;
                }
                #invoice-payment-print-root .issued-invoice {
                    box-sizing: border-box;
                    width: 100%;
                    max-width: 186mm;
                    min-height: 0;
                    margin: 0 auto;
                    padding-top: 0;
                    overflow: visible;
                    color: #111111;
                    background: #ffffff;
                    font-family: Arial, sans-serif;
                    font-size: 10pt;
                    --invoice-paper: #ffffff;
                    --invoice-hover: #eef3fa;
                    --invoice-text: #111111;
                }
                #invoice-payment-print-root .issued-invoice-logo {
                    width: 135px;
                    height: 85px;
                    object-fit: contain;
                }
                #invoice-payment-print-root img { max-width: 100%; }
            }
        `;

        document.head.appendChild(printStyle);
        document.body.appendChild(printRoot);

        const cleanUpPrint = () => {
            printRoot.remove();
            printStyle.remove();
            window.removeEventListener("afterprint", cleanUpPrint);
        };

        window.addEventListener("afterprint", cleanUpPrint, { once: true });
        window.print();

        window.setTimeout(() => {
            if (printRoot.isConnected) {
                cleanUpPrint();
            }
        }, 60000);
    }

    const ready = !loading && !error && summary != null;

    const statusColor =
        (summary?.paymentStatus === "Paid" || summary?.paymentStatus === "Credited")
            ? "success"
            : summary?.paymentStatus === "Credit Balance"
                ? "info"
                : summary?.paymentStatus === "Partially Paid"
                ? "warning"
                : "default";

    const cards = [
        ["Invoice Total", summary?.invoiceTotal],
        ...(summary?.creditedAmount > 0 ? [
            ["Issued Credits", summary.creditedAmount],
            ["Adjusted Invoice Total", summary.adjustedInvoiceTotal],
        ] : []),
        ["Paid Amount", summary?.paidAmount],
        ["Balance Due", summary?.balanceDue],
        ...(summary?.creditBalance > 0 ? [
            ["Credit Balance", summary.creditBalance],
        ] : []),
    ];

    return (
        <Card
            className="invoice-payment-panel"
            sx={{ mb: 3 }}
        >
            <CardContent>
                <Stack
                    direction={{ xs: "column", sm: "row" }}
                    justifyContent="space-between"
                    alignItems={{ xs: "stretch", sm: "center" }}
                    spacing={2}
                    sx={{ mb: 2 }}
                >
                    <Stack
                        direction="row"
                        spacing={2}
                        alignItems="center"
                    >
                        <Typography variant="h6">
                            Payment Summary
                        </Typography>

                        {ready && (
                            <Chip
                                label={summary.paymentStatus}
                                color={statusColor}
                                size="small"
                            />
                        )}
                    </Stack>

                    <Stack direction="row" spacing={1}>
                        <Button
                            disabled={loading}
                            onClick={refresh}
                        >
                            Refresh
                        </Button>

                        {canWrite && (
                            <Button
                                variant="contained"
                                disabled={
                                    !ready ||
                                    summary.balanceDue <= 0
                                }
                                onClick={() => {
                                    setNotice("");
                                    setOpen(true);
                                }}
                            >
                                Record Payment
                            </Button>
                        )}
                    </Stack>
                </Stack>

                {notice && (
                    <Alert
                        severity="success"
                        onClose={() => setNotice("")}
                        sx={{ mb: 2 }}
                    >
                        {notice}
                    </Alert>
                )}

                {error && (
                    <Alert
                        severity="error"
                        action={
                            <Button
                                color="inherit"
                                onClick={refresh}
                            >
                                Retry
                            </Button>
                        }
                        sx={{ mb: 2 }}
                    >
                        {error}
                    </Alert>
                )}

                {loading && (
                    <Typography sx={{ mb: 2 }}>
                        Loading payments...
                    </Typography>
                )}

                <Box
                    sx={{
                        display: "grid",
                        gridTemplateColumns: {
                            xs: "1fr",
                            sm: "repeat(3, 1fr)",
                        },
                        gap: 2,
                        mb: 3,
                    }}
                >
                    {cards.map(([label, value]) => (
                        <Box
                            key={label}
                            sx={{
                                p: 2,
                                border: "1px solid",
                                borderColor: "divider",
                                borderRadius: 2,
                            }}
                        >
                            <Typography
                                variant="body2"
                                color="text.secondary"
                            >
                                {label}
                            </Typography>

                            <Typography
                                variant="h6"
                                sx={{ mt: 1 }}
                            >
                                {ready
                                    ? money(value, summary.currency)
                                    : "—"}
                            </Typography>
                        </Box>
                    ))}
                </Box>

                <Typography variant="h6" sx={{ mb: 2 }}>
                    Payment History
                </Typography>

                {ready && summary.payments.length === 0 && (
                    <Typography color="text.secondary">
                        No payments recorded yet.
                    </Typography>
                )}

                {ready && summary.payments.length > 0 && (
                    <TableContainer>
                        <Table
                            size="small"
                            aria-label="Invoice payment history"
                        >
                            <TableHead>
                                <TableRow>
                                    <TableCell>Payment</TableCell>
                                    <TableCell>Date</TableCell>
                                    <TableCell>Mode</TableCell>
                                    <TableCell align="right">
                                        Amount
                                    </TableCell>
                                    <TableCell>Reference</TableCell>
                                    <TableCell>Action</TableCell>
                                </TableRow>
                            </TableHead>

                            <TableBody>
                                {summary.payments.map((payment) => (
                                    <TableRow key={payment.id}>
                                        <TableCell>
                                            {payment.paymentNumber}
                                        </TableCell>

                                        <TableCell>
                                            {formatDate(
                                                payment.paymentDate
                                            )}
                                        </TableCell>

                                        <TableCell>
                                            {payment.paymentMode}
                                        </TableCell>

                                        <TableCell align="right">
                                            {money(
                                                payment.amount,
                                                payment.currency
                                            )}
                                        </TableCell>

                                        <TableCell>
                                            {payment.reference || "—"}
                                        </TableCell>

                                        <TableCell>
                                            <Button
                                                onClick={() => setViewPayment(payment)}
                                            >
                                                View
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}
            </CardContent>

            {open && (
                <InvoicePaymentForm
                    key={invoice.id}
                    invoice={invoice}
                    onClose={closeForm}
                    onSaved={handleSaved}
                />
            )}

            {viewPayment && (
                <Dialog
                    open
                    fullWidth
                    maxWidth="lg"
                    className="invoice-payment-preview-dialog"
                    onClose={() => setViewPayment(null)}
                    aria-labelledby="invoice-payment-view-title"
                >
                    <DialogTitle id="invoice-payment-view-title">
                        Payment {viewPayment.paymentNumber} · Invoice {invoice.invoiceNumber}
                    </DialogTitle>

                    <DialogContent dividers>
                        <div className="invoice-payment-preview-content">
                            <IssuedInvoice
                                invoice={invoice}
                                formatDate={formatDate}
                                formatAmount={formatAmount}
                                unitNames={unitNames}
                                paymentSummary={{
                                    paymentAmount: viewPayment.amount,
                                    paidAmount: summary.payments
                                        .filter(payment =>
                                            payment.paymentDate < viewPayment.paymentDate ||
                                            (payment.paymentDate === viewPayment.paymentDate &&
                                                payment.id <= viewPayment.id)
                                        )
                                        .reduce((total, payment) => total + payment.amount, 0),
                                    balanceDue: Math.max(
                                        0,
                                        (summary.adjustedInvoiceTotal ?? summary.invoiceTotal) -
                                            summary.payments
                                                .filter(payment =>
                                                    payment.paymentDate < viewPayment.paymentDate ||
                                                    (payment.paymentDate === viewPayment.paymentDate &&
                                                        payment.id <= viewPayment.id)
                                                )
                                                .reduce((total, payment) => total + payment.amount, 0)
                                    ),
                                }}
                            />
                        </div>
                    </DialogContent>

                    <DialogActions>
                        <Button
                            variant="contained"
                            onClick={downloadInvoicePdf}
                        >
                            Download PDF
                        </Button>
                        <Button onClick={() => setViewPayment(null)}>
                            Close
                        </Button>
                    </DialogActions>
                </Dialog>
            )}
        </Card>
    );
};

export default InvoicePaymentsPanel;
