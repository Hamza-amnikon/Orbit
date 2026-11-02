import { useEffect, useState } from "react";
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    MenuItem,
    Stack,
    TextField,
    Typography,
} from "@mui/material";
import ExpandMoreRoundedIcon from "@mui/icons-material/ExpandMoreRounded";
import { Link } from "react-router-dom";
import { financeApi } from "../services/financeApi";
import { previewMode } from "../services/preview";
import { money, today, useLoad } from "./data";
import { Feedback, Page } from "./shared";

const dashboardCards = [
    ["Invoice sales including tax, less credits", "revenue"],
    ["Bills and recorded expenses", "expenses"],
    ["Payments received", "received"],
    ["Supplier payments made", "paid"],
    ["Current accounts receivable", "accountsReceivable"],
    ["Current accounts payable", "accountsPayable"],
    ["Current customer credits", "customerCredits"],
];

const dashboardCalculations = [
    {
        label: "Invoice sales including tax, less credits",
        formula: "Tax-inclusive totals of issued invoices dated in the selected period, minus issued sales credit notes dated in that period, for the selected branch and reporting currency.",
    },
    {
        label: "Bills and recorded expenses",
        formula: "Recorded expenses plus issued purchase bills dated in the selected period and branch, converted to the reporting currency.",
    },
    {
        label: "Payments received",
        formula: "Total of recorded customer payments dated in the selected period.",
    },
    {
        label: "Supplier payments made",
        formula: "Total of recorded supplier payments dated in the selected period.",
    },
    {
        label: "Current accounts receivable",
        formula: "Sum of positive balances due on issued invoices after payments and issued credit notes. Excess payments after credits are shown separately as customer credits. Includes all dates for the selected branch.",
    },
    {
        label: "Current accounts payable",
        formula: "Outstanding balances on issued bills: bill total minus recorded payments and applied vendor credits. Includes all dates for the selected branch.",
    },
    {
        label: "Current customer credits",
        formula: "Sum of excess payments remaining on individual issued invoices after issued credit notes. Shown separately from unpaid invoices and includes all dates for the selected branch.",
    },
];

