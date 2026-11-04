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

import EmployeeService from "../services/EmployeeService";

export default function AssignShiftDialog({
  open,
  onClose,
  onSave,
  initialAssignment,
}) {
  // =========================================================
  // SHIFT PRESETS
  // =========================================================

  const SHIFT_TIMINGS = {
    Morning: {
      startTime: "5:00",
      endTime: "13:30",
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
  // INITIAL FORM
  // =========================================================

  const initialForm = {
    employeeId: "",
    azureEmployeeId: "",
    AzureEmployeeId: "",
    employeeName: "",
    department: "",
    designation: "",

    shift: "General",

    startTime: "09:00",
    endTime: "18:00",

    fromDate: "",
    toDate: "",

    status: "Active",

    weeklyOff1: "Saturday",
    weeklyOff2: "Sunday",

    remarks: "",
  };

  const [form, setForm] = useState(initialForm);

  const [employees, setEmployees] = useState([]);

  const [loadingEmployees, setLoadingEmployees] =
    useState(false);

  const [errors, setErrors] = useState({});

  // =========================================================
  // RESET FORM
  // =========================================================

  const resetForm = () => {
    setForm(initialForm);
    setErrors({});
  };

  const nextPeriod = (assignment) => {
    if (!assignment?.toDate) return { fromDate: "", toDate: "" };
    const now = new Date();
    const firstOfNextMonth = new Date(Date.UTC(now.getFullYear(), now.getMonth() + 1, 1));
    const previousEnd = new Date(`${assignment.toDate}T00:00:00Z`);
    const dayAfterPreviousEnd = new Date(previousEnd);
    dayAfterPreviousEnd.setUTCDate(dayAfterPreviousEnd.getUTCDate() + 1);
    const start = dayAfterPreviousEnd > firstOfNextMonth
      ? dayAfterPreviousEnd
      : firstOfNextMonth;
    const end = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth() + 1, 0));
    return {
      fromDate: start.toISOString().slice(0, 10),
      toDate: end.toISOString().slice(0, 10),
    };
  };

  // =========================================================
  // LOAD EMPLOYEES
  // =========================================================

  useEffect(() => {
    if (open) {
      if (initialAssignment) {
        setForm({
          employeeId: initialAssignment.employeeId,
          azureEmployeeId: initialAssignment.azureEmployeeId,
          AzureEmployeeId: initialAssignment.azureEmployeeId || initialAssignment.AzureEmployeeId || "",
          employeeName: initialAssignment.employeeName || "",
          department: initialAssignment.department || "",
          designation: initialAssignment.designation || "",
          shift: initialAssignment.shiftName || "General",
          startTime: String(initialAssignment.startTime || "09:00").slice(0, 5),
          endTime: String(initialAssignment.endTime || "18:00").slice(0, 5),
          ...nextPeriod(initialAssignment),
          status: "Active",
          weeklyOff1: initialAssignment.weeklyOff1 || "Saturday",
          weeklyOff2: initialAssignment.weeklyOff2 || "Sunday",
          remarks: "",
        });
        setErrors({});
      }
      loadEmployees();
    } else {
      resetForm();
    }
  }, [open, initialAssignment]);

  const loadEmployees = async () => {
    try {
      setLoadingEmployees(true);

      const data =
        await EmployeeService.getAllEmployees();

      setEmployees(data);
    } catch (error) {
      console.error(
        "Load Employees Error:",
        error
      );
    } finally {
      setLoadingEmployees(false);
    }
  };

  // =========================================================
  // HANDLE CHANGE
  // =========================================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    // =======================================================
    // EMPLOYEE
    // =======================================================

    if (name === "employeeId") {
      const employee = employees.find(
        (emp) =>
          emp.employeeId === Number(value)
      );

      if (employee) {
        setForm((prev) => ({
          ...prev,

          employeeId:
            employee.employeeId,

          azureEmployeeId:
            employee.azureEmployeeId,

          AzureEmployeeId:
            employee.azureEmployeeId || employee.AzureEmployeeId || "",

          employeeName:
            employee.employeeName,

          department:
            employee.department,

          designation:
            employee.designation,
        }));
      }

      setErrors((prev) => ({
        ...prev,
        employeeId: "",
      }));

      return;
    }

    // =======================================================
    // SHIFT
    // =======================================================

    if (name === "shift") {
      const timing =
        SHIFT_TIMINGS[value];

      setForm((prev) => ({
        ...prev,

        shift: value,

        startTime:
          timing?.startTime || "",

        endTime:
          timing?.endTime || "",
      }));

      setErrors((prev) => ({
        ...prev,
        shift: "",
      }));

      return;
    }

    // =======================================================
    // OTHER FIELDS
    // =======================================================

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

  // =========================================================
  // VALIDATE
  // =========================================================

  const validateForm = () => {
    const newErrors = {};

    if (!form.employeeId) {
      newErrors.employeeId =
        "Please select an employee.";
    }

    if (!form.shift) {
      newErrors.shift =
        "Shift is required.";
    }

    if (!form.startTime) {
      newErrors.startTime =
        "Start time is required.";
    }

    if (!form.endTime) {
      newErrors.endTime =
        "End time is required.";
    }

    if (!form.fromDate) {
      newErrors.fromDate =
        "From Date is required.";
    }

    if (!form.toDate) {
      newErrors.toDate =
        "To Date is required.";
    }

    if (
      form.fromDate &&
      form.toDate &&
      new Date(form.fromDate) >
        new Date(form.toDate)
    ) {
      newErrors.toDate =
        "To Date must be greater than From Date.";
    }

    if (!form.status) {
      newErrors.status =
        "Status is required.";
    }

    if (!form.weeklyOff1) {
      newErrors.weeklyOff1 =
        "Weekly Off 1 is required.";
    }

    if (!form.weeklyOff2) {
      newErrors.weeklyOff2 =
        "Weekly Off 2 is required.";
    }

    setErrors(newErrors);

    return (
      Object.keys(newErrors).length === 0
    );
  };

  // =========================================================
  // SUBMIT
  // =========================================================

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    const payload = {
      employeeId:
        Number(form.employeeId),

      AzureEmployeeId:
        form.AzureEmployeeId,

      employeeName:
        form.employeeName,

      department:
        form.department,

      designation:
        form.designation,

      shiftName:
        form.shift,

      startTime:
        `${form.startTime}:00`,

      endTime:
        `${form.endTime}:00`,

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

      createdBy:
        "Admin",
    };

    console.log(
      "Assign Shift Payload:",
      payload
    );

    try {
      await onSave(payload);

      resetForm();

      onClose();
    } catch (error) {
      console.error(
        "Assign Shift Error:",
        error
      );
    }
  };

  // =========================================================
  // CANCEL
  // =========================================================

  const handleCancel = () => {
    resetForm();
    onClose();
  };

  // =========================================================
  // CURRENT TIMING
  // =========================================================

  const isNightShift =
    form.shift === "Night";

  // =========================================================
  // UI
  // =========================================================

  return (
    <Dialog
      className="shift-assignment-dialog"
      open={open}
      onClose={handleCancel}
      fullWidth
      maxWidth="md"
    >
      <DialogTitle>
        {initialAssignment ? "Assign Next Period" : "Assign Shift"}
      </DialogTitle>

      <DialogContent dividers>
        {initialAssignment && (
          <Alert severity="info" sx={{ mb: 2 }}>
            This creates a new assignment. The previous period stays in shift history.
          </Alert>
        )}
        <Grid
          container
          spacing={3}
          sx={{ mt: 1 }}
        >

          {/* ================================================= */}
          {/* EMPLOYEE */}
          {/* ================================================= */}

          <Grid size={{ xs: 12 }}>
            <Typography
              variant="subtitle1"
              fontWeight={600}
            >
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
              error={
                !!errors.employeeId
              }
              helperText={
                errors.employeeId
              }
              disabled={
                loadingEmployees || !!initialAssignment
              }
            >
              {employees.map(
                (employee) => (
                  <MenuItem
                    key={
                      employee.employeeId
                    }
                    value={
                      employee.employeeId
                    }
                  >
                    {
                      employee.azureEmployeeId || employee.AzureEmployeeId
                    }{" "}
                    -{" "}
                    {
                      employee.employeeName
                    }
                  </MenuItem>
                )
              )}
            </TextField>
          </Grid>

          <Grid size={{ xs: 6 }}>
            <TextField
              fullWidth
              label="Employee ID"
              value={
                form.AzureEmployeeId
              }
              disabled
            />
          </Grid>

          <Grid size={{ xs: 6 }}>
            <TextField
              fullWidth
              label="Employee Name"
              value={
                form.employeeName
              }
              disabled
            />
          </Grid>

          <Grid size={{ xs: 6 }}>
            <TextField
              fullWidth
              label="Department"
              value={
                form.department
              }
              disabled
            />
          </Grid>

          <Grid size={{ xs: 6 }}>
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
          {/* SHIFT DETAILS */}
          {/* ================================================= */}

          <Grid size={{ xs: 12 }}>
            <Typography
              variant="subtitle1"
              fontWeight={600}
              sx={{ mt: 2 }}
            >
              Shift Details
            </Typography>

            <Divider sx={{ mb: 2 }} />
          </Grid>

          {/* SHIFT */}

          <Grid size={{ xs: 6 }}>
            <TextField
              select
              fullWidth
              label="Shift"
              name="shift"
              value={form.shift}
              onChange={handleChange}
              error={!!errors.shift}
              helperText={
                errors.shift
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

          {/* STATUS */}

          <Grid size={{ xs: 6 }}>
            <TextField
              select
              fullWidth
              label="Status"
              name="status"
              value={form.status}
              onChange={handleChange}
              error={!!errors.status}
              helperText={
                errors.status
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
          {/* SHIFT TIMING */}
          {/* ================================================= */}

          <Grid size={{ xs: 6 }}>
            <TextField
              fullWidth
              type="time"
              label="Start Time"
              name="startTime"
              value={form.startTime}
              onChange={handleChange}
              error={
                !!errors.startTime
              }
              helperText={
                errors.startTime
              }
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
              type="time"
              label="End Time"
              name="endTime"
              value={form.endTime}
              onChange={handleChange}
              error={
                !!errors.endTime
              }
              helperText={
                errors.endTime
              }
              slotProps={{
                inputLabel: {
                  shrink: true,
                },
              }}
            />
          </Grid>

          {isNightShift && (
            <Grid size={{ xs: 12 }}>
              <Alert severity="info">
                Night Shift crosses midnight:
                {" "}
                {form.startTime}
                {" → "}
                {form.endTime}
              </Alert>
            </Grid>
          )}

          {/* ================================================= */}
          {/* DATE RANGE */}
          {/* ================================================= */}

          <Grid size={{ xs: 6 }}>
            <TextField
              fullWidth
              type="date"
              name="fromDate"
              label="From Date"
              value={form.fromDate}
              onChange={handleChange}
              error={
                !!errors.fromDate
              }
              helperText={
                errors.fromDate
              }
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
              error={
                !!errors.toDate
              }
              helperText={
                errors.toDate
              }
              slotProps={{
                inputLabel: {
                  shrink: true,
                },
              }}
            />
          </Grid>

          {/* ================================================= */}
          {/* WEEKLY OFF */}
          {/* ================================================= */}

          <Grid size={{ xs: 6 }}>
            <TextField
              select
              fullWidth
              label="Weekly Off 1"
              name="weeklyOff1"
              value={
                form.weeklyOff1
              }
              onChange={handleChange}
              error={
                !!errors.weeklyOff1
              }
              helperText={
                errors.weeklyOff1
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

          <Grid size={{ xs: 6 }}>
            <TextField
              select
              fullWidth
              label="Weekly Off 2"
              name="weeklyOff2"
              value={
                form.weeklyOff2
              }
              onChange={handleChange}
              error={
                !!errors.weeklyOff2
              }
              helperText={
                errors.weeklyOff2
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
              value={form.remarks}
              onChange={handleChange}
            />
          </Grid>

        </Grid>
      </DialogContent>

      <DialogActions>
        <Button
          variant="outlined"
          color="inherit"
          onClick={handleCancel}
        >
          Cancel
        </Button>

        <Button
          variant="contained"
          onClick={handleSubmit}
        >
          Assign Shift
        </Button>
      </DialogActions>
    </Dialog>
  );
}
