import { isValidDate, toMinorUnits } from "./reconciliationFormat.js";

export function parseStatementCsv(text, precision) {
    const rows = [];
    let row = [];
    let cell = "";
    let quoted = false;
    let closedQuote = false;

    function finishCell() {
        row.push(cell);
        cell = "";
        closedQuote = false;
    }

    function finishRow() {
        finishCell();

        if (row.some(value => value.trim())) {
            rows.push(row);
        }

        row = [];
    }

    for (let index = 0; index < text.length; index++) {
        const character = text[index];

        if (quoted) {
            if (character === '"') {
                if (text[index + 1] === '"') {
                    cell += '"';
                    index += 1;
                } else {
                    quoted = false;
                    closedQuote = true;
                }
            } else {
                cell += character;
            }
        } else if (character === '"') {
            if (cell.length || closedQuote) {
                throw new Error("CSV contains an unexpected quote.");
            }

            quoted = true;
        } else if (character === ",") {
            finishCell();
        } else if (character === "\n" || character === "\r") {
            if (character === "\r" && text[index + 1] === "\n") {
                index += 1;
            }

            finishRow();
        } else {
            if (closedQuote && character.trim()) {
                throw new Error("CSV contains text after a closing quote.");
            }

            if (!closedQuote) {
                cell += character;
            }
        }
    }

    if (quoted) {
        throw new Error("CSV contains an unclosed quote.");
    }

    finishRow();

    const headers = (rows.shift() || []).map(value =>
        value.replace(/^\uFEFF/, "").trim().toLowerCase()
    );

    const required = ["date", "reference", "direction", "amount"];

    if (
        required.some(header => !headers.includes(header)) ||
        new Set(headers).size !== headers.length
    ) {
        throw new Error("Use unique CSV columns: Date, Reference, Direction, Amount. Description is optional.");
    }

    if (rows.length > 2000) {
        throw new Error("Import at most 2,000 statement entries.");
    }

    return rows.map((values, index) => {
        try {
            if (values.length !== headers.length) {
                throw new Error("The number of values does not match the CSV columns.");
            }

            const get = name => (values[headers.indexOf(name)] || "").trim();
            const transactionDate = get("date");
            const directionText = get("direction").replace(/\s/g, "").toLowerCase();
            const direction = directionText === "moneyin" ? 1 :
                directionText === "moneyout" ? 2 : null;

            if (!isValidDate(transactionDate)) {
                throw new Error("Use a valid date in YYYY-MM-DD format.");
            }

            if (direction === null) {
                throw new Error("Direction must be MoneyIn or MoneyOut.");
            }

            const amount = get("amount");
            toMinorUnits(amount, precision, true);

            if (get("reference").length > 200 || get("description").length > 1000) {
                throw new Error("Reference or description exceeds the allowed length.");
            }

            return {
                transactionDate,
                direction,
                amount: Number(amount),
                reference: get("reference"),
                description: get("description"),
            };
        } catch (failure) {
            throw new Error("Statement entry " + (index + 1) + ": " + failure.message);
        }
    });
}
