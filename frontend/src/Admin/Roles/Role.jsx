import { useState, useEffect } from "react";
import { FormControl, InputLabel, Select, MenuItem } from "@mui/material";
import * as XLSX from "xlsx";
import { useNavigate } from "react-router-dom";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import RoleForm from "./RoleForm";
import RoleTable from "./RoleTable";
import { getRoles } from "./RoleService";
import "./Role.css";

function Role() {
  const navigate = useNavigate();

  const [roles, setRoles] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editRole, setEditRole] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // Fetch Roles
  const fetchRoles = async () => {
    try {
      const response = await getRoles();
      setRoles(response.data);
    } catch (error) {
      console.error("Error fetching roles:", error);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  // Refresh
  const handleRefresh = async () => {
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
  const exportToExcel = () => {
    const data = filteredRoles.map((role, index) => ({
      "S.No": index + 1,
      Role: role.role,
      "Created Date": role.createdDate,
      Status: role.status,
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);

    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, "Roles");

    XLSX.writeFile(workbook, "Roles.xlsx");
  };

  return (
    <div className="role-page">
      {/* Header */}

      <div className="role-header-card">
        <div>
          <h1>Role Management</h1>

          <p>Manage user roles and permissions.</p>
        </div>

        <div className="role-header-buttons">
          <button
            className="previous-btn"
            onClick={() => navigate("/employees")}
          >
            ← Previous
          </button>

          <button className="refresh-btn" onClick={handleRefresh}>
            ↻ Refresh
          </button>

          <button className="export-btn" onClick={exportToExcel}>
            ⬇ Export
          </button>

<button
    className="add-role-btn"
    onClick={() => {
        setEditRole(null);
        setShowForm(true);
    }}
>
    <AddRoundedIcon fontSize="small" />
    <span>Add Role</span>
</button>
        </div>
      </div>

      {/* Statistics */}

      <div className="role-stats">
        <div className="role-stat-card">
          <div className="role-stat-icon blue">👥</div>

          <div>
            <h3>{totalRoles}</h3>

            <p>Total Roles</p>
          </div>
        </div>

        <div className="role-stat-card">
          <div className="role-stat-icon green">✔</div>

          <div>
            <h3>{activeRoles}</h3>

            <p>Active Roles</p>
          </div>
        </div>

        <div className="role-stat-card">
          <div className="role-stat-icon red">✖</div>

          <div>
            <h3>{inactiveRoles}</h3>

            <p>Inactive Roles</p>
          </div>
        </div>
      </div>

      {/* Form */}

      {showForm && (
        <RoleForm
          fetchRoles={fetchRoles}
          editRole={editRole}
          setEditRole={setEditRole}
          setShowForm={setShowForm}
        />
      )}

      {/* Search */}

<div className="role-search-card">

  <div className="role-filter-row">

    <div className="role-search-box">

      <span className="search-icon">🔍</span>

      <input
        type="text"
        className="role-search"
        placeholder="Search role..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

    </div>

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

  </div>

</div>

      {/* Table */}

      <div className="role-list-card">
        <div className="role-list-header">
          <div>
            <h2>Role List</h2>

            <p>
              Showing {filteredRoles.length} of {roles.length} roles
            </p>
          </div>
        </div>

        <RoleTable
          roles={filteredRoles}
          fetchRoles={fetchRoles}
          setEditRole={setEditRole}
          setShowForm={setShowForm}
        />
      </div>
    </div>
  );
}

export default Role;
