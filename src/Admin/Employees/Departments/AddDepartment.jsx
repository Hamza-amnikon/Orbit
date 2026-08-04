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

function AddDepartment({ open, handleClose, handleSave }) {

    const initialState = {
        departmentName: "",
        description: "",
        status: "Active",
    };

    const [formData, setFormData] = useState(initialState);

    useEffect(() => {
        if (open) {
            setFormData(initialState);
        }
    }, [open]);

    const handleChange = (e) => {

        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const save = async () => {

        if (!formData.departmentName.trim()) {
            alert("Department Name is required.");
            return;
        }

        try {

            await handleSave({
                departmentName: formData.departmentName.trim(),
                description: formData.description.trim(),
                status: formData.status,
            });

            setFormData(initialState);

        } catch (error) {
            console.error(error);
        }
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
                Add Department
            </DialogTitle>

            <DialogContent className="employee-type-dialog-content">

                <Grid container spacing={3}>

                    <Grid size={{ xs: 12 }}>

                        <div className="form-group">

                            <Typography className="dialog-label">
                                Department <span>*</span>
                            </Typography>

                            <TextField
                                fullWidth
                                placeholder="Enter Department"
                                name="departmentName"
                                value={formData.departmentName}
                                onChange={handleChange}
                                className="dialog-input"
                            />

                        </div>

                    </Grid>

                    <Grid size={{ xs: 12, md: 8 }}>

                        <div className="form-group">

                            <Typography className="dialog-label">
                                Description
                            </Typography>

                            <TextField
                                fullWidth
                                multiline
                                rows={3}
                                placeholder="Enter Description"
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                className="dialog-input multiline"
                            />

                        </div>

                    </Grid>

                    <Grid size={{ xs: 12, md: 4 }}>

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
                    onClick={save}
                    className="save-btn"
                >
                    Save Department
                </Button>

            </DialogActions>

        </Dialog>
    );
}

export default AddDepartment;