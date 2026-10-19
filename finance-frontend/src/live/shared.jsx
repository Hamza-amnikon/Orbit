import { useId } from "react";
import { Alert, Box, Button, Card, CardContent, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, InputAdornment, Pagination, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography } from "@mui/material";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import SearchOffRoundedIcon from "@mui/icons-material/SearchOffRounded";

export function Page({ title, subtitle, action, children }) {
  return <Box className="live-page"><Stack className="finance-page-header" direction="row" sx={{ justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 2, mb: 3 }}>
    <Box sx={{ minWidth: 0 }}><Typography component="h1" variant="h4" fontWeight={700}>{title}</Typography><Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>{subtitle}</Typography></Box>
    {action && <Box className="finance-page-actions">{action}</Box>}
  </Stack>{children}</Box>;
}
export function Feedback({ loading, error, retry }) {
  return <>{loading && <Box role="status" sx={{ p: 4, textAlign: "center" }}><CircularProgress size={28} aria-label="Loading records" /></Box>}
    {error && <Alert severity="error" action={retry && <Button color="inherit" onClick={retry}>Retry</Button>} sx={{ mb: 2 }}>{error}</Alert>}</>;
}
export function Records({ columns, rows, total, page, setPage, loading, error, refresh, search, setSearch, extra }) {
  return <Card className="finance-records"><CardContent>
    <Stack className="finance-records-toolbar" sx={{ mb: 3, gap: 2 }}>
      <Stack className="finance-records-search-row" direction="row" sx={{ justifyContent: "space-between", alignItems: "center", gap: 2 }}>
      <TextField size="small" label="Search records" placeholder="Search records" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} sx={{ width: { xs: "100%", sm: 300 } }}
        slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchRoundedIcon fontSize="small" /></InputAdornment> } }} />
      <Button onClick={refresh} disabled={loading}>Refresh</Button>
      </Stack>
      {extra && <Box className="finance-records-filters">{extra}</Box>}
    </Stack>
    <Feedback loading={loading} error={error} retry={refresh} />
    {!loading && !error && <>
      <TableContainer tabIndex={0} role="region" aria-label="Scrollable records table"><Table aria-label="Records"><TableHead><TableRow>{columns.map(col => <TableCell key={col.label} scope="col">{col.label}</TableCell>)}</TableRow></TableHead>
        <TableBody>{rows.map(row => <TableRow key={row.id}>{columns.map(col => <TableCell key={col.label}>{col.render(row)}</TableCell>)}</TableRow>)}</TableBody>
      </Table></TableContainer>
      {!rows.length && <Box className="finance-records-empty" sx={{ textAlign: "center", py: 6 }}><SearchOffRoundedIcon aria-hidden="true" sx={{ fontSize: 36, mb: 1, color: "text.secondary" }} /><Typography fontWeight={600}>No records found</Typography><Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>Try another search or change the filters.</Typography></Box>}
      <Stack className="finance-records-pagination" direction="row" sx={{ justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 2, mt: 2 }}><Typography variant="body2" color="text.secondary" aria-live="polite">{total} records</Typography><Pagination count={Math.max(1, Math.ceil(total / 25))} page={page} onChange={(_, value) => setPage(value)} /></Stack>
    </>}
  </CardContent></Card>;
}
export function Editor({ title, onClose, onSubmit, busy, disabled, error, children }) {
  const titleId = useId();
  return <Dialog open fullWidth maxWidth="md" onClose={busy ? undefined : onClose} aria-labelledby={titleId}>
    <Box component="form" className="finance-editor" onSubmit={onSubmit}>
      <DialogTitle id={titleId} component="h2">{title}</DialogTitle><DialogContent dividers>{error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}{children}</DialogContent>
      <DialogActions sx={{ p: 2 }}><Button onClick={onClose} disabled={busy}>Cancel</Button><Button type="submit" variant="contained" disabled={busy || disabled}>{busy ? "Saving..." : "Save"}</Button></DialogActions>
    </Box>
  </Dialog>;
}
export function Fields({ fields, value, setValue }) {
  return <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2, py: 1 }}>
    {fields.map(([name, label, required = false, type = "text", maxLength]) => <TextField key={name} label={label} required={required} type={type} value={value[name] ?? ""}
      onChange={e => setValue(current => ({ ...current, [name]: e.target.value }))} slotProps={{ htmlInput: { ...(maxLength ? { maxLength } : {}) }, inputLabel: type === "date" ? { shrink: true } : {} }} />)}
  </Box>;
}
