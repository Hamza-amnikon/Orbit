import "./AttendanceLogs.css";

import { useState, useEffect } from "react";
import {
  Box,
  Grid,
  TextField,
  MenuItem,
  Button,
  InputAdornment,
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

export default function AttendanceLogs() {
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

  useEffect(() => {
    loadAttendance();

    loadDashboard();
  }, []);

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
    try {
      const result = await AttendanceService.generateAttendance();

      alert(
        `Attendance Generated Successfully

Generated : ${result.generated}
Skipped : ${result.skipped}
Weekly Off : ${result.weeklyOff}`,
      );

      refreshData();
    } catch (error) {
      console.error(error);

      alert("Failed to generate attendance.");
    }
  };

  const resetFilters = () => {
    setSearch("");
    setShift("");
    setStatus("");
    setDate("");
  };
  const filteredAttendance = attendanceList.filter((item) => {
    const keyword = search.toLowerCase().trim();

    const searchMatch =
      keyword === "" ||
      item.employeeName?.toLowerCase().includes(keyword) ||
      item.employeeCode?.toLowerCase().includes(keyword) ||
      item.department?.toLowerCase().includes(keyword) ||
      item.designation?.toLowerCase().includes(keyword);

    const shiftMatch = shift === "" || item.shift === shift;

    const statusMatch = status === "" || item.status === status;
    const dateMatch = !date || item.attendanceDate?.split("T")[0] === date;
    return searchMatch && shiftMatch && statusMatch && dateMatch;
  });


const filteredDashboard = {
  present: filteredAttendance.filter(x => x.status === "Present").length,

  absent: filteredAttendance.filter(x => x.status === "Absent").length,

  late: filteredAttendance.filter(x => x.status === "Late").length,

  leave: filteredAttendance.filter(
    x =>
      x.status === "Leave" ||
      x.status === "On Leave"
  ).length,

  wfh: filteredAttendance.filter(x => x.status === "WFH").length,
};


  const handleDelete = async () => {
    try {
      await AttendanceService.delete(selectedAttendance.attendanceId);

      setDeleteOpen(false);

      setSelectedAttendance(null);

      refreshData();
    } catch (error) {
      console.error("Delete Error", error);
    }
  };
  const shifts = [...new Set(attendanceList.map((x) => x.shift))].filter(
    Boolean,
  );

  const statuses = [...new Set(attendanceList.map((x) => x.status))];

  return (
    <div className="attendance-logs">
      {/* HEADER */}

      <div className="attendance-header-card">
        <div>
          <h2>Attendance Logs</h2>

          <p>View, search and manage employee attendance records.</p>
        </div>

        <div className="attendance-header-actions">
          <button className="outline-btn" onClick={refreshData}>
            <RefreshIcon />
            Refresh
          </button>

          <button className="outline-btn" onClick={handleGenerateAttendance}>
            <AutorenewIcon />
            Generate Attendance
          </button>

          <button className="outline-btn">
            <FileDownloadIcon />
            Export
          </button>

          <button className="primary-btn" onClick={() => setAddOpen(true)}>
            <AddIcon />
            Add Attendance
          </button>
        </div>
      </div>

      {/* DASHBOARD */}

      <div className="attendance-summary-grid">
        <DashboardCard
          title="Present"
          value={filteredDashboard.present}
          subtitle="Employees Present"
          color="#10B981"
          icon={<GroupsIcon />}
        />

        <DashboardCard
          title="Absent"
          value={filteredDashboard.absent}
          subtitle="Employees Absent"
          color="#EF4444"
          icon={<PersonOffIcon />}
        />

        <DashboardCard
          title="Late"
          value={filteredDashboard.late}
          subtitle="Late Check-ins"
          color="#F59E0B"
          icon={<TimerIcon />}
        />

        <DashboardCard
          title="On Leave"
          value={filteredDashboard.leave}
          subtitle="Approved Leave"
          color="#8B5CF6"
          icon={<BeachAccessIcon />}
        />

        <DashboardCard
          title="WFH"
          value={filteredDashboard.wfh}
          subtitle="Work From Home"
          color="#06B6D4"
          icon={<HomeWorkIcon />}
        />
      </div>

      {/* FILTERS */}

      <div className="attendance-filter-card">
        <Grid container spacing={2} alignItems="center">
          <Grid size={{ xs: 12, md: 5 }}>
            <TextField
              fullWidth
              placeholder="Search by name, employee ID or department..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 2 }}>
            <TextField
              select
              fullWidth
              value={shift}
              label="Shift"
              onChange={(e) => setShift(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <AccessTimeIcon />
                  </InputAdornment>
                ),
              }}
            >
              <MenuItem value="">All Shifts</MenuItem>
              <MenuItem value="Morning">Morning Shift</MenuItem>
              <MenuItem value="General">General Shift</MenuItem>
              <MenuItem value="Evening">Evening Shift</MenuItem>
              <MenuItem value="Night">Night Shift</MenuItem>
            </TextField>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 2 }}>
            <TextField
              select
              fullWidth
              value={status}
              label="Status"
              onChange={(e) => setStatus(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <TaskAltIcon />
                  </InputAdornment>
                ),
              }}
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
            <TextField
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 1 }}>
            <Button
              fullWidth
              variant="contained"
              startIcon={<RefreshIcon />}
              onClick={resetFilters}
              sx={{
                height: 56,
                borderRadius: 3,
                textTransform: "none",
              }}
            >
              Reset
            </Button>
          </Grid>
        </Grid>
      </div>

      {/* TABLE */}

      <div className="attendance-table-card">
        <div className="table-header">
          <div className="table-header-left">
            <span className="table-tag">ATTENDANCE DIRECTORY</span>

            <h3>Attendance Log List</h3>

            <p>View and manage daily employee attendance records.</p>
          </div>

          <div className="table-header-right">
            <div className="record-count">
              <strong>{filteredAttendance.length}</strong>

              <span>Records</span>
            </div>

            <button className="table-btn">Print</button>

            <button className="table-btn">Export CSV</button>
          </div>
        </div>

        <AttendanceTable
          rows={filteredAttendance}
          loading={loading}
          onView={(row) => {
            setSelectedAttendance(row);

            setDetailsOpen(true);
          }}
          onEdit={(row) => {
            setSelectedAttendance(row);

            setEditOpen(true);
          }}
          onDelete={(row) => {
            setSelectedAttendance(row);

            setDeleteOpen(true);
          }}
        />
      </div>

      {/* DIALOGS */}

      <AddAttendanceDialog
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onSaved={refreshData}
      />

      <AttendanceDetailsDialog
        open={detailsOpen}
        attendance={selectedAttendance}
        onClose={() => setDetailsOpen(false)}
      />
      {/* EDIT */}

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

      <DeleteAttendanceDialog
        open={deleteOpen}
        attendance={selectedAttendance}
        onClose={() => {
          setDeleteOpen(false);

          setSelectedAttendance(null);
        }}
        onDelete={handleDelete}
      />
    </div>
  );
}
