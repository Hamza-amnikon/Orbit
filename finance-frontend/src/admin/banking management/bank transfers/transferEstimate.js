export function calculateTransferEstimate(amount, rate, decimalPlaces) {
    const amountText = String(amount ?? "").trim();
    const rateText = String(rate ?? "").trim();

    if (
        !/^\d+(\.\d+)?$/.test(amountText) ||
        !/^\d+(\.\d+)?$/.test(rateText) ||
        amountText.length > 50 ||
        rateText.length > 60 ||
        !Number.isInteger(decimalPlaces) ||
        decimalPlaces < 0 ||
        decimalPlaces > 4
    ) {
        return null;
    }

    const [amountWhole, amountFraction = ""] = amountText.split(".");
    const [rateWhole, rateFraction = ""] = rateText.split(".");
    const amountUnits = BigInt(amountWhole + amountFraction);
    const rateUnits = BigInt(rateWhole + rateFraction);

    if (amountUnits <= 0n || rateUnits <= 0n) {
        return null;
    }

    const divisor = 10n ** BigInt(amountFraction.length + rateFraction.length);
    const scaled = amountUnits * rateUnits * (10n ** BigInt(decimalPlaces));
    const rounded = (scaled + divisor / 2n) / divisor;

    if (decimalPlaces === 0) {
        return rounded.toString();
    }

    const digits = rounded.toString().padStart(decimalPlaces + 1, "0");

    return digits.slice(0, -decimalPlaces) + "." + digits.slice(-decimalPlaces);
}
