import React from "react";
import logo from "../../../assets/amnikon-logo.png";
import "./IssuedInvoice.css";

const IssuedInvoice = ({ invoice, formatDate, formatAmount, unitNames }) => {
    const issuer = invoice.issuer;
    const items = [...(invoice.items || [])].sort((a, b) => a.lineNumber - b.lineNumber);
    const money = (value) => formatAmount(value, invoice.currency);
    const bankDetails = [
        ["Name on account", issuer.bankAccountName],
        ["Bank name", issuer.bankName],
        ["Account number", issuer.bankAccountNumber],
        ["IBAN", issuer.bankIban],
        ["SWIFT / BIC", issuer.bankSwiftCode],
    ].filter(([, value]) => value);
    const taxLabel = issuer.countryCode === "IN" ? "GSTIN" :
        issuer.countryCode === "AE" ? "TRN" : "Tax registration number";
    const notes = invoice.notes || issuer.invoiceNotes;

    return (
        <article className="issued-invoice" aria-label="Issued company invoice">
            <header className="issued-invoice-header">
                <img src={logo} className="issued-invoice-logo" alt="AMNIKON Technologies" />
                <div className="issued-invoice-company">
                    <h1>{issuer.companyName}</h1>
                    <p className="issued-invoice-multiline">{issuer.address}</p>
                    {issuer.companyRegistrationNumber && <p>CR Number: {issuer.companyRegistrationNumber}</p>}
                    {issuer.taxRegistrationNumber && <p>{taxLabel}: {issuer.taxRegistrationNumber}</p>}
                </div>
                <div className="issued-invoice-number">
                    <strong>INVOICE#</strong>
                    <p>{invoice.invoiceNumber}</p>
                    <p>Date: {formatDate(invoice.invoiceDate)}</p>
                    {invoice.status === 2 || invoice.status === "Void" ? <strong>VOID</strong> : null}
                </div>
            </header>

            <section className="issued-invoice-client">
                <div>
                    <p>Issued To,</p>
                    <strong>{invoice.companyName || invoice.clientName}</strong>
                    {invoice.companyName && invoice.clientName !== invoice.companyName && <p>{invoice.clientName}</p>}
                    <p className="issued-invoice-multiline">{invoice.billingAddress}</p>
                </div>
                <div className="issued-invoice-dates">
                    <p>Due date: {formatDate(invoice.dueDate)}</p>
                    <p>Currency: {invoice.currency}</p>
                    {invoice.servicePeriodStart && invoice.servicePeriodEnd && (
                        <p>Service period: {formatDate(invoice.servicePeriodStart)} – {formatDate(invoice.servicePeriodEnd)}</p>
                    )}
                </div>
            </section>

            <section className="issued-invoice-items" aria-label="Invoice services">
                <table>
                    <colgroup><col style={{ width: "48%" }} /><col style={{ width: "12%" }} /><col style={{ width: "20%" }} /><col style={{ width: "20%" }} /></colgroup>
                    <thead><tr><th>Item Description</th><th>Quantity</th><th>Unit Price</th><th>Total</th></tr></thead>
                    <tbody>
                        {items.map((item) => (
                            <tr key={item.id || item.lineNumber}>
                                <td>
                                    <strong>{item.serviceName}</strong>
                                    {item.description && <p className="issued-invoice-multiline">{item.description}</p>}
                                </td>
                                <td>{item.quantity}<small>{unitNames[item.unit] || item.unit}</small></td>
                                <td>
                                    {money(item.unitPrice)}
                                    {item.discountEnabled !== false && item.discountAmount > 0 && <small>Discount: {money(item.discountAmount)}</small>}
                                    {item.taxRate > 0 && <small>Tax: {item.taxRate}%</small>}
                                </td>
                                <td><strong>{money(item.lineTotal)}</strong></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </section>

            {(notes || bankDetails.length > 0) && (
                <section className="issued-invoice-note-panel">
                    {notes && <div><strong>Note:</strong><p className="issued-invoice-multiline">{notes}</p></div>}
                    {bankDetails.length > 0 && (
                        <div><h2>Bank Details for Wire Transfers:</h2>
                            {bankDetails.map(([label, value]) => <p key={label}>{label}: {value}</p>)}
                        </div>
                    )}
                </section>
            )}

            <section className="issued-invoice-bottom">
                <div>
                    {invoice.additionalTerms && <><h2>Invoice Notes:</h2><p className="issued-invoice-multiline">{invoice.additionalTerms}</p></>}
                    {issuer.taxRegistrationNumber && <p>{taxLabel}: <strong>{issuer.taxRegistrationNumber}</strong></p>}
                    {invoice.preferredPaymentMode && <p>Preferred payment mode: {invoice.preferredPaymentMode}</p>}
                    {(invoice.status === 2 || invoice.status === "Void") && invoice.voidReason && <p>Void reason: {invoice.voidReason}</p>}
                </div>
                <dl className="issued-invoice-totals">
                    <div><dt>Subtotal</dt><dd>{money(invoice.subTotal)}</dd></div>
                    {invoice.discountTotal > 0 && <div><dt>Discount</dt><dd>{money(invoice.discountTotal)}</dd></div>}
                    {invoice.taxTotal > 0 && <div><dt>Tax</dt><dd>{money(invoice.taxTotal)}</dd></div>}
                    <div className="issued-invoice-grand-total"><dt>Total</dt><dd>{money(invoice.grandTotal)}</dd></div>
                </dl>
            </section>

            <footer className="issued-invoice-footer">
                {issuer.phone && <span>Tel: {issuer.phone}</span>}
                {issuer.email && <span>{issuer.email}</span>}
            </footer>
        </article>
    );
};

export default IssuedInvoice;
