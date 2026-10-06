import React from "react";
import {
    Box,
    Button,
    Card,
    CardContent,
    MenuItem,
    TextField,
    Typography,
} from "@mui/material";

import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import SaveRoundedIcon from "@mui/icons-material/SaveRounded";

import "./EstimateForm.css";

const EstimateForm = ({ onClose }) => {
    const handleSubmit = (event) => {
        event.preventDefault();
    };

    return (
        <Box className="estimate-form-page">

            <Box className="estimate-form-container">

                <Card className="estimate-form-card">

                    {/* Header */}
                    <Box className="estimate-form-header">

                        <Box>
                            <Typography className="estimate-form-title">
                                New Estimate
                            </Typography>

                            <Typography className="estimate-form-subtitle">
                                Create an estimate for your customer
                            </Typography>
                        </Box>

                        <Button
                            className="estimate-close-button"
                            onClick={onClose}
                        >
                            <CloseRoundedIcon />
                        </Button>

                    </Box>

                    <CardContent>

                        <Box
                            component="form"
                            onSubmit={handleSubmit}
                            className="estimate-form"
                        >

                            {/* ============================= */}
                            {/* Estimate Information */}
                            {/* ============================= */}

                            <Box className="estimate-form-section">

                                <Typography className="estimate-section-title">
                                    Estimate Information
                                </Typography>

                                <Box className="estimate-form-row">

                                    <TextField
                                        select
                                        label="Customer"
                                        defaultValue=""
                                        required
                                        fullWidth
                                    >
                                        <MenuItem value="" disabled>
                                            Select Customer
                                        </MenuItem>

                                        <MenuItem value="abc">
                                            ABC Technologies
                                        </MenuItem>

                                        <MenuItem value="global">
                                            Global Solutions
                                        </MenuItem>

                                        <MenuItem value="technova">
                                            TechNova Pvt Ltd
                                        </MenuItem>

                                        <MenuItem value="bright">
                                            Bright Enterprises
                                        </MenuItem>
                                    </TextField>

                                    <TextField
                                        label="Estimate Number"
                                        defaultValue="EST-005"
                                        fullWidth
                                    />

                                </Box>


                                <Box className="estimate-form-row">

                                    <TextField
                                        label="Estimate Date"
                                        type="date"
                                        defaultValue="2026-10-05"
                                        InputLabelProps={{
                                            shrink: true,
                                        }}
                                        required
                                        fullWidth
                                    />

                                    <TextField
                                        label="Expiry Date"
                                        type="date"
                                        defaultValue="2026-11-04"
                                        InputLabelProps={{
                                            shrink: true,
                                        }}
                                        required
                                        fullWidth
                                    />

                                </Box>


                                <Box className="estimate-form-row">

                                    <TextField
                                        label="Reference"
                                        placeholder="Enter reference"
                                        fullWidth
                                    />

                                    <TextField
                                        label="Item / Service"
                                        placeholder="Enter item or service"
                                        required
                                        fullWidth
                                    />

                                </Box>

                            </Box>


                            {/* ============================= */}
                            {/* Description */}
                            {/* ============================= */}

                            <Box className="estimate-form-section">

                                <Typography className="estimate-section-title">
                                    Item / Service Details
                                </Typography>

                                <TextField
                                    label="Description"
                                    placeholder="Enter description of the item or service"
                                    multiline
                                    rows={4}
                                    fullWidth
                                />

                            </Box>


                            {/* ============================= */}
                            {/* Pricing */}
                            {/* ============================= */}

                            <Box className="estimate-form-section">

                                <Typography className="estimate-section-title">
                                    Pricing
                                </Typography>

                                <Box className="estimate-form-row">

                                    <TextField
                                        label="Quantity"
                                        type="number"
                                        defaultValue="1"
                                        inputProps={{
                                            min: 1,
                                        }}
                                        required
                                        fullWidth
                                    />

                                    <TextField
                                        label="Rate"
                                        type="number"
                                        placeholder="0.00"
                                        required
                                        fullWidth
                                    />

                                </Box>

                                <Box className="estimate-form-row estimate-tax-row">

                                    <TextField
                                        select
                                        label="Tax"
                                        defaultValue="18"
                                        fullWidth
                                    >
                                        <MenuItem value="0">
                                            No Tax
                                        </MenuItem>

                                        <MenuItem value="5">
                                            GST 5%
                                        </MenuItem>

                                        <MenuItem value="12">
                                            GST 12%
                                        </MenuItem>

                                        <MenuItem value="18">
                                            GST 18%
                                        </MenuItem>

                                        <MenuItem value="28">
                                            GST 28%
                                        </MenuItem>
                                    </TextField>

                                    <Box />

                                </Box>

                            </Box>


                            {/* ============================= */}
                            {/* Additional Information */}
                            {/* ============================= */}

                            <Box className="estimate-form-section">

                                <Typography className="estimate-section-title">
                                    Additional Information
                                </Typography>

                                <TextField
                                    label="Notes"
                                    placeholder="Enter notes for the customer"
                                    multiline
                                    rows={3}
                                    fullWidth
                                />

                                <TextField
                                    label="Terms & Conditions"
                                    placeholder="Enter terms and conditions"
                                    multiline
                                    rows={3}
                                    fullWidth
                                />

                            </Box>


                            {/* ============================= */}
                            {/* Summary */}
                            {/* ============================= */}

                            <Box className="estimate-total-section">

                                <Box className="estimate-total-row">

                                    <Typography>
                                        Subtotal
                                    </Typography>

                                    <Typography>
                                        ₹0.00
                                    </Typography>

                                </Box>


                                <Box className="estimate-total-row">

                                    <Typography>
                                        Tax
                                    </Typography>

                                    <Typography>
                                        ₹0.00
                                    </Typography>

                                </Box>


                                <Box className="estimate-grand-total">

                                    <Typography className="estimate-grand-total-label">
                                        Grand Total
                                    </Typography>

                                    <Typography className="estimate-grand-total-value">
                                        ₹0.00
                                    </Typography>

                                </Box>

                            </Box>


                            {/* ============================= */}
                            {/* Actions */}
                            {/* ============================= */}

                            <Box className="estimate-form-actions">

                                <Button
                                    variant="outlined"
                                    className="estimate-cancel-button"
                                    onClick={onClose}
                                >
                                    Cancel
                                </Button>

                                <Button
                                    type="submit"
                                    variant="contained"
                                    startIcon={<SaveRoundedIcon />}
                                    className="save-estimate-button"
                                >
                                    Save Estimate
                                </Button>

                            </Box>

                        </Box>

                    </CardContent>

                </Card>

            </Box>

        </Box>
    );
};

export default EstimateForm;