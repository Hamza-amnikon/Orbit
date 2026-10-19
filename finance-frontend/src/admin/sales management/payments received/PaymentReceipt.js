export function printPaymentReceipt(payment) {
    if (!payment) {
        throw new Error("Select a payment first.");
    }

    const printWindow = window.open(
        "",
        "_blank",
        "width=850,height=900"
    );

    if (!printWindow) {
        throw new Error(
            "Allow pop-ups for this site to print the receipt."
        );
    }

    printWindow.opener = null;

    const doc = printWindow.document;

    doc.open();
    doc.write(
        "<!doctype html><html><head>" +
        "<title>Payment Receipt</title>" +
        "</head><body></body></html>"
    );
    doc.close();

    doc.title = `Receipt ${payment.paymentNumber}`;

    const style = doc.createElement("style");

    style.textContent = `
        body {
            font-family: Arial, sans-serif;
            color: #172033;
            margin: 0;
            padding: 40px;
        }

        main {
            max-width: 760px;
            margin: auto;
        }

        h1 {
            margin-bottom: 8px;
        }

        .number {
            color: #3658a4;
            margin-bottom: 32px;
        }

        dl {
            display: grid;
            grid-template-columns: 160px minmax(0, 1fr);
            gap: 16px;
            padding: 24px 0;
            border-top: 1px solid #ddd;
            border-bottom: 1px solid #ddd;
        }

        dt {
            font-weight: bold;
        }

        dd {
            margin: 0;
            white-space: pre-wrap;
            overflow-wrap: anywhere;
        }

        .amount {
            font-size: 24px;
            font-weight: bold;
            margin: 28px 0;
        }

        footer {
            color: #555;
            font-size: 12px;
            line-height: 1.6;
        }

        @page {
            size: A4;
            margin: 18mm;
        }

        @media print {
            body {
                padding: 0;
            }

            dl {
                break-inside: avoid;
            }
        }
    `;

    doc.head.appendChild(style);

    const main = doc.createElement("main");
    doc.body.appendChild(main);

    function addElement(tag, text, className) {
        const element = doc.createElement(tag);
        element.textContent = text;

        if (className) {
            element.className = className;
        }

        main.appendChild(element);
        return element;
    }

    addElement("h1", "Payment Receipt");
    addElement("p", payment.paymentNumber, "number");

    const date = payment.paymentDate
        ? payment.paymentDate
            .slice(0, 10)
            .split("-")
            .reverse()
            .join("/")
        : "—";

    const fields = [
        ["Received from", payment.clientName],
        ["Invoice", payment.invoiceNumber],
        ["Payment date", date],
        ["Managing branch", payment.branch],
        ["Currency", payment.currency],
        ["Payment mode", payment.paymentMode],
        ["Reference", payment.reference],
        ["Notes", payment.notes],
    ];

    const details = doc.createElement("dl");

    for (const [label, value] of fields) {
        const term = doc.createElement("dt");
        term.textContent = label;

        const description = doc.createElement("dd");
        description.textContent = value || "—";

        details.append(term, description);
    }

    main.appendChild(details);

    const amount = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: payment.currency,
        currencyDisplay: "code",
    }).format(payment.amount);

    addElement("p", `Amount received: ${amount}`, "amount");

    addElement(
        "footer",
        "This receipt confirms the payment recorded against " +
        "the invoice shown above. Check the invoice for its " +
        "current outstanding balance."
    );

    doc.fonts.ready.then(() => {
        if (!printWindow.closed) {
            printWindow.focus();
            printWindow.print();
        }
    });
}