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

import {
  TextField,
  MenuItem,
  Button,
  InputAdornment,
} from "@mui/material";

import { useAuth } from "../../../context/AuthContext";


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

    <div className="employee-form-card">


      {/* =================================================
          HEADER
      ================================================= */}

      <div className="form-header">

        <div>

          <h2>
            Add Employee
          </h2>

          <p>
            Create a new employee profile for your organization.
          </p>

        </div>


        <div className="employee-avatar">

          <div className="avatar-circle">

            <Person
              sx={{
                fontSize: 42
              }}
            />

          </div>

        </div>

      </div>


      {/* =================================================
          AUDIT INFORMATION
      ================================================= */}

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          padding: "12px 16px",
          marginBottom: "20px",
          borderRadius: "10px",
          background: "#f5f8ff",
          border: "1px solid #e2e8f0",
          fontSize: "14px",
        }}
      >

        <Badge
          sx={{
            color: "#2563eb"
          }}
        />

        <div>

          <div
            style={{
              fontWeight: 600,
              color: "#1e293b",
            }}
          >
            Logged in as
          </div>

          <div
            style={{
              color: "#64748b",
            }}
          >

            {currentEmployeeName}

            {currentEmployeeId && (
              <>
                {" "}
                • Employee ID: {currentEmployeeId}
              </>
            )}

          </div>

        </div>

      </div>


      {/* =================================================
          PERSONAL INFORMATION
      ================================================= */}

      <div className="form-section">

        <h3>
          Personal Information
        </h3>


        <div className="form-grid">


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
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Person />
                </InputAdornment>
              ),
            }}
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
            onChange={(e) =>
              setEmail(e.target.value)
            }
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
            onChange={(e) =>
              setMobile(e.target.value)
            }
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
            label="Manager Id"
            value={managerId}
            onChange={(e) =>
              setManagerId(e.target.value)
            }
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


      {/* =================================================
          EMPLOYMENT DETAILS
      ================================================= */}

      <div className="form-section">

        <h3>
          Employment Details
        </h3>


        <div className="form-grid">


          {/* Department */}

          <TextField
            select
            fullWidth
            label="Department"
            value={department}
            onChange={(e) =>
              setDepartment(e.target.value)
            }
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Apartment />
                </InputAdornment>
              ),
            }}
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
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Work />
                </InputAdornment>
              ),
            }}
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
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LocationOn />
                </InputAdornment>
              ),
            }}
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

        </div>

      </div>


      {/* =================================================
          ACTIONS
      ================================================= */}

      <div className="form-actions">


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

      </div>


      {/* =================================================
          AUTH WARNING
      ================================================= */}

      {!isAuthenticated && (

        <div
          style={{
            marginTop: "12px",
            textAlign: "right",
            color: "#dc2626",
            fontSize: "13px",
          }}
        >
          Authentication required to save an employee.
        </div>

      )}

      {isAuthenticated && !currentEmployeeId && (

        <div
          style={{
            marginTop: "12px",
            textAlign: "right",
            color: "#dc2626",
            fontSize: "13px",
          }}
        >
          Employee ID is not available. Please login again.
        </div>

      )}

    </div>
  );
}


export default EmployeeForm;