import "./ShiftManagement.css";

import { useState, useEffect } from "react";

import {
  TextField,
  FormControl,
  Select,
  MenuItem,
  OutlinedInput,
  InputAdornment,
  Button
} from "@mui/material";
import ShiftService from "../services/ShiftService";
import SearchIcon from "@mui/icons-material/Search";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import ApartmentIcon from "@mui/icons-material/Apartment";
import TaskAltIcon from "@mui/icons-material/TaskAlt";
import AutorenewIcon from "@mui/icons-material/Autorenew";

import DashboardCard from "../Dashboard/DashboardCard";
import ShiftTable from "./ShiftTable";

import ShiftDetailsDialog from "./ShiftDetailsDialog";
import AssignShiftDialog from "./AssignShiftDialog";
import EditShiftAssignmentDialog from "./EditShiftAssignmentDialog";
import DeleteShiftAssignmentDialog from "./DeleteShiftAssignmentDialog";

import GroupsIcon from "@mui/icons-material/Groups";
import WbSunnyIcon from "@mui/icons-material/WbSunny";
import ScheduleIcon from "@mui/icons-material/Schedule";
import NightsStayIcon from "@mui/icons-material/NightsStay";
import WeekendIcon from "@mui/icons-material/Weekend";



import RefreshIcon from "@mui/icons-material/Refresh";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import AddIcon from "@mui/icons-material/Add";


