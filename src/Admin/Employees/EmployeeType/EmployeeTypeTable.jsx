import "./EmployeeTypeTable.css";

import {
  IconButton,
  Tooltip,
} from "@mui/material";

import {
  Edit,
  Delete,
} from "@mui/icons-material";

function EmployeeTypeTable({
  employeeTypes = [],
  editEmployeeType,
  deleteEmployeeType,
}) {
  return (
    <div className="employee-type-table-wrapper">

      {/* Header */}

      <div className="employee-type-table-header">
        <div>
          <h2>Employee Type List</h2>
          <p>{employeeTypes.length} Employee Types Found</p>
        </div>
      </div>

      {/* Table */}

      <div className="table-responsive">
        <table className="employee-type-table">

          <thead>
            <tr>
              <th>#</th>
              <th>Employee Type</th>
              <th>Created Date</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>

            {employeeTypes.length === 0 ? (

              <tr>
                <td colSpan="5" className="no-records">
                  No Employee Types Found
                </td>
              </tr>

            ) : (

              employeeTypes.map((employeeType, index) => (

                <tr key={employeeType.employeeTypeId}>

                  {/* Serial Number */}

                  <td>{index + 1}</td>

                  {/* Employee Type */}

                  <td className="employee-type-name">
                    {employeeType.employeeTypeName}
                  </td>

                  {/* Created Date */}

<td>
    {employeeType.createdDate
        ? new Date(employeeType.createdDate).toLocaleDateString("en-GB")
        : "-"}
</td>

                  {/* Status */}

                  <td>
                    <span
                      className={`status-badge ${
                        employeeType.status === "Active"
                          ? "active"
                          : "inactive"
                      }`}
                    >
                      {employeeType.status}
                    </span>
                  </td>

                  {/* Actions */}

                  <td>
                    <div className="action-buttons">

                      <Tooltip title="Edit">
                        <IconButton
                          className="edit-btn"
                          onClick={() => editEmployeeType(employeeType)}
                        >
                          <Edit fontSize="small" />
                        </IconButton>
                      </Tooltip>

                      <Tooltip title="Delete">
                        <IconButton
                          className="delete-btn"
                          onClick={() =>
                            deleteEmployeeType(employeeType.employeeTypeId)
                          }
                        >
                          <Delete fontSize="small" />
                        </IconButton>
                      </Tooltip>

                    </div>
                  </td>

                </tr>

              ))

            )}

          </tbody>

        </table>
      </div>

    </div>
  );
}

export default EmployeeTypeTable;