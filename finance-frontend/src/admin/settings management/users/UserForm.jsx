import { Box, MenuItem, TextField } from "@mui/material";
export default function UserForm({ value, onChange }) {
  return <Box className="admin-form-grid">{[["name", "Full name", "text"], ["email", "Email", "email"], ...(!value.id ? [["password", "Initial password", "password"]] : [])].map(([name, label, type]) =>
    <TextField key={name} label={label} type={type} required value={value[name]} autoComplete={type === "password" ? "new-password" : "off"}
      onChange={event => onChange({ ...value, [name]: event.target.value })} helperText={type === "password" ? "At least 12 characters. This creates a real database user." : ""}
      slotProps={{ htmlInput: { minLength: type === "password" ? 12 : 1, maxLength: type === "password" ? 128 : name === "email" ? 254 : 150 } }} />)}
    <TextField select label="Role" value={value.role} onChange={event => onChange({ ...value, role: event.target.value })}>{["Admin", "Finance", "Viewer"].map(role => <MenuItem key={role} value={role}>{role}</MenuItem>)}</TextField>
    {value.id && <TextField select label="Account status" value={value.isActive ? "active" : "disabled"} onChange={event => onChange({ ...value, isActive: event.target.value === "active" })}><MenuItem value="active">Active</MenuItem><MenuItem value="disabled">Disabled</MenuItem></TextField>}
  </Box>;
}
