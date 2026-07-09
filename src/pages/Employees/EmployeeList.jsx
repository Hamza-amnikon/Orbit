import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import EmployeeTable from "./EmployeeTable";
import "./EmployeeList.css";

import {
  Add,
  Refresh,
  Search,
  Download,
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
  const navigate = useNavigate();

  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  useEffect(() => {
    fetchEmployees();
  }, []);

  async function fetchEmployees() {
    try {
      setLoading(true);

      const response = await axios.get(
        "https://localhost:7002/api/employee"
      );

      setEmployees(response.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  function editEmployee(emp) {
    navigate(`/employees/edit/${emp.employeeId}`);
  }

  async function deleteEmployee(id) {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this employee?"
    );

    if (!confirmDelete) return;

    try {
      await axios.delete(
        `https://localhost:7002/api/employee/${id}`
      );

      fetchEmployees();
    } catch (error) {
      console.log(error);
    }
  }

  const departments = useMemo(() => {
    return [
      "All",
      ...new Set(employees.map((e) => e.department).filter(Boolean)),
    ];
  }, [employees]);

  const filteredEmployees = useMemo(() => {
    return employees.filter((employee) => {
      const searchMatch =
        employee.employeeName
          ?.toLowerCase()
          .includes(search.toLowerCase()) ||
        employee.email
          ?.toLowerCase()
          .includes(search.toLowerCase()) ||
        employee.employeeCode
          ?.toLowerCase()
          .includes(search.toLowerCase());

      const departmentMatch =
        departmentFilter === "All" ||
        employee.department === departmentFilter;

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

  const totalEmployees = employees.length;

  const activeEmployees = employees.filter(
    (e) => e.status === "Active"
  ).length;

  const inactiveEmployees = employees.filter(
    (e) => e.status === "Inactive"
  ).length;

  const totalDepartments = new Set(
    employees.map((e) => e.department)
  ).size;

  return (
    <div className="employee-list-page">

      {/* Header */}

      <div className="employee-page-header">

        <div>

          <h1>Employee Management</h1>

          <p>
            Manage, search and organize employees across
            your organization.
          </p>

        </div>

        <div className="header-buttons">

          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={fetchEmployees}
          >
            Refresh
          </Button>

          <Button
            variant="outlined"
            startIcon={<Download />}
          >
            Export
          </Button>

          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => navigate("/employees/add")}
          >
            Add Employee
          </Button>

        </div>

      </div>

      {/* Statistics */}

      <div className="stats-grid">

        <Card className="stats-card">

          <CardContent>

            <div className="stats-icon blue">

              <Groups />

            </div>

            <span>Total Employees</span>

            <h2>{totalEmployees}</h2>

          </CardContent>

        </Card>

        <Card className="stats-card">

          <CardContent>

            <div className="stats-icon green">

              <Person />

            </div>

            <span>Active Employees</span>

            <h2>{activeEmployees}</h2>

          </CardContent>

        </Card>

        <Card className="stats-card">

          <CardContent>

            <div className="stats-icon red">

              <PersonOff />

            </div>

            <span>Inactive Employees</span>

            <h2>{inactiveEmployees}</h2>

          </CardContent>

        </Card>

        <Card className="stats-card">

          <CardContent>

            <div className="stats-icon purple">

              <Business />

            </div>

            <span>Departments</span>

            <h2>{totalDepartments}</h2>

          </CardContent>

        </Card>

      </div>
            {/* Search & Filters */}

      <Card className="toolbar-card">

        <CardContent>

          <div className="toolbar">

            <TextField
              fullWidth
              placeholder="Search by name, email or employee ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
            />

            <FormControl sx={{ minWidth: 200 }}>
              <Select
                value={departmentFilter}
                onChange={(e) =>
                  setDepartmentFilter(e.target.value)
                }
              >
                {departments.map((dept) => (
                  <MenuItem
                    key={dept}
                    value={dept}
                  >
                    {dept}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl sx={{ minWidth: 180 }}>
              <Select
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(e.target.value)
                }
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

      {/* Table */}

      {loading ? (

        <div className="loading-card">

          <div className="loader"></div>

          <h3>Loading Employees...</h3>

          <p>
            Please wait while we fetch employee records.
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

            <h2>No Employees Found</h2>

            <p>
              Try changing the search text or
              filters.
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

    </div>

  );

}

export default EmployeeList;