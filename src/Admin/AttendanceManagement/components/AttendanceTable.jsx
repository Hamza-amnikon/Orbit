import "./AttendanceTable.css";

import {
  Avatar,
  Checkbox,
  Chip,
  IconButton,
  Tooltip,
} from "@mui/material";

import {
  Visibility,
  Edit,
  Delete,
} from "@mui/icons-material";

export default function AttendanceTable({
  rows = [],
  loading,
  onView,
  onEdit,
  onDelete,
}) {
  if (loading) {
    return (
      <div
        style={{
          padding: "30px",
          textAlign: "center",
        }}
      >
        Loading attendance records...
      </div>
    );
  }

  if (!rows.length) {
    return (
      <div
        style={{
          padding: "30px",
          textAlign: "center",
        }}
      >
        No attendance records found.
      </div>
    );
  }

  const formatDate = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleDateString("en-GB");
  };

  const formatTime = (time) => {
    if (!time) return "-";

    return time.substring(0, 5);
  };

  return (
    <table className="attendance-table">
      <thead>
        <tr>
          <th>
            <Checkbox />
          </th>

          <th>Employee ID</th>

          <th>Employee</th>

          <th>Date</th>

          <th>Shift</th>

          <th>Check In</th>

          <th>Check Out</th>

          <th>Total Hours</th>

          <th>Status</th>

          <th>Action</th>
        </tr>
      </thead>

      <tbody>
        {rows.map((row) => (
          <tr key={row.attendanceId}>
            <td>
              <Checkbox />
            </td>

            <td>{row.azureEmployeeId || "-"}</td>

            <td>
              <div className="employee-cell">
                <Avatar className="employee-avatar">
                  {row.employeeName
                    ? row.employeeName.charAt(0).toUpperCase()
                    : "?"}
                </Avatar>

                <div>
                  <strong>{row.employeeName || "-"}</strong>

                  <span>{row.employeeCode || "-"}</span>
                </div>
              </div>
            </td>

            <td>{formatDate(row.attendanceDate)}</td>

            <td>{row.shift || "-"}</td>

            <td>{formatTime(row.checkIn)}</td>

            <td>{formatTime(row.checkOut)}</td>

            <td>{row.totalHours || "-"}</td>

            <td>
              <Chip
                label={row.status || "-"}
                color={
                  row.status === "Present"
                    ? "success"
                    : row.status === "Late"
                    ? "warning"
                    : row.status === "Absent"
                    ? "error"
                    : row.status === "Leave"
                    ? "secondary"
                    : row.status === "WFH"
                    ? "info"
                    : "default"
                }
                size="small"
              />
            </td>

            <td>
              <div className="attendance-actions">
                <Tooltip title="View Attendance">
                  <IconButton
                    className="view-btn"
                    onClick={() => onView(row)}
                  >
                    <Visibility fontSize="small" />
                  </IconButton>
                </Tooltip>

                <Tooltip title="Edit Attendance">
                  <IconButton
                    className="edit-btn"
                    onClick={() => onEdit(row)}
                  >
                    <Edit fontSize="small" />
                  </IconButton>
                </Tooltip>

                <Tooltip title="Delete Attendance">
                  <IconButton
                    className="delete-btn"
                    onClick={() => onDelete(row)}
                  >
                    <Delete fontSize="small" />
                  </IconButton>
                </Tooltip>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}