import test from "node:test";
import assert from "node:assert/strict";
import { auditChanges, auditQuery, auditActivityLabel } from "./AuditHistoryService.js";
test("before/after comparison preserves numeric and boolean changes", () =>
{
    const result = auditChanges({
        beforeJson: JSON.stringify({
            Amount: 10,
            IsActive: true,
            Status: "Draft",
            Currency: "INR"
        }),
        afterJson: JSON.stringify({
            Amount: 20,
            IsActive: false,
            Status: "Issued",
            Currency: "INR"
        })
    });
    assert.equal(result.length, 3);
    assert.deepEqual(result[0], {
        field: "Amount",
        before: 10,
        after: 20
    });
    assert.equal(result.some(row => row.field === "Currency"), false);
    assert.equal(result.find(row => row.field === "IsActive").after, false);
});
test("creation, deletion and baseline snapshots never fabricate previous values", () =>
{
    assert.deepEqual(auditChanges({
        beforeJson: null,
        afterJson: '{"Name":"Existing"}'
    }), [{
        field: "Name",
        before: undefined,
        after: "Existing"
    }]);
    assert.deepEqual(auditChanges({
        beforeJson: '{"Amount":10}',
        afterJson: null
    }), [{
        field: "Amount",
        before: 10,
        after: undefined
    }]);
    assert.deepEqual(auditChanges({}), []);
});
test("date filters include the complete selected local date and preserve search text", () =>
{
    const query = new URLSearchParams(auditQuery({
        from: "2026-11-01",
        to: "2026-11-01",
        search: "A&B",
        branch: "",
        page: 2
    }));
    assert.equal(query.get("from"), new Date("2026-11-01T00:00:00").toISOString());
    assert.equal(query.get("before"), new Date("2026-11-02T00:00:00").toISOString());
    assert.equal(query.get("search"), "A&B");
    assert.equal(query.has("branch"), false);
    assert.throws(() => auditQuery({
        from: "2026-12-01",
        to: "2026-11-01"
    }), /valid date range/);
});

test("activity labels describe payments and status changes without inventing a user", () =>
{
    assert.equal(auditActivityLabel({
        entityType: "SalesInvoicePayment", action: "Created"
    }), "Customer payment recorded");
    assert.equal(auditActivityLabel({
        entityType: "ExpenseClaim", action: "Status changed",
        afterJson: '{"Status":"Approved"}'
    }), "Expense claim approved");
    assert.equal(auditActivityLabel({
        entityType: "SalesInvoice", action: "Snapshot"
    }), "Existing record snapshot");
});

test("activity selection is sent with list and export filters", () =>
{
    const query = new URLSearchParams(auditQuery({ activity: "Business", page: 2 }));
    assert.equal(query.get("activity"), "Business");
    assert.equal(query.get("page"), "2");
});
