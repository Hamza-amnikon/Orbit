import test from "node:test";
import assert from "node:assert/strict";
import {
    convertExpenseReport,
    summarizeExpenses,
    groupExpenses,
    getExpenseReport,
    expenseReportSetup
} from "./ExpenseReportService.js";
test("branch currency defaults follow accounting company IDs, independent of names and countries", () =>
{
    const setup = expenseReportSetup([{
        name: "Renamed office",
        accountingCompanyId: 42
    }], [{
        id: 42,
        currency: "EUR"
    }, {
        id: 18,
        currency: "GBP"
    }]);
    assert.equal(setup.branches[0].currency, "EUR");
    assert.deepEqual(setup.currencies, ["EUR", "GBP"]);
    assert.equal(setup.defaultCurrency, "EUR");
    assert.throws(() => expenseReportSetup([], []), /Configure a reporting currency/);
});
const bill = {
    id: 1,
    type: "Bill",
    partyKey: "vendor-a",
    partyName: "Supplier",
    category: "Bills",
    date: "2026-11-01",
    branch: "Dubai",
    currency: "USD",
    net: 100,
    tax: 5,
    total: 105,
    balance: 55,
    overdue: 55
};
const payment = {
    ...bill,
    type: "Payment",
    net: 0,
    tax: 0,
    total: 40,
    balance: 0,
    overdue: 0
};
const credit = {
    ...bill,
    type: "VendorCredit",
    net: -20,
    tax: -1,
    total: -21,
    balance: 0,
    overdue: 0
};
test("bill payments do not duplicate costs; credits reduce cost and tax", () =>
{
    assert.deepEqual(summarizeExpenses([bill, payment, credit]), {
        bills: 100,
        expenses: 0,
        credits: 20,
        net: 80,
        tax: 4,
        total: 84,
        paid: 40,
        balance: 55,
        overdue: 55
    });
    assert.equal(groupExpenses([bill, payment, credit], 0)[0].net, 80);
    assert.equal(groupExpenses([bill, payment, credit], 1)[0].net, 80);
});
test("standalone expenses are costs, not assumed bill payments", () =>
{
    const summary = summarizeExpenses([{
        ...bill,
        type: "Expense",
        tax: 0,
        net: 25,
        total: 25,
        balance: 0,
        overdue: 0
    }]);
    assert.equal(summary.net, 25);
    assert.equal(summary.paid, 0);
    assert.equal(summary.balance, 0);
});
test("approved claims enter cost once and reimbursement only enters payments", () =>
{
    const claim = {
        ...bill,
        type: "Claim",
        total: 100,
        net: 100,
        tax: 0,
        balance: 100,
        overdue: 0
    };
    const unpaid = summarizeExpenses([claim]);
    assert.equal(unpaid.net, 100);
    assert.equal(unpaid.claimBalance, 100);
    assert.equal(unpaid.balance, 0);
    const paid = summarizeExpenses([{
        ...claim,
        balance: 0
    }, {
        ...claim,
        type: "ClaimPayment",
        net: 0,
        balance: 0
    }]);
    assert.equal(paid.net, 100);
    assert.equal(paid.paid, 100);
    assert.equal(paid.claimBalance, 0);
    assert.equal(groupExpenses([claim, {
        ...claim,
        type: "ClaimPayment",
        net: 0
    }], 0)[0].net, 100);
});
test("conversion covers balances, credits and payments and preserves source records", () =>
{
    const rows = convertExpenseReport([bill, payment, credit], "AED", [{
        base: "USD",
        quote: "AED",
        rate: 3.5
    }]);
    assert.equal(rows[0].balance, 55 * 3.5);
    assert.equal(rows[1].total, 140);
    assert.equal(rows[2].total, -73.5);
    assert.equal(rows[0].originalTotal, 105);
    assert.notEqual(rows[0].id, rows[1].id);
    assert.equal(bill.total, 105);
    assert.throws(() => convertExpenseReport([bill], "INR", []), /unavailable/);
});
test("supplier IDs remain distinct when their names match", () =>
{
    assert.equal(groupExpenses([bill, {
        ...bill,
        partyKey: "vendor-b"
    }], 2).length, 2);
    assert.deepEqual(groupExpenses([], 0), []);
});
test("invalid ranges are rejected before loading", async () =>
{
    await assert.rejects(getExpenseReport("2026-12-01", "2026-11-01", "AED"), /valid date range/);
});
