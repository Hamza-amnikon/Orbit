import { Alert, Box, Button, Card, CardContent, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, Pagination, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography } from "@mui/material";

export function Page({ title, subtitle, action, children }) {
  return <Box className="live-page"><Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 2, mb: 3 }}>
    <Box><Typography variant="h4" fontWeight={700}>{title}</Typography><Typography color="text.secondary" sx={{ mt: 1 }}>{subtitle}</Typography></Box>{action}
  </Stack>{children}</Box>;
}
export function Feedback({ loading, error, retry }) {
  return <>{loading && <Box sx={{ p: 4, textAlign: "center" }}><CircularProgress size={28} aria-label="Loading records" /></Box>}
    {error && <Alert severity="error" action={retry && <Button color="inherit" onClick={retry}>Retry</Button>} sx={{ mb: 2 }}>{error}</Alert>}</>;
}
export function Records({ columns, rows, total, page, setPage, loading, error, refresh, search, setSearch, extra }) {
  return <Card><CardContent>
    <Stack direction="row" spacing={2} sx={{ mb: 3, flexWrap: "wrap", gap: 1 }}>
      <TextField size="small" label="Search records" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} sx={{ width: { xs: "100%", sm: 300 } }} />{extra}
      <Button onClick={refresh}>Refresh</Button>
    </Stack>
    <Feedback loading={loading} error={error} retry={refresh} />
    {!loading && !error && <>
      <TableContainer><Table><TableHead><TableRow>{columns.map(col => <TableCell key={col.label}>{col.label}</TableCell>)}</TableRow></TableHead>
        <TableBody>{rows.map(row => <TableRow key={row.id}>{columns.map(col => <TableCell key={col.label}>{col.render(row)}</TableCell>)}</TableRow>)}</TableBody>
      </Table></TableContainer>
      {!rows.length && <Box sx={{ textAlign: "center", py: 6 }}><Typography fontWeight={600}>No records found</Typography><Typography color="text.secondary">Add your first record or change your search.</Typography></Box>}
      <Stack direction="row" sx={{ justifyContent: "space-between", mt: 2 }}><Typography color="text.secondary">{total} records</Typography><Pagination count={Math.max(1, Math.ceil(total / 25))} page={page} onChange={(_, value) => setPage(value)} /></Stack>
    </>}
  </CardContent></Card>;
}
export function Editor({ title, onClose, onSubmit, busy, disabled, error, children }) {
  return <Dialog open fullWidth maxWidth="md" onClose={busy ? undefined : onClose}>
    <Box component="form" onSubmit={onSubmit}>
      <DialogTitle>{title}</DialogTitle><DialogContent dividers>{error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}{children}</DialogContent>
      <DialogActions sx={{ p: 2 }}><Button onClick={onClose} disabled={busy}>Cancel</Button><Button type="submit" variant="contained" disabled={busy || disabled}>{busy ? "Saving…" : "Save"}</Button></DialogActions>
    </Box>
  </Dialog>;
}
export function Fields({ fields, value, setValue }) {
  return <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2, py: 1 }}>
    {fields.map(([name, label, required = false, type = "text", maxLength]) => <TextField key={name} label={label} required={required} type={type} value={value[name] ?? ""}
      onChange={e => setValue(current => ({ ...current, [name]: e.target.value }))} slotProps={{ htmlInput: { ...(maxLength ? { maxLength } : {}) }, inputLabel: type === "date" ? { shrink: true } : {} }} />)}
  </Box>;
}
