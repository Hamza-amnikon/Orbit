import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
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
} from "@mui/material";

import { useAuth } from "../../../context/AuthContext";


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
  } = useAuth();


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

        alert(
          "Your session has expired. Please login again."
        );

        localStorage.removeItem("token");

        navigate("/login");

        return;
      }

      if (
        error?.response?.status === 403
      ) {

        alert(
          "You are not authorized to access departments."
        );

        return;
      }

      alert(
        "Unable to load departments."
      );

    } finally {

      setLoading(false);

    }

  }, [
    isAuthenticated,
    navigate,
  ]);


  // =====================================================
  // INITIAL LOAD
  // =====================================================

  useEffect(() => {

    if (isAuthenticated) {
      loadDepartments();
    }

  }, [
    isAuthenticated,
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


  // =====================================================
  // OPEN EDIT
  // =====================================================

  const editDepartment = (department) => {

    if (!isAuthenticated) {

      alert(
        "You are not authenticated. Please login again."
      );

      return;
    }


    if (!currentEmployeeId) {

      alert(
        "Your Employee ID could not be determined."
      );

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

      if (!isAuthenticated) {

        alert(
          "You are not authenticated. Please login again."
        );

        return;
      }


      if (!currentEmployeeId) {

        alert(
          "Your Employee ID could not be determined."
        );

        return;
      }


      const confirmed =
        window.confirm(
          "Are you sure you want to delete this Department?"
        );


      if (!confirmed) {
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


        alert(
          "Department deleted successfully."
        );

      } catch (error) {

        console.error(
          "Department delete error:",
          error
        );


        if (
          error?.response?.status === 401
        ) {

          alert(
            "Your session has expired. Please login again."
          );

          return;
        }


        if (
          error?.response?.status === 403
        ) {

          alert(
            "You are not authorized to delete departments."
          );

          return;
        }


        alert(
          error?.response?.data ||
          "Unable to delete Department."
        );

      }

    };


  // =====================================================
  // CREATE
  // =====================================================

  const saveDepartment =
    async (data) => {

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


        alert(
          "Department added successfully."
        );

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


        alert(
          "Department updated successfully."
        );

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
  // AUTHENTICATION SCREEN
  // =====================================================

  if (!isAuthenticated) {

    return (

      <div
        className="employee-type-page"
        style={{
          padding: "40px",
          textAlign: "center",
        }}
      >

        <h2>
          Authentication Required
        </h2>

        <p>
          Please sign in to access Department Management.
        </p>

        <Button
          variant="contained"
          onClick={() =>
            navigate("/login")
          }
        >
          Go to Login
        </Button>

      </div>

    );

  }


  // =====================================================
  // UI
  // =====================================================

  return (

    <div className="employee-type-page">


      {/* ==================================================
          HEADER
      ================================================== */}

      <div className="employee-page-header">

        <div>

          <h1>
            Department Management
          </h1>

          <p>
            Manage departments across your organization.
          </p>

        </div>


        <div className="header-buttons">

          <Button
            variant="outlined"
            onClick={() =>
              navigate("/employees")
            }
          >
            Previous
          </Button>


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


          <Button
            variant="outlined"
            startIcon={
              <Download />
            }
          >
            Export
          </Button>


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

        </div>

      </div>


      {/* ==================================================
          AUTHENTICATED USER
      ================================================== */}

      <div
        style={{
          marginBottom: "20px",
          fontSize: "13px",
          opacity: 0.75,
        }}
      >

        Logged in as:

        {" "}

        <strong>
          {currentEmployeeName}
        </strong>

        {" • Employee ID: "}

        <strong>
          {currentEmployeeId || "-"}
        </strong>

        {currentEmployeeCode && (
          <>
            {" • "}
            <strong>
              {currentEmployeeCode}
            </strong>
          </>
        )}

      </div>


      {/* ==================================================
          STATISTICS
      ================================================== */}

      <div className="stats-grid">


        <Card className="stats-card">

          <CardContent>

            <div className="stats-icon blue">
              <Category />
            </div>

            <span>
              Total Departments
            </span>

            <h2>
              {departments.length}
            </h2>

          </CardContent>

        </Card>


        <Card className="stats-card">

          <CardContent>

            <div className="stats-icon green">
              <CheckCircle />
            </div>

            <span>
              Active Departments
            </span>

            <h2>
              {
                departments.filter(
                  (x) =>
                    x.status
                      ?.toLowerCase() ===
                    "active"
                ).length
              }
            </h2>

          </CardContent>

        </Card>


        <Card className="stats-card">

          <CardContent>

            <div className="stats-icon red">
              <Cancel />
            </div>

            <span>
              Inactive Departments
            </span>

            <h2>
              {
                departments.filter(
                  (x) =>
                    x.status
                      ?.toLowerCase() ===
                    "inactive"
                ).length
              }
            </h2>

          </CardContent>

        </Card>

      </div>


      {/* ==================================================
          SEARCH + FILTER
      ================================================== */}

      <Card className="toolbar-card">

        <CardContent>

          <div className="department-filter-row">


            <div className="department-search">

              <TextField
                fullWidth
                placeholder="Search Department..."
                value={search}
                onChange={(e) =>
                  setSearch(
                    e.target.value
                  )
                }
                InputProps={{
                  startAdornment: (
                    <InputAdornment
                      position="start"
                    >
                      <Search />
                    </InputAdornment>
                  ),
                }}
              />

            </div>


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


          </div>

        </CardContent>

      </Card>


      {/* ==================================================
          TABLE
      ================================================== */}

      {loading ? (

        <Card className="table-card">

          <CardContent>

            <h3
              style={{
                textAlign: "center",
                padding: "40px",
              }}
            >
              Loading Departments...
            </h3>

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
                deleteDepartment
              }
            />

          </CardContent>

        </Card>

      )}


      {/* ==================================================
          ADD
      ================================================== */}

      <AddDepartment
        open={openAddDialog}
        handleClose={() =>
          setOpenAddDialog(false)
        }
        handleSave={
          saveDepartment
        }
      />


      {/* ==================================================
          EDIT
      ================================================== */}

      <EditDepartment
        open={openEditDialog}
        department={
          selectedDepartment
        }
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


    </div>

  );

}


export default Department;