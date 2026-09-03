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


function AddDepartment({
  open,
  handleClose,
  handleSave,
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
  // RESET WHEN OPENED
  // =====================================================

  useEffect(() => {

    if (open) {

      setFormData(
        initialState
      );

      setSaving(false);

    }

  }, [open]);


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
  // SAVE
  // =====================================================

  const save = async () => {

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
        "ADD DEPARTMENT"
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
        "Department:",
        formData.departmentName
      );

      console.log(
        "=========================================="
      );


      /*
       * Do NOT send createdBy.
       *
       * DepartmentService sends the JWT.
       *
       * Backend must extract EmployeeId
       * from the authenticated JWT.
       */

      await handleSave({

        departmentName:
          formData.departmentName.trim(),

        description:
          formData.description.trim(),

        status:
          formData.status,

      });


      setFormData(
        initialState
      );


    } catch (error) {

      console.error(
        "Add Department Error:",
        error
      );

      alert(
        error?.message ||
        "Unable to create Department."
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
        Add Department
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

          Logged in as:

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
          onClick={save}
          className="save-btn"
          disabled={
            saving ||
            !isAuthenticated ||
            !currentEmployeeId
          }
        >

          {saving
            ? "Saving..."
            : "Save Department"}

        </Button>

      </DialogActions>

    </Dialog>

  );

}


export default AddDepartment;