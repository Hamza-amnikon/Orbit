import { useEffect, useMemo, useState } from "react";
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
  TablePagination,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import AccessTimeRoundedIcon from "@mui/icons-material/AccessTimeRounded";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import dayjs from "dayjs";
import Groups2RoundedIcon from "@mui/icons-material/Groups2Rounded";
import DownloadRoundedIcon from "@mui/icons-material/DownloadRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import TaskAltRoundedIcon from "@mui/icons-material/TaskAltRounded";
import TimerOffRoundedIcon from "@mui/icons-material/TimerOffRounded";
import { useAuth } from "../../../context/AuthContext";
import AttendanceService from "../services/AttendanceService";
import HierarchyService from "../services/HierarchyService";
import { exportRowsToExcel } from "../../../utils/exportExcel";
import { getAttendanceStatusForDuration } from "../AttendanceLogs/attendanceRules";
import { attendanceCalendarDate, attendanceDateKey } from "../attendanceDate";
import EditAttendanceDialog from "../AttendanceLogs/EditAttendanceDialog";
import "./TeamAttendance.css";

const TEAM_ROUTE = "/attendance/team-logs";
const EXISTING_LOGS_ROUTE = "/attendance/logs";
const currentMonth = () => attendanceDateKey(new Date()).slice(0, 7);
const pickerSlotProps = { textField: { fullWidth: true }, popper: { className: "attendance-date-popover" } };

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
  const date = attendanceCalendarDate(value);
  return Number.isNaN(date.getTime())
    ? "—"
    : date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
};

const formatTime = (value) => (value ? String(value).slice(0, 5) : "—");

const normalizeStatus = (status) => String(status ?? "").trim().toLowerCase().replace(/[ _-]/g, "");

