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
import { Box as MuiLayoutBox, Typography as MuiText } from "@mui/material";

export default function AttendanceDetailsDialog({ open, onClose, attendance }) {
  if (!attendance) return null;

  return (
    <Dialog className="attendance-details-dialog" open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle className="attendance-details-title">
        Attendance Details
      </DialogTitle>

      <Divider />

      <DialogContent className="attendance-details-content">
        {/* Employee Information */}

        {/* Employee Information */}

        <MuiLayoutBox className="details-section" component="div">
          <MuiText component="h3" variant="h6">Employee Information</MuiText>

          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 6 }}>
              <MuiLayoutBox component="label">Employee ID</MuiLayoutBox>
              <MuiText component="p" variant="body1">{attendance.azureEmployeeId || "-"}</MuiText>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <MuiLayoutBox component="label">Employee Name</MuiLayoutBox>
              <MuiText component="p" variant="body1">{attendance.employeeName || "-"}</MuiText>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <MuiLayoutBox component="label">Employee Code</MuiLayoutBox>
              <MuiText component="p" variant="body1">{attendance.employeeCode || "-"}</MuiText>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <MuiLayoutBox component="label">Shift</MuiLayoutBox>
              <MuiText component="p" variant="body1">{attendance.shift || "-"}</MuiText>
            </Grid>
          </Grid>
        </MuiLayoutBox>

        <Divider sx={{ my: 3 }} />

        {/* Attendance Information */}

        {/* Attendance Information */}

        <MuiLayoutBox className="details-section" component="div">
          <MuiText component="h3" variant="h6">Attendance Information</MuiText>

          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 6 }}>
              <MuiLayoutBox component="label">Date</MuiLayoutBox>
              <MuiText component="p" variant="body1">{attendance.attendanceDate || "-"}</MuiText>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <MuiLayoutBox component="label">Status</MuiLayoutBox>

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

            <Grid size={{ xs: 12, md: 6 }}>
              <MuiLayoutBox component="label">Check In</MuiLayoutBox>
              <MuiText component="p" variant="body1">{attendance.checkIn || "-"}</MuiText>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <MuiLayoutBox component="label">Check Out</MuiLayoutBox>
              <MuiText component="p" variant="body1">{attendance.checkOut || "-"}</MuiText>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <MuiLayoutBox component="label">Total Hours</MuiLayoutBox>
              <MuiText component="p" variant="body1">{attendance.totalHours || "-"}</MuiText>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <MuiLayoutBox component="label">Remarks</MuiLayoutBox>
              <MuiText component="p" variant="body1">{attendance.remarks || "-"}</MuiText>
            </Grid>
          </Grid>
        </MuiLayoutBox>
      </DialogContent>

      <Divider />

      <DialogActions sx={{ padding: "16px 24px" }}>
        <Button variant="outlined" onClick={onClose}>
          Close
        </Button>

      </DialogActions>
    </Dialog>
  );
}
