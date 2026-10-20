import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    MenuItem,
    TextField,
    Typography,
} from "@mui/material";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import { useAuth } from "../../../context/AuthContext";
import { Page, Records } from "../../../live/shared";
import { useLoad } from "../../../live/data";
import {
    formatDate,
    getPaymentsMade,
    getPaymentsMadeSummary,
    money,
} from "./PaymentMadeService";
import PaymentMadeForm from "./PaymentMadeForm";
import "./PaymentsMade.css";

export default function PaymentsMade() {
    const navigate = useNavigate();
    const { canWrite } = useAuth();
    const [params, setParams] = useSearchParams();
    const sourceBillId = params.get("billId");
    const [adding, setAdding] = useState(Boolean(sourceBillId));
    const [search, setSearch] = useState("");
    const [status, setStatus] = useState("");
    const [page, setPage] = useState(1);

    const list = useLoad(
        signal => getPaymentsMade({ page, search, status }, signal),
        [page, search, status]
    );

    const summary = useLoad(getPaymentsMadeSummary, []);

    function refresh() {
        list.refresh();
        summary.refresh();
    }

    function closeForm() {
        setAdding(false);
        setParams({}, { replace: true });
    }

    function paymentSaved(payment) {
        closeForm();
        navigate("/purchases/payments/" + payment.id);
    }

    return (
        <Page
            title="Payments Made"
            subtitle="Record payments against vendor bills"
            action={
                canWrite && (
                    <Button
                        variant="contained"
                        startIcon={<AddRoundedIcon />}
                        onClick={() => setAdding(true)}
                    >
                        New Payment
                    </Button>
                )
            }
        >
            <Box className="payments-made-summary">
                {[
                    ["Total Payments", "total"],
                    ["Recorded", "recorded"],
                    ["Voided", "voided"],
                ].map(([label, name]) => (
                    <Card key={name}>
                        <CardContent>
                            <Typography color="text.secondary">{label}</Typography>
                            <Typography variant="h5" fontWeight={700}>
                                {summary.data?.[name] ?? "—"}
                            </Typography>
                        </CardContent>
                    </Card>
                ))}

                <Card>
                    <CardContent>
                        <Typography color="text.secondary">
                            Recorded total by currency
                        </Typography>

                        {(summary.data?.byCurrency ?? []).map(row => (
                            <Typography key={row.currency} fontWeight={700}>
                                {money(row.amount, row.currency, row.currencyDecimalPlaces)}
                            </Typography>
                        ))}

                        {summary.data?.byCurrency?.length === 0 && (
                            <Typography>No recorded payments</Typography>
                        )}
                    </CardContent>
                </Card>
            </Box>

            {summary.error && (
                <Alert severity="warning" sx={{ mb: 2 }}>
                    Payment counts could not be loaded. {summary.error}
                </Alert>
            )}

            <Records
                {...list}
                rows={list.data?.data ?? []}
                total={list.data?.total ?? 0}
                page={page}
                setPage={setPage}
                search={search}
                setSearch={setSearch}
                refresh={refresh}
                extra={
                    <TextField
                        select
                        label="Status"
                        size="small"
                        value={status}
                        sx={{ minWidth: 150 }}
                        onChange={event => {
                            setStatus(event.target.value);
                            setPage(1);
                        }}
                    >
                        <MenuItem value="">All statuses</MenuItem>
                        <MenuItem value="0">Recorded</MenuItem>
                        <MenuItem value="1">Voided</MenuItem>
                    </TextField>
                }
                columns={[
                    { label: "Payment", render: row => row.paymentNumber },
                    { label: "Vendor", render: row => row.vendorName },
                    { label: "Bill", render: row => row.billNumber },
                    { label: "Date", render: row => formatDate(row.paymentDate) },
                    { label: "Mode", render: row => row.paymentMode },
                    {
                        label: "Amount",
                        render: row => money(
                            row.amount,
                            row.currency,
                            row.currencyDecimalPlaces
                        ),
                    },
                    {
                        label: "Status",
                        render: row => (
                            <Chip
                                size="small"
                                label={row.status === 0 ? "Recorded" : "Voided"}
                                color={row.status === 0 ? "success" : "default"}
                            />
                        ),
                    },
                    {
                        label: "Action",
                        render: row => (
                            <Button
                                onClick={() => {
                                    navigate("/purchases/payments/" + row.id);
                                }}
                            >
                                View
                            </Button>
                        ),
                    },
                ]}
            />

            {canWrite && adding && (
                <PaymentMadeForm
                    billId={sourceBillId}
                    onClose={closeForm}
                    onSaved={paymentSaved}
                />
            )}
        </Page>
    );
}
