import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import * as XLSX from "xlsx";

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
  ArrowBack,
  ArrowForward,
} from "@mui/icons-material";

import {
  Button,
  Alert,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  TextField,
  InputAdornment,
  Card,
  CardContent,
  MenuItem,
  Select,
  FormControl,
  CardActionArea,
  IconButton,
  Tooltip,
} from "@mui/material";

import { useAuth } from "../../../context/AuthContext";
import { Box as MuiLayoutBox, Typography as MuiText } from "@mui/material";


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
    hasPermission,
  } = useAuth();


  // ==========================================
  // PERMISSIONS
  // ==========================================

  const permissionRoute = "/employees/list";

  const canView = hasPermission(permissionRoute, "view");
  const canCreate = hasPermission(permissionRoute, "create");
  const canEdit = hasPermission(permissionRoute, "edit");
  const canDelete = hasPermission(permissionRoute, "delete");
  const canExport = hasPermission(permissionRoute, "export");


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
    `${import.meta.env.VITE_EMPLOYEE_API_BASE_URL}/api/Employee`;

  const SYNC_API =
   `${import.meta.env.VITE_EMPLOYEE_SYNC_API_BASE_URL}/api/sync`;


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

  const [toast, setToast] = useState({ open: false, message: "", severity: "info" });
  const [employeeToDelete, setEmployeeToDelete] = useState(null);
  const [syncInProgress, setSyncInProgress] = useState(false);
  const [syncDialog, setSyncDialog] = useState({ open: false, message: "", severity: "success" });

  const showToast = (message, severity = "info") =>
    setToast({ open: true, message, severity });


  // ==========================================
  // INITIAL LOAD
  // ==========================================

  useEffect(() => {

    if (isAuthenticated && canView) {
      fetchEmployees();
    }

  }, [isAuthenticated, canView]);


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

        showToast("Your login session has expired. Please login again.", "error");

        localStorage.removeItem("token");

        navigate("/login");

        return;
      }


      if (
        error.response?.status === 403
      ) {

        showToast("You are not authorized to view employees.", "error");

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

    if (!canEdit) {
      return;
    }

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

    if (!canDelete) {
      return;
    }

    // ------------------------------------------
    // AUTH CHECK
    // ------------------------------------------

    if (!isAuthenticated) {

      showToast("You are not authenticated. Please login again.", "error");

      navigate("/login");

      return;
    }


    const token =
      localStorage.getItem("token");


    if (!token) {

      showToast("Authentication token is missing. Please login again.", "error");

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


      showToast("Employee deleted successfully.", "success");

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

        showToast("Your login session has expired. Please login again.", "error");

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

        showToast("You are not authorized to delete this employee.", "error");

        return;

      }


      // ----------------------------------------
      // API ERROR
      // ----------------------------------------

      if (error.response) {

        showToast(error.response.data?.message || "Unable to delete employee.", "error");

      }
      else {

        showToast("Unable to connect to the server.", "error");

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


  const exportEmployeesToExcel = () => {
    if (filteredEmployees.length === 0) return;

    const exportData = filteredEmployees.map((employee) => ({
      "Employee ID": employee.azureEmployeeId || "-",
      "Employee Name": employee.employeeName || "-",
      Email: employee.email || "-",
      Mobile: employee.mobile || "-",
      Gender: employee.gender || "-",
      Department: employee.department || "-",
      Designation: employee.designation || "-",
      "Joining Date": employee.joiningDate
        ? new Date(employee.joiningDate).toLocaleDateString("en-GB")
        : "-",
      Status: employee.status || "-",
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    worksheet["!cols"] = [
      { wch: 16 }, { wch: 30 }, { wch: 38 }, { wch: 18 },
      { wch: 14 }, { wch: 22 }, { wch: 28 }, { wch: 16 }, { wch: 14 },
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Employees");
    const date = new Date().toISOString().slice(0, 10);
    XLSX.writeFile(workbook, `Spark_Employees_${date}.xlsx`);
  };


  const resetEmployeeFilters = () => {
    setSearch("");
    setDepartmentFilter("All");
    setStatusFilter("All");
  };


  // ==========================================
  // SYNC AZURE AD
  // ==========================================

  async function syncEmployees() {

    if (!isAuthenticated) {

      showToast("You are not authenticated. Please login again.", "error");

      navigate("/login");

      return;
    }


    const token =
      localStorage.getItem("token");


    if (!token) {

      showToast("Authentication token is missing. Please login again.", "error");

      navigate("/login");

      return;
    }


    try {

      setSyncInProgress(true);
      setSyncDialog({ open: true, message: "Contacting the employee directory and updating the list…", severity: "info" });


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


      setSyncDialog({ open: true, message: response.data?.message || "Employees synchronized successfully.", severity: "success" });

    }
    catch (error) {

      console.error(
        "Sync Employee Error:",
        error
      );


      if (
        error.response?.status === 401
      ) {

        showToast("Your login session has expired. Please login again.", "error");

        localStorage.removeItem("token");

        navigate("/login");

        return;

      }


      if (
        error.response?.status === 403
      ) {

        setSyncDialog({ open: true, message: "You are not authorized to synchronize employees.", severity: "error" });

        return;

      }


      if (error.response) {

        setSyncDialog({ open: true, message: error.response.data?.message || "Synchronization failed.", severity: "error" });

      }
      else {

        setSyncDialog({ open: true, message: "Unable to connect to the Sync Service.", severity: "error" });

      }

    }
    finally {

      setSyncInProgress(false);

    }

  }


  // ==========================================
  // RENDER
  // ==========================================

  if (!canView) {
    return null;
  }

  return (

    <MuiLayoutBox className="employee-list-page" component="div">


      {/* ======================================
          HEADER
      ====================================== */}

      <MuiLayoutBox className="employee-page-header" component="div">

        <MuiLayoutBox className="employee-page-title" component="div">

          <Tooltip title="Back to employee management">
            <IconButton
              className="employee-back-button"
              aria-label="Back to employee management"
              onClick={() => navigate("/employees")}
            >
              <ArrowBack />
            </IconButton>
          </Tooltip>

          <MuiLayoutBox component="div">

          <MuiText component="h1" variant="h4">
            Employee Management
          </MuiText>

          <MuiText component="p" variant="body1">
            Manage, search and organize
            employees across your organization.
          </MuiText>

          </MuiLayoutBox>

        </MuiLayoutBox>


        <MuiLayoutBox className="header-buttons" component="div">


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

          {canExport && (
            <Button
              variant="outlined"
              startIcon={<Download />}
              onClick={exportEmployeesToExcel}
              disabled={loading || filteredEmployees.length === 0}
              aria-label={`Export ${filteredEmployees.length} displayed employees to Excel`}
            >
              Export Excel
            </Button>
          )}


          {/* Sync */}

          <Button
            variant="contained"
            color="success"
            startIcon={syncInProgress ? <CircularProgress size={17} color="inherit" /> : <Sync />}
            onClick={syncEmployees}
            disabled={loading || syncInProgress}
          >
            {syncInProgress ? "Syncing employees…" : "Sync Azure AD"}
          </Button>


          {/* Add Employee */}

          {canCreate && (
            <Button
              className="employee-add-button"
              variant="contained"
              startIcon={<Add />}
              onClick={() =>
                navigate("/employees/add")
              }
            >
              Add Employee
            </Button>
          )}

        </MuiLayoutBox>

      </MuiLayoutBox>


      {/* ======================================
          AUTHENTICATED USER
      ====================================== */}

      <MuiLayoutBox
        style={{
          display: "none",
        }}
       component="div">
        Logged In EmployeeId:
        {currentEmployeeId}
      </MuiLayoutBox>


      {/* ======================================
          STATISTICS
      ====================================== */}

      <MuiLayoutBox className="stats-grid" component="div">


        {/* Total */}

        <Card className={`stats-card ${statusFilter === "All" && (search || departmentFilter !== "All") ? "is-selected" : ""}`}>

          <CardActionArea
            className="stats-card-action-area"
            onClick={resetEmployeeFilters}
            aria-label={`Show all ${totalEmployees} employees`}
          >
          <CardContent>

            <MuiLayoutBox className="stats-icon blue" component="div">
              <Groups />
            </MuiLayoutBox>

            <MuiText component="span" variant="inherit">
              Total Employees
            </MuiText>

            <MuiText component="h2" variant="h5">
              {totalEmployees}
            </MuiText>

            <MuiText className="stats-card-hint" component="span" variant="body2">
              View all employees <ArrowForward />
            </MuiText>

          </CardContent>
          </CardActionArea>

        </Card>


        {/* Active */}

        <Card className={`stats-card ${statusFilter === "Active" ? "is-selected" : ""}`}>

          <CardActionArea
            className="stats-card-action-area"
            onClick={() => setStatusFilter(statusFilter === "Active" ? "All" : "Active")}
            aria-label={`Filter to ${activeEmployees} active employees`}
            aria-pressed={statusFilter === "Active"}
          >
          <CardContent>

            <MuiLayoutBox className="stats-icon green" component="div">
              <Person />
            </MuiLayoutBox>

            <MuiText component="span" variant="inherit">
              Active Employees
            </MuiText>

            <MuiText component="h2" variant="h5">
              {activeEmployees}
            </MuiText>

            <MuiText className="stats-card-hint" component="span" variant="body2">
              {statusFilter === "Active" ? "Clear active filter" : "Show active employees"} <ArrowForward />
            </MuiText>

          </CardContent>
          </CardActionArea>

        </Card>


        {/* Inactive */}

        <Card className={`stats-card ${statusFilter === "Inactive" ? "is-selected" : ""}`}>

          <CardActionArea
            className="stats-card-action-area"
            onClick={() => setStatusFilter(statusFilter === "Inactive" ? "All" : "Inactive")}
            aria-label={`Filter to ${inactiveEmployees} inactive employees`}
            aria-pressed={statusFilter === "Inactive"}
          >
          <CardContent>

            <MuiLayoutBox className="stats-icon red" component="div">
              <PersonOff />
            </MuiLayoutBox>

            <MuiText component="span" variant="inherit">
              Inactive Employees
            </MuiText>

            <MuiText component="h2" variant="h5">
              {inactiveEmployees}
            </MuiText>

            <MuiText className="stats-card-hint" component="span" variant="body2">
              {statusFilter === "Inactive" ? "Clear inactive filter" : "Show inactive employees"} <ArrowForward />
            </MuiText>

          </CardContent>
          </CardActionArea>

        </Card>


        {/* Departments */}

        <Card className="stats-card">

          <CardActionArea
            className="stats-card-action-area"
            onClick={() => navigate("/employees/departments")}
            aria-label={`Open departments management for ${totalDepartments} departments`}
          >
          <CardContent>

            <MuiLayoutBox className="stats-icon purple" component="div">
              <Business />
            </MuiLayoutBox>

            <MuiText component="span" variant="inherit">
              Departments
            </MuiText>

            <MuiText component="h2" variant="h5">
              {totalDepartments}
            </MuiText>

            <MuiText className="stats-card-hint" component="span" variant="body2">
              Manage departments <ArrowForward />
            </MuiText>

          </CardContent>
          </CardActionArea>

        </Card>

      </MuiLayoutBox>


      {/* ======================================
          SEARCH & FILTERS
      ====================================== */}

      <Card className="toolbar-card">

        <CardContent>

          <MuiLayoutBox className="toolbar" component="div">


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

          </MuiLayoutBox>

        </CardContent>

      </Card>


      {/* ======================================
          EMPLOYEE TABLE
      ====================================== */}

      {loading ? (

        <MuiLayoutBox className="loading-card" component="div">

          <MuiLayoutBox className="loader" component="div"></MuiLayoutBox>

          <MuiText component="h3" variant="h6">
            Loading Employees...
          </MuiText>

          <MuiText component="p" variant="body1">
            Please wait while we fetch
            employee records.
          </MuiText>

        </MuiLayoutBox>

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

            <MuiText component="h2" variant="h5">
              No Employees Found
            </MuiText>

            <MuiText component="p" variant="body1">
              Try changing the search
              text or filters.
            </MuiText>

          </CardContent>

        </Card>

      ) : (

        <Card className="table-card">

          <CardContent>

            <EmployeeTable
              employees={filteredEmployees}
              editEmployee={editEmployee}
              deleteEmployee={(id) => {
                const employee = employees.find((item) => item.employeeId === id);
                setEmployeeToDelete(employee || { employeeId: id });
              }}
              onNotify={showToast}
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
        onNotify={showToast}
      />

      <Dialog
        open={Boolean(employeeToDelete)}
        onClose={() => setEmployeeToDelete(null)}
        aria-labelledby="delete-employee-title"
      >
        <DialogTitle id="delete-employee-title">Delete employee?</DialogTitle>
        <DialogContent>
          Are you sure you want to delete {employeeToDelete?.employeeName || "this employee"}?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEmployeeToDelete(null)}>Cancel</Button>
          <Button
            color="error"
            variant="contained"
            onClick={async () => {
              const id = employeeToDelete?.employeeId;
              setEmployeeToDelete(null);
              if (id) await deleteEmployee(id);
            }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={toast.open}
        autoHideDuration={5000}
        onClose={() => setToast((current) => ({ ...current, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={() => setToast((current) => ({ ...current, open: false }))}
          severity={toast.severity}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {toast.message}
        </Alert>
      </Snackbar>

      <Dialog
        open={syncDialog.open}
        onClose={() => {
          if (!syncInProgress) setSyncDialog((current) => ({ ...current, open: false }));
        }}
        aria-labelledby="employee-sync-title"
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle id="employee-sync-title">
          {syncInProgress ? "Syncing employees" : "Employee sync"}
        </DialogTitle>
        <DialogContent>
          {syncInProgress ? (
            <MuiLayoutBox sx={{ display: "flex", alignItems: "center", gap: 2, py: 1 }} component="div">
              <CircularProgress size={24} />
              <MuiText component="p" variant="body1">{syncDialog.message}</MuiText>
            </MuiLayoutBox>
          ) : (
            <Alert severity={syncDialog.severity} sx={{ mt: 1 }}>
              {syncDialog.message}
            </Alert>
          )}
        </DialogContent>
        {!syncInProgress && (
          <DialogActions>
            <Button variant="contained" onClick={() => setSyncDialog((current) => ({ ...current, open: false }))}>
              OK
            </Button>
          </DialogActions>
        )}
      </Dialog>

    </MuiLayoutBox>

  );
}


export default EmployeeList;
