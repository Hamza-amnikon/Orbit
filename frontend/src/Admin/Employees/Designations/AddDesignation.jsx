import {
  useEffect,
  useState,
} from "react";

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


function AddDesignation({
  open,
  handleClose,
  handleSave,
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
  // NORMALIZE EMPLOYEE ID
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
  // NORMALIZE EMPLOYEE CODE
  // =========================================================

  const currentEmployeeCode =
    employeeCode ??
    profile?.employeeCode ??
    profile?.EmployeeCode ??
    user?.employeeCode ??
    user?.EmployeeCode ??
    null;


  // =========================================================
  // NORMALIZE EMPLOYEE NAME
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
  // INITIAL FORM STATE
  // =========================================================

  const initialState = {
    designationName: "",
    description: "",
    status: "Active",
  };


  const [formData, setFormData] =
    useState(initialState);


  const [saving, setSaving] =
    useState(false);


  // =========================================================
  // RESET FORM WHEN DIALOG OPENS
  // =========================================================

  useEffect(() => {

    if (open) {

      setFormData(
        initialState
      );

      setSaving(false);


      console.log(
        "=========================================="
      );

      console.log(
        "AddDesignation - Authenticated Employee"
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

    }

  }, [
    open,
    isAuthenticated,
    currentEmployeeId,
    currentEmployeeCode,
    currentEmployeeName,
  ]);


  // =========================================================
  // HANDLE INPUT CHANGE
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
  // VALIDATE AUTHENTICATED EMPLOYEE
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
        "AddDesignation: EmployeeId is missing.",
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
  // SAVE DESIGNATION
  // =========================================================

  const save = async () => {

    // -------------------------------------------------------
    // AUTHENTICATION
    // -------------------------------------------------------

    if (
      !validateAuthenticatedEmployee()
    ) {

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
    // LOG AUTHENTICATED EMPLOYEE
    // -------------------------------------------------------

    console.log(
      "=========================================="
    );

    console.log(
      "Creating Designation"
    );

    console.log(
      "Designation Name:",
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
      "Created By EmployeeId:",
      currentEmployeeId
    );

    console.log(
      "Created By EmployeeCode:",
      currentEmployeeCode
    );

    console.log(
      "Created By EmployeeName:",
      currentEmployeeName
    );

    console.log(
      "=========================================="
    );


    try {

      setSaving(true);


      /*
       * IMPORTANT
       *
       * We intentionally do NOT send:
       *
       * createdBy
       * createdByEmployeeId
       * createdByEmployeeCode
       * createdByEmployeeName
       *
       * The DesignationService sends the authenticated
       * Bearer JWT.
       *
       * The backend should read EmployeeId from the JWT
       * and store it as CreatedBy.
       */


      await handleSave(
        payload
      );


      setFormData(
        initialState
      );

    }
    catch (error) {

      console.error(
        "AddDesignation Save Error:",
        error
      );

    }
    finally {

      setSaving(false);

    }

  };


  // =========================================================
  // CLOSE DIALOG
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
  // RENDER
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
        Add Designation
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
            Creating as
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


        {/* ===================================================
            FORM
        =================================================== */}

        <Grid
          container
          spacing={3}
        >

          {/* =================================================
              DESIGNATION NAME
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
                placeholder="Enter Designation"
                name="designationName"
                value={
                  formData.designationName
                }
                onChange={
                  handleChange
                }
                className="dialog-input"
                disabled={saving}
                autoFocus
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
                placeholder="Enter Description"
                name="description"
                value={
                  formData.description
                }
                onChange={
                  handleChange
                }
                className="dialog-input multiline"
                disabled={saving}
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
          onClick={save}
          className="save-btn"
          disabled={
            saving ||
            !isAuthenticated ||
            currentEmployeeId === null ||
            currentEmployeeId === undefined
          }
        >

          {saving
            ? "Saving..."
            : "Save Designation"}

        </Button>

      </DialogActions>

    </Dialog>

  );

}


export default AddDesignation;