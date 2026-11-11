import { Box, MenuItem, TextField } from "@mui/material";

export default function LineDiscountFields({
    type = "Fixed",
    value,
    enabled,
    disabled,
    currency,
    onTypeChange,
    onValueChange
})
{
    return (
        <Box sx={{
            gridColumn: { xs: "1 / -1", sm: "span 2" },
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))" },
            gap: 2
        }}>
            <TextField
                select
                label="Discount type"
                value={type}
                disabled={disabled || !enabled}
                onChange={event => onTypeChange(event.target.value)}
                fullWidth
            >
                <MenuItem value="Fixed">Fixed amount</MenuItem>
                <MenuItem value="Percentage">Percentage (%)</MenuItem>
            </TextField>
            <TextField
                label={type === "Percentage" ? "Discount (%)" : `Discount amount${currency ? ` (${currency})` : ""}`}
                type="number"
                value={value}
                disabled={disabled || !enabled}
                required={enabled}
                onChange={event => onValueChange(event.target.value)}
                helperText="Applied to this line before tax"
                slotProps={{
                    htmlInput: {
                        min: 0,
                        max: type === "Percentage" ? 100 : undefined,
                        step: "0.0001"
                    }
                }}
                fullWidth
            />
        </Box>
    );
}
