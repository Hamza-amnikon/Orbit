import "./AttendanceDetailsDialog.css";

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  Chip,
  Divider,
} from "@mui/material";

export default function AttendanceDetailsDialog({ open, onClose, attendance }) {
  if (!attendance) return null;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle className="attendance-details-title">
        Attendance Details
      </DialogTitle>

      <Divider />

      <DialogContent className="attendance-details-content">
        {/* Employee Information */}

        {/* Employee Information */}

        <div className="details-section">
          <h3>Employee Information</h3>

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <label>Employee ID</label>
              <p>{attendance.azureEmployeeId || "-"}</p>
            </Grid>

            <Grid item xs={12} md={6}>
              <label>Employee Name</label>
              <p>{attendance.employeeName || "-"}</p>
            </Grid>

            <Grid item xs={12} md={6}>
              <label>Employee Code</label>
              <p>{attendance.employeeCode || "-"}</p>
            </Grid>

            <Grid item xs={12} md={6}>
              <label>Shift</label>
              <p>{attendance.shift || "-"}</p>
            </Grid>
          </Grid>
        </div>

        <Divider sx={{ my: 3 }} />

        {/* Attendance Information */}

        {/* Attendance Information */}

        <div className="details-section">
          <h3>Attendance Information</h3>

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <label>Date</label>
              <p>{attendance.attendanceDate || "-"}</p>
            </Grid>

            <Grid item xs={12} md={6}>
              <label>Status</label>

              <br />

              <Chip
                label={attendance.status}
                color={
                  attendance.status === "Present"
                    ? "success"
                    : attendance.status === "Late"
                      ? "warning"
                      : attendance.status === "Absent"
                        ? "error"
                        : "secondary"
                }
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <label>Check In</label>
              <p>{attendance.checkIn || "-"}</p>
            </Grid>

            <Grid item xs={12} md={6}>
              <label>Check Out</label>
              <p>{attendance.checkOut || "-"}</p>
            </Grid>

            <Grid item xs={12} md={6}>
              <label>Total Hours</label>
              <p>{attendance.totalHours || "-"}</p>
            </Grid>

            <Grid item xs={12} md={6}>
              <label>Remarks</label>
              <p>{attendance.remarks || "-"}</p>
            </Grid>
          </Grid>
        </div>
      </DialogContent>

      <Divider />

      <DialogActions sx={{ padding: "16px 24px" }}>
        <Button variant="outlined" onClick={onClose}>
          Close
        </Button>

        <Button variant="contained">Edit Attendance</Button>
      </DialogActions>
    </Dialog>
  );
}
