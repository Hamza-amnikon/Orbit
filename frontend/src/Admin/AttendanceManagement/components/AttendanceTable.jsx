import { MuiTableBodyMigration, MuiTableCellMigration, MuiTableHeadMigration, MuiTableMigration, MuiTableRowMigration } from "../../../components/ui/MuiCompat.jsx";
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

import { useLocation } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import { Box as MuiLayoutBox, Typography as MuiText } from "@mui/material";

export default function AttendanceTable({
  rows = [],
  loading,
  onView,
  onEdit,
  onDelete,
}) {
  const location = useLocation();
  const { hasPermission } = useAuth();

  const permissionRoute = location.pathname;

  const canView = hasPermission(permissionRoute, "view");
  const canEdit = hasPermission(permissionRoute, "edit");
  const canDelete = hasPermission(permissionRoute, "delete");

  if (loading) {
    return (
      <MuiLayoutBox
        className="attendance-table-state attendance-table-loading"
        style={{
          padding: "30px",
          textAlign: "center",
        }}
       component="div">
        Loading attendance records...
      </MuiLayoutBox>
    );
  }

  if (!rows.length) {
    return (
      <MuiLayoutBox
        className="attendance-table-state attendance-table-empty"
        style={{
          padding: "30px",
          textAlign: "center",
        }}
       component="div">
        No attendance records found.
      </MuiLayoutBox>
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
    <MuiLayoutBox className="attendance-table-scroll" component="div">
    <MuiTableMigration className="attendance-table">
      <MuiTableHeadMigration>
        <MuiTableRowMigration>
          <MuiTableCellMigration>
            <Checkbox />
          </MuiTableCellMigration>

          <MuiTableCellMigration>Employee ID</MuiTableCellMigration>

          <MuiTableCellMigration>Employee</MuiTableCellMigration>

          <MuiTableCellMigration>Date</MuiTableCellMigration>

          <MuiTableCellMigration>Shift</MuiTableCellMigration>

          <MuiTableCellMigration>Check In</MuiTableCellMigration>

          <MuiTableCellMigration>Check Out</MuiTableCellMigration>

          <MuiTableCellMigration>Total Hours</MuiTableCellMigration>

          <MuiTableCellMigration>Status</MuiTableCellMigration>

          <MuiTableCellMigration>Action</MuiTableCellMigration>
        </MuiTableRowMigration>
      </MuiTableHeadMigration>

      <MuiTableBodyMigration>
        {rows.map((row) => (
          <MuiTableRowMigration key={row.attendanceId}>
            <MuiTableCellMigration>
              <Checkbox />
            </MuiTableCellMigration>

            <MuiTableCellMigration>{row.azureEmployeeId || "-"}</MuiTableCellMigration>

            <MuiTableCellMigration>
              <MuiLayoutBox className="employee-cell" component="div">
                <Avatar className="employee-avatar">
                  {row.employeeName
                    ? row.employeeName.charAt(0).toUpperCase()
                    : "?"}
                </Avatar>

                <MuiLayoutBox component="div">
                  <MuiText component="strong" variant="inherit">{row.employeeName || "-"}</MuiText>

                  <MuiText component="span" variant="inherit">{row.azureEmployeeId || "-"}</MuiText>
                </MuiLayoutBox>
              </MuiLayoutBox>
            </MuiTableCellMigration>

            <MuiTableCellMigration>{formatDate(row.attendanceDate)}</MuiTableCellMigration>

            <MuiTableCellMigration>{row.shift || "-"}</MuiTableCellMigration>

            <MuiTableCellMigration>{formatTime(row.checkIn)}</MuiTableCellMigration>

            <MuiTableCellMigration>{formatTime(row.checkOut)}</MuiTableCellMigration>

            <MuiTableCellMigration>{row.totalHours || "-"}</MuiTableCellMigration>

            <MuiTableCellMigration>
              <Chip
                label={row.status || "-"}
                className={`status-chip ${String(row.status || "").toLowerCase().replace(/\s+/g, "-")}`}
                color="default"
                size="small"
              />
            </MuiTableCellMigration>

            <MuiTableCellMigration>
              <MuiLayoutBox className="attendance-actions" component="div">

                {canView && (
                  <Tooltip title="View Attendance">
                    <IconButton
                      className="view-btn"
                      onClick={() => onView(row)}
                    >
                      <Visibility fontSize="small" />
                    </IconButton>
                  </Tooltip>
                )}

                {canEdit && (
                  <Tooltip title="Edit Attendance">
                    <IconButton
                      className="edit-btn"
                      onClick={() => onEdit(row)}
                    >
                      <Edit fontSize="small" />
                    </IconButton>
                  </Tooltip>
                )}

                {canDelete && (
                  <Tooltip title="Delete Attendance">
                    <IconButton
                      className="delete-btn"
                      onClick={() => onDelete(row)}
                    >
                      <Delete fontSize="small" />
                    </IconButton>
                  </Tooltip>
                )}

              </MuiLayoutBox>
            </MuiTableCellMigration>
          </MuiTableRowMigration>
        ))}
      </MuiTableBodyMigration>
    </MuiTableMigration>
    </MuiLayoutBox>
  );
}
