import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  TextField,
  Button,
  MenuItem,
  Typography,
  Alert,
} from "@mui/material";

import { useEffect, useState } from "react";

import "./AddAttendanceDialog.css";

import AttendanceService from "../services/AttendanceService";
import { formatWorkedHours, getAttendanceStatusForDuration } from "./attendanceRules";

export default function EditAttendanceDialog({
  open,
  onClose,
  attendance,
  onUpdated,
}) {

  const initialForm = {

    attendanceDate: "",

    shift: "General",

    status: "Present",

    checkIn: "",

    checkOut: "",

    totalHours: "",

    remarks: "",

  };

  const [form, setForm] = useState(initialForm);

  const [errors, setErrors] = useState({});

  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  useEffect(() => {

    if (attendance) {

      setForm({

        attendanceDate: attendance.attendanceDate || "",

        shift: attendance.shift || "General",

        status: attendance.status || "Present",

        checkIn: attendance.checkIn
          ? attendance.checkIn.substring(0, 5)
          : "",

        checkOut: attendance.checkOut
          ? attendance.checkOut.substring(0, 5)
          : "",

        totalHours: attendance.totalHours || "",

        remarks: attendance.remarks || "",

      });

      setErrors({});
      setSaveError("");

    } else {

      setForm(initialForm);

      setErrors({});
      setSaveError("");

    }

  }, [attendance]);



  const calculateTotalHours = (
    checkIn,
    checkOut,
    attendanceDate
  ) => {

    if (!checkIn || !checkOut || !attendanceDate)
      return "";

    return formatWorkedHours(checkIn, checkOut);

  };
  
  const handleChange = (e) => {

  const { name, value } = e.target;

  const updatedForm = {

    ...form,

    [name]: value,

  };

  // Clear timings for statuses that don't require attendance
  if (
    name === "status" &&
    (
      value === "Absent" ||
      value === "Leave" ||
      value === "WFH"
    )
  ) {

    updatedForm.checkIn = "";

    updatedForm.checkOut = "";

    updatedForm.totalHours = "";

  }
  else {

    updatedForm.totalHours = calculateTotalHours(
      updatedForm.checkIn,
      updatedForm.checkOut,
      updatedForm.attendanceDate
    );

    if (updatedForm.checkIn && updatedForm.checkOut) {
      updatedForm.status = getAttendanceStatusForDuration(
        updatedForm.status,
        updatedForm.checkIn,
        updatedForm.checkOut
      );
    }

  }

  setForm(updatedForm);

  setErrors((prev) => ({
    ...prev,
    [name]: "",
  }));

};



const validate = () => {

  let newErrors = {};

  if (!form.attendanceDate) {
    newErrors.attendanceDate =
      "Attendance Date is required";
  }

  if (!form.shift) {
    newErrors.shift =
      "Shift is required";
  }

  if (!form.status) {
    newErrors.status =
      "Status is required";
  }

  if (form.checkIn && form.checkOut) {
    const [hours, minutes] = form.totalHours.split(":").map(Number);
    const diffHours = hours + minutes / 60;

    if (diffHours > 24) {

      newErrors.checkOut =
        "Shift duration cannot exceed 24 hours.";

    }
  }

  if (form.remarks.length > 500) {

    newErrors.remarks =
      "Maximum 500 characters allowed";

  }

  setErrors(newErrors);

  return Object.keys(newErrors).length === 0;

};



const handleSubmit = async () => {

  if (!validate())
    return;

  try {

    setSaving(true);
    setSaveError("");

    const payload = {

      attendanceDate: form.attendanceDate,

      shift: form.shift,

      checkIn: form.checkIn
        ? form.checkIn + ":00"
        : null,

      checkOut: form.checkOut
        ? form.checkOut + ":00"
        : null,

      totalHours: form.totalHours,

      status: form.status,

      remarks: form.remarks,

      updatedBy: "Admin",

    };

    console.log("Update Payload", payload);

    await AttendanceService.update(
      attendance.attendanceId,
      payload,
      attendance
    );

    if (onUpdated) {
      onUpdated();
    }

    onClose();

  }
  catch (error) {

    console.error("Update Error", error);
    setSaveError(error?.response?.status === 404
      ? "This attendance record changed while you were editing. Refresh the list and try again."
      : error?.response?.data?.message || "Could not save attendance. Please try again.");

  }
  finally {

    setSaving(false);

  }

};



const handleCancel = () => {

  setForm(initialForm);

  setErrors({});

  onClose();

};
return (
  <Dialog
    className="attendance-dialog"
    open={open}
    onClose={handleCancel}
    fullWidth
    maxWidth="md"
  >
    <DialogTitle className="attendance-dialog-title">
      Edit Attendance

      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ mt: 1 }}
      >
        Update employee attendance record.
      </Typography>
    </DialogTitle>

    <DialogContent
      dividers
      className="attendance-dialog-content"
    >
      <Grid
        container
        spacing={3}
        sx={{ mt: 1 }}
      >
        {/* Employee Name */}

        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            fullWidth
            label="Employee Name"
            value={attendance?.employeeName || ""}
            slotProps={{ input: {
              readOnly: true,
            } }}
          />
        </Grid>

        {/* Azure Employee ID */}

        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            fullWidth
            label="Employee ID"
            value={attendance?.azureEmployeeId || ""}
            slotProps={{ input: {
              readOnly: true,
            } }}
          />
        </Grid>

        {/* Attendance Date */}

        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            fullWidth
            type="date"
            label="Attendance Date"
            name="attendanceDate"
            value={form.attendanceDate}
            onChange={handleChange}
            error={!!errors.attendanceDate}
            helperText={errors.attendanceDate}
            slotProps={{
              inputLabel: {
                shrink: true,
              },
            }}
          />
        </Grid>

        {/* Shift */}

        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            fullWidth
            select
            label="Shift"
            name="shift"
            value={form.shift}
            onChange={handleChange}
            error={!!errors.shift}
            helperText={errors.shift}
          >
            <MenuItem value="General">
              General
            </MenuItem>

            <MenuItem value="Morning">
              Morning
            </MenuItem>

            <MenuItem value="Evening">
              Evening
            </MenuItem>

            <MenuItem value="Night">
              Night
            </MenuItem>
          </TextField>
        </Grid>

        {/* Status */}

        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            fullWidth
            select
            label="Status"
            name="status"
            value={form.status}
            onChange={handleChange}
            error={!!errors.status}
            helperText={errors.status}
          >
            <MenuItem value="Present">
              Present
            </MenuItem>

            <MenuItem value="Late">
              Late
            </MenuItem>

            <MenuItem value="Half Day">
              Half Day
            </MenuItem>

            <MenuItem value="Absent">
              Absent
            </MenuItem>

            <MenuItem value="Leave">
              Leave
            </MenuItem>

            <MenuItem value="WFH">
              Work From Home
            </MenuItem>
          </TextField>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }} />

        {/* Check In */}

