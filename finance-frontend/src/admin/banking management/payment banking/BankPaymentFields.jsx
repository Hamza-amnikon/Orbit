import { useEffect, useState } from "react";
import {
    Alert,
    Autocomplete,
    Button,
    Stack,
    TextField,
} from "@mui/material";
import { getBankAccounts } from "../bank accounts/BankAccountService";
import { isCashPaymentMode } from "./paymentBanking";

export default function BankPaymentFields({
    value,
    onChange,
    currency,
    paymentMode,
    direction,
    disabled,
}) {
    const bankPayment = Boolean(paymentMode) && !isCashPaymentMode(paymentMode);
    const [accounts, setAccounts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [reload, setReload] = useState(0);

    useEffect(() => {
        const controller = new AbortController();

        async function loadAccounts() {
            if (!bankPayment) {
                return;
            }

            setLoading(true);
            setError("");

            try {
                const rows = [];
                let page = 1;
                let result;

                do {
                    result = await getBankAccounts(
                        { page, pageSize: 100, isActive: true },
                        controller.signal
                    );
                    rows.push(...result.data);
                    page += 1;
                } while (rows.length < result.total && result.data.length > 0);

                if (!controller.signal.aborted) {
                    setAccounts(rows.filter(account => account.isActive));
                }
            } catch (failure) {
                if (!controller.signal.aborted) {
                    setAccounts([]);
                    setError(failure.message);
                }
            } finally {
                if (!controller.signal.aborted) {
                    setLoading(false);
                }
            }
        }

        loadAccounts();
        return () => controller.abort();
    }, [bankPayment, reload]);

    const account = accounts.find(row => row.id === Number(value.bankAccountId)) || null;
    const sameCurrency = account?.currency === currency;
    const moneyOut = direction === "out";

    if (!bankPayment) {
        return null;
    }

    return (
        <Stack spacing={2} sx={{ gridColumn: "1 / -1" }}>
            {error && (
                <Alert
                    severity="error"
                    action={
                        <Button disabled={disabled} onClick={() => setReload(previous => previous + 1)}>
                            Retry
                        </Button>
                    }
                >
                    {error}
                </Alert>
            )}

            <Autocomplete
                options={accounts}
                value={account}
                loading={loading}
                disabled={disabled || loading || Boolean(error)}
                isOptionEqualToValue={(left, right) => left.id === right.id}
                getOptionLabel={row => [row.name, row.companyName, row.currency, row.lastFour ? "ending " + row.lastFour : ""].filter(Boolean).join(" Â· ")}
                onChange={(_, next) => onChange({
                    settlementType: "Bank",
                    bankAccountId: next?.id || "",
                    bankCurrency: next?.currency || "",
                    bankAmount: "",
                })}
                renderInput={params => (
                    <TextField
                        {...params}
                        required
                        label={moneyOut ? "Pay from bank account" : "Receive into bank account"}
                        helperText={moneyOut
                            ? "Saving records Money Out from this account."
                            : "Saving records Money In to this account."}
                    />
                )}
            />

            {account && !sameCurrency && (
                <TextField
                    required
                    label={(moneyOut ? "Actual bank debit" : "Actual bank credit") + " (" + account.currency + ")"}
                    value={value.bankAmount || ""}
                    disabled={disabled}
                    onChange={event => onChange({ ...value, bankAmount: event.target.value })}
                    slotProps={{ htmlInput: { inputMode: "decimal" } }}
                    helperText="The account uses a different currency. Enter the actual bank amount; the payment amount above still settles the bill or invoice."
                    fullWidth
                />
            )}

        </Stack>
    );
}
