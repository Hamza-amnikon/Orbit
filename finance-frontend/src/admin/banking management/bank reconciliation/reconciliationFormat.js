export function formatDate(value) {
    return value ? value.slice(0, 10).split("-").reverse().join("/") : "—";
}

export function formatAmount(value, currency, decimalPlaces) {
    if (value === null || value === undefined) {
        return "—";
    }

    return new Intl.NumberFormat(undefined, {
        style: "currency",
        currency,
        currencyDisplay: "code",
        minimumFractionDigits: decimalPlaces,
        maximumFractionDigits: decimalPlaces,
    }).format(value);
}

export function isValidDate(value) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
        return false;
    }

    const date = new Date(value + "T00:00:00Z");

    return Number.isFinite(date.getTime()) &&
        date.toISOString().slice(0, 10) === value;
}

export function toMinorUnits(value, precision, positive = false) {
    if (!Number.isInteger(precision) || precision < 0 || precision > 4) {
        throw new Error("The account has unsupported currency precision.");
    }

    const text = String(value).trim();

    if (!/^-?\d+(\.\d+)?$/.test(text)) {
        throw new Error("Use a plain number without currency symbols or grouping commas.");
    }

    const negative = text.startsWith("-");
    const [whole, fraction = ""] = text.replace(/^-/, "").split(".");

    if (fraction.replace(/0+$/, "").length > precision) {
        throw new Error("The amount supports at most " + precision + " decimal places.");
    }

    const magnitude = BigInt(
        whole + fraction.slice(0, precision).padEnd(precision, "0")
    );

    const scaledLimit = 999999999999999999n / (10n ** BigInt(4 - precision));

    if (magnitude > scaledLimit || magnitude > BigInt(Number.MAX_SAFE_INTEGER)) {
        throw new Error("The amount exceeds the supported range.");
    }

    const result = negative ? -magnitude : magnitude;

    if (positive && result <= 0n) {
        throw new Error("The statement entry amount must be greater than zero.");
    }

    return result;
}

export function sameAmount(first, second, precision) {
    try {
        return toMinorUnits(first, precision) === toMinorUnits(second, precision);
    } catch {
        return false;
    }
}

export function resolveOpeningDefaults(account, previous) {
    if (!account?.id || !isValidDate(account.openingBalanceDate || "")) {
        throw new Error("Configure the bank account opening balance and date first.");
    }

    let periodStart = account.openingBalanceDate;
    let openingBalance = account.openingBalance;
    let source = "Account opening balance configured for " + formatDate(periodStart) + ".";

    if (previous) {
        if (
            previous.bankAccountId !== account.id ||
            previous.status !== "Completed" ||
            previous.currency !== account.currency ||
            previous.currencyDecimalPlaces !== account.currencyDecimalPlaces ||
            !isValidDate(previous.periodEnd || "") ||
            previous.periodEnd < account.openingBalanceDate
        ) {
            throw new Error("The previous completed statement does not match this account. Refresh before continuing.");
        }

        const date = new Date(previous.periodEnd + "T00:00:00Z");
        date.setUTCDate(date.getUTCDate() + 1);
        periodStart = date.toISOString().slice(0, 10);

        if (!isValidDate(periodStart)) {
            throw new Error("No further statement period can be created after this date.");
        }

        openingBalance = previous.statementClosingBalance;
        source = "Closing balance of the completed statement ending " +
            formatDate(previous.periodEnd) + ".";
    }

    if (openingBalance === null || openingBalance === undefined) {
        throw new Error("The opening balance is unavailable. Refresh before continuing.");
    }

    toMinorUnits(openingBalance, account.currencyDecimalPlaces);

    return {
        bankAccountId: account.id,
        periodStart,
        statementOpeningBalance: String(openingBalance),
        source,
    };
}

export function buildTransferLabels(transfers) {
    const labels = new Map();

    for (const transfer of transfers) {
        if (transfer.sourceTransactionId) {
            labels.set(
                transfer.sourceTransactionId,
                transfer.destinationBankAccountName
                    ? "Money sent to " + transfer.destinationBankAccountName
                    : "Money sent"
            );
        }

        if (transfer.sourceFeeTransactionId) {
            labels.set(transfer.sourceFeeTransactionId, "Bank fee");
        }

        if (transfer.destinationTransactionId) {
            labels.set(
                transfer.destinationTransactionId,
                transfer.sourceBankAccountName
                    ? "Money received from " + transfer.sourceBankAccountName
                    : "Money received"
            );
        }
    }

    return labels;
}

export function entryDescription(entry, transferLabels = new Map()) {
    const linkedLabel = transferLabels.get(entry.id);

    if (linkedLabel) {
        return linkedLabel;
    }

    const description = entry.description?.trim() || "";

    if (/^Transfer\s+(?:BT-)?\d+\s*:\s*source bank fee$/i.test(description)) {
        return "Bank fee";
    }

    if (/^(Payment (?:to|received from) |Reversal of payment )/.test(description)) {
        return description;
    }

    return entry.direction === 1 ? "Money received" : "Money sent";
}

export function statementDescription(line, books, transferLabels) {
    const description = line.description?.trim() || "";

    // Older test imports contain generated descriptions with internal IDs.
    if (/^Transfer\s+(?:BT-)?\d+\s+(?:sent|bank fee)$/i.test(description)) {
        const book = books.find(entry => entry.id === line.matchedBankTransactionId);

        if (book) {
            return entryDescription(book, transferLabels);
        }

        return /bank fee$/i.test(description) ? "Bank fee" : "Money sent";
    }

    return description;
}
