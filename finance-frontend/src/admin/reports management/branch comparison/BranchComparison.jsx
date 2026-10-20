import { useEffect, useState } from "react";
import { Alert, Button, MenuItem, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography } from "@mui/material";
import { Link } from "react-router-dom";
import { financeApi } from "../../../services/financeApi";
import { money, today, useLoad } from "../../../live/data";
import { Feedback, Page } from "../../../live/shared";
export default function BranchComparison() {
  const [currency,setCurrency] = useState("INR"); const [from,setFrom] = useState(today().slice(0,7)+"-01"); const [to,setTo] = useState(today());
  const rows = useLoad(() => Promise.all(["Dubai","Turbhe",""].map(branch => financeApi.dashboard({ branch,currency,from,to }))),[currency,from,to]);
  useEffect(() => { const timer = setInterval(rows.refresh, 15 * 60 * 1000); return () => clearInterval(timer); }, [rows.refresh]);
  const metrics = [["Revenue","revenue"],["Expenses","expenses"],["Payment Received","received"],["Payment Made","paid"],["Receivable","accountsReceivable"],["Payable","accountsPayable"]];
  return <Page title="Branch Comparison" subtitle="Dubai main branch and Turbhe sub-branch in one reporting currency">
    <Stack direction="row" sx={{ gap: 2,mb: 3,flexWrap: "wrap" }}><TextField select label="Reporting currency" value={currency} onChange={e => setCurrency(e.target.value)} sx={{ minWidth: 180 }}>{["INR","AED"].map(code => <MenuItem key={code} value={code}>{code}</MenuItem>)}</TextField>{[["From",from,setFrom],["To",to,setTo]].map(([label,value,set]) => <TextField key={label} type="date" label={label} value={value} onChange={e => set(e.target.value)} slotProps={{ inputLabel: { shrink: true } }} />)}<Button component={Link} to="/settings/exchange-rates">Exchange rates</Button></Stack>
    <Feedback {...rows} retry={rows.refresh} />
    {rows.data?.[0].rateWarning && <Alert severity="warning" sx={{ mb: 2 }}>{rows.data[0].rateWarning}</Alert>}
    {rows.data && <Typography sx={{ mb: 2 }}>Source: {rows.data[0].rateSource}{rows.data[0].ratePublishedAt && ` · Provider updated: ${new Date(rows.data[0].ratePublishedAt).toLocaleString()} (daily)`}. {rows.data[0].rateSource === "ExchangeRate-API" && <a href="https://www.exchangerate-api.com" target="_blank" rel="noreferrer">Rates By Exchange Rate API</a>}</Typography>}
    {rows.data && <><Typography sx={{ mb: 2 }}>1 {currency} = INR {rows.data[0].rateToInr} · Rate date: {rows.data[0].rateDate || "INR base"}. Original invoices and expenses retain their currencies. This comparison uses saved book values.</Typography><TableContainer><Table><TableHead><TableRow><TableCell>Branch</TableCell>{metrics.map(([label]) => <TableCell key={label}>{label} ({currency})</TableCell>)}</TableRow></TableHead><TableBody>{rows.data.map(row => <TableRow key={row.branch}><TableCell>{row.branch === "All" ? "Combined" : row.branch}</TableCell>{metrics.map(([,key]) => <TableCell key={key}>{money(row[key],currency)}</TableCell>)}</TableRow>)}</TableBody></Table></TableContainer></>}
  </Page>;
}
