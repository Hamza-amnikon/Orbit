import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import "./Designation.css";

import {
  getDesignations,
  createDesignation,
  updateDesignation,
  deleteDesignation,
} from "./DesignationService";

import AddDesignation from "./AddDesignation";
import EditDesignation from "./EditDesignation";
import DesignationTable from "./DesignationTable";

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

function Designations() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  const [designations, setDesignations] = useState([]);

  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);

  const [selectedDesignation, setSelectedDesignation] = useState(null);

  const loadDesignations = useCallback(async () => {
    try {
      setLoading(true);

      const response = await getDesignations();

      setDesignations(response);
    } catch (error) {
      console.error("Error loading designations:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDesignations();
  }, [loadDesignations]);

  const refreshData = async () => {
    await loadDesignations();
  };

  const filteredDesignations = designations.filter((item) => {
    const keyword = search.toLowerCase();

    return (
      item.role?.toLowerCase().includes(keyword) ||
      item.status?.toLowerCase().includes(keyword)
    );
  });

  const editDesignation = (designation) => {
    setSelectedDesignation(designation);
    setOpenEditDialog(true);
  };

  const removeDesignation = async (id) => {
    if (!window.confirm("Are you sure you want to delete this Designation?"))
      return;

    try {
      await deleteDesignation(id);

      await loadDesignations();

      alert("Designation deleted successfully.");
    } catch (error) {
      console.error(error);

      alert(error.response?.data || "Unable to delete Designation.");
    }
  };

  const saveDesignation = async (data) => {
    try {
      await createDesignation(data);

      setOpenAddDialog(false);

      await loadDesignations();

      alert("Designation added successfully.");
    } catch (error) {
      console.error(error);

      alert(error.response?.data || "Unable to create Designation.");
    }
  };
const editDesignationSave = async (data) => {
  try {
    await updateDesignation(data.designationId, data);

    setOpenEditDialog(false);
    setSelectedDesignation(null);

    await loadDesignations();

    alert("Designation updated successfully.");
  } catch (error) {
    console.error(error);
    alert(error.response?.data || "Unable to update Designation.");
  }
};

  return (
    <div className="designation-page">

      <div className="employee-page-header">

        <div>
          <h1>Designation Management</h1>
          <p>Manage designations across your organization.</p>
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
            Add Designation
          </Button>

        </div>

      </div>

      <div className="stats-grid">

        <Card className="stats-card">
          <CardContent>

            <div className="stats-icon blue">
              <Category />
            </div>

            <span>Total Designations</span>

            <h2>{designations.length}</h2>

          </CardContent>
        </Card>

        <Card className="stats-card">
          <CardContent>

            <div className="stats-icon green">
              <CheckCircle />
            </div>

            <span>Active Designations</span>

            <h2>
              {designations.filter((x) => x.status === "Active").length}
            </h2>

          </CardContent>
        </Card>

        <Card className="stats-card">
          <CardContent>

            <div className="stats-icon red">
              <Cancel />
            </div>

            <span>Inactive Designations</span>

            <h2>
              {designations.filter((x) => x.status === "Inactive").length}
            </h2>

          </CardContent>
        </Card>

      </div>

      <Card className="toolbar-card">

        <CardContent>

          <TextField
            fullWidth
            placeholder="Search Designation..."
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
              Loading Designations...
            </h3>

          </CardContent>

        </Card>

      ) : (

        <Card className="table-card">

          <CardContent>

            <DesignationTable
              designations={filteredDesignations}
              editDesignation={editDesignation}
              deleteDesignation={removeDesignation}
            />

          </CardContent>

        </Card>

      )}

      <AddDesignation
        open={openAddDialog}
        handleClose={() => setOpenAddDialog(false)}
        handleSave={saveDesignation}
      />

      <EditDesignation
        open={openEditDialog}
        designation={selectedDesignation}
        handleClose={() => {
          setOpenEditDialog(false);
          setSelectedDesignation(null);
        }}
        handleUpdate={editDesignationSave}
      />

    </div>
  );
}

export default Designations;