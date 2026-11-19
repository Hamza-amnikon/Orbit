export const BANK_SALARY_HEADERS = [
    "Payment Method Name", "Payment Amount (Request)", "Activation Date",
    "Beneficiary Name (Request)", "Account No", "Email", "Email Body",
    "Debit Account No", "CRN No", "RECEIVER IFSC Code",
    "RECEIVER Account Type", "Remarks", "Phone No",
];

export const BANK_SALARY_TYPES = [
    "Text", "Amount", "Date", "Text", "Text", "Text", "Text",
    "Numeric", "Text", "AlphaNumeric", "AlphaNumeric", "Text", "Numeric",
];

const value = (source, ...names) => names.map((name) => source?.[name]).find((item) => item != null && item !== "") ?? "";

export const bankDocumentFor = (documents) =>
    [...documents]
        .filter((document) => String(value(document, "documentType", "DocumentType")).toLowerCase() === "bank")
        .sort((a, b) => Number(value(b, "documentId", "DocumentId")) - Number(value(a, "documentId", "DocumentId")))[0];

export const validateBankDocument = (document) => {
    if (!document || String(value(document, "status", "Status")).toLowerCase() !== "approved") {
        return "an approved bank document is missing";
    }
    const account = String(value(document, "accountNumber", "AccountNumber")).trim();
    const ifsc = String(value(document, "ifscCode", "IfscCode")).trim().toUpperCase();
    const type = String(value(document, "accountType", "AccountType")).trim().toLowerCase();
    if (!/^\d{9,18}$/.test(account)) return "a valid bank account number is missing";
    if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(ifsc)) return "a valid IFSC is missing";
    if (type !== "savings" && type !== "current") return "a Savings or Current account type is missing";
    return "";
};

export const createBankSalarySheet = (XLSX, employees, documentsById, options, monthLabel) => {
    const activationDate = new Date(`${options.activationDate}T00:00:00`);
    if (!options.activationDate || Number.isNaN(activationDate.getTime())) throw new Error("Enter a valid activation date.");
    if (!String(options.paymentMethod).trim()) throw new Error("Enter the payment method code.");
    if (!/^\d+$/.test(String(options.debitAccount).trim())) throw new Error("Enter a numeric debit account number.");

    const errors = [];
    const data = employees.map((employee, index) => {
        const document = bankDocumentFor(documentsById[String(employee.employeeId)] || []);
        const issue = validateBankDocument(document);
        const name = employee.payslip?.employeeName || employee.name;
        if (issue) { errors.push(`${name}: ${issue}`); return null; }
        const type = String(value(document, "accountType", "AccountType")).trim().toLowerCase();
        const accountTypeCode = String(type === "savings" ? options.savingsCode : options.currentCode).trim();
        if (!accountTypeCode) { errors.push(`${name}: enter the ${type} account type code`); return null; }
        const amount = Number(employee.payslip?.netSalary);
        if (!Number.isFinite(amount) || amount <= 0) { errors.push(`${name}: processed net pay must be positive`); return null; }
        const raw = employee.raw || {};
        return [
            String(options.paymentMethod).trim(), Math.round(amount * 100) / 100,
            (Date.UTC(activationDate.getFullYear(), activationDate.getMonth(), activationDate.getDate()) - Date.UTC(1899, 11, 30)) / 86400000,
            name, String(value(document, "accountNumber", "AccountNumber")).trim(),
            String(value(raw, "email", "Email", "emailAddress", "EmailAddress")).trim(), "",
            String(options.debitAccount).trim(), String(index + 1),
            String(value(document, "ifscCode", "IfscCode")).trim().toUpperCase(),
            accountTypeCode, `Salary ${monthLabel}`,
            String(value(raw, "mobileNumber", "MobileNumber", "phoneNumber", "PhoneNumber", "mobile", "Mobile")).trim(),
        ];
    });
    if (errors.length) throw new Error(`Bank salary export needs attention: ${errors.join("; ")}`);

    const sheet = XLSX.utils.aoa_to_sheet([BANK_SALARY_HEADERS, BANK_SALARY_TYPES, ...data]);
    sheet["!cols"] = [24, 24, 18, 30, 23, 30, 28, 23, 12, 23, 24, 24, 18].map((wch) => ({ wch }));
    data.forEach((_, index) => {
        const row = index + 3;
        sheet[`C${row}`].z = "m/d/yy";
        for (const column of ["E", "H", "M"]) {
            sheet[`${column}${row}`].t = "s";
            sheet[`${column}${row}`].z = "@";
        }
    });
    return sheet;
};
