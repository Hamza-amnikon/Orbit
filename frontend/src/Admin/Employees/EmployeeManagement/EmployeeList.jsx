import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import EmployeeEditDialog from "./EmployeeEditDialog";
import EmployeeTable from "./EmployeeTable";
import "./EmployeeList.css";

import {
  Add,
  Refresh,
  Search,
  Download,
  Sync,
  Groups,
  Business,
  Person,
  PersonOff,
} from "@mui/icons-material";

import {
  Button,
  TextField,
  InputAdornment,
  Card,
  CardContent,
  MenuItem,
  Select,
  FormControl,
} from "@mui/material";

import { useAuth } from "../../../context/AuthContext";


function EmployeeList() {

  // ==========================================
  // AUTHENTICATED EMPLOYEE
  // ==========================================

  const {
    user,
    profile,
    employeeId,
    employeeCode,
    employeeName,
    isAuthenticated,
  } = useAuth();


  // ==========================================
  // CURRENT EMPLOYEE ID
  // ==========================================

  const currentEmployeeId =
    employeeId ??
    profile?.employeeId ??
    profile?.EmployeeId ??
    user?.employeeId ??
    user?.EmployeeId ??
    null;


  // ==========================================
  // CURRENT EMPLOYEE CODE
  // ==========================================

  const currentEmployeeCode =
    employeeCode ??
    profile?.employeeCode ??
    profile?.EmployeeCode ??
    user?.employeeCode ??
    user?.EmployeeCode ??
    null;


  // ==========================================
  // CURRENT EMPLOYEE NAME
  // ==========================================

  const currentEmployeeName =
    employeeName ??
    profile?.employeeName ??
    profile?.EmployeeName ??
    profile?.displayName ??
    profile?.DisplayName ??
    user?.employeeName ??
    user?.EmployeeName ??
    "Employee";


  // ==========================================
  // API
  // ==========================================

  const API =
    "https://localhost:7002/api/employee";

  const SYNC_API =
    "https://localhost:7205/api/sync";


  const navigate = useNavigate();


  // ==========================================
  // AUTH CONFIG
  // ==========================================

  const getAuthConfig = () => {

    const token =
      localStorage.getItem("token");

    return {
      headers: {
        Authorization: token
          ? `Bearer ${token}`
          : "",
        "Content-Type":
          "application/json",
      },
    };
  };


  // ==========================================
  // AUTH CHECK
  // ==========================================

  useEffect(() => {

    console.log(
      "=========================================="
    );

    console.log(
      "EmployeeList - Authenticated Employee"
    );

    console.log(
      "Authenticated:",
      isAuthenticated
    );

    console.log(
      "EmployeeId:",
      currentEmployeeId
    );

    console.log(
      "EmployeeCode:",
      currentEmployeeCode
    );

    console.log(
      "EmployeeName:",
      currentEmployeeName
    );

    console.log(
      "Token Exists:",
      !!localStorage.getItem("token")
    );

    console.log(
      "=========================================="
    );

  }, [
    isAuthenticated,
    currentEmployeeId,
    currentEmployeeCode,
    currentEmployeeName,
  ]);


  // ==========================================
  // EMPLOYEE DATA
  // ==========================================

  const [employees, setEmployees] =
    useState([]);

  const [loading, setLoading] =
    useState(true);


  // ==========================================
  // SEARCH & FILTERS
  // ==========================================

  const [search, setSearch] =
    useState("");

  const [departmentFilter, setDepartmentFilter] =
    useState("All");

  const [statusFilter, setStatusFilter] =
    useState("All");


  // ==========================================
  // EDIT EMPLOYEE DIALOG
  // ==========================================

  const [editDialogOpen, setEditDialogOpen] =
    useState(false);

  const [selectedEmployee, setSelectedEmployee] =
    useState(null);


  // ==========================================
  // INITIAL LOAD
  // ==========================================

  useEffect(() => {

    if (isAuthenticated) {
      fetchEmployees();
    }

  }, [isAuthenticated]);


  // ==========================================
  // FETCH EMPLOYEES
  // ==========================================

  async function fetchEmployees() {

    if (!isAuthenticated) {

      console.warn(
        "EmployeeList: User is not authenticated."
      );

      return;
    }


    const token =
      localStorage.getItem("token");


    if (!token) {

      console.warn(
        "EmployeeList: Authentication token missing."
      );

      return;
    }


    try {

      setLoading(true);


      console.log(
        "EmployeeList: Loading employees..."
      );


      const response =
        await axios.get(
          API,
          getAuthConfig()
        );


      console.log(
        "EmployeeList: Employees received:",
        response.data
      );


      setEmployees(
        response.data || []
      );

    }
    catch (error) {

      console.error(
        "Error fetching employees:",
        error
      );


      if (
        error.response?.status === 401
      ) {

        alert(
          "Your login session has expired. Please login again."
        );

        localStorage.removeItem("token");

        navigate("/login");

        return;
      }


      if (
        error.response?.status === 403
      ) {

        alert(
          "You are not authorized to view employees."
        );

        return;
      }


      setEmployees([]);

    }
    finally {

      setLoading(false);

    }

  }


  // ==========================================
  // OPEN EDIT DIALOG
  // ==========================================

  function editEmployee(employee) {

    console.log(
      "=========================================="
    );

    console.log(
      "Opening employee for edit:"
    );

    console.log(
      "Target Employee:",
      employee
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
      "=========================================="
    );


    setSelectedEmployee(employee);

    setEditDialogOpen(true);

  }


  // ==========================================
  // CLOSE EDIT DIALOG
  // ==========================================

  function closeEditDialog() {

    setEditDialogOpen(false);

    setSelectedEmployee(null);

  }


  // ==========================================
  // DELETE EMPLOYEE
  // ==========================================

  async function deleteEmployee(id) {

    const confirmDelete =
      window.confirm(
        "Are you sure you want to delete this employee?"
      );


    if (!confirmDelete) {
      return;
    }


    // ------------------------------------------
    // AUTH CHECK
    // ------------------------------------------

    if (!isAuthenticated) {

      alert(
        "You are not authenticated. Please login again."
      );

      navigate("/login");

      return;
    }


    const token =
      localStorage.getItem("token");


    if (!token) {

      alert(
        "Authentication token is missing. Please login again."
      );

      navigate("/login");

      return;
    }


    // ------------------------------------------
    // LOG
    // ------------------------------------------

    console.log(
      "=========================================="
    );

    console.log(
      "Deleting Employee"
    );

    console.log(
      "Target EmployeeId:",
      id
    );

    console.log(
      "Deleted By EmployeeId:",
      currentEmployeeId
    );

    console.log(
      "Deleted By EmployeeCode:",
      currentEmployeeCode
    );

    console.log(
      "Deleted By EmployeeName:",
      currentEmployeeName
    );

    console.log(
      "=========================================="
    );


    try {

      /*
       * IMPORTANT:
       *
       * We send the JWT.
       *
       * The backend should determine DeletedBy
       * from the JWT EmployeeId.
       *
       * We do NOT trust a manually supplied
       * DeletedBy value from React.
       */

      await axios.delete(
        `${API}/${id}`,
        getAuthConfig()
      );


      await fetchEmployees();


      alert(
        "Employee deleted successfully."
      );

    }
    catch (error) {

      console.error(
        "Delete Employee Error:",
        error
      );


      // ----------------------------------------
      // UNAUTHORIZED
      // ----------------------------------------

      if (
        error.response?.status === 401
      ) {

        alert(
          "Your login session has expired. Please login again."
        );

        localStorage.removeItem("token");

        navigate("/login");

        return;

      }


      // ----------------------------------------
      // FORBIDDEN
      // ----------------------------------------

      if (
        error.response?.status === 403
      ) {

        alert(
          "You are not authorized to delete this employee."
        );

        return;

      }


      // ----------------------------------------
      // API ERROR
      // ----------------------------------------

      if (error.response) {

        alert(
          error.response.data?.message ||
          "Unable to delete employee."
        );

      }
      else {

        alert(
          "Unable to connect to the server."
        );

      }

    }

  }


  // ==========================================
  // DEPARTMENTS
  // ==========================================

  const departments = useMemo(() => {

    return [
      "All",

      ...new Set(
        employees
          .map(
            (employee) =>
              employee.department
          )
          .filter(Boolean)
      ),

    ];

  }, [employees]);


  // ==========================================
  // FILTER EMPLOYEES
  // ==========================================

  const filteredEmployees =
    useMemo(() => {

      const keyword =
        search
          .toLowerCase()
          .trim();


      return employees.filter(
        (employee) => {

          const searchMatch =

            !keyword ||

            employee.employeeName
              ?.toLowerCase()
              .includes(keyword) ||

            employee.email
              ?.toLowerCase()
              .includes(keyword) ||

            employee.employeeCode
              ?.toLowerCase()
              .includes(keyword) ||

            employee.azureEmployeeId
              ?.toString()
              .toLowerCase()
              .includes(keyword) ||

            employee.department
              ?.toLowerCase()
              .includes(keyword) ||

            employee.designation
              ?.toLowerCase()
              .includes(keyword) ||

            employee.mobile
              ?.toLowerCase()
              .includes(keyword) ||

            employee.gender
              ?.toLowerCase()
              .includes(keyword) ||

            employee.status
              ?.toLowerCase()
              .includes(keyword);


          const departmentMatch =
            departmentFilter === "All" ||
            employee.department ===
              departmentFilter;


          const statusMatch =
            statusFilter === "All" ||
            employee.status ===
              statusFilter;


          return (
            searchMatch &&
            departmentMatch &&
            statusMatch
          );

        }
      );

    }, [
      employees,
      search,
      departmentFilter,
      statusFilter,
    ]);


  // ==========================================
  // STATISTICS
  // ==========================================

  const totalEmployees =
    employees.length;


  const activeEmployees =
    employees.filter(
      (employee) =>
        employee.status === "Active"
    ).length;


  const inactiveEmployees =
    employees.filter(
      (employee) =>
        employee.status === "Inactive"
    ).length;


  const totalDepartments =
    new Set(
      employees
        .map(
          (employee) =>
            employee.department
        )
        .filter(Boolean)
    ).size;


  // ==========================================
  // SYNC AZURE AD
  // ==========================================

  async function syncEmployees() {

    if (!isAuthenticated) {

      alert(
        "You are not authenticated. Please login again."
      );

      navigate("/login");

      return;
    }


    const token =
      localStorage.getItem("token");


    if (!token) {

      alert(
        "Authentication token is missing. Please login again."
      );

      navigate("/login");

      return;
    }


    try {

      setLoading(true);


      console.log(
        "=========================================="
      );

      console.log(
        "Azure AD Employee Sync"
      );

      console.log(
        "Requested By EmployeeId:",
        currentEmployeeId
      );

      console.log(
        "Requested By EmployeeCode:",
        currentEmployeeCode
      );

      console.log(
        "Requested By EmployeeName:",
        currentEmployeeName
      );

      console.log(
        "=========================================="
      );


      const response =
        await axios.post(
          SYNC_API,
          {},

          getAuthConfig()
        );


      await fetchEmployees();


      alert(
        response.data?.message ||
        "Employees synchronized successfully."
      );

    }
    catch (error) {

      console.error(
        "Sync Employee Error:",
        error
      );


      if (
        error.response?.status === 401
      ) {

        alert(
          "Your login session has expired. Please login again."
        );

        localStorage.removeItem("token");

        navigate("/login");

        return;

      }


      if (
        error.response?.status === 403
      ) {

        alert(
          "You are not authorized to synchronize employees."
        );

        return;

      }


      if (error.response) {

        alert(
          error.response.data?.message ||
          "Synchronization failed."
        );

      }
      else {

        alert(
          "Unable to connect to the Sync Service."
        );

      }

    }
    finally {

      setLoading(false);

    }

  }


  // ==========================================
  // RENDER
  // ==========================================

  return (

    <div className="employee-list-page">


      {/* ======================================
          HEADER
      ====================================== */}

      <div className="employee-page-header">

        <div>

          <h1>
            Employee Management
          </h1>

          <p>
            Manage, search and organize
            employees across your organization.
          </p>

        </div>


        <div className="header-buttons">


          {/* Previous */}

          <Button
            variant="outlined"
            onClick={() =>
              navigate("/employees")
            }
          >
            Previous
          </Button>


          {/* Refresh */}

          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={fetchEmployees}
            disabled={loading}
          >
            Refresh
          </Button>


          {/* Export */}

          <Button
            variant="outlined"
            startIcon={<Download />}
          >
            Export
          </Button>


          {/* Sync */}

          <Button
            variant="contained"
            color="success"
            startIcon={<Sync />}
            onClick={syncEmployees}
            disabled={loading}
          >
            Sync Azure AD
          </Button>


          {/* Add Employee */}

          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() =>
              navigate("/employees/add")
            }
          >
            Add Employee
          </Button>

        </div>

      </div>


      {/* ======================================
          AUTHENTICATED USER
      ====================================== */}

      <div
        style={{
          display: "none",
        }}
      >
        Logged In EmployeeId:
        {currentEmployeeId}
      </div>


      {/* ======================================
          STATISTICS
      ====================================== */}

      <div className="stats-grid">


        {/* Total */}

        <Card className="stats-card">

          <CardContent>

            <div className="stats-icon blue">
              <Groups />
            </div>

            <span>
              Total Employees
            </span>

            <h2>
              {totalEmployees}
            </h2>

          </CardContent>

        </Card>


        {/* Active */}

        <Card className="stats-card">

          <CardContent>

            <div className="stats-icon green">
              <Person />
            </div>

            <span>
              Active Employees
            </span>

            <h2>
              {activeEmployees}
            </h2>

          </CardContent>

        </Card>


        {/* Inactive */}

        <Card className="stats-card">

          <CardContent>

            <div className="stats-icon red">
              <PersonOff />
            </div>

            <span>
              Inactive Employees
            </span>

            <h2>
              {inactiveEmployees}
            </h2>

          </CardContent>

        </Card>


        {/* Departments */}

        <Card className="stats-card">

          <CardContent>

            <div className="stats-icon purple">
              <Business />
            </div>

            <span>
              Departments
            </span>

            <h2>
              {totalDepartments}
            </h2>

          </CardContent>

        </Card>

      </div>


      {/* ======================================
          SEARCH & FILTERS
      ====================================== */}

      <Card className="toolbar-card">

        <CardContent>

          <div className="toolbar">


            {/* Search */}

            <TextField
              fullWidth
              placeholder="Search by name, email or employee ID..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  ),
                },
              }}
            />


            {/* Department */}

            <FormControl
              sx={{
                minWidth: 200
              }}
            >

              <Select
                value={departmentFilter}
                onChange={(e) =>
                  setDepartmentFilter(
                    e.target.value
                  )
                }
                displayEmpty
              >

                {departments.map(
                  (department) => (

                    <MenuItem
                      key={department}
                      value={department}
                    >

                      {department === "All"
                        ? "All Departments"
                        : department}

                    </MenuItem>

                  )
                )}

              </Select>

            </FormControl>


            {/* Status */}

            <FormControl
              sx={{
                minWidth: 180
              }}
            >

              <Select
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(
                    e.target.value
                  )
                }
                displayEmpty
              >

                <MenuItem value="All">
                  All Status
                </MenuItem>

                <MenuItem value="Active">
                  Active
                </MenuItem>

                <MenuItem value="Inactive">
                  Inactive
                </MenuItem>

              </Select>

            </FormControl>

          </div>

        </CardContent>

      </Card>


      {/* ======================================
          EMPLOYEE TABLE
      ====================================== */}

      {loading ? (

        <div className="loading-card">

          <div className="loader"></div>

          <h3>
            Loading Employees...
          </h3>

          <p>
            Please wait while we fetch
            employee records.
          </p>

        </div>

      ) : filteredEmployees.length === 0 ? (

        <Card className="empty-card">

          <CardContent>

            <Groups
              sx={{
                fontSize: 70,
                color: "#94a3b8",
                mb: 2,
              }}
            />

            <h2>
              No Employees Found
            </h2>

            <p>
              Try changing the search
              text or filters.
            </p>

          </CardContent>

        </Card>

      ) : (

        <Card className="table-card">

          <CardContent>

            <EmployeeTable
              employees={filteredEmployees}
              editEmployee={editEmployee}
              deleteEmployee={deleteEmployee}
            />

          </CardContent>

        </Card>

      )}


      {/* ======================================
          EDIT EMPLOYEE DIALOG
      ====================================== */}

      <EmployeeEditDialog
        open={editDialogOpen}
        employee={selectedEmployee}
        onClose={closeEditDialog}
        onUpdated={fetchEmployees}
      />

    </div>

  );
}


export default EmployeeList;