import { MuiTableBodyMigration, MuiTableCellMigration, MuiTableHeadMigration, MuiTableMigration, MuiTableRowMigration } from "../../../components/ui/MuiCompat.jsx";
import "./EmployeeTypeTable.css";

import {
  IconButton,
  Tooltip,
} from "@mui/material";

import {
  Edit,
  Delete,
} from "@mui/icons-material";
import { Box as MuiLayoutBox, Typography as MuiText } from "@mui/material";

function EmployeeTypeTable({
  employeeTypes = [],
  editEmployeeType,
  deleteEmployeeType,
}) {
  return (
    <MuiLayoutBox className="employee-type-table-wrapper" component="div">

      {/* Header */}

      <MuiLayoutBox className="employee-type-table-header" component="div">
        <MuiLayoutBox component="div">
          <MuiText component="h2" variant="h5">Employee Type List</MuiText>
          <MuiText component="p" variant="body1">{employeeTypes.length} Employee Types Found</MuiText>
        </MuiLayoutBox>
      </MuiLayoutBox>

      {/* Table */}

      <MuiLayoutBox className="table-responsive" component="div">
        <MuiTableMigration className="employee-type-table employee-type-data-table">

          <MuiTableHeadMigration>
            <MuiTableRowMigration>
              <MuiTableCellMigration>#</MuiTableCellMigration>
              <MuiTableCellMigration>Employee Type</MuiTableCellMigration>
              <MuiTableCellMigration>Created Date</MuiTableCellMigration>
              <MuiTableCellMigration>Status</MuiTableCellMigration>
              <MuiTableCellMigration>Action</MuiTableCellMigration>
            </MuiTableRowMigration>
          </MuiTableHeadMigration>

          <MuiTableBodyMigration>

            {employeeTypes.length === 0 ? (

              <MuiTableRowMigration>
                <MuiTableCellMigration colSpan="5" className="no-records">
                  No Employee Types Found
                </MuiTableCellMigration>
              </MuiTableRowMigration>

            ) : (

              employeeTypes.map((employeeType, index) => (

                <MuiTableRowMigration key={employeeType.employeeTypeId}>

                  {/* Serial Number */}

                  <MuiTableCellMigration>{index + 1}</MuiTableCellMigration>

                  {/* Employee Type */}

                  <MuiTableCellMigration className="employee-type-name">
                    {employeeType.employeeTypeName}
                  </MuiTableCellMigration>

                  {/* Created Date */}

<MuiTableCellMigration>
    {employeeType.createdDate
        ? new Date(employeeType.createdDate).toLocaleDateString("en-GB")
        : "-"}
</MuiTableCellMigration>

                  {/* Status */}

                  <MuiTableCellMigration>
                    <MuiText
                      className={`status-badge ${
                        employeeType.status === "Active"
                          ? "active"
                          : "inactive"
                      }`}
                     component="span" variant="inherit">
                      {employeeType.status}
                    </MuiText>
                  </MuiTableCellMigration>

                  {/* Actions */}

                  <MuiTableCellMigration>
                    <MuiLayoutBox className="action-buttons" component="div">

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
                            deleteEmployeeType(employeeType)
                          }
                        >
                          <Delete fontSize="small" />
                        </IconButton>
                      </Tooltip>

                    </MuiLayoutBox>
                  </MuiTableCellMigration>

                </MuiTableRowMigration>

              ))

            )}

          </MuiTableBodyMigration>

        </MuiTableMigration>
      </MuiLayoutBox>

    </MuiLayoutBox>
  );
}

export default EmployeeTypeTable;
