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
} from "@mui/material";

import EmployeeService from "../services/EmployeeService";

export default function AssignShiftDialog({ open, onClose, onSave }) {
  const initialForm = {
    employeeId: "",

    azureEmployeeId: "",

    employeeCode: "",

    employeeName: "",

    department: "",

    designation: "",

    shift: "General",

    fromDate: "",

    toDate: "",

    status: "Active",

    weeklyOff1: "Saturday",

    weeklyOff2: "Sunday",

    remarks: "",
  };

  const [form, setForm] = useState(initialForm);

  const [employees, setEmployees] = useState([]);

  const [loadingEmployees, setLoadingEmployees] = useState(false);

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
      setLoadingEmployees(true);

      const data = await EmployeeService.getAllEmployees();

      setEmployees(data);
    } catch (error) {
      console.error("Load Employees Error:", error);
    } finally {
      setLoadingEmployees(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "employeeId") {
      const employee = employees.find(
        (emp) => emp.employeeId === Number(value),
      );

      if (employee) {
        setForm((prev) => ({
          ...prev,

          employeeId: employee.employeeId,

          azureEmployeeId: employee.azureEmployeeId,

          employeeCode: employee.employeeCode,

          employeeName: employee.employeeName,

          department: employee.department,

          designation: employee.designation,
        }));
      }

      return;
    }

    setForm((prev) => ({
      ...prev,

      [name]: value,
    }));

    setErrors((prev) => ({
      ...prev,

      [name]: "",
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!form.employeeId) newErrors.employeeId = "Please select an employee.";

    if (!form.shift) newErrors.shift = "Shift is required.";

    if (!form.fromDate) newErrors.fromDate = "From Date is required.";

    if (!form.toDate) newErrors.toDate = "To Date is required.";

    if (
      form.fromDate &&
      form.toDate &&
      new Date(form.fromDate) > new Date(form.toDate)
    ) {
      newErrors.toDate = "To Date must be greater than From Date.";
    }

    if (!form.status) newErrors.status = "Status is required.";

    if (!form.weeklyOff1) newErrors.weeklyOff1 = "Weekly Off 1 is required.";

    if (!form.weeklyOff2) newErrors.weeklyOff2 = "Weekly Off 2 is required.";

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    const payload = {
      employeeId: Number(form.employeeId),

      azureEmployeeId: Number(form.azureEmployeeId),

      employeeCode: form.employeeCode,

      employeeName: form.employeeName,

      department: form.department,

      designation: form.designation,

      shiftName: form.shift,

      fromDate: form.fromDate,

      toDate: form.toDate,

      status: form.status,

      weeklyOff1: form.weeklyOff1,

      weeklyOff2: form.weeklyOff2,

      remarks: form.remarks,

      createdBy: "Admin",
    };

    try {
      await onSave(payload);

      resetForm();

      onClose();
    } catch (error) {
      console.error("Assign Shift Error:", error);
    }
  };

  const handleCancel = () => {
    resetForm();

    onClose();
  };
  return (
    <Dialog open={open} onClose={handleCancel} fullWidth maxWidth="md">
      <DialogTitle>Assign Shift</DialogTitle>

      <DialogContent dividers>
        <Grid container spacing={3} sx={{ mt: 1 }}>
          {/* ================= Employee Selection ================= */}

          <Grid size={{ xs: 12 }}>
            <Typography variant="subtitle1" fontWeight={600}>
              Employee
            </Typography>

            <Divider sx={{ mb: 2 }} />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <TextField
              select
              fullWidth
              label="Select Employee"
              name="employeeId"
              value={form.employeeId}
              onChange={handleChange}
              error={!!errors.employeeId}
              helperText={errors.employeeId}
            >
              {employees.map((employee) => (
                <MenuItem key={employee.employeeId} value={employee.employeeId}>
                  {employee.employeeCode} - {employee.employeeName}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid size={{ xs: 6 }}>
            <TextField
              fullWidth
              label="Employee Code"
              value={form.employeeCode}
              disabled
            />
          </Grid>

          <Grid size={{ xs: 6 }}>
            <TextField
              fullWidth
              label="Employee Name"
              value={form.employeeName}
              disabled
            />
          </Grid>

          <Grid size={{ xs: 6 }}>
            <TextField
              fullWidth
              label="Department"
              value={form.department}
              disabled
            />
          </Grid>

          <Grid size={{ xs: 6 }}>
            <TextField
              fullWidth
              label="Designation"
              value={form.designation}
              disabled
            />
          </Grid>

          {/* ================= Shift Details ================= */}

          <Grid size={{ xs: 12 }}>
            <Typography variant="subtitle1" fontWeight={600} sx={{ mt: 2 }}>
              Shift Details
            </Typography>

            <Divider sx={{ mb: 2 }} />
          </Grid>

          <Grid size={{ xs: 6 }}>
            <TextField
              select
              fullWidth
              label="Shift"
              name="shift"
              value={form.shift}
              onChange={handleChange}
              error={!!errors.shift}
              helperText={errors.shift}
            >
              <MenuItem value="Morning">Morning Shift</MenuItem>

              <MenuItem value="General">General Shift</MenuItem>

              <MenuItem value="Evening">Evening Shift</MenuItem>

              <MenuItem value="Night">Night Shift</MenuItem>
            </TextField>
          </Grid>

          <Grid size={{ xs: 6 }}>
            <TextField
              select
              fullWidth
              label="Status"
              name="status"
              value={form.status}
              onChange={handleChange}
            >
              <MenuItem value="Active">Active</MenuItem>

              <MenuItem value="Inactive">Inactive</MenuItem>
            </TextField>
          </Grid>
          {/* ================= Date Range ================= */}

          <Grid size={{ xs: 6 }}>
            <TextField
  fullWidth
  type="date"
  name="fromDate"
   label="From Date"
  value={form.fromDate}
  onChange={handleChange}
  error={!!errors.fromDate}
  helperText={errors.fromDate}
  slotProps={{
    inputLabel: {
      shrink: true,
    },
  }}
/>
          </Grid>

          <Grid size={{ xs: 6 }}>
<TextField
  fullWidth
  type="date"
  name="toDate"
   label="To Date"
  value={form.toDate}
  onChange={handleChange}
  error={!!errors.toDate}
  helperText={errors.toDate}
  slotProps={{
    inputLabel: {
      shrink: true,
    },
  }}
/>
          </Grid>

          {/* ================= Weekly Off ================= */}

          <Grid size={{ xs: 6 }}>
            <TextField
              select
              fullWidth
              label="Weekly Off 1"
              name="weeklyOff1"
              value={form.weeklyOff1}
              onChange={handleChange}
              error={!!errors.weeklyOff1}
              helperText={errors.weeklyOff1}
            >
              <MenuItem value="Sunday">Sunday</MenuItem>
              <MenuItem value="Monday">Monday</MenuItem>
              <MenuItem value="Tuesday">Tuesday</MenuItem>
              <MenuItem value="Wednesday">Wednesday</MenuItem>
              <MenuItem value="Thursday">Thursday</MenuItem>
              <MenuItem value="Friday">Friday</MenuItem>
              <MenuItem value="Saturday">Saturday</MenuItem>
            </TextField>
          </Grid>

          <Grid size={{ xs: 6 }}>
            <TextField
              select
              fullWidth
              label="Weekly Off 2"
              name="weeklyOff2"
              value={form.weeklyOff2}
              onChange={handleChange}
              error={!!errors.weeklyOff2}
              helperText={errors.weeklyOff2}
            >
              <MenuItem value="Sunday">Sunday</MenuItem>
              <MenuItem value="Monday">Monday</MenuItem>
              <MenuItem value="Tuesday">Tuesday</MenuItem>
              <MenuItem value="Wednesday">Wednesday</MenuItem>
              <MenuItem value="Thursday">Thursday</MenuItem>
              <MenuItem value="Friday">Friday</MenuItem>
              <MenuItem value="Saturday">Saturday</MenuItem>
            </TextField>
          </Grid>

          {/* ================= Remarks ================= */}

          <Grid size={{ xs: 12 }}>
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Remarks"
              name="remarks"
              value={form.remarks}
              onChange={handleChange}
            />
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions>
        <Button variant="outlined" color="inherit" onClick={handleCancel}>
          Cancel
        </Button>

        <Button variant="contained" onClick={handleSubmit}>
          Assign Shift
        </Button>
      </DialogActions>
    </Dialog>
  );
}
