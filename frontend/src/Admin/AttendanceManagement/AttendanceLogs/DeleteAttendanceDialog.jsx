import "./AttendanceDetailsDialog.css";

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Avatar,
} from "@mui/material";

import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import { Box as MuiLayoutBox, Typography as MuiText } from "@mui/material";

export default function DeleteAttendanceDialog({
  open,

  onClose,

  onDelete,

  attendance,
}) {
  if (!attendance) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle className="delete-dialog-title">
        Delete Attendance
      </DialogTitle>

      <DialogContent className="delete-dialog-content">
        <MuiLayoutBox className="delete-icon-wrapper" component="div">
          <Avatar>
            <WarningAmberRoundedIcon />
          </Avatar>
        </MuiLayoutBox>

        <Typography className="delete-heading">
          Delete Attendance Record?
        </Typography>

        <Typography className="delete-message">
          Are you sure you want to delete this attendance record? This action
          cannot be undone.
        </Typography>

        <MuiLayoutBox className="delete-card" component="div">
          <MuiText component="h4" variant="subtitle1">Attendance Information</MuiText>

          <MuiLayoutBox className="delete-row" component="div">
            <MuiLayoutBox component="label">Employee</MuiLayoutBox>

            <MuiText component="span" variant="inherit">{attendance.employeeName || "-"}</MuiText>
          </MuiLayoutBox>

          <MuiLayoutBox className="delete-row" component="div">
            <MuiLayoutBox component="label">Employee Code</MuiLayoutBox>

            <MuiText component="span" variant="inherit">{attendance.employeeCode || "-"}</MuiText>
          </MuiLayoutBox>

          <MuiLayoutBox className="delete-row" component="div">
            <MuiLayoutBox component="label">Attendance Date</MuiLayoutBox>

            <MuiText component="span" variant="inherit">
              {attendance.attendanceDate
                ? new Date(attendance.attendanceDate).toLocaleDateString()
                : "-"}
            </MuiText>
          </MuiLayoutBox>

          <MuiLayoutBox className="delete-row" component="div">
            <MuiLayoutBox component="label">Shift</MuiLayoutBox>

            <MuiText component="span" variant="inherit">{attendance.shift || "-"}</MuiText>
          </MuiLayoutBox>

          <MuiLayoutBox className="delete-row" component="div">
            <MuiLayoutBox component="label">Check In</MuiLayoutBox>

            <MuiText component="span" variant="inherit">{attendance.checkIn || "-"}</MuiText>
          </MuiLayoutBox>

          <MuiLayoutBox className="delete-row" component="div">
            <MuiLayoutBox component="label">Check Out</MuiLayoutBox>

            <MuiText component="span" variant="inherit">{attendance.checkOut || "-"}</MuiText>
          </MuiLayoutBox>

          <MuiLayoutBox className="delete-row" component="div">
            <MuiLayoutBox component="label">Status</MuiLayoutBox>

            <MuiText component="span" variant="inherit">{attendance.status || "-"}</MuiText>
          </MuiLayoutBox>
        </MuiLayoutBox>

        <MuiLayoutBox className="delete-warning" component="div">
          <MuiText component="strong" variant="inherit">Warning:</MuiText> Deleting this attendance record is permanent
          and cannot be recovered.
        </MuiLayoutBox>
      </DialogContent>

      <DialogActions>
        <Button variant="outlined" onClick={onClose}>
          Cancel
        </Button>

        <Button variant="contained" color="error" onClick={onDelete}>
          Delete Attendance
        </Button>
      </DialogActions>
    </Dialog>
  );
}