export default function ShiftManagement() {
  /* ===========================================================
     DUMMY DATA
  =========================================================== */

  const [employees, setEmployees] = useState([]);

  /* ===========================================================
     FILTER STATES
  =========================================================== */

  const [search, setSearch] = useState("");
  const [shift, setShift] = useState("");
  const [department, setDepartment] = useState("");
  const [status, setStatus] = useState("");

  /* ===========================================================
     DIALOG STATES
  =========================================================== */

  const [selectedEmployee, setSelectedEmployee] = useState(null);

  const [detailsOpen, setDetailsOpen] = useState(false);
  const [assignOpen, setAssignOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  /* ===========================================================
     RESET FILTERS
  =========================================================== */
/* ===========================================================
   RESET FILTERS
=========================================================== */

const resetFilters = () => {
  setSearch("");
  setShift("");
  setDepartment("");
  setStatus("");
};

/* ===========================================================
   LOAD SHIFTS
=========================================================== */

const loadShifts = async () => {
  try {
    console.log("Loading shifts...");

    const data = await ShiftService.getAll();

    console.log("Latest API Data:", data);

    setEmployees(data);
  } catch (error) {
    console.error(error);
  }
};
/* ===========================================================
   PAGE LOAD
=========================================================== */

useEffect(() => {
  loadShifts();
}, []);

/* ===========================================================
   ASSIGN SHIFT
=========================================================== */

const handleAssignShift = async (newAssignment) => {
  try {
    await ShiftService.create(newAssignment);

    await loadShifts();

    setAssignOpen(false);

    setSelectedEmployee(null);
  } catch (error) {
    console.error("Create Error:", error.response?.data || error);
  }
};
/* ===========================================================
   UPDATE SHIFT
=========================================================== */

const handleUpdateShift = async (updatedEmployee) => {
  try {
    await ShiftService.update(
      selectedEmployee.shiftId,
      updatedEmployee
    );

    await loadShifts();

    setEditOpen(false);

    setSelectedEmployee(null);
  } catch (error) {
    console.error("Update Error:", error.response?.data || error);
  }
};

/* ===========================================================
   DELETE SHIFT
=========================================================== */

const handleDeleteShift = async () => {
  try {
    await ShiftService.remove(selectedEmployee.shiftId);

    await loadShifts();

    setDeleteOpen(false);

    setSelectedEmployee(null);
  } catch (error) {
    console.error("Delete Error:", error.response?.data || error);
  }
};

/* ===========================================================
   REFRESH BUTTON
=========================================================== */

const handleRefresh = async () => {
  await loadShifts();
};
  /* ===========================================================
     DASHBOARD COUNTS
  =========================================================== */
const todayName = new Date().toLocaleDateString("en-US", {
  weekday: "long",
});

const dashboard = {
  morning: employees.filter(
    (x) =>
      (x.shiftName || x.shift) === "Morning" &&
      x.weeklyOff1 !== todayName &&
      x.weeklyOff2 !== todayName
  ).length,

  general: employees.filter(
    (x) =>
      (x.shiftName || x.shift) === "General" &&
      x.weeklyOff1 !== todayName &&
      x.weeklyOff2 !== todayName
  ).length,

  evening: employees.filter(
    (x) =>
      (x.shiftName || x.shift) === "Evening" &&
      x.weeklyOff1 !== todayName &&
      x.weeklyOff2 !== todayName
  ).length,

  night: employees.filter(
    (x) =>
      (x.shiftName || x.shift) === "Night" &&
      x.weeklyOff1 !== todayName &&
      x.weeklyOff2 !== todayName
  ).length,

  off: employees.filter(
    (x) =>
      x.weeklyOff1 === todayName ||
      x.weeklyOff2 === todayName
  ).length,
};
  /* ===========================================================
     FILTER DATA
  =========================================================== */

  const filteredEmployees = employees.filter((item) => {
    const keyword = search.toLowerCase();

    const searchMatch =
      keyword === "" ||
      item.employeeName.toLowerCase().includes(keyword) ||
      item.employeeCode.toLowerCase().includes(keyword) ||
      item.department.toLowerCase().includes(keyword) ||
      item.designation.toLowerCase().includes(keyword);

const shiftMatch =
  shift === "" ||
  (item.shiftName || item.shift) === shift;

    const departmentMatch = department === "" || item.department === department;

    const statusMatch = status === "" || item.status === status;

    return searchMatch && shiftMatch && departmentMatch && statusMatch;
  });

const shifts = [
  ...new Set(
    employees
      .map((x) => x.shiftName || x.shift)
      .filter(Boolean)
  ),
];

  const departments = [...new Set(employees.map((x) => x.department))];

  const statuses = [...new Set(employees.map((x) => x.status))];
  return (
    <div className="shift-management">
      {/* ================= HEADER ================= */}

      <div className="shift-header-card">
        <div>
          <h2>Shift Management</h2>

          <p>Monitor employee shift assignments and today's workforce.</p>
        </div>

        <div className="shift-header-actions">
          <button className="outline-btn">
            <RefreshIcon />
            Refresh
          </button>

          <button className="outline-btn">
            <FileDownloadIcon />
            Export
          </button>

          <button className="primary-btn" onClick={() => setAssignOpen(true)}>
            <AddIcon />
            Assign Shift
          </button>
        </div>
      </div>

      {/* ================= DASHBOARD ================= */}

      <div className="shift-summary-grid">
        <DashboardCard
          title="Morning Shift"
          value={dashboard.morning}
          subtitle="Employees Assigned"
          color="#F59E0B"
          icon={<WbSunnyIcon />}
        />

        <DashboardCard
          title="General Shift"
          value={dashboard.general}
          subtitle="Employees Assigned"
          color="#10B981"
          icon={<GroupsIcon />}
        />

        <DashboardCard
          title="Evening Shift"
          value={dashboard.evening}
          subtitle="Employees Assigned"
          color="#6366F1"
          icon={<ScheduleIcon />}
        />

        <DashboardCard
          title="Night Shift"
          value={dashboard.night}
          subtitle="Employees Assigned"
          color="#8B5CF6"
          icon={<NightsStayIcon />}
        />

        <DashboardCard
          title="Off Today"
          value={dashboard.off}
          subtitle="Employees Off"
          color="#EF4444"
          icon={<WeekendIcon />}
        />
      </div>

      {/* ================= FILTERS ================= */}
{/* ===========================================================
    FILTER BAR
=========================================================== */}

<div className="shift-filter-card">

  {/* Search */}

  <TextField
    fullWidth
    placeholder="Search by name, employee ID or department..."
    value={search}
    onChange={(e) => setSearch(e.target.value)}
    variant="outlined"
    size="medium"
    InputProps={{
      startAdornment: (
        <InputAdornment position="start">
          <SearchIcon />
        </InputAdornment>
      ),
    }}
  />

  {/* Shift */}

  <FormControl fullWidth>

    <Select
      value={shift}
      onChange={(e) => setShift(e.target.value)}
      displayEmpty
      input={<OutlinedInput />}
      startAdornment={
        <InputAdornment position="start">
          <AccessTimeIcon />
        </InputAdornment>
      }
    >

      <MenuItem value="">All Shifts</MenuItem>

      {shifts.map((item) => (

        <MenuItem
          key={item}
          value={item}
        >
          {item}
        </MenuItem>

      ))}

    </Select>

  </FormControl>

  {/* Department */}

  <FormControl fullWidth>

    <Select
      value={department}
      onChange={(e) => setDepartment(e.target.value)}
      displayEmpty
      input={<OutlinedInput />}
      startAdornment={
        <InputAdornment position="start">
          <ApartmentIcon />
        </InputAdornment>
      }
    >

      <MenuItem value="">All Departments</MenuItem>

      {departments.map((item) => (

        <MenuItem
          key={item}
          value={item}
        >
          {item}
        </MenuItem>

      ))}

    </Select>

  </FormControl>

  {/* Status */}

  <FormControl fullWidth>

    <Select
      value={status}
      onChange={(e) => setStatus(e.target.value)}
      displayEmpty
      input={<OutlinedInput />}
      startAdornment={
        <InputAdornment position="start">
          <TaskAltIcon />
        </InputAdornment>
      }
    >

      <MenuItem value="">All Status</MenuItem>

      {statuses.map((item) => (

        <MenuItem
          key={item}
          value={item}
        >
          {item}
        </MenuItem>

      ))}

    </Select>

  </FormControl>

  {/* Reset */}

  <Button
    variant="contained"
    startIcon={<AutorenewIcon />}
    onClick={resetFilters}
    className="reset-btn"
  >
    Reset
  </Button>

</div>
      {/* ================= TABLE ================= */}

      <div className="shift-table-card">
        <div className="table-header">
          <div className="table-header-left">
            <span className="table-tag">SHIFT DIRECTORY</span>

            <h3>Today's Shift Employees</h3>

            <p>View and manage employee shift assignments.</p>
          </div>

          <div className="table-header-right">
            <div className="record-count">
              <strong>{filteredEmployees.length}</strong>

              <span>Employees</span>
            </div>

            <button className="table-btn">Print</button>

            <button className="table-btn">Export CSV</button>
          </div>
        </div>

        <ShiftTable
          rows={filteredEmployees}
          onView={(row) => {
            setSelectedEmployee(row);

            setDetailsOpen(true);
          }}
          onEdit={(row) => {
            setSelectedEmployee(row);

            setEditOpen(true);
          }}
          onDelete={(row) => {
            setSelectedEmployee(row);

            setDeleteOpen(true);
          }}
        />
      </div>

      {/* ================= DIALOGS ================= */}

      <AssignShiftDialog
        open={assignOpen}
        onClose={() => setAssignOpen(false)}
        onSave={handleAssignShift}
      />

      <ShiftDetailsDialog
        open={detailsOpen}
        employee={selectedEmployee}
        onClose={() => {
          setDetailsOpen(false);

          setSelectedEmployee(null);
        }}
      />
      <EditShiftAssignmentDialog
        open={editOpen}
        employee={selectedEmployee}
        onClose={() => {
          setEditOpen(false);

          setSelectedEmployee(null);
        }}
        onUpdate={handleUpdateShift}
      />

      <DeleteShiftAssignmentDialog
        open={deleteOpen}
        employee={selectedEmployee}
        onClose={() => {
          setDeleteOpen(false);

          setSelectedEmployee(null);
        }}
        onDelete={handleDeleteShift}
      />
    </div>
  );
}



