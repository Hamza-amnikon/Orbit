import { useState, useEffect } from "react";

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  TextField,
  MenuItem,
  Button,
  Typography,
  Divider,
  Alert,
} from "@mui/material";

export default function EditShiftAssignmentDialog({
  open,
  employee,
  onClose,
  onUpdate,
}) {
  // =========================================================
  // SHIFT PRESETS
  // =========================================================
  //
  // These are the default timings used when a shift is selected.
  //
  // Morning  : 05:00 -> 13:30
  // General  : 09:00 -> 18:00
  // Evening  : 13:00 -> 22:30
  // Night    : 20:30 -> 06:00
  //
  // Night shift crosses midnight.
  // =========================================================

  const SHIFT_TIMINGS = {
    Morning: {
      startTime: "05:00",
      endTime: "13:30",
    },

    General: {
      startTime: "09:00",
      endTime: "18:00",
    },

    Evening: {
      startTime: "13:00",
      endTime: "22:30",
    },

    Night: {
      startTime: "20:30",
      endTime: "06:00",
    },
  };

  // =========================================================
  // FORM
  // =========================================================

  const [form, setForm] = useState({
    employeeCode: "",
    employeeName: "",
    department: "",
    designation: "",

    shiftName: "",

    startTime: "",
    endTime: "",

    fromDate: "",
    toDate: "",

    status: "Active",

    weeklyOff1: "Saturday",
    weeklyOff2: "Sunday",

    remarks: "",
  });

  // =========================================================
  // NORMALIZE TIME
  // =========================================================
  //
  // Converts:
  //
  // 20:30:00 -> 20:30
  // 20:30    -> 20:30
  // null     -> ""
  //
  // This is required because HTML input type="time"
  // expects HH:mm.
  // =========================================================

  const normalizeTime = (value) => {
    if (!value) {
      return "";
    }

    const stringValue = String(value);

    if (stringValue.length >= 5) {
      return stringValue.substring(0, 5);
    }

    return stringValue;
  };

  // =========================================================
  // CHECK EMPTY / ZERO TIME
  // =========================================================
  //
  // Existing records currently contain:
  //
  // 00:00:00
  //
  // We treat that as "not configured" so the correct
  // shift preset can be displayed.
  // =========================================================

  const isEmptyTime = (value) => {
    if (!value) {
      return true;
    }

    const normalized = normalizeTime(value);

    return (
      normalized === "" ||
      normalized === "00:00"
    );
  };

  // =========================================================
  // LOAD EMPLOYEE
  // =========================================================

  useEffect(() => {
    if (!employee) {
      return;
    }

    const shiftName =
      employee.shiftName ||
      employee.shift ||
      "General";

    const preset =
      SHIFT_TIMINGS[shiftName];

    const employeeStartTime =
      isEmptyTime(employee.startTime)
        ? preset?.startTime || ""
        : normalizeTime(employee.startTime);

    const employeeEndTime =
      isEmptyTime(employee.endTime)
        ? preset?.endTime || ""
        : normalizeTime(employee.endTime);

    setForm({
      employeeCode:
        employee.employeeCode || "",

      employeeName:
        employee.employeeName || "",

      department:
        employee.department || "",

      designation:
        employee.designation || "",

      shiftName:
        shiftName,

      startTime:
        employeeStartTime,

      endTime:
        employeeEndTime,

      fromDate:
        employee.fromDate || "",

      toDate:
        employee.toDate || "",

      status:
        employee.status || "Active",

      weeklyOff1:
        employee.weeklyOff1 ||
        "Saturday",

      weeklyOff2:
        employee.weeklyOff2 ||
        "Sunday",

      remarks:
        employee.remarks || "",
    });
  }, [employee]);

  // =========================================================
  // HANDLE CHANGE
  // =========================================================

  const handleChange = (e) => {
    const {
      name,
      value,
    } = e.target;

    // =======================================================
    // SHIFT CHANGE
    // =======================================================

    if (name === "shiftName") {
      const timing =
        SHIFT_TIMINGS[value];

      setForm((prev) => ({
        ...prev,

        shiftName:
          value,

        startTime:
          timing?.startTime ||
          prev.startTime,

        endTime:
          timing?.endTime ||
          prev.endTime,
      }));

      return;
    }

    // =======================================================
    // NORMAL FIELD CHANGE
    // =======================================================

    setForm((prev) => ({
      ...prev,

      [name]: value,
    }));
  };

  // =========================================================
  // CONVERT TIME TO API FORMAT
  // =========================================================
  //
  // HTML:
  // 20:30
  //
  // API:
  // 20:30:00
  // =========================================================

  const toApiTime = (value) => {
    if (!value) {
      return null;
    }

    const normalized =
      normalizeTime(value);

    if (!normalized) {
      return null;
    }

    if (normalized.length === 5) {
      return `${normalized}:00`;
    }

    return normalized;
  };

  // =========================================================
  // UPDATE
  // =========================================================

  const handleUpdate = () => {
    if (!onUpdate) {
      return;
    }

    // =======================================================
    // VALIDATION
    // =======================================================

    if (!form.shiftName) {
      alert("Please select a shift.");
      return;
    }

    if (!form.startTime) {
      alert("Please select a start time.");
      return;
    }

    if (!form.endTime) {
      alert("Please select an end time.");
      return;
    }

    if (!form.fromDate) {
      alert("Please select From Date.");
      return;
    }

    if (!form.toDate) {
      alert("Please select To Date.");
      return;
    }

    // =======================================================
    // DATE VALIDATION
    // =======================================================

    if (form.fromDate > form.toDate) {
      alert(
        "From Date cannot be greater than To Date."
      );

      return;
    }

    // =======================================================
    // PAYLOAD
    // =======================================================

    const payload = {
      shiftName:
        form.shiftName,

      startTime:
        toApiTime(form.startTime),

      endTime:
        toApiTime(form.endTime),

      fromDate:
        form.fromDate,

      toDate:
        form.toDate,

      status:
        form.status,

      weeklyOff1:
        form.weeklyOff1,

      weeklyOff2:
        form.weeklyOff2,

      remarks:
        form.remarks,

      updatedBy:
        "Admin",
    };

    console.log(
      "===================================="
    );

    console.log(
      "UPDATE SHIFT PAYLOAD"
    );

    console.log(
      payload
    );

    console.log(
      "===================================="
    );

    onUpdate(payload);
  };

  // =========================================================
  // NIGHT SHIFT
  // =========================================================

  const isNightShift =
    form.shiftName === "Night";

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="lg"
      PaperProps={{
        sx: {
          borderRadius: 4,
        },
      }}
    >
      {/* ================================================= */}
      {/* TITLE */}
      {/* ================================================= */}

      <DialogTitle>
        Edit Shift Assignment
      </DialogTitle>

      <DialogContent dividers>

        {/* ================================================= */}
        {/* EMPLOYEE INFORMATION */}
        {/* ================================================= */}

        <Typography
          variant="h6"
          sx={{
            fontWeight: 600,
            mb: 1,
          }}
        >
          Employee Information
        </Typography>

        <Divider
          sx={{
            mb: 3,
          }}
        />

        <Grid
          container
          spacing={3}
          sx={{
            mt: 1,
          }}
        >

          {/* Employee Code */}

          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label="Employee Code"
              value={
                form.employeeCode
              }
              disabled
            />
          </Grid>

          {/* Employee Name */}

          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label="Employee Name"
              value={
                form.employeeName
              }
              disabled
            />
          </Grid>

          {/* Department */}

          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label="Department"
              value={
                form.department
              }
              disabled
            />
          </Grid>

          {/* Designation */}

          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label="Designation"
              value={
                form.designation
              }
              disabled
            />
          </Grid>

          {/* ================================================= */}
          {/* SHIFT */}
          {/* ================================================= */}

          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              select
              fullWidth
              label="Shift"
              name="shiftName"
              value={
                form.shiftName
              }
              onChange={
                handleChange
              }
            >
              <MenuItem value="Morning">
                Morning Shift
              </MenuItem>

              <MenuItem value="General">
                General Shift
              </MenuItem>

              <MenuItem value="Evening">
                Evening Shift
              </MenuItem>

              <MenuItem value="Night">
                Night Shift
              </MenuItem>
            </TextField>
          </Grid>

          {/* ================================================= */}
          {/* STATUS */}
          {/* ================================================= */}

          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              select
              fullWidth
              label="Status"
              name="status"
              value={
                form.status
              }
              onChange={
                handleChange
              }
            >
              <MenuItem value="Active">
                Active
              </MenuItem>

              <MenuItem value="Inactive">
                Inactive
              </MenuItem>
            </TextField>
          </Grid>

          {/* ================================================= */}
          {/* START TIME */}
          {/* ================================================= */}

          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              type="time"
              label="Start Time"
              name="startTime"
              value={
                form.startTime
              }
              onChange={
                handleChange
              }
              slotProps={{
                inputLabel: {
                  shrink: true,
                },
              }}
            />
          </Grid>

          {/* ================================================= */}
          {/* END TIME */}
          {/* ================================================= */}

          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              type="time"
              label="End Time"
              name="endTime"
              value={
                form.endTime
              }
              onChange={
                handleChange
              }
              slotProps={{
                inputLabel: {
                  shrink: true,
                },
              }}
            />
          </Grid>

          {/* ================================================= */}
          {/* NIGHT SHIFT INFORMATION */}
          {/* ================================================= */}

          {isNightShift && (
            <Grid size={{ xs: 12 }}>
              <Alert severity="info">
                <strong>
                  Night Shift crosses midnight.
                </strong>

                <br />

                Attendance will use:

                {" "}

                {form.startTime}

                {" → "}

                {form.endTime}

                <br />

                Example:

                {" "}

                22:00 IN today

                {" → "}

                06:00 OUT tomorrow

                will belong to the same night shift attendance.
              </Alert>
            </Grid>
          )}

          {/* ================================================= */}
          {/* SHIFT PRESET INFORMATION */}
          {/* ================================================= */}

          {form.shiftName &&
            SHIFT_TIMINGS[
              form.shiftName
            ] && (
              <Grid size={{ xs: 12 }}>
                <Alert severity="success">
                  Default timing for{" "}
                  <strong>
                    {form.shiftName}
                  </strong>
                  :

                  {" "}

                  {
                    SHIFT_TIMINGS[
                      form.shiftName
                    ].startTime
                  }

                  {" → "}

                  {
                    SHIFT_TIMINGS[
                      form.shiftName
                    ].endTime
                  }

                  <br />

                  You can manually change the timing above if required.
                </Alert>
              </Grid>
            )}

          {/* ================================================= */}
          {/* FROM DATE */}
          {/* ================================================= */}

          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              type="date"
              label="From Date"
              name="fromDate"
              value={
                form.fromDate
              }
              onChange={
                handleChange
              }
              slotProps={{
                inputLabel: {
                  shrink: true,
                },
              }}
            />
          </Grid>

          {/* ================================================= */}
          {/* TO DATE */}
          {/* ================================================= */}

          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              type="date"
              label="To Date"
              name="toDate"
              value={
                form.toDate
              }
              onChange={
                handleChange
              }
              slotProps={{
                inputLabel: {
                  shrink: true,
                },
              }}
            />
          </Grid>

          {/* ================================================= */}
          {/* WEEKLY OFF 1 */}
          {/* ================================================= */}

          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              select
              fullWidth
              label="Weekly Off 1"
              name="weeklyOff1"
              value={
                form.weeklyOff1
              }
              onChange={
                handleChange
              }
            >
              <MenuItem value="Sunday">
                Sunday
              </MenuItem>

              <MenuItem value="Monday">
                Monday
              </MenuItem>

              <MenuItem value="Tuesday">
                Tuesday
              </MenuItem>

              <MenuItem value="Wednesday">
                Wednesday
              </MenuItem>

              <MenuItem value="Thursday">
                Thursday
              </MenuItem>

              <MenuItem value="Friday">
                Friday
              </MenuItem>

              <MenuItem value="Saturday">
                Saturday
              </MenuItem>
            </TextField>
          </Grid>

          {/* ================================================= */}
          {/* WEEKLY OFF 2 */}
          {/* ================================================= */}

          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              select
              fullWidth
              label="Weekly Off 2"
              name="weeklyOff2"
              value={
                form.weeklyOff2
              }
              onChange={
                handleChange
              }
            >
              <MenuItem value="Sunday">
                Sunday
              </MenuItem>

              <MenuItem value="Monday">
                Monday
              </MenuItem>

              <MenuItem value="Tuesday">
                Tuesday
              </MenuItem>

              <MenuItem value="Wednesday">
                Wednesday
              </MenuItem>

              <MenuItem value="Thursday">
                Thursday
              </MenuItem>

              <MenuItem value="Friday">
                Friday
              </MenuItem>

              <MenuItem value="Saturday">
                Saturday
              </MenuItem>
            </TextField>
          </Grid>

          {/* ================================================= */}
          {/* REMARKS */}
          {/* ================================================= */}

          <Grid size={{ xs: 12 }}>
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Remarks"
              name="remarks"
              value={
                form.remarks
              }
              onChange={
                handleChange
              }
            />
          </Grid>

        </Grid>
      </DialogContent>

      {/* ================================================= */}
      {/* ACTIONS */}
      {/* ================================================= */}

      <DialogActions
        sx={{
          p: 2,
        }}
      >
        <Button
          variant="outlined"
          onClick={onClose}
        >
          Cancel
        </Button>

        <Button
          variant="contained"
          onClick={handleUpdate}
        >
          Save Changes
        </Button>
      </DialogActions>
    </Dialog>
  );
}