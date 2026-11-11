export function discountInput(item)
{
    return {
        discountType: item?.discountType || "Fixed",
        discountValue: String(item?.discountValue ?? item?.discountAmount ?? 0)
    };
}

export function validateLineDiscount(item)
{
    if (!["Fixed", "Percentage"].includes(item.discountType))
    {
        throw new Error("Choose Fixed amount or Percentage for the discount type.");
    }
    if (!item.discountEnabled)
    {
        return;
    }
    const value = Number(item.discountValue);
    if (item.discountValue === "" || !Number.isFinite(value) || value < 0)
    {
        throw new Error("Enter a non-negative discount value.");
    }
    if (item.discountType === "Percentage" && value > 100)
    {
        throw new Error("Discount percentage must be between 0 and 100.");
    }
}

export function discountPayload(item)
{
    return {
        discountType: item.discountType || "Fixed",
        discountValue: item.discountEnabled ? Number(item.discountValue) : 0
    };
}
