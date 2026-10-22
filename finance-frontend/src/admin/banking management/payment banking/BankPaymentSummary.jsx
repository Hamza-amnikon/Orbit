import { Alert, Stack, Typography } from "@mui/material";

export default function BankPaymentSummary({ payment }) {
    if (!payment) {
        return null;
    }

    if (!payment.settlementType) {
        return <Alert severity="info">Earlier payment: no automatic bank entry was created. Check the existing bank records before adding a separate entry.</Alert>;
    }

    if (payment.settlementType === "Cash") {
        return <Alert severity="info">Cash payment · No bank balance change.</Alert>;
    }

    return (
        <Stack spacing={1} sx={{ mt: 2 }}>
            <Alert severity="success">
                {payment.bankReversalTransactionId ? "Bank entry reversed in Finance." : "Bank entry posted in Finance."}
            </Alert>
            <Typography>{payment.bankAccountName} · {payment.bankCurrency} {payment.bankAmount}</Typography>
            <Typography variant="body2" color="text.secondary">
                Find the bank entry by this payment's number and reference. Matching it during reconciliation will not change the balance again.
            </Typography>
        </Stack>
    );
}
