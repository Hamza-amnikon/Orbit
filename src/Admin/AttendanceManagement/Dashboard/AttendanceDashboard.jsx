import "./AttendanceDashboard.css";

import DashboardCard from "./DashboardCard";

import AttendanceChart from "../components/AttendanceChart";
import AttendanceTable from "../components/AttendanceTable";
import CalendarWidget from "../components/CalendarWidget";
import QuickActions from "../components/QuickActions";

import GroupsIcon from "@mui/icons-material/Groups";
import PersonOffIcon from "@mui/icons-material/PersonOff";
import TimerIcon from "@mui/icons-material/Timer";
import BeachAccessIcon from "@mui/icons-material/BeachAccess";
import HomeWorkIcon from "@mui/icons-material/HomeWork";

const cards = [
  {
    title: "Present",
    value: 128,
    subtitle: "Employees Present",
    color: "#10B981",
    icon: <GroupsIcon />,
  },
  {
    title: "Absent",
    value: 8,
    subtitle: "Employees Absent",
    color: "#EF4444",
    icon: <PersonOffIcon />,
  },
  {
    title: "Late",
    value: 12,
    subtitle: "Late Check-ins",
    color: "#F59E0B",
    icon: <TimerIcon />,
  },
  {
    title: "On Leave",
    value: 5,
    subtitle: "Approved Leave",
    color: "#8B5CF6",
    icon: <BeachAccessIcon />,
  },
  {
    title: "WFH",
    value: 9,
    subtitle: "Work From Home",
    color: "#06B6D4",
    icon: <HomeWorkIcon />,
  },
];

export default function AttendanceDashboard() {
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

          <h4>05 Aug 2026</h4>
        </div>
      </div>

      {/* Summary Cards */}

      <div className="dashboard-card-grid">
        {cards.map((card, index) => (
          <DashboardCard key={index} {...card} />
        ))}
      </div>

      {/* Chart Section */}

      <div className="dashboard-row">
        <div className="dashboard-panel">
          <h3>Attendance Trend</h3>

          <AttendanceChart />
        </div>

        <div className="dashboard-panel">
          <h3>Attendance Summary</h3>

          <div className="summary-box">
            <h2>95%</h2>

            <p>Average Attendance</p>
          </div>
        </div>
      </div>

      {/* Tables */}

      {/* Today's Attendance */}

      <div className="dashboard-panel attendance-table-panel">
        <h3>Today's Attendance</h3>

        <AttendanceTable />
      </div>

      <div className="dashboard-panel attendance-table-panel">

    <h3>Upcoming Holidays</h3>

    <CalendarWidget />

</div>

<div className="dashboard-panel attendance-table-panel">

    <h3>Quick Actions</h3>

    <QuickActions />

</div>
    </div>
  );
}
