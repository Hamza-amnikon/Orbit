import { useState, useEffect, useCallback } from "react";
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
} from "@mui/material";

function Department() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  const [departments, setDepartments] = useState([]);

  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);

  const [selectedDepartment, setSelectedDepartment] = useState(null);

  const loadDepartments = useCallback(async () => {
    try {
      setLoading(true);

      const response = await getDepartments();

      setDepartments(response);
    } catch (error) {
      console.error("Error loading departments:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDepartments();
  }, [loadDepartments]);

  const refreshData = async () => {
    await loadDepartments();
  };

  const filteredDepartments = departments.filter((item) => {
    const keyword = search.toLowerCase();

    return (
      item.departmentName?.toLowerCase().includes(keyword) ||
      item.description?.toLowerCase().includes(keyword) ||
      item.status?.toLowerCase().includes(keyword)
    );
  });

  const editDepartment = (department) => {
    setSelectedDepartment(department);
    setOpenEditDialog(true);
  };

  const deleteDepartment = async (id) => {
    if (!window.confirm("Are you sure you want to delete this Department?"))
      return;

    try {
      await deleteDepartmentApi(id);

      await loadDepartments();

      alert("Department deleted successfully.");
    } catch (error) {
      console.error(error);

      alert(error.response?.data || "Unable to delete Department.");
    }
  };

  const saveDepartment = async (data) => {
    try {
      await createDepartment(data);

      setOpenAddDialog(false);

      await loadDepartments();

      alert("Department added successfully.");
    } catch (error) {
      console.error(error);

      alert(error.response?.data || "Unable to create Department.");
    }
  };

  const updateDepartment = async (data) => {
    try {
      await updateDepartmentApi(
        selectedDepartment.departmentId,
        data
      );

      setOpenEditDialog(false);
      setSelectedDepartment(null);

      await loadDepartments();

      alert("Department updated successfully.");
    } catch (error) {
      console.error(error);

      alert(error.response?.data || "Unable to update Department.");
    }
  };

  return (
    <div className="employee-type-page">

      <div className="employee-page-header">

        <div>
          <h1>Department Management</h1>
          <p>Manage departments across your organization.</p>
        </div>

        <div className="header-buttons">

          <Button
            variant="outlined"
            onClick={() => navigate("/employees")}
          >
            Previous
          </Button>

          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={refreshData}
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
            onClick={() => setOpenAddDialog(true)}
          >
            Add Department
          </Button>

        </div>

      </div>

      <div className="stats-grid">

        <Card className="stats-card">
          <CardContent>
            <div className="stats-icon blue">
              <Category />
            </div>

            <span>Total Departments</span>

            <h2>{departments.length}</h2>
          </CardContent>
        </Card>

        <Card className="stats-card">
          <CardContent>
            <div className="stats-icon green">
              <CheckCircle />
            </div>

            <span>Active Departments</span>

            <h2>
              {departments.filter((x) => x.status === "Active").length}
            </h2>
          </CardContent>
        </Card>

        <Card className="stats-card">
          <CardContent>
            <div className="stats-icon red">
              <Cancel />
            </div>

            <span>Inactive Departments</span>

            <h2>
              {departments.filter((x) => x.status === "Inactive").length}
            </h2>
          </CardContent>
        </Card>

      </div>

      <Card className="toolbar-card">

        <CardContent>

          <TextField
            fullWidth
            placeholder="Search Department..."
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

        </CardContent>

      </Card>

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
              departments={filteredDepartments}
              editDepartment={editDepartment}
              deleteDepartment={deleteDepartment}
            />

          </CardContent>

        </Card>

      )}

      <AddDepartment
        open={openAddDialog}
        handleClose={() => setOpenAddDialog(false)}
        handleSave={saveDepartment}
      />

      <EditDepartment
        open={openEditDialog}
        department={selectedDepartment}
        handleClose={() => {
          setOpenEditDialog(false);
          setSelectedDepartment(null);
        }}
        handleUpdate={updateDepartment}
      />

    </div>
  );
}

export default Department;