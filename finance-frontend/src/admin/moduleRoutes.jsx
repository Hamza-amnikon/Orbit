import Expenses from "./expenses management/expenses/Expenses";
import ExpenseClaims from "./expenses management/expense claims/ExpenseClaims";
import BankAccounts from "./banking management/bank accounts/BankAccounts";
import Transactions from "./banking management/transactions/Transactions";
import BankReconciliation from "./banking management/bank reconciliation/BankReconciliation";
import ChartOfAccounts from "./accounting management/chart of accounts/ChartOfAccounts";
import JournalEntries from "./accounting management/journal entries/JournalEntries";
import GeneralLedger from "./accounting management/general ledger/GeneralLedger";
import TrialBalance from "./accounting management/trial balance/TrialBalance";
import FinancialReports from "./reports management/financial reports/FinancialReports";
import TaxReports from "./reports management/tax reports/TaxReports";
import SalesReports from "./reports management/sales reports/SalesReports";
import ExpensesReports from "./reports management/expenses reports/ExpensesReports";
import Organization from "./settings management/organization/Organization";
import Users from "./settings management/users/Users";
import RolesPermissions from "./settings management/roles permissions/RolesPermissions";
import TaxSettings from "./settings management/tax settings/TaxSettings";
import AuditHistory from "./settings management/audit history/AuditHistory";
import ExchangeRates from "./settings management/exchange rates/ExchangeRates";
import BranchComparison from "./reports management/branch comparison/BranchComparison";

export const adminModuleRoutes = [
  ["Exchange Rates", "/settings/exchange-rates", ExchangeRates],
  ["Branch Comparison", "/reports/branches", BranchComparison],
  ["Audit History", "/settings/audit", AuditHistory],
  ["Expenses", "/expenses", Expenses], ["Expense Claims", "/expenses/claims", ExpenseClaims],
  ["Bank Accounts", "/banking/accounts", BankAccounts], ["Transactions", "/banking/transactions", Transactions], ["Bank Reconciliation", "/banking/reconciliation", BankReconciliation],
  ["Chart of Accounts", "/accounting/chart-of-accounts", ChartOfAccounts], ["Journal Entries", "/accounting/journal-entries", JournalEntries], ["General Ledger", "/accounting/general-ledger", GeneralLedger], ["Trial Balance", "/accounting/trial-balance", TrialBalance],
  ["Financial Reports", "/reports/financial", FinancialReports], ["Tax Reports", "/reports/tax", TaxReports], ["Sales Reports", "/reports/sales", SalesReports], ["Expense Reports", "/reports/expenses", ExpensesReports],
  ["Organization", "/settings/organization", Organization], ["Users", "/settings/users", Users], ["Roles & Permissions", "/settings/roles", RolesPermissions], ["Tax Settings", "/settings/tax", TaxSettings],
];
