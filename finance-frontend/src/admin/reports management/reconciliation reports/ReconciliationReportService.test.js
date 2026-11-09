import test from "node:test";
import assert from "node:assert/strict";
import {
    filterChecks,
    checkSummary,
    exportReconciliation,
    getReconciliationReport
} from "./ReconciliationReportService.js";
const checks = [{
    id: "a",
    group: "Posting completeness",
    title: "Recorded expense",
    reference: "EXP-1",
    status: "Issue",
    explanation: "Missing journal",
    currency: "AED",
    expected: 25,
    actual: null,
    difference: null
}, {
    id: "b",
    group: "Banking",
    title: "Register",
    reference: "Bank",
    status: "Not comparable",
    explanation: "Historical FX bridge",
    currency: "AED",
    expected: null,
    actual: 100,
    difference: null
}, {
    id: "c",
    group: "Ledger controls",
    title: "Trial balance",
    reference: "",
    status: "Matched",
    explanation: "Balanced",
    currency: "AED",
    expected: 0,
    actual: 0,
    difference: 0
}];
test("filters combine without mixing evidence or changing records", () =>
{
    assert.deepEqual(filterChecks(checks, "Posting completeness", "Issue", "exp-1"), [checks[0]]);
    assert.equal(filterChecks(checks, "", "", " fx ").length, 1);
    assert.equal(checks[0].actual, null);
});
test("summary counts results rather than adding unrelated currency amounts", () =>
{
    assert.deepEqual(checkSummary(checks), {
        Matched: 1,
        Issue: 1,
        Review: 0,
        "Not comparable": 1
    });
    assert.deepEqual(checkSummary([]), {
        Matched: 0,
        Issue: 0,
        Review: 0,
        "Not comparable": 0
    });
});
test("company and cutoff are required before making a request", async () =>
{
    await assert.rejects(getReconciliationReport("", "2026-11-01"), /Select a company/);
    await assert.rejects(getReconciliationReport("1", ""), /Select a company/);
});
test("CSV preserves unavailable amounts, zero balances and safe references", async () =>
{
    const previous = {
        document: globalThis.document,
        create: URL.createObjectURL,
        revoke: URL.revokeObjectURL
    };
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
        exportReconciliation({
            companyId: 1,
            companyName: "Company",
            currency: "AED",
            asOf: "2026-11-01",
            generatedAtUtc: "2026-11-01T10:00:00Z"
        }, [{
            ...checks[0],
            reference: "=SUM(A1)"
        }, checks[2]]);
        const csv = await blob.text();
        assert.ok(csv.includes('"\'=SUM(A1)"'));
        assert.ok(csv.includes('"25","",""'));
        assert.ok(csv.includes('"0","0","0"'));
        assert.ok(csv.includes("recorded booking rates"));
    } finally
    {
        globalThis.document = previous.document;
        URL.createObjectURL = previous.create;
        URL.revokeObjectURL = previous.revoke;
    }
});
