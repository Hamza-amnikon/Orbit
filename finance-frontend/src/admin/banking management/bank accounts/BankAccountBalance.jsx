import {
    Alert,
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Typography,
} from "@mui/material";

import { useLoad } from "../../../live/data";
import { Feedback } from "../../../live/shared";

import {
    getBankAccountBalance,
} from "./BankAccountService";

function formatAmount(amount, balance) {
    if (amount == null) {
        return "—";
    }

    return new Intl.NumberFormat(
        undefined,
        {
            style: "currency",
            currency: balance.currency,
            currencyDisplay: "code",
            minimumFractionDigits: balance.currencyDecimalPlaces,
            maximumFractionDigits: balance.currencyDecimalPlaces,
        }
    ).format(amount);
}

function BalanceField({
    label,
    amount,
    balance,
}) {
    return (
        <Box>
            <Typography
                variant="body2"
                color="text.secondary"
            >
                {label}
            </Typography>

            <Typography
                variant="h6"
                sx={{ mt: 0.5 }}
            >
                {formatAmount(amount, balance)}
            </Typography>
        </Box>
    );
}

function BankAccountBalance({
    id,
    onClose,
}) {
    const detail = useLoad(
        signal => getBankAccountBalance(
            id,
            signal
        ),
        [id]
    );

    const balance = detail.data;

    return (
        <Dialog
            open
            fullWidth
            maxWidth="sm"
            onClose={onClose}
            aria-labelledby="bank-account-balance-title"
        >
            <DialogTitle id="bank-account-balance-title">
                Account Balance
            </DialogTitle>

            <DialogContent dividers>
                <Feedback
                    loading={detail.loading}
                    error={detail.error}
                    retry={detail.refresh}
                />

                {!detail.loading &&
                    !detail.error &&
                    balance && (
                        <>
                            <Typography
                                variant="h6"
                                fontWeight={700}
                            >
                                {balance.bankAccountName}
                            </Typography>

                            <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{ mt: 0.5 }}
                            >
                                {balance.companyName} · {balance.currency}
                            </Typography>

                            {!balance.isOpeningBalanceConfigured ? (
                                <Alert
                                    severity="info"
                                    sx={{ mt: 2 }}
                                >
                                    Configure this account’s opening
                                    balance before calculating its balance.
                                </Alert>
                            ) : (
                                <>
                                    <Typography
                                        variant="body2"
                                        sx={{ mt: 2 }}
                                    >
                                        Opening date:{" "}
                                        {balance.openingBalanceDate
                                            .slice(0, 10)
                                            .split("-")
                                            .reverse()
                                            .join("/")}
                                    </Typography>

                                    <Box
                                        sx={{
                                            display: "grid",
                                            gridTemplateColumns: {
                                                xs: "1fr",
                                                sm: "1fr 1fr",
                                            },
                                            gap: 3,
                                            mt: 3,
                                        }}
                                    >
                                        <BalanceField
                                            label="Opening balance"
                                            amount={balance.openingBalance}
                                            balance={balance}
                                        />

                                        <BalanceField
                                            label="Posted Money In"
                                            amount={balance.postedMoneyIn}
                                            balance={balance}
                                        />

                                        <BalanceField
                                            label="Posted Money Out"
                                            amount={balance.postedMoneyOut}
                                            balance={balance}
                                        />

                                        <BalanceField
                                            label="Current balance"
                                            amount={balance.currentBalance}
                                            balance={balance}
                                        />
                                    </Box>

                                    <Alert
                                        severity="info"
                                        sx={{ mt: 3 }}
                                    >
                                        Calculated from the opening balance
                                        and SPARK’s posted transactions.
                                        Draft and cancelled transactions
                                        are excluded.
                                    </Alert>
                                </>
                            )}
                        </>
                    )}
            </DialogContent>

            <DialogActions>
                <Button
                    disabled={detail.loading}
                    onClick={detail.refresh}
                >
                    Refresh
                </Button>

                <Button onClick={onClose}>
                    Close
                </Button>
            </DialogActions>
        </Dialog>
    );
}

export default BankAccountBalance;