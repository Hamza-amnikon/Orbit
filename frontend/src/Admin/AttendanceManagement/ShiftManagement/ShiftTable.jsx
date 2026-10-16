import { MuiButtonMigration, MuiTableBodyMigration, MuiTableCellMigration, MuiTableHeadMigration, MuiTableMigration, MuiTableRowMigration } from "../../../components/ui/MuiCompat.jsx";
import "./ShiftManagement.css";

import VisibilityIcon from "@mui/icons-material/Visibility";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { Box as MuiLayoutBox, Typography as MuiText } from "@mui/material";

export default function ShiftTable({
  rows = [],
  onView,
  onEdit,
  onDelete,
}) {
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

            <MuiTableCellMigration>Weekly Off</MuiTableCellMigration>

            <MuiTableCellMigration>Status</MuiTableCellMigration>

            <MuiTableCellMigration>Actions</MuiTableCellMigration>
          </MuiTableRowMigration>
        </MuiTableHeadMigration>

        <MuiTableBodyMigration>
          {rows.length === 0 ? (
            <MuiTableRowMigration>
              <MuiTableCellMigration colSpan={10} className="no-data">
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

                <MuiTableCellMigration>{row.azureEmployeeId}</MuiTableCellMigration>

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
