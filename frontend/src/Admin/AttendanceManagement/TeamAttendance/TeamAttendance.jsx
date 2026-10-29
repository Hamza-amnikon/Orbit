import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Card,
  Chip,
  CircularProgress,
  Grid,
  InputAdornment,
  MenuItem,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import AccessTimeRoundedIcon from "@mui/icons-material/AccessTimeRounded";
import CalendarMonthRoundedIcon from "@mui/icons-material/CalendarMonthRounded";
import Groups2RoundedIcon from "@mui/icons-material/Groups2Rounded";
import DownloadRoundedIcon from "@mui/icons-material/DownloadRounded";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import TaskAltRoundedIcon from "@mui/icons-material/TaskAltRounded";
import TimerOffRoundedIcon from "@mui/icons-material/TimerOffRounded";
import { useAuth } from "../../../context/AuthContext";
import AttendanceService from "../services/AttendanceService";
import HierarchyService from "../services/HierarchyService";
import { exportRowsToExcel } from "../../../utils/exportExcel";
import { getAttendanceStatusForDuration } from "../AttendanceLogs/attendanceRules";
import "./TeamAttendance.css";

const TEAM_ROUTE = "/attendance/team-logs";
const EXISTING_LOGS_ROUTE = "/attendance/logs";

const valueOf = (row, camelCase, pascalCase) => row?.[camelCase] ?? row?.[pascalCase];

const getSubordinateIds = (hierarchy, managerId) => {
  const reportsByManager = new Map();

  for (const person of hierarchy) {
    const personId = Number(valueOf(person, "employeeId", "EmployeeId"));
    const manager = Number(valueOf(person, "reportsToEmployeeId", "ReportsToEmployeeId"));
    if (!Number.isFinite(personId) || personId <= 0 || !Number.isFinite(manager) || manager <= 0) continue;
    const directReports = reportsByManager.get(manager) ?? [];
    directReports.push(personId);
    reportsByManager.set(manager, directReports);
  }

  const descendants = new Set();
  const visited = new Set([managerId]);
  const queue = [managerId];

  while (queue.length) {
    const currentManagerId = queue.shift();
    for (const reportId of reportsByManager.get(currentManagerId) ?? []) {
      if (visited.has(reportId)) continue;
      visited.add(reportId);
      descendants.add(reportId);
      queue.push(reportId);
    }
  }

  return descendants;
};

const formatDate = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "—"
    : date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
};

const formatTime = (value) => (value ? String(value).slice(0, 5) : "—");

const normalizeStatus = (status) => String(status ?? "").trim().toLowerCase().replace(/[ _-]/g, "");

const statusColor = (status) => {
  const normalized = normalizeStatus(status);
  if (normalized === "present") return "success";
  if (normalized === "late") return "warning";
  if (normalized === "halfday") return "info";
  if (normalized === "absent") return "error";
  return "default";
};

