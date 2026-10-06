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
import PaymentsRoundedIcon from "@mui/icons-material/PaymentsRounded";

import "./PaymentReceivedForm.css";

const PaymentReceivedForm = ({ onClose }) => {

    const handleSubmit = (event) => {
        event.preventDefault();
    };

    return (
        <Box
            component="form"
            className="payment-form"
            onSubmit={handleSubmit}
        >

            {/* Header */}
            <Box className="payment-form-header">

                <Box className="payment-form-header-left">

                    <PaymentsRoundedIcon className="payment-form-header-icon" />

                    <Box>
                        <Typography className="payment-form-title">
                            Record Payment
                        </Typography>

                        <Typography className="payment-form-subtitle">
                            Record a payment received from a customer
                        </Typography>
                    </Box>

                </Box>

                <IconButton
                    onClick={onClose}
                    className="payment-form-close-button"
                >
                    <CloseRoundedIcon />
                </IconButton>

            </Box>

            {/* Form Body */}
            <Box className="payment-form-body">

                {/* Payment Information */}
                <Typography className="payment-form-section-title">
                    Payment Information
                </Typography>

                <Box className="payment-form-grid">

                    <TextField
                        fullWidth
                        label="Payment Number"
                        defaultValue="PAY-005"
                        size="small"
                    />

                    <TextField
                        fullWidth
                        label="Payment Date"
                        type="date"
                        defaultValue="2026-10-06"
                        size="small"
                        InputLabelProps={{
                            shrink: true,
                        }}
                    />

                    <TextField
                        select
                        fullWidth
                        label="Customer"
                        defaultValue=""
                        size="small"
                    >
                        <MenuItem value="">
                            Select Customer
                        </MenuItem>

                        <MenuItem value="ABC Technologies">
                            ABC Technologies
                        </MenuItem>

                        <MenuItem value="Global Solutions">
                            Global Solutions
                        </MenuItem>

                        <MenuItem value="TechNova Pvt Ltd">
                            TechNova Pvt Ltd
                        </MenuItem>

                        <MenuItem value="Bright Enterprises">
                            Bright Enterprises
                        </MenuItem>
                    </TextField>

                    <TextField
                        select
                        fullWidth
                        label="Invoice"
                        defaultValue=""
                        size="small"
                    >
                        <MenuItem value="">
                            Select Invoice
                        </MenuItem>

                        <MenuItem value="INV-001">
                            INV-001
                        </MenuItem>

                        <MenuItem value="INV-002">
                            INV-002
                        </MenuItem>

                        <MenuItem value="INV-003">
                            INV-003
                        </MenuItem>

                        <MenuItem value="INV-004">
                            INV-004
                        </MenuItem>
                    </TextField>

                </Box>

                <Divider className="payment-form-divider" />

                {/* Payment Details */}
                <Typography className="payment-form-section-title">
                    Payment Details
                </Typography>

                <Box className="payment-form-grid">

                    <TextField
                        fullWidth
                        label="Amount Received"
                        type="number"
                        defaultValue="88500"
                        size="small"
                    />

                    <TextField
                        select
                        fullWidth
                        label="Payment Method"
                        defaultValue=""
                        size="small"
                    >
                        <MenuItem value="">
                            Select Method
                        </MenuItem>

                        <MenuItem value="Bank Transfer">
                            Bank Transfer
                        </MenuItem>

                        <MenuItem value="UPI">
                            UPI
                        </MenuItem>

                        <MenuItem value="Cash">
                            Cash
                        </MenuItem>

                        <MenuItem value="Cheque">
                            Cheque
                        </MenuItem>

                        <MenuItem value="Credit Card">
                            Credit Card
                        </MenuItem>

                        <MenuItem value="Debit Card">
                            Debit Card
                        </MenuItem>
                    </TextField>

                    <TextField
                        fullWidth
                        label="Reference Number"
                        placeholder="Enter transaction / cheque reference"
                        size="small"
                    />

                    <TextField
                        select
                        fullWidth
                        label="Deposit To"
                        defaultValue=""
                        size="small"
                    >
                        <MenuItem value="">
                            Select Account
                        </MenuItem>

                        <MenuItem value="HDFC Bank">
                            HDFC Bank
                        </MenuItem>

                        <MenuItem value="ICICI Bank">
                            ICICI Bank
                        </MenuItem>

                        <MenuItem value="Cash Account">
                            Cash Account
                        </MenuItem>
                    </TextField>

                </Box>

                <Divider className="payment-form-divider" />

                {/* Additional Information */}
                <Typography className="payment-form-section-title">
                    Additional Information
                </Typography>

                <TextField
                    fullWidth
                    label="Notes"
                    multiline
                    rows={3}
                    placeholder="Enter any additional notes"
                    size="small"
                />

                {/* Summary */}
                <Box className="payment-form-summary">

                    <Typography className="payment-form-summary-title">
                        Payment Summary
                    </Typography>

                    <Box className="payment-form-summary-row">

                        <Typography className="payment-form-summary-label">
                            Amount Received
                        </Typography>

                        <Typography className="payment-form-summary-value">
                            ₹88,500
                        </Typography>

                    </Box>

                </Box>

            </Box>

            {/* Footer */}
            <Box className="payment-form-footer">

                <Button
                    type="button"
                    onClick={onClose}
                    variant="outlined"
                    className="payment-form-cancel-button"
                >
                    Cancel
                </Button>

                <Button
                    type="submit"
                    variant="contained"
                    startIcon={<SaveRoundedIcon />}
                    className="payment-form-save-button"
                >
                    Save Payment
                </Button>

            </Box>

        </Box>
    );
};

export default PaymentReceivedForm;