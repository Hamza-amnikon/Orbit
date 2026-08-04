import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Locations.css";
import axios from "axios";

import AddLocation from "./AddLocation";
import EditLocation from "./EditLocation";
import LocationTable from "./LocationTable";

import {
  Add,
  Refresh,
  Download,
  Business,
  Public,
  Place,
  LocationOn,
  Search,
} from "@mui/icons-material";

import {
  Button,
  Card,
  CardContent,
  TextField,
  InputAdornment,
} from "@mui/material";

function Locations() {
  const navigate = useNavigate();

  const API = "http://localhost:5140/api/location";

  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");

  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);

  const [selectedLocation, setSelectedLocation] = useState(null);

  useEffect(() => {
    fetchLocations();
  }, []);

  // ===============================
  // GET ALL LOCATIONS
  // ===============================

  const fetchLocations = async () => {
    try {
      setLoading(true);

      const response = await axios.get(API);

      setLocations(response.data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  // ===============================
  // ADD LOCATION
  // ===============================

  const handleSaveLocation = async (location) => {
    try {
      console.log("Sending:", location);

      await axios.post(API, location);

      await fetchLocations();

      alert("Location added successfully.");

      setOpenAddDialog(false);
    } catch (error) {
      console.log(error.response);
      console.log(error.response?.data);
      console.log(error.response?.data?.errors);

      alert("Unable to add location.");
    }
  };

  // ===============================
  // OPEN EDIT
  // ===============================

  const editLocation = (location) => {
    setSelectedLocation(location);
    setOpenEditDialog(true);
  };

  // ===============================
  // UPDATE LOCATION
  // ===============================

  const handleUpdateLocation = async (updatedLocation) => {
    try {
      await axios.put(`${API}/${updatedLocation.locationId}`, updatedLocation);

      await fetchLocations();

      alert("Location updated successfully.");

      setOpenEditDialog(false);
    } catch (error) {
      console.log(error);
      console.log(error.response?.data);

      alert("Unable to update location.");
    }
  };

  // ===============================
  // DELETE LOCATION
  // ===============================

  const handleDeleteLocation = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this location?",
    );

    if (!confirmDelete) return;

    try {
      await axios.delete(`${API}/${id}`);

      await fetchLocations();

      alert("Location deleted successfully.");
    } catch (error) {
      console.log(error);
      console.log(error.response?.data);

      alert("Unable to delete location.");
    }
  };

  // ===============================
  // SEARCH
  // ===============================

  const filteredLocations = locations
    .filter((location) => {
      const keyword = search.toLowerCase();

      return (
        location.locationCode?.toLowerCase().includes(keyword) ||
        location.locationName?.toLowerCase().includes(keyword) ||
        location.city?.toLowerCase().includes(keyword) ||
        location.country?.toLowerCase().includes(keyword) ||
        location.currencyCode?.toLowerCase().includes(keyword) ||
        location.timeZone?.toLowerCase().includes(keyword)
      );
    })
    .sort((a, b) => Number(a.locationCode) - Number(b.locationCode));

  return (
    <div className="location-page">
      {/* Header */}

      <div className="employee-page-header">
        <div>
          <h1>Location Management</h1>
          <p>Manage office locations across your organization.</p>
        </div>

        <div className="header-buttons">
          <Button variant="outlined" onClick={() => navigate("/employees")}>
            Previous
          </Button>

          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={fetchLocations}
          >
            Refresh
          </Button>

          <Button variant="outlined" startIcon={<Download />}>
            Export
          </Button>

          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setOpenAddDialog(true)}
          >
            Add Location
          </Button>
        </div>
      </div>

      {/* Statistics */}

      <div className="stats-grid">
        <Card className="stats-card">
          <CardContent>
            <div className="stats-icon blue">
              <LocationOn />
            </div>

            <span>Total Locations</span>

            <h2>{locations.length}</h2>
          </CardContent>
        </Card>

        <Card className="stats-card">
          <CardContent>
            <div className="stats-icon green">
              <Business />
            </div>

            <span>Active Locations</span>

            <h2>{locations.filter((x) => x.status === "Active").length}</h2>
          </CardContent>
        </Card>

        <Card className="stats-card">
          <CardContent>
            <div className="stats-icon red">
              <Place />
            </div>

            <span>Inactive Locations</span>

            <h2>{locations.filter((x) => x.status === "Inactive").length}</h2>
          </CardContent>
        </Card>

        <Card className="stats-card">
          <CardContent>
            <div className="stats-icon purple">
              <Public />
            </div>

            <span>Countries</span>

            <h2>{new Set(locations.map((x) => x.country)).size}</h2>
          </CardContent>
        </Card>
      </div>

      {/* Search */}

      <Card className="toolbar-card">
        <CardContent>
          <TextField
            fullWidth
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search Location..."
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

      {/* Table */}

      {loading ? (
        <Card className="table-card">
          <CardContent>
            <h3
              style={{
                textAlign: "center",
                padding: "40px",
              }}
            >
              Loading Locations...
            </h3>
          </CardContent>
        </Card>
      ) : (
        <Card className="table-card">
          <CardContent>
            <LocationTable
              locations={filteredLocations}
              editLocation={editLocation}
              deleteLocation={handleDeleteLocation}
            />
          </CardContent>
        </Card>
      )}

      {/* Add Dialog */}

      <AddLocation
        open={openAddDialog}
        handleClose={() => setOpenAddDialog(false)}
        handleSave={handleSaveLocation}
      />

      {/* Edit Dialog */}

      <EditLocation
        open={openEditDialog}
        location={selectedLocation}
        handleClose={() => setOpenEditDialog(false)}
        handleUpdate={handleUpdateLocation}
      />
    </div>
  );
}

export default Locations;
