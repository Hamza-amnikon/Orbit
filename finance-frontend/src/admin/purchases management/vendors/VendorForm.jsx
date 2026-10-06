import React from "react";

import {
    Box,
    Button,
    Divider,
    IconButton,
    MenuItem,
    TextField,
    Typography,
} from "@mui/material";

import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import SaveRoundedIcon from "@mui/icons-material/SaveRounded";
import StoreRoundedIcon from "@mui/icons-material/StoreRounded";

import "./VendorForm.css";

const VendorForm = ({ onClose }) => {

    const handleSubmit = (event) => {
        event.preventDefault();
    };

    return (
        <Box
            component="form"
            className="vendor-form"
            onSubmit={handleSubmit}
        >

            {/* =========================================
                FORM HEADER
            ========================================= */}
            <Box className="vendor-form-header">

                <Box className="vendor-form-header-left">

                    <Box className="vendor-form-header-icon">
                        <StoreRoundedIcon />
                    </Box>

                    <Box>
                        <Typography className="vendor-form-title">
                            New Vendor
                        </Typography>

                        <Typography className="vendor-form-subtitle">
                            Add a new supplier or vendor
                        </Typography>
                    </Box>

                </Box>

                <IconButton
                    className="vendor-form-close-button"
                    onClick={onClose}
                >
                    <CloseRoundedIcon />
                </IconButton>

            </Box>

            {/* =========================================
                FORM BODY
            ========================================= */}
            <Box className="vendor-form-body">

                {/* =========================================
                    BASIC INFORMATION
                ========================================= */}
                <Typography className="vendor-form-section-title">
                    Basic Information
                </Typography>

                <Box className="vendor-form-grid">

                    <TextField
                        label="Vendor Code"
                        placeholder="VEN-005"
                        fullWidth
                    />

                    <TextField
                        label="Vendor Name"
                        placeholder="Enter vendor name"
                        fullWidth
                        required
                    />

                    <TextField
                        label="Contact Person"
                        placeholder="Enter contact person"
                        fullWidth
                    />

                    <TextField
                        label="Email"
                        type="email"
                        placeholder="vendor@example.com"
                        fullWidth
                    />

                    <TextField
                        label="Phone"
                        placeholder="Enter phone number"
                        fullWidth
                    />

                    <TextField
                        label="Vendor Type"
                        select
                        defaultValue="Supplier"
                        fullWidth
                    >
                        <MenuItem value="Supplier">
                            Supplier
                        </MenuItem>

                        <MenuItem value="Service Provider">
                            Service Provider
                        </MenuItem>

                        <MenuItem value="Contractor">
                            Contractor
                        </MenuItem>

                        <MenuItem value="Other">
                            Other
                        </MenuItem>
                    </TextField>

                </Box>

                <Divider className="vendor-form-divider" />

                {/* =========================================
                    TAX & BANKING
                ========================================= */}
                <Typography className="vendor-form-section-title">
                    Tax & Banking
                </Typography>

                <Box className="vendor-form-grid">

                    <TextField
                        label="GSTIN"
                        placeholder="Enter GSTIN"
                        fullWidth
                    />

                    <TextField
                        label="PAN"
                        placeholder="Enter PAN"
                        fullWidth
                    />

                    <TextField
                        label="Bank Name"
                        placeholder="Enter bank name"
                        fullWidth
                    />

                    <TextField
                        label="Account Number"
                        placeholder="Enter account number"
                        fullWidth
                    />

                    <TextField
                        label="IFSC Code"
                        placeholder="Enter IFSC code"
                        fullWidth
                    />

                    <TextField
                        label="Payment Terms"
                        select
                        defaultValue="Net 30"
                        fullWidth
                    >
                        <MenuItem value="Due on Receipt">
                            Due on Receipt
                        </MenuItem>

                        <MenuItem value="Net 15">
                            Net 15
                        </MenuItem>

                        <MenuItem value="Net 30">
                            Net 30
                        </MenuItem>

                        <MenuItem value="Net 45">
                            Net 45
                        </MenuItem>

                        <MenuItem value="Net 60">
                            Net 60
                        </MenuItem>
                    </TextField>

                </Box>

                <Divider className="vendor-form-divider" />

                {/* =========================================
                    ADDRESS
                ========================================= */}
                <Typography className="vendor-form-section-title">
                    Address
                </Typography>

                <Box className="vendor-form-grid">

                    <TextField
                        label="Address"
                        placeholder="Enter address"
                        fullWidth
                        multiline
                        rows={2}
                        sx={{ gridColumn: "1 / -1" }}
                    />

                    <TextField
                        label="City"
                        placeholder="Enter city"
                        fullWidth
                    />

                    <TextField
                        label="State"
                        placeholder="Enter state"
                        fullWidth
                    />

                    <TextField
                        label="Postal Code"
                        placeholder="Enter postal code"
                        fullWidth
                    />

                    <TextField
                        label="Country"
                        defaultValue="India"
                        fullWidth
                    />

                </Box>

                <Divider className="vendor-form-divider" />

                {/* =========================================
                    NOTES
                ========================================= */}
                <Typography className="vendor-form-section-title">
                    Additional Information
                </Typography>

                <TextField
                    label="Notes"
                    placeholder="Enter any additional notes"
                    fullWidth
                    multiline
                    rows={3}
                />

            </Box>

            {/* =========================================
                FORM FOOTER
            ========================================= */}
            <Box className="vendor-form-footer">

                <Button
                    variant="outlined"
                    className="vendor-form-cancel-button"
                    onClick={onClose}
                >
                    Cancel
                </Button>

                <Button
                    type="submit"
                    variant="contained"
                    startIcon={<SaveRoundedIcon />}
                    className="vendor-form-save-button"
                >
                    Save Vendor
                </Button>

            </Box>

        </Box>
    );
};

export default VendorForm;