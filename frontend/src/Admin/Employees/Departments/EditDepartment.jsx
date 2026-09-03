import { useEffect, useState } from "react";
import "./Department.css";

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
} from "@mui/material";

import { useAuth } from "../../../context/AuthContext";


function EditDepartment({
  open,
  department,
  handleClose,
  handleUpdate,
}) {

  // =====================================================
  // AUTH
  // =====================================================

  const {
    user,
    profile,
    employeeId,
    employeeCode,
    employeeName,
    isAuthenticated,
  } = useAuth();


  const currentEmployeeId =
    employeeId ??
    profile?.employeeId ??
    profile?.EmployeeId ??
    user?.employeeId ??
    user?.EmployeeId ??
    null;


  const currentEmployeeCode =
    employeeCode ??
    profile?.employeeCode ??
    profile?.EmployeeCode ??
    user?.employeeCode ??
    user?.EmployeeCode ??
    null;


  const currentEmployeeName =
    employeeName ??
    profile?.employeeName ??
    profile?.EmployeeName ??
    profile?.displayName ??
    profile?.DisplayName ??
    user?.employeeName ??
    user?.EmployeeName ??
    "Employee";


  // =====================================================
  // INITIAL STATE
  // =====================================================

  const initialState = {
    departmentName: "",
    description: "",
    status: "Active",
  };


  const [formData, setFormData] =
    useState(initialState);


  const [saving, setSaving] =
    useState(false);


  // =====================================================
  // LOAD SELECTED DEPARTMENT
  // =====================================================

  useEffect(() => {

    if (
      open &&
      department
    ) {

      setFormData({

        departmentName:
          department.departmentName ||
          "",

        description:
          department.description ||
          "",

        status:
          department.status ||
          "Active",

      });

    }


    if (!open) {

      setSaving(false);

    }

  }, [
    open,
    department,
  ]);


  // =====================================================
  // CHANGE
  // =====================================================

  const handleChange = (e) => {

    const {
      name,
      value,
    } = e.target;


    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

  };


  // =====================================================
  // UPDATE
  // =====================================================

  const update = async () => {

    if (!isAuthenticated) {

      alert(
        "You are not authenticated. Please login again."
      );

      return;

    }


    if (!currentEmployeeId) {

      alert(
        "Your Employee ID could not be determined."
      );

      return;

    }


    if (!department?.departmentId) {

      alert(
        "Department ID is missing."
      );

      return;

    }


    if (
      !formData.departmentName.trim()
    ) {

      alert(
        "Department Name is required."
      );

      return;

    }


    try {

      setSaving(true);


      console.log(
        "=========================================="
      );

      console.log(
        "UPDATE DEPARTMENT"
      );

      console.log(
        "DepartmentId:",
        department.departmentId
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


      /*
       * Do NOT send updatedBy.
       *
       * DepartmentService sends the JWT.
       *
       * Backend extracts the EmployeeId
       * from the JWT and records UpdatedBy.
       */

      await handleUpdate({

        departmentName:
          formData.departmentName.trim(),

        description:
          formData.description.trim(),

        status:
          formData.status,

      });


    } catch (error) {

      console.error(
        "Edit Department Error:",
        error
      );

      alert(
        error?.message ||
        "Unable to update Department."
      );

    } finally {

      setSaving(false);

    }

  };


  // =====================================================
  // CLOSE
  // =====================================================

  const closeDialog = () => {

    if (saving) {
      return;
    }


    setFormData(
      initialState
    );

    handleClose();

  };


  // =====================================================
  // UI
  // =====================================================

  return (

    <Dialog
      open={open}
      onClose={closeDialog}
      fullWidth
      maxWidth="md"
      className="employee-type-dialog"
    >


      <DialogTitle
        className="employee-type-dialog-title"
      >
        Edit Department
      </DialogTitle>


      <DialogContent
        className="employee-type-dialog-content"
      >


        {/* AUTHENTICATED USER */}

        <div
          style={{
            marginBottom: "20px",
            fontSize: "13px",
            opacity: 0.75,
          }}
        >

          Updating as:

          {" "}

          <strong>
            {currentEmployeeName}
          </strong>

          {" • Employee ID: "}

          <strong>
            {currentEmployeeId || "-"}
          </strong>

          {currentEmployeeCode && (
            <>
              {" • "}
              <strong>
                {currentEmployeeCode}
              </strong>
            </>
          )}

        </div>


        <Grid
          container
          spacing={3}
        >


          {/* DEPARTMENT */}

          <Grid
            size={{ xs: 12 }}
          >

            <div className="form-group">

              <Typography
                className="dialog-label"
              >
                Department{" "}
                <span>*</span>
              </Typography>


              <TextField
                fullWidth
                placeholder="Enter Department"
                name="departmentName"
                value={
                  formData.departmentName
                }
                onChange={
                  handleChange
                }
                className="dialog-input"
                disabled={saving}
              />

            </div>

          </Grid>


          {/* DESCRIPTION */}

          <Grid
            size={{
              xs: 12,
              md: 8,
            }}
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


          {/* STATUS */}

          <Grid
            size={{
              xs: 12,
              md: 4,
            }}
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
            !currentEmployeeId ||
            !department?.departmentId
          }
        >

          {saving
            ? "Updating..."
            : "Update Department"}

        </Button>

      </DialogActions>


    </Dialog>

  );

}


export default EditDepartment;