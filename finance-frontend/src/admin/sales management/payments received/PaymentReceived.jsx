import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Alert,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    MenuItem,
    Stack,
    TextField,
    Typography,
} from "@mui/material";

import { Feedback, Page, Records } from "../../../live/shared";
import { printPaymentReceipt } from "./PaymentReceipt";
import { money, useLoad } from "../../../live/data";
import {
    getReceivedPayments,
    getPaymentFilterOptions,
    resolveReceivedPayment,
} from "./PaymentReceivedService";
import BankPaymentFields from "../../banking management/payment banking/BankPaymentFields";

function formatDate(value) {
    if (!value) return "—";

    return value.slice(0, 10).split("-").reverse().join("/");
}

const emptyFilters = {
    clientId: "",
    branch: "",
    currency: "",
    paymentMode: "",
};

export default function PaymentReceived() {
    const navigate = useNavigate();

    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");
    const [filters, setFilters] = useState(emptyFilters);
    const [selectedPayment, setSelectedPayment] = useState(null);
    const [resolvingPayment, setResolvingPayment] = useState(null);
    const [settlement, setSettlement] = useState({
        settlementType: "Bank",
        bankAccountId: "",
        bankCurrency: "",
        bankAmount: "",
        bankChargeAmount: "",
    });
    const [resolveBusy, setResolveBusy] = useState(false);
    const [resolveError, setResolveError] = useState("");

    const options = useLoad(
        (signal) => getPaymentFilterOptions(signal),
        []
    );

    const list = useLoad(
        (signal) => {
            if (fromDate && toDate && fromDate > toDate) {
                throw new Error(
                    "From date cannot be after to date."
                );
            }

            return getReceivedPayments(
                {
                    page,
                    pageSize: 25,
                    search,
                    fromDate,
                    toDate,
                    ...filters,
                },
                signal
            );
        },
        [
            page,
            search,
            fromDate,
            toDate,
            filters.clientId,
            filters.branch,
            filters.currency,
            filters.paymentMode,
        ]
    );

    function changeFilter(name, value) {
        setFilters((previous) => ({
            ...previous,
            [name]: value,
        }));

        setPage(1);
    }

    function handlePrintReceipt() {
    try {
        printPaymentReceipt(selectedPayment);
    } catch (error) {
        window.alert(error.message);
    }
}

    function clearFilters() {
        setSearch("");
        setFromDate("");
        setToDate("");
        setFilters({ ...emptyFilters });
        setPage(1);
    }

    function openInvoice(payment) {
        if (!payment) return;

        navigate(
            `/sales/invoices?invoiceId=${encodeURIComponent(
                payment.salesInvoiceId
            )}`
        );
    }

    function openResolve(payment) {
        setSelectedPayment(null);
        setResolvingPayment(payment);
        setSettlement({
            settlementType: "Bank",
            bankAccountId: "",
            bankCurrency: "",
            bankAmount: "",
            bankChargeAmount: "",
        });
        setResolveError("");
    }

    async function handleResolve() {
        const bankAccountId = Number(settlement.bankAccountId);
        const bankAmount = Number(settlement.bankAmount);
        const bankChargeAmount = Number(
            settlement.bankChargeAmount || 0
        );

        if (!bankAccountId) {
            setResolveError("Select the receiving bank account.");
            return;
        }

        if (!Number.isFinite(bankAmount) || bankAmount <= 0) {
            setResolveError(
                "Enter the actual amount credited by the bank."
            );
            return;
        }

        if (
            !Number.isFinite(bankChargeAmount) ||
            bankChargeAmount < 0
        ) {
            setResolveError("Enter a valid bank charge amount.");
            return;
        }

        setResolveBusy(true);
        setResolveError("");

        try {
            await resolveReceivedPayment(
                resolvingPayment.id,
                {
                    bankAccountId,
                    bankAmount,
                    bankChargeAmount,
                }
            );

            setResolvingPayment(null);
            list.refresh();
        } catch (failure) {
            setResolveError(failure.message);
        } finally {
            setResolveBusy(false);
        }
    }

    const dropdowns = [
        {
            name: "clientId",
            label: "Client",
            items: (options.data?.clients ?? []).map((client) => ({
                value: client.id,
                label: client.companyName
                    ? `${client.name} · ${client.companyName}`
                    : client.name,
            })),
        },
        {
            name: "branch",
            label: "Branch",
            items: (options.data?.branches ?? []).map((branch) => ({
                value: branch.name,
                label: branch.name,
            })),
        },
        {
            name: "currency",
            label: "Currency",
            items: (options.data?.currencies ?? []).map((currency) => ({
                value: currency.currencyCode,
                label: currency.currencyCode,
            })),
        },
        {
            name: "paymentMode",
            label: "Payment mode",
            items: (options.data?.paymentModes ?? []).map((mode) => ({
                value: mode.name,
                label: mode.name,
            })),
        },
    ];

    const columns = [
        {
            label: "Payment",
            render: (payment) => payment.paymentNumber,
        },
        {
            label: "Client",
            render: (payment) => payment.clientName,
        },
        {
            label: "Invoice",
            render: (payment) => payment.invoiceNumber,
        },
        {
            label: "Date",
            render: (payment) => formatDate(payment.paymentDate),
        },
        {
            label: "Branch",
            render: (payment) => payment.branch,
        },
        {
            label: "Currency",
            render: (payment) => payment.currency,
        },
        {
            label: "Amount",
            render: (payment) =>
                money(payment.amount, payment.currency),
        },
        {
            label: "Payment mode",
            render: (payment) => payment.paymentMode,
        },
        {
            label: "Reference",
            render: (payment) => payment.reference || "—",
        },
        {
            label: "Actions",
            render: (payment) => (
                <Stack direction="row" spacing={1}>
                    <Button
                        onClick={() => setSelectedPayment(payment)}
                    >
                        View
                    </Button>

                    <Button onClick={() => openInvoice(payment)}>
                        Invoice
                    </Button>
                </Stack>
            ),
        },
    ];

    const detailFields = selectedPayment
        ? [
            ["Client", selectedPayment.clientName],
            ["Invoice", selectedPayment.invoiceNumber],
            ["Date", formatDate(selectedPayment.paymentDate)],
            ["Branch", selectedPayment.branch],
            ["Currency", selectedPayment.currency],
            [
                "Amount",
                money(
                    selectedPayment.amount,
                    selectedPayment.currency
                ),
            ],
            ["Payment mode", selectedPayment.paymentMode],
            ["Receiving bank", selectedPayment.bankAccountName],
            [
                "Actual bank credit",
                selectedPayment.bankAmount == null
                    ? "—"
                    : money(
                        selectedPayment.bankAmount,
                        selectedPayment.bankCurrency
                    ),
            ],
            [
                "Bank charges",
                selectedPayment.bankAccountId == null
                    ? "—"
                    : money(
                        selectedPayment.bankChargeAmount || 0,
                        selectedPayment.bankCurrency
                    ),
            ],
            ["Reference", selectedPayment.reference],
            ["Notes", selectedPayment.notes],
        ]
        : [];

    return (
        <Page
            title="Payments Received"
            subtitle="Payments recorded against your sales invoices"
        >
            <Feedback
                loading={options.loading}
                error={options.error}
                retry={options.refresh}
            />

            <Records
                {...list}
                rows={list.data?.data ?? []}
                total={list.data?.total ?? 0}
                page={page}
                setPage={setPage}
                search={search}
                setSearch={setSearch}
                columns={columns}
                extra={
                    <Stack
                        direction="row"
                        sx={{
                            gap: 2,
                            flexWrap: "wrap",
                            alignItems: "center",
                            width: "100%",
                        }}
                    >
                        {dropdowns.map((field) => (
                            <TextField
                                key={field.name}
                                select
                                size="small"
                                label={field.label}
                                value={filters[field.name]}
                                disabled={
                                    options.loading ||
                                    Boolean(options.error)
                                }
                                onChange={(event) =>
                                    changeFilter(
                                        field.name,
                                        event.target.value
                                    )
                                }
                                sx={{
                                    minWidth: 170,
                                    flexGrow: 1,
                                }}
                            >
                                <MenuItem value="">All</MenuItem>

                                {filters[field.name] &&
                                    !field.items.some(
                                        (item) =>
                                            item.value ===
                                            filters[field.name]
                                    ) && (
                                        <MenuItem
                                            value={filters[field.name]}
                                        >
                                            {filters[field.name]}
                                        </MenuItem>
                                    )}

                                {field.items.map((item) => (
                                    <MenuItem
                                        key={item.value}
                                        value={item.value}
                                    >
                                        {item.label}
                                    </MenuItem>
                                ))}
                            </TextField>
                        ))}

                        <TextField
                            size="small"
                            type="date"
                            label="From date"
                            value={fromDate}
                            onChange={(event) => {
                                setFromDate(event.target.value);
                                setPage(1);
                            }}
                            slotProps={{
                                inputLabel: { shrink: true },
                            }}
                        />

                        <TextField
                            size="small"
                            type="date"
                            label="To date"
                            value={toDate}
                            onChange={(event) => {
                                setToDate(event.target.value);
                                setPage(1);
                            }}
                            slotProps={{
                                inputLabel: { shrink: true },
                            }}
                        />

                        <Button onClick={clearFilters}>
                            Clear filters
                        </Button>
                    </Stack>
                }
            />

            <Dialog
                open={Boolean(selectedPayment)}
                onClose={() => setSelectedPayment(null)}
                fullWidth
                maxWidth="sm"
                aria-labelledby="received-payment-title"
            >
                <DialogTitle id="received-payment-title">
                    Payment Details
                </DialogTitle>

                <DialogContent dividers>
                    {selectedPayment && (
                        <Stack spacing={2}>
                            <Typography variant="h6">
                                {selectedPayment.paymentNumber}
                            </Typography>

                            {detailFields.map(([label, value]) => (
                                <Typography
                                    key={label}
                                    sx={{
                                        whiteSpace: "pre-wrap",
                                        overflowWrap: "anywhere",
                                    }}
                                >
                                    <strong>{label}:</strong>{" "}
                                    {value || "—"}
                                </Typography>
                            ))}
                        </Stack>
                    )}
                </DialogContent>

                <DialogActions sx={{ flexWrap: "wrap", gap: 1 }}>
    <Button onClick={() => setSelectedPayment(null)}>
        Close
    </Button>

    <Button
        variant="outlined"
        disabled={!selectedPayment}
        onClick={handlePrintReceipt}
    >
        Print Receipt
    </Button>

    {selectedPayment &&
        String(selectedPayment.paymentMode).toLowerCase() !== "cash" &&
        !selectedPayment.bankAccountId && (
            <Button
                color="warning"
                variant="outlined"
                onClick={() => openResolve(selectedPayment)}
            >
                Resolve Bank Settlement
            </Button>
        )}

    <Button
        variant="contained"
        disabled={!selectedPayment}
        onClick={() => openInvoice(selectedPayment)}
    >
        View Invoice
    </Button>
</DialogActions>
            </Dialog>

            <Dialog
                open={Boolean(resolvingPayment)}
                onClose={() => {
                    if (!resolveBusy) {
                        setResolvingPayment(null);
                    }
                }}
                fullWidth
                maxWidth="sm"
            >
                <DialogTitle>Resolve Bank Settlement</DialogTitle>

                <DialogContent dividers>
                    {resolvingPayment && (
                        <Stack spacing={2}>
                            <Alert severity="info">
                                {resolvingPayment.paymentNumber} received{" "}
                                {money(
                                    resolvingPayment.amount,
                                    resolvingPayment.currency
                                )}. Select the actual bank account and
                                enter the amount credited after conversion.
                            </Alert>

                            {resolveError && (
                                <Alert severity="error">
                                    {resolveError}
                                </Alert>
                            )}

                            <BankPaymentFields
                                value={settlement}
                                onChange={setSettlement}
                                currency={resolvingPayment.currency}
                                paymentMode={resolvingPayment.paymentMode}
                                direction="in"
                                disabled={resolveBusy}
                            />
                        </Stack>
                    )}
                </DialogContent>

                <DialogActions>
                    <Button
                        disabled={resolveBusy}
                        onClick={() => setResolvingPayment(null)}
                    >
                        Cancel
                    </Button>

                    <Button
                        variant="contained"
                        disabled={resolveBusy}
                        onClick={handleResolve}
                    >
                        {resolveBusy ? "Processing..." : "Process Payment"}
                    </Button>
                </DialogActions>
            </Dialog>
        </Page>
    );
}