export default function TeamAttendance() {
  const navigate = useNavigate();
  const { employeeId, hasPermission } = useAuth();
  const canView = hasPermission(TEAM_ROUTE, "view") || hasPermission(EXISTING_LOGS_ROUTE, "view");
  const canExport = hasPermission(TEAM_ROUTE, "export") || hasPermission(EXISTING_LOGS_ROUTE, "export");

  const [rows, setRows] = useState([]);
  const [memberCount, setMemberCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [shift, setShift] = useState("");
  const [status, setStatus] = useState("");
  const [date, setDate] = useState("");

  const loadTeamAttendance = useCallback(async () => {
    const currentEmployeeId = Number(employeeId);
    if (!Number.isFinite(currentEmployeeId) || currentEmployeeId <= 0) {
      setRows([]);
      setMemberCount(0);
      setError("Your employee profile could not be matched to the reporting hierarchy.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");
    try {
      const [hierarchyResult, attendanceResult] = await Promise.all([
        HierarchyService.getHierarchy(),
        date ? AttendanceService.getByDate(date) : AttendanceService.getAll(),
      ]);
      const hierarchy = Array.isArray(hierarchyResult) ? hierarchyResult : [];
      const attendance = Array.isArray(attendanceResult) ? attendanceResult : [];
      const subordinateIds = getSubordinateIds(hierarchy, currentEmployeeId);
      const teamAttendance = attendance
        .filter((item) => subordinateIds.has(Number(valueOf(item, "employeeId", "EmployeeId"))))
        .map((item) => ({
          ...item,
          status: getAttendanceStatusForDuration(
            valueOf(item, "status", "Status"),
            valueOf(item, "checkIn", "CheckIn"),
            valueOf(item, "checkOut", "CheckOut"),
            valueOf(item, "totalHours", "TotalHours"),
          ),
        }))
        .sort((left, right) => new Date(valueOf(right, "attendanceDate", "AttendanceDate") ?? 0) - new Date(valueOf(left, "attendanceDate", "AttendanceDate") ?? 0));

      setMemberCount(subordinateIds.size);
      setRows(teamAttendance);
    } catch (loadError) {
      console.error("Team attendance load error:", loadError);
      setError("Team attendance could not be loaded. Check the hierarchy and attendance services, then refresh.");
      setRows([]);
      setMemberCount(0);
    } finally {
      setLoading(false);
    }
  }, [employeeId, date]);

  useEffect(() => {
    if (canView) loadTeamAttendance();
  }, [canView, loadTeamAttendance]);

  const shifts = useMemo(
    () => [...new Set(rows.map((row) => valueOf(row, "shift", "Shift")).filter(Boolean))].sort(),
    [rows],
  );

  const filteredBySearch = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    return rows.filter((row) => {
      const rowDate = valueOf(row, "attendanceDate", "AttendanceDate");
      const searchable = [
        valueOf(row, "employeeName", "EmployeeName"),
        valueOf(row, "employeeCode", "EmployeeCode"),
        valueOf(row, "azureEmployeeId", "AzureEmployeeId"),
        valueOf(row, "department", "Department"),
        valueOf(row, "designation", "Designation"),
      ].some((value) => String(value ?? "").toLowerCase().includes(keyword));

      return (!keyword || searchable) &&
        (!shift || valueOf(row, "shift", "Shift") === shift) &&
        (!date || String(rowDate ?? "").slice(0, 10) === date);
    });
  }, [rows, search, shift, date]);

  const filteredRows = useMemo(
    () => filteredBySearch.filter((row) => !status || normalizeStatus(row.status) === normalizeStatus(status)),
    [filteredBySearch, status],
  );

  const summary = useMemo(() => ({
    present: filteredBySearch.filter((row) => normalizeStatus(row.status) === "present").length,
    halfDay: filteredBySearch.filter((row) => normalizeStatus(row.status) === "halfday").length,
    absent: filteredBySearch.filter((row) => normalizeStatus(row.status) === "absent").length,
    late: filteredBySearch.filter((row) => normalizeStatus(row.status) === "late").length,
  }), [filteredBySearch]);

  const exportTeamAttendance = async () => {
    await exportRowsToExcel(filteredRows, [
      ["Employee ID", (row) => valueOf(row, "azureEmployeeId", "AzureEmployeeId") || valueOf(row, "employeeCode", "EmployeeCode") || ""],
      ["Employee", (row) => valueOf(row, "employeeName", "EmployeeName") || ""],
      ["Department", (row) => valueOf(row, "department", "Department") || ""],
      ["Designation", (row) => valueOf(row, "designation", "Designation") || ""],
      ["Date", (row) => formatDate(valueOf(row, "attendanceDate", "AttendanceDate"))],
      ["Shift", (row) => valueOf(row, "shift", "Shift") || ""],
      ["Check In", (row) => valueOf(row, "checkIn", "CheckIn") || ""],
      ["Check Out", (row) => valueOf(row, "checkOut", "CheckOut") || ""],
      ["Total Hours", (row) => valueOf(row, "totalHours", "TotalHours") || ""],
      ["Status", "status"],
    ], "Team-Attendance.xlsx", "Team Attendance");
  };

  if (!canView) return null;

  return (
    <Box className="team-attendance-page">
      <Box className="team-attendance-header">
        <Box className="team-attendance-title-group">
          <Button className="team-attendance-back" aria-label="Back to Attendance Management" onClick={() => navigate("/attendance")}>
            <ArrowBackRoundedIcon />
          </Button>
          <Box>
            <Typography className="team-attendance-eyebrow">ATTENDANCE MANAGEMENT</Typography>
            <Typography component="h1" className="team-attendance-title">Team Attendance</Typography>
            <Typography className="team-attendance-subtitle">Attendance records for employees in your reporting hierarchy.</Typography>
          </Box>
        </Box>
        <Box className="team-attendance-actions">
          <Button className="team-attendance-secondary" startIcon={<RefreshRoundedIcon />} onClick={loadTeamAttendance} disabled={loading}>Refresh</Button>
          {canExport && <Button className="team-attendance-primary" startIcon={<DownloadRoundedIcon />} onClick={exportTeamAttendance} disabled={!filteredRows.length}>Export Excel</Button>}
        </Box>
      </Box>

      {error && <Alert severity="error" className="team-attendance-alert">{error}</Alert>}

      <Grid container spacing={2} className="team-attendance-summary">
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <Card className="team-attendance-stat-card">
            <Box className="team-attendance-stat-icon team-icon-blue"><Groups2RoundedIcon /></Box>
            <Box><Typography className="team-attendance-stat-label">Team members</Typography><Typography className="team-attendance-stat-value">{loading ? "—" : memberCount}</Typography><Typography className="team-attendance-stat-caption">Employees below you</Typography></Box>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <Card className="team-attendance-stat-card">
            <Box className="team-attendance-stat-icon team-icon-green"><TaskAltRoundedIcon /></Box>
            <Box><Typography className="team-attendance-stat-label">Present</Typography><Typography className="team-attendance-stat-value">{loading ? "—" : summary.present}</Typography><Typography className="team-attendance-stat-caption">In the current filters</Typography></Box>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <Card className="team-attendance-stat-card">
            <Box className="team-attendance-stat-icon team-icon-amber"><AccessTimeRoundedIcon /></Box>
            <Box><Typography className="team-attendance-stat-label">Half day / late</Typography><Typography className="team-attendance-stat-value">{loading ? "—" : summary.halfDay + summary.late}</Typography><Typography className="team-attendance-stat-caption">In the current filters</Typography></Box>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <Card className="team-attendance-stat-card">
            <Box className="team-attendance-stat-icon team-icon-red"><TimerOffRoundedIcon /></Box>
            <Box><Typography className="team-attendance-stat-label">Absent</Typography><Typography className="team-attendance-stat-value">{loading ? "—" : summary.absent}</Typography><Typography className="team-attendance-stat-caption">In the current filters</Typography></Box>
          </Card>
        </Grid>
      </Grid>

      <Paper className="team-attendance-filter-card" elevation={0}>
        <TextField
          fullWidth
          className="team-attendance-search"
          placeholder="Search employee, ID or department"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchRoundedIcon /></InputAdornment> } }}
          inputProps={{ "aria-label": "Search team attendance" }}
        />
        <TextField select fullWidth label="Shift" value={shift} onChange={(event) => setShift(event.target.value)}>
          <MenuItem value="">All shifts</MenuItem>
          {shifts.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
        </TextField>
        <TextField select fullWidth label="Status" value={status} onChange={(event) => setStatus(event.target.value)}>
          <MenuItem value="">All statuses</MenuItem>
          {["Present", "Half Day", "Absent", "Late", "Leave", "WFH"].map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
        </TextField>
        <TextField
          fullWidth
          label="Date"
          type="date"
          value={date}
          onChange={(event) => setDate(event.target.value)}
          slotProps={{ inputLabel: { shrink: true }, input: { startAdornment: <InputAdornment position="start"><CalendarMonthRoundedIcon /></InputAdornment> } }}
        />
        <Button className="team-attendance-reset" onClick={() => { setSearch(""); setShift(""); setStatus(""); setDate(""); }}>Reset</Button>
      </Paper>

      <Paper className="team-attendance-table-card" elevation={0}>
        <Box className="team-attendance-table-heading">
          <Box>
            <Typography className="team-attendance-table-eyebrow">REPORTING HIERARCHY</Typography>
            <Typography component="h2" className="team-attendance-table-title">Attendance log list</Typography>
            <Typography className="team-attendance-table-subtitle">Showing records for your direct and indirect reports.</Typography>
          </Box>
          <Chip className="team-attendance-count" label={`${filteredRows.length} records`} />
        </Box>

        {loading ? (
          <Box className="team-attendance-state"><CircularProgress size={26} /><Typography>Loading team attendance…</Typography></Box>
        ) : memberCount === 0 && !error ? (
          <Box className="team-attendance-state"><Groups2RoundedIcon /><Typography className="team-attendance-empty-title">No employees report to you yet</Typography><Typography>When your reporting hierarchy is set up, their attendance will appear here.</Typography></Box>
        ) : filteredRows.length === 0 && !error ? (
          <Box className="team-attendance-state"><AccessTimeRoundedIcon /><Typography className="team-attendance-empty-title">No attendance records found</Typography><Typography>Try changing or clearing your filters.</Typography></Box>
        ) : (
          <TableContainer className="team-attendance-table-wrap">
            <Table className="team-attendance-table" aria-label="Team attendance records">
              <TableHead><TableRow>
                <TableCell>Employee</TableCell><TableCell>Department</TableCell><TableCell>Date</TableCell><TableCell>Shift</TableCell><TableCell>Check in</TableCell><TableCell>Check out</TableCell><TableCell>Working hours</TableCell><TableCell>Status</TableCell>
              </TableRow></TableHead>
              <TableBody>{filteredRows.map((row, index) => {
                const rowId = valueOf(row, "attendanceId", "AttendanceId") ?? `${valueOf(row, "employeeId", "EmployeeId")}-${valueOf(row, "attendanceDate", "AttendanceDate")}-${index}`;
                const name = valueOf(row, "employeeName", "EmployeeName") || "Employee";
                const employeeRef = valueOf(row, "azureEmployeeId", "AzureEmployeeId") || valueOf(row, "employeeCode", "EmployeeCode") || `#${valueOf(row, "employeeId", "EmployeeId") ?? "—"}`;
                return <TableRow key={rowId} hover>
                  <TableCell><Box className="team-attendance-employee"><Box className="team-attendance-avatar">{String(name).slice(0, 1).toUpperCase()}</Box><Box><Typography className="team-attendance-employee-name">{name}</Typography><Typography className="team-attendance-employee-id">{employeeRef}</Typography></Box></Box></TableCell>
                  <TableCell>{valueOf(row, "department", "Department") || "—"}</TableCell>
                  <TableCell>{formatDate(valueOf(row, "attendanceDate", "AttendanceDate"))}</TableCell>
                  <TableCell>{valueOf(row, "shift", "Shift") || "—"}</TableCell>
                  <TableCell>{formatTime(valueOf(row, "checkIn", "CheckIn"))}</TableCell>
                  <TableCell>{formatTime(valueOf(row, "checkOut", "CheckOut"))}</TableCell>
                  <TableCell className="team-attendance-hours">{valueOf(row, "totalHours", "TotalHours") || "—"}</TableCell>
                  <TableCell><Chip size="small" label={row.status || "Unknown"} color={statusColor(row.status)} className={`team-attendance-status status-${normalizeStatus(row.status)}`} /></TableCell>
                </TableRow>;
              })}</TableBody>
            </Table>
          </TableContainer>
        )}
        <Box className="team-attendance-table-footer">{filteredRows.length} of {rows.length} team attendance records</Box>
      </Paper>
    </Box>
  );
}
