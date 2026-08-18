import "./AttendanceDashboard.css";

import { useEffect, useState } from "react";

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

export default function AttendanceDashboard() {
  const [dashboard, setDashboard] = useState({
    present: 0,
    absent: 0,
    late: 0,
    leave: 0,
    wfh: 0,
  });

  const [todayAttendance, setTodayAttendance] = useState([]);

  const [loading, setLoading] = useState(false);

  const [selectedAttendance, setSelectedAttendance] = useState(null);

  const [detailsOpen, setDetailsOpen] = useState(false);

  const [editOpen, setEditOpen] = useState(false);

  const [deleteOpen, setDeleteOpen] = useState(false);

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
    try {
      await AttendanceService.delete(selectedAttendance.attendanceId);

      setDeleteOpen(false);

      setSelectedAttendance(null);

      refreshData();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="attendance-dashboard">

      {/* Header */}

      <div className="attendance-dashboard-header">
        <div>
          <h2>Attendance Dashboard</h2>
          <p>Overview of today's attendance across the organization.</p>
        </div>

        <div className="dashboard-date">
          <span>Today</span>
          <h4>{new Date().toLocaleDateString()}</h4>
        </div>
      </div>

      {/* Dashboard Cards */}

      <div className="dashboard-card-grid">

        <DashboardCard
          title="Present"
          value={dashboard.present}
          subtitle="Employees Present"
          color="#10B981"
          icon={<GroupsIcon />}
        />

        <DashboardCard
          title="Absent"
          value={dashboard.absent}
          subtitle="Employees Absent"
          color="#EF4444"
          icon={<PersonOffIcon />}
        />

        <DashboardCard
          title="Late"
          value={dashboard.late}
          subtitle="Late Check-ins"
          color="#F59E0B"
          icon={<TimerIcon />}
        />

        <DashboardCard
          title="On Leave"
          value={dashboard.leave}
          subtitle="Approved Leave"
          color="#8B5CF6"
          icon={<BeachAccessIcon />}
        />

        <DashboardCard
          title="WFH"
          value={dashboard.wfh}
          subtitle="Work From Home"
          color="#06B6D4"
          icon={<HomeWorkIcon />}
        />

      </div>

      {/* Today's Attendance */}

      <div className="dashboard-panel attendance-table-panel">

        <h3>Today's Attendance</h3>

        <AttendanceTable
          rows={todayAttendance}
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

      {/* Upcoming Holidays */}

      <div className="dashboard-panel attendance-table-panel">
        <h3>Upcoming Holidays</h3>
        <CalendarWidget />
      </div>

      {/* Quick Actions */}

      <div className="dashboard-panel attendance-table-panel">
        <h3>Quick Actions</h3>
        <QuickActions />
      </div>

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

    </div>
  );
}