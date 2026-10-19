export const vendorSections = [
    ["Basic Information", [
        ["name", "Vendor name", 200, true],
        ["companyName", "Company name", 200],
        ["contactPerson", "Contact person", 200],
        ["email", "Email", 254, false, "email"],
        ["phone", "Phone", 25, false, "tel"],
    ]],
    ["Address", [
        ["address", "Address", 1000],
        ["country", "Country", 100],
        ["state", "State / emirate", 100],
        ["city", "City", 100],
        ["postalCode", "Postal / ZIP code", 20],
    ]],
    ["Tax & Banking", [
        ["gstNumber", "GST number (India)", 15],
        ["pan", "PAN (India)", 10],
        ["vatTrn", "VAT TRN (UAE)", 15],
        ["ein", "EIN (USA)", 10],
        ["bankName", "Bank name", 100],
        ["accountNumber", "Account number", 34],
        ["ifscCode", "IFSC code (India)", 11],
        ["iban", "IBAN", 34],
        ["swiftCode", "SWIFT / BIC", 11],
        ["routingNumber", "Routing number (USA)", 9],
    ]],
    ["Purchase Settings", [
        ["branch", "Managing branch", 20, true],
        ["currency", "Currency", 3, true],
        ["paymentTerms", "Payment terms", 200],
        ["notes", "Notes", 2000],
    ]],
];

export const vendorFields = vendorSections.flatMap(([, fields]) => fields);

export function vendorValues(vendor) {
    return {
        ...Object.fromEntries(vendorFields.map(([name]) => [name, vendor?.[name] ?? ""])),
        isVatRegistered: vendor?.isVatRegistered ?? null,
    };
}

export function vendorPayload(values, vendor) {
    return {
        ...Object.fromEntries(vendorFields.map(([name]) => [name, values[name].trim()])),
        email: values.email.trim() || null,
        currency: values.currency.trim().toUpperCase(),
        isVatRegistered: values.isVatRegistered,
        ...(vendor ? { rowVersion: vendor.rowVersion } : {}),
    };
}

// Country-based form rules mirror Clients; lookup data still comes from VendorService.API.
export function vendorCountry(country) {
    const value = (country || "").trim().toUpperCase();
    if (["INDIA", "IN"].includes(value)) return "IN";
    if (["UNITED ARAB EMIRATES", "UAE", "AE"].includes(value)) return "AE";
    if (["UNITED STATES", "UNITED STATES OF AMERICA", "USA", "US"].includes(value)) return "US";
    return "";
}

export function vendorSectionsForCountry(country) {
    const code = vendorCountry(country);
    const regionalFields = {
        gstNumber: ["IN"],
        pan: ["IN"],
        ifscCode: ["IN"],
        vatTrn: ["AE"],
        ein: ["US"],
        routingNumber: ["US"],
        iban: ["AE", "US"],
        swiftCode: ["AE", "US"],
    };

    return vendorSections.map(([title, fields]) => [
        title,
        fields.filter(([name]) => !regionalFields[name] || regionalFields[name].includes(code))
            .map(([name, label, ...rest]) => [
                name,
                name === "state" ? code === "AE" ? "Emirate" : "State"
                    : name === "postalCode" ? code === "US" ? "ZIP code" : "Postal code"
                        : label,
                ...rest,
            ]),
    ]);
}
