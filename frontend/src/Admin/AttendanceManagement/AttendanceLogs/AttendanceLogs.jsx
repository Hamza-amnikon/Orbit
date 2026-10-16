import { MuiButtonMigration } from "../../../components/ui/MuiCompat.jsx";
import "./AttendanceLogs.css";

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Grid,
  TextField,
  MenuItem,
  Button,
  InputAdornment,
  IconButton,
  Snackbar,
  Alert,
} from "@mui/material";

import SearchIcon from "@mui/icons-material/Search";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import BusinessIcon from "@mui/icons-material/Business";
import TaskAltIcon from "@mui/icons-material/TaskAlt";
import RefreshIcon from "@mui/icons-material/Refresh";
import AttendanceTable from "../components/AttendanceTable";
import DashboardCard from "../Dashboard/DashboardCard";

import AttendanceDetailsDialog from "./AttendanceDetailsDialog";
import EditAttendanceDialog from "./EditAttendanceDialog";
import DeleteAttendanceDialog from "./DeleteAttendanceDialog";
import AddAttendanceDialog from "./AddAttendanceDialog";

import AttendanceService from "../services/AttendanceService";

import GroupsIcon from "@mui/icons-material/Groups";
import PersonOffIcon from "@mui/icons-material/PersonOff";
import TimerIcon from "@mui/icons-material/Timer";
import BeachAccessIcon from "@mui/icons-material/BeachAccess";
import HomeWorkIcon from "@mui/icons-material/HomeWork";

import AutorenewIcon from "@mui/icons-material/Autorenew";

import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import AddIcon from "@mui/icons-material/Add";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";

import { useAuth } from "../../../context/AuthContext";
import { Box as MuiLayoutBox, Typography as MuiText } from "@mui/material";
import { exportRowsToExcel } from "../../../utils/exportExcel";