export default function Dashboard() {
    const [from, setFrom] = useState(() => today().slice(0, 8) + "01");
    const [to, setTo] = useState(today);
    const [branch, setBranch] = useState("All");
    const [currency, setCurrency] = useState("INR");

    const summary = useLoad(
        signal => financeApi.dashboard({
            from,
            to,
            branch: branch === "All" ? "" : branch,
            currency,
        }, signal),
        [from, to, branch, currency],
        { keepPreviousData: true },
    );

    const activity = useLoad(
        signal => financeApi.activity(signal),
        [],
        { keepPreviousData: true },
    );
    const refreshSummary = summary.refresh;
    const refreshActivity = activity.refresh;

    useEffect(() => {
        const timer = setInterval(() => {
            refreshSummary();
            refreshActivity();
        }, 60 * 1000);
        const refreshWhenActive = () => {
            if (document.visibilityState === "visible") {
                refreshSummary();
                refreshActivity();
            }
        };

        document.addEventListener("visibilitychange", refreshWhenActive);

        return () => {
            clearInterval(timer);
            document.removeEventListener("visibilitychange", refreshWhenActive);
        };
    }, [refreshSummary, refreshActivity]);

    function changeBranch(value) {
        setBranch(value);
        setCurrency(value === "Dubai" ? "AED" : "INR");
    }

    function refreshDashboard() {
        summary.refresh();
        activity.refresh();
    }

    return (
        <Page
            title="Finance Dashboard"
            subtitle="Your business finances at a glance"
            action={
                <Button onClick={refreshDashboard} disabled={summary.loading}>
                    Refresh
                </Button>
            }
        >
            <Stack
                direction="row"
                sx={{
                    gap: 2,
                    mb: 3,
                    flexWrap: "wrap",
                }}
            >
                <TextField
                    select
                    label="Branch"
                    value={branch}
                    sx={{ minWidth: 180 }}
                    onChange={event => changeBranch(event.target.value)}
                >
                    <MenuItem value="All">
                        All branches
                    </MenuItem>
                    <MenuItem value="Dubai">
                        Dubai · Main branch
                    </MenuItem>
                    <MenuItem value="Turbhe">
                        Turbhe · Sub-branch
                    </MenuItem>
                </TextField>

                <TextField
                    select
                    label="Reporting currency"
                    value={currency}
                    sx={{ minWidth: 180 }}
                    onChange={event => setCurrency(event.target.value)}
                >
                    {["AED", "INR"].map(code => (
                        <MenuItem key={code} value={code}>
                            {code}
                        </MenuItem>
                    ))}
                </TextField>

                <TextField
                    size="small"
                    type="date"
                    label="From"
                    value={from}
                    onChange={event => setFrom(event.target.value)}
                    slotProps={{ inputLabel: { shrink: true } }}
                />

                <TextField
                    size="small"
                    type="date"
                    label="To"
                    value={to}
                    onChange={event => setTo(event.target.value)}
                    slotProps={{ inputLabel: { shrink: true } }}
                />

                <Button
                    component={Link}
                    to="/settings/exchange-rates"
                >
                    Exchange rates
                </Button>
            </Stack>

            {previewMode && summary.data && summary.data.dataMode !== "live" && (
                <Alert severity="info" sx={{ mb: 2 }}>
                    Preview data is active, so the dashboard shows placeholder
                    zero values. Live totals will appear after the frontend is
                    connected to a backend dashboard summary API.
                </Alert>
            )}

            <Feedback
                {...summary}
                loading={summary.loading && !summary.data}
                retry={summary.refresh}
            />

            {summary.data && summary.loading && (
                <Typography role="status" color="text.secondary" sx={{ mb: 2 }}>
                    Updating totals… Showing the last loaded figures.
                </Typography>
            )}

            {summary.data && summary.error && (
                <Typography color="text.secondary" sx={{ mb: 2 }}>
                    These are the last loaded figures. The latest refresh failed.
                </Typography>
            )}

            {summary.data?.rateWarning && (
                <Alert severity="warning" sx={{ mb: 2 }}>
                    {summary.data.rateWarning}
                </Alert>
            )}

            {summary.data && (
                <>
                    <Box
                        sx={{
                            display: "grid",
                            gridTemplateColumns: {
                                xs: "1fr",
                                sm: "1fr 1fr",
                                xl: "repeat(3,1fr)",
                            },
                            gap: 2,
                            mb: 3,
                        }}
                    >
                        {dashboardCards.map(([label, key]) => (
                            <Card key={key}>
                                <CardContent>
                                    <Typography color="text.secondary">
                                        {label}
                                    </Typography>

                                    <Typography
                                        variant="h5"
                                        fontWeight={700}
                                        sx={{ mt: 2 }}
                                    >
                                        {money(
                                            summary.data[key],
                                            summary.data.currency,
                                        )}
                                    </Typography>
                                </CardContent>
                            </Card>
                        ))}
                    </Box>

                    <Stack
                        direction="row"
                        spacing={2}
                        sx={{ mb: 3 }}
                    >
                        <Button
                            component={Link}
                            to="/sales/clients"
                        >
                            {summary.data.customers} active clients
                        </Button>

                        <Button
                            component={Link}
                            to="/purchases/vendors"
                        >
                            {summary.data.vendors} active vendors
                        </Button>
                    </Stack>
                </>
            )}

            {summary.data?.dataMode === "live" && (
                <Typography sx={{ mb: 2 }}>
                    Branch: {summary.data.branch} · Display:{" "}
                    {summary.data.currency} · 1 {summary.data.currency} = INR{" "}
                    {summary.data.rateToInr} · Rate date:{" "}
                    {summary.data.rateDate || "INR base currency"} · Source:{" "}
                    {summary.data.rateSource}
                    {summary.data.ratePublishedAt &&
                        ` · Updated: ${new Date(
                            summary.data.ratePublishedAt,
                        ).toLocaleString()} (daily)`}
                </Typography>
            )}

            {summary.data?.rateSource === "ExchangeRate-API" && (
                <Typography sx={{ mb: 2 }}>
                    <a
                        href="https://www.exchangerate-api.com"
                        target="_blank"
                        rel="noreferrer"
                    >
                        Rates By Exchange Rate API
                    </a>
                </Typography>
            )}

            <Typography
                color="text.secondary"
                variant="body2"
                sx={{ mb: 3 }}
            >
                Original transaction amounts remain unchanged. This overview
                converts recorded amounts into the selected reporting currency
                using the rate for the report end date. The date range applies
                to invoice sales, bills, recorded expenses and payments. Current
                receivables, payables and customer credits include all dates for
                the selected branch. This overview is a management comparison.
            </Typography>

            <Accordion sx={{ mb: 3 }}>
                <AccordionSummary
                    expandIcon={<ExpandMoreRoundedIcon />}
                >
                    <Typography fontWeight={600}>
                        How these dashboard figures are calculated
                    </Typography>
                </AccordionSummary>

                <AccordionDetails>
                    <Stack spacing={1.5}>
                        {dashboardCalculations.map(calculation => (
                            <Box key={calculation.label}>
                                <Typography fontWeight={600}>
                                    {calculation.label}
                                </Typography>

                                <Typography
                                    color="text.secondary"
                                    variant="body2"
                                >
                                    {calculation.formula}
                                </Typography>
                            </Box>
                        ))}
                    </Stack>
                </AccordionDetails>
            </Accordion>

            <Card>
                <CardContent>
                    <Typography
                        variant="h6"
                        fontWeight={700}
                        sx={{ mb: 2 }}
                    >
                        Recent activity
                    </Typography>

                    <Feedback
                        {...activity}
                        retry={activity.refresh}
                    />

                    {activity.data?.length === 0 && (
                        <Typography
                            color="text.secondary"
                            sx={{ py: 3 }}
                        >
                            No activity yet. Start by adding a client or
                            vendor.
                        </Typography>
                    )}

                    {activity.data?.map(item => (
                        <Stack
                            key={item.id}
                            direction="row"
                            sx={{
                                justifyContent: "space-between",
                                py: 2,
                                borderBottom: "1px solid",
                                borderColor: "divider",
                                gap: 2,
                            }}
                        >
                            <Box>
                                <Typography fontWeight={600}>
                                    {item.entityType} · {item.action}
                                </Typography>

                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                >
                                    {item.actor}
                                </Typography>
                            </Box>

                            <Typography
                                variant="body2"
                                color="text.secondary"
                            >
                                {new Date(item.at).toLocaleString("en-IN")}
                            </Typography>
                        </Stack>
                    ))}
                </CardContent>
            </Card>
        </Page>
    );
}
