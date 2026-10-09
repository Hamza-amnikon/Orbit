import { money, today, useLoad } from "./data";
import { useEffect, useState } from "react";
import { Alert, Box, Button, Card, CardContent, MenuItem, Stack, TextField, Typography } from "@mui/material";
import { Link } from "react-router-dom";
import { financeApi } from "../services/financeApi";
import { Feedback, Page } from "./shared";

export default function Dashboard() {
  const [from, setFrom] = useState(() => today().slice(0, 8) + "01"); const [to, setTo] = useState(today);
  const [branch, setBranch] = useState("All"); const [currency, setCurrency] = useState("INR");
  const summary = useLoad(() => financeApi.dashboard({ from, to, branch: branch === "All" ? "" : branch, currency }), [from, to, branch, currency]);
  const activity = useLoad(() => financeApi.activity(), []);
  useEffect(() => { const timer = setInterval(summary.refresh, 15 * 60 * 1000); return () => clearInterval(timer); }, [summary.refresh]);
  const cards = [["Revenue", "revenue"], ["Expenses", "expenses"], ["Payments received", "received"], ["Payments made", "paid"], ["Accounts receivable", "accountsReceivable"], ["Accounts payable", "accountsPayable"]];
  return <Page title="Finance Dashboard" subtitle="Your business finances at a glance" action={<Button onClick={() => { summary.refresh(); activity.refresh(); }}>Refresh</Button>}>
    <Stack direction="row" sx={{ gap: 2, mb: 3, flexWrap: "wrap" }}>
      <TextField select label="Branch" value={branch} sx={{ minWidth: 180 }} onChange={e => { setBranch(e.target.value); setCurrency(e.target.value === "Dubai" ? "AED" : "INR"); }}><MenuItem value="All">All branches</MenuItem><MenuItem value="Dubai">Dubai · Main branch</MenuItem><MenuItem value="Turbhe">Turbhe · Sub-branch</MenuItem></TextField>
      <TextField select label="Reporting currency" value={currency} sx={{ minWidth: 180 }} onChange={e => setCurrency(e.target.value)}>{["AED", "INR"].map(code => <MenuItem key={code} value={code}>{code}</MenuItem>)}</TextField>
      <TextField size="small" type="date" label="From" value={from} onChange={e => setFrom(e.target.value)} slotProps={{ inputLabel: { shrink: true } }} /><TextField size="small" type="date" label="To" value={to} onChange={e => setTo(e.target.value)} slotProps={{ inputLabel: { shrink: true } }} />
      <Button component={Link} to="/settings/exchange-rates">Exchange rates</Button>
    </Stack>
    <Feedback {...summary} retry={summary.refresh} />
    {summary.data?.rateWarning && <Alert severity="warning" sx={{ mb: 2 }}>{summary.data.rateWarning}</Alert>}
    {summary.data && <><Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", xl: "repeat(3,1fr)" }, gap: 2, mb: 3 }}>
      {cards.map(([label, key]) => <Card key={key}><CardContent><Typography color="text.secondary">{label}</Typography><Typography variant="h5" fontWeight={700} sx={{ mt: 2 }}>{money(summary.data[key], summary.data.currency)}</Typography></CardContent></Card>)}
    </Box><Stack direction="row" spacing={2} sx={{ mb: 3 }}><Button component={Link} to="/sales/customers">{summary.data.customers} active clients</Button><Button component={Link} to="/purchases/vendors">{summary.data.vendors} active vendors</Button></Stack></>}
    {summary.data && <Typography sx={{ mb: 2 }}>Branch: {summary.data.branch} · Display: {summary.data.currency} · 1 {summary.data.currency} = INR {summary.data.rateToInr} · Rate date: {summary.data.rateDate || "INR base currency"} · Source: {summary.data.rateSource}{summary.data.ratePublishedAt && ` · Updated: ${new Date(summary.data.ratePublishedAt).toLocaleString()} (daily)`}</Typography>}
    {summary.data?.rateSource === "ExchangeRate-API" && <Typography sx={{ mb: 2 }}><a href="https://www.exchangerate-api.com" target="_blank" rel="noreferrer">Rates By Exchange Rate API</a></Typography>}
    <Typography color="text.secondary" variant="body2" sx={{ mb: 3 }}>Original transaction amounts remain unchanged. This overview converts stored INR book values into the selected reporting currency. Receivables and payables show all outstanding balances; this is a management comparison, not a period-end foreign currency revaluation.</Typography>
    <Card><CardContent><Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>Recent activity</Typography><Feedback {...activity} retry={activity.refresh} />
      {activity.data?.length === 0 && <Typography color="text.secondary" sx={{ py: 3 }}>No activity yet. Start by adding a client or vendor.</Typography>}
      {activity.data?.map(x => <Stack key={x.id} direction="row" sx={{ justifyContent: "space-between", py: 2, borderBottom: "1px solid", borderColor: "divider", gap: 2 }}><Box><Typography fontWeight={600}>{x.entityType} · {x.action}</Typography><Typography variant="body2" color="text.secondary">{x.actor}</Typography></Box><Typography variant="body2" color="text.secondary">{new Date(x.at).toLocaleString("en-IN")}</Typography></Stack>)}
    </CardContent></Card>
  </Page>;
}
