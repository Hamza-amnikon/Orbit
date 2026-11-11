import test from "node:test";
import assert from "node:assert/strict";
import { discountInput, discountPayload, validateLineDiscount } from "./lineDiscount.js";
import { orderValues as billValues, orderPayload as billPayload } from "../Admin/purchases management/bills/BillHelpers.js";
import { orderValues as orderValues, orderPayload as orderPayload } from "../Admin/purchases management/purchase orders/PurchaseOrderHelpers.js";

test("old monetary discounts reopen as fixed amounts", () =>
{
    assert.deepEqual(discountInput({ discountAmount: 10 }), { discountType: "Fixed", discountValue: "10" });
});

test("percentage edits restore the entered percentage rather than the calculated deduction", () =>
{
    assert.deepEqual(discountInput({ discountType: "Percentage", discountValue: 10, discountAmount: 100 }), {
        discountType: "Percentage", discountValue: "10"
    });
    assert.equal(discountInput({ discountType: "Percentage", discountValue: 0, discountAmount: 100 }).discountValue, "0");
});

test("enabled discounts validate mode and percentage limits", () =>
{
    for (const value of ["-1", "101", "", "invalid"])
    {
        assert.throws(() => validateLineDiscount({ discountEnabled: true, discountType: "Percentage", discountValue: value }));
    }
    assert.throws(() => validateLineDiscount({ discountEnabled: true, discountType: "Unknown", discountValue: "10" }));
    assert.doesNotThrow(() => validateLineDiscount({ discountEnabled: true, discountType: "Percentage", discountValue: "100" }));
    assert.doesNotThrow(() => validateLineDiscount({ discountEnabled: true, discountType: "Fixed", discountValue: "150" }));
});

test("disabled discounts submit zero while retaining their selected mode", () =>
{
    assert.deepEqual(discountPayload({ discountEnabled: false, discountType: "Percentage", discountValue: "10" }), {
        discountType: "Percentage", discountValue: 0
    });
});

test("bill and purchase order payloads preserve the raw discount choice", () =>
{
    for (const [values, payload] of [[billValues, billPayload], [orderValues, orderPayload]])
    {
        const draft = values({ items: [{ itemName: "Test", description: "", accountCode: "EXP", quantity: 1, unitPrice: 1000,
            discountEnabled: true, discountType: "Percentage", discountValue: 10, discountAmount: 100, taxRate: 0 }] });
        const line = payload(draft).items[0];
        assert.equal(line.discountType, "Percentage");
        assert.equal(line.discountValue, 10);
        assert.equal(Object.hasOwn(line, "discountAmount"), false);
    }
});
