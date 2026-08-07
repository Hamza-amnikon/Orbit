import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Button,
  Divider,
  Box,
} from "@mui/material";

import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";

export default function DeleteShiftAssignmentDialog({
  open,

  employee,

  onClose,

  onDelete,
}) {
  if (!employee) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          color: "#dc2626",
          fontWeight: 700,
        }}
      >
        <WarningAmberIcon />
        Delete Shift Assignment
      </DialogTitle>

      <Divider />

      <DialogContent sx={{ mt: 2 }}>
        <Typography variant="body1" sx={{ mb: 3 }}>
          Are you sure you want to remove this shift assignment?
        </Typography>

        <Box
          sx={{
            background: "#f8fafc",
            borderRadius: 2,
            p: 2,
            border: "1px solid #e2e8f0",
          }}
        >
          <Typography>
            <strong>Employee :</strong> {employee.employeeName}
          </Typography>

          <Typography sx={{ mt: 1 }}>
            <strong>Employee ID :</strong> {employee.employeeCode}
          </Typography>

          <Typography sx={{ mt: 1 }}>
            <strong>Department :</strong> {employee.department}
          </Typography>

          <Typography sx={{ mt: 1 }}>
            <strong>Current Shift :</strong> {employee.shift}
          </Typography>

          <Typography sx={{ mt: 1 }}>
            <strong>Shift Time :</strong> {employee.shiftTime}
          </Typography>
        </Box>

        <Typography
          color="error"
          sx={{
            mt: 3,
            fontWeight: 600,
          }}
        >
          This action cannot be undone.
        </Typography>
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button variant="outlined" onClick={onClose}>
          Cancel
        </Button>

        <Button
          variant="contained"
          color="error"
          startIcon={<DeleteForeverIcon />}
          onClick={() => {
            if (onDelete) {
              onDelete(employee);
            }
          }}
        >
          Delete Assignment
        </Button>
      </DialogActions>
    </Dialog>
  );
}
