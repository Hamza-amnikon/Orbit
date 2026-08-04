import "./EmployeeForm.css";

import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";

import dayjs from "dayjs";

import {
  Save,
  Badge,
  Email,
  Phone,
  Apartment,
  Work,
  BusinessCenter,
  LocationOn,
  Person,
} from "@mui/icons-material";

import { TextField, MenuItem, Button, InputAdornment } from "@mui/material";

function EmployeeForm({
  employeeCode = "Auto Generated",

  // =========================
  // Personal Information
  // =========================

  firstName = "",
  setFirstName,

  lastName = "",
  setLastName,

  email = "",
  setEmail,

  mobile = "",
  setMobile,

  gender = "",
  setGender,

  managerId = "",
  setManagerId,

  // =========================
  // Employment Information
  // =========================

  department = "",
  setDepartment,
  departments = [],

  designation = "",
  setDesignation,
  designations = [],

  employeeType = "",
  setEmployeeType,
  employeeTypes = [],

  location = "",
  setLocation,
  locations = [],

  joiningDate = "",
  setJoiningDate,

  status = "Active",
  setStatus,

  role = "",
  setRole,
  roles = [],

  // =========================
  // Actions
  // =========================

  addEmployee,
}) {
  const isFormValid =
    firstName.trim() !== "" &&
    lastName.trim() !== "" &&
    email.trim() !== "" &&
    mobile.trim() !== "" &&
    gender.trim() !== "" &&
    managerId.trim() !== "" &&
    department.trim() !== "" &&
    designation.trim() !== "" &&
    employeeType.trim() !== "" &&
    location.toString().trim() !== "" &&
    joiningDate.toString().trim() !== "" &&
    status.trim() !== "";

  return (
    <div className="employee-form-card">
      {/* ================= Header ================= */}

      <div className="form-header">
        <div>
          <h2>Add Employee</h2>

          <p>Create a new employee profile for your organization.</p>
        </div>

        <div className="employee-avatar">
          <div className="avatar-circle">
            <Person sx={{ fontSize: 42 }} />
          </div>
        </div>
      </div>

      {/* ================= Personal Information ================= */}

      <div className="form-section">
        <h3>Personal Information</h3>

        <div className="form-grid">
          {/* Employee ID */}

          {/* <TextField
            fullWidth
            label="Employee ID"
            value={employeeCode}
            InputProps={{
              readOnly: true,
              startAdornment: (
                <InputAdornment position="start">
                  <Badge />
                </InputAdornment>
              ),
            }}
          /> */}

          {/* Employee Name */}

          <TextField
            fullWidth
            required
            label="Employee First Name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Person />
                </InputAdornment>
              ),
            }}
          />

          <TextField
            fullWidth
            required
            label="Employee Last Name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Person />
                </InputAdornment>
              ),
            }}
          />

          {/* Email */}

          <TextField
            fullWidth
            required
            type="email"
            label="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Email />
                </InputAdornment>
              ),
            }}
          />

          {/* Mobile */}

          <TextField
            fullWidth
            required
            label="Mobile Number"
            value={mobile}
            onChange={(e) => setMobile(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Phone />
                </InputAdornment>
              ),
            }}
          />

          {/* Gender */}

          <TextField
            select
            fullWidth
            required
            label="Gender"
            value={gender}
            onChange={(e) => setGender(e.target.value)}
          >
            <MenuItem value="">Select Gender</MenuItem>
            <MenuItem value="Male">Male</MenuItem>
            <MenuItem value="Female">Female</MenuItem>
            <MenuItem value="Other">Other</MenuItem>
          </TextField>

          <TextField
            fullWidth
            required
            label="Manager Id"
            value={managerId}
            onChange={(e) => setManagerId(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Person />
                </InputAdornment>
              ),
            }}
          />
        </div>
      </div>

      {/* ================= Employment Details ================= */}

      <div className="form-section">
        <h3>Employment Details</h3>

        <div className="form-grid">
          {/* Department */}

          <TextField
            select
            fullWidth
            label="Department"
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Apartment />
                </InputAdornment>
              ),
            }}
          >
            <MenuItem value="">Select Department</MenuItem>

            {departments.map((dept) => (
              <MenuItem key={dept.departmentId} value={dept.departmentName}>
                {dept.departmentName}
              </MenuItem>
            ))}
          </TextField>

          {/* Designation */}

          <TextField
            select
            fullWidth
            required
            label="Role"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          >
            <MenuItem value="">Select Role</MenuItem>

            {roles.map((item) => (
              <MenuItem key={item.roleId} value={item.role}>
                {item.role}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            select
            fullWidth
            required
            label="Designation"
            value={designation}
            onChange={(e) => setDesignation(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Work />
                </InputAdornment>
              ),
            }}
          >
            <MenuItem value="">Select Designation</MenuItem>

            {designations.map((item) => (
              <MenuItem key={item.designationId} value={item.designationName}>
                {item.designationName}
              </MenuItem>
            ))}
          </TextField>
          {/* Employee Type */}

<TextField
    select
    fullWidth
    required
    label="Employee Type"
    value={employeeType}
    onChange={(e) => setEmployeeType(e.target.value)}
>
    <MenuItem value="">
        Select Employee Type
    </MenuItem>

    {employeeTypes.map((type) => (
        <MenuItem
            key={type.employeeTypeId}
            value={type.employeeTypeName}
        >
            {type.employeeTypeName}
        </MenuItem>
    ))}
</TextField>

          {/* Location */}

          <TextField
            select
            fullWidth
            required
            label="Location"
            value={location}
            onChange={(e) => setLocation(Number(e.target.value))}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LocationOn />
                </InputAdornment>
              ),
            }}
          >
            <MenuItem value="">Select Location</MenuItem>

            {locations.map((loc) => (
              <MenuItem key={loc.locationId} value={loc.locationId}>
                {loc.locationName}
              </MenuItem>
            ))}
          </TextField>

          {/* Joining Date */}

          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
              label="Joining Date"
              value={joiningDate ? dayjs(joiningDate) : null}
              onChange={(newValue) =>
                setJoiningDate(newValue ? newValue.format("YYYY-MM-DD") : "")
              }
              slotProps={{
                textField: {
                  fullWidth: true,
                  required: true,
                },
              }}
            />
          </LocalizationProvider>

          {/* Status */}

          <TextField
            select
            fullWidth
            required
            label="Status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <MenuItem value="Active">Active</MenuItem>

            <MenuItem value="Inactive">Inactive</MenuItem>
          </TextField>
        </div>
      </div>

      {/* ================= Actions ================= */}

      <div className="form-actions">
        <Button variant="outlined" size="large">
          Cancel
        </Button>

        <Button
          variant="contained"
          size="large"
          startIcon={<Save />}
          onClick={addEmployee}
          disabled={!isFormValid}
        >
          Save Employee
        </Button>
      </div>
    </div>
  );
}

export default EmployeeForm;