const statusColor = (status) => {
  const normalized = normalizeStatus(status);
  if (normalized === "present") return "success";
  if (normalized === "early") return "info";
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

  const canEdit = hasPermission(TEAM_ROUTE, "edit") || hasPermission(EXISTING_LOGS_ROUTE, "edit");

  const [rows, setRows] = useState([]);
  const [memberCount, setMemberCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [shift, setShift] = useState("");
  const [status, setStatus] = useState("");
  const [month, setMonth] = useState(currentMonth);
  const [date, setDate] = useState("");
  const [editingAttendance, setEditingAttendance] = useState(null);
  const [saveMessage, setSaveMessage] = useState("");
  const [refreshVersion, setRefreshVersion] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const monthStart = dayjs(`${month}-01`);

  useEffect(() => {
    if (!canView) return;

    let active = true;
    const currentEmployeeId = Number(employeeId);
    if (!Number.isSafeInteger(currentEmployeeId) || currentEmployeeId <= 0) {
      setRows([]);
      setMemberCount(0);
      setError("Your employee profile could not be matched to the reporting hierarchy.");
      setLoading(false);
      return;
    }

    const loadTeamAttendance = async () => {
      setLoading(true);
      setError("");
      const start = dayjs(`${month}-01`);
      try {
        const [hierarchyResult, attendanceResult] = await Promise.all([
          HierarchyService.getHierarchy(),
          date
            ? AttendanceService.getByDate(date)
            : AttendanceService.getByDateRange(start.format("YYYY-MM-DD"), start.add(1, "month").format("YYYY-MM-DD")),
        ]);
        if (!active) return;

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
        if (!active) return;
        console.error("Team attendance load error:", loadError);
        setError("Team attendance could not be loaded. Check the hierarchy and attendance services, then refresh.");
        setRows([]);
        setMemberCount(0);
      } finally {
        if (active) setLoading(false);
      }
    };

    loadTeamAttendance();
    return () => { active = false; };
  }, [canView, employeeId, month, date, refreshVersion]);

  const shifts = useMemo(
    () => [...new Set([shift, ...rows.map((row) => valueOf(row, "shift", "Shift"))].filter(Boolean))].sort(),
    [rows, shift],
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
        attendanceDateKey(rowDate).startsWith(date || month);
    });
  }, [rows, search, shift, date, month]);

  const filteredRows = useMemo(
    () => filteredBySearch.filter((row) => !status || normalizeStatus(row.status) === normalizeStatus(status)),
    [filteredBySearch, status],
  );

  const visiblePage = Math.min(page, Math.max(0, Math.ceil(filteredRows.length / rowsPerPage) - 1));
  const visibleRows = filteredRows.slice(visiblePage * rowsPerPage, (visiblePage + 1) * rowsPerPage);

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
          <Button className="team-attendance-secondary" startIcon={<RefreshRoundedIcon />} onClick={() => setRefreshVersion((version) => version + 1)} disabled={loading}>Refresh</Button>
          {canExport && <Button className="team-attendance-primary" startIcon={<DownloadRoundedIcon />} onClick={exportTeamAttendance} disabled={loading || !filteredRows.length}>Export Excel</Button>}
        </Box>
      </Box>

      {error && <Alert severity="error" className="team-attendance-alert">{error}</Alert>}

      {saveMessage && <Alert severity="success" className="team-attendance-alert" onClose={() => setSaveMessage("")}>{saveMessage}</Alert>}

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
          onChange={(event) => { setSearch(event.target.value); setPage(0); }}
          slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchRoundedIcon /></InputAdornment> } }}
          inputProps={{ "aria-label": "Search team attendance" }}
        />
        <TextField select fullWidth label="Shift" value={shift} onChange={(event) => { setShift(event.target.value); setPage(0); }}>
          <MenuItem value="">All shifts</MenuItem>
          {shifts.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
        </TextField>
        <TextField select fullWidth label="Status" value={status} onChange={(event) => { setStatus(event.target.value); setPage(0); }}>
          <MenuItem value="">All statuses</MenuItem>
          {["Present", "Early", "Half Day", "Absent", "Late", "Leave", "WFH"].map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
        </TextField>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DatePicker
            label="Month"
            views={["year", "month"]}
            value={monthStart}
            format="MMMM YYYY"
            onChange={(value) => {
              if (!value?.isValid()) return;
              setMonth(value.format("YYYY-MM"));
              setDate("");
              setPage(0);
            }}
            slotProps={pickerSlotProps}
          />
          <DatePicker
            label="Date"
            value={date ? dayjs(date) : null}
            minDate={monthStart}
            maxDate={monthStart.endOf("month")}
            format="DD-MM-YYYY"
            clearable
            onChange={(value, context) => {
              if (context.validationError) return;
              setDate(value ? value.format("YYYY-MM-DD") : "");
              setPage(0);
            }}
            slotProps={pickerSlotProps}
          />
        </LocalizationProvider>
        <Button className="team-attendance-reset" onClick={() => {
          setSearch("");
          setShift("");
          setStatus("");
          setMonth(currentMonth());
          setDate("");
          setPage(0);
        }}>Reset</Button>
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
                <TableCell>Employee</TableCell><TableCell>Department</TableCell><TableCell>Date</TableCell><TableCell>Shift</TableCell><TableCell>Check in</TableCell><TableCell>Check out</TableCell><TableCell>Working hours</TableCell><TableCell>Status</TableCell>{canEdit && <TableCell>Action</TableCell>}
              </TableRow></TableHead>
              <TableBody>{visibleRows.map((row, index) => {
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
                  {canEdit && <TableCell><Button className="team-attendance-edit" size="small" startIcon={<EditRoundedIcon />} onClick={() => { setSaveMessage(""); setEditingAttendance(row); }} disabled={!Number(valueOf(row, "attendanceId", "AttendanceId"))} aria-label={`Edit attendance for ${name} on ${formatDate(valueOf(row, "attendanceDate", "AttendanceDate"))}`}>Edit</Button></TableCell>}
                </TableRow>;
              })}</TableBody>
            </Table>
          </TableContainer>
        )}
        {!loading && filteredRows.length > 0 && (
          <TablePagination
            className="team-attendance-table-footer"
            component="div"
            count={filteredRows.length}
            page={visiblePage}
            rowsPerPage={rowsPerPage}
            rowsPerPageOptions={[10, 25, 50, 100]}
            onPageChange={(_, nextPage) => setPage(nextPage)}
            onRowsPerPageChange={(event) => {
              setRowsPerPage(Number(event.target.value));
              setPage(0);
            }}
          />
        )}
      </Paper>
      {canEdit && <EditAttendanceDialog
        open={Boolean(editingAttendance)}
        attendance={editingAttendance}
        updatedBy={`Manager ${employeeId}`}
        onClose={() => setEditingAttendance(null)}
        onUpdated={() => {
          setEditingAttendance(null);
          setSaveMessage("Team attendance updated.");
          setRefreshVersion((version) => version + 1);
        }}
      />}
    </Box>
  );
}
