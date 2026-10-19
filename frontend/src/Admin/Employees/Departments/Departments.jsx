import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";
import "./Department.css";

import {
  getDepartments,
  createDepartment,
  updateDepartment as updateDepartmentApi,
  deleteDepartment as deleteDepartmentApi,
} from "./DepartmentService";

import AddDepartment from "./AddDepartment";
import EditDepartment from "./EditDepartment";
import DepartmentTable from "./DepartmentTable";

import {
  Add,
  Refresh,
  Download,
  Category,
  CheckCircle,
  Cancel,
  Search,
  ArrowBack,
} from "@mui/icons-material";

import {
  Button,
  Card,
  CardContent,
  TextField,
  InputAdornment,
  FormControl,
  Select,
  MenuItem,
  CardActionArea,
  IconButton,
  Tooltip,
  Alert,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";

import { useAuth } from "../../../context/AuthContext";
import { Box as MuiLayoutBox, Typography as MuiText } from "@mui/material";


function Department() {

  const navigate = useNavigate();

  // =====================================================
  // AUTHENTICATED EMPLOYEE
  // =====================================================

  const {
    user,
    profile,
    employeeId,
    employeeCode,
    employeeName,
    isAuthenticated,
    hasPermission,
  } = useAuth();

  // =====================================================
  // PERMISSIONS
  // =====================================================

  const permissionRoute = "/employees/departments";

  const canView = hasPermission(permissionRoute, "view");
  const canCreate = hasPermission(permissionRoute, "create");
  const canEdit = hasPermission(permissionRoute, "edit");
  const canDelete = hasPermission(permissionRoute, "delete");
  const canExport = hasPermission(permissionRoute, "export");


  // =====================================================
  // NORMALIZED LOGGED-IN EMPLOYEE
  // =====================================================

  const currentEmployeeId =
    employeeId ??
    profile?.employeeId ??
    profile?.EmployeeId ??
    user?.employeeId ??
    user?.EmployeeId ??
    null;


  const currentEmployeeCode =
    employeeCode ??
    profile?.employeeCode ??
    profile?.EmployeeCode ??
    user?.employeeCode ??
    user?.EmployeeCode ??
    null;


  const currentEmployeeName =
    employeeName ??
    profile?.employeeName ??
    profile?.EmployeeName ??
    profile?.displayName ??
    profile?.DisplayName ??
    user?.employeeName ??
    user?.EmployeeName ??
    user?.displayName ??
    user?.DisplayName ??
    "Employee";


  // =====================================================
  // STATE
  // =====================================================

  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState("");

  const [statusFilter, setStatusFilter] =
    useState("All");

  const [departments, setDepartments] =
    useState([]);

  const [openAddDialog, setOpenAddDialog] =
    useState(false);

  const [openEditDialog, setOpenEditDialog] =
    useState(false);

  const [selectedDepartment, setSelectedDepartment] =
    useState(null);

  const [toast, setToast] = useState({ open: false, message: "", severity: "info" });
  const [departmentToDelete, setDepartmentToDelete] = useState(null);

  const showToast = useCallback((message, severity = "info") => {
    setToast({ open: true, message, severity });
  }, []);


  // =====================================================
  // AUTH DEBUG
  // =====================================================

  useEffect(() => {

    console.log(
      "=========================================="
    );

    console.log(
      "Department - Authenticated Employee"
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
      "=========================================="
    );

  }, [
    isAuthenticated,
    currentEmployeeId,
    currentEmployeeCode,
    currentEmployeeName,
  ]);


  // =====================================================
  // LOAD DEPARTMENTS
  // =====================================================

  const loadDepartments = useCallback(async () => {

    if (!isAuthenticated) {

      console.warn(
        "Department: User is not authenticated."
      );

      return;
    }

    try {

      setLoading(true);

      console.log(
        "Department: Loading departments..."
      );

      const response =
        await getDepartments();

      /*
       * API may return either:
       *
       * []
       *
       * or
       *
       * { data: [] }
       */

      const data =
        Array.isArray(response)
          ? response
          : Array.isArray(response?.data)
            ? response.data
            : [];

      setDepartments(data);

      console.log(
        "Department: Departments loaded:",
        data.length
      );

    } catch (error) {

      console.error(
        "Department: Error loading departments:",
        error
      );

      if (
        error?.response?.status === 401
      ) {

        showToast("Your session has expired. Please login again.", "error");

        localStorage.removeItem("token");

        navigate("/login");

        return;
      }

      if (
        error?.response?.status === 403
      ) {

        showToast("You are not authorized to access departments.", "error");

        return;
      }

      showToast("Unable to load departments.", "error");

    } finally {

      setLoading(false);

    }

  }, [
    isAuthenticated,
    navigate,
    canView,
    showToast,
  ]);


  // =====================================================
  // INITIAL LOAD
  // =====================================================

  useEffect(() => {

    if (isAuthenticated && canView) {
      loadDepartments();
    }

  }, [
    isAuthenticated,
    canView,
    loadDepartments,
  ]);


  // =====================================================
  // REFRESH
  // =====================================================

  const refreshData = async () => {

    await loadDepartments();

  };


  // =====================================================
  // SEARCH + STATUS FILTER
  // =====================================================

  const filteredDepartments =
    departments.filter((item) => {

      const keyword =
        search.trim().toLowerCase();


      const departmentName =
        item.departmentName
          ?.toString()
          .toLowerCase() || "";


      const description =
        item.description
          ?.toString()
          .toLowerCase() || "";


      const status =
        item.status
          ?.toString()
          .toLowerCase() || "";


      const matchesSearch =
        !keyword ||
        departmentName.includes(keyword) ||
        description.includes(keyword) ||
        status.includes(keyword);


      const matchesStatus =
        statusFilter === "All" ||
        status ===
          statusFilter.toLowerCase();


      return (
        matchesSearch &&
        matchesStatus
      );

    });

  const activeDepartmentCount = departments.filter(
    (item) => item.status?.toLowerCase() === "active"
  ).length;
  const inactiveDepartmentCount = departments.filter(
    (item) => item.status?.toLowerCase() === "inactive"
  ).length;

  const resetDepartmentFilters = () => {
    setSearch("");
    setStatusFilter("All");
  };

  const exportDepartmentsToExcel = () => {
    if (!filteredDepartments.length) {
      showToast("There are no departments to export.", "info");
      return;
    }

    const rows = filteredDepartments.map((item, index) => ({
      "No.": index + 1,
      Department: item.departmentName || "-",
      Description: item.description || "-",
      "Created Date": item.createdDate
        ? new Date(item.createdDate).toLocaleDateString("en-GB")
        : "-",
      Status: item.status || "-",
    }));
    const worksheet = XLSX.utils.json_to_sheet(rows);
    worksheet["!cols"] = [
      { wch: 8 }, { wch: 28 }, { wch: 42 }, { wch: 18 }, { wch: 14 },
    ];
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Departments");
    XLSX.writeFile(workbook, `Spark_Departments_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };


  // =====================================================
  // OPEN EDIT
  // =====================================================

  const editDepartment = (department) => {

    if (!canEdit) {
      return;
    }

    if (!isAuthenticated) {

      showToast("You are not authenticated. Please login again.", "error");

      return;
    }


    if (!currentEmployeeId) {

      showToast("Your Employee ID could not be determined.", "error");

      return;
    }


    console.log(
      "=========================================="
    );

    console.log(
      "DEPARTMENT EDIT"
    );

    console.log(
      "DepartmentId:",
      department?.departmentId
    );

    console.log(
      "Updated By EmployeeId:",
      currentEmployeeId
    );

    console.log(
      "Updated By EmployeeCode:",
      currentEmployeeCode
    );

    console.log(
      "Updated By EmployeeName:",
      currentEmployeeName
    );

    console.log(
      "=========================================="
    );


    setSelectedDepartment(
      department
    );

    setOpenEditDialog(true);

  };


  // =====================================================
  // DELETE
  // =====================================================

  const deleteDepartment =
    async (id) => {

      if (!canDelete) {
        return;
      }

      if (!isAuthenticated) {

        showToast("You are not authenticated. Please login again.", "error");

        return;
      }


      if (!currentEmployeeId) {

        showToast("Your Employee ID could not be determined.", "error");

        return;
      }


      try {

        console.log(
          "=========================================="
        );

        console.log(
          "DEPARTMENT DELETE"
        );

        console.log(
          "DepartmentId:",
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


        await deleteDepartmentApi(id);


        await loadDepartments();


        showToast("Department deleted successfully.", "success");

      } catch (error) {

        console.error(
          "Department delete error:",
          error
        );


        if (
          error?.response?.status === 401
        ) {

          showToast("Your session has expired. Please login again.", "error");

          return;
        }


        if (
          error?.response?.status === 403
        ) {

          showToast("You are not authorized to delete departments.", "error");

          return;
        }


        showToast(error?.response?.data?.message || error?.response?.data || "Unable to delete Department.", "error");

      }

    };


  // =====================================================
  // CREATE
  // =====================================================

  const saveDepartment =
    async (data) => {

      if (!canCreate) {
        throw new Error(
          "You are not authorized to create departments."
        );
      }

      if (!isAuthenticated) {

        throw new Error(
          "You are not authenticated."
        );

      }


      if (!currentEmployeeId) {

        throw new Error(
          "Authenticated Employee ID could not be determined."
        );

      }


      try {

        console.log(
          "=========================================="
        );

        console.log(
          "DEPARTMENT CREATE"
        );

        console.log(
          "Created By EmployeeId:",
          currentEmployeeId
        );

        console.log(
          "Created By EmployeeCode:",
          currentEmployeeCode
        );

        console.log(
          "Created By EmployeeName:",
          currentEmployeeName
        );

        console.log(
          "Department:",
          data?.departmentName
        );

        console.log(
          "=========================================="
        );


        /*
         * IMPORTANT:
         *
         * We intentionally do NOT add createdBy
         * here.
         *
         * Backend should get the EmployeeId
         * directly from the JWT.
         */

        await createDepartment(data);


        setOpenAddDialog(false);


        await loadDepartments();


        showToast("Department added successfully.", "success");

      } catch (error) {

        console.error(
          "Department create error:",
          error
        );


        if (
          error?.response?.status === 401
        ) {

          throw new Error(
            "Your session has expired. Please login again."
          );

        }


        if (
          error?.response?.status === 403
        ) {

          throw new Error(
            "You are not authorized to create departments."
          );

        }


        throw new Error(
          error?.response?.data ||
          "Unable to create Department."
        );

      }

    };


  // =====================================================
  // UPDATE
  // =====================================================

  const updateDepartment =
    async (data) => {

      if (!canEdit) {
        throw new Error(
          "You are not authorized to edit departments."
        );
      }

      if (!isAuthenticated) {

        throw new Error(
          "You are not authenticated."
        );

      }


      if (!currentEmployeeId) {

        throw new Error(
          "Authenticated Employee ID could not be determined."
        );

      }


      if (!selectedDepartment?.departmentId) {

        throw new Error(
          "Department ID is missing."
        );

      }


      try {

        console.log(
          "=========================================="
        );

        console.log(
          "DEPARTMENT UPDATE"
        );

        console.log(
          "DepartmentId:",
          selectedDepartment.departmentId
        );

        console.log(
          "Updated By EmployeeId:",
          currentEmployeeId
        );

        console.log(
          "Updated By EmployeeCode:",
          currentEmployeeCode
        );

        console.log(
          "Updated By EmployeeName:",
          currentEmployeeName
        );

        console.log(
          "=========================================="
        );


        /*
         * Do NOT send updatedBy from React.
         *
         * Backend should derive it from JWT.
         */

        await updateDepartmentApi(
          selectedDepartment.departmentId,
          data
        );


        setOpenEditDialog(false);

        setSelectedDepartment(null);


        await loadDepartments();


        showToast("Department updated successfully.", "success");

      } catch (error) {

        console.error(
          "Department update error:",
          error
        );


        if (
          error?.response?.status === 401
        ) {

          throw new Error(
            "Your session has expired. Please login again."
          );

        }


        if (
          error?.response?.status === 403
        ) {

          throw new Error(
            "You are not authorized to update departments."
          );

        }


        throw new Error(
          error?.response?.data ||
          "Unable to update Department."
        );

      }

    };


  // =====================================================
  // PERMISSION SCREEN
  // =====================================================

  if (!canView) {
    return null;
  }


  // =====================================================
  // AUTHENTICATION SCREEN
  // =====================================================

  if (!isAuthenticated) {

    return (

      <MuiLayoutBox
        className="department-page"
        style={{
          padding: "40px",
          textAlign: "center",
        }}
       component="div">

        <MuiText component="h2" variant="h5">
          Authentication Required
        </MuiText>

        <MuiText component="p" variant="body1">
          Please sign in to access Department Management.
        </MuiText>

        <Button
          variant="contained"
          onClick={() =>
            navigate("/login")
          }
        >
          Go to Login
        </Button>

      </MuiLayoutBox>

    );

  }


  // =====================================================
  // UI
  // =====================================================

  return (

    <MuiLayoutBox className="department-page" component="div">


      {/* ==================================================
          HEADER
      ================================================== */}

      <MuiLayoutBox className="employee-page-header" component="div">

        <MuiLayoutBox className="department-page-title" component="div">

          <Tooltip title="Back to employee management">
            <IconButton
              className="department-back-button"
              aria-label="Back to employee management"
              onClick={() => navigate("/employees")}
            >
              <ArrowBack />
            </IconButton>
          </Tooltip>

          <MuiLayoutBox className="department-page-title-copy" component="div">
            <MuiText component="h1" variant="h4">
              Department Management
            </MuiText>

            <MuiText component="p" variant="body1">
              Manage departments across your organization.
            </MuiText>
          </MuiLayoutBox>

        </MuiLayoutBox>


        <MuiLayoutBox className="header-buttons" component="div">

          <Button
            variant="outlined"
            startIcon={
              <Refresh />
            }
            onClick={refreshData}
            disabled={loading}
          >
            Refresh
          </Button>


          {canExport && (
            <Button
              variant="outlined"
              startIcon={
                <Download />
              }
            onClick={exportDepartmentsToExcel}
            disabled={loading || filteredDepartments.length === 0}
            >
              Export Excel
            </Button>
          )}


          {canCreate && (
            <Button
              variant="contained"
              startIcon={
                <Add />
              }
              onClick={() =>
                setOpenAddDialog(true)
              }
              disabled={
                !currentEmployeeId
              }
            >
              Add Department
            </Button>
          )}

        </MuiLayoutBox>

      </MuiLayoutBox>


      {/* ==================================================
          AUTHENTICATED USER
      ================================================== */}

      {/* ==================================================
          STATISTICS
      ================================================== */}

      <MuiLayoutBox className="stats-grid" component="div">


        <Card className={`stats-card ${statusFilter === "All" && !search ? "is-selected" : ""}`}>
          <CardActionArea className="stats-card-action-area" onClick={resetDepartmentFilters} aria-label={`Show all ${departments.length} departments`}>
          <CardContent>

            <MuiLayoutBox className="stats-icon blue" component="div">
              <Category />
            </MuiLayoutBox>

            <MuiText component="span" variant="inherit">
              Total Departments
            </MuiText>

            <MuiText component="h2" variant="h5">
              {departments.length}
            </MuiText>

          </CardContent>
          </CardActionArea>
        </Card>


        <Card className={`stats-card ${statusFilter === "Active" ? "is-selected" : ""}`}>
          <CardActionArea className="stats-card-action-area" onClick={() => setStatusFilter(statusFilter === "Active" ? "All" : "Active")} aria-pressed={statusFilter === "Active"}>
          <CardContent>

            <MuiLayoutBox className="stats-icon green" component="div">
              <CheckCircle />
            </MuiLayoutBox>

            <MuiText component="span" variant="inherit">
              Active Departments
            </MuiText>

            <MuiText component="h2" variant="h5">
              {
                activeDepartmentCount
              }
            </MuiText>

          </CardContent>
          </CardActionArea>
        </Card>


        <Card className={`stats-card ${statusFilter === "Inactive" ? "is-selected" : ""}`}>
          <CardActionArea className="stats-card-action-area" onClick={() => setStatusFilter(statusFilter === "Inactive" ? "All" : "Inactive")} aria-pressed={statusFilter === "Inactive"}>
          <CardContent>

            <MuiLayoutBox className="stats-icon red" component="div">
              <Cancel />
            </MuiLayoutBox>

            <MuiText component="span" variant="inherit">
              Inactive Departments
            </MuiText>

            <MuiText component="h2" variant="h5">
              {
                inactiveDepartmentCount
              }
            </MuiText>

          </CardContent>
          </CardActionArea>
        </Card>

      </MuiLayoutBox>


      {/* ==================================================
          SEARCH + FILTER
      ================================================== */}

      <Card className="toolbar-card">

        <CardContent>

          <MuiLayoutBox className="department-filter-row" component="div">


            <MuiLayoutBox className="department-search" component="div">

              <TextField
                fullWidth
                placeholder="Search Department..."
                value={search}
                onChange={(e) =>
                  setSearch(
                    e.target.value
                  )
                }
                slotProps={{ input: {
                  startAdornment: (
                    <InputAdornment
                      position="start"
                    >
                      <Search />
                    </InputAdornment>
                  ),
                } }}
              />

            </MuiLayoutBox>


            <FormControl
              className="department-status-filter"
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


      {/* ==================================================
          TABLE
      ================================================== */}

      {loading ? (

        <Card className="table-card">

          <CardContent>

            <MuiText
              style={{
                textAlign: "center",
                padding: "40px",
              }}
             component="h3" variant="h6">
              Loading Departments...
            </MuiText>

          </CardContent>

        </Card>

      ) : (

        <Card className="table-card">

          <CardContent>

            <DepartmentTable
              departments={
                filteredDepartments
              }
              editDepartment={
                editDepartment
              }
              deleteDepartment={
                (id) => {
                  const department = departments.find((item) => item.departmentId === id);
                  setDepartmentToDelete(department || { departmentId: id });
                }
              }
              canEdit={canEdit}
              canDelete={canDelete}
            />

          </CardContent>

        </Card>

      )}


      {/* ==================================================
          ADD
      ================================================== */}

      {canCreate && (
        <AddDepartment
          open={openAddDialog}
        handleClose={() =>
          setOpenAddDialog(false)
        }
          onNotify={showToast}
          handleSave={
            saveDepartment
          }
        />
      )}


      {/* ==================================================
          EDIT
      ================================================== */}

      {canEdit && (
        <EditDepartment
          open={openEditDialog}
        department={
          selectedDepartment
        }
        onNotify={showToast}
        handleClose={() => {

          setOpenEditDialog(false);

          setSelectedDepartment(
            null
          );

        }}
          handleUpdate={
            updateDepartment
          }
        />
      )}

      <Dialog
        className="employee-type-dialog"
        open={Boolean(departmentToDelete)}
        onClose={() => setDepartmentToDelete(null)}
        aria-labelledby="delete-department-title"
      >
        <DialogTitle id="delete-department-title">Delete department?</DialogTitle>
        <DialogContent>
          Are you sure you want to delete {departmentToDelete?.departmentName || "this department"}?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDepartmentToDelete(null)}>Cancel</Button>
          <Button
            color="error"
            variant="contained"
            onClick={async () => {
              const id = departmentToDelete?.departmentId;
              setDepartmentToDelete(null);
              if (id) await deleteDepartment(id);
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


    </MuiLayoutBox>

  );

}


export default Department;
