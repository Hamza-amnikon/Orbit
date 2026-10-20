<<<<<<< HEAD
export const purchaseOrderStatuses = ["Draft", "Issued", "Cancelled"];
export const purchaseUnits = ["Hour", "Day", "Month", "Fixed fee", "Piece"];
export const orderStatus = value => purchaseOrderStatuses[value] || value || "Unknown";
export const today = () => {
    const value = new Date();
    return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, "0")}-${String(value.getDate()).padStart(2, "0")}`;
};
export const formatDate = value => value ? value.slice(0, 10).split("-").reverse().join("/") : "—";
export function money(value, currency, precision) {
    if (!currency || value == null) return "—";
    try { return new Intl.NumberFormat(undefined, { style: "currency", currency, currencyDisplay: "code",
        ...(precision == null ? {} : { minimumFractionDigits: precision, maximumFractionDigits: precision }) }).format(value); }
    catch { return currency + " " + value; }
}
export const vendorAddress = vendor => [vendor.address, vendor.city, vendor.state, vendor.country, vendor.postalCode].filter(Boolean).join(", ");
export const newOrderLine = () => ({
    key: crypto.randomUUID(), itemName: "", description: "", unit: 4, quantity: "1", unitPrice: "0",
    discountEnabled: false, discountAmount: "0", taxRate: "0",
});
export function orderValues(order) {
    return {
        vendorId: order?.vendorId || "", orderDate: order?.orderDate || today(),
        expectedDeliveryDate: order?.expectedDeliveryDate || "", branch: order?.branch || "",
        currency: order?.currency || "", billingAddress: order?.billingAddress || "",
        shippingAddress: order?.shippingAddress || "", reference: order?.reference || "",
        paymentTerms: order?.paymentTerms || "", notes: order?.notes || "", additionalTerms: order?.additionalTerms || "",
        items: order?.items?.length ? order.items.map(item => ({ ...item, key: crypto.randomUUID(),
            quantity: String(item.quantity), unitPrice: String(item.unitPrice),
            discountAmount: String(item.discountAmount), taxRate: String(item.taxRate) })) : [newOrderLine()],
    };
}
export function orderPayload(value) {
    return {
        ...Object.fromEntries(["vendorId", "orderDate", "branch", "currency", "billingAddress", "shippingAddress",
            "reference", "paymentTerms", "notes", "additionalTerms"].map(name => [name, value[name].trim()])),
        expectedDeliveryDate: value.expectedDeliveryDate || null,
        items: value.items.map(item => ({
            itemName: item.itemName.trim(), description: item.description.trim(), unit: Number(item.unit),
            quantity: Number(item.quantity), unitPrice: Number(item.unitPrice), discountEnabled: item.discountEnabled,
            discountAmount: item.discountEnabled ? Number(item.discountAmount) : 0, taxRate: Number(item.taxRate),
        })),
    };
}
=======
export const purchaseOrderStatuses = [
    "Draft",
    "Issued",
    "Cancelled",
];

export const purchaseUnits = [
    "Hour",
    "Day",
    "Month",
    "Fixed fee",
    "Piece",
];

export function orderStatus(value) {
    return purchaseOrderStatuses[value] || value || "Unknown";
}

export function today() {
    const value = new Date();

    const year = value.getFullYear();
    const month = String(value.getMonth() + 1).padStart(2, "0");
    const day = String(value.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

export function formatDate(value) {
    if (!value) {
        return "—";
    }

    return value
        .slice(0, 10)
        .split("-")
        .reverse()
        .join("/");
}

export function money(value, currency, precision) {
    if (!currency || value == null) {
        return "—";
    }

    try {
        return new Intl.NumberFormat(undefined, {
            style: "currency",
            currency,
            currencyDisplay: "code",
            ...(precision == null
                ? {}
                : {
                    minimumFractionDigits: precision,
                    maximumFractionDigits: precision,
                }),
        }).format(value);
    } catch {
        return currency + " " + value;
    }
}

export function vendorAddress(vendor) {
    return [
        vendor.address,
        vendor.city,
        vendor.state,
        vendor.country,
        vendor.postalCode,
    ]
        .filter(Boolean)
        .join(", ");
}

export function newOrderLine() {
    return {
        key: crypto.randomUUID(),
        itemName: "",
        description: "",
        unit: 4,
        quantity: "1",
        unitPrice: "0",
        discountEnabled: false,
        discountAmount: "0",
        taxRate: "0",
    };
}

export function orderValues(order) {
    return {
        vendorId: order?.vendorId || "",
        orderDate: order?.orderDate || today(),
        expectedDeliveryDate: order?.expectedDeliveryDate || "",
        branch: order?.branch || "",
        currency: order?.currency || "",
        billingAddress: order?.billingAddress || "",
        shippingAddress: order?.shippingAddress || "",
        reference: order?.reference || "",
        paymentTerms: order?.paymentTerms || "",
        paymentModeId: order?.paymentModeId ?? "",
        notes: order?.notes || "",
        additionalTerms: order?.additionalTerms || "",

        items: order?.items?.length
            ? order.items.map(item => ({
                ...item,
                key: crypto.randomUUID(),
                quantity: String(item.quantity),
                unitPrice: String(item.unitPrice),
                discountAmount: String(item.discountAmount),
                taxRate: String(item.taxRate),
            }))
            : [newOrderLine()],
    };
}

export function orderPayload(value) {
    const textFields = [
        "vendorId",
        "orderDate",
        "branch",
        "currency",
        "billingAddress",
        "shippingAddress",
        "reference",
        "paymentTerms",
        "notes",
        "additionalTerms",
    ];

    return {
        ...Object.fromEntries(
            textFields.map(name => [
                name,
                value[name].trim(),
            ])
        ),

        expectedDeliveryDate:
            value.expectedDeliveryDate || null,

        paymentModeId:
            value.paymentModeId === "" ||
            value.paymentModeId == null
                ? null
                : Number(value.paymentModeId),

        items: value.items.map(item => ({
            itemName: item.itemName.trim(),
            description: item.description.trim(),
            unit: Number(item.unit),
            quantity: Number(item.quantity),
            unitPrice: Number(item.unitPrice),
            discountEnabled: item.discountEnabled,
            discountAmount: item.discountEnabled
                ? Number(item.discountAmount)
                : 0,
            taxRate: Number(item.taxRate),
        })),
    };
}
>>>>>>> aa1e4a9f74574849eb8f784b0674a71d22345bdc
