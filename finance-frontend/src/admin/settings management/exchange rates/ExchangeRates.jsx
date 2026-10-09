import { useEffect } from "react";
import { Alert, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@mui/material";
import { financeApi } from "../../../services/financeApi";
import { useLoad } from "../../../live/data";
import { Feedback, Page } from "../../../live/shared";
export default function ExchangeRates() {
  const list = useLoad(() => financeApi.currencies(), []);
  const refresh = list.refresh;
  useEffect(() => { const timer = setInterval(refresh, 15 * 60 * 1000); return () => clearInterval(timer); }, [refresh]);
  return <Page title="Exchange Rates" subtitle="Latest daily reference rates · INR per one unit of foreign currency" action={<Button onClick={list.refresh} disabled={list.loading}>Refresh rates</Button>}>
    <Alert severity={list.data?.live.available ? "success" : "warning"} sx={{ mb: 2 }}>
      {list.data?.live.available ? `Provider updated: ${new Date(list.data.live.publishedAt).toLocaleString()}. Next update: ${new Date(list.data.live.nextUpdateAt).toLocaleString()}. Rates update daily; these are reference rates, not bank settlement quotes.` : "Live rates are unavailable or loading. Try Refresh rates again later."}
      {" "}<a href="https://www.exchangerate-api.com" target="_blank" rel="noreferrer">Rates By Exchange Rate API</a>
    </Alert>
    <Alert severity="info" sx={{ mb: 2 }}>New invoices can use the latest rate. Issued invoices keep their booking rate. Current AED reports use the live reference rate. Historical AED reports require a rate for that date; INR reports remain available. INR always equals 1.</Alert>
    <Feedback {...list} retry={list.refresh} /><TableContainer><Table><TableHead><TableRow>{["Currency","Date","INR per unit","Source"].map(label => <TableCell key={label}>{label}</TableCell>)}</TableRow></TableHead><TableBody>{list.data?.rates.map(row => <TableRow key={row.id}><TableCell>{row.currency}</TableCell><TableCell>{row.date}</TableCell><TableCell>{row.rateToInr}</TableCell><TableCell>{row.source}</TableCell></TableRow>)}</TableBody></Table></TableContainer>
  </Page>;
}
