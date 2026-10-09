import { Box, MenuItem, TextField } from "@mui/material";

export default function ModuleForm({ fields, value, onChange, disabled = false }) {
  return <Box className="admin-form-grid">{fields.map(field => <TextField key={field.name}
    fullWidth label={field.label} required={field.required} disabled={disabled || field.disabled}
    type={field.options ? "text" : field.type || "text"} select={!!field.options}
    multiline={field.type === "textarea"} minRows={field.type === "textarea" ? 3 : undefined}
    value={field.type === "boolean" ? String(value[field.name] ?? true) : value[field.name] ?? ""} onChange={event => onChange({ ...value, [field.name]: field.type === "boolean" ? event.target.value === true || event.target.value === "true" : event.target.value })}
    slotProps={{ inputLabel: field.type === "date" ? { shrink: true } : {}, htmlInput: {
      maxLength: field.maxLength || 500, ...(field.type === "number" ? { min: field.min ?? 0, step: field.step || "0.01" } : {}),
    } }}>
    {field.options?.map(option => <MenuItem key={String(option.value ?? option)} value={field.type === "boolean" ? String(option.value) : option.value ?? option}>{option.label ?? option}</MenuItem>)}
  </TextField>)}</Box>;
}
