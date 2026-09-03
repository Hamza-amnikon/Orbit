import "./DesignationTable.css";

import {
  IconButton,
  Tooltip,
} from "@mui/material";

import {
  Edit,
  Delete,
} from "@mui/icons-material";


function DesignationTable({
  designations = [],
  editDesignation,
  deleteDesignation,
}) {


  // =========================================================
  // SAFE DESIGNATION ID
  // =========================================================

  const getDesignationId = (designation) => {

    return (
      designation?.designationId ??
      designation?.DesignationId ??
      designation?.designationID ??
      designation?.DesignationID ??
      null
    );

  };


  // =========================================================
  // SAFE DESIGNATION NAME
  // =========================================================

  const getDesignationName = (designation) => {

    return (
      designation?.designationName ??
      designation?.DesignationName ??
      designation?.designation ??
      designation?.Designation ??
      designation?.role ??
      designation?.Role ??
      "-"
    );

  };


  // =========================================================
  // SAFE DESCRIPTION
  // =========================================================

  const getDescription = (designation) => {

    const description =
      designation?.description ??
      designation?.Description ??
      "";

    return description || "-";

  };


  // =========================================================
  // SAFE CREATED DATE
  // =========================================================

  const getCreatedDate = (designation) => {

    const value =
      designation?.createdDate ??
      designation?.CreatedDate ??
      designation?.createdAt ??
      designation?.CreatedAt ??
      null;


    if (!value) {
      return "-";
    }


    const date = new Date(value);


    if (
      Number.isNaN(
        date.getTime()
      )
    ) {

      return "-";

    }


    return date.toLocaleDateString(
      "en-GB"
    );

  };


  // =========================================================
  // SAFE STATUS
  // =========================================================

  const getStatus = (designation) => {

    return (
      designation?.status ??
      designation?.Status ??
      "Unknown"
    );

  };


  // =========================================================
  // STATUS CLASS
  // =========================================================

  const getStatusClass = (status) => {

    return String(status)
      .trim()
      .toLowerCase() === "active"
      ? "active"
      : "inactive";

  };


  // =========================================================
  // EDIT
  // =========================================================

  const handleEdit = (designation) => {

    const designationId =
      getDesignationId(
        designation
      );


    if (!designationId) {

      console.error(
        "DesignationTable: Cannot edit designation because DesignationId is missing.",
        designation
      );

      alert(
        "Unable to edit this designation because its ID is missing."
      );

      return;

    }


    console.log(
      "DesignationTable - Edit:",
      {
        designationId,
        designation,
      }
    );


    editDesignation(
      designation
    );

  };


  // =========================================================
  // DELETE
  // =========================================================

  const handleDelete = (designation) => {

    const designationId =
      getDesignationId(
        designation
      );


    if (!designationId) {

      console.error(
        "DesignationTable: Cannot delete designation because DesignationId is missing.",
        designation
      );

      alert(
        "Unable to delete this designation because its ID is missing."
      );

      return;

    }


    console.log(
      "DesignationTable - Delete:",
      {
        designationId,
      }
    );


    deleteDesignation(
      designationId
    );

  };


  // =========================================================
  // RENDER
  // =========================================================

  return (

    <div
      className="employee-type-table-wrapper"
    >

      {/* =====================================================
          TABLE HEADER
      ===================================================== */}

      <div
        className="employee-type-table-header"
      >

        <div>

          <h2>
            Designation List
          </h2>


          <p>
            {designations.length}{" "}
            {designations.length === 1
              ? "Designation"
              : "Designations"}{" "}
            Found
          </p>

        </div>

      </div>


      {/* =====================================================
          TABLE
      ===================================================== */}

      <div
        className="table-responsive"
      >

        <table
          className="employee-type-table"
        >

          <thead>

            <tr>

              <th>
                #
              </th>

              <th>
                Designation
              </th>

              <th>
                Description
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

            {/* =================================================
                NO RECORDS
            ================================================= */}

            {designations.length === 0 ? (

              <tr>

                <td
                  colSpan="6"
                  className="no-records"
                >
                  No Designations Found
                </td>

              </tr>

            ) : (

              /* =================================================
                 DESIGNATION ROWS
              ================================================= */

              designations.map(
                (
                  designation,
                  index
                ) => {

                  const designationId =
                    getDesignationId(
                      designation
                    );


                  const designationName =
                    getDesignationName(
                      designation
                    );


                  const description =
                    getDescription(
                      designation
                    );


                  const createdDate =
                    getCreatedDate(
                      designation
                    );


                  const status =
                    getStatus(
                      designation
                    );


                  const statusClass =
                    getStatusClass(
                      status
                    );


                  return (

                    <tr
                      key={
                        designationId ??
                        `designation-${index}`
                      }
                    >

                      {/* =======================================
                          NUMBER
                      ======================================= */}

                      <td>
                        {index + 1}
                      </td>


                      {/* =======================================
                          DESIGNATION
                      ======================================= */}

                      <td
                        className="employee-type-name"
                      >
                        {designationName}
                      </td>


                      {/* =======================================
                          DESCRIPTION
                      ======================================= */}

                      <td>
                        {description}
                      </td>


                      {/* =======================================
                          CREATED DATE
                      ======================================= */}

                      <td>
                        {createdDate}
                      </td>


                      {/* =======================================
                          STATUS
                      ======================================= */}

                      <td>

                        <span
                          className={
                            `status-badge ${statusClass}`
                          }
                        >
                          {status}
                        </span>

                      </td>


                      {/* =======================================
                          ACTIONS
                      ======================================= */}

                      <td>

                        <div
                          className="action-buttons"
                        >

                          {/* EDIT */}

                          <Tooltip
                            title="Edit"
                          >

                            <IconButton
                              className="edit-btn"
                              onClick={() =>
                                handleEdit(
                                  designation
                                )
                              }
                              disabled={
                                !designationId
                              }
                            >

                              <Edit
                                fontSize="small"
                              />

                            </IconButton>

                          </Tooltip>


                          {/* DELETE */}

                          <Tooltip
                            title="Delete"
                          >

                            <IconButton
                              className="delete-btn"
                              onClick={() =>
                                handleDelete(
                                  designation
                                )
                              }
                              disabled={
                                !designationId
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

                  );

                }
              )

            )}

          </tbody>

        </table>

      </div>

    </div>

  );

}


export default DesignationTable;