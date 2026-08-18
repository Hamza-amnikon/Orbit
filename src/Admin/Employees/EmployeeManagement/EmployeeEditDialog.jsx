import { useEffect, useState } from "react";
import axios from "axios";
import dayjs from "dayjs";

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Button,
  Grid,
  InputAdornment,
  IconButton,
  CircularProgress,
} from "@mui/material";

import {
  Close,
  Person,
  Email,
  Phone,
  Apartment,
  Work,
  LocationOn,
  Save,
} from "@mui/icons-material";

import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";


function EmployeeEditDialog({
  open,
  employee,
  onClose,
  onUpdated,
}) {

  // =========================================================
  // API URLs
  // =========================================================

  const EMPLOYEE_API =
    "https://localhost:7002/api/Employee";

  const EMPLOYEE_TYPE_API =
    "https://localhost:7084/api/EmployeeType";

  const LOCATION_API =
    "https://localhost:7281/api/Location/active";

  const DESIGNATION_API =
    "https://localhost:7009/api/Designation";

  const DEPARTMENT_API =
    "https://localhost:7240/api/Department";

  const ROLE_API =
    "https://localhost:7294/api/Role/active";


  // =========================================================
  // EMPLOYEE FIELDS
  // =========================================================

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [gender, setGender] = useState("");

  const [managerId, setManagerId] = useState("");


  // =========================================================
  // EMPLOYMENT FIELDS
  // =========================================================

  const [department, setDepartment] = useState("");
  const [role, setRole] = useState("");
  const [designation, setDesignation] = useState("");
  const [employeeType, setEmployeeType] = useState("");

  const [location, setLocation] = useState("");

  const [joiningDate, setJoiningDate] = useState("");

  const [status, setStatus] = useState("Active");


  // =========================================================
  // DROPDOWN DATA
  // =========================================================

  const [departments, setDepartments] = useState([]);
  const [roles, setRoles] = useState([]);
  const [designations, setDesignations] = useState([]);
  const [employeeTypes, setEmployeeTypes] = useState([]);
  const [locations, setLocations] = useState([]);


  // =========================================================
  // STATE
  // =========================================================

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);


  // =========================================================
  // LOAD DROPDOWNS
  // =========================================================

  useEffect(() => {

    if (!open) {
      return;
    }

    loadDepartments();
    loadRoles();
    loadDesignations();
    loadEmployeeTypes();
    loadLocations();

  }, [open]);


  // =========================================================
  // LOAD SELECTED EMPLOYEE
  // =========================================================

  useEffect(() => {

    if (!open || !employee) {
      return;
    }

    loadEmployee(employee.employeeId);

  }, [open, employee]);


  // =========================================================
  // LOAD EMPLOYEE DETAILS
  // =========================================================

  async function loadEmployee(employeeId) {

    try {

      setLoading(true);

      console.log(
        "Loading employee:",
        employeeId
      );


      const response = await axios.get(
        `${EMPLOYEE_API}/${employeeId}`
      );


      const data = response.data;


      console.log(
        "Employee Details:",
        data
      );


      // =====================================================
      // PERSONAL INFORMATION
      // =====================================================

      if (
        data.firstName !== undefined &&
        data.firstName !== null
      ) {

        setFirstName(
          data.firstName || ""
        );

      } else {

        const fullName =
          data.employeeName?.trim() || "";

        const nameParts =
          fullName.split(/\s+/);

        setFirstName(
          nameParts.shift() || ""
        );

        setLastName(
          nameParts.join(" ") || ""
        );

      }


      if (
        data.lastName !== undefined &&
        data.lastName !== null
      ) {

        setLastName(
          data.lastName || ""
        );

      }


      setEmail(
        data.email || ""
      );


      setMobile(
        data.mobile || ""
      );


      setGender(
        data.gender || ""
      );


      // =====================================================
      // MANAGER
      // =====================================================

      setManagerId(
        data.managerId !== null &&
        data.managerId !== undefined
          ? String(data.managerId)
          : ""
      );


      // =====================================================
      // DEPARTMENT
      // =====================================================

      setDepartment(
        data.department || ""
      );


      // =====================================================
      // ROLE
      // =====================================================

      setRole(
        data.role || ""
      );


      // =====================================================
      // DESIGNATION
      // =====================================================

      setDesignation(
        data.designation || ""
      );


      // =====================================================
      // EMPLOYEE TYPE
      // =====================================================

      setEmployeeType(
        data.employeeType || ""
      );


      // =====================================================
      // LOCATION
      // =====================================================

      if (
        data.locationId !== null &&
        data.locationId !== undefined
      ) {

        setLocation(
          String(data.locationId)
        );

      } else {

        setLocation(
          data.location || ""
        );

      }


      // =====================================================
      // JOINING DATE
      // =====================================================

      if (data.joiningDate) {

        setJoiningDate(
          dayjs(data.joiningDate).format(
            "YYYY-MM-DD"
          )
        );

      } else {

        setJoiningDate("");

      }


      // =====================================================
      // STATUS
      // =====================================================

      setStatus(
        data.status || "Active"
      );


    } catch (error) {

      console.error(
        "Error loading employee:",
        error
      );

      if (error.response) {

        console.error(
          "API Response:",
          error.response.data
        );

      }

      alert(
        "Unable to load employee details."
      );

    } finally {

      setLoading(false);

    }

  }


  // =========================================================
  // LOAD DEPARTMENTS
  // =========================================================

  async function loadDepartments() {

    try {

      const response =
        await axios.get(
          DEPARTMENT_API
        );

      console.log(
        "Departments:",
        response.data
      );

      setDepartments(
        response.data || []
      );

    } catch (error) {

      console.error(
        "Department Error:",
        error
      );

    }

  }


  // =========================================================
  // LOAD ROLES
  // =========================================================

  async function loadRoles() {

    try {

      const response =
        await axios.get(
          ROLE_API
        );

      console.log(
        "Roles:",
        response.data
      );

      setRoles(
        response.data || []
      );

    } catch (error) {

      console.error(
        "Role Error:",
        error
      );

    }

  }


  // =========================================================
  // LOAD DESIGNATIONS
  // =========================================================

  async function loadDesignations() {

    try {

      const response =
        await axios.get(
          DESIGNATION_API
        );

      console.log(
        "Designations:",
        response.data
      );

      setDesignations(
        response.data || []
      );

    } catch (error) {

      console.error(
        "Designation Error:",
        error
      );

    }

  }


  // =========================================================
  // LOAD EMPLOYEE TYPES
  // =========================================================

  async function loadEmployeeTypes() {

    try {

      const response =
        await axios.get(
          EMPLOYEE_TYPE_API
        );

      console.log(
        "Employee Types:",
        response.data
      );

      setEmployeeTypes(
        response.data || []
      );

    } catch (error) {

      console.error(
        "Employee Type Error:",
        error
      );

    }

  }


  // =========================================================
  // LOAD LOCATIONS
  // =========================================================

  async function loadLocations() {

    try {

      const response =
        await axios.get(
          LOCATION_API
        );

      console.log(
        "Locations:",
        response.data
      );

      setLocations(
        response.data || []
      );

    } catch (error) {

      console.error(
        "Location Error:",
        error
      );

    }

  }


  // =========================================================
  // VALIDATION
  // =========================================================

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

    String(location).trim() !== "" &&

    joiningDate.trim() !== "" &&

    status.trim() !== "";


  // =========================================================
  // UPDATE EMPLOYEE
  // =========================================================

  async function updateEmployee() {

    // -------------------------------------------------------
    // Employee validation
    // -------------------------------------------------------

    if (!employee?.employeeId) {

      alert(
        "Employee ID is missing."
      );

      return;

    }


    // -------------------------------------------------------
    // Form validation
    // -------------------------------------------------------



    // =======================================================
    // FIND LOCATION
    // =======================================================

    const selectedLocation =
      locations.find(
        (item) =>
          String(item.locationId) ===
          String(location)
      );


    // =======================================================
    // EMPLOYEE PAYLOAD
    // =======================================================

    const employeeData = {

      employeeId:
        employee.employeeId,


      // -----------------------------------------------------
      // Personal
      // -----------------------------------------------------

      firstName:
        firstName.trim(),

      lastName:
        lastName.trim(),

      email:
        email.trim(),

      mobile:
        mobile.trim(),

      gender:
        gender,


      // -----------------------------------------------------
      // Manager
      // -----------------------------------------------------

      managerId:
        managerId.trim(),


      // -----------------------------------------------------
      // Employment
      // -----------------------------------------------------

      department:
        department,

      role:
        role,

      designation:
        designation,

      employeeType:
        employeeType,


      // -----------------------------------------------------
      // Location
      // -----------------------------------------------------

      location:
        selectedLocation?.locationName ||
        location,


      // -----------------------------------------------------
      // Joining
      // -----------------------------------------------------

      joiningDate:
        joiningDate,


      // -----------------------------------------------------
      // Status
      // -----------------------------------------------------

      status:
        status

    };


    console.log(
      "Updating Employee:",
      employeeData
    );


    // =======================================================
    // API CALL
    // =======================================================

    try {

      setSaving(true);


      const response =
        await axios.put(
          `${EMPLOYEE_API}/${employee.employeeId}`,
          employeeData
        );


      console.log(
        "Employee Updated:",
        response.data
      );


      // =====================================================
      // SUCCESS
      // =====================================================

      alert(
        "Employee updated successfully."
      );


      // =====================================================
      // REFRESH EMPLOYEE LIST
      // =====================================================

      if (onUpdated) {

        await onUpdated();

      }


      // =====================================================
      // CLOSE DIALOG
      // =====================================================

      onClose();


    } catch (error) {

      console.error(
        "Update Employee Error:",
        error
      );


      // =====================================================
      // API ERROR
      // =====================================================

      if (error.response) {

        console.error(
          "Status:",
          error.response.status
        );


        console.error(
          "API Response:",
          error.response.data
        );


        const message =
          error.response.data?.message ||
          error.response.data?.title ||
          "Unable to update employee.";


        alert(message);

      } else {

        alert(
          "Unable to connect to the Employee API."
        );

      }

    } finally {

      setSaving(false);

    }

  }


  // =========================================================
  // CLOSE DIALOG
  // =========================================================

  function handleClose() {

    if (saving) {
      return;
    }

    onClose();

  }


  // =========================================================
  // DISPLAY EMPLOYEE ID
  // =========================================================

  function getEmployeeDisplayId() {

    if (employee?.azureEmployeeId) {

      return employee.azureEmployeeId;

    }

    if (employee?.employeeCode) {

      return employee.employeeCode;

    }

    if (employee?.employeeId) {

      return employee.employeeId;

    }

    return "";

  }


  // =========================================================
  // RENDER
  // =========================================================

  return (

    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      maxWidth="md"
    >


      {/* ===================================================
          TITLE
      =================================================== */}

      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontWeight: 700,
        }}
      >

        Edit Employee


        <IconButton
          onClick={handleClose}
          disabled={saving}
        >

          <Close />

        </IconButton>

      </DialogTitle>


      {/* ===================================================
          CONTENT
      =================================================== */}

      <DialogContent dividers>

        {loading ? (

          <div
            style={{
              minHeight: 400,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "column",
              gap: 15,
            }}
          >

            <CircularProgress />

            <span>
              Loading employee details...
            </span>

          </div>

        ) : (

          <LocalizationProvider
            dateAdapter={AdapterDayjs}
          >

            <Grid
              container
              spacing={2}
              sx={{ pt: 1 }}
            >


              {/* =================================================
                  EMPLOYEE ID
              ================================================= */}

              <Grid size={{ xs: 12 }}>

                <TextField
                  fullWidth
                  label="Employee ID"
                  value={getEmployeeDisplayId()}
                  disabled
                />

              </Grid>


              {/* =================================================
                  FIRST NAME
              ================================================= */}

              <Grid
                size={{
                  xs: 12,
                  md: 6
                }}
              >

                <TextField
                  fullWidth
         
                  label="First Name"
                  value={firstName}
                  onChange={(e) =>
                    setFirstName(
                      e.target.value
                    )
                  }
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment
                          position="start"
                        >
                          <Person />
                        </InputAdornment>
                      ),
                    },
                  }}
                />

              </Grid>


              {/* =================================================
                  LAST NAME
              ================================================= */}

              <Grid
                size={{
                  xs: 12,
                  md: 6
                }}
              >

                <TextField
                  fullWidth
   
                  label="Last Name"
                  value={lastName}
                  onChange={(e) =>
                    setLastName(
                      e.target.value
                    )
                  }
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment
                          position="start"
                        >
                          <Person />
                        </InputAdornment>
                      ),
                    },
                  }}
                />

              </Grid>


              {/* =================================================
                  EMAIL
              ================================================= */}

              <Grid
                size={{
                  xs: 12,
                  md: 6
                }}
              >

                <TextField
                  fullWidth
            
                  type="email"
                  label="Email"
                  value={email}
                  onChange={(e) =>
                    setEmail(
                      e.target.value
                    )
                  }
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment
                          position="start"
                        >
                          <Email />
                        </InputAdornment>
                      ),
                    },
                  }}
                />

              </Grid>


              {/* =================================================
                  MOBILE
              ================================================= */}

              <Grid
                size={{
                  xs: 12,
                  md: 6
                }}
              >

                <TextField
                  fullWidth
           
                  label="Mobile"
                  value={mobile}
                  onChange={(e) =>
                    setMobile(
                      e.target.value
                    )
                  }
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment
                          position="start"
                        >
                          <Phone />
                        </InputAdornment>
                      ),
                    },
                  }}
                />

              </Grid>


              {/* =================================================
                  GENDER
              ================================================= */}

              <Grid
                size={{
                  xs: 12,
                  md: 6
                }}
              >

                <TextField
                  select
                  fullWidth
          
                  label="Gender"
                  value={gender}
                  onChange={(e) =>
                    setGender(
                      e.target.value
                    )
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

              </Grid>


              {/* =================================================
                  MANAGER ID
              ================================================= */}

              <Grid
                size={{
                  xs: 12,
                  md: 6
                }}
              >

                <TextField
                  fullWidth
           
                  label="Manager ID"
                  value={managerId}
                  onChange={(e) =>
                    setManagerId(
                      e.target.value
                    )
                  }
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment
                          position="start"
                        >
                          <Person />
                        </InputAdornment>
                      ),
                    },
                  }}
                />

              </Grid>


              {/* =================================================
                  DEPARTMENT
              ================================================= */}

              <Grid
                size={{
                  xs: 12,
                  md: 6
                }}
              >

                <TextField
                  select
                  fullWidth
              
                  label="Department"
                  value={department}
                  onChange={(e) =>
                    setDepartment(
                      e.target.value
                    )
                  }
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment
                          position="start"
                        >
                          <Apartment />
                        </InputAdornment>
                      ),
                    },
                  }}
                >

                  <MenuItem value="">
                    Select Department
                  </MenuItem>


                  {departments.map(
                    (item) => (

                      <MenuItem
                        key={
                          item.departmentId
                        }
                        value={
                          item.departmentName
                        }
                      >

                        {
                          item.departmentName
                        }

                      </MenuItem>

                    )
                  )}

                </TextField>

              </Grid>


              {/* =================================================
                  ROLE
              ================================================= */}

              <Grid
                size={{
                  xs: 12,
                  md: 6
                }}
              >

                <TextField
                  select
                  fullWidth
                  label="Role"
                  value={role}
                  onChange={(e) =>
                    setRole(
                      e.target.value
                    )
                  }
                >

                  <MenuItem value="">
                    Select Role
                  </MenuItem>


                  {roles.map(
                    (item) => (

                      <MenuItem
                        key={
                          item.roleId
                        }
                        value={
                          item.role
                        }
                      >

                        {
                          item.role
                        }

                      </MenuItem>

                    )
                  )}

                </TextField>

              </Grid>


              {/* =================================================
                  DESIGNATION
              ================================================= */}

              <Grid
                size={{
                  xs: 12,
                  md: 6
                }}
              >

                <TextField
                  select
                  fullWidth
         
                  label="Designation"
                  value={designation}
                  onChange={(e) =>
                    setDesignation(
                      e.target.value
                    )
                  }
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment
                          position="start"
                        >
                          <Work />
                        </InputAdornment>
                      ),
                    },
                  }}
                >

                  <MenuItem value="">
                    Select Designation
                  </MenuItem>


                  {designations.map(
                    (item) => (

                      <MenuItem
                        key={
                          item.designationId
                        }
                        value={
                          item.designationName
                        }
                      >

                        {
                          item.designationName
                        }

                      </MenuItem>

                    )
                  )}

                </TextField>

              </Grid>


              {/* =================================================
                  EMPLOYEE TYPE
              ================================================= */}

              <Grid
                size={{
                  xs: 12,
                  md: 6
                }}
              >

                <TextField
                  select
                  fullWidth
            
                  label="Employee Type"
                  value={employeeType}
                  onChange={(e) =>
                    setEmployeeType(
                      e.target.value
                    )
                  }
                >

                  <MenuItem value="">
                    Select Employee Type
                  </MenuItem>


                  {employeeTypes.map(
                    (item) => (

                      <MenuItem
                        key={
                          item.employeeTypeId
                        }
                        value={
                          item.employeeTypeName
                        }
                      >

                        {
                          item.employeeTypeName
                        }

                      </MenuItem>

                    )
                  )}

                </TextField>

              </Grid>


              {/* =================================================
                  LOCATION
              ================================================= */}

              <Grid
                size={{
                  xs: 12,
                  md: 6
                }}
              >

                <TextField
                  select
                  fullWidth
       
                  label="Location"
                  value={location}
                  onChange={(e) =>
                    setLocation(
                      e.target.value
                    )
                  }
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment
                          position="start"
                        >
                          <LocationOn />
                        </InputAdornment>
                      ),
                    },
                  }}
                >

                  <MenuItem value="">
                    Select Location
                  </MenuItem>


                  {locations.map(
                    (item) => (

                      <MenuItem
                        key={
                          item.locationId
                        }
                        value={
                          item.locationId
                        }
                      >

                        {
                          item.locationName
                        }

                      </MenuItem>

                    )
                  )}

                </TextField>

              </Grid>


              {/* =================================================
                  JOINING DATE
              ================================================= */}

              <Grid
                size={{
                  xs: 12,
                  md: 6
                }}
              >

                <DatePicker
                  label="Joining Date"
                  value={
                    joiningDate
                      ? dayjs(
                          joiningDate
                        )
                      : null
                  }
                  onChange={(value) => {

                    setJoiningDate(
                      value
                        ? value.format(
                            "YYYY-MM-DD"
                          )
                        : ""
                    );

                  }}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                
                    },
                  }}
                />

              </Grid>


              {/* =================================================
                  STATUS
              ================================================= */}

              <Grid
                size={{
                  xs: 12,
                  md: 6
                }}
              >

                <TextField
                  select
                  fullWidth
            
                  label="Status"
                  value={status}
                  onChange={(e) =>
                    setStatus(
                      e.target.value
                    )
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

            </Grid>

          </LocalizationProvider>

        )}

      </DialogContent>


      {/* =====================================================
          ACTIONS
      ===================================================== */}

      <DialogActions
        sx={{
          p: 2
        }}
      >

        <Button
          variant="outlined"
          onClick={handleClose}
          disabled={saving}
        >

          Cancel

        </Button>


        <Button
          variant="contained"
          startIcon={
            saving ? (
              <CircularProgress
                size={18}
                color="inherit"
              />
            ) : (
              <Save />
            )
          }
          onClick={updateEmployee}
        
        >

          {saving
            ? "Updating..."
            : "Update Employee"}

        </Button>

      </DialogActions>

    </Dialog>

  );

}


export default EmployeeEditDialog;