export default function AttendanceLogs() {
  const navigate = useNavigate();
  const { hasPermission } = useAuth();

  const permissionRoute = "/attendance/logs";

  const canView = hasPermission(permissionRoute, "view");
  const canCreate = hasPermission(permissionRoute, "create");
  const canEdit = hasPermission(permissionRoute, "edit");
  const canDelete = hasPermission(permissionRoute, "delete");
  const canExport = hasPermission(permissionRoute, "export");

  const [search, setSearch] = useState("");

  const [shift, setShift] = useState("");

  const [status, setStatus] = useState("");

  const [date, setDate] = useState("");

  const [attendanceList, setAttendanceList] = useState([]);

  const [loading, setLoading] = useState(false);

  const [dashboard, setDashboard] = useState({
    present: 0,
    absent: 0,
    late: 0,
    leave: 0,
    wfh: 0,
  });

  const [selectedAttendance, setSelectedAttendance] = useState(null);

  const [addOpen, setAddOpen] = useState(false);

  const [detailsOpen, setDetailsOpen] = useState(false);

  const [editOpen, setEditOpen] = useState(false);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [notice, setNotice] = useState({ open: false, message: "", severity: "success" });

  useEffect(() => {
    if (!canView) return;

    loadAttendance();

    loadDashboard();
  }, [canView]);

  const loadAttendance = async () => {
    try {
      setLoading(true);

      const data = await AttendanceService.getAll();

      setAttendanceList(data);
    } catch (error) {
      console.error("Attendance Load Error", error);
    } finally {
      setLoading(false);
    }
  };

  const loadDashboard = async () => {
    try {
      const data = await AttendanceService.getDashboard();

      setDashboard(data);
    } catch (error) {
      console.error("Dashboard Error", error);
    }
  };

  const refreshData = () => {
    loadAttendance();

    loadDashboard();
  };

  const handleGenerateAttendance = async () => {
    if (!canCreate) return;

    try {
      const result = await AttendanceService.generateAttendance();

      setNotice({ open: true, severity: "success", message: `Attendance generated. ${result.generated} created, ${result.skipped} skipped, ${result.weeklyOff} weekly off.` });

      refreshData();
    } catch (error) {
      console.error(error);

      setNotice({ open: true, severity: "error", message: "Could not generate attendance. Please try again." });
    }
  };

  const resetFilters = () => {
    setSearch("");
    setShift("");
    setStatus("");
    setDate("");
  };

  const filteredByOtherFilters = attendanceList.filter((item) => {
    const keyword = search.toLowerCase().trim();

    const searchMatch =
      keyword === "" ||
      item.employeeName?.toLowerCase().includes(keyword) ||
      item.employeeCode?.toLowerCase().includes(keyword) ||
      item.department?.toLowerCase().includes(keyword) ||
      item.designation?.toLowerCase().includes(keyword);

    const shiftMatch = shift === "" || item.shift === shift;

    const dateMatch =
      !date || item.attendanceDate?.split("T")[0] === date;

    return searchMatch && shiftMatch && dateMatch;
  });

  const filteredAttendance = filteredByOtherFilters.filter((item) => {
    if (!status) return true;
    if (status === "Leave") return item.status === "Leave" || item.status === "On Leave";
    return item.status === status;
  });

  const filteredDashboard = {
    present: filteredByOtherFilters.filter(
      x => x.status === "Present"
    ).length,

    absent: filteredByOtherFilters.filter(
      x => x.status === "Absent"
    ).length,

    late: filteredByOtherFilters.filter(
      x => x.status === "Late"
    ).length,

    leave: filteredByOtherFilters.filter(
      x =>
        x.status === "Leave" ||
        x.status === "On Leave"
    ).length,

    wfh: filteredByOtherFilters.filter(
      x => x.status === "WFH"
    ).length,
  };

  const handleDelete = async () => {
    if (!canDelete) return;

    try {
      await AttendanceService.delete(
        selectedAttendance.attendanceId
      );

      setDeleteOpen(false);

      setSelectedAttendance(null);

      refreshData();
    } catch (error) {
      console.error("Delete Error", error);
      setNotice({ open: true, severity: "error", message: "Could not delete the attendance record. Please try again." });
    }
  };

  const handleExport = async () => {
    try {
      await exportRowsToExcel(filteredAttendance, [
        ["Employee ID", (row) => row.azureEmployeeId || row.employeeCode || ""],
        ["Employee", "employeeName"], ["Department", "department"], ["Designation", "designation"],
        ["Date", (row) => row.attendanceDate ? new Date(row.attendanceDate).toLocaleDateString("en-GB") : ""],
        ["Shift", "shift"], ["Check In", "checkIn"], ["Check Out", "checkOut"], ["Total Hours", "totalHours"], ["Status", "status"],
      ], "Attendance-Logs.xlsx", "Attendance Logs");
      setNotice({ open: true, severity: "success", message: `Exported ${filteredAttendance.length} attendance records.` });
    } catch (error) {
      console.error("Attendance export error", error);
      setNotice({ open: true, severity: "error", message: "Could not export attendance records." });
    }
  };

  const shifts = [
    ...new Set(attendanceList.map((x) => x.shift)),
  ].filter(Boolean);

  const statuses = [
    ...new Set(attendanceList.map((x) => x.status)),
  ];

  if (!canView) {
    return null;
  }

  return (
    <MuiLayoutBox className="attendance-logs" component="div">
      {/* HEADER */}

      <MuiLayoutBox className="attendance-header-card" component="div">
        <MuiLayoutBox className="attendance-header-leading" component="div">
          <IconButton aria-label="Back to Attendance" onClick={() => navigate("/attendance")} className="attendance-back-button"><ArrowBackRoundedIcon /></IconButton>
          <MuiLayoutBox component="div">
          <MuiText component="h2" variant="h5">Attendance Logs</MuiText>

          <MuiText component="p" variant="body1">
            View, search and manage employee attendance records.
          </MuiText>
          </MuiLayoutBox>
        </MuiLayoutBox>

        <MuiLayoutBox className="attendance-header-actions" component="div">

          <MuiButtonMigration
            className="outline-btn"
            onClick={refreshData}
          >
            <RefreshIcon />
            Refresh
          </MuiButtonMigration>

          {canCreate && (
            <MuiButtonMigration
              className="outline-btn"
              onClick={handleGenerateAttendance}
            >
              <AutorenewIcon />
              Generate Attendance
            </MuiButtonMigration>
          )}

          {canExport && (
            <MuiButtonMigration className="outline-btn" onClick={handleExport}>
              <FileDownloadIcon />
              Export Excel
            </MuiButtonMigration>
          )}

          {canCreate && (
            <MuiButtonMigration
              className="primary-btn"
              onClick={() => setAddOpen(true)}
            >
              <AddIcon />
              Add Attendance
            </MuiButtonMigration>
          )}

        </MuiLayoutBox>
      </MuiLayoutBox>

      {/* DASHBOARD */}

      <MuiLayoutBox className="attendance-summary-grid" component="div">

        <DashboardCard
          title="Present"
          value={filteredDashboard.present}
          subtitle="Employees Logs"
          color="#10B981"
          icon={<GroupsIcon />}
          onClick={() => setStatus((current) => current === "Present" ? "" : "Present")}
          selected={status === "Present"}
        />

        <DashboardCard
          title="Absent"
          value={filteredDashboard.absent}
          subtitle="Employees Absent"
          color="#EF4444"
          icon={<PersonOffIcon />}
          onClick={() => setStatus((current) => current === "Absent" ? "" : "Absent")}
          selected={status === "Absent"}
        />

        <DashboardCard
          title="Late"
          value={filteredDashboard.late}
          subtitle="Late Check-ins"
          color="#F59E0B"
          icon={<TimerIcon />}
          onClick={() => setStatus((current) => current === "Late" ? "" : "Late")}
          selected={status === "Late"}
        />

        <DashboardCard
          title="On Leave"
          value={filteredDashboard.leave}
          subtitle="Approved Leave"
          color="#8B5CF6"
          icon={<BeachAccessIcon />}
          onClick={() => setStatus((current) => current === "Leave" || current === "On Leave" ? "" : "Leave")}
          selected={status === "Leave" || status === "On Leave"}
        />

        <DashboardCard
          title="WFH"
          value={filteredDashboard.wfh}
          subtitle="Work From Home"
          color="#06B6D4"
          icon={<HomeWorkIcon />}
          onClick={() => setStatus((current) => current === "WFH" ? "" : "WFH")}
          selected={status === "WFH"}
        />

      </MuiLayoutBox>

      {/* FILTERS */}

      <MuiLayoutBox className="attendance-filter-card" component="div">
        <Grid container spacing={2} alignItems="center">

          <Grid size={{ xs: 12, md: 5 }}>
            <TextField
              className="attendance-search-field"
              fullWidth
              placeholder="Search by name, employee ID or department..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              slotProps={{ input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
                endAdornment: search ? <InputAdornment position="end"><IconButton aria-label="Clear search" size="small" onClick={() => setSearch("")}><CloseRoundedIcon fontSize="small" /></IconButton></InputAdornment> : null,
              } }}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 2 }}>
            <TextField
              select
              fullWidth
              value={shift}
              label="Shift"
              onChange={(e) => setShift(e.target.value)}
              slotProps={{ input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <AccessTimeIcon />
                  </InputAdornment>
                ),
              } }}
            >
              <MenuItem value="">All Shifts</MenuItem>

              <MenuItem value="Morning">
                Morning Shift
              </MenuItem>

              <MenuItem value="Evening">
                Evening Shift
              </MenuItem>

              <MenuItem value="Night">
                Night Shift
              </MenuItem>
            </TextField>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 2 }}>
            <TextField
              select
              fullWidth
              value={status}
              label="Status"
              onChange={(e) => setStatus(e.target.value)}
              slotProps={{ input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <TaskAltIcon />
                  </InputAdornment>
                ),
              } }}
            >
              <MenuItem value="">All Status</MenuItem>

              {statuses.map((item) => (
                <MenuItem key={item} value={item}>
                  {item}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 2 }}>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                label="Date"
                value={date ? dayjs(date) : null}
                onChange={(value) => setDate(value?.isValid() ? value.format("YYYY-MM-DD") : "")}
                format="DD-MM-YYYY"
                slotProps={{ textField: { fullWidth: true, size: "medium" } }}
              />
            </LocalizationProvider>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 1 }}>
            <Button
              fullWidth
              variant="contained"
              startIcon={<RefreshIcon />}
              onClick={resetFilters}
              sx={{
                height: 48,
                minWidth: 0,
                px: 1.5,
                borderRadius: 2.5,
                textTransform: "none",
                whiteSpace: "nowrap",
              }}
            >
              Reset
            </Button>
          </Grid>

        </Grid>
      </MuiLayoutBox>

      {/* TABLE */}

      <MuiLayoutBox className="attendance-table-card" component="div">

        <MuiLayoutBox className="table-header" component="div">

          <MuiLayoutBox className="table-header-left" component="div">

            <MuiText className="table-tag" component="span" variant="inherit">
              ATTENDANCE DIRECTORY
            </MuiText>

            <MuiText component="h3" variant="h6">Attendance Log List</MuiText>

            <MuiText component="p" variant="body1">
              View and manage daily employee attendance records.
            </MuiText>

          </MuiLayoutBox>

          <MuiLayoutBox className="table-header-right" component="div">

            <MuiLayoutBox className="record-count" component="div">
              <MuiText component="strong" variant="inherit">{filteredAttendance.length}</MuiText>

              <MuiText component="span" variant="inherit">Records</MuiText>
            </MuiLayoutBox>

          </MuiLayoutBox>

        </MuiLayoutBox>

        <AttendanceTable
          rows={filteredAttendance}
          loading={loading}

          onView={(row) => {
            if (!canView) return;

            setSelectedAttendance(row);

            setDetailsOpen(true);
          }}

          onEdit={(row) => {
            if (!canEdit) return;

            setSelectedAttendance(row);

            setEditOpen(true);
          }}

          onDelete={(row) => {
            if (!canDelete) return;

            setSelectedAttendance(row);

            setDeleteOpen(true);
          }}
        />

      </MuiLayoutBox>

      {/* DIALOGS */}

      {canCreate && (
        <AddAttendanceDialog
          open={addOpen}
          onClose={() => setAddOpen(false)}
          onSaved={refreshData}
        />
      )}

      <AttendanceDetailsDialog
        open={detailsOpen}
        attendance={selectedAttendance}
        onClose={() => setDetailsOpen(false)}
      />

      <Snackbar open={notice.open} autoHideDuration={4500} onClose={() => setNotice((current) => ({ ...current, open: false }))} anchorOrigin={{ vertical: "bottom", horizontal: "right" }}>
        <Alert severity={notice.severity} variant="filled" onClose={() => setNotice((current) => ({ ...current, open: false }))}>{notice.message}</Alert>
      </Snackbar>

      {/* EDIT */}

      {canEdit && (
        <EditAttendanceDialog
          open={editOpen}
          attendance={selectedAttendance}
          onClose={() => {
            setEditOpen(false);
            setSelectedAttendance(null);
          }}
          onUpdated={() => {
            setEditOpen(false);
            setSelectedAttendance(null);
            refreshData();
          }}
        />
      )}

      {canDelete && (
        <DeleteAttendanceDialog
          open={deleteOpen}
          attendance={selectedAttendance}
          onClose={() => {
            setDeleteOpen(false);

            setSelectedAttendance(null);
          }}
          onDelete={handleDelete}
        />
      )}

    </MuiLayoutBox>
  );
}
