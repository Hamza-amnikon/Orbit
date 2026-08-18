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

function EmployeeList() {
  // ==========================================
  // API
  // ==========================================

  const API = "http://localhost:5151/api/employee";
  const SYNC_API = "http://localhost:5200/api/sync";

  const navigate = useNavigate();

  // ==========================================
  // Employee Data
  // ==========================================

  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  // ==========================================
  // Search & Filters
  // ==========================================

  const [search, setSearch] = useState("");
  const [departmentFilter, setDepartmentFilter] =
    useState("All");

  const [statusFilter, setStatusFilter] =
    useState("All");

  // ==========================================
  // Edit Employee Dialog
  // ==========================================

  const [editDialogOpen, setEditDialogOpen] =
    useState(false);

  const [selectedEmployee, setSelectedEmployee] =
    useState(null);

  // ==========================================
  // Initial Load
  // ==========================================

  useEffect(() => {
    fetchEmployees();
  }, []);

  // ==========================================
  // Fetch Employees
  // ==========================================

  async function fetchEmployees() {
    try {
      setLoading(true);

      const response = await axios.get(API);

      setEmployees(response.data || []);
    } catch (error) {
      console.error(
        "Error fetching employees:",
        error
      );

      setEmployees([]);
    } finally {
      setLoading(false);
    }
  }

  // ==========================================
  // Open Edit Dialog
  // ==========================================

  function editEmployee(employee) {
    console.log(
      "Opening employee for edit:",
      employee
    );

    setSelectedEmployee(employee);
    setEditDialogOpen(true);
  }

  // ==========================================
  // Close Edit Dialog
  // ==========================================

  function closeEditDialog() {
    setEditDialogOpen(false);
    setSelectedEmployee(null);
  }

  // ==========================================
  // Delete Employee
  // ==========================================

  async function deleteEmployee(id) {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this employee?"
    );

    if (!confirmDelete) {
      return;
    }

    try {
      await axios.delete(`${API}/${id}`);

      await fetchEmployees();

      alert(
        "Employee deleted successfully."
      );
    } catch (error) {
      console.error(
        "Delete Employee Error:",
        error
      );

      if (error.response) {
        alert(
          error.response.data?.message ||
            "Unable to delete employee."
        );
      } else {
        alert(
          "Unable to connect to the server."
        );
      }
    }
  }

  // ==========================================
  // Departments
  // ==========================================

  const departments = useMemo(() => {
    return [
      "All",
      ...new Set(
        employees
          .map((employee) => employee.department)
          .filter(Boolean)
      ),
    ];
  }, [employees]);

  // ==========================================
  // Filter Employees
  // ==========================================

  const filteredEmployees = useMemo(() => {
    const keyword = search
      .toLowerCase()
      .trim();

    return employees.filter((employee) => {
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
        employee.status === statusFilter;

      return (
        searchMatch &&
        departmentMatch &&
        statusMatch
      );
    });
  }, [
    employees,
    search,
    departmentFilter,
    statusFilter,
  ]);

  // ==========================================
  // Statistics
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
  // Sync Azure AD
  // ==========================================

  async function syncEmployees() {
    try {
      setLoading(true);

      const response =
        await axios.post(SYNC_API);

      await fetchEmployees();

      alert(
        response.data?.message ||
          "Employees synchronized successfully."
      );
    } catch (error) {
      console.error(
        "Sync Employee Error:",
        error
      );

      if (error.response) {
        alert(
          error.response.data?.message ||
            "Synchronization failed."
        );
      } else {
        alert(
          "Unable to connect to the Sync Service."
        );
      }
    } finally {
      setLoading(false);
    }
  }

  // ==========================================
  // Render
  // ==========================================

  return (
    <div className="employee-list-page">

      {/* ======================================
          Header
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
          Statistics
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
          Search & Filters
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
              sx={{ minWidth: 200 }}
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
              sx={{ minWidth: 180 }}
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
          Employee Table
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
          Edit Employee Dialog
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