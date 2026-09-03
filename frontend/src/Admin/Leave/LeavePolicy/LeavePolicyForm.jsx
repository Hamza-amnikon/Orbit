import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Box,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Checkbox,
    FormControlLabel,
    Button,
    Typography,
    Divider,
    IconButton,
} from "@mui/material";

import CloseIcon from "@mui/icons-material/Close";

import "./LeavePolicyForm.css";


export default function LeavePolicyForm({
    formData,
    setFormData,
    leaveTypes,
    editingPolicy,
    onSubmit,
    onCancel,
}) {

    const handleChange = (e) => {
        const {
            name,
            value,
            type,
            checked,
        } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
    };


    return (
        <Dialog
            open={true}
            onClose={onCancel}
            fullWidth
            maxWidth="lg"
            className="leave-policy-dialog"
        >

            {/* =========================================================
                HEADER
            ========================================================= */}

            <DialogTitle className="policy-dialog-title">

                <Box>

                    <Typography
                        component="h2"
                        className="policy-dialog-heading"
                    >
                        {editingPolicy
                            ? "Edit Leave Policy"
                            : "Add Leave Policy"}
                    </Typography>

                    <Typography
                        component="p"
                        className="policy-dialog-description"
                    >
                        {editingPolicy
                            ? "Update the selected leave policy rules."
                            : "Configure entitlement, accrual and leave rules."}
                    </Typography>

                </Box>


                <IconButton
                    type="button"
                    className="policy-dialog-close"
                    onClick={onCancel}
                    aria-label="Close"
                >
                    <CloseIcon />
                </IconButton>

            </DialogTitle>


            <Divider />


            {/* =========================================================
                FORM
            ========================================================= */}

            <form onSubmit={onSubmit}>

                <DialogContent className="policy-dialog-content">


                    {/* =================================================
                        BASIC POLICY
                    ================================================= */}

                    <Box className="policy-form-section">

                        <Typography
                            component="h3"
                            className="policy-section-title"
                        >
                            Basic Policy
                        </Typography>

                        <Divider className="policy-section-divider" />


                        <Box className="policy-form-grid">

                            {/* Leave Type */}

                            <FormControl
                                fullWidth
                                required
                                className="policy-form-control"
                            >

                                <InputLabel>
                                    Leave Type
                                </InputLabel>

                                <Select
                                    name="leaveTypeId"
                                    value={formData.leaveTypeId}
                                    onChange={handleChange}
                                    label="Leave Type"
                                >

                                    <MenuItem value="">
                                        Select Leave Type
                                    </MenuItem>

                                    {leaveTypes.map((type) => (
                                        <MenuItem
                                            key={type.leaveTypeId}
                                            value={type.leaveTypeId}
                                        >
                                            {type.leaveTypeName}
                                        </MenuItem>
                                    ))}

                                </Select>

                            </FormControl>


                            {/* Annual Entitlement */}

                            <TextField
                                fullWidth
                                required
                                type="number"
                                label="Annual Entitlement"
                                name="annualEntitlement"
                                value={formData.annualEntitlement}
                                onChange={handleChange}
                                inputProps={{
                                    min: 1,
                                }}
                                placeholder="e.g. 12"
                                className="policy-form-control"
                            />


                            {/* Accrual Type */}

                            <FormControl
                                fullWidth
                                required
                                className="policy-form-control"
                            >

                                <InputLabel>
                                    Accrual Type
                                </InputLabel>

                                <Select
                                    name="accrualType"
                                    value={formData.accrualType}
                                    onChange={handleChange}
                                    label="Accrual Type"
                                >

                                    <MenuItem value="Monthly">
                                        Monthly
                                    </MenuItem>

                                    <MenuItem value="Yearly">
                                        Yearly
                                    </MenuItem>

                                    <MenuItem value="Event Based">
                                        Event Based
                                    </MenuItem>

                                    <MenuItem value="None">
                                        None
                                    </MenuItem>

                                </Select>

                            </FormControl>


                            {/* Effective From */}
                            <TextField
                                fullWidth
                                required
                                type="date"
                                label="Effective From"
                                name="effectiveFrom"
                                value={formData.effectiveFrom}
                                onChange={handleChange}
                                InputLabelProps={{
                                    shrink: true,
                                }}
                                slotProps={{
                                    inputLabel: {
                                        shrink: true,
                                    },
                                }}
                                className="policy-form-control"
                            />


                            {/* Effective To */}
                            <TextField
                                fullWidth
                                required
                                type="date"
                                label="Effective To"
                                name="effectiveTo"
                                value={formData.effectiveTo}
                                onChange={handleChange}
                                InputLabelProps={{
                                    shrink: true,
                                }}
                                slotProps={{
                                    inputLabel: {
                                        shrink: true,
                                    },
                                }}
                                className="policy-form-control"
                            />

                            {/* Status */}

                            <FormControl
                                fullWidth
                                className="policy-form-control"
                            >

                                <InputLabel>
                                    Status
                                </InputLabel>

                                <Select
                                    name="status"
                                    value={formData.status}
                                    onChange={handleChange}
                                    label="Status"
                                >

                                    <MenuItem value="Active">
                                        Active
                                    </MenuItem>

                                    <MenuItem value="Inactive">
                                        Inactive
                                    </MenuItem>

                                </Select>

                            </FormControl>

                        </Box>

                    </Box>


                    {/* =================================================
                        LEAVE RULES
                    ================================================= */}

                    <Box className="policy-form-section">

                        <Typography
                            component="h3"
                            className="policy-section-title"
                        >
                            Leave Rules
                        </Typography>

                        <Divider className="policy-section-divider" />


                        <Box className="policy-checkbox-grid">

                            {/* Paid Leave */}

                            <FormControlLabel
                                className="policy-checkbox-item"
                                control={
                                    <Checkbox
                                        name="isPaid"
                                        checked={formData.isPaid}
                                        onChange={handleChange}
                                    />
                                }
                                label="Paid Leave"
                            />


                            {/* Prorate for New Joiners */}

                            <FormControlLabel
                                className="policy-checkbox-item"
                                control={
                                    <Checkbox
                                        name="prorateForNewJoiners"
                                        checked={
                                            formData.prorateForNewJoiners
                                        }
                                        onChange={handleChange}
                                    />
                                }
                                label="Prorate for New Joiners"
                            />


                            {/* Allow Half Day */}

                            <FormControlLabel
                                className="policy-checkbox-item"
                                control={
                                    <Checkbox
                                        name="allowHalfDay"
                                        checked={formData.allowHalfDay}
                                        onChange={handleChange}
                                    />
                                }
                                label="Allow Half Day"
                            />


                            {/* Allow Carry Forward */}

                            <FormControlLabel
                                className="policy-checkbox-item"
                                control={
                                    <Checkbox
                                        name="allowCarryForward"
                                        checked={
                                            formData.allowCarryForward
                                        }
                                        onChange={handleChange}
                                    />
                                }
                                label="Allow Carry Forward"
                            />

                        </Box>


                        {/* Conditional Carry Forward Field */}

                        <Box className="policy-form-grid">

                            {formData.allowCarryForward && (

                                <TextField
                                    fullWidth
                                    type="number"
                                    label="Max Carry Forward Days"
                                    name="maxCarryForwardDays"
                                    value={
                                        formData.maxCarryForwardDays
                                    }
                                    onChange={handleChange}
                                    inputProps={{
                                        min: 0,
                                    }}
                                    className="policy-form-control"
                                />

                            )}


                            {/* Max Consecutive Days */}

                            <TextField
                                fullWidth
                                type="number"
                                label="Max Consecutive Days"
                                name="maxConsecutiveDays"
                                value={
                                    formData.maxConsecutiveDays
                                }
                                onChange={handleChange}
                                inputProps={{
                                    min: 1,
                                }}
                                className="policy-form-control"
                            />


                            {/* Minimum Notice Days */}

                            <TextField
                                fullWidth
                                type="number"
                                label="Minimum Notice Days"
                                name="minNoticeDays"
                                value={formData.minNoticeDays}
                                onChange={handleChange}
                                inputProps={{
                                    min: 0,
                                }}
                                className="policy-form-control"
                            />

                        </Box>

                    </Box>


                    {/* =================================================
                        APPROVAL & DOCUMENTS
                    ================================================= */}

                    <Box className="policy-form-section">

                        <Typography
                            component="h3"
                            className="policy-section-title"
                        >
                            Approval & Documents
                        </Typography>

                        <Divider className="policy-section-divider" />


                        <Box className="policy-checkbox-grid">

                            {/* Approval Required */}

                            <FormControlLabel
                                className="policy-checkbox-item"
                                control={
                                    <Checkbox
                                        name="requiresApproval"
                                        checked={
                                            formData.requiresApproval
                                        }
                                        onChange={handleChange}
                                    />
                                }
                                label="Approval Required"
                            />


                            {/* Document Required */}

                            <FormControlLabel
                                className="policy-checkbox-item"
                                control={
                                    <Checkbox
                                        name="requiresDocument"
                                        checked={
                                            formData.requiresDocument
                                        }
                                        onChange={handleChange}
                                    />
                                }
                                label="Document Required"
                            />

                        </Box>


                        {/* Conditional Document Field */}

                        {formData.requiresDocument && (

                            <Box className="policy-form-grid">

                                <TextField
                                    fullWidth
                                    type="number"
                                    label="Document Required After Days"
                                    name="documentAfterDays"
                                    value={
                                        formData.documentAfterDays
                                    }
                                    onChange={handleChange}
                                    inputProps={{
                                        min: 0,
                                    }}
                                    className="policy-form-control"
                                />

                            </Box>

                        )}

                    </Box>

                </DialogContent>


                {/* =========================================================
                    FORM BUTTONS
                ========================================================= */}

                <DialogActions className="policy-dialog-actions">

                    <Button
                        type="button"
                        className="policy-cancel-btn"
                        onClick={onCancel}
                    >
                        Cancel
                    </Button>


                    <Button
                        type="submit"
                        variant="contained"
                        className="policy-save-btn"
                    >
                        {editingPolicy
                            ? "Update Policy"
                            : "Save Policy"}
                    </Button>

                </DialogActions>

            </form>

        </Dialog>
    );
}