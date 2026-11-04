export function isCashPaymentMode(paymentMode) {
    return String(paymentMode || "").trim().toLowerCase() === "cash";
}

export function buildBankPayment(value, currency, amount, paymentMode) {
    const settlementType = paymentMode === undefined
        ? value.settlementType
        : isCashPaymentMode(paymentMode) ? "Cash" : "Bank";

    if (settlementType === "Cash") {
        return {
            settlementType: "Cash",
            bankAccountId: null,
            bankAmount: null,
            bankCurrency: null,
            bankChargeAmount: 0,
        };
    }

    if (settlementType !== "Bank" || !value.bankAccountId) {
        throw new Error("Select the bank account for this payment.");
    }

    const bankChargeAmount = Number(value.bankChargeAmount || 0);

    if (!Number.isFinite(bankChargeAmount) || bankChargeAmount < 0 || bankChargeAmount >= 1e14) {
        throw new Error("Enter a valid bank charge amount.");
    }

    const enteredBankAmount = String(value.bankAmount || "").trim();
    const bankAmount = enteredBankAmount
        ? Number(enteredBankAmount)
        : value.bankCurrency === currency
            ? Number(amount) - bankChargeAmount
            : 0;

    if (!Number.isFinite(bankAmount) || bankAmount <= 0 || bankAmount >= 1e14) {
        throw new Error("Enter the actual amount in the selected bank account's currency.");
    }

    return {
        settlementType: "Bank",
        bankAccountId: Number(value.bankAccountId),
        bankAmount,
        bankCurrency: value.bankCurrency,
        bankChargeAmount,
    };
}
