import test from "node:test";
import assert from "node:assert/strict";
import { savedTaxSelection, validateTaxSelections } from "./taxSettings.js";
import { orderPayload, orderValues, newOrderLine } from "../Admin/purchases management/purchase orders/PurchaseOrderHelpers.js";

const local = { id: 1, rowVersion: "local-version", treatment: "IndiaCgstSgst" };
const interstate = { id: 2, rowVersion: "inter-version", treatment: "IndiaIgst" };

test("existing tax snapshots restore the selected setting and version", () =>
{
    assert.deepEqual(savedTaxSelection({ taxSettingId: 1, taxSettingSnapshotJson: '{"rowVersion":"local-version"}' }), {
        taxSettingId: 1,
        taxSettingRowVersion: "local-version"
    });
});

test("previously taxable lines require an explicit choice", () =>
{
    const item = savedTaxSelection({ taxRate: 8 });
    assert.equal(item.taxSettingId, "legacy");
    assert.throws(() => validateTaxSelections([item], [local]), /Select a currently valid/);
});

test("changed and unavailable settings cannot be saved", () =>
{
    assert.throws(() => validateTaxSelections([{ taxSettingId: 1, taxSettingRowVersion: "old" }], [local]), /Select a currently valid/);
    assert.throws(() => validateTaxSelections([{ taxSettingId: 3, taxSettingRowVersion: "missing" }], [local]), /Select a currently valid/);
});

test("one document cannot mix local GST and IGST", () =>
{
    assert.throws(() => validateTaxSelections([
        { taxSettingId: 1, taxSettingRowVersion: local.rowVersion },
        { taxSettingId: 2, taxSettingRowVersion: interstate.rowVersion }
    ], [local, interstate]), /same tax treatment/);
});

test("No tax and lines using the same saved treatment are accepted", () =>
{
    assert.doesNotThrow(() => validateTaxSelections([
        savedTaxSelection(),
        { taxSettingId: 1, taxSettingRowVersion: local.rowVersion }
    ], [local]));
});

test("purchase order payload sends a setting reference without a manual percentage", () =>
{
    const value = orderValues();
    value.items = [{ ...newOrderLine(), taxSettingId: 1, taxSettingRowVersion: "local-version" }];
    const line = orderPayload(value).items[0];
    assert.equal(line.taxSettingId, 1);
    assert.equal(line.taxSettingRowVersion, "local-version");
    assert.equal(Object.hasOwn(line, "taxRate"), false);
});
