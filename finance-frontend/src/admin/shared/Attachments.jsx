import { useState } from "react";
import { Box, Button, List, ListItem, ListItemText, Typography } from "@mui/material";
import { useLoad } from "../../live/data";
import { Feedback } from "../../live/shared";
import { financeApi } from "../../services/financeApi";
export default function Attachments({ source, record, canUpload, onUpdated }) {
  const api = financeApi.attachments(source, record.id); const list = useLoad(() => api.list(), [source, record.id]);
  const [error, setError] = useState(""); const [busy, setBusy] = useState(false);
  async function upload(event) {
    const file = event.target.files?.[0]; if (!file) return; setError(""); setBusy(true);
    try { if (file.size > 5 * 1024 * 1024) throw new Error("Receipt must be no larger than 5 MB."); const data = new FormData(); data.append("file", file); data.append("rowVersion", record.rowVersion); const result = await api.upload(data); onUpdated?.(result.rowVersion); list.refresh(); }
    catch (failure) { setError(failure.message); } finally { setBusy(false); event.target.value = ""; }
  }
  async function download(row) { try { await api.download(row); } catch (failure) { setError(failure.message); } }
  return <Box sx={{ mt: 3 }}><Typography fontWeight={700}>Attachments</Typography><Feedback loading={list.loading} error={error || list.error} retry={list.refresh} />
    <List>{(list.data || []).map(row => <ListItem key={row.id} secondaryAction={<Button onClick={() => download(row)}>Download</Button>}><ListItemText primary={row.fileName} secondary={`${Math.ceil(row.size / 1024)} KB`} /></ListItem>)}</List>
    {!list.loading && !list.data?.length && <Typography color="text.secondary" sx={{ mb: 2 }}>No attachments yet.</Typography>}
    {canUpload && <Button component="label" disabled={busy || list.data?.length >= 10} variant="outlined">{busy ? "Uploading…" : "Upload receipt"}<input hidden type="file" accept="application/pdf,image/png,image/jpeg" onChange={upload} /></Button>}
  </Box>;
}
