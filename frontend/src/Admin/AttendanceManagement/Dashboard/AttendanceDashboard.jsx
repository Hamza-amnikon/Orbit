import "./AttendanceDashboard.css";

import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import DashboardCard from "./DashboardCard";

import AttendanceTable from "../components/AttendanceTable";
import CalendarWidget from "../components/CalendarWidget";
import QuickActions from "../components/QuickActions";

import AttendanceService from "../services/AttendanceService";

import GroupsIcon from "@mui/icons-material/Groups";
import PersonOffIcon from "@mui/icons-material/PersonOff";
import TimerIcon from "@mui/icons-material/Timer";
import BeachAccessIcon from "@mui/icons-material/BeachAccess";
import HomeWorkIcon from "@mui/icons-material/HomeWork";

import AttendanceDetailsDialog from "../AttendanceLogs/AttendanceDetailsDialog";
import EditAttendanceDialog from "../AttendanceLogs/EditAttendanceDialog";
import DeleteAttendanceDialog from "../AttendanceLogs/DeleteAttendanceDialog";

import { useAuth } from "../../../context/AuthContext";
import { Alert, Box as MuiLayoutBox, Typography as MuiText, Button, IconButton, Snackbar } from "@mui/material";
import { ArrowBackRounded, RefreshRounded, FileDownloadOutlined, CalendarMonthRounded } from "@mui/icons-material";
import { exportRowsToExcel } from "../../../utils/exportExcel";

