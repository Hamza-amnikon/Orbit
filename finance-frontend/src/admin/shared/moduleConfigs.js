const text = (name, label, required = true, extra = {}) => ({ name, label, required, ...extra });
const date = (name = "date", label = "Date") => text(name, label, true, { type: "date" });
const amount = (name = "amount", label = "Amount", min = 0.01) => text(name, label, true, { type: "number", currency: true, min });
const select = (name, label, options) => text(name, label, true, { options });
const notes = text("notes", "Notes", false, { type: "textarea", column: false });
const status = options => select("status", "Draft status", options);
const uniqueCode = (row, rows) => rows.some(other => other.id !== row.id && other.code.trim().toLowerCase() === row.code.trim().toLowerCase()) ? "This code already exists in your drafts." : "";

export const moduleConfigs = {
  expenses: { title: "Expenses", singular: "Expense", subtitle: "Prepare expense records and categorize spending", fields: [
    date(), text("reference", "Reference"), text("payee", "Payee"), select("category", "Category", ["Travel", "Meals", "Office", "Utilities", "Software", "Other"]), amount(), status(["Draft", "Ready for review"]), text("description", "Description", false), notes,
  ] },
  claims: { title: "Expense Claims", singular: "Expense Claim", subtitle: "Prepare employee reimbursement requests", fields: [
    date(), text("reference", "Claim reference"), text("employee", "Employee"), amount(), status(["Draft", "Ready for review"]), text("purpose", "Business purpose"), notes,
  ] },
  accounts: { title: "Bank Accounts", singular: "Bank Account", subtitle: "Prepare bank account records", fields: [
    text("name", "Account name"), text("bank", "Bank name"), text("lastFour", "Account last four digits", true, { maxLength: 4 }), select("type", "Account type", ["Current", "Savings", "Cash"]), text("currency", "Currency", true, { default: "INR" }), amount("openingBalance", "Opening balance", -1000000000), status(["Draft", "Ready for review"]), notes,
  ], validate: row => /^\d{4}$/.test(row.lastFour) ? "" : "Enter exactly four account digits." },
  transactions: { title: "Transactions", singular: "Transaction", subtitle: "Prepare bank transactions for review", fields: [
    date(), text("reference", "Reference"), text("account", "Bank account name"), select("direction", "Direction", ["Money in", "Money out"]), amount(), status(["Draft", "Ready for review"]), text("description", "Description", false), notes,
  ] },
  reconciliation: { title: "Bank Reconciliation", singular: "Reconciliation", subtitle: "Compare statement and book balances before reconciliation", fields: [
    text("account", "Bank account name"), date("statementDate", "Statement date"), amount("statementBalance", "Statement balance", -1000000000), amount("bookBalance", "Book balance", -1000000000), amount("outstandingDeposits", "Outstanding deposits", 0), amount("outstandingWithdrawals", "Outstanding withdrawals", 0), status(["Draft", "Ready for review"]), notes,
  ] },
  chart: { title: "Chart of Accounts", singular: "Account", subtitle: "Prepare the structure of your accounting accounts", fields: [
    text("code", "Account code"), text("name", "Account name"), select("type", "Account type", ["Asset", "Liability", "Equity", "Income", "Expense"]), text("parent", "Parent account", false), status(["Draft", "Ready for review"]), notes,
  ], validate: uniqueCode },
  journals: { title: "Journal Entries", singular: "Journal Entry", subtitle: "Prepare balanced two-account journal drafts", fields: [
    date(), text("reference", "Reference"), text("debitAccount", "Debit account"), amount("debit", "Debit amount"), text("creditAccount", "Credit account"), amount("credit", "Credit amount"), status(["Draft", "Ready for review"]), notes,
  ], validate: row => Math.round(Number(row.debit) * 100) !== Math.round(Number(row.credit) * 100) ? "Debit and credit amounts must balance." : row.debitAccount.trim().toLowerCase() === row.creditAccount.trim().toLowerCase() ? "Select different debit and credit accounts." : "" },
  organization: { title: "Organization", singular: "Organization Profile", subtitle: "Prepare your organization profile", adminOnly: true, fields: [
    text("name", "Organization name"), text("email", "Business email", true, { type: "email" }), text("phone", "Phone", false, { type: "tel" }), text("gstNumber", "GST number", false), text("currency", "Currency", true, { default: "INR" }), text("address", "Address", false, { type: "textarea", column: false }), notes,
  ] },
  tax: { title: "Tax Settings", singular: "Tax Rate", subtitle: "Prepare tax rates for future configuration", adminOnly: true, fields: [
    text("code", "Tax code"), text("name", "Tax name"), text("rate", "Rate (%)", true, { type: "number", min: 0 }), select("type", "Tax type", ["GST", "CGST", "SGST", "IGST", "Other"]), status(["Draft", "Ready for review"]), notes,
  ], validate: (row, rows) => Number(row.rate) > 100 ? "Tax rate cannot exceed 100%." : uniqueCode(row, rows) },
};
for (const [key, config] of Object.entries(moduleConfigs)) config.key = key;

const active = { name: "isActive", label: "Active", type: "boolean", default: true, options: [{ label: "Active", value: true }, { label: "Archived", value: false }] };
for (const config of Object.values(moduleConfigs)) {
  config.subtitle = config.subtitle.replace("Prepare", "Manage");
  config.fields = config.fields.map(field => field.name === "status" ? { ...field, label: "Status", options: ["Draft", "Posted"] } : field);
}
for (const key of ["expenses", "claims"]) moduleConfigs[key].fields = moduleConfigs[key].fields.map(field => field.name === "status" ? { ...field, options: ["Draft", "Submitted", "Approved", "Rejected", "Paid", "Cancelled"] } : field);
moduleConfigs.claims.fields.push(select("category", "Category", ["Travel", "Meals", "Office", "Utilities", "Software", "Other"]));
for (const key of ["accounts", "chart", "tax"]) moduleConfigs[key].fields = moduleConfigs[key].fields.filter(field => field.name !== "status").concat(active);
moduleConfigs.accounts.fields.push(date("openingDate", "Opening date"));
moduleConfigs.accounts.fields.find(field => field.name === "currency").options = ["INR"];
moduleConfigs.organization.fields.find(field => field.name === "currency").options = ["INR"];
moduleConfigs.transactions.fields = moduleConfigs.transactions.fields.map(field => field.name === "account" ? { ...field, name: "accountId", label: "Bank account", options: [], choices: "banks" } : field.name === "direction" ? { ...field, options: [{ label: "Money in", value: "MoneyIn" }, { label: "Money out", value: "MoneyOut" }] } : field);
moduleConfigs.transactions.fields.push({ name: "counterAccount", label: "Counter ledger account", required: true, options: [], choices: "chart" });
for (const field of moduleConfigs.journals.fields) if (["debitAccount", "creditAccount"].includes(field.name)) { field.options = []; field.choices = "chart"; }
for (const key of ["expenses", "claims"]) moduleConfigs[key].fields.unshift(
  { name: "branch", label: "Branch", required: true, options: ["Turbhe", "Dubai"], default: "Turbhe" },
  { name: "currency", label: "Currency", required: true, options: ["INR", "AED", "USD", "EUR", "GBP", "CAD", "AUD", "SGD", "SAR"], default: "INR" },
  { name: "rateToInr", label: "INR per currency unit", required: true, type: "number", default: 1, step: "0.00000001", min: 0.00000001 }
);
