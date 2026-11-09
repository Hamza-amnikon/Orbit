import assert from "node:assert/strict";
import test from "node:test";
import { buildBankPayment } from "./paymentBanking.js";
test("cash never sends stale bank selection", () =>
{
    assert.deepEqual(buildBankPayment({
        settlementType: "Cash",
        bankAccountId: 5,
        bankAmount: "20"
    }, "AED", 20), {
        settlementType: "Cash",
        bankAccountId: null,
        bankAmount: null,
        bankCurrency: null,
        bankChargeAmount: 0
    });
});
test("same currency rejects an unexplained bank amount", () =>
{
    assert.throws(() => buildBankPayment({
        settlementType: "Bank",
        bankAccountId: "5",
        bankCurrency: "AED",
        bankAmount: "999"
    }, "AED", "85"), /bank amount plus bank charges must equal/);
});

test("cross currency uses actual bank credit without inventing a rate", () =>
{
    assert.equal(buildBankPayment({
        settlementType: "Bank",
        bankAccountId: 5,
        bankCurrency: "INR",
        bankAmount: "2185.63"
    }, "AED", 85).bankAmount, 2185.63);
});
test("cross currency never fills a missing actual bank amount", () =>
{
    assert.throws(() => buildBankPayment({
        settlementType: "Bank",
        bankAccountId: 5,
        bankCurrency: "INR"
    }, "AED", 85));
});
test("bank payment requires an explicitly selected account", () =>
{
    assert.throws(() => buildBankPayment({
        settlementType: "Bank"
    }, "AED", 85));
    assert.throws(() => buildBankPayment({}, "AED", 85));
});
test("invalid bank amounts are rejected", () =>
{
    for (const bankAmount of ["0", "-1", "abc", "Infinity", "100000000000000"])
    {
        assert.throws(() => buildBankPayment({
            settlementType: "Bank",
            bankAccountId: 5,
            bankCurrency: "INR",
            bankAmount
        }, "AED", 85));
    }
});
test("Cash mode uses the original payment flow without a bank selection", () =>
{
    assert.deepEqual(buildBankPayment({}, "INR", 10, "Cash"), {
        settlementType: "Cash",
        bankAccountId: null,
        bankAmount: null,
        bankCurrency: null,
        bankChargeAmount: 0
    });
});
test("switching to Cash ignores stale bank details", () =>
{
    assert.deepEqual(buildBankPayment({
        bankAccountId: 5,
        bankCurrency: "INR",
        bankAmount: "999"
    }, "INR", 10, " cash "), {
        settlementType: "Cash",
        bankAccountId: null,
        bankAmount: null,
        bankCurrency: null,
        bankChargeAmount: 0
    });
});
test("bank mode adds only the selected bank to an ordinary same-currency payment", () =>
{
    assert.deepEqual(buildBankPayment({
        bankAccountId: 5,
        bankCurrency: "INR"
    }, "INR", 10, "RTGS"), {
        settlementType: "Bank",
        bankAccountId: 5,
        bankAmount: 10,
        bankCurrency: "INR",
        bankChargeAmount: 0
    });
});
test("switching from Cash to a bank mode requires an account", () =>
{
    assert.throws(() => buildBankPayment({
        settlementType: "Cash"
    }, "INR", 10, "RTGS"));
});
test("different currency still requires the actual bank amount", () =>
{
    assert.throws(() => buildBankPayment({
        bankAccountId: 5,
        bankCurrency: "AED"
    }, "INR", 10, "RTGS"));
});

test("same currency defaults to the payment less bank charges", () =>
{
    const result = buildBankPayment({
        bankAccountId: 5,
        bankCurrency: "AED",
        bankChargeAmount: "5"
    }, "AED", 85, "Bank Transfer");

    assert.equal(result.bankAmount, 80);
    assert.equal(result.bankChargeAmount, 5);
});

test("same currency accepts a net receipt reconciled by charges", () =>
{
    const result = buildBankPayment({
        bankAccountId: 5,
        bankCurrency: "AED",
        bankAmount: "80",
        bankChargeAmount: "5"
    }, "AED", 85, "Bank Transfer");

    assert.equal(result.bankAmount, 80);
    assert.equal(result.bankChargeAmount, 5);
});

test("bank charges cannot be negative or invalid", () =>
{
    for (const bankChargeAmount of ["-1", "abc", "Infinity", "100000000000000"])
    {
        assert.throws(() => buildBankPayment({
            bankAccountId: 5,
            bankCurrency: "AED",
            bankChargeAmount
        }, "AED", 85, "Bank Transfer"), /valid bank charge/);
    }
});

test("same currency permits ordinary decimal rounding", () =>
{
    assert.equal(buildBankPayment({
        bankAccountId: 5,
        bankCurrency: "AED",
        bankAmount: "0.2",
        bankChargeAmount: "0.1"
    }, "AED", 0.3, "Bank Transfer").bankAmount, 0.2);
});