<Grid size={{ xs: 12, md: 6 }}>
  <TextField
    fullWidth
    type="time"
    label="Check In"
    name="checkIn"
    value={form.checkIn}
    onChange={handleChange}
    error={!!errors.checkIn}
    helperText={errors.checkIn}
    disabled={
      form.status === "Absent" ||
      form.status === "Leave" ||
      form.status === "WFH"
    }
    slotProps={{
      inputLabel: {
        shrink: true,
      },
    }}
  />
</Grid>

        {/* Check Out */}

       <Grid size={{ xs: 12, md: 6 }}>
  <TextField
    fullWidth
    type="time"
    label="Check Out"
    name="checkOut"
    value={form.checkOut}
    onChange={handleChange}
    error={!!errors.checkOut}
    helperText={errors.checkOut}
    disabled={
      form.status === "Absent" ||
      form.status === "Leave" ||
      form.status === "WFH"
    }
    slotProps={{
      inputLabel: {
        shrink: true,
      },
    }}
  />
</Grid>
        {/* Total Hours */}

  <Grid size={{ xs: 12, md: 6 }}>
  <TextField
    fullWidth
    label="Total Hours"
    value={form.totalHours}
    slotProps={{ input: {
      readOnly: true,
    } }}
    disabled={
      form.status === "Absent" ||
      form.status === "Leave" ||
      form.status === "WFH"
    }
  />
</Grid>

        <Grid size={{ xs: 12, md: 6 }} />

        {/* Remarks */}

        <Grid size={12}>
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Remarks"
            name="remarks"
            value={form.remarks}
            onChange={handleChange}
            error={!!errors.remarks}
            helperText={errors.remarks}
            placeholder="Enter remarks..."
          />
        </Grid>
      </Grid>
    </DialogContent>

    <DialogActions
      sx={{
        px: 3,
        py: 2,
        gap: 2,
      }}
    >
      {saveError && <Alert severity="error" sx={{ mr: "auto" }}>{saveError}</Alert>}
      <Button
        variant="outlined"
        onClick={handleCancel}
      >
        Cancel
      </Button>

      <Button
        variant="contained"
        onClick={handleSubmit}
        disabled={saving}
      >
        {saving ? "Saving..." : "Save Changes"}
      </Button>
    </DialogActions>
  </Dialog>
)};
