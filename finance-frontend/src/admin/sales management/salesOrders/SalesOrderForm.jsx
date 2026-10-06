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

import "./SalesOrderForm.css";

const SalesOrderForm = ({ onClose }) => {

    const handleSubmit = (event) => {
        event.preventDefault();
    };

    return (
        <Box className="sales-order-form-page">

            <Box className="sales-order-form-container">

                <Card className="sales-order-form-card">

                    {/* Header */}
                    <Box className="sales-order-form-header">

                        <Box>
                            <Typography className="sales-order-form-title">
                                New Sales Order
                            </Typography>

                            <Typography className="sales-order-form-subtitle">
                                Create a sales order for your customer
                            </Typography>
                        </Box>

                        <Button
                            className="sales-order-close-button"
                            onClick={onClose}
                        >
                            <CloseRoundedIcon />
                        </Button>

                    </Box>


                    <CardContent>

                        <Box
                            component="form"
                            onSubmit={handleSubmit}
                            className="sales-order-form"
                        >

                            {/* Sales Order Information */}
                            <Box className="sales-order-form-section">

                                <Typography className="sales-order-section-title">
                                    Sales Order Information
                                </Typography>


                                <Box className="sales-order-form-row">

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
                                        label="Sales Order Number"
                                        defaultValue="SO-005"
                                        fullWidth
                                    />

                                </Box>


                                <Box className="sales-order-form-row">

                                    <TextField
                                        label="Order Date"
                                        type="date"
                                        defaultValue="2026-10-05"
                                        InputLabelProps={{
                                            shrink: true,
                                        }}
                                        required
                                        fullWidth
                                    />


                                    <TextField
                                        label="Expected Delivery Date"
                                        type="date"
                                        defaultValue="2026-11-05"
                                        InputLabelProps={{
                                            shrink: true,
                                        }}
                                        required
                                        fullWidth
                                    />

                                </Box>


                                <Box className="sales-order-form-row">

                                    <TextField
                                        select
                                        label="Estimate"
                                        defaultValue=""
                                        fullWidth
                                    >
                                        <MenuItem value="">
                                            Select Estimate
                                        </MenuItem>

                                        <MenuItem value="EST-001">
                                            EST-001 - Website Development
                                        </MenuItem>

                                        <MenuItem value="EST-002">
                                            EST-002 - Software Development
                                        </MenuItem>

                                        <MenuItem value="EST-003">
                                            EST-003 - IT Support Services
                                        </MenuItem>

                                        <MenuItem value="EST-004">
                                            EST-004 - Cloud Services
                                        </MenuItem>
                                    </TextField>


                                    <TextField
                                        label="Reference"
                                        placeholder="Enter reference"
                                        fullWidth
                                    />

                                </Box>

                            </Box>


                            {/* Order Details */}
                            <Box className="sales-order-form-section">

                                <Typography className="sales-order-section-title">
                                    Order Details
                                </Typography>


                                <TextField
                                    label="Item / Service"
                                    placeholder="Enter item or service"
                                    required
                                    fullWidth
                                />


                                <TextField
                                    label="Description"
                                    placeholder="Enter description of the item or service"
                                    multiline
                                    rows={4}
                                    fullWidth
                                />

                            </Box>


                            {/* Pricing */}
                            <Box className="sales-order-form-section">

                                <Typography className="sales-order-section-title">
                                    Pricing
                                </Typography>


                                <Box className="sales-order-form-row">

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


                                <Box className="sales-order-form-row">

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


                                    <TextField
                                        select
                                        label="Discount"
                                        defaultValue="0"
                                        fullWidth
                                    >
                                        <MenuItem value="0">
                                            No Discount
                                        </MenuItem>

                                        <MenuItem value="5">
                                            5%
                                        </MenuItem>

                                        <MenuItem value="10">
                                            10%
                                        </MenuItem>

                                        <MenuItem value="15">
                                            15%
                                        </MenuItem>
                                    </TextField>

                                </Box>

                            </Box>


                            {/* Shipping */}
                            <Box className="sales-order-form-section">

                                <Typography className="sales-order-section-title">
                                    Shipping Information
                                </Typography>


                                <Box className="sales-order-form-row">

                                    <TextField
                                        label="Shipping Address"
                                        placeholder="Enter shipping address"
                                        multiline
                                        rows={3}
                                        fullWidth
                                    />


                                    <TextField
                                        label="Billing Address"
                                        placeholder="Enter billing address"
                                        multiline
                                        rows={3}
                                        fullWidth
                                    />

                                </Box>

                            </Box>


                            {/* Additional Information */}
                            <Box className="sales-order-form-section">

                                <Typography className="sales-order-section-title">
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


                            {/* Summary */}
                            <Box className="sales-order-total-section">

                                <Box className="sales-order-total-row">

                                    <Typography>
                                        Subtotal
                                    </Typography>

                                    <Typography>
                                        ₹0.00
                                    </Typography>

                                </Box>


                                <Box className="sales-order-total-row">

                                    <Typography>
                                        Discount
                                    </Typography>

                                    <Typography>
                                        ₹0.00
                                    </Typography>

                                </Box>


                                <Box className="sales-order-total-row">

                                    <Typography>
                                        Tax
                                    </Typography>

                                    <Typography>
                                        ₹0.00
                                    </Typography>

                                </Box>


                                <Box className="sales-order-grand-total">

                                    <Typography className="sales-order-grand-total-label">
                                        Grand Total
                                    </Typography>

                                    <Typography className="sales-order-grand-total-value">
                                        ₹0.00
                                    </Typography>

                                </Box>

                            </Box>


                            {/* Actions */}
                            <Box className="sales-order-form-actions">

                                <Button
                                    variant="outlined"
                                    className="sales-order-cancel-button"
                                    onClick={onClose}
                                >
                                    Cancel
                                </Button>


                                <Button
                                    type="submit"
                                    variant="contained"
                                    startIcon={<SaveRoundedIcon />}
                                    className="save-sales-order-button"
                                >
                                    Save Sales Order
                                </Button>

                            </Box>

                        </Box>

                    </CardContent>

                </Card>

            </Box>

        </Box>
    );
};

export default SalesOrderForm;