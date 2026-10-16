import "./EmployeeForm.css";

import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";

import dayjs from "dayjs";

import {
  Save,
  Email,
  Phone,
  Apartment,
  Work,
  BusinessCenter,
  LocationOn,
  Person,
} from "@mui/icons-material";

import {
  TextField,
  MenuItem,
  Button,
  InputAdornment,
  Alert,
} from "@mui/material";

import { useAuth } from "../../../context/AuthContext";
import { Box as MuiLayoutBox, Typography as MuiText } from "@mui/material";


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
  onCancel,

}) {


  // =====================================================
  // AUTHENTICATED EMPLOYEE
  // =====================================================

  const {
    profile,
    employeeId,
    employeeCode: loggedInEmployeeCode,
    employeeName,
    email: loggedInEmail,
    isAuthenticated,
  } = useAuth();


  // =====================================================
  // CURRENT EMPLOYEE ID
  // =====================================================

  const currentEmployeeId =
    employeeId ??
    profile?.employeeId ??
    profile?.EmployeeId ??
    null;


  // =====================================================
  // CURRENT EMPLOYEE CODE
  // =====================================================

  const currentEmployeeCode =
    loggedInEmployeeCode ??
    profile?.employeeCode ??
    profile?.EmployeeCode ??
    employeeCode ??
    "Auto Generated";


  // =====================================================
  // CURRENT EMPLOYEE NAME
  // =====================================================

  const currentEmployeeName =
    employeeName ??
    profile?.employeeName ??
    profile?.EmployeeName ??
    profile?.displayName ??
    profile?.DisplayName ??
    "Employee";


  // =====================================================
  // FORM VALIDATION
  // =====================================================

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


  // =====================================================
  // AUTHENTICATION VALIDATION
  // =====================================================

  const canSave =
    isFormValid &&
    isAuthenticated &&
    !!currentEmployeeId;


  // =====================================================
  // SAVE HANDLER
  // =====================================================

  const handleSave = () => {

    if (!isAuthenticated) {

      alert(
        "You are not authenticated. Please login again."
      );

      return;
    }


    if (!currentEmployeeId) {

      console.error(
        "EmployeeForm: Logged-in EmployeeId is missing."
      );

      alert(
        "Your Employee ID could not be determined. Please login again."
      );

      return;
    }


    // ---------------------------------------------------
    // DEBUG
    // ---------------------------------------------------

    console.log(
      "=========================================="
    );

    console.log(
      "EmployeeForm - Save Employee"
    );

    console.log(
      "Logged-in EmployeeId:",
      currentEmployeeId
    );

    console.log(
      "Logged-in EmployeeCode:",
      currentEmployeeCode
    );

    console.log(
      "Logged-in EmployeeName:",
      currentEmployeeName
    );

    console.log(
      "Logged-in Email:",
      loggedInEmail
    );

    console.log(
      "=========================================="
    );


    // ---------------------------------------------------
    // IMPORTANT
    // ---------------------------------------------------
    //
    // We do NOT allow the user to type CreatedBy.
    //
    // AddEmployee.jsx will perform the API request.
    // The backend should derive CreatedBy from JWT.
    //

    addEmployee();
  };


  return (

    <MuiLayoutBox className="employee-form-card" component="div">


      {/* =================================================
          HEADER
      ================================================= */}

      <MuiLayoutBox className="form-header" component="div">

        <MuiLayoutBox className="form-title-group" component="div">

          <MuiLayoutBox className="form-title-icon" component="div" aria-hidden="true">
            <Person />
          </MuiLayoutBox>

          <MuiLayoutBox component="div">

          <MuiText component="h2" variant="h5">
            Add Employee
          </MuiText>

          <MuiText component="p" variant="body1">
            Create a new employee profile for your organization.
          </MuiText>
          <MuiText className="required-fields-note" component="p" variant="caption">
            Fields marked * are required.
          </MuiText>

          </MuiLayoutBox>

        </MuiLayoutBox>

      </MuiLayoutBox>


      {/* =================================================
          PERSONAL INFORMATION
      ================================================= */}

        <MuiLayoutBox className="form-section" component="section" aria-labelledby="add-employee-personal-heading">

        <MuiLayoutBox className="form-section-heading" component="div">
          <MuiLayoutBox className="form-section-icon" component="div" aria-hidden="true"><Person /></MuiLayoutBox>
          <MuiLayoutBox component="div">
            <MuiText id="add-employee-personal-heading" component="h3" variant="h6">Personal Information</MuiText>
            <MuiText component="p" variant="body2">Enter the employee’s contact and identity details.</MuiText>
          </MuiLayoutBox>
        </MuiLayoutBox>


        <MuiLayoutBox className="form-grid" component="div">


          {/* Employee ID */}

          {/*
          <TextField
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
          />
          */}


          {/* Employee First Name */}

          <TextField
            fullWidth
            required
            label="Employee First Name"
            value={firstName}
            onChange={(e) =>
              setFirstName(e.target.value)
            }
            slotProps={{ input: {
              startAdornment: (
                <InputAdornment position="start">
                  <Person />
                </InputAdornment>
              ),
            } }}
          />


          {/* Employee Last Name */}

          <TextField
            fullWidth
            required
            label="Employee Last Name"
            value={lastName}
            onChange={(e) =>
              setLastName(e.target.value)
            }
            slotProps={{ input: {
              startAdornment: (
                <InputAdornment position="start">
                  <Person />
                </InputAdornment>
              ),
            } }}
          />


          {/* Email */}

          <TextField
            fullWidth
            required
            type="email"
            label="Email Address"
            value={email}
            onChange={(e) =>
              setEmail(e.target.value)
            }
            slotProps={{ input: {
              startAdornment: (
                <InputAdornment position="start">
                  <Email />
                </InputAdornment>
              ),
            } }}
          />


          {/* Mobile */}

          <TextField
            fullWidth
            required
            label="Mobile Number"
            value={mobile}
            onChange={(e) =>
              setMobile(e.target.value)
            }
            slotProps={{ input: {
              startAdornment: (
                <InputAdornment position="start">
                  <Phone />
                </InputAdornment>
              ),
            } }}
          />


          {/* Gender */}

          <TextField
            select
            fullWidth
            required
            label="Gender"
            value={gender}
            onChange={(e) =>
              setGender(e.target.value)
            }
          >

            <MenuItem value="">
              Select Gender
            </MenuItem>

            <MenuItem value="Male">
              Male
            </MenuItem>

            <MenuItem value="Female">
              Female
            </MenuItem>

            <MenuItem value="Other">
              Other
            </MenuItem>

          </TextField>


          {/* Manager ID */}

          <TextField
            fullWidth
            required
            label="Manager ID"
            value={managerId}
            onChange={(e) =>
              setManagerId(e.target.value)
            }
            slotProps={{ input: {
              startAdornment: (
                <InputAdornment position="start">
                  <Person />
                </InputAdornment>
              ),
            } }}
          />

        </MuiLayoutBox>

      </MuiLayoutBox>


      {/* =================================================
          EMPLOYMENT DETAILS
      ================================================= */}

        <MuiLayoutBox className="form-section" component="section" aria-labelledby="add-employee-work-heading">

        <MuiLayoutBox className="form-section-heading" component="div">
          <MuiLayoutBox className="form-section-icon" component="div" aria-hidden="true"><BusinessCenter /></MuiLayoutBox>
          <MuiLayoutBox component="div">
            <MuiText id="add-employee-work-heading" component="h3" variant="h6">Employment Details</MuiText>
            <MuiText component="p" variant="body2">Set the employee’s role, team, location, and start date.</MuiText>
          </MuiLayoutBox>
        </MuiLayoutBox>


        <MuiLayoutBox className="form-grid" component="div">


          {/* Department */}

          <TextField
            select
            fullWidth
            required
            label="Department"
            value={department}
            onChange={(e) =>
              setDepartment(e.target.value)
            }
            slotProps={{ input: {
              startAdornment: (
                <InputAdornment position="start">
                  <Apartment />
                </InputAdornment>
              ),
            } }}
          >

            <MenuItem value="">
              Select Department
            </MenuItem>

            {departments.map((dept) => (

              <MenuItem
                key={dept.departmentId}
                value={dept.departmentName}
              >
                {dept.departmentName}
              </MenuItem>

            ))}

          </TextField>


          {/* Role */}

          <TextField
            select
            fullWidth
            required
            label="Role"
            value={role}
            onChange={(e) =>
              setRole(e.target.value)
            }
          >

            <MenuItem value="">
              Select Role
            </MenuItem>

            {roles.map((item) => (

              <MenuItem
                key={item.roleId}
                value={item.role}
              >
                {item.role}
              </MenuItem>

            ))}

          </TextField>


          {/* Designation */}

          <TextField
            select
            fullWidth
            required
            label="Designation"
            value={designation}
            onChange={(e) =>
              setDesignation(e.target.value)
            }
            slotProps={{ input: {
              startAdornment: (
                <InputAdornment position="start">
                  <Work />
                </InputAdornment>
              ),
            } }}
          >

            <MenuItem value="">
              Select Designation
            </MenuItem>

            {designations.map((item) => (

              <MenuItem
                key={item.designationId}
                value={item.designationName}
              >
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
            onChange={(e) =>
              setEmployeeType(e.target.value)
            }
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
            onChange={(e) =>
              setLocation(Number(e.target.value))
            }
            slotProps={{ input: {
              startAdornment: (
                <InputAdornment position="start">
                  <LocationOn />
                </InputAdornment>
              ),
            } }}
          >

            <MenuItem value="">
              Select Location
            </MenuItem>

            {locations.map((loc) => (

              <MenuItem
                key={loc.locationId}
                value={loc.locationId}
              >
                {loc.locationName}
              </MenuItem>

            ))}

          </TextField>


          {/* Joining Date */}

          <LocalizationProvider
            dateAdapter={AdapterDayjs}
          >

            <DatePicker
              label="Joining Date"
              value={
                joiningDate
                  ? dayjs(joiningDate)
                  : null
              }
              onChange={(newValue) =>
                setJoiningDate(
                  newValue
                    ? newValue.format("YYYY-MM-DD")
                    : ""
                )
              }
              slotProps={{
                textField: {
                  fullWidth: true,
                  required: true,
                  size: "small",
                  variant: "outlined",
                  className: "employee-date-picker",
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
            onChange={(e) =>
              setStatus(e.target.value)
            }
          >

            <MenuItem value="Active">
              Active
            </MenuItem>

            <MenuItem value="Inactive">
              Inactive
            </MenuItem>

          </TextField>

        </MuiLayoutBox>

      </MuiLayoutBox>


      {/* =================================================
          ACTIONS
      ================================================= */}

      <MuiLayoutBox className="form-actions" component="div">

        {!isFormValid && (
          <MuiText className="form-action-hint" component="p" variant="body2" aria-live="polite">
            Complete the required fields to enable saving.
          </MuiText>
        )}


        {/* CANCEL */}

        <Button
          variant="outlined"
          size="large"
          onClick={onCancel}
          type="button"
        >
          Cancel
        </Button>


        {/* SAVE */}

        <Button
          variant="contained"
          size="large"
          startIcon={<Save />}
          onClick={handleSave}
          disabled={!canSave}
          type="button"
        >
          Save Employee
        </Button>

      </MuiLayoutBox>


      {/* =================================================
          AUTH WARNING
      ================================================= */}

      {!isAuthenticated && (
        <Alert className="employee-form-alert" severity="error">
          Authentication is required to save an employee. Please sign in again.
        </Alert>
      )}

      {isAuthenticated && !currentEmployeeId && (
        <Alert className="employee-form-alert" severity="error">
          Your employee ID is unavailable. Please sign in again.
        </Alert>
      )}

    </MuiLayoutBox>
  );
}


export default EmployeeForm;
