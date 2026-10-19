import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Locations.css";
import axios from "axios";
import * as XLSX from "xlsx";

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
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
} from "@mui/material";

import { useAuth } from "../../../context/AuthContext";
import { Box as MuiLayoutBox, Typography as MuiText } from "@mui/material";

function Locations() {
  const navigate = useNavigate();

  const API = `${import.meta.env.VITE_LOCATION_API_BASE_URL}/api/location`;

  // =========================================================
  // PERMISSIONS
  // =========================================================

  const { hasPermission } = useAuth();

  const permissionRoute = "/employees/locations";

  const canView = hasPermission(permissionRoute, "view");
  const canCreate = hasPermission(permissionRoute, "create");
  const canEdit = hasPermission(permissionRoute, "edit");
  const canDelete = hasPermission(permissionRoute, "delete");
  const canExport = hasPermission(permissionRoute, "export");

  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);

  const [selectedLocation, setSelectedLocation] = useState(null);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [notice, setNotice] = useState({ open: false, message: "", severity: "success" });

  useEffect(() => {
    if (!canView) {
      setLoading(false);
      return;
    }

    fetchLocations();
  }, [canView]);

  // ===============================
  // GET ALL LOCATIONS
  // ===============================

  const fetchLocations = async () => {
    if (!canView) {
      return;
    }

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
    if (!canCreate) {
      return;
    }

    try {
      console.log("Sending:", location);

      await axios.post(API, location);

      await fetchLocations();

      setNotice({ open: true, message: "Location added successfully.", severity: "success" });

      setOpenAddDialog(false);
    } catch (error) {
      console.log(error.response);
      console.log(error.response?.data);
      console.log(error.response?.data?.errors);

      setNotice({ open: true, message: error.response?.data?.title || "Unable to add location.", severity: "error" });
    }
  };

  // ===============================
  // OPEN EDIT
  // ===============================

  const editLocation = (location) => {
    if (!canEdit) {
      return;
    }

    setSelectedLocation(location);
    setOpenEditDialog(true);
  };

  // ===============================
  // UPDATE LOCATION
  // ===============================

  const handleUpdateLocation = async (updatedLocation) => {
    if (!canEdit) {
      return;
    }

    try {
      const payload = {
        locationId: Number(updatedLocation.locationId),
        locationName: updatedLocation.locationName,
        locationCode: updatedLocation.locationCode,
        country: updatedLocation.country,
        city: updatedLocation.city,
        status: updatedLocation.status
      };

      console.log("UPDATE PAYLOAD:", payload);

      const response = await axios.put(
        `${API}/${updatedLocation.locationId}`,
        payload,
        {
          headers: {
            "Content-Type": "application/json"
          }
        }
      );

      console.log("UPDATE RESPONSE:", response.data);

      await fetchLocations();

      setNotice({ open: true, message: "Location updated successfully.", severity: "success" });

      setOpenEditDialog(false);

    } catch (error) {

      console.error("UPDATE LOCATION ERROR:", error);

      console.error(
        "STATUS:",
        error.response?.status
      );

      console.error(
        "RESPONSE DATA:",
        error.response?.data
      );

      console.error(
        "VALIDATION ERRORS:",
        error.response?.data?.errors
      );

      setNotice({ open: true, message: error.response?.data?.title || error.response?.data?.message || "Unable to update location.", severity: "error" });
    }
  };

  // ===============================
  // DELETE LOCATION
  // ===============================

  const handleDeleteLocation = async () => {
    if (!canDelete) {
      return;
    }
    const id = pendingDelete?.locationId;
    if (!id) return;

    try {
      await axios.delete(`${API}/${id}`);

      await fetchLocations();
      setNotice({ open: true, message: "Location deleted successfully.", severity: "success" });
    } catch (error) {
      console.log(error);
      console.log(error.response?.data);

      setNotice({ open: true, message: "Unable to delete location.", severity: "error" });
    } finally {
      setPendingDelete(null);
    }
  };

  const exportLocations = () => {
    const rows = filteredLocations.map(({ locationCode, locationName, city, country, currencyCode, timeZone, createdDate, status }) => ({
      "Location Code": locationCode,
      "Location Name": locationName,
      City: city || "",
      Country: country || "",
      "Currency Code": currencyCode || "",
      Timezone: timeZone || "",
      "Created Date": createdDate ? new Date(createdDate).toLocaleDateString("en-GB") : "",
      Status: status || "",
    }));
    const sheet = XLSX.utils.json_to_sheet(rows);
    const book = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(book, sheet, "Locations");
    XLSX.writeFile(book, `Spark_Locations_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  const setLocationStatusFilter = (status) => {
    setStatusFilter((current) => current === status ? "" : status);
  };

  // ===============================
  // SEARCH
  // ===============================

  const filteredLocations = locations
    .filter((location) => {
      const keyword = search.trim().toLowerCase();

      const matchesSearch =
        location.locationCode?.toLowerCase().includes(keyword) ||
        location.locationName?.toLowerCase().includes(keyword) ||
        location.city?.toLowerCase().includes(keyword) ||
        location.country?.toLowerCase().includes(keyword) ||
        location.currencyCode?.toLowerCase().includes(keyword) ||
        location.timeZone?.toLowerCase().includes(keyword);

      const matchesStatus =
        !statusFilter || location.status === statusFilter;

      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => Number(a.locationCode) - Number(b.locationCode));

  // =========================================================
  // VIEW PERMISSION
  // =========================================================

  if (!canView) {
    return (
      <MuiLayoutBox style={{ padding: "60px", textAlign: "center" }} component="div">
        <MuiText component="h2" variant="h5">Access Denied</MuiText>
        <MuiText component="p" variant="body1">You do not have permission to access this page.</MuiText>
      </MuiLayoutBox>
    );
  }

  return (
    <MuiLayoutBox className="location-page" component="div">
      {/* Header */}

      <MuiLayoutBox className="employee-page-header" component="div">
        <MuiLayoutBox className="location-title-wrap" component="div">
          <Tooltip title="Back to employee management">
            <IconButton className="location-back-button" aria-label="Back to employee management" onClick={() => navigate("/employees")}>
              <ArrowBack />
            </IconButton>
          </Tooltip>
          <MuiLayoutBox component="div">
          <MuiText component="h1" variant="h4">Location Management</MuiText>
          <MuiText component="p" variant="body1">Manage office locations across your organization.</MuiText>
          </MuiLayoutBox>
        </MuiLayoutBox>

        <MuiLayoutBox className="header-buttons" component="div">
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={fetchLocations}
          >
            Refresh
          </Button>

          {canExport && (
            <Button variant="outlined" startIcon={<Download />} onClick={exportLocations}>
              Export Excel
            </Button>
          )}

          {canCreate && (
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => setOpenAddDialog(true)}
            >
              Add Location
            </Button>
          )}
        </MuiLayoutBox>
      </MuiLayoutBox>

      {/* Statistics */}

      <MuiLayoutBox className="stats-grid" component="div">
        <Card className={`stats-card ${statusFilter === "" ? "selected" : ""}`} role="button" tabIndex={0} onClick={() => setLocationStatusFilter("")} onKeyDown={(e) => e.key === "Enter" && setLocationStatusFilter("")}>
          <CardContent>
            <MuiLayoutBox className="stats-icon blue" component="div">
              <LocationOn />
            </MuiLayoutBox>

            <MuiText component="span" variant="inherit">Total Locations</MuiText>

            <MuiText component="h2" variant="h5">{locations.length}</MuiText>
          </CardContent>
        </Card>

        <Card className={`stats-card ${statusFilter === "Active" ? "selected" : ""}`} role="button" tabIndex={0} onClick={() => setLocationStatusFilter("Active")} onKeyDown={(e) => e.key === "Enter" && setLocationStatusFilter("Active")}>
          <CardContent>
            <MuiLayoutBox className="stats-icon green" component="div">
              <Business />
            </MuiLayoutBox>

            <MuiText component="span" variant="inherit">Active Locations</MuiText>

            <MuiText component="h2" variant="h5">{locations.filter((x) => x.status === "Active").length}</MuiText>
          </CardContent>
        </Card>

        <Card className={`stats-card ${statusFilter === "Inactive" ? "selected" : ""}`} role="button" tabIndex={0} onClick={() => setLocationStatusFilter("Inactive")} onKeyDown={(e) => e.key === "Enter" && setLocationStatusFilter("Inactive")}>
          <CardContent>
            <MuiLayoutBox className="stats-icon red" component="div">
              <Place />
            </MuiLayoutBox>

            <MuiText component="span" variant="inherit">Inactive Locations</MuiText>

            <MuiText component="h2" variant="h5">{locations.filter((x) => x.status === "Inactive").length}</MuiText>
          </CardContent>
        </Card>

        <Card className="stats-card stats-card-static">
          <CardContent>
            <MuiLayoutBox className="stats-icon purple" component="div">
              <Public />
            </MuiLayoutBox>

            <MuiText component="span" variant="inherit">Countries</MuiText>

            <MuiText component="h2" variant="h5">{new Set(locations.map((x) => x.country)).size}</MuiText>
          </CardContent>
        </Card>
      </MuiLayoutBox>

      {/* Search */}

      <Card className="toolbar-card">
        <CardContent>

          <MuiLayoutBox className="location-filter-row" component="div">

            {/* SEARCH */}
            <TextField
              className="location-search"
              fullWidth
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search Location..."
              slotProps={{ input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              } }}
            />

            {/* STATUS FILTER */}
            <FormControl className="location-status-filter">

              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                displayEmpty
              >
                <MenuItem value="">
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

      {/* Table */}

      {loading ? (
        <Card className="table-card">
          <CardContent>
            <MuiText
              style={{
                textAlign: "center",
                padding: "40px",
              }}
             component="h3" variant="h6">
              Loading Locations...
            </MuiText>
          </CardContent>
        </Card>
      ) : (
        <Card className="table-card">
          <CardContent>
            <LocationTable
              locations={filteredLocations}
              editLocation={canEdit ? editLocation : undefined}
              deleteLocation={canDelete ? (location) => setPendingDelete(location) : undefined}
            />
          </CardContent>
        </Card>
      )}

      {/* Add Dialog */}

      {canCreate && (
        <AddLocation
          open={openAddDialog}
          handleClose={() => setOpenAddDialog(false)}
          handleSave={handleSaveLocation}
        />
      )}

      {/* Edit Dialog */}

      {canEdit && (
        <EditLocation
          open={openEditDialog}
          location={selectedLocation}
          handleClose={() => setOpenEditDialog(false)}
          handleUpdate={handleUpdateLocation}
        />
      )}
      <Dialog className="employee-type-dialog" open={Boolean(pendingDelete)} onClose={() => setPendingDelete(null)}>
        <DialogTitle>Delete location?</DialogTitle>
        <DialogContent>
          Are you sure you want to delete {pendingDelete?.locationName || "this location"}?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPendingDelete(null)}>Cancel</Button>
          <Button color="error" variant="contained" onClick={handleDeleteLocation}>Delete</Button>
        </DialogActions>
      </Dialog>
      <Snackbar open={notice.open} autoHideDuration={4000} onClose={() => setNotice((current) => ({ ...current, open: false }))} anchorOrigin={{ vertical: "bottom", horizontal: "right" }}>
        <Alert severity={notice.severity} variant="filled" onClose={() => setNotice((current) => ({ ...current, open: false }))}>{notice.message}</Alert>
      </Snackbar>
    </MuiLayoutBox>
  );
}

export default Locations;
