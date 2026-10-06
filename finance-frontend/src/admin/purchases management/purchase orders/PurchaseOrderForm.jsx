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
import ShoppingCartRoundedIcon from "@mui/icons-material/ShoppingCartRounded";

import "./PurchaseOrderForm.css";

const PurchaseOrderForm = ({ onClose }) => {
    const handleSubmit = (event) => {
        event.preventDefault();
    };

    return (
        <Box
            component="form"
            className="purchase-order-form"
            onSubmit={handleSubmit}
        >
            {/* Header */}
            <Box className="purchase-order-form-header">
                <Box className="purchase-order-form-heading">
                    <Box className="purchase-order-form-icon">
                        <ShoppingCartRoundedIcon />
                    </Box>

                    <Box>
                        <Typography className="purchase-order-form-title">
                            New Purchase Order
                        </Typography>

                        <Typography className="purchase-order-form-subtitle">
                            Create a purchase order for your vendor
                        </Typography>
                    </Box>
                </Box>

                <IconButton
                    className="purchase-order-form-close"
                    onClick={onClose}
                >
                    <CloseRoundedIcon />
                </IconButton>
            </Box>

            {/* Form Body */}
            <Box className="purchase-order-form-body">

                {/* Basic Information */}
                <Typography className="purchase-order-form-section-title">
                    Basic Information
                </Typography>

                <Box className="purchase-order-form-grid">

                    <TextField
                        label="Vendor"
                        select
                        fullWidth
                        defaultValue=""
                        required
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
                        label="Purchase Order Number"
                        fullWidth
                        defaultValue="PO-005"
                        required
                    />

                    <TextField
                        label="Order Date"
                        type="date"
                        fullWidth
                        defaultValue="2026-10-06"
                        InputLabelProps={{
                            shrink: true,
                        }}
                        required
                    />

                    <TextField
                        label="Expected Delivery Date"
                        type="date"
                        fullWidth
                        defaultValue="2026-10-15"
                        InputLabelProps={{
                            shrink: true,
                        }}
                    />

                    <TextField
                        label="Reference"
                        fullWidth
                        placeholder="Enter reference number"
                    />

                    <TextField
                        label="Payment Terms"
                        select
                        fullWidth
                        defaultValue="Net 30"
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

                <Divider className="purchase-order-form-divider" />

                {/* Item Information */}
                <Typography className="purchase-order-form-section-title">
                    Item / Service Details
                </Typography>

                <Box className="purchase-order-form-grid">

                    <TextField
                        label="Item / Service"
                        fullWidth
                        placeholder="Enter item or service"
                        required
                    />

                    <TextField
                        label="Quantity"
                        type="number"
                        fullWidth
                        defaultValue="1"
                        inputProps={{
                            min: 1,
                        }}
                        required
                    />

                    <TextField
                        label="Rate"
                        type="number"
                        fullWidth
                        placeholder="0.00"
                        inputProps={{
                            min: 0,
                        }}
                        required
                    />

                    <TextField
                        label="Tax"
                        select
                        fullWidth
                        defaultValue="18%"
                    >
                        <MenuItem value="0%">
                            0%
                        </MenuItem>

                        <MenuItem value="5%">
                            5%
                        </MenuItem>

                        <MenuItem value="12%">
                            12%
                        </MenuItem>

                        <MenuItem value="18%">
                            18%
                        </MenuItem>

                        <MenuItem value="28%">
                            28%
                        </MenuItem>
                    </TextField>

                    <TextField
                        label="Discount"
                        type="number"
                        fullWidth
                        defaultValue="0"
                        inputProps={{
                            min: 0,
                        }}
                    />

                    <TextField
                        label="Unit"
                        select
                        fullWidth
                        defaultValue="Nos"
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

                        <MenuItem value="Box">
                            Box
                        </MenuItem>
                    </TextField>

                </Box>

                <Box className="purchase-order-description-field">
                    <TextField
                        label="Description"
                        multiline
                        rows={3}
                        fullWidth
                        placeholder="Enter item or service description"
                    />
                </Box>

                <Divider className="purchase-order-form-divider" />

                {/* Address */}
                <Typography className="purchase-order-form-section-title">
                    Billing & Shipping Address
                </Typography>

                <Box className="purchase-order-form-grid">

                    <TextField
                        label="Billing Address"
                        multiline
                        rows={3}
                        fullWidth
                    />

                    <TextField
                        label="Shipping Address"
                        multiline
                        rows={3}
                        fullWidth
                    />

                </Box>

                <Divider className="purchase-order-form-divider" />

                {/* Additional Information */}
                <Typography className="purchase-order-form-section-title">
                    Additional Information
                </Typography>

                <TextField
                    label="Notes"
                    multiline
                    rows={3}
                    fullWidth
                    placeholder="Add any additional notes"
                />

                <TextField
                    label="Terms & Conditions"
                    multiline
                    rows={3}
                    fullWidth
                    placeholder="Enter purchase order terms and conditions"
                    className="purchase-order-terms-field"
                />

                <Divider className="purchase-order-form-divider" />

                {/* Summary */}
                <Typography className="purchase-order-form-section-title">
                    Purchase Order Summary
                </Typography>

                <Box className="purchase-order-summary-box">

                    <Box className="purchase-order-summary-row">
                        <Typography>
                            Sub Total
                        </Typography>

                        <Typography>
                            ₹5,00,000
                        </Typography>
                    </Box>

                    <Box className="purchase-order-summary-row">
                        <Typography>
                            Discount
                        </Typography>

                        <Typography>
                            ₹0
                        </Typography>
                    </Box>

                    <Box className="purchase-order-summary-row">
                        <Typography>
                            Tax
                        </Typography>

                        <Typography>
                            ₹90,000
                        </Typography>
                    </Box>

                    <Divider />

                    <Box className="purchase-order-summary-total">
                        <Typography>
                            Total
                        </Typography>

                        <Typography>
                            ₹5,90,000
                        </Typography>
                    </Box>

                </Box>

            </Box>

            {/* Footer */}
            <Box className="purchase-order-form-footer">

                <Button
                    variant="outlined"
                    className="purchase-order-cancel-button"
                    onClick={onClose}
                >
                    Cancel
                </Button>

                <Button
                    type="submit"
                    variant="contained"
                    startIcon={<SaveRoundedIcon />}
                    className="purchase-order-save-button"
                >
                    Save Purchase Order
                </Button>

            </Box>
        </Box>
    );
};

export default PurchaseOrderForm;