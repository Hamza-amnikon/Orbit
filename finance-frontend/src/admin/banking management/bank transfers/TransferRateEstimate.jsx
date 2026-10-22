import {
    Alert,
    Box,
    Button,
    TextField,
    Typography,
} from "@mui/material";

import { useLoad } from "../../../live/data";

import {
    getBankingExchangeRate,
} from "./BankTransferService";

import {
    calculateTransferEstimate,
} from "./transferEstimate";

function TransferRateEstimate({
    baseCurrency,
    quoteCurrency,
    amount,
    decimalPlaces,
    date,
    disabled = false,
}) {
    const selected = !!baseCurrency && !!quoteCurrency;
    const requestKey = [baseCurrency, quoteCurrency, date || "latest"].join(":");

    const lookup = useLoad(
        async signal => {
            if (!selected) {
                return null;
            }

            const result = await getBankingExchangeRate(
                baseCurrency,
                quoteCurrency,
                date,
                signal
            );

            if (
                result?.baseCurrency !== baseCurrency ||
                result.quoteCurrency !== quoteCurrency ||
                typeof result.rateText !== "string" ||
                !/^\d+(\.\d+)?$/.test(result.rateText) ||
                !Number.isFinite(Number(result.rateText)) ||
                Number(result.rateText) <= 0 ||
                !/^\d{4}-\d{2}-\d{2}$/.test(result.rateDate || "") ||
                !result.source
            ) {
                throw new Error("The provider returned invalid exchange-rate details.");
            }

            return { requestKey, rate: result };
        },
        [baseCurrency, quoteCurrency, date]
    );

    const rate = lookup.data?.requestKey === requestKey
        ? lookup.data.rate
        : null;

    const estimate = rate
        ? calculateTransferEstimate(amount, rate.rateText, decimalPlaces)
        : null;

    if (!selected) {
        return null;
    }

    return (
        <Box
            sx={{ display: "grid", gap: 2 }}
        >
            {lookup.loading && (
                <Alert
                    severity="info"
                >
                    Loading the automatic reference rate…
                </Alert>
            )}

            {lookup.error && (
                <Alert
                    severity="warning"
                    action={(
                        <Button
                            color="inherit"
                            disabled={disabled}
                            onClick={lookup.refresh}
                        >
                            Retry
                        </Button>
                    )}
                >
                    {lookup.error}
                    {" "}No estimate is available. The actual bank receipt can still be recorded.
                </Alert>
            )}

            {rate && !lookup.loading && !lookup.error && (
                <>
                    <TextField
                        label="Reference exchange rate"
                        value={"1 " + baseCurrency + " = " + rate.rateText + " " + quoteCurrency}
                        slotProps={{
                            input: {
                                readOnly: true,
                            },
                        }}
                    />

                    <TextField
                        label={"Estimated received amount (" + quoteCurrency + ")"}
                        value={estimate ?? ""}
                        placeholder="Enter the source amount"
                        slotProps={{
                            input: {
                                readOnly: true,
                            },
                            inputLabel: {
                                shrink: true,
                            },
                        }}
                        helperText="Source amount × reference rate. Additional source fees are excluded. The bank's credited amount may differ."
                    />

                    <Typography
                        variant="caption"
                        color="text.secondary"
                    >
                        {rate.source} · Rate date: {rate.rateDate.split("-").reverse().join("/")}
                        {" · "}Daily reference rate
                    </Typography>

                    <Button
                        disabled={disabled}
                        onClick={lookup.refresh}
                        sx={{ justifySelf: "start" }}
                    >
                        Refresh Rate
                    </Button>
                </>
            )}
        </Box>
    );
}

export default TransferRateEstimate;
