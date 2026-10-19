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
} from "@mui/material";

import { useState, useEffect } from "react";

import "./AddAttendanceDialog.css";

import EmployeeService from "../services/EmployeeService";
import AttendanceService from "../services/AttendanceService";
import { formatWorkedHours, getAttendanceStatusForDuration } from "./attendanceRules";

export default function AddAttendanceDialog({ open, onClose, onSaved }) {
  const initialForm = {
    employeeId: "",

    azureEmployeeId: "",

    employeeCode: "",

    employeeName: "",

    date: "",

    shift: "General",

    status: "Present",

    checkIn: "",

    checkOut: "",
    totalHours: "",

    remarks: "",
  };

  const [form, setForm] = useState(initialForm);

  const [employees, setEmployees] = useState([]);

  const [employeeLoading, setEmployeeLoading] = useState(false);

  const [errors, setErrors] = useState({});

  const resetForm = () => {
    setForm(initialForm);

    setErrors({});
  };

  useEffect(() => {
    if (open) {
      loadEmployees();
    } else {
      resetForm();
    }
  }, [open]);

  const loadEmployees = async () => {
    try {
      setEmployeeLoading(true);

      const response = await EmployeeService.getAllEmployees();

      setEmployees(response);
    } catch (error) {
      console.error("Attendance Save Error", error);

      console.log("Status:", error.response?.status);

      console.log("Response:", error.response?.data);

      console.log("Payload:", payload);
    } finally {
      setEmployeeLoading(false);
    }
  };

  const calculateTotalHours = (checkIn, checkOut, attendanceDate) => {
    if (!checkIn || !checkOut || !attendanceDate) return "";
    return formatWorkedHours(checkIn, checkOut);
  };

const handleChange = (e) => {

  const { name, value } = e.target;

  // Employee dropdown
  if (name === "employeeId") {

    const selectedEmployee = employees.find(
      (x) => x.employeeId === Number(value)
    );

    if (!selectedEmployee) return;

    const updatedForm = {

      ...form,

      employeeId: selectedEmployee.employeeId,

      azureEmployeeId: selectedEmployee.azureEmployeeId,

      employeeCode: selectedEmployee.employeeCode,

      employeeName: selectedEmployee.employeeName,

    };

    updatedForm.totalHours = calculateTotalHours(
      updatedForm.checkIn,
      updatedForm.checkOut,
      updatedForm.date
    );

    setForm(updatedForm);

    setErrors((prev) => ({
      ...prev,
      employeeId: "",
    }));

    return;
  }

  const updatedForm = {

    ...form,

    [name]: value,

  };

  // Status change
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
      updatedForm.date
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

  const validateForm = () => {
    let newErrors = {};

    if (!form.employeeId) {
      newErrors.employeeId = "Employee is required";
    }

    if (!form.date) {
      newErrors.date = "Attendance date is required";
    }

    if (!form.shift) {
      newErrors.shift = "Shift is required";
    }

    if (!form.status) {
      newErrors.status = "Status is required";
    }

    if (["Present", "Late", "Half Day"].includes(form.status)) {
      if (!form.checkIn) {
        newErrors.checkIn = "Check in time is required";
      }

      if (!form.checkOut) {
        newErrors.checkOut = "Check out time is required";
      }
    }

    if (form.checkIn && form.checkOut) {
      const [hours, minutes] = form.totalHours.split(":").map(Number);
      const diffHours = hours + minutes / 60;

      // Prevent unrealistic shifts
      if (diffHours > 24) {
        newErrors.checkOut = "Shift duration cannot exceed 24 hours.";
      }
    }
    if (form.remarks.length > 500) {
      newErrors.remarks = "Maximum 500 characters allowed";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      const payload = {
        employeeId: form.employeeId,

        azureEmployeeId: form.azureEmployeeId,

        employeeCode: form.employeeCode,

        employeeName: form.employeeName,

        attendanceDate: form.date,

        shift: form.shift,

        checkIn: form.checkIn ? form.checkIn + ":00" : null,

        checkOut: form.checkOut ? form.checkOut + ":00" : null,

        totalHours: form.totalHours,

        status: form.status,

        remarks: form.remarks,

        createdBy: "Admin",
      };

      console.log("Attendance Payload", payload);

      await AttendanceService.create(payload);

      resetForm();

      onClose();

      if (onSaved) {
        onSaved();
      }
    } catch (error) {
      console.error("Attendance Save Error", error);

      console.log("Status:", error.response?.status);

      console.log("Response:", error.response?.data);

      console.log("Payload:", payload);
    }
  };

  const handleCancel = () => {
    resetForm();

    onClose();
  };

  return (
    <Dialog className="attendance-dialog" open={open} onClose={handleCancel} fullWidth maxWidth="md">
      <DialogTitle className="attendance-dialog-title">
        Add Attendance
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Create a new employee attendance record.
        </Typography>
      </DialogTitle>

      <DialogContent dividers className="attendance-dialog-content">
        <Grid container spacing={3} sx={{ mt: 1 }}>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              select
              label="Employee"
              name="employeeId"
              value={form.employeeId}
              onChange={handleChange}
              error={!!errors.employeeId}
              helperText={errors.employeeId}
            >
              {employeeLoading ? (
                <MenuItem disabled>Loading Employees...</MenuItem>
              ) : (
                employees.map((employee) => (
                  <MenuItem
                    key={employee.employeeId}
                    value={employee.employeeId}
                  >
                    {employee.employeeCode}
                    {" - "}
                    {employee.employeeName}
                  </MenuItem>
                ))
              )}
            </TextField>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              type="date"
              label="Attendance Date"
              name="date"
              value={form.date}
              onChange={handleChange}
              error={!!errors.date}
              helperText={errors.date}
              slotProps={{
                inputLabel: {
                  shrink: true,
                },
              }}
            />
          </Grid>

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
              <MenuItem value="General">General</MenuItem>

              <MenuItem value="Morning">Morning</MenuItem>

              <MenuItem value="Evening">Evening</MenuItem>
            </TextField>
          </Grid>

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
              <MenuItem value="Present">Present</MenuItem>

              <MenuItem value="Late">Late</MenuItem>

              <MenuItem value="Half Day">Half Day</MenuItem>

              <MenuItem value="Absent">Absent</MenuItem>

              <MenuItem value="Leave">Leave</MenuItem>

              <MenuItem value="WFH">Work From Home</MenuItem>
            </TextField>
          </Grid>

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
        <Button variant="outlined" onClick={handleCancel}>
          Cancel
        </Button>

        <Button variant="contained" onClick={handleSubmit}>
          Save Attendance
        </Button>
      </DialogActions>
    </Dialog>
  );
}
