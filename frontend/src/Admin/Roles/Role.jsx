import { useState, useEffect } from "react";
import { FormControl, InputLabel, Select, MenuItem, Button, IconButton, Tooltip, Dialog, DialogTitle, DialogContent, DialogActions, Snackbar, Alert, TextField, InputAdornment } from "@mui/material";
import { useNavigate } from "react-router-dom";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import { ArrowBack, Refresh, Download, PeopleAlt, CheckCircle, Cancel, Search } from "@mui/icons-material";
import RoleForm from "./RoleForm";
import RoleTable from "./RoleTable";
import { getRoles, deleteRole } from "./RoleService";
import "./Role.css";
import { useAuth } from "../../context/AuthContext";
import { loadXlsx } from "../../utils/exportLibraries";
import { Box as MuiLayoutBox, Typography as MuiText } from "@mui/material";

function Role() {
  const navigate = useNavigate();

  // =========================================================
  // PERMISSIONS
  // =========================================================

  const { hasPermission } = useAuth();

  const permissionRoute = "/employees/roles";

  const canView = hasPermission(permissionRoute, "view");
  const canCreate = hasPermission(permissionRoute, "create");
  const canEdit = hasPermission(permissionRoute, "edit");
  const canDelete = hasPermission(permissionRoute, "delete");
  const canExport = hasPermission(permissionRoute, "export");

  const [roles, setRoles] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editRole, setEditRole] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [pendingDelete, setPendingDelete] = useState(null);
  const [notice, setNotice] = useState({ open: false, message: "", severity: "success" });

  // Fetch Roles
  const fetchRoles = async () => {
    if (!canView) {
      setRoles([]);
      return;
    }

    try {
      const response = await getRoles();
      setRoles(response.data);
    } catch (error) {
      console.error("Error fetching roles:", error);
    }
  };

  useEffect(() => {
    if (!canView) {
      return;
    }

    fetchRoles();
  }, [canView]);

  // Refresh
  const handleRefresh = async () => {
    if (!canView) {
      return;
    }

    await fetchRoles();
    setSearch("");
    setEditRole(null);
    setShowForm(false);
  };

  // Search
  const filteredRoles = roles.filter((role) => {
    const keyword = search.trim().toLowerCase();

    const matchesSearch =
      !keyword ||
      role.role?.toLowerCase().includes(keyword);

    const matchesStatus =
      !statusFilter ||
      role.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Statistics
  const totalRoles = roles.length;

  const activeRoles = roles.filter((role) => role.status === "Active").length;

  const inactiveRoles = roles.filter(
    (role) => role.status === "Inactive",
  ).length;

  // Export
  const exportToExcel = async () => {
    if (!canExport) {
      return;
    }

    const XLSX = await loadXlsx();
    const data = filteredRoles.map((role, index) => ({
      "S.No": index + 1,
      Role: role.role,
      "Created Date": role.createdDate,
      Status: role.status,
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);

    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, "Roles");

    XLSX.writeFile(workbook, `Spark_Roles_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  const confirmDeleteRole = async () => {
    if (!canDelete || !pendingDelete) return;
    try {
      await deleteRole(pendingDelete.roleId);
      await fetchRoles();
      setNotice({ open: true, message: "Role deleted successfully.", severity: "success" });
    } catch (error) {
      console.error("Error deleting role:", error);
      setNotice({ open: true, message: error.response?.data?.title || "Unable to delete role.", severity: "error" });
    } finally {
      setPendingDelete(null);
    }
  };

  const showRoleNotice = (message, severity = "success") => setNotice({ open: true, message, severity });

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
    <MuiLayoutBox className="role-page" component="div">
      {/* Header */}

      <MuiLayoutBox className="role-header-card" component="div">
        <MuiLayoutBox className="role-title-wrap" component="div">
          <Tooltip title="Back to employee management">
            <IconButton className="role-back-button" aria-label="Back to employee management" onClick={() => navigate("/employees")}><ArrowBack /></IconButton>
          </Tooltip>
          <MuiLayoutBox component="div">
          <MuiText component="h1" variant="h4">Role Management</MuiText>

          <MuiText component="p" variant="body1">Manage user roles and permissions.</MuiText>
          </MuiLayoutBox>
        </MuiLayoutBox>

        <MuiLayoutBox className="role-header-buttons" component="div">
          <Button variant="outlined" startIcon={<Refresh />} onClick={handleRefresh}>Refresh</Button>

          {canExport && (
            <Button variant="outlined" startIcon={<Download />} onClick={exportToExcel}>Export Excel</Button>
          )}

          {canCreate && (
            <Button
              variant="contained"
              startIcon={<AddRoundedIcon />}
              onClick={() => {
                setEditRole(null);
                setShowForm(true);
              }}
            >
              Add Role
            </Button>
          )}
        </MuiLayoutBox>
      </MuiLayoutBox>

      {/* Statistics */}

      <MuiLayoutBox className="role-stats" component="div">
        <MuiLayoutBox className={`role-stat-card ${statusFilter === "" ? "selected" : ""}`} component="div" role="button" tabIndex={0} onClick={() => setStatusFilter("")} onKeyDown={(event) => event.key === "Enter" && setStatusFilter("")}>
          <MuiLayoutBox className="role-stat-icon blue" component="div"><PeopleAlt /></MuiLayoutBox>

          <MuiLayoutBox component="div">
            <MuiText component="h3" variant="h6">{totalRoles}</MuiText>

            <MuiText component="p" variant="body1">Total Roles</MuiText>
          </MuiLayoutBox>
        </MuiLayoutBox>

        <MuiLayoutBox className={`role-stat-card ${statusFilter === "Active" ? "selected" : ""}`} component="div" role="button" tabIndex={0} onClick={() => setStatusFilter((current) => current === "Active" ? "" : "Active")} onKeyDown={(event) => event.key === "Enter" && setStatusFilter((current) => current === "Active" ? "" : "Active")}>
          <MuiLayoutBox className="role-stat-icon green" component="div"><CheckCircle /></MuiLayoutBox>

          <MuiLayoutBox component="div">
            <MuiText component="h3" variant="h6">{activeRoles}</MuiText>

            <MuiText component="p" variant="body1">Active Roles</MuiText>
          </MuiLayoutBox>
        </MuiLayoutBox>

        <MuiLayoutBox className={`role-stat-card ${statusFilter === "Inactive" ? "selected" : ""}`} component="div" role="button" tabIndex={0} onClick={() => setStatusFilter((current) => current === "Inactive" ? "" : "Inactive")} onKeyDown={(event) => event.key === "Enter" && setStatusFilter((current) => current === "Inactive" ? "" : "Inactive")}>
          <MuiLayoutBox className="role-stat-icon red" component="div"><Cancel /></MuiLayoutBox>

          <MuiLayoutBox component="div">
            <MuiText component="h3" variant="h6">{inactiveRoles}</MuiText>

            <MuiText component="p" variant="body1">Inactive Roles</MuiText>
          </MuiLayoutBox>
        </MuiLayoutBox>
      </MuiLayoutBox>

      {/* Form */}

      {showForm && (canCreate || canEdit) && (
        <RoleForm
          fetchRoles={fetchRoles}
          showNotice={showRoleNotice}
          editRole={editRole}
          setEditRole={setEditRole}
          setShowForm={setShowForm}
          setPendingDelete={setPendingDelete}
        />
      )}

      {/* Search */}

      <MuiLayoutBox className="role-search-card" component="div">

        <MuiLayoutBox className="role-filter-row" component="div">

          <TextField
            className="role-search-field"
            fullWidth
            placeholder="Search roles..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            slotProps={{ input: {
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            } }}
          />

          <FormControl className="role-status-filter">

            <InputLabel>Status</InputLabel>

            <Select
              value={statusFilter}
              label="Status"
              onChange={(e) => setStatusFilter(e.target.value)}
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

      </MuiLayoutBox>

      {/* Table */}

      <MuiLayoutBox className="role-list-card" component="div">
        <MuiLayoutBox className="role-list-header" component="div">
          <MuiLayoutBox component="div">
            <MuiText component="h2" variant="h5">Role List</MuiText>

            <MuiText component="p" variant="body1">
              Showing {filteredRoles.length} of {roles.length} roles
            </MuiText>
          </MuiLayoutBox>
        </MuiLayoutBox>

        <RoleTable
          roles={filteredRoles}
          setEditRole={setEditRole}
          setShowForm={setShowForm}
          setPendingDelete={setPendingDelete}
          canEdit={canEdit}
          canDelete={canDelete}
        />
      </MuiLayoutBox>
      <Dialog className="employee-type-dialog" open={Boolean(pendingDelete)} onClose={() => setPendingDelete(null)}>
        <DialogTitle>Delete role?</DialogTitle>
        <DialogContent>Are you sure you want to delete {pendingDelete?.role || "this role"}?</DialogContent>
        <DialogActions><Button onClick={() => setPendingDelete(null)}>Cancel</Button><Button color="error" variant="contained" onClick={confirmDeleteRole}>Delete</Button></DialogActions>
      </Dialog>
      <Snackbar open={notice.open} autoHideDuration={4000} onClose={() => setNotice((current) => ({ ...current, open: false }))} anchorOrigin={{ vertical: "bottom", horizontal: "right" }}>
        <Alert severity={notice.severity} variant="filled" onClose={() => setNotice((current) => ({ ...current, open: false }))}>{notice.message}</Alert>
      </Snackbar>
    </MuiLayoutBox>
  );
}

export default Role;
