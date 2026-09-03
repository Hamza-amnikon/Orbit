import { useEffect, useState } from "react";

import "./Designation.css";

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  TextField,
  MenuItem,
  Typography,
  Box,
} from "@mui/material";

import { useAuth } from "../../../context/AuthContext";


function EditDesignation({
  open,
  designation,
  handleClose,
  handleUpdate,
}) {

  // =========================================================
  // AUTHENTICATED EMPLOYEE
  // =========================================================

  const {
    user,
    profile,
    employeeId,
    employeeCode,
    employeeName,
    isAuthenticated,
    profileLoading,
  } = useAuth();


  // =========================================================
  // EMPLOYEE ID
  // =========================================================

  const currentEmployeeId =
    employeeId ??
    profile?.employeeId ??
    profile?.EmployeeId ??
    profile?.employeeID ??
    profile?.EmployeeID ??
    user?.employeeId ??
    user?.EmployeeId ??
    user?.employeeID ??
    user?.EmployeeID ??
    null;


  // =========================================================
  // EMPLOYEE CODE
  // =========================================================

  const currentEmployeeCode =
    employeeCode ??
    profile?.employeeCode ??
    profile?.EmployeeCode ??
    user?.employeeCode ??
    user?.EmployeeCode ??
    null;


  // =========================================================
  // EMPLOYEE NAME
  // =========================================================

  const currentEmployeeName =
    employeeName ??
    profile?.employeeName ??
    profile?.EmployeeName ??
    profile?.displayName ??
    profile?.DisplayName ??
    profile?.fullName ??
    profile?.FullName ??
    user?.employeeName ??
    user?.EmployeeName ??
    user?.displayName ??
    user?.DisplayName ??
    user?.name ??
    user?.Name ??
    "Employee";


  // =========================================================
  // INITIAL STATE
  // =========================================================

  const initialState = {
    designationId: 0,
    designationName: "",
    description: "",
    status: "Active",
  };


  const [formData, setFormData] =
    useState(initialState);


  const [saving, setSaving] =
    useState(false);


  // =========================================================
  // LOAD SELECTED DESIGNATION
  // =========================================================

  useEffect(() => {

    if (
      open &&
      designation
    ) {

      console.log(
        "=========================================="
      );

      console.log(
        "EditDesignation - Designation Received:",
        designation
      );

      console.log(
        "Authenticated:",
        isAuthenticated
      );

      console.log(
        "EmployeeId:",
        currentEmployeeId
      );

      console.log(
        "EmployeeCode:",
        currentEmployeeCode
      );

      console.log(
        "EmployeeName:",
        currentEmployeeName
      );

      console.log(
        "=========================================="
      );


      setFormData({

        designationId:
          designation.designationId ??
          designation.DesignationId ??
          designation.designationID ??
          designation.DesignationID ??
          0,

        designationName:
          designation.designationName ??
          designation.DesignationName ??
          designation.designation ??
          designation.Designation ??
          "",

        description:
          designation.description ??
          designation.Description ??
          "",

        status:
          designation.status ??
          designation.Status ??
          "Active",

      });

    }

  }, [
    open,
    designation,
    isAuthenticated,
    currentEmployeeId,
    currentEmployeeCode,
    currentEmployeeName,
  ]);


  // =========================================================
  // HANDLE CHANGE
  // =========================================================

  const handleChange = (event) => {

    const {
      name,
      value,
    } = event.target;


    setFormData(
      (previous) => ({
        ...previous,
        [name]: value,
      })
    );

  };


  // =========================================================
  // AUTH VALIDATION
  // =========================================================

  const validateAuthenticatedEmployee = () => {

    if (!isAuthenticated) {

      alert(
        "You are not authenticated. Please sign in again."
      );

      return false;

    }


    if (
      currentEmployeeId === null ||
      currentEmployeeId === undefined ||
      currentEmployeeId === "" ||
      Number.isNaN(
        Number(currentEmployeeId)
      )
    ) {

      console.error(
        "EditDesignation: EmployeeId is missing.",
        {
          user,
          profile,
          employeeId,
        }
      );


      alert(
        "Your Employee ID could not be determined. Please sign in again."
      );

      return false;

    }


    return true;

  };


  // =========================================================
  // UPDATE DESIGNATION
  // =========================================================

  const update = async () => {

    // -------------------------------------------------------
    // AUTHENTICATION
    // -------------------------------------------------------

    if (
      !validateAuthenticatedEmployee()
    ) {

      return;

    }


    // -------------------------------------------------------
    // DESIGNATION ID
    // -------------------------------------------------------

    if (
      !formData.designationId ||
      Number(formData.designationId) <= 0
    ) {

      alert(
        "Designation ID is missing."
      );

      return;

    }


    // -------------------------------------------------------
    // DESIGNATION NAME
    // -------------------------------------------------------

    if (
      !formData.designationName ||
      !formData.designationName.trim()
    ) {

      alert(
        "Designation Name is required."
      );

      return;

    }


    // -------------------------------------------------------
    // PAYLOAD
    // -------------------------------------------------------

    const payload = {

      designationId:
        Number(formData.designationId),

      designationName:
        formData.designationName.trim(),

      description:
        formData.description
          ? formData.description.trim()
          : "",

      status:
        formData.status,

    };


    // -------------------------------------------------------
    // LOG
    // -------------------------------------------------------

    console.log(
      "=========================================="
    );

    console.log(
      "Updating Designation"
    );

    console.log(
      "DesignationId:",
      payload.designationId
    );

    console.log(
      "DesignationName:",
      payload.designationName
    );

    console.log(
      "Description:",
      payload.description
    );

    console.log(
      "Status:",
      payload.status
    );

    console.log(
      "Updated By EmployeeId:",
      currentEmployeeId
    );

    console.log(
      "Updated By EmployeeCode:",
      currentEmployeeCode
    );

    console.log(
      "Updated By EmployeeName:",
      currentEmployeeName
    );

    console.log(
      "=========================================="
    );


    try {

      setSaving(true);


      /*
       * IMPORTANT:
       *
       * Do NOT send updatedBy from the browser.
       *
       * DesignationService will send the authenticated
       * Bearer JWT.
       *
       * The backend should read EmployeeId from the JWT
       * and set UpdatedBy from that authenticated identity.
       */

      await handleUpdate(
        payload
      );


      setFormData(
        initialState
      );

    }
    catch (error) {

      console.error(
        "EditDesignation Update Error:",
        error
      );

    }
    finally {

      setSaving(false);

    }

  };


  // =========================================================
  // CLOSE
  // =========================================================

  const closeDialog = () => {

    if (saving) {
      return;
    }


    setFormData(
      initialState
    );


    handleClose();

  };


  // =========================================================
  // UI
  // =========================================================

  return (

    <Dialog
      open={open}
      onClose={closeDialog}
      fullWidth
      maxWidth="md"
      className="employee-type-dialog"
    >

      {/* =====================================================
          TITLE
      ===================================================== */}

      <DialogTitle
        className="employee-type-dialog-title"
      >
        Edit Designation
      </DialogTitle>


      {/* =====================================================
          CONTENT
      ===================================================== */}

      <DialogContent
        className="employee-type-dialog-content"
      >

        {/* ===================================================
            AUTHENTICATED EMPLOYEE
        =================================================== */}

        <Box
          sx={{
            marginBottom: 3,
            padding: "14px 18px",
            borderRadius: "12px",
            background:
              "linear-gradient(135deg, #f5f9ff 0%, #eef5ff 100%)",
            border:
              "1px solid rgba(37, 99, 235, 0.12)",
          }}
        >

          <Typography
            variant="body2"
            sx={{
              fontWeight: 600,
              color: "#475569",
              marginBottom: "4px",
            }}
          >
            Updating as
          </Typography>


          <Typography
            variant="body1"
            sx={{
              fontWeight: 700,
              color: "#0f172a",
            }}
          >
            {profileLoading
              ? "Loading employee..."
              : currentEmployeeName}
          </Typography>


          <Typography
            variant="caption"
            sx={{
              display: "block",
              marginTop: "3px",
              color: "#64748b",
            }}
          >
            Employee ID:{" "}
            {currentEmployeeId ??
              "Not available"}

            {" • "}

            Employee Code:{" "}
            {currentEmployeeCode ??
              "Not available"}
          </Typography>

        </Box>


        <Grid
          container
          spacing={3}
        >

          {/* =================================================
              DESIGNATION
          ================================================= */}

          <Grid
            size={{ xs: 12 }}
          >

            <div className="form-group">

              <Typography
                className="dialog-label"
              >
                Designation{" "}
                <span>*</span>
              </Typography>


              <TextField
                fullWidth
                name="designationName"
                value={
                  formData.designationName
                }
                onChange={
                  handleChange
                }
                className="dialog-input"
                disabled={saving}
                placeholder="Enter Designation"
              />

            </div>

          </Grid>


          {/* =================================================
              DESCRIPTION
          ================================================= */}

          <Grid
            size={{ xs: 12 }}
          >

            <div className="form-group">

              <Typography
                className="dialog-label"
              >
                Description
              </Typography>


              <TextField
                fullWidth
                multiline
                rows={3}
                name="description"
                value={
                  formData.description
                }
                onChange={
                  handleChange
                }
                className="dialog-input multiline"
                disabled={saving}
                placeholder="Enter Description"
              />

            </div>

          </Grid>


          {/* =================================================
              STATUS
          ================================================= */}

          <Grid
            size={{ xs: 12 }}
          >

            <div className="form-group">

              <Typography
                className="dialog-label"
              >
                Status
              </Typography>


              <TextField
                select
                fullWidth
                name="status"
                value={
                  formData.status
                }
                onChange={
                  handleChange
                }
                className="dialog-input"
                disabled={saving}
              >

                <MenuItem value="Active">
                  Active
                </MenuItem>

                <MenuItem value="Inactive">
                  Inactive
                </MenuItem>

              </TextField>

            </div>

          </Grid>

        </Grid>

      </DialogContent>


      {/* =====================================================
          ACTIONS
      ===================================================== */}

      <DialogActions
        className="employee-type-dialog-actions"
      >

        <Button
          variant="outlined"
          onClick={closeDialog}
          className="cancel-btn"
          disabled={saving}
        >
          Cancel
        </Button>


        <Button
          variant="contained"
          onClick={update}
          className="save-btn"
          disabled={
            saving ||
            !isAuthenticated ||
            currentEmployeeId === null ||
            currentEmployeeId === undefined ||
            !formData.designationId
          }
        >

          {saving
            ? "Updating..."
            : "Update Designation"}

        </Button>

      </DialogActions>

    </Dialog>

  );

}


export default EditDesignation;