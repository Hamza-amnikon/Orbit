import "./DepartmentTable.css";

import {
  IconButton,
  Tooltip,
} from "@mui/material";

import {
  Edit,
  Delete,
} from "@mui/icons-material";

function DepartmentTable({
  departments = [],
  editDepartment,
  deleteDepartment,
}) {
  return (
    <div className="employee-type-table-wrapper">

      {/* Header */}

      <div className="employee-type-table-header">
        <div>
          <h2>Department List</h2>
          <p>{departments.length} Departments Found</p>
        </div>
      </div>

      {/* Table */}

      <div className="table-responsive">
        <table className="employee-type-table">

          <thead>
            <tr>
              <th>#</th>
              <th>Department</th>
              <th>Created Date</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>

            {departments.length === 0 ? (

              <tr>
                <td colSpan="5" className="no-records">
                  No Departments Found
                </td>
              </tr>

            ) : (

              departments.map((department, index) => (

                <tr key={department.departmentId}>

                  {/* Serial Number */}

                  <td>{index + 1}</td>

                  {/* Department */}

                  <td className="employee-type-name">
                    {department.departmentName}
                  </td>

                  {/* Created Date */}

<td>
    {department.createdDate
        ? new Date(department.createdDate).toLocaleDateString("en-GB")
        : "-"}
</td>

                  {/* Status */}

                  <td>
                    <span
                      className={`status-badge ${
                        department.status === "Active"
                          ? "active"
                          : "inactive"
                      }`}
                    >
                      {department.status}
                    </span>
                  </td>

                  {/* Actions */}

                  <td>
                    <div className="action-buttons">

                      <Tooltip title="Edit">
                        <IconButton
                          className="edit-btn"
                          onClick={() => editDepartment(department)}
                        >
                          <Edit fontSize="small" />
                        </IconButton>
                      </Tooltip>

                      <Tooltip title="Delete">
                        <IconButton
                          className="delete-btn"
                          onClick={() =>
                            deleteDepartment(department.departmentId)
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

export default DepartmentTable;