export default function AttendanceDashboard() {
  const navigate = useNavigate();
  const { hasPermission } = useAuth();

  const permissionRoute = "/attendance/dashboard";

  const canView = hasPermission(permissionRoute, "view");
  const canEdit = hasPermission(permissionRoute, "edit");
  const canDelete = hasPermission(permissionRoute, "delete");

  const [dashboard, setDashboard] = useState({
    present: 0,
    absent: 0,
    late: 0,
    leave: 0,
    wfh: 0,
  });

  const [todayAttendance, setTodayAttendance] = useState([]);

  const [loading, setLoading] = useState(false);
  const [summaryFilter, setSummaryFilter] = useState("");
  const [notice, setNotice] = useState({ open: false, message: "", severity: "success" });

  const [selectedAttendance, setSelectedAttendance] = useState(null);

  const [detailsOpen, setDetailsOpen] = useState(false);

  const [editOpen, setEditOpen] = useState(false);

  const [deleteOpen, setDeleteOpen] = useState(false);

  const displayedAttendance = useMemo(() => !summaryFilter ? todayAttendance : todayAttendance.filter((item) => {
    if (summaryFilter === "Leave") return item.status === "Leave" || item.status === "On Leave";
    return item.status === summaryFilter;
  }), [todayAttendance, summaryFilter]);

  const handleExport = async () => {
    try {
      await exportRowsToExcel(displayedAttendance, [
        ["Employee ID", (row) => row.azureEmployeeId || row.employeeCode || ""], ["Employee", "employeeName"], ["Date", (row) => row.attendanceDate ? new Date(row.attendanceDate).toLocaleDateString("en-GB") : ""],
        ["Shift", "shift"], ["Check In", "checkIn"], ["Check Out", "checkOut"], ["Total Hours", "totalHours"], ["Status", "status"],
      ], "Todays-Attendance.xlsx", "Attendance");
      setNotice({ open: true, severity: "success", message: `Exported ${displayedAttendance.length} attendance records.` });
    } catch (error) {
      console.error("Attendance export error", error);
      setNotice({ open: true, severity: "error", message: "Could not export today's attendance." });
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  const refreshData = () => {
    loadDashboard();
  };

  const loadDashboard = async () => {
    try {
      const data = await AttendanceService.getToday();

      setTodayAttendance(data);

      setDashboard({
        present: data.filter(x => x.status === "Present").length,
        absent: data.filter(x => x.status === "Absent").length,
        late: data.filter(x => x.status === "Late").length,
        leave: data.filter(x => x.status === "Leave").length,
        wfh: data.filter(x => x.status === "WFH").length,
      });
    } catch (error) {
      console.error(error);
    }
  };

  const loadTodayAttendance = async () => {
    try {
      setLoading(true);

      const data = await AttendanceService.getToday();

      setTodayAttendance(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!canDelete) return;

    try {
      await AttendanceService.delete(selectedAttendance.attendanceId);

      setDeleteOpen(false);

      setSelectedAttendance(null);

      refreshData();
    } catch (error) {
      console.error(error);
    }
  };

  if (!canView) {
    return null;
  }

  return (
    <MuiLayoutBox className="attendance-dashboard" component="div">

      {/* Header */}

      <MuiLayoutBox className="attendance-dashboard-header" component="div">
        <MuiLayoutBox className="attendance-header-leading" component="div">
          <IconButton aria-label="Back to Attendance" onClick={() => navigate("/attendance")} className="attendance-back-button"><ArrowBackRounded /></IconButton>
          <MuiLayoutBox component="div">
          <MuiText component="h2" variant="h5">Attendance Dashboard</MuiText>
          <MuiText component="p" variant="body1">Overview of today's attendance across the organization.</MuiText>
          </MuiLayoutBox>
        </MuiLayoutBox>

        <MuiLayoutBox className="attendance-dashboard-actions" component="div">
          <Button variant="outlined" startIcon={<RefreshRounded />} onClick={refreshData}>Refresh</Button>
          {hasPermission(permissionRoute, "export") && <Button variant="outlined" startIcon={<FileDownloadOutlined />} onClick={handleExport}>Export Excel</Button>}
          <MuiLayoutBox className="dashboard-date-card" component="div" aria-label={`Today, ${new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}`}>
            <CalendarMonthRounded />
            <MuiLayoutBox className="dashboard-date-copy" component="div">
              <MuiText component="span" variant="inherit">TODAY’S</MuiText>
              <MuiText component="strong" variant="inherit">{new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</MuiText>
            </MuiLayoutBox>
          </MuiLayoutBox>
        </MuiLayoutBox>
      </MuiLayoutBox>

      {/* Dashboard Cards */}

      <MuiLayoutBox className="dashboard-card-grid" component="div">

        <DashboardCard
          title="Present"
          value={dashboard.present}
          subtitle="Employees Present"
          color="#10B981"
          icon={<GroupsIcon />}
          onClick={() => setSummaryFilter((current) => current === "Present" ? "" : "Present")}
          selected={summaryFilter === "Present"}
        />

        <DashboardCard
          title="Absent"
          value={dashboard.absent}
          subtitle="Employees Absent"
          color="#EF4444"
          icon={<PersonOffIcon />}
          onClick={() => setSummaryFilter((current) => current === "Absent" ? "" : "Absent")}
          selected={summaryFilter === "Absent"}
        />

        <DashboardCard
          title="Late"
          value={dashboard.late}
          subtitle="Late Check-ins"
          color="#F59E0B"
          icon={<TimerIcon />}
          onClick={() => setSummaryFilter((current) => current === "Late" ? "" : "Late")}
          selected={summaryFilter === "Late"}
        />

        <DashboardCard
          title="On Leave"
          value={dashboard.leave}
          subtitle="Approved Leave"
          color="#8B5CF6"
          icon={<BeachAccessIcon />}
          onClick={() => setSummaryFilter((current) => current === "Leave" ? "" : "Leave")}
          selected={summaryFilter === "Leave"}
        />

        <DashboardCard
          title="WFH"
          value={dashboard.wfh}
          subtitle="Work From Home"
          color="#06B6D4"
          icon={<HomeWorkIcon />}
          onClick={() => setSummaryFilter((current) => current === "WFH" ? "" : "WFH")}
          selected={summaryFilter === "WFH"}
        />

      </MuiLayoutBox>

      {/* Today's Attendance */}

      <MuiLayoutBox className="dashboard-panel attendance-table-panel" component="div">

        <MuiText component="h3" variant="h6">Today's Attendance</MuiText>

        <AttendanceTable
          rows={displayedAttendance}
          loading={loading}
          onView={(row) => {
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

      {/* Upcoming Holidays */}

      <MuiLayoutBox className="dashboard-panel attendance-table-panel" component="div">
        <MuiText component="h3" variant="h6">Upcoming Holidays</MuiText>
        <CalendarWidget />
      </MuiLayoutBox>

      {/* Quick Actions */}

      <MuiLayoutBox className="dashboard-panel attendance-table-panel" component="div">
        <MuiText component="h3" variant="h6">Quick Actions</MuiText>
        <QuickActions />
      </MuiLayoutBox>

      {/* Dialogs */}

      <AttendanceDetailsDialog
        open={detailsOpen}
        attendance={selectedAttendance}
        onClose={() => {
          setDetailsOpen(false);
          setSelectedAttendance(null);
        }}
      />

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

      <Snackbar open={notice.open} autoHideDuration={4500} onClose={() => setNotice((current) => ({ ...current, open: false }))} anchorOrigin={{ vertical: "bottom", horizontal: "right" }}>
        <Alert severity={notice.severity} variant="filled" onClose={() => setNotice((current) => ({ ...current, open: false }))}>{notice.message}</Alert>
      </Snackbar>

    </MuiLayoutBox>
  );
}
