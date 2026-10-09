# SparkFinance frontend

The finance module connects to the ASP.NET Core API at http://localhost:5080.
All active routes use live SQL Server data from the separate SparkFinance database.
The original demo components remain in src/admin for reference; App.jsx uses src/live.

## Run locally

1. Open C:\Users\2020023\source\repos\SparkFinance\SparkFinance.slnx in Visual Studio and press F5 to run the backend.
2. From this directory run `npm install`, then `npm run dev -- --host 127.0.0.1 --port 5174 --strictPort`.
3. Open http://127.0.0.1:5174 and sign in with your finance administrator account.

For first-time database/admin setup, follow README.md in the separate SparkFinance backend folder. Credentials and
JWT signing keys belong in .NET user-secrets, not the frontend or GitHub.

Copy .env.example to .env.local to change VITE_FINANCE_API_URL, then restart Vite.
VITE variables are public browser configuration. Add the frontend origin to the API's
Cors:Origins setting if using another port or deployment URL.

## Available workflows

- Customers and vendors: create, edit, view, and archive.
- Estimates, sales orders, invoices, credit notes, purchase orders, bills, vendor credits:
  create/edit drafts, inspect line totals, issue, and cancel subject to ledger rules.
- Payments received/made: record against issued invoices/bills with an outstanding balance.
- Dashboard: period totals, outstanding balances, active party counts, and audit activity.
- Search and pagination come from the API. The database starts empty; sample records are
  not copied into the ledger. Refresh reloads persisted records.
- Viewer accounts can read; Admin and Finance accounts can save.
- Session tokens are stored in sessionStorage and cleared on sign-out or expired access.

`npm run build` builds production assets. `npx oxlint src/live src/services/financeApi.js src/App.jsx src/components/Header.jsx`
checks the live integration code.
