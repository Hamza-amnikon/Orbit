import { MuiTableBodyMigration, MuiTableCellMigration, MuiTableHeadMigration, MuiTableMigration, MuiTableRowMigration } from "../../../components/ui/MuiCompat.jsx";
import "./DesignationTable.css";

import {
  IconButton,
  Tooltip,
} from "@mui/material";

import {
  Edit,
  Delete,
} from "@mui/icons-material";
import { Box as MuiLayoutBox, Typography as MuiText } from "@mui/material";


function DesignationTable({
  designations = [],
  editDesignation,
  deleteDesignation,
  canEdit = true,
  canDelete = true,
  onNotify,
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

      onNotify?.("Unable to edit this designation because its ID is missing.", "error");

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

      onNotify?.("Unable to delete this designation because its ID is missing.", "error");

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

    <MuiLayoutBox
      className="employee-type-table-wrapper"
     component="div">

      {/* =====================================================
          TABLE HEADER
      ===================================================== */}

      <MuiLayoutBox
        className="employee-type-table-header"
       component="div">

        <MuiLayoutBox component="div">

          <MuiText component="h2" variant="h5">
            Designation List
          </MuiText>


          <MuiText component="p" variant="body1">
            {designations.length}{" "}
            {designations.length === 1
              ? "Designation"
              : "Designations"}{" "}
            Found
          </MuiText>

        </MuiLayoutBox>

      </MuiLayoutBox>


      {/* =====================================================
          TABLE
      ===================================================== */}

      <MuiLayoutBox
        className="table-responsive"
       component="div">

        <MuiTableMigration
          className="employee-type-table"
        >

          <MuiTableHeadMigration>

            <MuiTableRowMigration>

              <MuiTableCellMigration>
                #
              </MuiTableCellMigration>

              <MuiTableCellMigration>
                Designation
              </MuiTableCellMigration>

              <MuiTableCellMigration>
                Description
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

            {/* =================================================
                NO RECORDS
            ================================================= */}

            {designations.length === 0 ? (

              <MuiTableRowMigration>

                <MuiTableCellMigration
                  colSpan="6"
                  className="no-records"
                >
                  No Designations Found
                </MuiTableCellMigration>

              </MuiTableRowMigration>

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

                    <MuiTableRowMigration
                      key={
                        designationId ??
                        `designation-${index}`
                      }
                    >

                      {/* =======================================
                          NUMBER
                      ======================================= */}

                      <MuiTableCellMigration>
                        {index + 1}
                      </MuiTableCellMigration>


                      {/* =======================================
                          DESIGNATION
                      ======================================= */}

                      <MuiTableCellMigration
                        className="employee-type-name"
                      >
                        {designationName}
                      </MuiTableCellMigration>


                      {/* =======================================
                          DESCRIPTION
                      ======================================= */}

                      <MuiTableCellMigration>
                        {description}
                      </MuiTableCellMigration>


                      {/* =======================================
                          CREATED DATE
                      ======================================= */}

                      <MuiTableCellMigration>
                        {createdDate}
                      </MuiTableCellMigration>


                      {/* =======================================
                          STATUS
                      ======================================= */}

                      <MuiTableCellMigration>

                        <MuiText
                          className={
                            `status-badge ${statusClass}`
                          }
                         component="span" variant="inherit">
                          {status}
                        </MuiText>

                      </MuiTableCellMigration>


                      {/* =======================================
                          ACTIONS
                      ======================================= */}

                      <MuiTableCellMigration>

                        <MuiLayoutBox
                          className="action-buttons"
                         component="div">

                          {/* EDIT */}

                          {canEdit && <Tooltip title="Edit">

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

                          </Tooltip>}


                          {/* DELETE */}

                          {canDelete && <Tooltip title="Delete">

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

                          </Tooltip>}

                        </MuiLayoutBox>

                      </MuiTableCellMigration>

                    </MuiTableRowMigration>

                  );

                }
              )

            )}

          </MuiTableBodyMigration>

        </MuiTableMigration>

      </MuiLayoutBox>

    </MuiLayoutBox>

  );

}


export default DesignationTable;
