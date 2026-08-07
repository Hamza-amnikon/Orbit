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

export default function EditShiftAssignmentDialog({
  open,
  employee,
  onClose,
  onUpdate,
}) {
  const [form, setForm] = useState({
    employeeCode: "",
    employeeName: "",
    department: "",
    designation: "",

    shiftName: "",

    fromDate: "",
    toDate: "",

    status: "Active",

    weeklyOff1: "Saturday",
    weeklyOff2: "Sunday",

    remarks: "",
  });

  useEffect(() => {
    if (employee) {
      setForm({
        employeeCode: employee.employeeCode || "",
        employeeName: employee.employeeName || "",
        department: employee.department || "",
        designation: employee.designation || "",

        shiftName: employee.shiftName || "",

        fromDate: employee.fromDate || "",
        toDate: employee.toDate || "",

        status: employee.status || "Active",

        weeklyOff1: employee.weeklyOff1 || "Saturday",
        weeklyOff2: employee.weeklyOff2 || "Sunday",

        remarks: employee.remarks || "",
      });
    }
  }, [employee]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleUpdate = () => {
    if (!onUpdate) return;

    onUpdate({
      shiftName: form.shiftName,

      fromDate: form.fromDate,
      toDate: form.toDate,

      status: form.status,

      weeklyOff1: form.weeklyOff1,
      weeklyOff2: form.weeklyOff2,

      remarks: form.remarks,
    });

    onClose();
  };  return (
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
<DialogTitle className="assign-dialog-title">
  Edit Shift Assignment
</DialogTitle>
    <DialogContent className="assign-dialog-content">
<Typography
  variant="h6"
  sx={{
    fontWeight: 600,
    mb: 1,
  }}
>
  Employee Information
</Typography>

<Divider sx={{ mb: 3 }} />

        <Grid container spacing={3} sx={{ mt: 1 }}>

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

          {/* Shift */}

          <Grid size={{ xs: 6 }}>
            <TextField
              select
              fullWidth
              label="Shift"
              name="shiftName"
              value={form.shiftName}
              onChange={handleChange}
            >
              <MenuItem value="Morning">Morning Shift</MenuItem>

              <MenuItem value="General">General Shift</MenuItem>

              <MenuItem value="Evening">Evening Shift</MenuItem>

              <MenuItem value="Night">Night Shift</MenuItem>
            </TextField>
          </Grid>

          {/* Status */}

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

          {/* From Date */}
<Grid size={{ xs: 6 }}>
  <Typography
    sx={{
      mb: 1,
      fontWeight: 600,
      color: "#64748b",
      fontSize: 14,
    }}
  >
    From Date
  </Typography>

  <TextField
    fullWidth
    type="date"
    name="fromDate"
    value={form.fromDate}
    onChange={handleChange}
  />
</Grid>

          {/* To Date */}

<Grid size={{ xs: 6 }}>
  <Typography
    sx={{
      mb: 1,
      fontWeight: 600,
      color: "#64748b",
      fontSize: 14,
    }}
  >
    To Date
  </Typography>

  <TextField
    fullWidth
    type="date"
    name="toDate"
    value={form.toDate}
    onChange={handleChange}
  />
</Grid>

          {/* Weekly Off 1 */}

          <Grid size={{ xs: 6 }}>
            <TextField
              select
              fullWidth
              label="Weekly Off 1"
              name="weeklyOff1"
              value={form.weeklyOff1}
              onChange={handleChange}
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

          {/* Weekly Off 2 */}

          <Grid size={{ xs: 6 }}>
            <TextField
              select
              fullWidth
              label="Weekly Off 2"
              name="weeklyOff2"
              value={form.weeklyOff2}
              onChange={handleChange}
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

          {/* Remarks */}

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