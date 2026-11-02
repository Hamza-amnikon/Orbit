import { useEffect } from "react";
import { Alert, Button, Card, CardContent, Chip, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from "@mui/material";
import { financeApi } from "../../../services/financeApi";
import { useLoad } from "../../../live/data";
import { Feedback, Page } from "../../../live/shared";

const timestamp = value => value ? new Date(value).toLocaleString("en-IN") : "Not checked yet";
const rateText = value => value == null ? "Unavailable" : new Intl.NumberFormat("en-IN", { maximumFractionDigits: 8 }).format(value);

export default function ExchangeRates() {
  const list = useLoad(signal => financeApi.exchangeRates(signal), [], { keepPreviousData: true });
  const refresh = list.refresh;
  useEffect(() => {
    const timer = setInterval(refresh, 60 * 1000);
    return () => clearInterval(timer);
  }, [refresh]);
  const data = list.data;
  const healthy = data?.enabled && data.status === "Succeeded";

  return <Page title="Exchange Rates" subtitle="Daily reference rates · INR per one unit of currency · Read only"
    action={<Button onClick={refresh} disabled={list.loading}>Refresh view</Button>}>
    <Alert severity="info" sx={{ mb: 2 }}>
      The daily agent runs inside ExchangeRateService.API. It checks once daily on the configured schedule, catches up after restart, and retries failed checks.
      The backend must be running. Refresh view reloads saved results; it does not change rates.
    </Alert>
    <Feedback {...list} loading={list.loading && !data} retry={refresh} />
    {data && <>
      <Card sx={{ mb: 3 }}><CardContent><Stack direction="row" sx={{ flexWrap: "wrap", gap: 3, alignItems: "center" }}>
        <Chip label={!data.enabled ? "Agent disabled" : data.status === "Succeeded" ? "Check succeeded" : data.status}
          color={healthy ? "success" : "warning"} />
        <Typography variant="body2">Last check: {timestamp(data.lastCheckedAtUtc)}</Typography>
        {data.enabled && <Typography variant="body2">Next scheduled check / retry: {timestamp(data.nextCheckAtUtc)}</Typography>}
      </Stack></CardContent></Card>
      {(!healthy || data.warning) && <Alert severity="warning" sx={{ mb: 2 }}>
        {data.warning || "A successful daily check is pending. Previously saved rates remain visible with their original dates."}
      </Alert>}
      {list.error && <Typography sx={{ mb: 2 }}>Showing the last loaded results; the latest refresh failed.</Typography>}
      <Card><CardContent><TableContainer tabIndex={0} role="region" aria-label="Daily exchange rates">
        <Table aria-label="Saved exchange rates"><TableHead><TableRow>
          {["Currency", "INR per unit", "Rate date", "Source", "Last successful check", "Check status"].map(label => <TableCell key={label}>{label}</TableCell>)}
        </TableRow></TableHead><TableBody>{data.rates.map(row => <TableRow key={row.currency}>
          <TableCell>{row.currency} → INR</TableCell><TableCell>{rateText(row.rateToInr)}</TableCell>
          <TableCell>{row.rateDate || "—"}</TableCell><TableCell>{row.source || "—"}</TableCell>
          <TableCell>{timestamp(row.lastSuccessfulCheckAtUtc)}</TableCell>
          <TableCell><Chip size="small" label={row.rateToInr == null ? "Unavailable" : row.isCurrentCheck ? "Checked" : "Previous saved rate"}
            color={row.isCurrentCheck ? "success" : "warning"} /></TableCell>
        </TableRow>)}</TableBody></Table>
      </TableContainer>{data.rates.length === 0 && <Typography sx={{ py: 3 }}>No active currencies are configured.</Typography>}</CardContent></Card>
    </>}
    <Typography variant="body2" color="text.secondary" sx={{ mt: 3 }}>
      Reference rates are provided by <a href="https://frankfurter.dev/" target="_blank" rel="noreferrer">Frankfurter</a>.
      A successful check may return an older published rate, including on non-publication days. Check the rate date.
      Saved transaction rates stay unchanged. Historical dates before monitoring began use the shared provider lookup when needed.
    </Typography>
  </Page>;
}
