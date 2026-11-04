import { MuiButtonMigration, MuiTableBodyMigration, MuiTableCellMigration, MuiTableHeadMigration, MuiTableMigration, MuiTableRowMigration } from "../../../components/ui/MuiCompat.jsx";
import "./ShiftManagement.css";

import VisibilityIcon from "@mui/icons-material/Visibility";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import { Box as MuiLayoutBox, Typography as MuiText } from "@mui/material";

const today = () => {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
};

const assignmentPeriod = (row, currentDate) => {
  if (row.toDate < currentDate) return "Previous";
  if (row.fromDate > currentDate) return "Upcoming";
  return "Current";
};

export default function ShiftTable({
  rows = [],
  onView,
  onEdit,
  onAssignNext,
  onDelete,
}) {
  const currentDate = today();
  return (
    <MuiLayoutBox className="shift-table-wrapper" component="div">
      <MuiTableMigration className="shift-table">
        <MuiTableHeadMigration>
          <MuiTableRowMigration>
            <MuiTableCellMigration>Employee</MuiTableCellMigration>

            <MuiTableCellMigration>Employee ID</MuiTableCellMigration>

            <MuiTableCellMigration>Department</MuiTableCellMigration>

            <MuiTableCellMigration>Designation</MuiTableCellMigration>

            <MuiTableCellMigration>Shift</MuiTableCellMigration>

            <MuiTableCellMigration>From Date</MuiTableCellMigration>

            <MuiTableCellMigration>To Date</MuiTableCellMigration>

            <MuiTableCellMigration>Period</MuiTableCellMigration>

            <MuiTableCellMigration>Weekly Off</MuiTableCellMigration>

            <MuiTableCellMigration>Status</MuiTableCellMigration>

            <MuiTableCellMigration>Actions</MuiTableCellMigration>
          </MuiTableRowMigration>
        </MuiTableHeadMigration>

        <MuiTableBodyMigration>
          {rows.length === 0 ? (
            <MuiTableRowMigration>
              <MuiTableCellMigration colSpan={11} className="no-data">
                No shift assignments found.
              </MuiTableCellMigration>
            </MuiTableRowMigration>
          ) : (
            rows.map((row) => (
              <MuiTableRowMigration key={row.shiftId}>
                <MuiTableCellMigration>
                  <MuiLayoutBox className="employee-cell" component="div">
                    <MuiLayoutBox className="employee-avatar" component="div">
                      {row.employeeName?.charAt(0)}
                    </MuiLayoutBox>

                    <MuiLayoutBox component="div">
                      <MuiText component="strong" variant="inherit">{row.employeeName}</MuiText>
                    </MuiLayoutBox>
                  </MuiLayoutBox>
                </MuiTableCellMigration>

                <MuiTableCellMigration>{row.azureEmployeeId || row.AzureEmployeeId || "-"}</MuiTableCellMigration>

                <MuiTableCellMigration>{row.department}</MuiTableCellMigration>

                <MuiTableCellMigration>{row.designation}</MuiTableCellMigration>

                <MuiTableCellMigration>
                  <MuiText className="shift-chip" component="span" variant="inherit">
                    {row.shiftName}
                  </MuiText>
                </MuiTableCellMigration>

                <MuiTableCellMigration>{row.fromDate}</MuiTableCellMigration>

                <MuiTableCellMigration>{row.toDate}</MuiTableCellMigration>

                <MuiTableCellMigration>
                  <MuiText className={`period-chip ${assignmentPeriod(row, currentDate).toLowerCase()}`} component="span" variant="inherit">
                    {assignmentPeriod(row, currentDate)}
                  </MuiText>
                </MuiTableCellMigration>

                <MuiTableCellMigration>
                  {row.weeklyOff1}
                  {row.weeklyOff2 ? `, ${row.weeklyOff2}` : ""}
                </MuiTableCellMigration>

                <MuiTableCellMigration>
                  <MuiText
                    className={`status-chip ${String(row.status || "").toLowerCase()}`}
                   component="span" variant="inherit">
                    {row.status}
                  </MuiText>
                </MuiTableCellMigration>

                <MuiTableCellMigration>
                  <MuiLayoutBox className="action-buttons" component="div">
                    {onAssignNext && (
                      <MuiButtonMigration
                        className="assign-next-btn"
                        aria-label={`Assign next period for ${row.employeeName || "employee"}`}
                        title="Assign next period"
                        onClick={() => onAssignNext(row)}
                      >
                        <AddIcon fontSize="small" />
                      </MuiButtonMigration>
                    )}
                    <MuiButtonMigration
                      className="view-btn"
                      aria-label={`View shift for ${row.employeeName || "employee"}`}
                      onClick={() => onView(row)}
                    >
                      <VisibilityIcon fontSize="small" />
                    </MuiButtonMigration>

                    <MuiButtonMigration
                      className="edit-btn"
                      aria-label={`Edit shift for ${row.employeeName || "employee"}`}
                      onClick={() => onEdit(row)}
                    >
                      <EditIcon fontSize="small" />
                    </MuiButtonMigration>

                    <MuiButtonMigration
                      className="delete-btn"
                      aria-label={`Delete shift for ${row.employeeName || "employee"}`}
                      onClick={() => onDelete(row)}
                    >
                      <DeleteIcon fontSize="small" />
                    </MuiButtonMigration>
                  </MuiLayoutBox>
                </MuiTableCellMigration>
              </MuiTableRowMigration>
            ))
          )}
        </MuiTableBodyMigration>
      </MuiTableMigration>
    </MuiLayoutBox>
  );
}
