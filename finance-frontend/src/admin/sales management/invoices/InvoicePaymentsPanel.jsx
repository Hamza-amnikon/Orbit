import { useEffect, useState } from "react";

import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    Chip,
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
import {
    getInvoicePaymentSummary,
} from "./SalesInvoicePaymentService";

function formatDate(value) {
    if (!value) {
        return "—";
    }

    return value.slice(0, 10).split("-").reverse().join("/");
}

const InvoicePaymentsPanel = ({ invoice }) => {
    const { canWrite } = useAuth();

    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [notice, setNotice] = useState("");
    const [open, setOpen] = useState(false);
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
        </Card>
    );
};

export default InvoicePaymentsPanel;