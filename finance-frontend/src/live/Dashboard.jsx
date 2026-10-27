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
    ["Revenue", "revenue"],
    ["Expenses", "expenses"],
    ["Payments received", "received"],
    ["Payments made", "paid"],
    ["Accounts receivable", "accountsReceivable"],
    ["Accounts payable", "accountsPayable"],
];

const dashboardCalculations = [
    {
        label: "Revenue",
        formula: "Total of issued invoices dated in the selected period, branch and reporting currency.",
    },
    {
        label: "Expenses",
        formula: "Recorded expenses plus issued purchase bills dated in the selected period and branch, converted to the reporting currency.",
    },
    {
        label: "Payments received",
        formula: "Total of recorded customer payments dated in the selected period.",
    },
    {
        label: "Payments made",
        formula: "Total of recorded supplier payments dated in the selected period.",
    },
    {
        label: "Accounts receivable",
        formula: "Outstanding balances on issued invoices: invoice total minus received payments and applied credit notes.",
    },
    {
        label: "Accounts payable",
        formula: "Outstanding balances on issued bills: bill total minus recorded payments and applied vendor credits.",
    },
];

export default function Dashboard() {
    const [from, setFrom] = useState(() => today().slice(0, 8) + "01");
    const [to, setTo] = useState(today);
    const [branch, setBranch] = useState("All");
    const [currency, setCurrency] = useState("INR");

    const summary = useLoad(
        () => financeApi.dashboard({
            from,
            to,
            branch: branch === "All" ? "" : branch,
            currency,
        }),
        [from, to, branch, currency],
    );

    const activity = useLoad(
        () => financeApi.activity(),
        [],
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
                <Button onClick={refreshDashboard}>
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

            {previewMode && summary.data?.dataMode !== "live" && (
                <Alert severity="info" sx={{ mb: 2 }}>
                    Preview data is active, so the dashboard shows placeholder
                    zero values. Live totals will appear after the frontend is
                    connected to a backend dashboard summary API.
                </Alert>
            )}

            <Feedback
                {...summary}
                retry={summary.refresh}
            />

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
                using the rate for the report end date. Receivables and payables show all outstanding
                balances; this is a management comparison, not a period-end
                foreign currency revaluation.
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
