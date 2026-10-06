import React from "react";
import {
    Box,
    Button,
    MenuItem,
    TextField,
    Typography,
} from "@mui/material";

import CloseRoundedIcon from "@mui/icons-material/CloseRounded";

import "./VendorCreditForm.css";

const VendorCreditForm = ({ onCancel }) => {
    const handleSubmit = (event) => {
        event.preventDefault();
    };

    return (
        <Box className="vendor-credit-form-page">

            <Box className="vendor-credit-form-header">
                <Box>
                    <Typography className="vendor-credit-form-title">
                        New Vendor Credit
                    </Typography>

                    <Typography className="vendor-credit-form-subtitle">
                        Create a credit against a vendor bill
                    </Typography>
                </Box>

                <Button
                    className="vendor-credit-form-close"
                    onClick={onCancel}
                >
                    <CloseRoundedIcon />
                </Button>
            </Box>

            <form onSubmit={handleSubmit}>

                {/* Basic Information */}

                <Box className="vendor-credit-form-section">

                    <Typography className="vendor-credit-section-title">
                        Basic Information
                    </Typography>

                    <Box className="vendor-credit-form-grid">

                        <TextField
                            select
                            label="Vendor"
                            defaultValue="ABC Suppliers"
                            fullWidth
                        >
                            <MenuItem value="ABC Suppliers">
                                ABC Suppliers
                            </MenuItem>

                            <MenuItem value="Global Office Solutions">
                                Global Office Solutions
                            </MenuItem>

                            <MenuItem value="TechWorld Solutions">
                                TechWorld Solutions
                            </MenuItem>

                            <MenuItem value="Bright Office Supplies">
                                Bright Office Supplies
                            </MenuItem>
                        </TextField>

                        <TextField
                            label="Vendor Credit Number"
                            defaultValue="VC-005"
                            fullWidth
                        />

                        <TextField
                            label="Credit Date"
                            type="date"
                            defaultValue="2026-10-06"
                            InputLabelProps={{ shrink: true }}
                            fullWidth
                        />

                        <TextField
                            label="Reference Number"
                            defaultValue="REF-005"
                            fullWidth
                        />

                        <TextField
                            label="Bill Number"
                            defaultValue="BILL-001"
                            fullWidth
                        />

                        <TextField
                            select
                            label="Status"
                            defaultValue="Draft"
                            fullWidth
                        >
                            <MenuItem value="Draft">Draft</MenuItem>
                            <MenuItem value="Issued">Issued</MenuItem>
                            <MenuItem value="Applied">Applied</MenuItem>
                            <MenuItem value="Refunded">Refunded</MenuItem>
                        </TextField>

                    </Box>
                </Box>

                {/* Credit Reason */}

                <Box className="vendor-credit-form-section">

                    <Typography className="vendor-credit-section-title">
                        Credit Information
                    </Typography>

                    <Box className="vendor-credit-form-grid">

                        <TextField
                            label="Reason"
                            placeholder="Enter reason for vendor credit"
                            fullWidth
                        />

                        <TextField
                            select
                            label="Credit Type"
                            defaultValue="Return"
                            fullWidth
                        >
                            <MenuItem value="Return">
                                Purchase Return
                            </MenuItem>

                            <MenuItem value="Price Adjustment">
                                Price Adjustment
                            </MenuItem>

                            <MenuItem value="Overpayment">
                                Overpayment
                            </MenuItem>

                            <MenuItem value="Other">
                                Other
                            </MenuItem>
                        </TextField>

                    </Box>
                </Box>

                {/* Item Information */}

                <Box className="vendor-credit-form-section">

                    <Typography className="vendor-credit-section-title">
                        Item / Service
                    </Typography>

                    <Box className="vendor-credit-form-grid">

                        <TextField
                            label="Item / Service"
                            defaultValue="Office Laptops"
                            fullWidth
                        />

                        <TextField
                            label="Quantity"
                            type="number"
                            defaultValue="10"
                            fullWidth
                        />

                        <TextField
                            label="Rate"
                            defaultValue="50000"
                            fullWidth
                        />

                        <TextField
                            select
                            label="Tax"
                            defaultValue="18%"
                            fullWidth
                        >
                            <MenuItem value="0%">0%</MenuItem>
                            <MenuItem value="5%">5%</MenuItem>
                            <MenuItem value="12%">12%</MenuItem>
                            <MenuItem value="18%">18%</MenuItem>
                        </TextField>

                        <TextField
                            label="Discount"
                            defaultValue="0"
                            fullWidth
                        />

                        <TextField
                            label="Unit"
                            defaultValue="Nos"
                            fullWidth
                        />

                    </Box>

                    <TextField
                        label="Description"
                        defaultValue="Credit issued for returned office laptops"
                        multiline
                        rows={3}
                        fullWidth
                        className="vendor-credit-description"
                    />

                </Box>

                {/* Addresses */}

                <Box className="vendor-credit-form-section">

                    <Typography className="vendor-credit-section-title">
                        Address Information
                    </Typography>

                    <Box className="vendor-credit-address-grid">

                        <TextField
                            label="Billing Address"
                            defaultValue="ABC Suppliers, Andheri East, Mumbai, Maharashtra - 400069"
                            multiline
                            rows={4}
                            fullWidth
                        />

                        <TextField
                            label="Shipping Address"
                            defaultValue="ABC Suppliers, Andheri East, Mumbai, Maharashtra - 400069"
                            multiline
                            rows={4}
                            fullWidth
                        />

                    </Box>

                </Box>

                {/* Notes */}

                <Box className="vendor-credit-form-section">

                    <Typography className="vendor-credit-section-title">
                        Additional Information
                    </Typography>

                    <TextField
                        label="Notes"
                        placeholder="Enter additional notes"
                        multiline
                        rows={3}
                        fullWidth
                        className="vendor-credit-full-field"
                    />

                    <TextField
                        label="Terms & Conditions"
                        placeholder="Enter terms and conditions"
                        multiline
                        rows={3}
                        fullWidth
                        className="vendor-credit-full-field"
                    />

                </Box>

                {/* Summary */}

                <Box className="vendor-credit-summary-section">

                    <Typography className="vendor-credit-section-title">
                        Summary
                    </Typography>

                    <Box className="vendor-credit-summary-row">
                        <Typography>Sub Total</Typography>
                        <Typography>₹5,00,000</Typography>
                    </Box>

                    <Box className="vendor-credit-summary-row">
                        <Typography>Discount</Typography>
                        <Typography>₹0</Typography>
                    </Box>

                    <Box className="vendor-credit-summary-row">
                        <Typography>Tax</Typography>
                        <Typography>₹90,000</Typography>
                    </Box>

                    <Box className="vendor-credit-summary-total">
                        <Typography>Total Credit</Typography>
                        <Typography>₹5,90,000</Typography>
                    </Box>

                </Box>

                {/* Footer */}

                <Box className="vendor-credit-form-footer">

                    <Button
                        variant="outlined"
                        onClick={onCancel}
                        className="vendor-credit-cancel-button"
                    >
                        Cancel
                    </Button>

                    <Button
                        type="submit"
                        variant="contained"
                        className="vendor-credit-save-button"
                    >
                        Save Vendor Credit
                    </Button>

                </Box>

            </form>

        </Box>
    );
};

export default VendorCreditForm;