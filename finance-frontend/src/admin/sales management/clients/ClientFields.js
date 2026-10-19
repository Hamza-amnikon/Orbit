export const clientFields = [
    ["name", "Client name", 200, true],
    //["code", "Client code", 50, true],
    ["companyName", "Company name", 200],
    //["contactPerson", "Contact person", 200],
    ["email", "Email", 254, false, "email"],
    ["phone", "Phone", 25, false, "tel"],
    ["address", "Address", 1000],
    ["country", "Country", 100],
    ["state", "State", 100],
    ["city", "City", 100],


    ["postalCode", "Postal code", 20],
    ["gstNumber", "GST number (if applicable)", 15],
    ["pan", "PAN (if applicable)", 10],
    ["bankName", "Bank name", 100],
    ["accountNumber", "Account number", 34],
    ["ifscCode", "IFSC (if applicable)", 11],
    ["isVatRegistered", "VAT registered", undefined, false, "boolean"],
    ["vatTrn", "VAT TRN", 15],
    ["ein", "EIN (optional)", 10],
    ["iban", "IBAN (optional)", 34],
    ["swiftCode", "SWIFT / BIC (optional)", 11],
    ["routingNumber", "Routing number (optional)", 9],
    ["notes", "Notes", 2000],
];

export function clientCountry(country) {
    const value = (country || "").trim().toUpperCase();

    if (["INDIA", "IN"].includes(value)) return "IN";
    if (["UNITED ARAB EMIRATES", "UAE", "AE"].includes(value)) return "AE";
    if (["UNITED STATES", "UNITED STATES OF AMERICA", "USA", "US"].includes(value)) return "US";

    return "";
}

export function fieldsForCountry(country) {
    const code = clientCountry(country);
    const regionalFields = {
        gstNumber: ["IN"],
        pan: ["IN"],
        ifscCode: ["IN"],
        isVatRegistered: ["AE"],
        vatTrn: ["AE"],
        ein: ["US"],
        routingNumber: ["US"],
        iban: ["AE", "US"],
        swiftCode: ["AE", "US"],
    };

    return clientFields.filter(([name]) =>
        !regionalFields[name] || regionalFields[name].includes(code)
    ).map((field) => {
        if (field[0] === "state" && code === "AE") {
            return ["state", "Emirate", ...field.slice(2)];
        }

        if (field[0] === "postalCode" && code === "US") {
            return ["postalCode", "ZIP code", ...field.slice(2)];
        }

        return field;
    });
}
