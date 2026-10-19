import { Box, Dialog, DialogContent, DialogTitle, DialogActions, Button, Typography } from "@mui/material";
import { money } from "../../live/data";

export default function ModuleDetails({ title, fields, record, onClose, actions, children }) {
  return <Dialog open fullWidth maxWidth="md" onClose={onClose}><DialogTitle>{title}</DialogTitle>
    <DialogContent dividers><Box className="admin-details-grid">{fields.map(field => <Box key={field.name}>
      <Typography color="text.secondary" variant="body2">{field.label}</Typography>
      <Typography sx={{ whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}>{field.currency ? money(Number(record[field.name]),record.currency || "INR") : field.options?.find(option => option.value === record[field.name])?.label ?? String(record[field.name] ?? "—")}</Typography>
    </Box>)}</Box>{children}</DialogContent><DialogActions sx={{ flexWrap: "wrap", gap: 1 }}>{actions}<Button onClick={onClose}>Close</Button></DialogActions></Dialog>;
}
