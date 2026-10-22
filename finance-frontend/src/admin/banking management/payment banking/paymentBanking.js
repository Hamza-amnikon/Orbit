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
        };
    }

    if (settlementType !== "Bank" || !value.bankAccountId) {
        throw new Error("Select the bank account for this payment.");
    }

    const bankAmount = value.bankCurrency === currency
        ? Number(amount)
        : Number(value.bankAmount);

    if (!Number.isFinite(bankAmount) || bankAmount <= 0 || bankAmount >= 1e14) {
        throw new Error("Enter the actual amount in the selected bank account's currency.");
    }

    return {
        settlementType: "Bank",
        bankAccountId: Number(value.bankAccountId),
        bankAmount,
    };
}
