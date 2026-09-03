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
        <div className="delete-icon-wrapper">
          <Avatar>
            <WarningAmberRoundedIcon />
          </Avatar>
        </div>

        <Typography className="delete-heading">
          Delete Attendance Record?
        </Typography>

        <Typography className="delete-message">
          Are you sure you want to delete this attendance record? This action
          cannot be undone.
        </Typography>

        <div className="delete-card">
          <h4>Attendance Information</h4>

          <div className="delete-row">
            <label>Employee</label>

            <span>{attendance.employeeName || "-"}</span>
          </div>

          <div className="delete-row">
            <label>Employee Code</label>

            <span>{attendance.employeeCode || "-"}</span>
          </div>

          <div className="delete-row">
            <label>Attendance Date</label>

            <span>
              {attendance.attendanceDate
                ? new Date(attendance.attendanceDate).toLocaleDateString()
                : "-"}
            </span>
          </div>

          <div className="delete-row">
            <label>Shift</label>

            <span>{attendance.shift || "-"}</span>
          </div>

          <div className="delete-row">
            <label>Check In</label>

            <span>{attendance.checkIn || "-"}</span>
          </div>

          <div className="delete-row">
            <label>Check Out</label>

            <span>{attendance.checkOut || "-"}</span>
          </div>

          <div className="delete-row">
            <label>Status</label>

            <span>{attendance.status || "-"}</span>
          </div>
        </div>

        <div className="delete-warning">
          <strong>Warning:</strong> Deleting this attendance record is permanent
          and cannot be recovered.
        </div>
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
