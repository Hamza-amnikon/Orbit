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
import ReceiptLongRoundedIcon from "@mui/icons-material/ReceiptLongRounded";

import "./BillForm.css";

const BillForm = ({ onClose }) => {

    const handleSubmit = (event) => {
        event.preventDefault();
    };

    return (
        <Box
            component="form"
            className="bill-form"
            onSubmit={handleSubmit}
        >

            {/* Header */}
            <Box className="bill-form-header">

                <Box className="bill-form-title-section">
                    <Box className="bill-form-icon">
                        <ReceiptLongRoundedIcon />
                    </Box>

                    <Box>
                        <Typography className="bill-form-title">
                            New Bill
                        </Typography>

                        <Typography className="bill-form-subtitle">
                            Create a bill for a vendor
                        </Typography>
                    </Box>
                </Box>

                <IconButton
                    className="bill-form-close-button"
                    onClick={onClose}
                >
                    <CloseRoundedIcon />
                </IconButton>

            </Box>

            {/* Basic Information */}
            <Box className="bill-form-section">

                <Typography className="bill-form-section-title">
                    Bill Information
                </Typography>

                <Box className="bill-form-grid">

                    <TextField
                        select
                        fullWidth
                        label="Vendor"
                        defaultValue=""
                        size="small"
                    >
                        <MenuItem value="">
                            Select Vendor
                        </MenuItem>

                        <MenuItem value="abc">
                            ABC Suppliers
                        </MenuItem>

                        <MenuItem value="global">
                            Global Office Solutions
                        </MenuItem>

                        <MenuItem value="techworld">
                            TechWorld Solutions
                        </MenuItem>

                        <MenuItem value="bright">
                            Bright Office Supplies
                        </MenuItem>
                    </TextField>

                    <TextField
                        fullWidth
                        label="Bill Number"
                        defaultValue="BILL-005"
                        size="small"
                    />

                    <TextField
                        fullWidth
                        label="Bill Date"
                        type="date"
                        defaultValue="2026-10-06"
                        size="small"
                        InputLabelProps={{
                            shrink: true,
                        }}
                    />

                    <TextField
                        fullWidth
                        label="Due Date"
                        type="date"
                        defaultValue="2026-11-05"
                        size="small"
                        InputLabelProps={{
                            shrink: true,
                        }}
                    />

                    <TextField
                        fullWidth
                        label="Purchase Order"
                        defaultValue="PO-001"
                        size="small"
                    />

                    <TextField
                        fullWidth
                        label="Reference Number"
                        placeholder="Enter reference number"
                        size="small"
                    />

                    <TextField
                        select
                        fullWidth
                        label="Payment Terms"
                        defaultValue="Net 30"
                        size="small"
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

                    <TextField
                        select
                        fullWidth
                        label="Status"
                        defaultValue="Pending"
                        size="small"
                    >
                        <MenuItem value="Draft">
                            Draft
                        </MenuItem>

                        <MenuItem value="Pending">
                            Pending
                        </MenuItem>

                        <MenuItem value="Paid">
                            Paid
                        </MenuItem>

                        <MenuItem value="Overdue">
                            Overdue
                        </MenuItem>
                    </TextField>

                </Box>

            </Box>

            <Divider />

            {/* Item Details */}
            <Box className="bill-form-section">

                <Typography className="bill-form-section-title">
                    Item / Service Details
                </Typography>

                <Box className="bill-form-grid">

                    <TextField
                        fullWidth
                        label="Item / Service"
                        defaultValue="Office Laptops"
                        size="small"
                    />

                    <TextField
                        fullWidth
                        label="Quantity"
                        type="number"
                        defaultValue="10"
                        size="small"
                    />

                    <TextField
                        fullWidth
                        label="Rate"
                        defaultValue="50000"
                        size="small"
                    />

                    <TextField
                        select
                        fullWidth
                        label="Tax"
                        defaultValue="18"
                        size="small"
                    >
                        <MenuItem value="0">
                            0%
                        </MenuItem>

                        <MenuItem value="5">
                            5%
                        </MenuItem>

                        <MenuItem value="12">
                            12%
                        </MenuItem>

                        <MenuItem value="18">
                            18%
                        </MenuItem>

                        <MenuItem value="28">
                            28%
                        </MenuItem>
                    </TextField>

                    <TextField
                        fullWidth
                        label="Discount"
                        defaultValue="0"
                        size="small"
                    />

                    <TextField
                        select
                        fullWidth
                        label="Unit"
                        defaultValue="Nos"
                        size="small"
                    >
                        <MenuItem value="Nos">
                            Nos
                        </MenuItem>

                        <MenuItem value="Hours">
                            Hours
                        </MenuItem>

                        <MenuItem value="Days">
                            Days
                        </MenuItem>

                        <MenuItem value="Kg">
                            Kg
                        </MenuItem>
                    </TextField>

                    <TextField
                        fullWidth
                        multiline
                        rows={3}
                        label="Description"
                        placeholder="Enter item or service description"
                        className="bill-form-full-width"
                    />

                </Box>

            </Box>

            <Divider />

            {/* Address */}
            <Box className="bill-form-section">

                <Typography className="bill-form-section-title">
                    Billing & Shipping Address
                </Typography>

                <Box className="bill-form-grid">

                    <TextField
                        fullWidth
                        multiline
                        rows={3}
                        label="Billing Address"
                        defaultValue="12 Business Park, Andheri East, Mumbai, Maharashtra - 400069"
                    />

                    <TextField
                        fullWidth
                        multiline
                        rows={3}
                        label="Shipping Address"
                        defaultValue="12 Business Park, Andheri East, Mumbai, Maharashtra - 400069"
                    />

                </Box>

            </Box>

            <Divider />

            {/* Notes */}
            <Box className="bill-form-section">

                <Typography className="bill-form-section-title">
                    Additional Information
                </Typography>

                <Box className="bill-form-grid">

                    <TextField
                        fullWidth
                        multiline
                        rows={3}
                        label="Notes"
                        placeholder="Enter notes"
                    />

                    <TextField
                        fullWidth
                        multiline
                        rows={3}
                        label="Terms & Conditions"
                        placeholder="Enter terms and conditions"
                    />

                </Box>

            </Box>

            <Divider />

            {/* Summary */}
            <Box className="bill-form-summary">

                <Box className="bill-summary-line">
                    <Typography>
                        Sub Total
                    </Typography>

                    <Typography>
                        ₹5,00,000
                    </Typography>
                </Box>

                <Box className="bill-summary-line">
                    <Typography>
                        Discount
                    </Typography>

                    <Typography>
                        ₹0
                    </Typography>
                </Box>

                <Box className="bill-summary-line">
                    <Typography>
                        Tax
                    </Typography>

                    <Typography>
                        ₹90,000
                    </Typography>
                </Box>

                <Divider />

                <Box className="bill-summary-total">
                    <Typography>
                        Total
                    </Typography>

                    <Typography>
                        ₹5,90,000
                    </Typography>
                </Box>

            </Box>

            {/* Footer */}
            <Box className="bill-form-footer">

                <Button
                    variant="outlined"
                    className="bill-form-cancel-button"
                    onClick={onClose}
                >
                    Cancel
                </Button>

                <Button
                    type="submit"
                    variant="contained"
                    startIcon={<SaveRoundedIcon />}
                    className="bill-form-save-button"
                >
                    Save Bill
                </Button>

            </Box>

        </Box>
    );
};

export default BillForm;