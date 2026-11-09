import test from "node:test";
import assert from "node:assert/strict";
import {
    summarizeSales,
    groupSales,
    getSalesReport,
    exportSalesReport,
    convertSalesReport,
    savedSalesRateDate
} from "./SalesReportService.js";
test("saved cross rates use matching dates and never use future rates", () =>
{
    const rates = [{
        currency: "USD",
        rateToInr: 94.55,
        rateDate: "2026-11-05"
    }, {
        currency: "AED",
        rateToInr: 25.745,
        rateDate: "2026-11-05"
    }];
    assert.equal(savedSalesRateDate({
        rates
    }, "USD", "AED", "2026-11-06"), "2026-11-05");
    assert.equal(savedSalesRateDate({
        rates
    }, "USD", "INR", "2026-11-06"), "2026-11-05");
    assert.throws(() => savedSalesRateDate({
        rates
    }, "USD", "AED", "2026-11-04"), /unavailable/);
    assert.throws(() => savedSalesRateDate({
        rates: [rates[0], {
            ...rates[1],
            rateDate: "2026-11-04"
        }]
    }, "USD", "AED", "2026-11-06"), /unavailable/);
});
const invoice = {
    id: 1,
    type: "Invoice",
    number: "INV-1",
    date: "2026-11-01",
    clientId: "a",
    clientName: "Same name",
    branch: "Dubai",
    currency: "AED",
    net: 100,
    tax: 5,
    total: 105,
    balance: 55,
    overdue: 55,
    services: [{
        serviceName: "Consulting",
        net: 100
    }]
};
const credit = {
    ...invoice,
    type: "CreditNote",
    number: "CN-1",
    net: -20,
    tax: -1,
    total: -21,
    balance: 0,
    overdue: 0,
    services: [{
        serviceName: "Consulting",
        net: -20
    }]
};
test("reporting conversion combines currencies and converts credits, balances, receipts and services", () =>
{
    const result = convertSalesReport({
        documents: [invoice, {
            ...credit,
            currency: "USD"
        }],
        receipts: [{
            currency: "USD",
            amount: 10
        }]
    }, "AED", [{
        base: "USD",
        quote: "AED",
        rate: 3.67
    }]);
    assert.equal(result.documents[0].total, 105);
    assert.equal(result.documents[1].total, -21 * 3.67);
    assert.equal(result.documents[1].services[0].net, -20 * 3.67);
    assert.equal(result.receipts[0].amount, 36.7);
    assert.equal(summarizeSales(result.documents, result.receipts).length, 1);
    assert.equal(result.documents[1].originalCurrency, "USD");
    assert.equal(credit.currency, "AED");
    const inr = convertSalesReport({
        documents: [invoice],
        receipts: []
    }, "INR", [{
        base: "AED",
        quote: "INR",
        rate: 23
    }]);
    assert.equal(inr.documents[0].balance, 55 * 23);
    assert.equal(inr.documents[0].currency, "INR");
});
test("missing or invalid exchange rates never default to one", () =>
{
    for (const rate of [null, 0, -1, NaN])
    {
        assert.throws(() => convertSalesReport({
            documents: [invoice],
            receipts: []
        }, "INR", [{
            base: "AED",
            quote: "INR",
            rate
        }]), /Exchange rate unavailable/);
    }
});
test("credit notes reduce sales and tax without mixing currencies or receipts", () =>
{
    const result = summarizeSales([invoice, credit, {
        ...invoice,
        currency: "INR",
        net: 500
    }], [{
        currency: "AED",
        amount: 40
    }]);
    assert.deepEqual(result[0], {
        currency: "AED",
        sales: 100,
        credits: 20,
        net: 80,
        tax: 4,
        total: 84,
        balance: 55,
        overdue: 55,
        receipts: 40
    });
    assert.equal(result[1].net, 500);
    assert.equal(result[1].receipts, 0);
});
test("service and monthly summaries subtract credits; identical customer names stay separate", () =>
{
    assert.equal(groupSales([invoice, credit], 3)[0].net, 80);
    assert.equal(groupSales([invoice, credit], 0)[0].net, 80);
    assert.equal(groupSales([invoice, {
        ...invoice,
        clientId: "b"
    }], 1).length, 2);
    assert.deepEqual(groupSales([], 2), []);
});
test("invalid dates are rejected before requesting data", async () =>
{
    await assert.rejects(getSalesReport("2026-12-01", "2026-11-01"), /valid date range/);
});
test("CSV retains negative credit amounts and neutralizes customer formulas", async () =>
{
    const originalDocument = globalThis.document;
    const originalCreate = URL.createObjectURL;
    const originalRevoke = URL.revokeObjectURL;
    let blob;
    globalThis.document = {
        createElement: () => ({
            click()
            {}
        })
    };
    URL.createObjectURL = value =>
    {
        blob = value;
        return "blob:test";
    };
    URL.revokeObjectURL = () =>
    {};
    try
    {
        exportSalesReport([{
            ...credit,
            clientName: "=SUM(A1)"
        }], [], "2026-11-01", "2026-11-30");
        const csv = await blob.text();
        assert.ok(csv.includes('"-21"'));
        assert.ok(csv.includes('"\'=SUM(A1)"'));
    } finally
    {
        globalThis.document = originalDocument;
        URL.createObjectURL = originalCreate;
        URL.revokeObjectURL = originalRevoke;
    }
});
