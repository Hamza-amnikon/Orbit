import "./ShiftManagement.css";

import VisibilityIcon from "@mui/icons-material/Visibility";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

export default function ShiftTable({
  rows = [],
  onView,
  onEdit,
  onDelete,
}) {
  return (
    <div className="shift-table-wrapper">
      <table className="shift-table">
        <thead>
          <tr>
            <th>Employee</th>

            <th>Employee ID</th>

            <th>Department</th>

            <th>Designation</th>

            <th>Shift</th>

            <th>From Date</th>

            <th>To Date</th>

            <th>Weekly Off</th>

            <th>Status</th>

            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={10} className="no-data">
                No shift assignments found.
              </td>
            </tr>
          ) : (
            rows.map((row) => (
              <tr key={row.shiftId}>
                <td>
                  <div className="employee-cell">
                    <div className="employee-avatar">
                      {row.employeeName?.charAt(0)}
                    </div>

                    <div>
                      <strong>{row.employeeName}</strong>
                    </div>
                  </div>
                </td>

                <td>{row.azureEmployeeId}</td>

                <td>{row.department}</td>

                <td>{row.designation}</td>

                <td>
                  <span className="shift-chip">
                    {row.shiftName}
                  </span>
                </td>

                <td>{row.fromDate}</td>

                <td>{row.toDate}</td>

                <td>
                  {row.weeklyOff1}
                  {row.weeklyOff2 ? `, ${row.weeklyOff2}` : ""}
                </td>

                <td>
                  <span
                    className={`status-chip ${row.status.toLowerCase()}`}
                  >
                    {row.status}
                  </span>
                </td>

                <td>
                  <div className="action-buttons">
                    <button
                      className="view-btn"
                      onClick={() => onView(row)}
                    >
                      <VisibilityIcon fontSize="small" />
                    </button>

                    <button
                      className="edit-btn"
                      onClick={() => onEdit(row)}
                    >
                      <EditIcon fontSize="small" />
                    </button>

                    <button
                      className="delete-btn"
                      onClick={() => onDelete(row)}
                    >
                      <DeleteIcon fontSize="small" />
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}