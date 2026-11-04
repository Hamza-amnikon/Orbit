import { useState } from "react";
import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    MenuItem,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Typography,
} from "@mui/material";

import { Feedback, Page } from "../../../live/shared";
import { money, useLoad } from "../../../live/data";
import {
    getCustomerStatement,
    getStatementClients,
} from "./CustomerStatementService";

function formatDate(value) {
    if (!value) return "—";

    return value.slice(0, 10).split("-").reverse().join("/");
}

function statementType(type) {
    return {
        Invoice: "Invoice",
        CreditNote: "Credit note",
        CashPayment: "Cash payment",
        CreditApplication: "Credit applied",
    }[type] || type;
}

export default function CustomerStatements() {
    const [selected, setSelected] = useState("");

    const clients = useLoad(
        (signal) => getStatementClients(signal),
        []
    );

    const options = clients.data ?? [];
    const choice = options.find((_, index) => String(index) === selected);

    const statement = useLoad(
        (signal) => choice
            ? getCustomerStatement(choice, signal)
            : null,
        [choice?.clientId, choice?.branch, choice?.currency]
    );

    const data = statement.data;
    const currency = data?.currency || choice?.currency || "INR";

    return (
        <Page
            title="Customer Statements"
            subtitle="Invoices, credits and payments for one customer, branch and currency"
        >
            <Alert severity="info" sx={{ mb: 2 }}>
                Credit applied to another invoice is shown as a transfer. It does not change the customer’s total balance or create a cash payment.
            </Alert>

            <Card sx={{ mb: 2 }}>
                <CardContent>
                    <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems={{ sm: "center" }}>
                        <TextField
                            select
                            size="small"
                            label="Customer, branch and currency"
                            value={selected}
                            onChange={(event) => setSelected(event.target.value)}
                            sx={{ width: { xs: "100%", sm: 420 } }}
                        >
                            <MenuItem value="">Select a customer</MenuItem>
                            {options.map((client, index) => (
                                <MenuItem key={`${client.clientId}-${client.branch}-${client.currency}`} value={String(index)}>
                                    {client.clientName} · {client.branch} · {client.currency}
                                </MenuItem>
                            ))}
                        </TextField>

                        <Button onClick={() => { clients.refresh(); statement.refresh(); }}>
                            Refresh
                        </Button>
                    </Stack>
                </CardContent>
            </Card>

            <Feedback loading={clients.loading} error={clients.error} retry={clients.refresh} />
            {selected && <Feedback loading={statement.loading} error={statement.error} retry={statement.refresh} />}

            {!clients.loading && !clients.error && options.length === 0 && (
                <Alert severity="info">No issued invoices are available for a customer statement.</Alert>
            )}

            {!selected && options.length > 0 && (
                <Alert severity="info">Select a customer to view the statement.</Alert>
            )}

            {data && (
                <>
                    <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr 1fr", md: "repeat(4, 1fr)" }, gap: 2, mb: 2 }}>
                        {[
                            ["Invoices", data.invoiceTotal],
                            ["Credit notes", data.creditNoteTotal],
                            ["Cash payments", data.cashPaymentTotal],
                            [data.netBalance < 0 ? "Customer credit" : "Net amount due", Math.abs(data.netBalance)],
                        ].map(([label, amount]) => (
                            <Card key={label}>
                                <CardContent>
                                    <Typography variant="body2" color="text.secondary">{label}</Typography>
                                    <Typography variant="h6" sx={{ mt: 1 }}>{money(amount, currency)}</Typography>
                                </CardContent>
                            </Card>
                        ))}
                    </Box>

                    <Card>
                        <CardContent>
                            <Typography variant="h6" sx={{ mb: 2 }}>
                                {data.clientName} · {data.branch} · {data.currency}
                            </Typography>

                            <TableContainer tabIndex={0} role="region" aria-label="Customer statement history">
                                <Table size="small">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Date</TableCell>
                                            <TableCell>Type</TableCell>
                                            <TableCell>Document</TableCell>
                                            <TableCell>Invoice</TableCell>
                                            <TableCell>Description</TableCell>
                                            <TableCell align="right">Amount</TableCell>
                                            <TableCell align="right">Balance change</TableCell>
                                            <TableCell align="right">Running balance</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {data.lines.map((line, index) => (
                                            <TableRow key={`${line.type}-${line.documentNumber}-${index}`}>
                                                <TableCell>{formatDate(line.date)}</TableCell>
                                                <TableCell>{statementType(line.type)}</TableCell>
                                                <TableCell>{line.documentNumber}</TableCell>
                                                <TableCell>
                                                    {line.invoiceNumber}
                                                    {line.targetInvoiceNumber && ` → ${line.targetInvoiceNumber}`}
                                                </TableCell>
                                                <TableCell>{line.description}</TableCell>
                                                <TableCell align="right">{money(line.amount, currency)}</TableCell>
                                                <TableCell align="right">
                                                    {line.balanceChange === 0 ? "—" : money(line.balanceChange, currency)}
                                                </TableCell>
                                                <TableCell align="right">{money(line.runningBalance, currency)}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>

                            {data.lines.length === 0 && (
                                <Typography color="text.secondary" sx={{ py: 4, textAlign: "center" }}>
                                    No statement records found.
                                </Typography>
                            )}
                        </CardContent>
                    </Card>
                </>
            )}
        </Page>
    );
}
