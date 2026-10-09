# Finance admin modules

Active module pages use authenticated ASP.NET Core APIs and persist to SparkFinance SQL Server. Page, Form, Details, and CSS files follow the existing management/module folder layout; shared components live in shared.

- Expenses and claims: draft, submit, independent Admin approval/rejection, and payment recording. Creators cannot approve their own submissions. PDF/PNG/JPEG receipts are supported, up to 5 MB each.
- Banking: bank accounts with opening balances, posted transactions, CSV statement import, matching, and completed reconciliation snapshots.
- Accounting: chart of accounts, balanced two-account journals, general ledger, trial balance, and automatic postings for issued invoices/bills/credits, payments, approved expenses, and reimbursements. Posted entries are immutable; corrections require reversing entries.
- Reports: profit and loss, balance sheet, cash movement, bank balances, sales, expenses, and document tax summaries with CSV export.
- Settings: saved organization/tax configuration, user creation and role/status editing, fixed role permissions, and audit history. Admin-only changes are enforced by the API.

Original invoice/expense currencies are saved with an eight-decimal INR booking rate. The ledger remains INR. Dashboard and Branch Comparison display INR or AED using the latest dated saved reporting rate. Existing records migrate to Turbhe/INR with a rate of 1. New clients default to Dubai; new expenses default to Turbhe. Tax settings are saved reference rates; document lines currently use manually entered tax percentages. Tax reports do not submit statutory returns. Recording a payment records bookkeeping only; it does not transfer money. Bank statements use CSV columns date,reference,direction,amount, ISO dates, and direction MoneyIn or MoneyOut.

Existing sales, purchases, and dashboard folders are retained; their API-connected pages remain in src/live. Older draft helpers are retained but are not used by active module routes.

Frontend: C:\Users\2020023\SPARK\Orbit\finance-frontend (npm run dev).
Backend: C:\Users\2020023\source\repos\SparkFinance\SparkFinance.slnx (Visual Studio F5).
Database: (localdb)\MSSQLLocalDB, SparkFinance, finance schema.
Receipt files: %LOCALAPPDATA%\SparkFinance\attachments; back these up together with the database.

Monthly invoices have a billing month and monthly service line charges. Payments are entered in invoice currency with a settlement INR rate; realized FX gains/losses post separately. Current bank/cash accounts remain INR accounts. Invoice and expense booking rates are entered manually; expense reimbursements use the original booked INR amount. Automatic recurring invoice generation and automatic rate retrieval are not included.
