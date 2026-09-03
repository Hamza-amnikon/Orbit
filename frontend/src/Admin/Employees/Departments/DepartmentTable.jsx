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


      {/* ==================================================
          HEADER
      ================================================== */}

      <div className="employee-type-table-header">

        <div>

          <h2>
            Department List
          </h2>

          <p>
            {departments.length} Departments Found
          </p>

        </div>

      </div>


      {/* ==================================================
          TABLE
      ================================================== */}

      <div className="table-responsive">

        <table className="employee-type-table">


          <thead>

            <tr>

              <th>
                #
              </th>

              <th>
                Department
              </th>

              <th>
                Created Date
              </th>

              <th>
                Status
              </th>

              <th>
                Action
              </th>

            </tr>

          </thead>


          <tbody>

            {departments.length === 0 ? (

              <tr>

                <td
                  colSpan="5"
                  className="no-records"
                >
                  No Departments Found
                </td>

              </tr>

            ) : (

              departments.map(
                (department, index) => (

                  <tr
                    key={
                      department.departmentId
                    }
                  >


                    {/* SERIAL */}

                    <td>
                      {index + 1}
                    </td>


                    {/* DEPARTMENT */}

                    <td
                      className="employee-type-name"
                    >
                      {
                        department.departmentName ||
                        "-"
                      }
                    </td>


                    {/* CREATED DATE */}

                    <td>

                      {
                        department.createdDate

                          ? new Date(
                              department.createdDate
                            ).toLocaleDateString(
                              "en-GB"
                            )

                          : "-"
                      }

                    </td>


                    {/* STATUS */}

                    <td>

                      <span
                        className={
                          `status-badge ${
                            department.status
                              ?.toLowerCase() ===
                            "active"
                              ? "active"
                              : "inactive"
                          }`
                        }
                      >

                        {
                          department.status ||
                          "-"
                        }

                      </span>

                    </td>


                    {/* ACTIONS */}

                    <td>

                      <div
                        className="action-buttons"
                      >


                        <Tooltip
                          title="Edit"
                        >

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

                        </Tooltip>


                        <Tooltip
                          title="Delete"
                        >

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

                        </Tooltip>


                      </div>

                    </td>


                  </tr>

                )
              )

            )}

          </tbody>

        </table>

      </div>

    </div>

  );

}


export default DepartmentTable;