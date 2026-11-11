import test from "node:test";
import assert from "node:assert/strict";
import { newOrderLine, orderPayload, orderValues } from "./BillHelpers.js";

function bill(items)
{
    return orderValues({
        vendorId: "test-vendor",
        branch: "Turbhe",
        currency: "INR",
        billDate: "2026-11-10",
        items
    });
}

test("bill requests send the selected setting and version without a manual percentage", () =>
{
    const value = bill([{ ...newOrderLine(), taxSettingId: 2, taxSettingSnapshotJson: '{"rowVersion":"saved-version"}' }]);
    const item = orderPayload(value).items[0];
    assert.equal(item.taxSettingId, 2);
    assert.equal(item.taxSettingRowVersion, "saved-version");
    assert.equal(Object.hasOwn(item, "taxRate"), false);
});

test("No tax sends no setting reference", () =>
{
    const item = orderPayload(bill([newOrderLine()])).items[0];
    assert.equal(item.taxSettingId, null);
    assert.equal(item.taxSettingRowVersion, "");
});

test("legacy taxable drafts require an explicit choice instead of silently selecting No tax", () =>
{
    const value = bill([{ ...newOrderLine(), taxRate: 8 }]);
    assert.equal(value.items[0].taxSettingId, "legacy");
});

test("invalid saved snapshots require a fresh version instead of inventing one", () =>
{
    const value = bill([{ ...newOrderLine(), taxSettingId: 2, taxSettingSnapshotJson: "invalid" }]);
    assert.equal(value.items[0].taxSettingRowVersion, "");
});
