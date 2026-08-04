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
} from "@mui/material";

function EditDesignation({
  open,
  designation,
  handleClose,
  handleUpdate,
}) {
  const initialState = {
    designationId: 0,
    designationName: "",
    description: "",
    status: "Active",
  };

  const [formData, setFormData] = useState(initialState);

  useEffect(() => {
    if (open && designation) {

      console.log("Designation received:", designation);

      setFormData({
        designationId: designation.designationId,
        designationName: designation.designationName || "",
        description: designation.description || "",
        status: designation.status || "Active",
      });
    }
  }, [open, designation]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const update = async () => {
    if (!formData.designationName.trim()) {
      alert("Designation Name is required.");
      return;
    }

    console.log("Updating:", formData);

    await handleUpdate(formData);
  };

  const closeDialog = () => {
    setFormData(initialState);
    handleClose();
  };

  return (
    <Dialog
      open={open}
      onClose={closeDialog}
      fullWidth
      maxWidth="md"
      className="employee-type-dialog"
    >
      <DialogTitle className="employee-type-dialog-title">
        Edit Designation
      </DialogTitle>

      <DialogContent className="employee-type-dialog-content">
        <Grid container spacing={3}>

          <Grid size={{ xs: 12 }}>
            <div className="form-group">
              <Typography className="dialog-label">
                Designation <span>*</span>
              </Typography>

              <TextField
                fullWidth
                name="designationName"
                value={formData.designationName}
                onChange={handleChange}
                className="dialog-input"
              />
            </div>
          </Grid>

          <Grid size={{ xs: 12 }}>
            <div className="form-group">
              <Typography className="dialog-label">
                Description
              </Typography>

              <TextField
                fullWidth
                multiline
                rows={3}
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="dialog-input multiline"
              />
            </div>
          </Grid>

          <Grid size={{ xs: 12 }}>
            <div className="form-group">
              <Typography className="dialog-label">
                Status
              </Typography>

              <TextField
                select
                fullWidth
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="dialog-input"
              >
                <MenuItem value="Active">Active</MenuItem>
                <MenuItem value="Inactive">Inactive</MenuItem>
              </TextField>
            </div>
          </Grid>

        </Grid>
      </DialogContent>

      <DialogActions className="employee-type-dialog-actions">
        <Button
          variant="outlined"
          onClick={closeDialog}
          className="cancel-btn"
        >
          Cancel
        </Button>

        <Button
          variant="contained"
          onClick={update}
          className="save-btn"
        >
          Update Designation
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default EditDesignation;