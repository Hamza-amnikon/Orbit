import React from "react";
import {
    Box,
    Button,
    Card,
    CardContent,
    Divider,
    IconButton,
    TextField,
    Typography,
} from "@mui/material";

import CloseRoundedIcon from "@mui/icons-material/CloseRounded";

import "./InvoiceForm.css";

const InvoiceForm = ({ onClose }) => {
    const handleSubmit = (event) => {
        event.preventDefault();
    };

    return (
        <Box className="invoice-form-page">

            {/* Header */}
            <Box className="invoice-form-header">

                <Box>
                    <Typography className="invoice-form-title">
                        New Invoice
                    </Typography>

                    <Typography className="invoice-form-subtitle">
                        Create a new customer invoice
                    </Typography>
                </Box>

                <IconButton
                    className="invoice-form-close"
                    onClick={onClose}
                >
                    <CloseRoundedIcon />
                </IconButton>

            </Box>

            <form onSubmit={handleSubmit}>

                {/* Invoice Information */}
                <Card className="invoice-form-card">
                    <CardContent>

                        <Typography className="invoice-form-section-title">
                            Invoice Information
                        </Typography>

                        <Box className="invoice-form-grid">

                            <TextField
                                label="Customer"
                                select
                                SelectProps={{
                                    native: true,
                                }}
                                fullWidth
                                defaultValue=""
                            >
                                <option value="" disabled>
                                    Select Customer
                                </option>

                                <option value="abc">
                                    ABC Technologies
                                </option>

                                <option value="global">
                                    Global Solutions
                                </option>

                                <option value="technova">
                                    TechNova Pvt Ltd
                                </option>

                                <option value="bright">
                                    Bright Enterprises
                                </option>
                            </TextField>

                            <TextField
                                label="Invoice Number"
                                fullWidth
                                defaultValue="INV-005"
                            />

                            <TextField
                                label="Invoice Date"
                                type="date"
                                fullWidth
                                defaultValue="2026-10-05"
                                InputLabelProps={{
                                    shrink: true,
                                }}
                            />

                            <TextField
                                label="Due Date"
                                type="date"
                                fullWidth
                                defaultValue="2026-10-19"
                                InputLabelProps={{
                                    shrink: true,
                                }}
                            />

                            <TextField
                                label="Sales Order"
                                select
                                SelectProps={{
                                    native: true,
                                }}
                                fullWidth
                                defaultValue=""
                            >
                                <option value="">
                                    Select Sales Order
                                </option>

                                <option value="so001">
                                    SO-001
                                </option>

                                <option value="so002">
                                    SO-002
                                </option>

                                <option value="so003">
                                    SO-003
                                </option>

                                <option value="so004">
                                    SO-004
                                </option>
                            </TextField>

                            <TextField
                                label="Reference"
                                fullWidth
                                placeholder="Enter reference"
                            />

                        </Box>

                    </CardContent>
                </Card>

                {/* Invoice Details */}
                <Card className="invoice-form-card">
                    <CardContent>

                        <Typography className="invoice-form-section-title">
                            Invoice Details
                        </Typography>

                        <Box className="invoice-form-grid">

                            <TextField
                                label="Item / Service"
                                fullWidth
                                placeholder="Enter item or service"
                            />

                            <TextField
                                label="Description"
                                fullWidth
                                placeholder="Enter description"
                            />

                        </Box>

                    </CardContent>
                </Card>

                {/* Pricing */}
                <Card className="invoice-form-card">
                    <CardContent>

                        <Typography className="invoice-form-section-title">
                            Pricing
                        </Typography>

                        <Box className="invoice-form-grid">

                            <TextField
                                label="Quantity"
                                type="number"
                                fullWidth
                                defaultValue="1"
                            />

                            <TextField
                                label="Rate"
                                type="number"
                                fullWidth
                                placeholder="Enter rate"
                            />

                            <TextField
                                label="Discount"
                                type="number"
                                fullWidth
                                defaultValue="0"
                            />

                            <TextField
                                label="Tax"
                                select
                                SelectProps={{
                                    native: true,
                                }}
                                fullWidth
                                defaultValue="18"
                            >
                                <option value="0">
                                    0%
                                </option>

                                <option value="5">
                                    5%
                                </option>

                                <option value="12">
                                    12%
                                </option>

                                <option value="18">
                                    18%
                                </option>

                                <option value="28">
                                    28%
                                </option>
                            </TextField>

                        </Box>

                    </CardContent>
                </Card>

                {/* Billing Information */}
                <Card className="invoice-form-card">
                    <CardContent>

                        <Typography className="invoice-form-section-title">
                            Billing Information
                        </Typography>

                        <Box className="invoice-form-grid">

                            <TextField
                                label="Billing Address"
                                fullWidth
                                multiline
                                minRows={3}
                                placeholder="Enter billing address"
                            />

                            <TextField
                                label="Shipping Address"
                                fullWidth
                                multiline
                                minRows={3}
                                placeholder="Enter shipping address"
                            />

                        </Box>

                    </CardContent>
                </Card>

                {/* Additional Information */}
                <Card className="invoice-form-card">
                    <CardContent>

                        <Typography className="invoice-form-section-title">
                            Additional Information
                        </Typography>

                        <Box className="invoice-form-single-field">

                            <TextField
                                label="Notes"
                                fullWidth
                                multiline
                                minRows={3}
                                placeholder="Enter notes"
                            />

                            <TextField
                                label="Terms & Conditions"
                                fullWidth
                                multiline
                                minRows={3}
                                placeholder="Enter terms and conditions"
                            />

                        </Box>

                    </CardContent>
                </Card>

                {/* Invoice Summary */}
                <Card className="invoice-summary-form-card">
                    <CardContent>

                        <Typography className="invoice-form-section-title">
                            Invoice Summary
                        </Typography>

                        <Box className="invoice-form-summary">

                            <Box className="invoice-form-summary-row">
                                <Typography>
                                    Subtotal
                                </Typography>

                                <Typography>
                                    ₹75,000
                                </Typography>
                            </Box>

                            <Box className="invoice-form-summary-row">
                                <Typography>
                                    Discount
                                </Typography>

                                <Typography>
                                    ₹0
                                </Typography>
                            </Box>

                            <Box className="invoice-form-summary-row">
                                <Typography>
                                    Tax
                                </Typography>

                                <Typography>
                                    ₹13,500
                                </Typography>
                            </Box>

                            <Divider />

                            <Box className="invoice-form-grand-total">

                                <Typography>
                                    Grand Total
                                </Typography>

                                <Typography>
                                    ₹88,500
                                </Typography>

                            </Box>

                        </Box>

                    </CardContent>
                </Card>

                {/* Actions */}
                <Box className="invoice-form-actions">

                    <Button
                        type="button"
                        variant="outlined"
                        className="invoice-cancel-button"
                        onClick={onClose}
                    >
                        Cancel
                    </Button>

                    <Button
                        type="submit"
                        variant="contained"
                        className="invoice-save-button"
                    >
                        Save Invoice
                    </Button>

                </Box>

            </form>

        </Box>
    );
};

export default InvoiceForm;