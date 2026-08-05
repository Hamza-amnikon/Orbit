import "./AttendanceLogs.css";

import { useState, useEffect } from "react";

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

import RefreshIcon from "@mui/icons-material/Refresh";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import AddIcon from "@mui/icons-material/Add";

export default function AttendanceLogs() {
  const [search, setSearch] = useState("");

  const [department, setDepartment] = useState("");

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

  const filteredAttendance = attendanceList.filter((item) => {
    const searchMatch =
      item.employeeName?.toLowerCase().includes(search.toLowerCase()) ||
      item.employeeCode?.toLowerCase().includes(search.toLowerCase());

    const departmentMatch = department === "" || item.department === department;

    const statusMatch = status === "" || item.status === status;

    const dateMatch = date === "" || item.attendanceDate?.startsWith(date);

    return searchMatch && departmentMatch && statusMatch && dateMatch;
  });

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

      {/* FILTERS */}

      <div className="attendance-filter-card">
        <input
          type="text"
          placeholder="Search employee or Employee ID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          value={department}
          onChange={(e) => setDepartment(e.target.value)}
        >
          <option value="">All Departments</option>

          <option value="IT">IT</option>

          <option value="HR">HR</option>

          <option value="Finance">Finance</option>

          <option value="Admin">Admin</option>
        </select>

        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All Status</option>

          <option value="Present">Present</option>

          <option value="Late">Late</option>

          <option value="Absent">Absent</option>

          <option value="Leave">Leave</option>

          <option value="WFH">WFH</option>
        </select>

        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
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
