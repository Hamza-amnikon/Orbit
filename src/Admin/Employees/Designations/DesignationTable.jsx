import "./DesignationTable.css";

import { IconButton, Tooltip } from "@mui/material";

import { Edit, Delete } from "@mui/icons-material";

function DesignationTable({
  designations = [],
  editDesignation,
  deleteDesignation,
}) {
  return (
    <div className="employee-type-table-wrapper">
      <div className="employee-type-table-header">
        <div>
          <h2>Designation List</h2>

          <p>{designations.length} Designations Found</p>
        </div>
      </div>

      <div className="table-responsive">
        <table className="employee-type-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Designation</th>
              <th>Description</th>
              <th>Created Date</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {designations.length === 0 ? (
              <tr>
                <td colSpan="6" className="no-records">
                  No Designations Found
                </td>
              </tr>
            ) : (
              designations.map((designation, index) => (
                <tr key={designation.designationId}>
                  <td>{index + 1}</td>

                  <td className="employee-type-name">
                    {designation.designationName}
                  </td>

                  <td>{designation.description || "-"}</td>

                  <td>
                    {designation.createdDate
                      ? new Date(designation.createdDate).toLocaleDateString(
                          "en-GB",
                        )
                      : "-"}
                  </td>

                  <td>
                    <span
                      className={`status-badge ${
                        designation.status === "Active" ? "active" : "inactive"
                      }`}
                    >
                      {designation.status}
                    </span>
                  </td>

                  <td>
                    <div className="action-buttons">
                      <Tooltip title="Edit">
                        <IconButton
                          className="edit-btn"
                          onClick={() => editDesignation(designation)}
                        >
                          <Edit fontSize="small" />
                        </IconButton>
                      </Tooltip>

                      <Tooltip title="Delete">
                        <IconButton
                          className="delete-btn"
                          onClick={() =>
                            deleteDesignation(designation.designationId)
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

export default DesignationTable;
