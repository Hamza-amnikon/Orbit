import { MuiButtonMigration } from "../../../components/ui/MuiCompat.jsx";
import "./ShiftManagement.css";

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import {
  TextField,
  FormControl,
  Select,
  MenuItem,
  OutlinedInput,
  InputAdornment,
  Button,
  IconButton,
  Snackbar,
  Alert,
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
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";

import { useAuth } from "../../../context/AuthContext";
import { Box as MuiLayoutBox, Typography as MuiText } from "@mui/material";
import { exportRowsToExcel } from "../../../utils/exportExcel";

export default function ShiftManagement() {
  const navigate = useNavigate();
  const { hasPermission } = useAuth();

  const permissionRoute = "/attendance/shifts";

  const canView = hasPermission(permissionRoute, "view");
  const canCreate = hasPermission(permissionRoute, "create");
  const canEdit = hasPermission(permissionRoute, "edit");
  const canDelete = hasPermission(permissionRoute, "delete");
  const canExport = hasPermission(permissionRoute, "export");

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
  const [summaryFilter, setSummaryFilter] = useState("");
  const [notice, setNotice] = useState({ open: false, message: "", severity: "success" });

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

  const resetFilters = () => {
    setSearch("");
    setShift("");
    setDepartment("");
    setStatus("");
    setSummaryFilter("");
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
    if (!canView) return;

    loadShifts();
  }, [canView]);

  /* ===========================================================
     ASSIGN SHIFT
  =========================================================== */

  const handleAssignShift = async (newAssignment) => {
    if (!canCreate) return;

    try {
      await ShiftService.create(newAssignment);

      await loadShifts();

      setAssignOpen(false);

      setSelectedEmployee(null);
      setNotice({ open: true, severity: "success", message: "Shift assigned successfully." });
    } catch (error) {
      console.error("Create Error:", error.response?.data || error);
      setNotice({ open: true, severity: "error", message: "Could not assign the shift. Please try again." });
    }
  };

  /* ===========================================================
     UPDATE SHIFT
  =========================================================== */

  const handleUpdateShift = async (updatedEmployee) => {
    if (!canEdit) return;

    try {
      await ShiftService.update(
        selectedEmployee.shiftId,
        updatedEmployee
      );

      await loadShifts();

      setEditOpen(false);

      setSelectedEmployee(null);
      setNotice({ open: true, severity: "success", message: "Shift assignment updated." });
    } catch (error) {
      console.error("Update Error:", error.response?.data || error);
      setNotice({ open: true, severity: "error", message: "Could not update the shift assignment." });
    }
  };

  /* ===========================================================
     DELETE SHIFT
  =========================================================== */

  const handleDeleteShift = async () => {
    if (!canDelete) return;

    try {
      await ShiftService.remove(selectedEmployee.shiftId);

      await loadShifts();

      setDeleteOpen(false);

      setSelectedEmployee(null);
      setNotice({ open: true, severity: "success", message: "Shift assignment deleted." });
    } catch (error) {
      console.error("Delete Error:", error.response?.data || error);
      setNotice({ open: true, severity: "error", message: "Could not delete the shift assignment." });
    }
  };

  /* ===========================================================
     REFRESH BUTTON
  =========================================================== */

  const handleRefresh = async () => {
    await loadShifts();
  };

  const handleExport = async () => {
    try {
      await exportRowsToExcel(filteredEmployees, [
        ["Employee ID", (row) => row.azureEmployeeId || row.employeeCode || ""], ["Employee", "employeeName"],
        ["Department", "department"], ["Designation", "designation"], ["Shift", (row) => row.shiftName || row.shift || ""],
        ["From Date", "fromDate"], ["To Date", "toDate"], ["Weekly Off 1", "weeklyOff1"], ["Weekly Off 2", "weeklyOff2"], ["Status", "status"],
      ], "Shift-Assignments.xlsx", "Shift Assignments");
      setNotice({ open: true, severity: "success", message: `Exported ${filteredEmployees.length} shift assignments.` });
    } catch (error) {
      console.error("Shift export error", error);
      setNotice({ open: true, severity: "error", message: "Could not export shift assignments." });
    }
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
    const keyword = search.toLowerCase().trim();

    const searchMatch =
      keyword === "" ||
      String(item.employeeName || "").toLowerCase().includes(keyword) ||
      String(item.employeeCode || item.azureEmployeeId || "").toLowerCase().includes(keyword) ||
      String(item.department || "").toLowerCase().includes(keyword) ||
      String(item.designation || "").toLowerCase().includes(keyword);

    const shiftMatch =
      shift === "" ||
      (item.shiftName || item.shift) === shift;

    const departmentMatch =
      department === "" ||
      item.department === department;

    const statusMatch =
      status === "" ||
      item.status === status;

    const summaryMatch = summaryFilter !== "off" || item.weeklyOff1 === todayName || item.weeklyOff2 === todayName;

    return (
      searchMatch &&
      shiftMatch &&
      departmentMatch &&
      statusMatch &&
      summaryMatch
    );
  });

  const shifts = [
    ...new Set(
      employees
        .map((x) => x.shiftName || x.shift)
        .filter(Boolean)
    ),
  ];

  const departments = [
    ...new Set(employees.map((x) => x.department))
  ];

  const statuses = [
    ...new Set(employees.map((x) => x.status))
  ];

  if (!canView) {
    return null;
  }

  return (
    <MuiLayoutBox className="shift-management" component="div">

      {/* ================= HEADER ================= */}

      <MuiLayoutBox className="shift-header-card" component="div">
        <MuiLayoutBox className="shift-header-leading" component="div">
          <IconButton aria-label="Back to Attendance" onClick={() => navigate("/attendance")} className="attendance-back-button"><ArrowBackRoundedIcon /></IconButton>
          <MuiLayoutBox component="div">
          <MuiText component="h2" variant="h5">Shift Management</MuiText>

          <MuiText component="p" variant="body1">
            Monitor employee shift assignments and today's workforce.
          </MuiText>
          </MuiLayoutBox>
        </MuiLayoutBox>

        <MuiLayoutBox className="shift-header-actions" component="div">

          <MuiButtonMigration
            className="outline-btn"
            onClick={handleRefresh}
          >
            <RefreshIcon />
            Refresh
          </MuiButtonMigration>

          {canExport && (
            <MuiButtonMigration className="outline-btn" onClick={handleExport}>
              <FileDownloadIcon />
              Export
            </MuiButtonMigration>
          )}

          {canCreate && (
            <MuiButtonMigration
              className="primary-btn"
              onClick={() => setAssignOpen(true)}
            >
              <AddIcon />
              Assign Shift
            </MuiButtonMigration>
          )}

        </MuiLayoutBox>
      </MuiLayoutBox>

      {/* ================= DASHBOARD ================= */}

      <MuiLayoutBox className="shift-summary-grid" component="div">

        <DashboardCard
          title="Morning Shift"
          value={dashboard.morning}
          subtitle="Employees Assigned"
          color="#F59E0B"
          icon={<WbSunnyIcon />}
          onClick={() => { setShift((current) => current === "Morning" ? "" : "Morning"); setSummaryFilter(""); }}
          selected={shift === "Morning" && !summaryFilter}
        />

        <DashboardCard
          title="General Shift"
          value={dashboard.general}
          subtitle="Employees Assigned"
          color="#10B981"
          icon={<GroupsIcon />}
          onClick={() => { setShift((current) => current === "General" ? "" : "General"); setSummaryFilter(""); }}
          selected={shift === "General" && !summaryFilter}
        />

        <DashboardCard
          title="Evening Shift"
          value={dashboard.evening}
          subtitle="Employees Assigned"
          color="#6366F1"
          icon={<ScheduleIcon />}
          onClick={() => { setShift((current) => current === "Evening" ? "" : "Evening"); setSummaryFilter(""); }}
          selected={shift === "Evening" && !summaryFilter}
        />

        <DashboardCard
          title="Night Shift"
          value={dashboard.night}
          subtitle="Employees Assigned"
          color="#8B5CF6"
          icon={<NightsStayIcon />}
          onClick={() => { setShift((current) => current === "Night" ? "" : "Night"); setSummaryFilter(""); }}
          selected={shift === "Night" && !summaryFilter}
        />

        <DashboardCard
          title="Off Today"
          value={dashboard.off}
          subtitle="Employees Off"
          color="#EF4444"
          icon={<WeekendIcon />}
          onClick={() => { setShift(""); setSummaryFilter((current) => current === "off" ? "" : "off"); }}
          selected={summaryFilter === "off"}
        />

      </MuiLayoutBox>

      {/* ================= FILTERS ================= */}

      <MuiLayoutBox className="shift-filter-card" component="div">

        {/* Search */}

        <TextField
          className="shift-search-field"
          fullWidth
          placeholder="Search by name, employee ID or department..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          variant="outlined"
          size="medium"
          slotProps={{ input: {
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
            endAdornment: search ? <InputAdornment position="end"><IconButton aria-label="Clear search" size="small" onClick={() => setSearch("")}><CloseRoundedIcon fontSize="small" /></IconButton></InputAdornment> : null,
          } }}
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

      </MuiLayoutBox>

      {/* ================= TABLE ================= */}

      <MuiLayoutBox className="shift-table-card" component="div">

        <MuiLayoutBox className="table-header" component="div">

          <MuiLayoutBox className="table-header-left" component="div">

            <MuiText className="table-tag" component="span" variant="inherit">
              SHIFT DIRECTORY
            </MuiText>

            <MuiText component="h3" variant="h6">Today's Shift Employees</MuiText>

            <MuiText component="p" variant="body1">
              View and manage employee shift assignments.
            </MuiText>

          </MuiLayoutBox>

          <MuiLayoutBox className="table-header-right" component="div">

            <MuiLayoutBox className="record-count" component="div">

              <MuiText component="strong" variant="inherit">
                {filteredEmployees.length}
              </MuiText>

              <MuiText component="span" variant="inherit">
                Employees
              </MuiText>

            </MuiLayoutBox>

          </MuiLayoutBox>

        </MuiLayoutBox>

        <ShiftTable
          rows={filteredEmployees}

          onView={(row) => {
            if (!canView) return;

            setSelectedEmployee(row);

            setDetailsOpen(true);
          }}

          onEdit={(row) => {
            if (!canEdit) return;

            setSelectedEmployee(row);

            setEditOpen(true);
          }}

          onDelete={(row) => {
            if (!canDelete) return;

            setSelectedEmployee(row);

            setDeleteOpen(true);
          }}
        />

      </MuiLayoutBox>

      {/* ================= DIALOGS ================= */}

      {canCreate && (
        <AssignShiftDialog
          open={assignOpen}
          onClose={() => setAssignOpen(false)}
          onSave={handleAssignShift}
        />
      )}

      <ShiftDetailsDialog
        open={detailsOpen}
        employee={selectedEmployee}
        onClose={() => {
          setDetailsOpen(false);

          setSelectedEmployee(null);
        }}
      />

      {canEdit && (
        <EditShiftAssignmentDialog
          open={editOpen}
          employee={selectedEmployee}
          onClose={() => {
            setEditOpen(false);

            setSelectedEmployee(null);
          }}
          onUpdate={handleUpdateShift}
        />
      )}

      {canDelete && (
        <DeleteShiftAssignmentDialog
          open={deleteOpen}
          employee={selectedEmployee}
          onClose={() => {
            setDeleteOpen(false);

            setSelectedEmployee(null);
          }}
          onDelete={handleDeleteShift}
        />
      )}

      <Snackbar open={notice.open} autoHideDuration={4500} onClose={() => setNotice((current) => ({ ...current, open: false }))} anchorOrigin={{ vertical: "bottom", horizontal: "right" }}>
        <Alert severity={notice.severity} variant="filled" onClose={() => setNotice((current) => ({ ...current, open: false }))}>{notice.message}</Alert>
      </Snackbar>

    </MuiLayoutBox>
  );
}
