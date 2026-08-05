import "./AttendanceTable.css";

import { Avatar, Checkbox, Chip, IconButton, Tooltip } from "@mui/material";

import { Visibility, Edit, Delete } from "@mui/icons-material";

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

  return (
    <table className="attendance-table">
      <thead>
        <tr>
          <th>
            <Checkbox />
          </th>

          <th>Employee ID</th>

          <th>Employee</th>

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

            {/* Azure Employee ID */}

            <td>{row.azureEmployeeId ? row.azureEmployeeId : "-"}</td>

            {/* Employee Details */}

            <td>
              <div className="employee-cell">
                <Avatar className="employee-avatar">
                  {row.employeeName ? row.employeeName.charAt(0) : "?"}
                </Avatar>

                <div>
                  <strong>{row.employeeName ? row.employeeName : "-"}</strong>

                  <span>{row.employeeCode ? row.employeeCode : "-"}</span>
                </div>
              </div>
            </td>

            <td>{row.shift ? row.shift : "-"}</td>

            <td>{row.checkIn ? row.checkIn : "-"}</td>

            <td>{row.checkOut ? row.checkOut : "-"}</td>

            <td>{row.totalHours ? row.totalHours : "-"}</td>

            <td>
              <Chip
                label={row.status ? row.status : "-"}
                className={`status-chip ${
                  row.status ? row.status.toLowerCase() : ""
                }`}
              />
            </td>

            <td>
              <div className="attendance-actions">
                <Tooltip title="View">
                  <IconButton className="view-btn" onClick={() => onView(row)}>
                    <Visibility fontSize="small" />
                  </IconButton>
                </Tooltip>

                <Tooltip title="Edit">
                  <IconButton className="edit-btn" onClick={() => onEdit(row)}>
                    <Edit fontSize="small" />
                  </IconButton>
                </Tooltip>

                <Tooltip title="Delete">
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
