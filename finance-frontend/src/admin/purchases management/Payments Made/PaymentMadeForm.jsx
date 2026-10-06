import React from "react";
import {
    Box,
    Button,
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    TextField,
    Typography,
} from "@mui/material";
import PaymentsRoundedIcon from "@mui/icons-material/PaymentsRounded";
import "./PaymentMadeForm.css";

const PaymentMadeForm = ({ onCancel }) => {
    const vendors = [
        "ABC Suppliers",
        "Global Office Solutions",
        "TechWorld Solutions",
        "Bright Office Supplies",
    ];

    const bills = [
        "BILL-001",
        "BILL-002",
        "BILL-003",
        "BILL-004",
    ];

    const handleSubmit = (event) => {
        event.preventDefault();
    };

    return (
        <Box className="payment-form-overlay">
            <Box
                component="form"
                className="payment-form-modal"
                onSubmit={handleSubmit}
            >
                {/* HEADER */}
                <Box className="payment-form-header">
                    <Box className="payment-form-header-icon">
                        <PaymentsRoundedIcon />
                    </Box>

                    <Box>
                        <Typography className="payment-form-title">
                            New Payment
                        </Typography>

                        <Typography className="payment-form-subtitle">
                            Record a payment made to a vendor
                        </Typography>
                    </Box>
                </Box>

                {/* PAYMENT INFORMATION */}
                <Box className="payment-form-section">
                    <Typography className="payment-section-title">
                        Payment Information
                    </Typography>

                    <Box className="payment-form-grid">

                        {/* Vendor */}
                        <FormControl fullWidth size="small">
                            <InputLabel>Vendor</InputLabel>
                            <Select
                                label="Vendor"
                                defaultValue=""
                            >
                                <MenuItem value="">
                                    Select Vendor
                                </MenuItem>

                                {vendors.map((vendor) => (
                                    <MenuItem
                                        key={vendor}
                                        value={vendor}
                                    >
                                        {vendor}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <TextField
                            label="Payment ID"
                            defaultValue="PAY-005"
                            size="small"
                            fullWidth
                        />

                        <TextField
                            label="Payment Date"
                            type="date"
                            defaultValue="2026-10-06"
                            size="small"
                            fullWidth
                            InputLabelProps={{
                                shrink: true,
                            }}
                        />

                        <TextField
                            label="Amount"
                            placeholder="Enter amount"
                            type="number"
                            size="small"
                            fullWidth
                        />

                        {/* Payment Method */}
                        <FormControl fullWidth size="small">
                            <InputLabel>Payment Method</InputLabel>
                            <Select
                                label="Payment Method"
                                defaultValue=""
                            >
                                <MenuItem value="">
                                    Select Method
                                </MenuItem>
                                <MenuItem value="Bank Transfer">
                                    Bank Transfer
                                </MenuItem>
                                <MenuItem value="Cash">
                                    Cash
                                </MenuItem>
                                <MenuItem value="Cheque">
                                    Cheque
                                </MenuItem>
                                <MenuItem value="UPI">
                                    UPI
                                </MenuItem>
                                <MenuItem value="Credit Card">
                                    Credit Card
                                </MenuItem>
                            </Select>
                        </FormControl>

                        <TextField
                            label="Reference Number"
                            placeholder="Enter reference number"
                            size="small"
                            fullWidth
                        />

                        {/* Bill Number */}
                        <FormControl fullWidth size="small">
                            <InputLabel>Bill Number</InputLabel>
                            <Select
                                label="Bill Number"
                                defaultValue=""
                            >
                                <MenuItem value="">
                                    Select Bill
                                </MenuItem>

                                {bills.map((bill) => (
                                    <MenuItem
                                        key={bill}
                                        value={bill}
                                    >
                                        {bill}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        {/* Status */}
                        <FormControl fullWidth size="small">
                            <InputLabel>Status</InputLabel>
                            <Select
                                label="Status"
                                defaultValue="Pending"
                            >
                                <MenuItem value="Pending">
                                    Pending
                                </MenuItem>

                                <MenuItem value="Paid">
                                    Paid
                                </MenuItem>

                                <MenuItem value="Cancelled">
                                    Cancelled
                                </MenuItem>
                            </Select>
                        </FormControl>

                    </Box>
                </Box>

                {/* PAYMENT DETAILS */}
                <Box className="payment-form-section">
                    <Typography className="payment-section-title">
                        Payment Details
                    </Typography>

                    <Box className="payment-form-grid">

                        <TextField
                            label="Bank Name"
                            placeholder="Enter bank name"
                            size="small"
                            fullWidth
                        />

                        <TextField
                            label="Transaction ID"
                            placeholder="Enter transaction ID"
                            size="small"
                            fullWidth
                        />

                        <TextField
                            label="Account Number"
                            placeholder="Enter account number"
                            size="small"
                            fullWidth
                        />

                        <TextField
                            label="Payment Terms"
                            placeholder="e.g. Net 30"
                            size="small"
                            fullWidth
                        />

                    </Box>
                </Box>

                {/* ADDITIONAL INFORMATION */}
                <Box className="payment-form-section">
                    <Typography className="payment-section-title">
                        Additional Information
                    </Typography>

                    <TextField
                        label="Notes"
                        placeholder="Enter payment notes"
                        multiline
                        rows={3}
                        fullWidth
                        size="small"
                    />
                </Box>

                {/* SUMMARY */}
                <Box className="payment-summary">
                    <Box>
                        <Typography className="payment-summary-label">
                            Payment Amount
                        </Typography>

                        <Typography className="payment-summary-label">
                            Payment Status
                        </Typography>
                    </Box>

                    <Box className="payment-summary-values">
                        <Typography>
                            ₹0
                        </Typography>

                        <Typography>
                            Pending
                        </Typography>
                    </Box>
                </Box>

                {/* FOOTER */}
                <Box className="payment-form-footer">

                    <Button
                        type="button"
                        variant="outlined"
                        className="payment-cancel-button"
                        onClick={onCancel}
                    >
                        Cancel
                    </Button>

                    <Button
                        type="submit"
                        variant="contained"
                        className="payment-save-button"
                    >
                        Save Payment
                    </Button>

                </Box>
            </Box>
        </Box>
    );
};

export default PaymentMadeForm;