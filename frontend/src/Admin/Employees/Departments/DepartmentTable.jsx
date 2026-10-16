import { MuiTableBodyMigration, MuiTableCellMigration, MuiTableHeadMigration, MuiTableMigration, MuiTableRowMigration } from "../../../components/ui/MuiCompat.jsx";
import "./DepartmentTable.css";

import {
  IconButton,
  Tooltip,
} from "@mui/material";

import {
  Edit,
  Delete,
} from "@mui/icons-material";
import { Box as MuiLayoutBox, Typography as MuiText } from "@mui/material";


function DepartmentTable({
  departments = [],
  editDepartment,
  deleteDepartment,
  canEdit = true,
  canDelete = true,
}) {

  return (

    <MuiLayoutBox className="department-table-wrapper" component="div">


      {/* ==================================================
          HEADER
      ================================================== */}

        <MuiLayoutBox className="department-table-header" component="div">

        <MuiLayoutBox component="div">

          <MuiText component="h2" variant="h5">
            Department List
          </MuiText>

          <MuiText component="p" variant="body1">
            {departments.length} Departments Found
          </MuiText>

        </MuiLayoutBox>

      </MuiLayoutBox>


      {/* ==================================================
          TABLE
      ================================================== */}

      <MuiLayoutBox className="table-responsive" component="div">

        <MuiTableMigration className="department-table">


          <MuiTableHeadMigration>

            <MuiTableRowMigration>

              <MuiTableCellMigration>
                #
              </MuiTableCellMigration>

              <MuiTableCellMigration>
                Department
              </MuiTableCellMigration>

              <MuiTableCellMigration>
                Created Date
              </MuiTableCellMigration>

              <MuiTableCellMigration>
                Status
              </MuiTableCellMigration>

              <MuiTableCellMigration>
                Action
              </MuiTableCellMigration>

            </MuiTableRowMigration>

          </MuiTableHeadMigration>


          <MuiTableBodyMigration>

            {departments.length === 0 ? (

              <MuiTableRowMigration>

                <MuiTableCellMigration
                  colSpan="5"
                  className="no-records"
                >
                  No Departments Found
                </MuiTableCellMigration>

              </MuiTableRowMigration>

            ) : (

              departments.map(
                (department, index) => (

                  <MuiTableRowMigration
                    key={
                      department.departmentId
                    }
                  >


                    {/* SERIAL */}

                    <MuiTableCellMigration>
                      {index + 1}
                    </MuiTableCellMigration>


                    {/* DEPARTMENT */}

                    <MuiTableCellMigration
                      className="employee-type-name"
                    >
                      {
                        department.departmentName ||
                        "-"
                      }
                    </MuiTableCellMigration>


                    {/* CREATED DATE */}

                    <MuiTableCellMigration>

                      {
                        department.createdDate

                          ? new Date(
                              department.createdDate
                            ).toLocaleDateString(
                              "en-GB"
                            )

                          : "-"
                      }

                    </MuiTableCellMigration>


                    {/* STATUS */}

                    <MuiTableCellMigration>

                      <MuiText
                        className={
                          `status-badge ${
                            department.status
                              ?.toLowerCase() ===
                            "active"
                              ? "active"
                              : "inactive"
                          }`
                        }
                       component="span" variant="inherit">

                        {
                          department.status ||
                          "-"
                        }

                      </MuiText>

                    </MuiTableCellMigration>


                    {/* ACTIONS */}

                    <MuiTableCellMigration>

                      <MuiLayoutBox
                        className="action-buttons"
                       component="div">


                        {canEdit && <Tooltip title="Edit">

                          <IconButton
                            className="edit-btn"
                            onClick={() =>
                              editDepartment(
                                department
                              )
                            }
                          >

                            <Edit
                              fontSize="small"
                            />

                          </IconButton>

                        </Tooltip>}


                        {canDelete && <Tooltip title="Delete">

                          <IconButton
                            className="delete-btn"
                            onClick={() =>
                              deleteDepartment(
                                department.departmentId
                              )
                            }
                          >

                            <Delete
                              fontSize="small"
                            />

                          </IconButton>

                        </Tooltip>}


                      </MuiLayoutBox>

                    </MuiTableCellMigration>


                  </MuiTableRowMigration>

                )
              )

            )}

          </MuiTableBodyMigration>

        </MuiTableMigration>

      </MuiLayoutBox>

    </MuiLayoutBox>

  );

}


export default DepartmentTable;
